const nodemailer = require('nodemailer');

export async function sendOtpEmail(to: string, otp: string) {
  const sampleMail = `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mindscape bd OTP</title>
  <link href="https://fonts.googleapis.com/css2?family=Kaisei+Decol&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #FFFFF4;
      font-family: 'Kaisei Decol', serif;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 50px auto;
      padding: 30px;
      background-color: #FFFFFF;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    h1 {
      color: #1a1a1a;
      font-size: 28px;
      margin-bottom: 20px;
    }
    p {
      font-size: 16px;
      margin: 10px 0 20px 0;
    }
    .otp {
      display: inline-block;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      padding: 15px 25px;
      border-radius: 8px;
      background-color: #f0f0f0;
      color: #000;
      margin-bottom: 20px;
    }
    .footer {
      font-size: 14px;
      color: #666;
      margin-top: 30px;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Mindscape bd</h1>
    <p>Your One-Time Password (OTP) is:</p>
    <div class="otp">${otp}</div>
    <p>This OTP will expire in 10 minutes. Do not share it with anyone.</p>
    <div class="footer">
      &copy; 2025 Mindscape bd. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

  // 1. Create transporter
  let transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: 'noreply@mindscapebd.org',
      pass: process.env.ZOHO_PASSWORD,
    },
  });

  // 2. Send mail
  let info = await transporter.sendMail({
    from: '"Mindscape" <noreply@mindscapebd.org>',
    to: to,
    subject: 'Your OTP for Mindscape bd',
    html: sampleMail,
  });

  console.log('Message sent: %s', info.messageId);
}
