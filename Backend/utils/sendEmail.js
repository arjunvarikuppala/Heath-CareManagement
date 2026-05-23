import {
  emailFrom,
  mailerTransporter
} from "../Config/mailer.js";

export const sendEmail = async (to,subject,html) => {

  try {

    // Email options
    const mailOptions = {

      from:
        emailFrom,

      to,

      subject,

      html

    };

    // Send email
    await mailerTransporter.sendMail(
      mailOptions
    );

    console.log(
      "Email sent successfully"
    );

  } catch (error) {

    console.log(
      "EMAIL ERROR:",
      error
    );

  }

};

export const sendEmailInBackground =
  (to, subject, html) => {

    setImmediate(() => {
      sendEmail(
        to,
        subject,
        html
      ).catch((error) =>
        console.log(
          "EMAIL BACKGROUND ERROR:",
          error.message
        )
      );
    });

  };
