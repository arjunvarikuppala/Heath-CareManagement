import {
  Activity,
  Building2,
  HeartPulse,
  Home,
  Phone,
  Stethoscope,
  X
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

const navItems = [
  {
    label: "Home",
    Icon: Home,
    targetId: "home"
  },
  {
    label: "Services",
    Icon: HeartPulse,
    targetId: "services"
  },
  {
    label: "Doctors",
    Icon: Stethoscope,
    targetId: "doctors"
  },
  {
    label: "Branches",
    Icon: Building2,
    targetId: "branches"
  },
  {
    label: "Contact",
    Icon: Phone,
    targetId: "contact"
  }
];

function Sidebar({

  isOpen,
  toggleSidebar

}) {

  const navigate =
    useNavigate();

  const scrollToSection =
    (targetId) => {

      const scroll = () => {

        const element =
          document.getElementById(targetId);

        if (element) {

          element.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      };

      if (window.location.pathname !== "/") {

        navigate("/");

        setTimeout(scroll, 100);

      }

      else {

        scroll();

      }

      toggleSidebar();

    };

  return (

    <aside

      className={`

        relative z-40

        bg-[#070B1D]/95 backdrop-blur-2xl

        border-r border-cyan-400/10

        transition-all duration-500 overflow-hidden

        ${isOpen ? "w-80" : "w-0"}

      `}
    >

      <div className="w-80 h-screen overflow-y-auto flex flex-col">

        <div className="p-7 border-b border-white/10">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div
                className="w-14 h-14
                rounded-2xl
                bg-cyan-400
                text-black
                flex items-center
                justify-center
                shadow-xl
                shadow-cyan-500/30"
              >

                <Activity size={30} />

              </div>

              <h1 className="text-4xl font-black tracking-tight mt-5">

                <span className="text-white">

                  Care

                </span>

                <span className="text-cyan-400">

                  Sync

                </span>

              </h1>

              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mt-2">

                Patient Care Hub

              </p>

            </div>

            <button

              onClick={toggleSidebar}

              className="w-11 h-11 rounded-2xl
              bg-white/5 border border-white/10
              flex items-center justify-center
              text-gray-400
              hover:text-cyan-300 hover:bg-cyan-400/10
              transition duration-300"

            >

              <X size={22} />

            </button>

          </div>

          <div
            className="mt-7
            rounded-2xl
            border border-cyan-400/15
            bg-cyan-400/10
            p-4"
          >

            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">

              Live Desk

            </p>

            <p className="text-sm text-gray-300 mt-2">

              24/7 appointment support

            </p>

          </div>

        </div>

        <div className="flex-1 p-6">

          <p

            className="text-xs uppercase tracking-[0.3em]
            text-gray-500 mb-6"

          >

            Navigation

          </p>

          <div className="flex flex-col gap-3">

            {
              navItems.map(({ label, Icon, targetId }) => (

                <button

                  key={label}

                  type="button"

                  onClick={() =>
                    scrollToSection(targetId)
                  }

                  className="group w-full rounded-2xl
                  bg-white/5 border border-white/5
                  px-5 py-4
                  text-left
                  flex items-center gap-4
                  hover:bg-cyan-400/10
                  hover:border-cyan-400/25
                  transition duration-300"

                >

                  <span
                    className="w-10 h-10
                    rounded-xl
                    bg-white/5
                    flex items-center
                    justify-center
                    text-cyan-300
                    group-hover:bg-cyan-400
                    group-hover:text-black
                    transition"
                  >

                    <Icon size={20} />

                  </span>

                  <span

                    className="text-lg font-semibold
                    text-gray-200
                    group-hover:text-cyan-300
                    transition"

                  >

                    {label}

                  </span>

                </button>

              ))
            }

          </div>

        </div>

        <div className="p-6 border-t border-white/10">

          <button

            type="button"

            onClick={() =>
              scrollToSection("services")
            }

            className="w-full h-14 rounded-2xl
            bg-gradient-to-r from-cyan-400 to-blue-500
            text-black font-black
            hover:scale-[1.02]
            transition duration-300"

          >

            Explore CareSync

          </button>

        </div>

      </div>

    </aside>

  );

}

export default Sidebar;
