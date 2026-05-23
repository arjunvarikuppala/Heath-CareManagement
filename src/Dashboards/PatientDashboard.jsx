import {
  CalendarDays,
  ClipboardList,
  FileUp,
  HeartPulse,
  History,
  Stethoscope,
  UserRound
} from "lucide-react";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppointmentCalendar, {
  StatusDot
} from "../Components/AppointmentCalendar";
import RoleShell from "../Components/RoleShell";
import {
  subscribeAppointmentEvents
} from "../api/appointmentEvents";
import { useAuthStore } from "../store/AuthStore";

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
    label: "Book Appointment",
    Icon: CalendarDays
  },
  {
    id: "doctors",
    label: "Doctors",
    Icon: Stethoscope
  },
  {
    id: "appointments",
    label: "Appointments",
    Icon: ClipboardList
  },
  {
    id: "history",
    label: "Medical History",
    Icon: History
  },
  {
    id: "profile",
    label: "Profile",
    Icon: UserRound
  }
];

const fieldClass =
  "w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-400";

function PatientDashboard() {

  const {
    currentUser
  } = useAuthStore();

  const [activeTab, setActiveTab] =
    useState("overview");
  const [appointments, setAppointments] =
    useState([]);
  const [history, setHistory] =
    useState([]);
  const [specializations, setSpecializations] =
    useState([]);
  const [doctors, setDoctors] =
    useState([]);
  const [selectedSpecialization, setSelectedSpecialization] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [booking, setBooking] =
    useState({
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: ""
    });
  const [profile, setProfile] =
    useState({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      age: currentUser?.age || "",
      gender: currentUser?.gender || "male",
      email: currentUser?.email || ""
    });
  const [reportFiles, setReportFiles] =
    useState({});
  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [cancelLoading, setCancelLoading] =
    useState({});
  const [notifications, setNotifications] =
    useState([]);

  const updateAppointmentInState =
    (updatedAppointment) => {

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === updatedAppointment._id
            ? {
                ...appointment,
                ...updatedAppointment,
                doctorId:
                  updatedAppointment.doctorId ||
                  appointment.doctorId
              }
            : appointment
        )
      );

      setHistory((current) =>
        current.map((appointment) =>
          appointment._id === updatedAppointment._id
            ? {
                ...appointment,
                ...updatedAppointment,
                doctorId:
                  updatedAppointment.doctorId ||
                  appointment.doctorId
              }
            : appointment
        )
      );

    };

  const loadAppointments =
    async () => {

      const res =
        await axios.get(
          `${BASE_URL}/patient-api/my-appointments`,
          {
            withCredentials: true
          }
        );

      setAppointments(res.data.payload || []);

      return res.data.payload || [];

    };

  const loadHistory =
    async () => {

      const res =
        await axios.get(
          `${BASE_URL}/patient-api/medical-history`,
          {
            withCredentials: true
          }
        );

      setHistory(res.data.payload || []);

      return res.data.payload || [];

    };

  const loadDoctors =
    async (specialization = "") => {

      const res =
        await axios.get(
          `${BASE_URL}/patient-api/doctors`,
          {
            params: {
              specialization
            },
            withCredentials: true
          }
        );

      setDoctors(res.data.payload || []);

    };

  useEffect(() => {

    const load =
      async () => {

        try {

          await Promise.all([
            loadAppointments(),
            loadHistory(),
            loadDoctors(),
            axios
              .get(
                `${BASE_URL}/patient-api/specializations`,
                {
                  withCredentials: true
                }
              )
              .then((res) =>
                setSpecializations(
                  res.data.payload || []
                )
              )
          ]);

        } catch (error) {

          setMessage(
            error.response?.data?.message ||
            "Unable to load patient dashboard"
          );

        }

      };

    load();

    const refresh =
      async (eventPayload) => {
        const [nextAppointments] =
          await Promise.all([
            loadAppointments(),
            loadHistory()
          ]);

        if (
          eventPayload?.action === "appointment-rescheduled" &&
          eventPayload.appointment
        ) {

          const updatedAppointment =
            eventPayload.appointment;

          const patientId =
            updatedAppointment.patientId?._id ||
            updatedAppointment.patientId;

          const isMyAppointment =
            patientId === currentUser?._id ||
            nextAppointments.some(
              (appointment) =>
                appointment._id ===
                updatedAppointment._id
            );

          if (isMyAppointment) {

            const notificationText =
              `Appointment rescheduled with Dr. ${updatedAppointment.doctorId?.name || "your doctor"} on ${updatedAppointment.appointmentDate} at ${updatedAppointment.appointmentTime}. Status: pending.`;

            setMessage(notificationText);
            setNotifications((current) => [
              {
                id:
                  `${updatedAppointment._id}-${eventPayload.changedAt}`,
                text:
                  notificationText
              },
              ...current
            ].slice(0, 5));

          }

        }
      };

    const intervalId =
      setInterval(
        () => refresh().catch(() => {}),
        10000
      );

    const focusRefresh =
      () => refresh().catch(() => {});

    window.addEventListener(
      "focus",
      focusRefresh
    );

    const unsubscribeEvents =
      subscribeAppointmentEvents((eventPayload) =>
        refresh(eventPayload).catch(() => {})
      );

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "focus",
        focusRefresh
      );
      unsubscribeEvents();
    };

  }, [currentUser?._id]);

  const upcomingCount =
    useMemo(
      () =>
        appointments.filter((appointment) =>
          [
            "pending",
            "approved",
            "accepted"
          ].includes(appointment.status)
        ).length,
      [appointments]
    );

  const handleSpecializationChange =
    async (event) => {

      const specialization =
        event.target.value;

      setSelectedSpecialization(specialization);
      setBooking({
        ...booking,
        doctorId: ""
      });
      await loadDoctors(specialization);

    };

  const bookAppointment =
    async (event) => {

      event.preventDefault();
      setMessage("");

      if (bookingLoading) {
        return;
      }

      try {

        setBookingLoading(true);

        const res =
          await axios.post(
          `${BASE_URL}/patient-api/book-appointment`,
          booking,
          {
            withCredentials: true
          }
        );

        setMessage(
          "Appointment request sent to the doctor"
        );
        setBooking({
          doctorId: "",
          appointmentDate: "",
          appointmentTime: "",
          reason: ""
        });
        setAppointments((current) => [
          res.data.payload,
          ...current
        ]);

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to book appointment"
        );

      }
      finally {

        setBookingLoading(false);

      }

    };

  const cancelAppointment =
    async (appointmentId) => {

      try {

        if (cancelLoading[appointmentId]) {
          return;
        }

        setCancelLoading((current) => ({
          ...current,
          [appointmentId]: true
        }));

        const res =
          await axios.put(
          `${BASE_URL}/patient-api/cancel-appointment/${appointmentId}`,
          {},
          {
            withCredentials: true
          }
        );

        setMessage("Appointment cancelled");
        setAppointments((current) =>
          current.map((appointment) =>
            appointment._id === appointmentId
              ? res.data.payload
              : appointment
          )
        );

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to cancel appointment"
        );

      }
      finally {

        setCancelLoading((current) => ({
          ...current,
          [appointmentId]: false
        }));

      }

    };

  const uploadReport =
    async (appointmentId) => {

      const file =
        reportFiles[appointmentId];

      if (!file) {

        setMessage("Choose a report file first");
        return;

      }

      const formData =
        new FormData();

      formData.append("report", file);
      formData.append("title", file.name);

      try {

        const res =
          await axios.post(
          `${BASE_URL}/patient-api/appointments/${appointmentId}/reports`,
          formData,
          {
            withCredentials: true,
            timeout: 120000
          }
        );

        setMessage("Report uploaded");
        updateAppointmentInState(
          res.data.payload
        );

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to upload report"
        );

      }

    };

  const deletePatientReport =
    async (appointmentId, reportId) => {

      try {

        const res =
          await axios.delete(
            `${BASE_URL}/patient-api/appointments/${appointmentId}/reports/${reportId}`,
            {
              withCredentials: true
            }
          );

        updateAppointmentInState(
          res.data.payload
        );
        setMessage("Report deleted");

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to delete report"
        );

      }

    };

  const startBookingWithDoctor =
    (doctorId) => {

      setBooking((current) => ({
        ...current,
        doctorId
      }));
      setActiveTab("book");

    };

  const updateProfile =
    async (event) => {

      event.preventDefault();

      const formData =
        new FormData(event.currentTarget);

      try {

        const res =
          await axios.put(
            `${BASE_URL}/patient-api/profile`,
            formData,
            {
              withCredentials: true,
              timeout: 120000
            }
          );

        localStorage.setItem(
          "currentUser",
          JSON.stringify(res.data.payload)
        );
        useAuthStore.setState({
          currentUser: res.data.payload
        });
        setMessage("Profile updated");

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to update profile"
        );

      }

    };

  const renderAppointment =
    (appointment) => (

      <div
        key={appointment._id}
        className="rounded-2xl border border-white/10 bg-white/5 p-5"
      >

        <div
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
        >

          <div>

            <p
              className="text-xl font-black"
            >

              Dr. {appointment.doctorId?.name}

            </p>

            <p
              className="text-gray-400 mt-1"
            >

              {appointment.doctorId?.specialization || "Doctor"} · {appointment.appointmentDate} · {appointment.appointmentTime}

            </p>

            <p
              className="text-gray-300 mt-3"
            >

              {appointment.reason}

            </p>

          </div>

          <StatusDot status={appointment.status} />

        </div>

        <div
          className="mt-5 flex flex-wrap gap-3"
        >

          {
            ![
              "cancelled",
              "completed",
              "rejected"
            ].includes(appointment.status) && (

              <button
                onClick={() =>
                  cancelAppointment(appointment._id)
                }
                disabled={cancelLoading[appointment._id]}
                className="h-11 px-4 rounded-2xl bg-red-500/15 text-red-200 border border-red-500/20 font-bold disabled:opacity-50"
              >

                {cancelLoading[appointment._id]
                  ? "Cancelling..."
                  : "Cancel"}

              </button>

            )
          }

          <input
            type="file"
            accept=".pdf,image/png,image/jpeg"
            onChange={(event) =>
              setReportFiles({
                ...reportFiles,
                [appointment._id]:
                  event.target.files?.[0]
              })
            }
            className="text-sm text-gray-300"
          />

          <button
            onClick={() =>
              uploadReport(appointment._id)
            }
            className="h-11 px-4 rounded-2xl bg-white/10 border border-white/10 font-bold flex items-center gap-2"
          >

            <FileUp size={17} />
            Upload Report

          </button>

        </div>

        <FileList
          title="My Reports"
          items={appointment.patientReports}
          onDelete={(reportId) =>
            deletePatientReport(
              appointment._id,
              reportId
            )
          }
        />

      </div>

    );

  return (

    <RoleShell
      title="Patient"
      subtitle="Patient Care"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >

      <div
        className="flex items-start justify-between gap-6"
      >

        <div>

          <h1
            className="text-4xl font-black"
          >

            Patient Dashboard

          </h1>

          <p
            className="text-gray-400 mt-2"
          >

            Book, track, cancel, and review your care records.

          </p>

        </div>

      </div>

      {message && (
        <div
          className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100"
        >
          {message}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-4 grid gap-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100"
            >
              {notification.text}
            </div>
          ))}
        </div>
      )}

      {activeTab === "overview" && (
        <>
          <div
            className="grid md:grid-cols-3 gap-5 mt-8"
          >
            <Metric label="Upcoming" value={upcomingCount} />
            <Metric label="Total Appointments" value={appointments.length} />
            <Metric label="History Items" value={history.length} />
          </div>
          <AppointmentCalendar
            appointments={appointments}
            title="My Appointment Calendar"
          />
        </>
      )}

      {activeTab === "book" && (
        <form
          onSubmit={bookAppointment}
          className="mt-8 grid lg:grid-cols-2 gap-5 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <select
            value={selectedSpecialization}
            onChange={handleSpecializationChange}
            className={fieldClass}
          >
            <option value="">All specializations</option>
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
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
            placeholder="Reason for visit"
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
              ? "Sending..."
              : "Send Appointment Request"}
          </button>
        </form>
      )}

      {activeTab === "doctors" && (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xl font-black">
                Dr. {doctor.name}
              </p>
              <p className="mt-1 text-gray-400">
                {doctor.specialization || "Doctor"}
              </p>
              <p className="mt-3 text-sm text-gray-300">
                {doctor.experience || 0} years experience
              </p>
              <button
                onClick={() =>
                  startBookingWithDoctor(doctor._id)
                }
                className="mt-5 h-11 w-full rounded-2xl bg-cyan-400 font-black text-black"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="mt-8 grid gap-4">
          {appointments.map(renderAppointment)}
        </div>
      )}

      {activeTab === "history" && (
        <div className="mt-8 grid gap-4">
          {history.map((appointment) => (
            <HistoryItem
              key={appointment._id}
              appointment={appointment}
              onDeleteReport={deletePatientReport}
            />
          ))}
        </div>
      )}

      {activeTab === "profile" && (
        <form
          onSubmit={updateProfile}
          className="mt-8 grid lg:grid-cols-2 gap-5 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          {["name", "phone", "age", "email"].map((field) => (
            <input
              key={field}
              name={field}
              value={profile[field]}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  [field]: event.target.value
                })
              }
              className={fieldClass}
              placeholder={field}
            />
          ))}
          <select
            name="gender"
            value={profile.gender}
            onChange={(event) =>
              setProfile({
                ...profile,
                gender: event.target.value
              })
            }
            className={fieldClass}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            name="profilePhoto"
            type="file"
            accept="image/png,image/jpeg"
            className="text-sm text-gray-300"
          />
          <button
            className="h-12 rounded-2xl bg-cyan-400 text-black font-black"
          >
            Update Profile
          </button>
        </form>
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

