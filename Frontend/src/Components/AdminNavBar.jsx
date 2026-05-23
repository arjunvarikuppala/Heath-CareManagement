import {
  LogOut,
  Menu
}
from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import {
  useAuthStore
} from "../store/AuthStore";

function AdminNavbar({

  toggleSidebar

}) {

  const navigate =
    useNavigate();

  const {
    logout,
    currentUser
  } = useAuthStore();

  const handleLogout =
    async () => {

      await logout();

      navigate("/login");

    };

  return (

    <nav

      className="h-24
      bg-[#111827]
      border-b border-white/10
      flex items-center
      justify-between
      px-4 sm:px-8"

    >

      {/* LEFT */}

      <div

        className="flex
        items-center gap-3 sm:gap-6"

      >

        {/* HAMBURGER */}

        <button

          onClick={toggleSidebar}

          className="w-12 h-12 sm:w-16 sm:h-16
          rounded-2xl
          border border-white/10
          flex items-center
          justify-center"

        >

          <Menu
            size={28}
            className="text-cyan-400"
          />

        </button>

        {/* LOGO */}

        <div>

          <h1

            className="text-3xl sm:text-5xl
            font-black
            text-white"

          >

            Care

            <span
              className="text-cyan-400"
            >

              Sync

            </span>

          </h1>

          <p

            className="text-gray-500
            tracking-[3px] sm:tracking-[8px]
            text-[10px] sm:text-sm"

          >

            INTELLIGENT HEALTHCARE

          </p>

        </div>

      </div>

      <div
        className="flex
        items-center
        gap-4"
      >

        <div
          className="hidden md:block
          text-right"
        >

          <p
            className="text-sm
            text-gray-400"
          >

            Signed in as

          </p>

          <p
            className="text-lg
            font-black
            text-cyan-300"
          >

            {currentUser?.name || "Admin"}

          </p>

        </div>

        <button
          onClick={handleLogout}
          className="h-12
          px-3 sm:px-5
          rounded-2xl
          bg-cyan-400
          text-black
          font-black
          flex items-center
          gap-2
          hover:scale-[1.02]
          transition"
        >

          <LogOut size={20} />

          <span className="hidden sm:inline">
            Logout
          </span>

        </button>

      </div>


    </nav>

  );

}

export default AdminNavbar;
