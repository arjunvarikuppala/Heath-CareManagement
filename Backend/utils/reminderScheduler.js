import { appointmentModel } from "../Models/appointmentModel.js";
import { sendEmail } from "./sendEmail.js";
import { getAppointmentDateTime } from "./appointmentHelpers.js";

const reminderWindows = [
  {
    key: "oneDay",
    label: "one day",
    milliseconds: 24 * 60 * 60 * 1000
  },
  {
    key: "fourHours",
    label: "4 hours",
    milliseconds: 4 * 60 * 60 * 1000
  },
  {
    key: "thirtyMinutes",
    label: "30 minutes",
    milliseconds: 30 * 60 * 1000
  }
];

const sendDueAppointmentReminders =
  async () => {

    const now =
      new Date();

    const appointments =
      await appointmentModel
        .find({
          status: {
            $in: [
              "pending",
              "approved",
              "accepted"
            ]
          }
        })
        .populate(
          "patientId",
          "name email"
        )
        .populate(
          "doctorId",
          "name specialization"
        );

    for (const appointment of appointments) {

      const appointmentDateTime =
        getAppointmentDateTime(
          appointment.appointmentDate,
          appointment.appointmentTime
        );

      const timeUntilAppointment =
        appointmentDateTime.getTime() -
        now.getTime();

      if (timeUntilAppointment <= 0) {

        continue;

      }

      for (const reminderWindow of reminderWindows) {

        const alreadySent =
          appointment.reminderSent?.[
            reminderWindow.key
          ];

        if (
          alreadySent ||
          timeUntilAppointment >
            reminderWindow.milliseconds
        ) {

          continue;

        }

        await sendEmail(
          appointment.patientId.email,
          "Appointment Reminder",
          `This is your ${reminderWindow.label} appointment reminder.

Doctor: Dr. ${appointment.doctorId.name}

Date: ${appointment.appointmentDate}

Time: ${appointment.appointmentTime}

Status: ${appointment.status}`
        );

        appointment.reminderSent[
          reminderWindow.key
        ] = true;

        await appointment.save();

      }

    }

  };

export const startAppointmentReminderScheduler =
  () => {

    sendDueAppointmentReminders().catch(
      (error) =>
        console.log(
          "REMINDER ERROR:",
          error.message
        )
    );

    setInterval(
      () => {

        sendDueAppointmentReminders().catch(
          (error) =>
            console.log(
              "REMINDER ERROR:",
              error.message
            )
        );

      },
      15 * 60 * 1000
    );

  };
