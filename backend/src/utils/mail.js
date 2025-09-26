const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendBookingNotification(booking) {
  const msg = {
    from: `"Pico Skincare" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
    subject: `New booking from ${booking.name}`,
    text: `Booking: ${booking.name}, ${booking.phone}, ${booking.email}, ${booking.treatmentTitle} on ${booking.date}`
  };
  return transporter.sendMail(msg);
}

module.exports = { sendBookingNotification };
