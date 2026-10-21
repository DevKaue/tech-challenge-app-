const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const nycOutputDir = path.join(rootDir, '.nyc_output');
const combinedDir = path.join(rootDir, 'combined-coverage');

// 1. Clean and create directories
if (fs.existsSync(nycOutputDir)) {
  fs.rmSync(nycOutputDir, { recursive: true, force: true });
}
fs.mkdirSync(nycOutputDir, { recursive: true });

// CORREÇÃO: Em vez de apagar a pasta combinada (que pode ser um volume montado e causar EBUSY),
// esvaziamos o conteúdo dela se ela já existir, ou criamos se não existir.
if (fs.existsSync(combinedDir)) {
  try {
    const files = fs.readdirSync(combinedDir);
    for (const file of files) {
      fs.rmSync(path.join(combinedDir, file), { recursive: true, force: true });
    }
  } catch (err) {
    console.log(`[merge-coverage] Warning: Could not empty ${combinedDir}, trying to proceed...`);
  }
} else {
  fs.mkdirSync(combinedDir, { recursive: true });
}


// 2. Define source files
const sources = [
  { src: path.join(rootDir, 'coverage', 'coverage-final.json'), dest: 'unit.json' },
  { src: path.join(rootDir, 'coverage-integration', 'coverage-final.json'), dest: 'integration.json' },
  { src: path.join(rootDir, 'coverage-e2e', 'coverage-final.json'), dest: 'e2e.json' }
];

// 3. Copy files if they exist
let copiedCount = 0;
for (const source of sources) {
  if (fs.existsSync(source.src)) {
    fs.copyFileSync(source.src, path.join(nycOutputDir, source.dest));
    copiedCount++;
  } else {
    console.log(`[merge-coverage] Warning: Coverage file not found for: ${source.src}`);
  }
}

if (copiedCount === 0) {
  console.error('[merge-coverage] Error: No coverage files found to merge!');
  process.exit(1);
}

console.log(`[merge-coverage] Merging ${copiedCount} coverage files...`);

try {
  // 4. Converte e consolida os relatórios finais em um arquivo bruto que o nyc entende
  const mergedRawJson = path.join(nycOutputDir, 'out.json');
  console.log('[merge-coverage] Executing nyc merge...');
  execSync(`npx --yes nyc merge ${nycOutputDir} ${mergedRawJson}`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  // 5. Run nyc report to merge and generate HTML, text and lcov reports
  console.log('[merge-coverage] Generating coverage reports...');
  execSync('npx --yes nyc report --reporter=html --reporter=text --reporter=lcov --temp-dir=.nyc_output --report-dir=coverage', {
    cwd: rootDir,
    stdio: 'inherit'
  });

  console.log('[merge-coverage] Merged coverage report generated successfully under coverage/lcov-report/index.html');

  // Generate combined-coverage/lcov.info with adjusted paths for SonarQube
  const mergedLcovPath = path.join(rootDir, 'coverage', 'lcov.info');
  const combinedLcovPath = path.join(combinedDir, 'lcov.info');


  if (fs.existsSync(mergedLcovPath)) {
    console.log('[merge-coverage] Generating combined-coverage/lcov.info with adjusted paths for SonarQube...');
    if (!fs.existsSync(combinedDir)) {
      fs.mkdirSync(combinedDir, { recursive: true });
    }
    let lcovContent = fs.readFileSync(mergedLcovPath, 'utf8');
    // Normalize absolute file system paths to project-relative paths for SonarQube
    lcovContent = lcovContent.replace(/^SF:.*\/src\//gm, 'SF:src/');
    fs.writeFileSync(combinedLcovPath, lcovContent, 'utf8');
    console.log('[merge-coverage] Combined coverage ready at combined-coverage/lcov.info');
  }
} catch (error) {
  console.error('[merge-coverage] Error running nyc report or path replacement:', error.message);
  process.exit(1);
}

// 6. Fix ownership and permissions for all generated coverage directories
const dirsToFix = [
  path.join(rootDir, 'coverage'),
  path.join(rootDir, 'coverage-integration'),
  path.join(rootDir, 'coverage-e2e'),
  path.join(rootDir, 'combined-coverage'),
  nycOutputDir
];

let hostUid = process.getuid ? process.getuid() : 0;
let hostGid = process.getgid ? process.getgid() : 0;

// Find a bind-mounted file or directory to detect the host user's UID/GID
const refPaths = [
  path.join(rootDir, 'package.json'),
  path.join(rootDir, 'src'),
  path.join(rootDir, 'scripts'),
  rootDir
];

for (const refPath of refPaths) {
  try {
    if (fs.existsSync(refPath)) {
      const stats = fs.statSync(refPath);
      // Find the first path not owned by root (0)
      if (stats.uid !== 0) {
        hostUid = stats.uid;
        hostGid = stats.gid;
        break;
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

function chownAndChmodRecursive(itemPath, uid, gid) {
  if (!fs.existsSync(itemPath)) return;
  try {
    const stats = fs.statSync(itemPath);
    // Change ownership to host user if possible
    try {
      fs.chownSync(itemPath, uid, gid);
    } catch (e) {
      // Ignore if chown is not permitted in this environment
    }
    
    // Change permissions to ensure readability/writability
    if (stats.isDirectory()) {
      try {
        fs.chmodSync(itemPath, 0o755); // rwxr-xr-x
      } catch (e) {}
      const files = fs.readdirSync(itemPath);
      for (const file of files) {
        chownAndChmodRecursive(path.join(itemPath, file), uid, gid);
      }
    } else {
      try {
        fs.chmodSync(itemPath, 0o644); // rw-r--r--
      } catch (e) {}
    }
  } catch (error) {
    // Suppress general errors
  }
}

console.log('[merge-coverage] Adjusting folder permissions and ownership for local machine...');
for (const dir of dirsToFix) {
  chownAndChmodRecursive(dir, hostUid, hostGid);
}
console.log('[merge-coverage] Permissions and ownership adjusted successfully.');