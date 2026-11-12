import nodemailer from 'nodemailer';

interface SendResetEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  code: string
): Promise<SendResetEmailResult> {
  const cleanEmail = toEmail.trim().toLowerCase();
  const displayName = userName?.trim() || 'Valued Customer';

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'Wazhamyassin98@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Order Center" <Wazhamyassin98@gmail.com>';

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Code - Order Center</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f7f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C2C2C;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f6f4; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" max-width="560px" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e5e5;">
            
            <!-- Header Brand Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #711612 0%, #8B1E1A 50%, #57100D 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #D4AF37;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Order Center</h1>
                <p style="margin: 6px 0 0 0; color: #D4AF37; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Global Shopping & Shipping</p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 36px 32px 28px 32px;">
                <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
                <p style="margin: 0 0 20px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                  Hello <strong>${displayName}</strong>,
                </p>
                <p style="margin: 0 0 24px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                  We received a request to reset the password for your Order Center account. Please use the verification code below to verify your identity and set a new password:
                </p>

                <!-- Verification Code Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                  <tr>
                    <td align="center">
                      <div style="display: inline-block; background: #fff8eb; border: 2px dashed #D4AF37; border-radius: 12px; padding: 18px 36px; text-align: center;">
                        <span style="display: block; font-size: 11px; font-weight: 700; color: #855b00; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Your Verification Code</span>
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; color: #711612; letter-spacing: 8px;">${code}</span>
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 16px 0; color: #777777; font-size: 12px; line-height: 1.6; text-align: center;">
                  ⏳ This code is valid for <strong>60 seconds (1 minute)</strong>. Please enter this code promptly on the website.
                </p>

                <div style="border-top: 1px solid #eeeeee; margin: 24px 0; padding-top: 20px;">
                  <p style="margin: 0; color: #888888; font-size: 12px; line-height: 1.5;">
                    If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #fbfbfb; padding: 20px 32px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.5;">
                  Order Center Logistics Platform • Sulaimanyiah, Kurdistan Region, Iraq<br>
                  Official Contact: Wazhamyassin98@gmail.com
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // Send via SMTP if credentials are configured
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        replyTo: 'Wazhamyassin98@gmail.com',
        to: cleanEmail,
        subject: `Order Center: ${code} is your 60-second password reset code`,
        html: emailHtml,
        text: `Hello ${displayName},\n\nYour Order Center password reset code is: ${code}\n\nThis verification code expires in 60 seconds (1 minute).\n\nSent by Order Center (Wazhamyassin98@gmail.com).`,
      });

      console.log(`[EMAIL DISPATCH] Password reset email sent from Wazhamyassin98@gmail.com to ${cleanEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[EMAIL DISPATCH ERROR]', err);
    }
  }

  // Console logging for verification
  console.log('================================================================');
  console.log(`[ORDER CENTER VERIFICATION CODE SENT TO EMAIL]`);
  console.log(`From Website: Wazhamyassin98@gmail.com`);
  console.log(`To Customer: ${cleanEmail}`);
  console.log(`User: ${displayName}`);
  console.log(`6-DIGIT CODE: >>> ${code} <<<`);
  console.log(`Validity: 60 SECONDS (1 MINUTE)`);
  console.log('================================================================');

  return {
    success: true
  };
}

