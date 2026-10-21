import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Teste de carga para observar o HPA escalar.
//
// Uso:
//   k6 run k6/stress-test.js                                    # localhost:8080
//   k6 run -e BASE_URL=http://<alb>.amazonaws.com k6/stress-test.js
//   k6 run -e VUS=100 -e DURATION=5m k6/stress-test.js          # mais agressivo
//
// Por que /api/auth/login: ele executa scrypt, que é propositalmente caro em
// CPU. Bater em /api/health não moveria o ponteiro — o HPA escala por CPU, e
// um health check custa quase nada.

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const VUS = Number(__ENV.VUS || 30);
const DURATION = __ENV.DURATION || '2m';

const falhas = new Rate('falhas');

export const options = {
  stages: [
    { duration: '30s', target: VUS },  // sobe a carga
    { duration: DURATION, target: VUS }, // sustenta — é aqui que o HPA reage
    { duration: '30s', target: 0 },    // desce (o scale-down leva ~5 min)
  ],
  thresholds: {
    // Sob carga proposital, alguma lentidão é esperada; erro não é.
    falhas: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'ana.santos@oficina.com', password: 'Tech@123' }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '30s' },
  );

  const ok = check(res, {
    // 201 e não 200: POST no NestJS devolve Created por padrão.
    'status 201': (r) => r.status === 201,
    'devolveu token': (r) => String(r.body).includes('access_token'),
  });
  falhas.add(!ok);

  sleep(0.5);
}