function HistoryItem({ appointment, onDeleteReport }) {

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xl font-black">Dr. {appointment.doctorId?.name}</p>
      <p className="text-gray-400 mt-1">{appointment.appointmentDate} · {appointment.appointmentTime}</p>
      <div className="mt-3">
        <StatusDot status={appointment.status} />
      </div>
      <FileList title="Prescriptions" items={appointment.prescriptions} />
      <FileList title="Doctor Reports" items={appointment.doctorReports} />
      <FileList
        title="My Reports"
        items={appointment.patientReports}
        onDelete={(reportId) =>
          onDeleteReport(
            appointment._id,
            reportId
          )
        }
      />
      <div className="mt-4 grid gap-2">
        {(appointment.doctorNotes || []).map((note) => (
          <p key={note._id} className="rounded-2xl bg-black/20 p-3 text-gray-200">
            {note.text}
          </p>
        ))}
      </div>
    </div>
  );

}

function FileList({ title, items = [], onDelete }) {

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="font-bold text-gray-300">{title}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm"
          >
            <a
              href={item.fileUrl}
              target="_blank"
              className="text-cyan-200"
            >
              {item.title}
            </a>
            {onDelete && (
              <button
                onClick={() =>
                  onDelete(item._id)
                }
                className="text-red-300"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

}

export default PatientDashboard;
