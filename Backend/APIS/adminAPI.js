import express from "express";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middelWares/verifyToken.js"
import {userModel}  from "../Models/userModel.js"
import {appointmentModel} from "../Models/appointmentModel.js";
import { upload } from "../Config/multer.js";
import cloudinary from "../Config/cloudinary.js";
import * as appointmentHelpers
from "../utils/appointmentHelpers.js";
import {
  notifyAppointmentsChanged
} from "../utils/appointmentEvents.js";
import {
  sendEmailInBackground
} from "../utils/sendEmail.js";

export const adminRoute = express.Router();

const uploadUserPhoto =
  async (file, folder) => {

    const result =
      await cloudinary.uploader.upload(

        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,

        {
          folder
        }

      );

    return result.secure_url;

  };

const sanitizeUser =
  (user) => {

    const userObj =
      user.toObject
        ? user.toObject()
        : {
            ...user
          };

    delete userObj.password;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;

    return userObj;

  };

const buildUserUpdateData =
  (body, extraFields = []) => {

    const fields = [

      "name",

      "phone",

      "age",

      "gender",

      "email",

      ...extraFields

    ];

    return fields.reduce((data, field) => {

      if (
        body[field] !== undefined &&
        body[field] !== ""
      ) {

        data[field] =
          field === "email"
            ? body[field].toLowerCase().trim()
            : body[field];

      }

      return data;

    }, {});

  };

const updateStaffMember =
  (role, label, extraFields = []) =>
  async (req, res) => {

    try {

      const { userId } =
        req.params;

      const user =
        await userModel.findOne({

          _id: userId,

          role

        });

      if (!user) {

        return res.status(404).json({
          message:
            `${label} not found`
        });

      }

      const normalizedEmail =
        req.body.email?.toLowerCase()?.trim();

      if (
        normalizedEmail &&
        normalizedEmail !== user.email
      ) {

        const emailExists =
          await userModel.findOne({

            email:
              normalizedEmail,

            _id: {
              $ne: userId
            }

          });

        if (emailExists) {

          return res.status(400).json({
            message:
              `${label} email already exists`
          });

        }

      }

      const updateData =
        buildUserUpdateData(
          req.body,
          extraFields
        );

      if (req.body.password) {

        if (!req.body.oldPassword) {

          return res.status(400).json({
            message:
              "Old password is required"
          });

        }

        const isOldPasswordValid =
          await bcrypt.compare(
            req.body.oldPassword,
            user.password
          );

        if (!isOldPasswordValid) {

          return res.status(400).json({
            message:
              "Old password is incorrect"
          });

        }

        updateData.password =
          await bcrypt.hash(
            req.body.password,
            10
          );

      }

      if (req.file) {

        updateData.profilePhoto =
          await uploadUserPhoto(
            req.file,
            `${role}s`
          );

      }

      Object.assign(
        user,
        updateData
      );

      await user.save();

      return res.status(200).json({

        success: true,

        message:
          `${label} updated successfully`,

        payload:
          sanitizeUser(user)

      });

    }

    catch (error) {

      console.error(
        "UPDATE STAFF ERROR:",
        error.message
      );

      return res.status(500).json({
        message:
          error.message
      });

    }

  };




// CREATE DOCTOR
adminRoute.post(

  "/create-doctor",

  verifyToken("admin"),

  upload.single("profilePhoto"),

  async (req, res) => {

    try {

      const {
        name,
        phone,
        age,
        gender,
        specialization,
        experience,
        email,
        password,
      } = req.body;

      const normalizedEmail =
        email?.toLowerCase()?.trim();

      // CLOUDINARY IMAGE URL

      let profilePhoto = "";

      if (req.file) {

        const result =
          await cloudinary.uploader.upload(

            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,

            {

              folder: "doctors",

            }

          );

        profilePhoto =
          result.secure_url;

      }

      // CHECK EXISTING DOCTOR

      const doctorExists =
        await userModel.findOne({
          email:
            normalizedEmail,
        });

      if (doctorExists) {

        return res.status(400).json({

          message:
            "Doctor already exists",

        });

      }

      // HASH PASSWORD

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // CREATE DOCTOR

      const doctor =
        await userModel.create({

          name,

          phone,

          age,

          gender,

          email:
            normalizedEmail,

          password: hashedPassword,

          profilePhoto,

          role: "doctor",

          specialization,

          experience,

        });

      // RESPONSE

      return res.status(201).json({

        success: true,

        message:
          "Doctor created successfully",

        payload:
          sanitizeUser(doctor),

      });

    }

    catch (error) {

      console.log(error);

      return res.status(500).json({

        message:
          error.message,

      });

    }

  }

);




