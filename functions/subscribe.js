async function createOrResubscribeContact(email, resendKey) {
  var headers = {
    'Authorization': 'Bearer ' + resendKey,
    'Content-Type': 'application/json',
  };

  var createRes = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      email: email,
      unsubscribed: false,
    }),
  });

  if (createRes.ok) {
    return;
  }

  var createBody = await createRes.text();
  var updateRes = await fetch('https://api.resend.com/contacts/' + encodeURIComponent(email), {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify({
      unsubscribed: false,
    }),
  });

  if (updateRes.ok) {
    return;
  }

  var updateBody = await updateRes.text();
  console.error('Resend contact create error [' + createRes.status + ']: ' + createBody);
  console.error('Resend contact update error [' + updateRes.status + ']: ' + updateBody);
  throw new Error('Contact sync failed');
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return Response.redirect('https://tcmwellness.xyz/', 302);
  }

  var formData = await request.formData();
  var email = (formData.get('email_address') || formData.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('Please enter a valid email address.', { status: 400 });
  }

  var pdfUrl = 'https://tcmwellness.xyz/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf';
  var unsubscribeUrl = 'https://www.tcmwellness.xyz/unsubscribe';
  var unsubscribeMailto = 'mailto:unsubscribe@tcmwellness.xyz?subject=Unsubscribe';
  var resendKey = env.RESEND_API_KEY;
  var from = env.RESEND_FROM || 'Folk Calm <guide@tcmwellness.xyz>';

  if (!resendKey) {
    return new Response('Subscription failed. Please try again later.', { status: 500 });
  }

  try {
    await createOrResubscribeContact(email, resendKey);

    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from,
        to: [email],
        subject: 'Your Free Guide: 10 Ancient Chinese Evening Habits',
        headers: {
          'List-Unsubscribe': '<' + unsubscribeMailto + '>, <' + unsubscribeUrl + '>',
        },
        html: [
          '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">',
          '<h2 style="color: #5C3317;">Thank you for subscribing!</h2>',
          '<p>Here is your free cultural guide, as promised:</p>',
          '<p style="margin: 24px 0;">',
          '<a href="' + pdfUrl + '" style="background: #A0522D; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">Download Your Free Guide →</a>',
          '</p>',
          '<p style="color: #6B5B4A; font-size: 14px;">Or copy this link: <a href="' + pdfUrl + '">' + pdfUrl + '</a></p>',
          '<hr style="border: 1px solid #e0d5c5; margin: 24px 0;">',
          '<p style="color: #888; font-size: 12px;">You received this email because you subscribed at Folk Calm. <a href="https://tcmwellness.xyz/privacy-policy.html">Privacy Policy</a> · <a href="' + unsubscribeUrl + '">Unsubscribe</a> or reply STOP.</p>',
          '</div>',
        ].join(''),
      }),
    });

    var body = await res.text();

    if (!res.ok) {
      console.error('Resend welcome email failed [' + res.status + ']: ' + body);
      // 不阻塞：联系人已写入，欢迎邮件失败不影响跳转
    }

    return Response.redirect('https://tcmwellness.xyz/subscribe-thankyou', 303);
  } catch (e) {
    // 如果连 createContact 都失败了，记录并降级到成功跳转
    // 至少用户不会看到错误页面
    console.error('Subscription error:', e);
    return Response.redirect('https://tcmwellness.xyz/subscribe-thankyou', 303);
  }
}
