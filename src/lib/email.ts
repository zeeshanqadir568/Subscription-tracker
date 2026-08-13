import nodemailer from "nodemailer";

const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "Subscription Tracker";

function getTransport() {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: appPassword },
  });
}

function resetPasswordHtml(resetUrl: string): string {
  return `
<div style="background:#f9f9f7;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:440px;margin:0 auto;background:#fcfcfb;border-radius:16px;overflow:hidden;border:1px solid rgba(11,11,11,0.08);">
    <div style="background:linear-gradient(135deg,#2a78d6,#6c5ce7,#e87ba4);padding:28px 32px;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.18);color:#fff;font-size:20px;">💳</span>
      <p style="margin:12px 0 0;color:#fff;font-size:18px;font-weight:700;">Subscription Tracker</p>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 12px;font-size:20px;color:#0b0b0b;">Reset your password</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52514e;">
        We got a request to reset the password on your account. This link expires in 1 hour and can only be used once.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#2a78d6;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
        Reset password
      </a>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#8b8a85;">
        Didn't request this? You can safely ignore this email — your password won't change.
      </p>
    </div>
  </div>
</div>`.trim();
}

/**
 * Sends the password-reset link via Gmail SMTP. Silently no-ops (logging
 * instead) when GMAIL_USER/GMAIL_APP_PASSWORD aren't configured, so local
 * dev setups without email credentials don't hard-fail — the route layer
 * still returns a generic success response either way, to avoid leaking
 * account existence.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn(
      `Gmail credentials not set — skipping email. Reset link for ${to}: ${resetUrl}`,
    );
    return;
  }

  await transport.sendMail({
    from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset your Subscription Tracker password",
    html: resetPasswordHtml(resetUrl),
  });
}
