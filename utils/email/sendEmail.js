const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (email, subject, payload, template, pdfBuffer = null) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);

    // Define email options
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email, // <- Correctly defined recipients here
      subject: subject,
      html: compiledTemplate(payload),
    };
    
    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: 'ticket.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ];
    }

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
