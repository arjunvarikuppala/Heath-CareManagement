import exp from "express";
import { verifyToken }from "../middelWares/verifyToken.js";
import { appointmentModel }from "../Models/appointmentModel.js";
import { userModel }from "../Models/userModel.js";
import * as appointmentHelpers
from "../utils/appointmentHelpers.js";
import {
  notifyAppointmentsChanged
} from "../utils/appointmentEvents.js";
import {
  sendEmailInBackground
} from "../utils/sendEmail.js";

export const receptionistRoute =exp.Router();


receptionistRoute.post("/create-appointment",verifyToken("receptionist"),async (req, res) => {

    try {

      const {patientId,doctorId,appointmentDate,appointmentTime,reason} = req.body;

      // Check patient exists
      const patient =await userModel.findById(patientId);

      if (
        !patient ||
        patient.role !== "patient" ||
        !patient.isActive
      ) {

        return res.status(404).json({message:"Patient not found"});

      }

      // Check doctor exists
      const doctor =await userModel.findById(doctorId);

      if (
        !doctor ||
        doctor.role !== "doctor" ||
        !doctor.isActive
      ) {

        return res.status(404).json({
          message:
            "Doctor not found"
        });

      }

      const appointmentResult =
        await appointmentHelpers
        .createPendingAppointmentIfSlotAvailable({
          doctorId,
          patientId,
          appointmentDate,
          appointmentTime,
          appointmentData: {
            patientId,
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
        "Appointment created successfully",
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

// Receptionist can reschedule any appointment
receptionistRoute.put("/reschedule-appointment/:appointmentId",verifyToken("receptionist"),async (req, res) => {

    try {

      // Get appointment ID
      const appointmentId =
        req.params.appointmentId;

      // Get new schedule
      const {
        appointmentDate,
        appointmentTime,
        doctorId
      } = req.body;

      // Find appointment
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

      const populatedAppointment =
        rescheduleResult.appointment;

      sendEmailInBackground(
        populatedAppointment.patientId.email,
        "Appointment Rescheduled",
        `Your appointment has been rescheduled.

Doctor: Dr. ${populatedAppointment.doctorId.name}

Date: ${populatedAppointment.appointmentDate}

Time: ${populatedAppointment.appointmentTime}

Status: pending`
      );

      notifyAppointmentsChanged({
        appointmentId,
        action: "appointment-rescheduled",
        appointment: populatedAppointment
      });

      return res.status(200).json({

        success: true,

        message:
          "Appointment rescheduled successfully",

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

receptionistRoute.put(

  "/cancel-appointment/:appointmentId",

  verifyToken("receptionist"),

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

      // Check exists
      if (!appointment) {

        return appointmentHelpers
        .sendAppointmentNotFoundResponse(res);

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

receptionistRoute.get(

  "/patients",

  verifyToken("receptionist"),

  async (req, res) => {

    try {

      const search =
        req.query.search || "";

      const patients =
        await userModel
          .find({
            role: "patient",
            $or: [
              {
                name: {
                  $regex: search,
                  $options: "i"
                }
              },
              {
                email: {
                  $regex: search,
                  $options: "i"
                }
              },
              {
                phone: {
                  $regex: search,
                  $options: "i"
                }
              }
            ]
          })
          .select(
            "name age gender phone email profilePhoto"
          )
          .limit(20)
          .sort({
            name: 1
          });

      return res.status(200).json({
        success: true,
        payload: patients
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

receptionistRoute.get(

  "/doctors",

  verifyToken("receptionist"),

  async (req, res) => {

    try {

      const search =
        req.query.search || "";

      const doctors =
        await userModel
          .find({
            role: "doctor",
            isActive: true,
            $or: [
              {
                name: {
                  $regex: search,
                  $options: "i"
                }
              },
              {
                email: {
                  $regex: search,
                  $options: "i"
                }
              },
              {
                specialization: {
                  $regex: search,
                  $options: "i"
                }
              }
            ]
          })
          .select(
            "name phone email specialization experience profilePhoto unavailableDates"
          )
          .limit(20)
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

receptionistRoute.get(

  "/appointments",

  verifyToken("receptionist"),

  async (req, res) => {

    try {

      const query = {};

      if (req.query.patientId) {

        query.patientId =
          req.query.patientId;

      }

      if (req.query.doctorId) {

        query.doctorId =
          req.query.doctorId;

      }

      const appointments =
        await appointmentModel
          .find(query)
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

receptionistRoute.get(

  "/all-appointments",

  verifyToken("receptionist"),

  async (req, res) => {

    try {

      // Find all appointments
      const appointments =
        await appointmentModel.find()

        .populate(

          "patientId",

          "name age phone email"

        )

        .populate(

          "doctorId",

          "name phone email"

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
