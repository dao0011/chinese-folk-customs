export async function onRequestPost({ request, env }) {
  return new Response('SUB FUNCTION IS WORKING. ENV KEY: ' + (env.RESEND_API_KEY ? 'set' : 'MISSING'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
