import { appointmentModel } from "../Models/appointmentModel.js";
import { userModel } from "../Models/userModel.js";
import mongoose from "mongoose";

export const isValidObjectId =
  (value) =>
    mongoose.Types.ObjectId.isValid(value);

export const normalizeId =
  (value) =>
    value?.toString();

export const APPOINTMENT_STATUSES = [
  "pending",
  "approved",
  "accepted",
  "rejected",
  "completed",
  "cancelled"
];

export const normalizeAppointmentStatus =
  (status) =>
    status;

const statusTransitions = {
  pending: [
    "approved",
    "accepted",
    "rejected",
    "cancelled"
  ],
  approved: [
    "completed",
    "rejected",
    "cancelled"
  ],
  accepted: [
    "completed",
    "rejected",
    "cancelled"
  ],
  rejected: [],
  completed: [],
  cancelled: []
};

export const getAllowedStatusTransitions =
  (currentStatus) =>
    statusTransitions[currentStatus] || [];

export const validateStatusTransition =
  (currentStatus, requestedStatus) => {

    const normalizedCurrentStatus =
      normalizeAppointmentStatus(
        currentStatus
      );

    const normalizedStatus =
      normalizeAppointmentStatus(
        requestedStatus
      );

    if (
      !APPOINTMENT_STATUSES.includes(
        normalizedStatus
      )
    ) {

      return {
        status: 400,
        message: "Invalid status"
      };

    }

    if (normalizedCurrentStatus === normalizedStatus) {

      return {
        normalizedStatus
      };

    }

    const allowedTransitions =
      getAllowedStatusTransitions(
        normalizedCurrentStatus
      );

    if (
      !allowedTransitions.includes(
        normalizedStatus
      )
    ) {

      return {
        status: 400,
        message:
          `Cannot change appointment from ${currentStatus} to ${normalizedStatus}`
      };

    }

    return {
      normalizedStatus
    };

  };

export const getAppointmentDateTime =
  (appointmentDate, appointmentTime) =>
    new Date(`${appointmentDate}T${appointmentTime}`);

export const isAppointmentTimeWithinClinicHours =
  (appointmentTime) => {

    const [hours, minutes = "0"] =
      appointmentTime.split(":");

    const totalMinutes =
      Number(hours) * 60 + Number(minutes);

    return (
      totalMinutes >= 9 * 60 &&
      totalMinutes <= 21 * 60
    );

  };

export const validateAppointmentSchedule =
  (appointmentDate, appointmentTime) => {

    if (
      !appointmentDate ||
      !appointmentTime
    ) {

      return {
        status: 400,
        message: "Appointment date and time are required"
      };

    }

    const appointmentDateTime =
      getAppointmentDateTime(
        appointmentDate,
        appointmentTime
      );

    if (
      Number.isNaN(
        appointmentDateTime.getTime()
      )
    ) {

      return {
        status: 400,
        message: "Invalid appointment date or time"
      };

    }

    if (appointmentDateTime <= new Date()) {

      return {
        status: 400,
        message: "Appointment must be scheduled for a future date and time"
      };

    }

    if (
      !isAppointmentTimeWithinClinicHours(
        appointmentTime
      )
    ) {

      return {
        status: 400,
        message: "Appointments can be booked between 9 AM and 9 PM"
      };

    }

    return null;

  };

export const findActiveDoctorAppointment =
  ({
    doctorId,
    appointmentDate,
    appointmentTime,
    excludeAppointmentId
  }) => {

    const query = {

      doctorId,

      appointmentDate,

      appointmentTime,

      status: {
        $nin: [
          "cancelled",
          "rejected"
        ]
      }

    };

    if (excludeAppointmentId) {

      query._id = {
        $ne: excludeAppointmentId
      };

    }

    return appointmentModel.findOne(query);

  };

export const findActivePatientAppointment =
  ({
    patientId,
    appointmentDate,
    appointmentTime,
    excludeAppointmentId
  }) => {

    const query = {

      patientId,

      appointmentDate,

      appointmentTime,

      status: {
        $nin: [
          "cancelled",
          "rejected"
        ]
      }

    };

    if (excludeAppointmentId) {

      query._id = {
        $ne: excludeAppointmentId
      };

    }

    return appointmentModel.findOne(query);

  };

export const isDoctorUnavailable =
  async ({
    doctorId,
    appointmentDate
  }) => {

    const doctor =
      await userModel.findOne({
        _id: doctorId,
        role: "doctor",
        isActive: true
      });

    if (!doctor) {

      return {
        doctorNotFound: true
      };

    }

    return {
      unavailable:
        doctor.unavailableDates
        ?.includes(appointmentDate)
    };

  };

export const createPendingAppointment =
  (appointmentData) => appointmentModel.create({

    ...appointmentData,

    status: "pending"

  });

export const createPendingAppointmentIfSlotAvailable =
  async ({
    doctorId,
    patientId,
    appointmentDate,
    appointmentTime,
    appointmentData
  }) => {

    if (
      !isValidObjectId(doctorId) ||
      !isValidObjectId(patientId)
    ) {

      return {
        scheduleError: {
          status: 400,
          message: "Valid patient and doctor are required"
        }
      };

    }

    if (!appointmentData.reason?.trim()) {

      return {
        scheduleError: {
          status: 400,
          message: "Appointment reason is required"
        }
      };

    }

    const scheduleError =
      validateAppointmentSchedule(
        appointmentDate,
        appointmentTime
      );

    if (scheduleError) {

      return {
        scheduleError
      };

    }

    const doctorAvailability =
      await isDoctorUnavailable({
        doctorId,
        appointmentDate
      });

    if (doctorAvailability.doctorNotFound) {

      return {
        doctorNotFound: true
      };

    }

    if (doctorAvailability.unavailable) {

      return {
        doctorUnavailable: true
      };

    }

    const existingPatientAppointment =
      await findActivePatientAppointment({
        patientId,
        appointmentDate,
        appointmentTime
      });

    if (existingPatientAppointment) {

      return {
        existingPatientAppointment
      };

    }

    const existingAppointment =
      await findActiveDoctorAppointment({
        doctorId,
        appointmentDate,
        appointmentTime
      });

    if (existingAppointment) {

      return {
        existingAppointment
      };

    }

    const appointment =
      await createPendingAppointment(
        {
          ...appointmentData,
          reason:
            appointmentData.reason.trim()
        }
      );

    return {
      appointment
    };

  };

