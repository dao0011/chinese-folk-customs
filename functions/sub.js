export async function onRequest({ request, env }) {
  if (request.method === 'POST') {
    return new Response('SUB POST WORKS. ENV KEY: ' + (env.RESEND_API_KEY ? 'SET' : 'MISSING'), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return new Response('SUB GET WORKS', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
