import { callResend } from './_lib/resend.js';
import {
  hasFilledHoneypot,
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
  try {
    var createRes = await callResend(resendKey, '/contacts', 'POST', {
      email: email,
      unsubscribed: false,
    });

    if (createRes.ok) {
      return { created: true };
    }

    var createBody = await createRes.text();
    var createStatus = createRes.status;

    // 联系人已存在（409 Conflict）—— 尝试恢复订阅，失败可降级
    if (createStatus === 409 || createStatus === 422) {
      try {
        var updateRes = await callResend(resendKey, '/contacts/' + encodeURIComponent(email), 'PATCH', {
          unsubscribed: false,
        });

        if (updateRes.ok) {
          return { created: false, resubscribed: true };
        }

        var updateBody = await updateRes.text();
        console.error('Resend contact update error [' + updateRes.status + ']: ' + updateBody);
        // 联系人已存在，PATCH 失败可降级——仍然发邮件
        return { created: false, resubscribed: false, patchFailed: true };
      } catch (e) {
        console.error('Resend contact update network error:', e);
        // 网络错误但联系人大概率已存在——降级继续
        return { created: false, resubscribed: false, patchFailed: true };
      }
    }

    // 非 409 错误（5xx 等）——真正的服务端故障
    console.error('Resend contact create error [' + createStatus + ']: ' + createBody);
    throw new Error('Contact create failed: ' + createStatus);
  } catch (e) {
    // fetch 本身的网络错误
    if (e.message && e.message.startsWith('Contact create failed:')) {
      throw e; // 服务端错误，向上抛
    }
    console.error('Resend contact create network error:', e);
    throw new Error('Contact API unreachable');
  }
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return methodNotAllowed('POST');
  }

  if (!isSameOriginRequest(request)) {
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

  // Bots commonly fill fields hidden from people. Return the ordinary success
  // redirect without touching Resend, so the trap does not advertise itself.
  if (hasFilledHoneypot(formData)) {
    return secureRedirect(THANK_YOU_URL, 303);
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
    return secureResponse('Subscription failed. Please try again later.', { status: 500 });
  }

  try {
    // 第一步：创建或恢复联系人（失败不降级，直接报错）
    await createOrResubscribeContact(email, resendKey);
  } catch (e) {
    console.error('Contact sync failed:', e);
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

    var body = await res.text();

    if (!res.ok) {
      console.error('Resend welcome email failed [' + res.status + ']: ' + body);
      // 联系人已入库，邮件失败可降级到感谢页
    }

    return secureRedirect(THANK_YOU_URL, 303);
  } catch (e) {
    // 网络错误或 API 不可达 — 联系人可能已入库，降级到感谢页
    console.error('Email send error:', e);
    return secureRedirect(THANK_YOU_URL, 303);
  }
}
