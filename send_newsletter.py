#!/usr/bin/env python3
"""向所有有效订阅者群发 PDF 邮件"""
import csv, os, requests, sys, time

API_KEY = os.environ.get("RESEND_API_KEY")
if not API_KEY:
    print("错误：请设置 RESEND_API_KEY 环境变量")
    print("  Windows: set RESEND_API_KEY=re_xxxxx && python send_newsletter.py")
    print("  Git Bash: RESEND_API_KEY=re_xxxxx python send_newsletter.py")
    sys.exit(1)

FROM = "Folk Calm <guide@folkcalm.com>"
PDF_URL = "https://www.folkcalm.com/pdfs/Quiet-Rules-of-the-Chinese-Table-Guide.pdf?v=3"
UNSUBSCRIBE_URL = "https://www.folkcalm.com/unsubscribe"
UNSUBSCRIBE_MAILTO = "mailto:unsubscribe@folkcalm.com?subject=Unsubscribe"
SEND_URL = "https://api.resend.com/emails"

import os as _os
_BASE_DIR = _os.path.dirname(_os.path.abspath(__file__))
SUBSCRIBER_CSV = _os.path.join(_BASE_DIR, "resend-audit", "final-send-list.csv")
RETRY_CSV = _os.path.join(_BASE_DIR, "resend-audit", "retry-send-list.csv")

HTML = r"""<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FDF8F0;">

  <h2 style="color: #5C3317; font-size: 22px; margin-bottom: 8px;">
    The Quiet Rules of the Chinese Table
  </h2>
  <p style="color: #A0522D; font-size: 13px; margin-top: 0; font-style: italic;">
    Subscriber Archive &middot; Guide No. 3 &mdash; June 18, 2026
  </p>

  <hr style="border: none; border-top: 1px solid #d4c5b5; margin: 20px 0;">

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    Hello,
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    Today is Duanwu Jie &mdash; the Dragon Boat Festival.
    Wherever you are, I hope there's a zongzi nearby and someone you care about
    within reach. <b>端午安康</b> &mdash; may you stay safe and well this summer.
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    Thursday again &mdash; time for this week's archive.
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    This one is about something so ordinary you might not think it's worth writing down:
    the unspoken rules that children in traditional Chinese households absorb just by sitting
    at the dinner table for a thousand meals.
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    Our third guide &mdash; <b><i>The Quiet Rules of the Chinese Table</i></b> &mdash;
    collects ten of these silent habits. Elders lift their chopsticks first. You hold your
    rice bowl in your hand, don't leave your chopsticks standing upright in the rice,
    take from the side of the dish nearest you, don't rummage through a shared plate,
    pour tea for others before yourself, and never waste a single grain.
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    Nobody ever taught these as "lessons." They weren't written on a blackboard or recited
    from a book. A child just watches, imitates, gets gently corrected by a grandmother
    once or twice, and by the time they're old enough to notice, the rules are already in
    their bones. That quiet transmission &mdash; from body to body across a shared meal &mdash;
    is the thing I wanted to capture.
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    I started writing these down because it struck me how easily the ordinary disappears.
    Habits that held a household together for generations can vanish in one &mdash; the
    last grandmother gone, the last kitchen quiet. This series is my way of saying:
    <i>these things happened. They mattered.</i>
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="%s" style="background: #A0522D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 15px; display: inline-block;">
      Open the PDF &rarr;
    </a>
  </div>

  <p style="color: #888; font-size: 12px; text-align: center;">
    Or copy this link into your browser:<br>
    <a href="%s" style="color: #A0522D;">%s</a>
  </p>

  <hr style="border: none; border-top: 1px solid #d4c5b5; margin: 24px 0;">

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    I'm still deciding on next week's archive &mdash; perhaps something for the summer
    season, or one about the soapberry pods my grandmother kept by the kitchen sink.
    I'll let you know when it's ready.
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    One small housekeeping note: this week we moved the site from
    <b>tcmwellness.xyz</b> to <b>folkcalm.com</b>. Same Folk Calm, same content &mdash;
    just a simpler address that's easier to remember. If you bookmarked the old one,
    it'll redirect automatically, so no need to do anything.
  </p>

  <p style="color: #4A3728; font-size: 14px; line-height: 1.8;">
    Thank you for still being here. Knowing someone is reading these makes the
    quiet work of remembering feel a little less alone.
  </p>

  <p style="color: #888; font-size: 12px; text-align: right; margin-top: 24px;">
    &mdash; Folk Calm<br>
    <span style="font-style: italic;">Quietly documenting Chinese family culture</span>
  </p>

  <hr style="border: none; border-top: 1px solid #e0d5c5; margin: 24px 0;">

  <p style="color: #aaa; font-size: 11px; text-align: center;">
    You received this email because you subscribed to Folk Calm at folkcalm.com.<br>
    1 archive edition every Thursday. No more than that.<br>
    <a href="%s" style="color: #A0522D;">Privacy Policy</a> &middot;
    <a href="%s" style="color: #A0522D;">Unsubscribe</a> |
    Or simply reply to this email and ask to be removed.
  </p>
</div>""" % (PDF_URL, PDF_URL, PDF_URL, "https://folkcalm.com/privacy-policy.html", UNSUBSCRIBE_URL)

