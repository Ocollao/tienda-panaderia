// v0.4: base de la API segun donde corre el frontend.
// - Dev (ng serve :4200): Flask directo en 127.0.0.1:5000
// - Docker/prod (nginx :8080): mismo origen con /api (proxy al backend)
export function apiBase(): string {
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    const p = window.location.port;
    // En compose el front va en :8080 y el back se proxea -> relativo
    if (p === '8080' || p === '80' || h !== 'localhost' && h !== '127.0.0.1') {
      return '/api';
    }
  }
  return 'http://127.0.0.1:5000/api';
}

export function uploadsBase(): string {
  if (typeof window !== 'undefined') {
    const p = window.location.port;
    const h = window.location.hostname;
    if (p === '8080' || p === '80' || h !== 'localhost' && h !== '127.0.0.1') {
      return '';
    }
  }
  return 'http://127.0.0.1:5000';
}
