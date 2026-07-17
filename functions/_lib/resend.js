// Shared Resend API helper.
// The _lib/ prefix means this directory is NOT exposed as a route
// (Cloudflare Pages convention: underscore-prefixed paths are private).
//
// Usage:
//   import { callResend } from './_lib/resend.js';
//   const resp = await callResend(apiKey, '/emails', 'POST', { from, to, subject, html });

const RESEND_BASE = 'https://api.resend.com';

export async function callResend(apiKey, path, method, body) {
  const headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
  };
  const init = { method, headers };
  if (body !== undefined && body !== null) {
    init.body = JSON.stringify(body);
  }
  const url = path.startsWith('http') ? path : RESEND_BASE + path;
  return fetch(url, init);
}
