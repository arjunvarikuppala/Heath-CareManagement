import exp from "express";
import { hash } from "bcryptjs";

import { userModel }
from "../Models/userModel.js";

import { emailVerificationModel }
from "../Models/emailVerificationModel.js";

import { appointmentModel } from "../Models/appointmentModel.js";
import * as appointmentHelpers
from "../utils/appointmentHelpers.js";

import { verifyToken }
from "../middelWares/verifyToken.js";

import {
  sendEmailInBackground
} from "../utils/sendEmail.js";

import { upload }
from "../Config/multer.js";

import{uploadToCloudinary}
from "../Config/cloudinaryUpload.js";

import cloudinary
from "../Config/cloudinary.js";
import {
  getAuthCookieOptions
} from "../Config/authCookie.js";
import {
  notifyAppointmentsChanged
} from "../utils/appointmentEvents.js";

export const patientRoute =
  exp.Router();

// REGISTER PATIENT

patientRoute.post(

  "/register",

  upload.single("profilePhoto"),

  async (req, res, next) => {

    let cloudinaryResult;

    try {

      const {

        name,
        phone,
        age,
        gender,
        email,
        password

      } = req.body;

      const normalizedEmail =
        email?.toLowerCase()?.trim();

      if (
        !name ||
        !phone ||
        !age ||
        !gender ||
        !normalizedEmail ||
        !password
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Name, phone, age, gender, email and password are required"
        });

      }

      // CHECK EXISTING USER

      const userExists =
        await userModel.findOne({

          email:
            normalizedEmail

        });

      if (userExists) {

        return res.status(400).json({

          message:
            "User already exists"

        });

      }

      const verifiedEmail =
        await emailVerificationModel.findOne({
          email:
            normalizedEmail,
          purpose:
            "patient-registration",
          verified: true,
          expiresAt: {
            $gt: new Date()
          }
        });

      if (!verifiedEmail) {

        return res.status(400).json({
          message:
            "Please verify your email before registration"
        });

      }

      // UPLOAD IMAGE

      if (req.file) {

        cloudinaryResult =
          await uploadToCloudinary(

            req.file.buffer

          );

      }

      // HASH PASSWORD

      const hashedPassword =
        await hash(password, 12);

      // CREATE PATIENT

      const newPatient =
        await userModel.create({

          name,
          phone,
          age,
          gender,
          email:
            normalizedEmail,

          password:
            hashedPassword,

          profilePhoto:
            cloudinaryResult?.secure_url,

          role: "patient",

          isActive: true,

          isVerified: true

        });

      await emailVerificationModel.deleteMany({
        email:
          normalizedEmail,
        purpose:
          "patient-registration"
      });

      res.clearCookie(
        "token",
        getAuthCookieOptions()
      );

      // RESPONSE

      res.status(201).json({

        success: true,

        message:
          "Patient registered successfully",

        payload: {

          _id:
            newPatient._id,

          name:
            newPatient.name,

          email:
            newPatient.email,

          role:
            newPatient.role,

          gender:
            newPatient.gender,

          profilePhoto:
            newPatient.profilePhoto,

          isVerified:
            newPatient.isVerified

        }

      });

    }

    catch (err) {

      // DELETE IMAGE IF ERROR

      if (
        cloudinaryResult?.public_id
      ) {

        await cloudinary
        .uploader
        .destroy(

          cloudinaryResult.public_id

        );

      }

      next(err);

    }

  }

);


