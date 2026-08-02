import { callResend } from './_lib/resend.js';
import {
  isOversizedForm,
  isSameOriginRequest,
  isSupportedFormContentType,
  methodNotAllowed,
  secureRedirect,
  secureResponse,
} from './_lib/http.js';

const MAX_FORM_BYTES = 16 * 1024;
const THANK_YOU_URL = 'https://www.folkcalm.com/subscribe-thankyou';

async function createOrResubscribeContact(email, resendKey) {
  var createRes;

  try {
    createRes = await callResend(resendKey, '/contacts', 'POST', {
      email: email,
      unsubscribed: false,
    });
  } catch (e) {
    console.error('Resend contact create network error');
    throw new Error('Contact API unreachable');
  }

  if (createRes.ok) {
    console.info('Subscription contact sync: created');
    return { created: true };
  }

  var createStatus = createRes.status;

  // Only a real conflict means the address already exists. Validation errors
  // such as 422 must not be treated as a successful subscription.
  if (createStatus !== 409) {
    console.error('Resend contact create failed with status ' + createStatus);
    throw new Error('Contact create failed: ' + createStatus);
  }

  var updateRes;

  try {
    updateRes = await callResend(resendKey, '/contacts/' + encodeURIComponent(email), 'PATCH', {
      unsubscribed: false,
    });
  } catch (e) {
    console.error('Resend contact update network error');
    throw new Error('Contact update API unreachable');
  }

  if (!updateRes.ok) {
    console.error('Resend contact update failed with status ' + updateRes.status);
    throw new Error('Contact update failed: ' + updateRes.status);
  }

  console.info('Subscription contact sync: resubscribed');
  return { created: false, resubscribed: true };
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return methodNotAllowed('POST');
  }

  if (!isSameOriginRequest(request)) {
    console.warn('Subscription rejected: unverified request source');
    return secureResponse('Forbidden', { status: 403 });
  }

  if (isOversizedForm(request, MAX_FORM_BYTES)) {
    return secureResponse('Request is too large.', { status: 413 });
  }

  if (!isSupportedFormContentType(request)) {
    return secureResponse('Unsupported form encoding.', { status: 415 });
  }

  var formData;
  try {
    formData = await request.formData();
  } catch (e) {
    return secureResponse('Invalid form submission.', { status: 400 });
  }

  var email = String(formData.get('email_address') || formData.get('email') || '').trim();

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return secureResponse('Please enter a valid email address.', { status: 400 });
  }

  var pdfUrl = 'https://www.folkcalm.com/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf?v=1';
  var unsubscribeUrl = 'https://www.folkcalm.com/unsubscribe';
  var unsubscribeMailto = 'mailto:unsubscribe@folkcalm.com?subject=Unsubscribe';
  var resendKey = env.RESEND_API_KEY;
  var from = env.RESEND_FROM || 'Folk Calm <guide@folkcalm.com>';

  if (!resendKey) {
    console.error('Subscription failed: RESEND_API_KEY is not configured');
    return secureResponse('Subscription failed. Please try again later.', { status: 500 });
  }

  try {
    // 第一步：创建或恢复联系人（失败不降级，直接报错）
    await createOrResubscribeContact(email, resendKey);
  } catch (e) {
    console.error('Subscription contact sync failed:', e.message || 'unknown error');
    return secureResponse('Subscription failed. Please try again later.', { status: 500 });
  }

  try {
    // 第二步：发欢迎邮件（失败可降级，联系人已入库）
    var res = await callResend(resendKey, '/emails', 'POST', {
      from: from,
      to: [email],
      subject: 'Your Free Guide: 10 Ancient Chinese Evening Habits',
      headers: {
        'List-Unsubscribe': '<' + unsubscribeMailto + '>, <' + unsubscribeUrl + '>',
      },
      html: [
        '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">',
        '<h2 style="color: #5C3317;">Your subscriber guide is ready.</h2>',
        '<p>This guide walks through ten traditional Chinese evening routines — foot soaks, kitchen sips, quiet wind-down habits — each recorded as a small domestic custom passed through generations.</p>',
        '<p style="margin: 24px 0;">',
        '<a href="' + pdfUrl + '" style="background: #A0522D; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">Download Your Free Guide →</a>',
        '</p>',
        '<p style="color: #6B5B4A; font-size: 14px;">Or copy this link: <a href="' + pdfUrl + '">' + pdfUrl + '</a></p>',
        '<hr style="border: 1px solid #e0d5c5; margin: 24px 0;">',
        '<p style="color: #888; font-size: 12px;">You received this email because you subscribed at Folk Calm. <a href="https://www.folkcalm.com/privacy-policy.html">Privacy Policy</a> · <a href="' + unsubscribeUrl + '">Unsubscribe</a> or reply STOP.</p>',
        '</div>',
      ].join(''),
    });

    if (!res.ok) {
      console.error('Resend welcome email failed with status ' + res.status);
      // 联系人已入库，邮件失败可降级到感谢页
    } else {
      console.info('Subscription welcome email accepted');
    }

    return secureRedirect(THANK_YOU_URL, 303);
  } catch (e) {
    // 网络错误或 API 不可达 — 联系人可能已入库，降级到感谢页
    console.error('Email send error:', e);
    return secureRedirect(THANK_YOU_URL, 303);
  }
}
