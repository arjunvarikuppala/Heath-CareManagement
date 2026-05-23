import exp from 'express';
import { authenticate } from "../Services/authService.js"
import { verifyToken } from "../middelWares/verifyToken.js"
import { compare, hash } from 'bcryptjs';
import { userModel } from '../Models/userModel.js'
import { emailVerificationModel } from '../Models/emailVerificationModel.js'
import { sendEmail }from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import {
  getAuthCookieOptions
} from "../Config/authCookie.js";
import {
  addAppointmentEventClient
} from "../utils/appointmentEvents.js";

export const commonRoute = exp.Router();

// ===================== EMAIL VERIFICATION =====================
commonRoute.get(

  "/verify-email/:token",

  async (req, res) => {

    try {

      const { token } =
        req.params;

      const decoded =
        jwt.verify(

          token,

          process.env.JWT_SECRET

        );

      if (decoded.purpose === "patient-registration") {

        const verification =
          await emailVerificationModel.findOne({
            token,
            email: decoded.email,
            expiresAt: {
              $gt: new Date()
            }
          });

        if (!verification) {

          return res.status(400).json({
            message:
              "Invalid or expired link"
          });

        }

        verification.verified = true;

        await verification.save();

        return res.status(200).json({
          message:
            "Email verified successfully",
          email:
            decoded.email,
          purpose:
            decoded.purpose
        });

      }

      await userModel.findByIdAndUpdate(

        decoded.userId,

        {

          isVerified: true

        }

      );

      return res.status(200).json({

        message:
          "Email verified successfully"

      });

    }

    catch (error) {

      return res.status(400).json({

        message:
          "Invalid or expired link"

      });

    }

  }

);

// ===================== LOGIN =====================
commonRoute.post("/authenticate", async (req, res) => {

  try {

    const { email, password } =
      req.body;

    const { token, user } =
      await authenticate(email, password);

    console.log("LOGIN attempt for:", email);
    console.log("LOGIN: authenticated user role:", user.role);
    try {
      console.log("LOGIN: token decoded:", jwt.decode(token));
      console.log("LOGIN: incoming cookie present:", req.cookies?.token ? true : false);
    } catch (e) {
      // ignore
    }

    // EMAIL VERIFICATION CHECK

    if (
      user.role === "patient" &&
      !user.isVerified
    ) {

      return res.status(403).json({

        message:
          "Please verify your email first"

      });

    }

    // COOKIE

    res.cookie("token", token, {

      ...getAuthCookieOptions()

    });

    // RESPONSE

    res.status(200).json({

      message: "Login Success",

      payload: user

    });

  }

  catch (err) {

    console.log(
      "🔥 LOGIN ERROR:",
      err
    );

    res.status(err.status || 500)
    .json({

      success: false,

      message: err.message

    });

  }

});

