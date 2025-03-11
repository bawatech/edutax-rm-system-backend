import nodemailer from "nodemailer";

export const sendLoginVerification = async (to: string, otp: string) => {
  const subject = "Edutax: Verify Login Otp";
  const message = `Dear Sir/Mam,
  <br>\n
  <br>\n
  Thank you for Logging In for our services. To verify yourself, please enter the following one-time password (OTP) in the app:<br>\n
  <br>\n
  <br>\n
  
  <h2 style="width:100%;text-align:center;"> <span style="padding:10px;background:#f2f2f2">${otp}</span></h2>`
  const send = await sendEmail(to, subject, message)
  return send
}

export const sendEmailNotifyClientNewMessages = async (to: string) => {

  const subject = "Edutax: New Message";
  const message = `Dear Sir/Mam,
    <br>\n
    <br>\n
    You received new messages. To check this, Please visit your account.
    <br>\n
    <br>\n`
  const send = await sendEmail(to, subject, message)
  return send
}


export const sendEmailVerification = async (to: string, otp: string) => {

  const subject = "Edutax: Verify Email Address";
  const message = `Dear Sir/Mam,
    <br>\n
    <br>\n
    Thank you for signing up for our services. To verify your email address, please enter the following one-time password (OTP) in the app:<br>\n
    <br>\n
    <br>\n
    <h2 style="width:100%;text-align:center;"> <span style="padding:10px;background:#f2f2f2">${otp}</span></h2>`
  const send = await sendEmail(to, subject, message)
  return send
}


export const sendForgetPasswordOtp = async (to: string, otp: string) => {
  const subject = "Edutax: Password Recovery";
  const message = `Dear Sir/Mam,
  <br>\n
  <br>\n
  Please enter the following one-time password (OTP) to recover your password:<br>\n
  <br>\n
  <br>\n
  
  <h2 style="width:100%;text-align:center;"> <span style="padding:10px;background:#f2f2f2">${otp}</span></h2>`
  const send = await sendEmail(to, subject, message)
  return send
}


export const sendSpouseInvitationMail = async (to: string, from: string, token: string) => {
  const subject = "Edutax: Spouse linking request";

  const message = `Dear Sir/Mam,
  <br>\n
  <br>\n
  You got a spouse linking invitation from ${from}. Click the link given below accept the invitation.<br>\n
  <br>\n
  <br>\n
  <a href="${process.env.FRONT_BASE_URL}/accept-invitation/${token}" target="_blank" style="font-size: 16px; font-weight: bold; background-color: #6699FF; text-decoration: none; display: inline-block; padding: 12px 24px; border-radius: 25px;">Click Here To Accept Invitation</a>`
  const send = await sendEmail(to, subject, message)
  return send
}


export const sendUploadedDocumentNotify = async (to: string) => {

  const subject = "Edutax: New Documents Sent";
  const message = `Dear Sir/Mam,
    <br>\n
    <br>\n
    New Documents are uploaded in your return. To check this, Please visit your account.
    <br>\n
    <br>\n`
  const send = await sendEmail(to, subject, message)
  return send
}



export const sendPaymentLink = async (to: string,data:{
  name:string | null,
  amount:string|number,
  title:string,
  payment_url:string

}) => {

  const subject = "Edutax | Payment Request";
  const message = `Dear ${data?.name || `Sir/Mam`}
      \n <br>
      \n <br>
      I hope you're doing well!
      \n <br>
      \n <br>
      Please find below the secure payment link
        \n <br>
        Title : <b>${data?.title}</b>
        \n <br>
        Amount : <b>${data?.amount}</b>
        \n <br>
        \n <br>
        Please follow the following link to make payment
        \n <br>
        <a href="${data?.payment_url}" style="color:blue;font-weight:bold"> Click here to make payment </a>
        \n <br>
        \n <br>
        Click the link to complete your payment securely. If you have any questions, feel free to reach out.
        \n <br>Thank you for your business!
        \n <br>
        \n <br>`
  const send = await sendEmail(to, subject, message)
  return send
}




// Create a transporter object using SMTP or other transport methods
// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587,
//   auth: {
//     user: "contact@edutax.ca",
//     pass: "370980Aa@", 
//   }
// });
const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email service (e.g., 'Gmail', 'Outlook')
  auth: {
    user: process.env.MAILER_EMAIL || 'company@company.com',
    pass: process.env.MAILER_PASSWORD || '',
  },
});

// Create a function to send the email
export const sendEmail = async (to: string, subject: string, message: string) => {
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
  const footer = `
  <br>\n
  <br>\n
  If you have any questions, please do not hesitate to contact us.
  <br>\n
  <br>\n
  Sincerely,
  <br>\n
  <h3>Edu-Tax Inc.</h3>
  <p>Unit 206</p>
  <p>9886 Torbram Road</p>
  <p>Brampton -ON</p>
  </div>


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
        address: "contact@edutax.ca",
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
