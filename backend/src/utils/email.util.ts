import nodemailer from "nodemailer";

/**
 * Sends a password reset email with a magic link.
 * If SMTP_USER and SMTP_PASS are set in .env, uses real SMTP (e.g. Gmail).
 * Otherwise falls back to Ethereal (fake SMTP) — check console for preview URL.
 */
export async function sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    let transporter: nodemailer.Transporter;
    let fromAddress: string;
    let isEthereal = false;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // ✅ Real SMTP — Gmail or any other provider
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for port 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
        console.log(`📧 Sending real email via ${process.env.SMTP_HOST || "smtp.gmail.com"}...`);
    } else {
        // 🧪 Dev fallback — Ethereal fake SMTP
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        fromAddress = testAccount.user;
        isEthereal = true;
        console.log("⚠️  SMTP_USER/SMTP_PASS not set — using Ethereal fake SMTP (email won't reach real inbox)");
    }

    const info = await transporter.sendMail({
        from: `"FixHub Support" <${fromAddress}>`,
        to: toEmail,
        subject: "FixHub — Reset Your Password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">FixHub</h1>
                    <p style="color: #bfdbfe; margin: 8px 0 0;">Password Reset Request</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Reset Your Password</h2>
                    <p style="color: #64748b; line-height: 1.6;">
                        We received a request to reset your FixHub password. Click the button below to create a new password.
                        This link will expire in <strong>15 minutes</strong>.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #2D6FFF; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
                            Reset My Password
                        </a>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                        If you didn't request this, you can safely ignore this email. Your password will not be changed.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        Or copy and paste this link into your browser:<br/>
                        <a href="${resetUrl}" style="color: #3B82F6; word-break: break-all;">${resetUrl}</a>
                    </p>
                </div>
            </div>
        `,
    });

    console.log("✅ Password reset email sent to:", toEmail);
    if (isEthereal) {
        console.log("📬 Ethereal Preview URL:", nodemailer.getTestMessageUrl(info));
        console.log("👆 Open this URL in browser, then click 'Reset My Password' inside the email.");
    }
}

