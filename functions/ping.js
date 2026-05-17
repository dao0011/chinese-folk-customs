export async function onRequest() {
  return new Response('PONG — Functions are working!', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
