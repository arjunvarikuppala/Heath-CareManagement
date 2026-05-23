const statusStyles = {
  approved: "bg-green-400",
  accepted: "bg-green-400",
  rejected: "bg-red-400",
  pending: "bg-yellow-300",
  completed: "bg-blue-400",
  cancelled: "bg-orange-400"
};

export function StatusDot({ status }) {

  return (
    <span
      className={`inline-block h-3 w-3 rounded-full ${statusStyles[status] || "bg-gray-400"}`}
    />
  );

}

function AppointmentCalendar({
  appointments = [],
  title = "Appointment Calendar"
}) {

  const grouped =
    appointments.reduce((groups, appointment) => {

      const date =
        appointment.appointmentDate || "No date";

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(appointment);

      return groups;

    }, {});

  const dates =
    Object.keys(grouped).sort();

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black">{title}</h2>
        <div className="flex flex-wrap gap-3 text-xs text-gray-300">
          {Object.keys(statusStyles).map((status) => (
            <span key={status} className="flex items-center gap-2 capitalize">
              <StatusDot status={status} />
              {status}
            </span>
          ))}
        </div>
      </div>

      {dates.length === 0 && (
        <p className="mt-6 text-gray-400">No appointments to show.</p>
      )}

      <div className="mt-5 grid gap-4">
        {dates.map((date) => (
          <div key={date} className="rounded-2xl bg-black/20 p-4">
            <p className="font-black text-cyan-200">{date}</p>
            <div className="mt-3 grid gap-2">
              {grouped[date].map((appointment) => (
                (() => {
                  const primaryName =
                    appointment.patientId?.name ||
                    `Dr. ${appointment.doctorId?.name || "Doctor"}`;
                  const secondaryName =
                    appointment.patientId?.name
                      ? `Dr. ${appointment.doctorId?.name || "Doctor"} · ${appointment.reason}`
                      : appointment.reason;

                  return (
                <div
                  key={appointment._id}
                  className="flex flex-col gap-2 rounded-xl bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot status={appointment.status} />
                    <div>
                      <p className="font-bold">
                        {appointment.appointmentTime} · {primaryName}
                      </p>
                      <p className="text-sm text-gray-400">
                        {secondaryName}
                      </p>
                    </div>
                  </div>
                </div>
                  );
                })()
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}

export default AppointmentCalendar;