// ===================== BOOK APPOINTMENT =====================
patientRoute.post("/book-appointment",verifyToken("patient"),async (req, res) => {

    try {

      // Get data from body
      const {doctorId,appointmentDate,appointmentTime,reason} = req.body;
      
      const appointmentResult =
        await appointmentHelpers
        .createPendingAppointmentIfSlotAvailable({
          doctorId,
          patientId:
            req.user.userId,
          appointmentDate,
          appointmentTime,
          appointmentData: {
          patientId:
            req.user.userId,
          doctorId,
          appointmentDate,
          appointmentTime,
          reason
          }
        });

      if (appointmentResult.scheduleError) {

        return appointmentHelpers
        .sendScheduleErrorResponse(
          res,
          appointmentResult.scheduleError
        );

      }

      if (appointmentResult.doctorNotFound) {

        return res.status(404).json({
          message: "Doctor not found"
        });

      }

      if (appointmentResult.doctorUnavailable) {

        return appointmentHelpers
        .sendDoctorUnavailableResponse(res);

      }

      if (appointmentResult.existingPatientAppointment) {

        return appointmentHelpers
        .sendPatientDuplicateAppointmentResponse(res);

      }

      if (appointmentResult.existingAppointment) {

        return appointmentHelpers
        .sendDoctorSlotUnavailableResponse(res);

      }

      const { appointment } =
        appointmentResult;
         const doctor =
  await userModel.findById(
    doctorId
  );

const patient =
  await userModel.findById(
    req.user.userId
  );

sendEmailInBackground(

  patient.email,

  "Appointment Booked Successfully",

  `Your appointment with Dr. ${doctor.name}
has been booked successfully.

Date: ${appointmentDate}

Time: ${appointmentTime}

Reason: ${reason}

Status: pending`

);

sendEmailInBackground(

  doctor.email,

  "New Appointment Request",

  `A new appointment request is waiting for you.

Patient: ${patient.name}

Date: ${appointmentDate}

Time: ${appointmentTime}

Reason: ${reason}

Status: pending`

);

      const populatedAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          appointment._id
        );

      notifyAppointmentsChanged({
        appointmentId:
          appointment._id,
        action: "appointment-created"
      });

      return appointmentHelpers
      .sendAppointmentCreatedResponse(
        res,
        "Appointment booked successfully",
        populatedAppointment
      );

    } catch (error) {

      return appointmentHelpers
      .sendServerErrorResponse(
        res,
        error
      );

    }

  }
);

