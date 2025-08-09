// const nodemailer = require('nodemailer');

//     async function sendTestEmail() {
//         let transporter = nodemailer.createTransport({
//             host: "smpt.gmail.com", // Example host, replace with your service's host
//             port: 587, // Example port
//             secure: false, // Use 'true' if your service requires SSL/TLS
//             auth: {
//                 user: process.env.EMAIL_USER, // Replace with your Mailtrap username
//                 pass: process.env.EMAIL_PASSWORD  // Replace with your Mailtrap password
//             }
//         });

//         let info = await transporter.sendMail({
//             from: `"Prathibha B C" <${process.env.EMAIL_USER}>`,
//             to: "ramyam1496@gmail.com",
//             subject: "Test Email",
//             text: "This is a test email sent without real authentication.",
//             html: "<b>This is a test email sent without real authentication.</b>"
//         });

//         console.log("Message sent: %s", info.messageId);
//         console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//     }

//     sendTestEmail().catch(console.error);

// module.exports = sendWelcomeEmail;



const nodemailer = require('nodemailer');

async function sendTestEmail(to, subject, text, html) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  let info = await transporter.sendMail({
    from: `"Admin GAT COE" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log("Email sent:", info.messageId);
  return info;
}

// 👇 Export it
module.exports = sendTestEmail;

