import {
  Activity,
  CalendarDays,
  LogOut,
  Menu
} from "lucide-react";

import {
  useAuthStore
} from "../store/AuthStore";

import {
  useNavigate
} from "react-router-dom";

function RoleShell({
  title,
  subtitle,
  navItems,
  activeTab,
  setActiveTab,
  children
}) {

  const {
    currentUser,
    logout
  } = useAuthStore();

  const navigate =
    useNavigate();

  const handleLogout =
    async () => {

      await logout();
      navigate("/login");

    };

  return (

    <div
      className="min-h-screen bg-[#050816] text-white"
    >

      <div
        className="fixed inset-y-0 left-0 w-72 bg-[#07111F] border-r border-cyan-400/10 z-40 hidden lg:block"
      >

        <div
          className="p-7 border-b border-white/10"
        >

          <div
            className="w-14 h-14 rounded-2xl bg-cyan-400 text-black flex items-center justify-center"
          >

            <CalendarDays size={28} />

          </div>

          <h1
            className="text-3xl font-black mt-5"
          >

            {currentUser?.name || title}

          </h1>

          <p
            className="text-xs uppercase tracking-[0.25em] text-cyan-300 mt-2"
          >

            {title}

          </p>

          <div
            className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3"
          >

            <Activity
              size={18}
              className="text-cyan-300"
            />

            <span
              className="text-sm text-gray-300 font-bold"
            >

              Schedule active

            </span>

          </div>

        </div>

        <div
          className="p-5 flex flex-col gap-3"
        >

          {
            navItems.map(({ id, label, Icon }) => {

              const active =
                activeTab === id;

              return (

                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`h-14 rounded-2xl border px-4 flex items-center gap-3 text-left font-bold transition ${
                    active
                      ? "bg-cyan-400 text-black border-cyan-400"
                      : "bg-white/5 text-white border-white/5 hover:bg-white/10"
                  }`}
                >

                  <Icon size={19} />
                  {label}

                </button>

              );

            })
          }

        </div>

      </div>

      <div
        className="lg:ml-72 min-h-screen flex flex-col"
      >

        <nav
          className="h-24 bg-[#111827] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-8"
        >

          <div
            className="flex items-center gap-3 sm:gap-5 min-w-0"
          >

            <button
              className="lg:hidden w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center"
            >

              <Menu
                size={24}
                className="text-cyan-300"
              />

            </button>

            <div>

              <h1
                className="text-2xl sm:text-3xl lg:text-5xl font-black"
              >

                Care
                <span className="text-cyan-400">
                  Sync
                </span>

              </h1>

              <p
                className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.25em]"
              >

                {subtitle}

              </p>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="h-12 px-3 sm:px-5 rounded-2xl bg-cyan-400 text-black font-black flex items-center gap-2"
          >

            <LogOut size={19} />
            <span className="hidden sm:inline">
              Logout
            </span>

          </button>

        </nav>

        <div
          className="lg:hidden flex gap-2 overflow-x-auto p-4 border-b border-white/10"
        >

          {
            navItems.map(({ id, label, Icon }) => (

              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`h-11 px-4 rounded-2xl flex items-center gap-2 text-sm font-bold whitespace-nowrap ${
                  activeTab === id
                    ? "bg-cyan-400 text-black"
                    : "bg-white/5 text-white"
                }`}
              >

                <Icon size={16} />
                {label}

              </button>

            ))
          }

        </div>

        <main
          className="p-5 lg:p-10 flex-1"
        >

          {children}

        </main>

      </div>

    </div>

  );

}

export default RoleShell;
