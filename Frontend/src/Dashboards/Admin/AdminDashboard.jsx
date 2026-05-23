import { useEffect, useMemo, useState }
from "react";

import axios
from "axios";
import {
  subscribeAppointmentEvents
} from "../../api/appointmentEvents";
import AppointmentCalendar
from "../../Components/AppointmentCalendar";

import {
  useNavigate
}
from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function AdminDashboard() {

  const navigate =
    useNavigate();

  // STATS

  const [stats, setStats] =
    useState({

      doctors: 0,

      receptionists: 0,

      patients: 0,

      appointments: 0

    });

  const [loading, setLoading] =
    useState(true);
  const [appointments, setAppointments] =
    useState([]);
  const [selectedYear, setSelectedYear] =
    useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth());

  const availableYears =
    useMemo(() => {

      const years =
        appointments.map((appointment) =>
          new Date(
            appointment.appointmentDate
          ).getFullYear()
        );

      return Array.from(
        new Set([
          new Date().getFullYear(),
          ...years
        ])
      ).sort((a, b) => b - a);

    }, [appointments]);

  const weeklyCounts =
    useMemo(() => {

      const counts = [
        0,
        0,
        0,
        0,
        0
      ];

      appointments.forEach((appointment) => {

        const date =
          new Date(
            appointment.appointmentDate
          );

        if (
          date.getFullYear() === Number(selectedYear) &&
          date.getMonth() === Number(selectedMonth)
        ) {

          const weekIndex =
            Math.min(
              4,
              Math.floor(
                (date.getDate() - 1) / 7
              )
            );

          counts[weekIndex] += 1;

        }

      });

      return counts;

    }, [
      appointments,
      selectedMonth,
      selectedYear
    ]);

  const maxWeeklyCount =
    Math.max(
      1,
      ...weeklyCounts
    );

  // FETCH DASHBOARD STATS

  useEffect(() => {

    const fetchStats =
      async () => {

        try {

          const res =
            await axios.get(

`${BASE_URL}/admin-api/dashboard-stats`,

              {

                withCredentials: true

              }

            );

          setStats(res.data);

          const appointmentRes =
            await axios.get(
              `${BASE_URL}/admin-api/appointments`,
              {
                withCredentials: true
              }
            );

          setAppointments(
            appointmentRes.data.payload || []
          );

        }

        catch (error) {

          console.log(error);

        }

        finally {

          setLoading(false);

        }

      };

    fetchStats();

    const intervalId =
      setInterval(
        fetchStats,
        10000
      );

    window.addEventListener(
      "focus",
      fetchStats
    );

    const unsubscribeEvents =
      subscribeAppointmentEvents(fetchStats);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "focus",
        fetchStats
      );
      unsubscribeEvents();
    };

  }, []);

  return (

    <div className="p-4 sm:p-6 lg:p-10">

      {/* TOP */}

      <div

        className="flex
        flex-col sm:flex-row
        items-start sm:items-center
        justify-between"

      >

        <div>

          <h1

            className="text-3xl sm:text-5xl
            font-black"

          >

            Admin Dashboard

          </h1>

          <p

            className="text-gray-400
            mt-3 text-lg"

          >

            Manage your hospital system

          </p>

        </div>

      </div>

      {/* STATS */}

      <div

        className="grid
        grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
        gap-4 sm:gap-6
        mt-8 sm:mt-14"

      >

        {/* DOCTORS */}

        <div

          onClick={() =>
            navigate(
              "/admin/doctors"
            )
          }

          className="bg-white/5
          border border-white/10
          rounded-3xl
          p-6 sm:p-8
          cursor-pointer"

        >

          <h2
            className="text-gray-400"
          >

            Doctors

          </h2>

          <p

            className="text-4xl sm:text-5xl
            font-black
            mt-4"

          >

            {

              loading

              ?

              "..."

              :

              stats.doctors

            }

          </p>

        </div>

        {/* RECEPTIONISTS */}

        <div

          onClick={() =>
            navigate(
              "/admin/receptionists"
            )
          }

          className="bg-white/5
          border border-white/10
          rounded-3xl
          p-6 sm:p-8
          cursor-pointer"

        >

          <h2
            className="text-gray-400"
          >

            Receptionists

          </h2>

          <p

            className="text-4xl sm:text-5xl
            font-black
            mt-4"

          >

            {

              loading

              ?

              "..."

              :

              stats.receptionists

            }

          </p>

        </div>

        {/* PATIENTS */}

        <div

          onClick={() =>
            navigate(
              "/admin/patients"
            )
          }

          className="bg-white/5
          border border-white/10
          rounded-3xl
          p-6 sm:p-8
          cursor-pointer"

        >

          <h2
            className="text-gray-400"
          >

            Patients

          </h2>

          <p

            className="text-4xl sm:text-5xl
            font-black
            mt-4"

          >

            {

              loading

              ?

              "..."

              :

              stats.patients

            }

          </p>

        </div>

        {/* APPOINTMENTS */}

        <div

          onClick={() =>
            navigate(
              "/admin/appointments"
            )
          }

          className="bg-white/5
          border border-white/10
          rounded-3xl
          p-6 sm:p-8
          cursor-pointer"

        >

          <h2
            className="text-gray-400"
          >

            Appointments

          </h2>

          <p

            className="text-4xl sm:text-5xl
            font-black
            mt-4"

          >

            {

              loading

              ?

              "..."

              :

              stats.appointments

            }

          </p>

        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div className="mt-10 sm:mt-16">

        <h2

          className="text-3xl
          font-black"

        >

          Quick Actions

        </h2>

        <div

          className="grid
          grid-cols-1 sm:grid-cols-3
          gap-4 sm:gap-6
          mt-6 sm:mt-8"

        >

          {/* ADD DOCTOR */}

          <button

            onClick={() =>
              navigate(
                "/admin/create-doctor"
              )
            }

            className="h-28
            rounded-3xl
            bg-cyan-400
            text-black
            text-xl
            font-black"

          >

            Add Doctor

          </button>

          {/* ADD RECEPTIONIST */}

          <button

            onClick={() =>
              navigate(
                "/admin/create-receptionist"
              )
            }

            className="h-28
            rounded-3xl
            bg-blue-500
            text-white
            text-xl
            font-black"

          >

            Add Receptionist

          </button>

          {/* VIEW APPOINTMENTS */}

          <button
            onClick={() =>
              navigate(
                "/admin/appointments"
              )
            }

            className="h-28
            rounded-3xl
            bg-purple-500
            text-white
            text-xl
            font-black"

          >

            View Appointments

          </button>

        </div>

      </div>

      {/* ANALYTICS */}

      <AppointmentCalendar
        appointments={appointments}
        title="Hospital Appointment Calendar"
      />

      <div

        className="mt-16
        bg-white/5
        border border-white/10
        rounded-3xl
        p-5 sm:p-10"

      >

        <h2

          className="text-3xl
          font-black"

        >

          Appointment Analytics

        </h2>

        <div className="mt-6 flex flex-wrap gap-4">
          <select
            value={selectedYear}
            onChange={(event) =>
              setSelectedYear(event.target.value)
            }
            className="h-12 rounded-2xl bg-white/5 border border-white/10 px-4"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(event.target.value)
            }
            className="h-12 rounded-2xl bg-white/5 border border-white/10 px-4"
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 h-72 sm:h-80 rounded-3xl bg-[#0B1120] p-4 sm:p-6 flex items-end gap-2 sm:gap-4 overflow-x-auto">
          {weeklyCounts.map((count, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-3"
            >
              <div className="text-sm font-bold text-cyan-200">
                {count}
              </div>
              <div className="h-56 w-full rounded-2xl bg-white/5 flex items-end overflow-hidden">
                <div
                  className="w-full rounded-2xl bg-cyan-400"
                  style={{
                    height:
                      `${Math.max(
                        8,
                        (count / maxWeeklyCount) * 100
                      )}%`
                  }}
                />
              </div>
              <p className="text-sm text-gray-400">
                Week {index + 1}
              </p>
            </div>
          ))}
        </div>

      </div>

    </div>

  );

}

export default AdminDashboard;
