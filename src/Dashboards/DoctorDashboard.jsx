import {
  CalendarOff,
  ClipboardList,
  FileText,
  HeartPulse,
  UsersRound
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
    id: "appointments",
    label: "Appointments",
    Icon: ClipboardList
  },
  {
    id: "patients",
    label: "Patient History",
    Icon: UsersRound
  },
  {
    id: "availability",
    label: "Availability",
    Icon: CalendarOff
  }
];

const fieldClass =
  "w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-400";

const statusActions = {
  pending: [
    {
      status: "approved",
      label: "Approve"
    },
    {
      status: "accepted",
      label: "Accept"
    },
    {
      status: "rejected",
      label: "Reject"
    },
    {
      status: "cancelled",
      label: "Cancel"
    }
  ],
  approved: [
    {
      status: "completed",
      label: "Complete"
    },
    {
      status: "rejected",
      label: "Reject"
    },
    {
      status: "cancelled",
      label: "Cancel"
    }
  ],
  accepted: [
    {
      status: "completed",
      label: "Complete"
    },
    {
      status: "rejected",
      label: "Reject"
    },
    {
      status: "cancelled",
      label: "Cancel"
    }
  ],
  rejected: [],
  completed: [],
  cancelled: []
};

function DoctorDashboard() {

  const {
    currentUser
  } = useAuthStore();

  const [activeTab, setActiveTab] =
    useState("overview");
  const [appointments, setAppointments] =
    useState([]);
  const [selectedPatient, setSelectedPatient] =
    useState("");
  const [patientHistory, setPatientHistory] =
    useState([]);
  const [unavailableDate, setUnavailableDate] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [noteText, setNoteText] =
    useState({});
  const [prescriptionFiles, setPrescriptionFiles] =
    useState({});
  const [reportFiles, setReportFiles] =
    useState({});
  const [uploadProgress, setUploadProgress] =
    useState({});
  const [submitting, setSubmitting] =
    useState({});
  const [statusUpdating, setStatusUpdating] =
    useState({});

  const updateAppointmentInState =
    (updatedAppointment) => {

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === updatedAppointment._id
            ? {
                ...appointment,
                ...updatedAppointment,
                patientId:
                  updatedAppointment.patientId ||
                  appointment.patientId
              }
            : appointment
        )
      );

      setPatientHistory((current) =>
        current.map((appointment) =>
          appointment._id === updatedAppointment._id
            ? {
                ...appointment,
                ...updatedAppointment,
                patientId:
                  appointment.patientId
              }
            : appointment
        )
      );

    };

  const loadAppointments =
    async () => {

      const res =
        await axios.get(
          `${BASE_URL}/doctor-api/my-appointments`,
          {
            withCredentials: true
          }
        );

      setAppointments(res.data.payload || []);

    };

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAppointments().catch((error) =>
      setMessage(
        error.response?.data?.message ||
        "Unable to load appointments"
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

  }, []);

  const patients =
    useMemo(() => {

      const map =
        new Map();

      appointments.forEach((appointment) => {

        if (appointment.patientId) {
          map.set(
            appointment.patientId._id,
            appointment.patientId
          );
        }

      });

      return Array.from(map.values());

    }, [appointments]);

  const counts =
    useMemo(() => ({
      pending:
        appointments.filter(
          (appointment) =>
            appointment.status === "pending"
        ).length,
      approved:
        appointments.filter(
          (appointment) =>
            [
              "approved",
              "accepted"
            ].includes(appointment.status)
        ).length,
      completed:
        appointments.filter(
          (appointment) =>
            appointment.status === "completed"
        ).length
    }), [appointments]);

  const updateStatus =
    async (appointmentId, status) => {

      if (statusUpdating[appointmentId]) {
        return;
      }

      try {

        setStatusUpdating((current) => ({
          ...current,
          [appointmentId]: true
        }));

        const res =
          await axios.put(
            `${BASE_URL}/doctor-api/update-appointment-status/${appointmentId}`,
            {
              status
            },
            {
              withCredentials: true
            }
          );

        updateAppointmentInState(
          res.data.payload
        );
        setMessage(`Appointment ${status}`);

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to update appointment"
        );

      }
      finally {

        setStatusUpdating((current) => ({
          ...current,
          [appointmentId]: false
        }));

      }

    };

  const submitFile =
    async (appointmentId, type) => {

      const file =
        type === "prescriptions"
          ? prescriptionFiles[appointmentId]
          : reportFiles[appointmentId];
      const submitKey =
        `${appointmentId}:${type}`;

      if (submitting[submitKey]) {
        return;
      }

      const formData =
        new FormData();

      if (file) {
        formData.append(
          type === "prescriptions"
            ? "prescription"
            : "report",
          file
        );
        formData.append("title", file.name);
      }

      formData.append(
        "notes",
        noteText[appointmentId] || ""
      );

      try {

        setSubmitting((current) => ({
          ...current,
          [submitKey]: true
        }));

        setUploadProgress((current) => ({
          ...current,
          [submitKey]: 0
        }));

        const res =
          await axios.post(
            `${BASE_URL}/doctor-api/appointments/${appointmentId}/${type}`,
            formData,
            {
              withCredentials: true,
              timeout: 120000,
              onUploadProgress: (progressEvent) => {
                if (!progressEvent.total) {
                  return;
                }

                setUploadProgress((current) => ({
                  ...current,
                  [submitKey]:
                    Math.round(
                      (progressEvent.loaded * 100) /
                      progressEvent.total
                    )
                }));
              }
            }
          );

        updateAppointmentInState(
          res.data.payload
        );
        setMessage(
          type === "prescriptions"
            ? "Prescription sent"
            : "Report uploaded"
        );

        if (type === "prescriptions") {
          setPrescriptionFiles((current) => ({
            ...current,
            [appointmentId]: null
          }));
        } else {
          setReportFiles((current) => ({
            ...current,
            [appointmentId]: null
          }));
        }

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to upload file"
        );

      }
      finally {

        setSubmitting((current) => ({
          ...current,
          [submitKey]: false
        }));

        setUploadProgress((current) => ({
          ...current,
          [submitKey]: null
        }));

      }

    };

  const sendNote =
    async (appointmentId) => {

      try {

        const res =
          await axios.post(
            `${BASE_URL}/doctor-api/appointments/${appointmentId}/notes`,
            {
              text: noteText[appointmentId]
            },
            {
              withCredentials: true
            }
          );

        updateAppointmentInState(
          res.data.payload
        );
        setMessage("Note sent to patient");
        setNoteText({
          ...noteText,
          [appointmentId]: ""
        });

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to send note"
        );

      }

    };

  const deleteDoctorFile =
    async (appointmentId, type, fileId) => {

      try {

        const res =
          await axios.delete(
            `${BASE_URL}/doctor-api/appointments/${appointmentId}/${type}/${fileId}`,
            {
              withCredentials: true
            }
          );

        updateAppointmentInState(
          res.data.payload
        );
        setMessage(
          type === "prescriptions"
            ? "Prescription deleted"
            : "Report deleted"
        );

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to delete file"
        );

      }

    };

  const loadPatientHistory =
    async (patientId) => {

      setSelectedPatient(patientId);

      if (!patientId) {
        setPatientHistory([]);
        return;
      }

      const res =
        await axios.get(
          `${BASE_URL}/doctor-api/patients/${patientId}/history`,
          {
            withCredentials: true
          }
        );

      setPatientHistory(res.data.payload || []);

    };

  const updateAvailability =
    async (action) => {

      if (!unavailableDate) {
        setMessage("Select a date first");
        return;
      }

      const res =
        await axios.put(
          `${BASE_URL}/doctor-api/unavailable-dates`,
          {
            date: unavailableDate,
            action
          },
          {
            withCredentials: true
          }
        );

      const updatedUser = {
        ...currentUser,
        unavailableDates: res.data.payload
      };

      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );
      useAuthStore.setState({
        currentUser: updatedUser
      });
      setMessage("Availability updated");

    };

  return (

    <RoleShell
      title="Doctor"
      subtitle="Doctor Workspace"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >

      <h1 className="text-4xl font-black">
        Doctor Dashboard
      </h1>
      <p className="text-gray-400 mt-2">
        Review requests, manage status, and update patient records.
      </p>

      {message && (
        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
          {message}
        </div>
      )}

      {activeTab === "overview" && (
        <>
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <Metric label="Pending" value={counts.pending} />
            <Metric label="Approved" value={counts.approved} />
            <Metric label="Completed" value={counts.completed} />
          </div>
          <AppointmentCalendar
            appointments={appointments}
            title="My Appointment Calendar"
          />
        </>
      )}

      {activeTab === "appointments" && (
        <div className="mt-8 grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <p className="text-xl font-black">{appointment.patientId?.name}</p>
                  <p className="text-gray-400 mt-1">{appointment.appointmentDate} · {appointment.appointmentTime}</p>
                  <p className="text-gray-300 mt-3">{appointment.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusDot status={appointment.status} />
                  <div className="flex flex-wrap gap-2">
                    {(statusActions[appointment.status] || []).map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            action.status
                          )
                        }
                        disabled={statusUpdating[appointment._id]}
                        className="h-11 rounded-2xl bg-white/10 border border-white/10 px-4 font-bold disabled:opacity-50"
                      >
                        {statusUpdating[appointment._id]
                          ? "Saving..."
                          : action.label}
                      </button>
                    ))}
                    {(statusActions[appointment.status] || []).length === 0 && (
                      <span className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold capitalize text-gray-300">
                        {appointment.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <ActionRow label="Prescription">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg"
                    onChange={(event) =>
                      setPrescriptionFiles({
                        ...prescriptionFiles,
                        [appointment._id]: event.target.files?.[0]
                      })
                    }
                    className="text-sm text-gray-300"
                  />
                  <button
                    onClick={() => submitFile(appointment._id, "prescriptions")}
                    disabled={submitting[`${appointment._id}:prescriptions`]}
                    className="h-11 px-4 rounded-2xl bg-cyan-400 text-black font-black flex items-center justify-center gap-2"
                  >
                    <FileText size={17} />
                    {submitting[`${appointment._id}:prescriptions`]
                      ? `${uploadProgress[`${appointment._id}:prescriptions`] || 0}%`
                      : "Upload"}
                  </button>
                </ActionRow>
                <ActionRow label="Reports">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg"
                    onChange={(event) =>
                      setReportFiles({
                        ...reportFiles,
                        [appointment._id]: event.target.files?.[0]
                      })
                    }
                    className="text-sm text-gray-300"
                  />
                  <button
                    onClick={() => submitFile(appointment._id, "reports")}
                    disabled={submitting[`${appointment._id}:reports`]}
                    className="h-11 px-4 rounded-2xl bg-white/10 border border-white/10 font-bold"
                  >
                    {submitting[`${appointment._id}:reports`]
                      ? `${uploadProgress[`${appointment._id}:reports`] || 0}%`
                      : "Upload Reports"}
                  </button>
                </ActionRow>
                <ActionRow label="Notes">
                  <input
                    value={noteText[appointment._id] || ""}
                    onChange={(event) =>
                      setNoteText({
                        ...noteText,
                        [appointment._id]: event.target.value
                      })
                    }
                    placeholder="Note for patient"
                    className={fieldClass}
                  />
                  <button
                    onClick={() => sendNote(appointment._id)}
                    className="h-11 px-4 rounded-2xl bg-white/10 border border-white/10 font-bold"
                  >
                    Send Notes
                  </button>
                </ActionRow>
              </div>
              <FileList
                title="Prescriptions"
                items={appointment.prescriptions}
                onDelete={(fileId) =>
                  deleteDoctorFile(
                    appointment._id,
                    "prescriptions",
                    fileId
                  )
                }
              />
              <FileList
                title="Doctor Reports"
                items={appointment.doctorReports}
                onDelete={(fileId) =>
                  deleteDoctorFile(
                    appointment._id,
                    "reports",
                    fileId
                  )
                }
              />
              <FileList
                title="Patient Reports"
                items={appointment.patientReports}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === "patients" && (
        <div className="mt-8 grid gap-5">
          <select
            value={selectedPatient}
            onChange={(event) =>
              loadPatientHistory(event.target.value)
            }
            className={fieldClass}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name} - {patient.email}
              </option>
            ))}
          </select>
          {patientHistory.map((appointment) => (
            <HistoryItem
              key={appointment._id}
              appointment={appointment}
              onDeleteFile={deleteDoctorFile}
            />
          ))}
        </div>
      )}

      {activeTab === "availability" && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid lg:grid-cols-3 gap-4">
            <input
              type="date"
              value={unavailableDate}
              onChange={(event) =>
                setUnavailableDate(event.target.value)
              }
              className={fieldClass}
            />
            <button
              onClick={() => updateAvailability("add")}
              className="h-12 rounded-2xl bg-cyan-400 text-black font-black"
            >
              Mark Unavailable
            </button>
            <button
              onClick={() => updateAvailability("remove")}
              className="h-12 rounded-2xl bg-white/10 border border-white/10 font-black"
            >
              Remove Date
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            {(currentUser?.unavailableDates || []).map((date) => (
              <span key={date} className="rounded-full bg-red-500/15 border border-red-500/20 px-4 py-2 text-red-100">
                {date}
              </span>
            ))}
          </div>
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

function ActionRow({ label, children }) {

  return (
    <div className="grid gap-3 rounded-2xl bg-black/20 p-4 lg:grid-cols-[160px_1fr_auto] lg:items-center">
      <p className="font-black text-gray-200">{label}</p>
      {children}
    </div>
  );

}

function HistoryItem({ appointment, onDeleteFile }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xl font-black">Dr. {appointment.doctorId?.name}</p>
      <p className="text-gray-400 mt-1">{appointment.appointmentDate} - {appointment.appointmentTime}</p>
      <div className="mt-3">
        <StatusDot status={appointment.status} />
      </div>
      <p className="text-gray-300 mt-2">{appointment.reason}</p>
      <FileList
        title="Prescriptions"
        items={appointment.prescriptions}
        onDelete={(fileId) =>
          onDeleteFile(
            appointment._id,
            "prescriptions",
            fileId
          )
        }
      />
      <FileList
        title="Doctor Reports"
        items={appointment.doctorReports}
        onDelete={(fileId) =>
          onDeleteFile(
            appointment._id,
            "reports",
            fileId
          )
        }
      />
      <FileList
        title="Patient Reports"
        items={appointment.patientReports}
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
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item._id} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            <a href={item.fileUrl} target="_blank" className="text-cyan-200">
              {item.title}
            </a>
            {onDelete && (
              <button onClick={() => onDelete(item._id)} className="text-red-300">
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

}

// eslint-disable-next-line no-unused-vars
function LegacyHistoryItem({ appointment }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xl font-black">Dr. {appointment.doctorId?.name}</p>
      <p className="text-gray-400 mt-1">{appointment.appointmentDate} · {appointment.appointmentTime}</p>
      <p className="text-cyan-200 mt-3 capitalize">{appointment.status}</p>
      <p className="text-gray-300 mt-2">{appointment.reason}</p>
      <p className="text-gray-400 mt-4">Prescriptions: {(appointment.prescriptions || []).length}</p>
      <p className="text-gray-400">Reports: {((appointment.patientReports || []).length + (appointment.doctorReports || []).length)}</p>
    </div>
  );
}

export default DoctorDashboard;
