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
    const header = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
    
        <style>
            *{
                padding: 0;
                margin: 0;
                box-sizing: border-box;
            }
            html{
                font-family: calibri;
            }
        </style>
    </head>
    <body>
        <div  style="
                width: 100%;
                padding: 1em;
                background: #2d87ca;
            
        text-align:center
            ">
            <div style="text-align: center;">
            <h2 style="font-size:2.5em; color:white">EduTax</h2></div>
        </div>
    
    
        <div style="padding: 5em 0;padding:40px;">`;
    const footer = `</div>


    <div style="
        padding: 1em;
        background: rgb(243, 243, 243);
        width: 100%;
        text-align:center
    ">
        <p>&copy; 2024 Edutax. All rights reserved.</p>
    </div>
</body>
</html>`;
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
