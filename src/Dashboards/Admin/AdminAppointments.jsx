import axios from "axios";
import { useEffect, useState } from "react";
import {
  subscribeAppointmentEvents
} from "../../api/appointmentEvents";
import AppointmentCalendar, {
  StatusDot
} from "../../Components/AppointmentCalendar";

const BASE_URL =
  import.meta.env.VITE_API_URL;

function AdminAppointments() {

  const [appointments, setAppointments] =
    useState([]);
  const [doctors, setDoctors] =
    useState([]);
  const [reschedule, setReschedule] =
    useState({});
  const [rescheduleLoading, setRescheduleLoading] =
    useState({});
  const [message, setMessage] =
    useState("");

  useEffect(() => {

    const loadAppointments =
      async () => {

        try {

          const res =
            await axios.get(
              `${BASE_URL}/admin-api/appointments`,
              {
                withCredentials: true
              }
            );

          setAppointments(
            res.data.payload || []
          );

          return res.data.payload || [];

        } catch (error) {

          setMessage(
            error.response?.data?.message ||
            "Unable to load appointments"
          );

        }

      };

    const loadDoctors =
      async () => {

        const res =
          await axios.get(
            `${BASE_URL}/admin-api/doctors`,
            {
              withCredentials: true
            }
          );

        setDoctors(
          res.data.payload || []
        );

      };

    Promise.all([
      loadAppointments(),
      loadDoctors()
    ]).catch(() => {});

    const intervalId =
      setInterval(
        loadAppointments,
        10000
      );

    window.addEventListener(
      "focus",
      loadAppointments
    );

    const unsubscribeEvents =
      subscribeAppointmentEvents(
        () => loadAppointments()
      );

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "focus",
        loadAppointments
      );
      unsubscribeEvents();
    };

  }, []);

  const rescheduleAppointment =
    async (appointment) => {

      const appointmentId =
        appointment._id;

      if (rescheduleLoading[appointmentId]) {
        return;
      }

      const next =
        reschedule[appointmentId];

      const payload = {
        appointmentDate:
          next?.appointmentDate ||
          appointment.appointmentDate,
        appointmentTime:
          next?.appointmentTime ||
          appointment.appointmentTime,
        doctorId:
          next?.doctorId ||
          appointment.doctorId?._id ||
          appointment.doctorId
      };

      try {

        setRescheduleLoading((current) => ({
          ...current,
          [appointmentId]: true
        }));
        setMessage("");

        const res =
          await axios.put(
            `${BASE_URL}/admin-api/reschedule-appointment/${appointmentId}`,
            payload,
            {
              withCredentials: true
            }
          );

        setMessage("Appointment rescheduled and returned to pending");
        setAppointments((current) =>
          current.map((currentAppointment) =>
            currentAppointment._id === appointmentId
              ? res.data.payload
              : currentAppointment
          )
        );

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to reschedule appointment"
        );

      } finally {

        setRescheduleLoading((current) => ({
          ...current,
          [appointmentId]: false
        }));

      }

    };

  return (
    <div className="p-10">
      <h1 className="text-5xl font-black">
        Appointments
      </h1>
      <p className="text-gray-400 mt-3 text-lg">
        View all hospital appointments in one place.
      </p>

      {message && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          {message}
        </div>
      )}

      <AppointmentCalendar
        appointments={appointments}
        title="Hospital Appointment Calendar"
      />

      <div className="mt-8 grid gap-4">
        {appointments.map((appointment) => (
          <div
            key={appointment._id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xl font-black">
                  {appointment.patientId?.name} with Dr. {appointment.doctorId?.name}
                </p>
                <p className="mt-1 text-gray-400">
                  {appointment.appointmentDate} · {appointment.appointmentTime}
                </p>
                <p className="mt-3 text-gray-300">
                  {appointment.reason}
                </p>
              </div>
              <StatusDot status={appointment.status} />
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-4">
              <select
                value={
                  reschedule[appointment._id]?.doctorId ||
                  appointment.doctorId?._id ||
                  appointment.doctorId ||
                  ""
                }
                onChange={(event) =>
                  setReschedule({
                    ...reschedule,
                    [appointment._id]: {
                      ...reschedule[appointment._id],
                      doctorId: event.target.value
                    }
                  })
                }
                className="h-12 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none"
              >
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={
                  reschedule[appointment._id]?.appointmentDate ||
                  appointment.appointmentDate
                }
                onChange={(event) =>
                  setReschedule({
                    ...reschedule,
                    [appointment._id]: {
                      ...reschedule[appointment._id],
                      appointmentDate: event.target.value
                    }
                  })
                }
                className="h-12 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none"
              />
              <input
                type="time"
                min="09:00"
                max="21:00"
                value={
                  reschedule[appointment._id]?.appointmentTime ||
                  appointment.appointmentTime
                }
                onChange={(event) =>
                  setReschedule({
                    ...reschedule,
                    [appointment._id]: {
                      ...reschedule[appointment._id],
                      appointmentTime: event.target.value
                    }
                  })
                }
                className="h-12 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none"
              />
              <button
                onClick={() => rescheduleAppointment(appointment)}
                disabled={rescheduleLoading[appointment._id]}
                className="h-12 rounded-2xl bg-cyan-400 text-black font-black disabled:opacity-50"
              >
                {rescheduleLoading[appointment._id]
                  ? "Saving..."
                  : "Reschedule"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}

export default AdminAppointments;