export const rescheduleAppointmentIfSlotAvailable =
  async ({
    appointment,
    appointmentDate,
    appointmentTime,
    doctorId
  }) => {

    if (
      [
        "cancelled",
        "completed"
      ].includes(appointment.status)
    ) {

      return {
        scheduleError: {
          status: 400,
          message:
            "Cancelled or completed appointments cannot be rescheduled"
        }
      };

    }

    const nextDoctorId =
      doctorId || normalizeId(appointment.doctorId);

    if (!isValidObjectId(nextDoctorId)) {

      return {
        scheduleError: {
          status: 400,
          message: "Valid doctor is required"
        }
      };

    }

    const scheduleError =
      validateAppointmentSchedule(
        appointmentDate,
        appointmentTime
      );

    if (scheduleError) {

      return {
        scheduleError
      };

    }

    const doctorAvailability =
      await isDoctorUnavailable({
        doctorId:
          nextDoctorId,
        appointmentDate
      });

    if (doctorAvailability.doctorNotFound) {

      return {
        doctorNotFound: true
      };

    }

    if (doctorAvailability.unavailable) {

      return {
        doctorUnavailable: true
      };

    }

    const existingPatientAppointment =
      await findActivePatientAppointment({
        patientId:
          appointment.patientId,
        appointmentDate,
        appointmentTime,
        excludeAppointmentId:
          appointment._id
      });

    if (existingPatientAppointment) {

      return {
        existingPatientAppointment
      };

    }

    const existingAppointment =
      await findActiveDoctorAppointment({
        doctorId:
          nextDoctorId,
        appointmentDate,
        appointmentTime,
        excludeAppointmentId:
          appointment._id
      });

    if (existingAppointment) {

      return {
        existingAppointment
      };

    }

    const updatedAppointment =
      await appointmentModel
        .findByIdAndUpdate(
          appointment._id,
          {
            appointmentDate,
            appointmentTime,
            doctorId:
              nextDoctorId,
            status: "pending",
            reminderSent: {
              oneDay: false,
              fourHours: false,
              thirtyMinutes: false
            }
          },
          {
            new: true,
            runValidators: true
          }
        )
        .populate(
          "patientId",
          "name age phone email profilePhoto"
        )
        .populate(
          "doctorId",
          "name phone email specialization profilePhoto"
        );

    return {
      appointment:
        updatedAppointment
    };

  };

export const findAppointmentById =
  (appointmentId) =>
    appointmentModel.findById(appointmentId);

export const findAppointmentWithPeopleById =
  (appointmentId) =>
    appointmentModel
      .findById(appointmentId)
      .populate(
        "patientId",
        "name age phone email profilePhoto"
      )
      .populate(
        "doctorId",
        "name phone email specialization profilePhoto"
      );

export const getCancellationError =
  (appointment) => {

    if (appointment.status === "cancelled") {

      return {
        status: 400,
        message: "Appointment already cancelled"
      };

    }

    if (appointment.status === "completed") {

      return {
        status: 400,
        message: "Completed appointment cannot be cancelled"
      };

    }

    return null;

  };

export const cancelAppointment =
  async (appointment) => {

    appointment.status = "cancelled";

    await appointment.save();

    return appointment;

  };

export const cancelAppointmentWithValidation =
  async (appointment) => {

    const cancellationError =
      getCancellationError(appointment);

    if (cancellationError) {

      return {
        cancellationError
      };

    }

    const cancelledAppointment =
      await cancelAppointment(appointment);

    return {
      cancelledAppointment
    };

  };

export const sendDoctorSlotUnavailableResponse =
  (res) =>
    res.status(400).json({
      message:
        "Doctor already has appointment at this time"
    });

export const sendPatientDuplicateAppointmentResponse =
  (res) =>
    res.status(400).json({
      message:
        "Patient already has an active appointment at this time"
    });

export const sendDoctorUnavailableResponse =
  (res) =>
    res.status(400).json({
      message:
        "Doctor is unavailable on this date"
    });

export const sendScheduleErrorResponse =
  (res, scheduleError) =>
    res.status(scheduleError.status).json({
      message:
        scheduleError.message
    });

export const sendAppointmentNotFoundResponse =
  (res) =>
    res.status(404).json({
      message:
        "Appointment not found"
    });

export const sendAppointmentCancellationError =
  (res, cancellationError) =>
    res.status(cancellationError.status).json({
      message:
        cancellationError.message
    });

export const sendAppointmentCreatedResponse =
  (res, message, appointment) =>
    res.status(201).json({

      success: true,

      message,

      payload: appointment

    });

export const sendAppointmentCancelledResponse =
  (res, appointment) =>
    res.status(200).json({

      success: true,

      message:
        "Appointment cancelled successfully",

      payload: appointment

    });

export const sendServerErrorResponse =
  (res, error) => {

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {

      return res.status(400).json({
        success: false,
        message:
          error.message
      });

    }

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  };

export const sendAppointmentsResponse =
  (res, appointments) =>
    res.status(200).json({

      success: true,

      totalAppointments:
        appointments.length,

      payload: appointments

    });