// CREATE RECEPTIONIST
adminRoute.post(

  "/create-receptionist",

  verifyToken("admin"),

  upload.single("profilePhoto"),

  async (req, res) => {

    try {

      const {
        name,
        phone,
        age,
        gender,
        email,
        password,
      } = req.body;

      const normalizedEmail =
        email?.toLowerCase()?.trim();

      let profilePhoto = "";

      if (req.file) {

        profilePhoto =
          await uploadUserPhoto(
            req.file,
            "receptionists"
          );

      }

      const receptionistExists =
        await userModel.findOne({
          email:
            normalizedEmail,
        });

      if (receptionistExists) {

        return res.status(400).json({
          message:
            "Receptionist already exists",
        });

      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const receptionist =
        await userModel.create({

          name,

          phone,

          age,

          gender,

          email:
            normalizedEmail,

          password: hashedPassword,

          profilePhoto,

          role: "receptionist",

        });

      return res.status(201).json({

        success: true,

        message:
          "Receptionist created successfully",

        payload:
          sanitizeUser(receptionist),

      });

    }

    catch (error) {

      console.log(error);

      return res.status(500).json({
        message: error.message,
      });

    }

  }
);

adminRoute.put(

  "/update-doctor/:userId",

  verifyToken("admin"),

  upload.single("profilePhoto"),

  updateStaffMember(
    "doctor",
    "Doctor",
    [
      "specialization",
      "experience"
    ]
  )

);

adminRoute.put(

  "/update-receptionist/:userId",

  verifyToken("admin"),

  upload.single("profilePhoto"),

  updateStaffMember(
    "receptionist",
    "Receptionist"
  )

);

adminRoute.put("/block-user/:userId",verifyToken("admin"),async (req, res) => {
  try {

      // Get userId from params
      const userId = req.params.userId;

      // Check if user exists
      const userExists =
        await userModel.findById(userId);

      if (!userExists) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Prevent blocking admin
      if (userExists.role === "admin") {
        return res.status(403).json({
          message:
            "Admin cannot be blocked"
        });
      }

      // Already blocked
      if (!userExists.isActive) {
        return res.status(400).json({
          message:
            "User already blocked"
        });
      }

      // Block user
      userExists.isActive = false;

      await userExists.save();

      return res.status(200).json({

        success: true,

        message:
          "User blocked successfully",

        payload:
          sanitizeUser(userExists)

      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }
);

adminRoute.put("/unblock-user/:userId",verifyToken("admin"),async (req, res) => {

    try {

      // Get userId from params
      const userId = req.params.userId;

      // Check if user exists
      const userExists =
        await userModel.findById(userId);

      if (!userExists) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Already active
      if (userExists.isActive) {
        return res.status(400).json({
          message:
            "User already active"
        });
      }

      // Unblock user
      userExists.isActive = true;

      await userExists.save();

      return res.status(200).json({

        success: true,

        message:
          "User unblocked successfully",

        payload:
          sanitizeUser(userExists)

      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }
);

adminRoute.get(

  "/dashboard-stats",

  verifyToken("admin"),

  async (req, res) => {

    try {

      const doctors =
        await userModel.countDocuments({

          role: "doctor"

        });

      const receptionists =
        await userModel.countDocuments({

          role: "receptionist"

        });

      const patients =
        await userModel.countDocuments({

          role: "patient"

        });

      const appointments =
        await appointmentModel.countDocuments();

      res.status(200).json({

        doctors,
        receptionists,
        patients,
        appointments

      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          error.message

      });

    }

  }

);

adminRoute.get(

  "/doctors",

  verifyToken("admin"),

  async (req, res) => {

    try {

      const doctors =
        await userModel.find({

          role: "doctor"

        }).select(
          "-password -resetPasswordToken -resetPasswordExpires"
        );
        
      return res.status(200).json({

        success: true,

        payload: doctors

      });

    }

    catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }
);

adminRoute.get(

  "/receptionists",

  verifyToken("admin"),

  async (req, res) => {

    try {

      const receptionists =
        await userModel.find({

          role: "receptionist"

        }).select(
          "-password -resetPasswordToken -resetPasswordExpires"
        );

      return res.status(200).json({

        success: true,

        payload: receptionists

      });

    }

    catch (error) {

      console.log(error);

      return res.status(500).json({

        message:
          error.message

      });

    }

  }

);

adminRoute.get(

  "/patients",

  verifyToken("admin"),

  async (req, res) => {

    try {

      const patients =
        await userModel.find({

          role: "patient"

        }).select(
          "-password -resetPasswordToken -resetPasswordExpires"
        );

      return res.status(200).json({

        success: true,

        payload: patients

      });

    }

    catch (error) {

      console.log(error);

      return res.status(500).json({

        message:
          error.message

      });

    }

  }

);

adminRoute.get(

  "/appointments",

  verifyToken("admin"),

  async (req, res) => {

    try {

      const appointments =
        await appointmentModel
          .find()
          .populate(
            "patientId",
            "name age phone email profilePhoto"
          )
          .populate(
            "doctorId",
            "name phone email specialization profilePhoto"
          )
          .sort({
            appointmentDate: -1,
            appointmentTime: -1
          });

      return res.status(200).json({
        success: true,
        totalAppointments:
          appointments.length,
        payload: appointments
      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }

);

adminRoute.put(

  "/reschedule-appointment/:appointmentId",

  verifyToken("admin"),

  async (req, res) => {

    try {

      const {
        appointmentId
      } = req.params;

      const {
        appointmentDate,
        appointmentTime,
        doctorId
      } = req.body;

      const appointment =
        await appointmentHelpers
        .findAppointmentById(
          appointmentId
        );

      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

      }

      const rescheduleResult =
        await appointmentHelpers
        .rescheduleAppointmentIfSlotAvailable({
          appointment,
          appointmentDate,
          appointmentTime,
          doctorId
        });

      if (rescheduleResult.scheduleError) {

        return appointmentHelpers
        .sendScheduleErrorResponse(
          res,
          rescheduleResult.scheduleError
        );

      }

      if (rescheduleResult.doctorNotFound) {

        return res.status(404).json({
          message: "Doctor not found"
        });

      }

      if (rescheduleResult.doctorUnavailable) {

        return appointmentHelpers
        .sendDoctorUnavailableResponse(res);

      }

      if (rescheduleResult.existingPatientAppointment) {

        return appointmentHelpers
        .sendPatientDuplicateAppointmentResponse(res);

      }

      if (rescheduleResult.existingAppointment) {

        return appointmentHelpers
        .sendDoctorSlotUnavailableResponse(res);

      }

      const updatedAppointment =
        rescheduleResult.appointment;

      sendEmailInBackground(
        updatedAppointment.patientId.email,
        "Appointment Rescheduled",
        `Your appointment has been rescheduled.

Doctor: Dr. ${updatedAppointment.doctorId.name}

Date: ${updatedAppointment.appointmentDate}

Time: ${updatedAppointment.appointmentTime}

Status: pending`
      );

      notifyAppointmentsChanged({
        appointmentId,
        action: "appointment-rescheduled",
        appointment:
          updatedAppointment
      });

      return res.status(200).json({
        success: true,
        message:
          "Appointment rescheduled successfully",
        payload:
          updatedAppointment
      });

    } catch (error) {

      return appointmentHelpers
      .sendServerErrorResponse(
        res,
        error
      );

    }

  }

);
