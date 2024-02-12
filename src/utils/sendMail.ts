import nodemailer from "nodemailer";

// Create a transporter object using SMTP or other transport methods
const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email service (e.g., 'Gmail', 'Outlook')
  auth: {
    user: "deepnirmaan8@gmail.com", // Your email address
    pass: "uklsrsrgrbpfspjf", // Your email password or application-specific password
  },
});

// Create a function to send the email
export const sendEmail = async (to:string, subject:string, message:string) => {
    const header = `<h1>Header design will come Here</h1>`;
    const footer = `<h1>Footer design will come Here</h1>`;
    const messageBody = `${header}<br>${message}<br>${footer}`;
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: {
        name: "Edutax",
        address: "deepnirmaan8@gmail.com",
      },
      to: to, // Recipient email address
      subject: subject, // Subject of the email
      //   text: 'This is a test email sent from Node.js using nodemailer.', // Plain-text version of the email body
      html: messageBody, // HTML version of the email body
    });

    // console.log('Email sent successfully!');
    // console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    //console.error("Error occurred while sending the email:", error);
   // throw error;
   throw new Error('Failed to send email.');
    //return false;
  }
};

// Call the function to send the email
//sendEmail();