patientRoute.get(

  "/specializations",

  verifyToken("patient"),

  async (req, res) => {

    try {

      const specializations =
        await userModel.distinct(
          "specialization",
          {
            role: "doctor",
            isActive: true,
            specialization: {
              $nin: [
                null,
                ""
              ]
            }
          }
        );

      return res.status(200).json({
        success: true,
        payload: specializations
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

patientRoute.get(

  "/doctors",

  verifyToken("patient"),

  async (req, res) => {

    try {

      const query = {
        role: "doctor",
        isActive: true
      };

      if (req.query.specialization) {

        query.specialization =
          req.query.specialization;

      }

      const doctors =
        await userModel
          .find(query)
          .select(
            "name email phone specialization experience profilePhoto unavailableDates"
          )
          .sort({
            name: 1
          });

      return res.status(200).json({
        success: true,
        payload: doctors
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

patientRoute.put(

  "/cancel-appointment/:appointmentId",

  verifyToken("patient"),

  async (req, res) => {

    try {

      // Get appointment ID
      const appointmentId =
        req.params.appointmentId;

      // Find appointment
      const appointment =
        await appointmentHelpers
        .findAppointmentById(
          appointmentId
        );

      // Check appointment exists
      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

      }

      // SECURITY CHECK
      // Patient can only cancel
      // own appointments

      if (

        appointment.patientId.toString()

        !==

        req.user.userId

      ) {

        return res.status(403).json({

          message:
            "You can only cancel your own appointments"

        });

      }

      const cancelResult =
        await appointmentHelpers
        .cancelAppointmentWithValidation(
          appointment
        );

      if (cancelResult.cancellationError) {

        return appointmentHelpers
        .sendAppointmentCancellationError(
          res,
          cancelResult.cancellationError
        );

      }

      const populatedAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          appointmentId
        );

      notifyAppointmentsChanged({
        appointmentId,
        action: "appointment-cancelled"
      });

      return appointmentHelpers
      .sendAppointmentCancelledResponse(
        res,
        populatedAppointment
      );

    } catch (error) {

      return appointmentHelpers
      .sendServerErrorResponse(
        res,
        error
      );

    }

  }
);

patientRoute.get(

  "/medical-history",

  verifyToken("patient"),

  async (req, res) => {

    try {

      const appointments =
        await appointmentModel
          .find({
            patientId: req.user.userId,
            $or: [
              {
                status: "completed"
              },
              {
                prescriptions: {
                  $ne: []
                }
              },
              {
                doctorReports: {
                  $ne: []
                }
              },
              {
                doctorNotes: {
                  $ne: []
                }
              }
            ]
          })
          .populate(
            "doctorId",
            "name email phone specialization profilePhoto"
          )
          .sort({
            appointmentDate: -1,
            appointmentTime: -1
          });

      return appointmentHelpers
      .sendAppointmentsResponse(
        res,
        appointments
      );

    } catch (error) {

      return appointmentHelpers
      .sendServerErrorResponse(
        res,
        error
      );

    }

  }

);

patientRoute.put(

  "/profile",

  verifyToken("patient"),

  upload.single("profilePhoto"),

  async (req, res) => {

    let cloudinaryResult;

    try {

      const patient =
        await userModel.findById(
          req.user.userId
        );

      if (!patient) {

        return res.status(404).json({
          message: "Patient not found"
        });

      }

      const normalizedEmail =
        req.body.email?.toLowerCase()?.trim();

      if (
        normalizedEmail &&
        normalizedEmail !== patient.email
      ) {

        const emailExists =
          await userModel.findOne({
            email:
              normalizedEmail,
            _id: {
              $ne: patient._id
            }
          });

        if (emailExists) {

          return res.status(400).json({
            message: "Email already exists"
          });

        }

        patient.email = normalizedEmail;
        patient.isVerified = false;

      }

      [
        "name",
        "phone",
        "age",
        "gender"
      ].forEach((field) => {

        if (
          req.body[field] !== undefined &&
          req.body[field] !== ""
        ) {

          patient[field] = req.body[field];

        }

      });

      if (req.file) {

        cloudinaryResult =
          await uploadToCloudinary(
            req.file.buffer
          );

        patient.profilePhoto =
          cloudinaryResult.secure_url;

      }

      await patient.save();

      const patientObj =
        patient.toObject();

      delete patientObj.password;
      delete patientObj.resetPasswordToken;
      delete patientObj.resetPasswordExpires;

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        payload: patientObj
      });

    } catch (error) {

      if (
        cloudinaryResult?.public_id
      ) {

        await cloudinary
        .uploader
        .destroy(
          cloudinaryResult.public_id
        );

      }

      return appointmentHelpers
      .sendServerErrorResponse(
        res,
        error
      );

    }

  }

);

patientRoute.post(

  "/appointments/:appointmentId/reports",

  verifyToken("patient"),

  upload.single("report"),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          message: "Report file is required"
        });

      }

      const appointment =
        await appointmentHelpers
        .findAppointmentById(
          req.params.appointmentId
        );

      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

      }

      if (
        appointment.patientId.toString() !==
        req.user.userId
      ) {

        return res.status(403).json({
          message:
            "You can only upload reports for your own appointments"
        });

      }

      const uploadResult =
        await uploadToCloudinary(
          req.file.buffer
        );

      appointment.patientReports.push({
        title:
          req.body.title ||
          req.file.originalname,
        fileUrl:
          uploadResult.secure_url
      });

      await appointment.save();

      const populatedAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      notifyAppointmentsChanged({
        appointmentId:
          req.params.appointmentId,
        action: "patient-report-added"
      });

      return res.status(200).json({
        success: true,
        message: "Report uploaded successfully",
        payload: populatedAppointment
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

patientRoute.get(

  "/my-appointments",

  verifyToken("patient"),

  async (req, res) => {

    try {

      // Find patient's appointments
      const appointments =
        await appointmentModel.find({

          patientId:
            req.user.userId

        })

        .populate(

          "doctorId",

          "name email phone specialization profilePhoto"

        )

        .sort({
          createdAt: -1
        });

      return appointmentHelpers
      .sendAppointmentsResponse(
        res,
        appointments
      );

    } catch (error) {

      return appointmentHelpers
      .sendServerErrorResponse(
        res,
        error
      );

    }

  }
);

patientRoute.delete(

  "/appointments/:appointmentId/reports/:reportId",

  verifyToken("patient"),

  async (req, res) => {

    try {

      const appointment =
        await appointmentHelpers
        .findAppointmentById(
          req.params.appointmentId
        );

      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

      }

      if (
        appointment.patientId.toString() !==
        req.user.userId
      ) {

        return res.status(403).json({
          message:
            "You can only delete your own reports"
        });

      }

      const beforeCount =
        appointment.patientReports.length;

      appointment.patientReports =
        appointment.patientReports.filter(
          (report) =>
            report._id.toString() !==
            req.params.reportId
        );

      if (
        appointment.patientReports.length ===
        beforeCount
      ) {

        return res.status(404).json({
          message: "Report not found"
        });

      }

      await appointment.save();

      const populatedAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      notifyAppointmentsChanged({
        appointmentId:
          req.params.appointmentId,
        action: "patient-report-deleted"
      });

      return res.status(200).json({
        success: true,
        message: "Report deleted successfully",
        payload: populatedAppointment
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

