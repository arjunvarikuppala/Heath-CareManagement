import {
  emailFrom,
  mailerTransporter
} from "../Config/mailer.js";

export const sendEmail = async (
  to,
  subject,
  html
) => {

  try {

    const mailOptions = {

      from: emailFrom,

      to,

      subject,

      html

    };

    const info =
      await mailerTransporter.sendMail(
        mailOptions
      );

    console.log(
      "Email sent successfully"
    );

    return info;

  }

  catch (error) {

    console.log(
      "EMAIL ERROR:",
      error
    );

    throw error;

  }

};

export const sendEmailInBackground =
  (to, subject, html) => {

    setImmediate(async () => {

      try {

        await sendEmail(
          to,
          subject,
          html
        );

      }

      catch (error) {

        console.log(
          "EMAIL BACKGROUND ERROR:",
          error.message
        );

      }

    });

  };