// ===================== FORGOT PASSWORD =====================
commonRoute.post(

  "/forgot-password",

  async (req, res) => {

    try {

      const { email } =
        req.body;

      const user =
        await userModel.findOne({
          email
        });

      if (!user) {

        return res.status(404).json({
          message: "User not found"
        });

      }

      const resetToken =
        jwt.sign(
          {
            userId: user._id
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "15m"
          }
        );

      user.resetPasswordToken =
        resetToken;

      user.resetPasswordExpires =
        new Date(
          Date.now() + 15 * 60 * 1000
        );

      await user.save();

      const resetLink =
            `https://heath-care-management.vercel.app/reset-password/${resetToken}`;

      await sendEmail(
        user.email,
        "Reset Your CareSync Password",
        `<p>Use this link to reset your password. It expires in 15 minutes.</p><a href="${resetLink}">Reset Password</a>`
      );

      return res.status(200).json({
        success: true,
        message: "Password reset link sent to your email"
      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }

);

commonRoute.post(

  "/send-registration-verification",

  async (req, res) => {

    try {

      const email =
        req.body.email?.toLowerCase();

      if (!email) {

        return res.status(400).json({
          message: "Email is required"
        });

      }

      const existingUser =
        await userModel.findOne({
          email
        });

      if (existingUser) {

        return res.status(400).json({
          message:
            "User already exists"
        });

      }

      const token =
        jwt.sign(
          {
            email,
            purpose:
              "patient-registration"
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "15m"
          }
        );

      await emailVerificationModel
        .deleteMany({
          email,
          purpose:
            "patient-registration"
        });

      await emailVerificationModel.create({
        email,
        token,
        purpose:
          "patient-registration",
        expiresAt:
          new Date(
            Date.now() + 15 * 60 * 1000
          )
      });

          const verifyLink =
      `https://heath-care-management.vercel.app/verify-email/${token}`;
          await sendEmail(
            email,
            "Verify Your CareSync Email",
            `<p>Please verify your email before registration.</p><a href="${verifyLink}">Verify Email</a>`
          );

          return res.status(200).json({
  success: true,
  message: "Verification email sent successfully"
});
      return res.status(200).json({
        success: true,
        message:
          "Verification link sent"
      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }

);

commonRoute.get(

  "/registration-verification-status",

  async (req, res) => {

    try {

      const email =
        req.query.email?.toLowerCase();

      if (!email) {

        return res.status(400).json({
          message: "Email is required"
        });

      }

      const verification =
        await emailVerificationModel.findOne({
          email,
          purpose:
            "patient-registration",
          verified: true,
          expiresAt: {
            $gt: new Date()
          }
        });

      return res.status(200).json({
        success: true,
        verified:
          Boolean(verification)
      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }

);

commonRoute.put(

  "/reset-password/:token",

  async (req, res) => {

    try {

      const { token } =
        req.params;

      const { password } =
        req.body;

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const user =
        await userModel.findOne({
          _id: decoded.userId,
          resetPasswordToken: token,
          resetPasswordExpires: {
            $gt: new Date()
          }
        });

      if (!user) {

        return res.status(400).json({
          message: "Invalid or expired reset link"
        });

      }

      user.password =
        await hash(
          password,
          12
        );

      user.resetPasswordToken = "";
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password reset successfully"
      });

    } catch (error) {

      return res.status(400).json({
        message: "Invalid or expired reset link"
      });

    }

  }

);


// ===================== LOGOUT =====================
commonRoute.get("/logout", async (req, res) => {
  res.clearCookie(
    "token",
    getAuthCookieOptions()
  );

  res.status(200).json({ message: "Logged Out Successfully" });
});


// ===================== CHANGE PASSWORD =====================
commonRoute.put("/change-password",verifyToken("admin", "doctor", "patient", "receptionist"),async (req, res) => {
    try {

      // Get logged-in user id from token
      const userId = req.user.userId;

      // Find user
      const userDoc = await userModel.findById(userId);

      if (!userDoc) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Get passwords from request body
      const {currentPassword,newPassword} = req.body;

      // Compare current password
      const checkPassword = await compare(currentPassword,userDoc.password);

      if (!checkPassword) {
        return res.status(400).json({
          message: "Current password incorrect"
        });
      }

      // Hash new password
      const hashedPassword = await hash(
        newPassword,
        12
      );

      // Update password
      userDoc.password = hashedPassword;

      await userDoc.save();

      return res.status(200).json({
        message:
          "Password changed successfully"
      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }
  }
);

// ===================== CHECK AUTH =====================
commonRoute.get(
  "/check-auth",
  verifyToken("admin", "doctor", "patient", "receptionist"),
  async (req, res) => {
    try {
      const user = await userModel
        .findById(req.user.userId)
        .select("-password");

      res.status(200).json({
        message: "User is authenticated",
        payload: user
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching user",
        error: err.message
      });
    }
  }
);

commonRoute.get(
  "/appointments/stream",
  verifyToken("admin", "doctor", "patient", "receptionist"),
  async (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });

    const removeClient =
      addAppointmentEventClient(res);

    req.on(
      "close",
      removeClient
    );
  }
);

commonRoute.get(

  "/test-email",

  async (req, res) => {

    try {

      await sendEmail(

        "spurthialapati2005@gmail.com",

        "HMS Test Email",

        "Your Hospital Management Email System Works"

      );

      return res.status(200).json({

        message:
          "Test email sent successfully"

      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }
);
