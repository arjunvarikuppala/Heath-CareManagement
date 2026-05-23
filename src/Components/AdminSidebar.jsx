import {
  Plus,
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  UserRoundCog,
  UsersRound,
  CalendarDays,
  X
} from "lucide-react";

import {
  useLocation,
  useNavigate
}
from "react-router-dom";

import {
  useAuthStore
}
from "../store/AuthStore";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin",
    Icon: LayoutDashboard
  },
  {
    label: "Doctors",
    path: "/admin/doctors",
    Icon: Stethoscope
  },
  {
    label: "Receptionists",
    path: "/admin/receptionists",
    Icon: UserRoundCog
  },
  {
    label: "Patients",
    path: "/admin/patients",
    Icon: UsersRound
  },
  {
    label: "Appointments",
    path: "/admin/appointments",
    Icon: CalendarDays
  }
];

function AdminSidebar({

  isOpen,

  toggleSidebar

}) {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    currentUser
  } = useAuthStore();

  const handleNavigate =
    (path) => {

      navigate(path);

      toggleSidebar();

    };

  return (

    <div

      className={`

        fixed top-0 left-0
        h-screen w-80
        bg-[#07111F]
        border-r border-cyan-400/10
        z-50
        transition-transform duration-300
        overflow-y-auto

        ${

          isOpen

          ?

          "translate-x-0"

          :

          "-translate-x-full"

        }

      `}

    >

      <div
        className="absolute inset-x-0 top-0
        h-40
        bg-cyan-400/10
        blur-3xl
        pointer-events-none"
      />

      <div
        className="p-7
        border-b border-white/10
        relative"
      >

        <div
          className="flex
          items-start
          justify-between
          gap-4"
        >

          <div>

            <div
              className="w-14 h-14
              rounded-2xl
              bg-gradient-to-br
              from-cyan-300
              to-blue-500
              text-black
              flex items-center
              justify-center
              shadow-xl
              shadow-cyan-500/30"
            >

              <ShieldCheck size={30} />

            </div>

            <h1
              className="text-3xl
              font-black
              text-white
              mt-5
              leading-tight"
            >

              {currentUser?.name || "Admin"}

            </h1>

            <p
              className="text-xs
              uppercase
              tracking-[0.28em]
              text-cyan-300
              mt-2"
            >

              Control Center

            </p>

          </div>

          <button

            onClick={toggleSidebar}

            className="w-11 h-11
            rounded-2xl
            bg-white/5
            border border-white/10
            flex items-center
            justify-center
            hover:bg-cyan-400/10
            transition"

          >

            <X
              size={24}
              className="text-gray-300"
            />

          </button>

        </div>

        <div
          className="mt-7
          rounded-2xl
          bg-black/20
          border border-cyan-400/15
          p-4"
        >

          <div
            className="flex
            items-center
            gap-3"
          >

            <Activity
              size={20}
              className="text-cyan-300"
            />

            <p
              className="text-sm
              font-bold
              text-gray-200"
            >

              Hospital operations online

            </p>

          </div>

        </div>

      </div>

      <div
        className="p-5
        flex flex-col
        gap-3"
      >

        {
          navItems.map(({ label, path, Icon }) => {

            const isActive =
              location.pathname === path;

            return (

            <button

              key={path}

              onClick={() =>
                handleNavigate(path)
              }

              className={`group
              h-16
              rounded-2xl
              ${
                isActive
                ? "bg-cyan-400 text-black border-cyan-400"
                : "bg-white/5 text-white border-white/5"
              }
              border
              text-left
              px-5
              flex items-center
              gap-4
              text-lg
              font-bold
              hover:bg-cyan-400
              hover:text-black
              hover:border-cyan-400
              transition`}

            >

              <span
                className={`w-10 h-10
                rounded-xl
                bg-black/20
                flex items-center
                justify-center
                ${
                  isActive
                  ? "text-black"
                  : "text-cyan-300"
                }
                group-hover:text-black
                transition`}
              >

                <Icon size={20} />

              </span>

              {label}

            </button>

          );

          })
        }

      </div>

      <div
        className="mx-5 mb-6
        rounded-3xl
        border border-white/10
        bg-white/5
        p-5"
      >

        <p
          className="text-xs
          uppercase
          tracking-[0.25em]
          text-gray-500"
        >

          Quick Create

        </p>

        <div
          className="grid
          grid-cols-2
          gap-3
          mt-4"
        >

          <button
            onClick={() =>
              handleNavigate("/admin/create-doctor")
            }
            className="h-12
            rounded-2xl
            bg-cyan-400
            text-black
            font-black
            flex items-center
            justify-center
            gap-2"
          >

            <Plus size={17} />
            Doctor

          </button>

          <button
            onClick={() =>
              handleNavigate("/admin/create-receptionist")
            }
            className="h-12
            rounded-2xl
            bg-blue-500
            text-white
            font-black
            flex items-center
            justify-center
            gap-2"
          >

            <Plus size={17} />
            Desk

          </button>

        </div>

      </div>

    </div>

  );

}

export default AdminSidebar;