SUBJECT = "The Quiet Rules of the Chinese Table &mdash; 10 unspoken table habits from a Chinese childhood"

def load_subscribers(path):
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return [r['email'] for r in reader]

def send_one(email):
    payload = {
        "from": FROM,
        "to": [email],
        "subject": SUBJECT,
        "headers": {
            "List-Unsubscribe": f"<{UNSUBSCRIBE_MAILTO}>, <{UNSUBSCRIBE_URL}>",
        },
        "html": HTML,
    }
    try:
        r = requests.post(SEND_URL,
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json=payload, timeout=30)
        if r.ok:
            return True, r.json().get("id", "ok")
        else:
            return False, f"{r.status_code} {r.text[:200]}"
    except Exception as e:
        return False, str(e)

if __name__ == "__main__":
    is_retry = len(sys.argv) >= 2 and sys.argv[1] == "--retry"
    is_send = len(sys.argv) >= 2 and (sys.argv[1] == "--send" or is_retry)

    csv_path = RETRY_CSV if is_retry else SUBSCRIBER_CSV
    subscribers = load_subscribers(csv_path)
    mode = "补发" if is_retry else "群发"
    print(f"{mode}模式: {len(subscribers)} 个收件人")
    print(f"邮件标题: {SUBJECT}")
    print(f"---")

    if not is_send:
        print(f"\n预览模式 — 将发送给前2个示例用户:")
        for email in subscribers[:2]:
            print(f"  TO: {email}")
        print(f"\n发送: python send_newsletter.py --send")
        print(f"补发: python send_newsletter.py --retry")
        sys.exit(0)

    ok = fail = 0
    failed_list = []
    for i, email in enumerate(subscribers):
        success, info = send_one(email)
        if success:
            ok += 1
            print(f"[{i+1}/{len(subscribers)}] OK   {email}  id={info}")
        else:
            fail += 1
            failed_list.append((email, info))
            print(f"[{i+1}/{len(subscribers)}] FAIL {email}  {info}")
            if "daily_quota_exceeded" in info or "429" in info:
                remaining = subscribers[i+1:]
                print(f"\n日配额已满，已发 {ok} 封，剩余 {len(remaining)} 封")
                with open(RETRY_CSV, 'w', newline='', encoding='utf-8') as rf:
                    w = csv.writer(rf)
                    w.writerow(['email'])
                    for e in remaining:
                        w.writerow([e])
                print(f"剩余列表: {RETRY_CSV}")
                break
        time.sleep(0.6)

    print(f"\n发送完成: {ok} 成功, {fail} 失败")
    if failed_list:
        print("失败列表:")
        for email, reason in failed_list:
            print(f"  {email}: {reason}")
