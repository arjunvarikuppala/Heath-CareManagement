import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

export const emailFrom =
  process.env.EMAIL_USER ||
  process.env.EMAIL;

export const mailerTransporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user: emailFrom,

      pass:
        process.env.EMAIL_PASS

    }

  });
