export async function onRequestPost() {
  return new Response('POST to /test-post works! Function is reachable.', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
