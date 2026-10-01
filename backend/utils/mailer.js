import nodemailer from 'nodemailer';

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: +(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
}

// Never throws — emails must not block core actions (SRS NFR)
export function notify(to, subject, html) {
  if (!transporter) { console.log(`[mail:skip] "${subject}" → ${to}`); return Promise.resolve(); }
  return transporter
    .sendMail({ from: `Placement Portal <${process.env.EMAIL_USER}>`, to, subject, html })
    .catch(err => console.log('[mail:error]', err.message));
}