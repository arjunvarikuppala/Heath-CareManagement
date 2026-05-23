import exp from "express";
import { verifyToken }from '../middelWares/verifyToken.js'
import { appointmentModel }from "../Models/appointmentModel.js";
import { userModel }from "../Models/userModel.js";
import * as appointmentHelpers
from "../utils/appointmentHelpers.js";
import { upload }from "../Config/multer.js";
import{uploadToCloudinary}
from "../Config/cloudinaryUpload.js";
import {
  sendEmailInBackground
} from "../utils/sendEmail.js";
import {
  notifyAppointmentsChanged
} from "../utils/appointmentEvents.js";

export const doctorRoute =exp.Router();

doctorRoute.get("/my-appointments",verifyToken("doctor"),async (req, res) => {

    try {

      // Find doctor's appointments
      const appointments =await appointmentModel.find({doctorId:req.user.userId}).
      populate("patientId","name age phone email profilePhoto").
      sort({
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

doctorRoute.put("/update-appointment-status/:appointmentId",verifyToken("doctor"),async (req, res) => {

    try {

      // Get appointment ID
      const appointmentId =
        req.params.appointmentId;

      const { status } = req.body;

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
      // Doctor can only update
      // their own appointments

      if (appointment.doctorId.toString()!==req.user.userId) {

        return res.status(403).json({message:"You can only update your own appointments"});

      }

      const transitionResult =
        appointmentHelpers
        .validateStatusTransition(
          appointment.status,
          status
        );

      if (transitionResult.status) {

        return res.status(
          transitionResult.status
        ).json({
          success: false,
          message:
            transitionResult.message
        });

      }

      // Update status
      appointment.status =
        transitionResult.normalizedStatus;

      await appointment.save();

      const fullAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          appointmentId
        );

      if (fullAppointment?.patientId?.email) {

        sendEmailInBackground(
          fullAppointment.patientId.email,
          `Appointment ${fullAppointment.status}`,
          `Your appointment with Dr. ${fullAppointment.doctorId.name} is now ${fullAppointment.status}.

Date: ${fullAppointment.appointmentDate}

Time: ${fullAppointment.appointmentTime}`
        );

      }

      notifyAppointmentsChanged({
        appointmentId,
        action: "status-updated",
        appointment:
          fullAppointment
      });

      return res.status(200).json({success: true,message:`Appointment ${fullAppointment.status} successfully`,payload: fullAppointment});

    } catch (error) {

      return appointmentHelpers
      .sendServerErrorResponse(
        res,
        error
      );

    }

  }
);

doctorRoute.get(

  "/patients/:patientId/history",

  verifyToken("doctor"),

  async (req, res) => {

    try {

      const hasVisitedDoctor =
        await appointmentModel.exists({
          doctorId: req.user.userId,
          patientId: req.params.patientId
        });

      if (!hasVisitedDoctor) {

        return res.status(403).json({
          message:
            "You can only view history for your own patients"
        });

      }

      const appointments =
        await appointmentModel
          .find({
            patientId: req.params.patientId
          })
          .populate(
            "doctorId",
            "name specialization email phone profilePhoto"
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

doctorRoute.post(

  "/appointments/:appointmentId/prescriptions",

  verifyToken("doctor"),

  upload.single("prescription"),

  async (req, res) => {

    try {

      const appointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

      }

      if (
        appointment.doctorId._id.toString() !==
        req.user.userId
      ) {

        return res.status(403).json({
          message:
            "You can only update your own appointments"
        });

      }

      let fileUrl = "";

      if (req.file) {

        const uploadResult =
          await uploadToCloudinary(
            req.file.buffer
          );

        fileUrl =
          uploadResult.secure_url;

      }

      appointment.prescriptions.push({
        title:
          req.body.title ||
          req.file?.originalname ||
          "Prescription",
        fileUrl,
        notes:
          req.body.notes || ""
      });

      await appointment.save();

      sendEmailInBackground(
        appointment.patientId.email,
        "Prescription Added",
        `Dr. ${appointment.doctorId.name} added a prescription to your appointment.

Notes: ${req.body.notes || "No notes added"}`
      );

      const populatedAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      notifyAppointmentsChanged({
        appointmentId:
          req.params.appointmentId,
        action: "prescription-added"
      });

      return res.status(200).json({
        success: true,
        message: "Prescription uploaded successfully",
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

doctorRoute.delete(

  "/appointments/:appointmentId/prescriptions/:prescriptionId",

  verifyToken("doctor"),

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
        appointment.doctorId.toString() !==
        req.user.userId
      ) {

        return res.status(403).json({
          message:
            "You can only delete your own prescriptions"
        });

      }

      const beforeCount =
        appointment.prescriptions.length;

      appointment.prescriptions =
        appointment.prescriptions.filter(
          (prescription) =>
            prescription._id.toString() !==
            req.params.prescriptionId
        );

      if (
        appointment.prescriptions.length ===
        beforeCount
      ) {

        return res.status(404).json({
          message: "Prescription not found"
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
        action: "prescription-deleted"
      });

      return res.status(200).json({
        success: true,
        message: "Prescription deleted successfully",
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

doctorRoute.post(

  "/appointments/:appointmentId/reports",

  verifyToken("doctor"),

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
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

      }

      if (
        appointment.doctorId._id.toString() !==
        req.user.userId
      ) {

        return res.status(403).json({
          message:
            "You can only update your own appointments"
        });

      }

      const uploadResult =
        await uploadToCloudinary(
          req.file.buffer
        );

      appointment.doctorReports.push({
        title:
          req.body.title ||
          req.file.originalname,
        fileUrl:
          uploadResult.secure_url
      });

      await appointment.save();

      sendEmailInBackground(
        appointment.patientId.email,
        "Report Added",
        `Dr. ${appointment.doctorId.name} added a report to your appointment.`
      );

      const populatedAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      notifyAppointmentsChanged({
        appointmentId:
          req.params.appointmentId,
        action: "doctor-report-added"
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

doctorRoute.delete(

  "/appointments/:appointmentId/reports/:reportId",

  verifyToken("doctor"),

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
        appointment.doctorId.toString() !==
        req.user.userId
      ) {

        return res.status(403).json({
          message:
            "You can only delete your own reports"
        });

      }

      const beforeCount =
        appointment.doctorReports.length;

      appointment.doctorReports =
        appointment.doctorReports.filter(
          (report) =>
            report._id.toString() !==
            req.params.reportId
        );

      if (
        appointment.doctorReports.length ===
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
        action: "doctor-report-deleted"
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

doctorRoute.post(

  "/appointments/:appointmentId/notes",

  verifyToken("doctor"),

  async (req, res) => {

    try {

      const appointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

      }

      if (
        appointment.doctorId._id.toString() !==
        req.user.userId
      ) {

        return res.status(403).json({
          message:
            "You can only update your own appointments"
        });

      }

      if (!req.body.text) {

        return res.status(400).json({
          message: "Note text is required"
        });

      }

      appointment.doctorNotes.push({
        text: req.body.text
      });

      await appointment.save();

      sendEmailInBackground(
        appointment.patientId.email,
        "Doctor Note Added",
        `Dr. ${appointment.doctorId.name} sent you a note:

${req.body.text}`
      );

      const populatedAppointment =
        await appointmentHelpers
        .findAppointmentWithPeopleById(
          req.params.appointmentId
        );

      notifyAppointmentsChanged({
        appointmentId:
          req.params.appointmentId,
        action: "doctor-note-added"
      });

      return res.status(200).json({
        success: true,
        message: "Note sent successfully",
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

doctorRoute.put(

  "/unavailable-dates",

  verifyToken("doctor"),

  async (req, res) => {

    try {

      const {
        date,
        action = "add"
      } = req.body;

      if (!date) {

        return res.status(400).json({
          message: "Date is required"
        });

      }

      const doctor =
        await userModel.findById(
          req.user.userId
        );

      if (!doctor) {

        return res.status(404).json({
          message: "Doctor not found"
        });

      }

      if (action === "remove") {

        doctor.unavailableDates =
          doctor.unavailableDates.filter(
            (unavailableDate) =>
              unavailableDate !== date
          );

      } else if (
        !doctor.unavailableDates.includes(date)
      ) {

        doctor.unavailableDates.push(date);

      }

      await doctor.save();

      return res.status(200).json({
        success: true,
        message: "Availability updated successfully",
        payload: doctor.unavailableDates
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
