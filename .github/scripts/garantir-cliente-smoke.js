// Garante o cliente sintético que o smoke da Lambda de autenticação usa como
// "cliente ativo". Roda dentro do pod da API (que já tem DATABASE_URL e o
// driver pg), lido pelo stdin: kubectl exec -i ... -- node - "$CPF" < este-arquivo
// Idempotente: ON CONFLICT DO NOTHING.
const { Client } = require("pg");

const cpf = process.argv[2];
if (!/^\d{11}$/.test(cpf || "")) {
  console.error("erro: informe o CPF com 11 dígitos, sem pontuação");
  process.exit(1);
}

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r = await c.query(
    "INSERT INTO customers (id, document, document_type, name, status, updated_at) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, now()) ON CONFLICT (document, document_type) DO NOTHING",
    [cpf, "CPF", "Cliente Smoke (sintético)", "ACTIVE"]);
  console.log("linhas inseridas:", r.rowCount);
  await c.end();
})().catch(e => { console.error("erro:", e.name); process.exit(1); });
