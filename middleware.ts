// Vercel Routing Middleware: HTTP Basic Auth in front of every route, including /api/*.
export const config = { runtime: 'nodejs' };

export default function middleware(request: Request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !pass) {
    return new Response('Auth not configured', { status: 500 });
  }

  const [scheme, encoded] = (request.headers.get('authorization') || '').split(' ');

  if (scheme === 'Basic' && encoded) {
    let decoded = '';

    try {
      decoded = atob(encoded);
    } catch {
      // malformed base64 falls through to the 401 below
    }

    const i = decoded.indexOf(':');

    if (i !== -1 && decoded.slice(0, i) === user && decoded.slice(i + 1) === pass) {
      return new Response(null, { headers: { 'x-middleware-next': '1' } });
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="bolt"' },
  });
}
