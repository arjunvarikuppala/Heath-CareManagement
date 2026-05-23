import {
  CalendarDays,
  HeartPulse,
  Search,
  UserPlus
} from "lucide-react";

import axios from "axios";
import { useEffect, useState } from "react";
import AppointmentCalendar, {
  StatusDot
} from "../Components/AppointmentCalendar";
import RoleShell from "../Components/RoleShell";
import {
  subscribeAppointmentEvents
} from "../api/appointmentEvents";

const BASE_URL =
  import.meta.env.VITE_API_URL;

const navItems = [
  {
    id: "overview",
    label: "Overview",
    Icon: HeartPulse
  },
  {
    id: "book",
    label: "Walk-in Booking",
    Icon: UserPlus
  },
  {
    id: "calendar",
    label: "Calendar",
    Icon: CalendarDays
  },
  {
    id: "search",
    label: "Search",
    Icon: Search
  }
];

const fieldClass =
  "w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-400";

function ReceptionistDashboard() {

  const [activeTab, setActiveTab] =
    useState("overview");
  const [patients, setPatients] =
    useState([]);
  const [doctors, setDoctors] =
    useState([]);
  const [appointments, setAppointments] =
    useState([]);
  const [message, setMessage] =
    useState("");
  const [patientSearch, setPatientSearch] =
    useState("");
  const [doctorSearch, setDoctorSearch] =
    useState("");
  const [booking, setBooking] =
    useState({
      patientId: "",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: ""
    });
  const [reschedule, setReschedule] =
    useState({});
  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [rescheduleLoading, setRescheduleLoading] =
    useState({});
  const [cancelLoading, setCancelLoading] =
    useState({});

  const searchPatients =
    async (search = patientSearch) => {

      const res =
        await axios.get(
          `${BASE_URL}/receptionist-api/patients`,
          {
            params: {
              search
            },
            withCredentials: true
          }
        );

      setPatients(res.data.payload || []);

    };

  const searchDoctors =
    async (search = doctorSearch) => {

      const res =
        await axios.get(
          `${BASE_URL}/receptionist-api/doctors`,
          {
            params: {
              search
            },
            withCredentials: true
          }
        );

      setDoctors(res.data.payload || []);

    };

  const loadAppointments =
    async (params = {}) => {

      const res =
        await axios.get(
          `${BASE_URL}/receptionist-api/appointments`,
          {
            params,
            withCredentials: true
          }
        );

      setAppointments(res.data.payload || []);

      return res.data.payload || [];

    };

  useEffect(() => {

    Promise.all([
      // eslint-disable-next-line react-hooks/set-state-in-effect
      searchPatients(""),
      searchDoctors(""),
      loadAppointments()
    ]).catch((error) =>
      setMessage(
        error.response?.data?.message ||
        "Unable to load receptionist dashboard"
      )
    );

    const intervalId =
      setInterval(
        () => loadAppointments().catch(() => {}),
        10000
      );

    const focusRefresh =
      () => loadAppointments().catch(() => {});
    const unsubscribeEvents =
      subscribeAppointmentEvents(
        () => loadAppointments().catch(() => {})
      );

    window.addEventListener(
      "focus",
      focusRefresh
    );

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "focus",
        focusRefresh
      );
      unsubscribeEvents();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAppointment =
    async (event) => {

      event.preventDefault();

      if (bookingLoading) {
        return;
      }

      try {

        setBookingLoading(true);
        setMessage("");

        const res =
          await axios.post(
          `${BASE_URL}/receptionist-api/create-appointment`,
          booking,
          {
            withCredentials: true
          }
        );

        setBooking({
          patientId: "",
          doctorId: "",
          appointmentDate: "",
          appointmentTime: "",
          reason: ""
        });
        setMessage("Walk-in appointment created");
        setAppointments((current) => [
          res.data.payload,
          ...current
        ]);

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to create appointment"
        );

      }
      finally {

        setBookingLoading(false);

      }

    };

  const cancelAppointment =
    async (appointmentId) => {

      if (cancelLoading[appointmentId]) {
        return;
      }

      try {

        setCancelLoading((current) => ({
          ...current,
          [appointmentId]: true
        }));

        const res =
          await axios.put(
          `${BASE_URL}/receptionist-api/cancel-appointment/${appointmentId}`,
          {},
          {
            withCredentials: true
          }
        );

        setMessage("Appointment cancelled");
        setAppointments((current) =>
          current.map((appointment) =>
            appointment._id === appointmentId
              ? {
                  ...appointment,
                  ...res.data.payload
                }
              : appointment
          )
        );

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to cancel appointment"
        );

      } finally {

        setCancelLoading((current) => ({
          ...current,
          [appointmentId]: false
        }));

      }

    };

  const rescheduleAppointment =
    async (appointment) => {

      const appointmentId =
        appointment._id;

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

      if (!payload.appointmentDate || !payload.appointmentTime) {
        setMessage("Choose date and time to reschedule");
        return;
      }

      if (rescheduleLoading[appointmentId]) {
        return;
      }

      try {

        setRescheduleLoading((current) => ({
          ...current,
          [appointmentId]: true
        }));
        setMessage("");

        const res =
          await axios.put(
          `${BASE_URL}/receptionist-api/reschedule-appointment/${appointmentId}`,
          payload,
          {
            withCredentials: true
          }
        );

        setMessage("Appointment rescheduled and status reset to pending");
        setAppointments((current) =>
          current.map((currentAppointment) =>
            currentAppointment._id === appointmentId
              ? res.data.payload
              : currentAppointment
          )
        );

        setReschedule((current) => ({
          ...current,
          [appointmentId]: {
            appointmentDate:
              res.data.payload.appointmentDate,
            appointmentTime:
              res.data.payload.appointmentTime,
            doctorId:
              res.data.payload.doctorId?._id
          }
        }));

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

  const filterByPatient =
    async (patientId) => {

      setBooking({
        ...booking,
        patientId
      });
      await loadAppointments({
        patientId
      });

    };

  const filterByDoctor =
    async (doctorId) => {

      setBooking({
        ...booking,
        doctorId
      });
      await loadAppointments({
        doctorId
      });

    };

  return (

    <RoleShell
      title="Receptionist"
      subtitle="Front Desk"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >

      <h1 className="text-4xl font-black">
        Receptionist Dashboard
      </h1>
      <p className="text-gray-400 mt-2">
        Book walk-ins, search schedules, and cancel appointments during emergencies.
      </p>

      {message && (
        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
          {message}
        </div>
      )}

      {activeTab === "overview" && (
        <>
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <Metric label="Patients Found" value={patients.length} />
            <Metric label="Doctors Found" value={doctors.length} />
            <Metric label="Visible Appointments" value={appointments.length} />
          </div>
          <AppointmentCalendar
            appointments={appointments}
            title="Front Desk Appointment Calendar"
          />
        </>
      )}

      {activeTab === "book" && (
        <form onSubmit={createAppointment} className="mt-8 grid lg:grid-cols-2 gap-5 rounded-2xl border border-white/10 bg-white/5 p-6">
          <select
            required
            value={booking.patientId}
            onChange={(event) =>
              setBooking({
                ...booking,
                patientId: event.target.value
              })
            }
            className={fieldClass}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name} - {patient.phone}
              </option>
            ))}
          </select>
          <select
            required
            value={booking.doctorId}
            onChange={(event) =>
              setBooking({
                ...booking,
                doctorId: event.target.value
              })
            }
            className={fieldClass}
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
          <input
            required
            type="date"
            value={booking.appointmentDate}
            onChange={(event) =>
              setBooking({
                ...booking,
                appointmentDate: event.target.value
              })
            }
            className={fieldClass}
          />
          <input
            required
            type="time"
            min="09:00"
            max="21:00"
            value={booking.appointmentTime}
            onChange={(event) =>
              setBooking({
                ...booking,
                appointmentTime: event.target.value
              })
            }
            className={fieldClass}
          />
          <textarea
            required
            placeholder="Reason"
            value={booking.reason}
            onChange={(event) =>
              setBooking({
                ...booking,
                reason: event.target.value
              })
            }
            className="lg:col-span-2 min-h-28 rounded-2xl bg-white/5 border border-white/10 p-4 outline-none focus:border-cyan-400"
          />
          <button
            disabled={bookingLoading}
            className="h-12 rounded-2xl bg-cyan-400 text-black font-black disabled:opacity-50"
          >
            {bookingLoading
              ? "Booking..."
              : "Book Walk-in Appointment"}
          </button>
        </form>
      )}

      {activeTab === "search" && (
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <SearchPanel
            title="Patients"
            value={patientSearch}
            setValue={setPatientSearch}
            onSearch={() => searchPatients()}
            items={patients}
            onSelect={filterByPatient}
            label={(patient) => `${patient.name} · ${patient.phone}`}
          />
          <SearchPanel
            title="Doctors"
            value={doctorSearch}
            setValue={setDoctorSearch}
            onSearch={() => searchDoctors()}
            items={doctors}
            onSelect={filterByDoctor}
            label={(doctor) => `Dr. ${doctor.name} · ${doctor.specialization}`}
          />
        </div>
      )}

      {(activeTab === "calendar" || activeTab === "search") && (
        <div className="mt-8 grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <p className="text-xl font-black">{appointment.patientId?.name}</p>
                  <p className="text-gray-400 mt-1">
                    Dr. {appointment.doctorId?.name} · {appointment.appointmentDate} · {appointment.appointmentTime}
                  </p>
                  <p className="text-gray-300 mt-3">{appointment.reason}</p>
                </div>
                <StatusDot status={appointment.status} />
              </div>
              <div className="mt-5 grid lg:grid-cols-5 gap-3">
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
                  className={fieldClass}
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
                  className={fieldClass}
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
                  className={fieldClass}
                />
                <button
                  onClick={() => rescheduleAppointment(appointment)}
                  disabled={rescheduleLoading[appointment._id]}
                  className="h-12 rounded-2xl bg-white/10 border border-white/10 font-black disabled:opacity-50"
                >
                  {rescheduleLoading[appointment._id]
                    ? "Saving..."
                    : "Reschedule"}
                </button>
                <button
                  onClick={() => cancelAppointment(appointment._id)}
                  disabled={cancelLoading[appointment._id]}
                  className="h-12 rounded-2xl bg-red-500/15 border border-red-500/20 text-red-100 font-black disabled:opacity-50"
                >
                  {cancelLoading[appointment._id]
                    ? "Cancelling..."
                    : "Cancel"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </RoleShell>

  );

}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <p className="text-gray-400">{label}</p>
      <p className="text-4xl font-black mt-3">{value}</p>
    </div>
  );
}

function SearchPanel({
  title,
  value,
  setValue,
  onSearch,
  items,
  onSelect,
  label
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xl font-black">{title}</p>
      <div className="flex gap-3 mt-4">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={fieldClass}
          placeholder={`Search ${title.toLowerCase()}`}
        />
        <button
          onClick={onSearch}
          className="h-12 px-5 rounded-2xl bg-cyan-400 text-black font-black"
        >
          Search
        </button>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <button
            key={item._id}
            onClick={() => onSelect(item._id)}
            className="text-left rounded-2xl bg-black/20 p-4 hover:bg-white/10"
          >
            {label(item)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ReceptionistDashboard;
