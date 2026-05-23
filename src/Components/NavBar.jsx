import { NavLink } from "react-router-dom";
import {
  Menu
} from "lucide-react";

function Navbar({ toggleSidebar }) {

  return (

    <nav className="relative z-50 h-24 border-b border-white/10

    bg-[#070B1D]/90 backdrop-blur-xl">

      <div className="max-w-[1600px] mx-auto h-full px-6 lg:px-12

      flex items-center justify-between">

        {/* LEFT */}

        <div className="flex items-center gap-6">

          {/* BURGER */}

          <button

            onClick={toggleSidebar}

            className="group w-14 h-14 rounded-2xl

            bg-white/5 border border-white/10

            flex items-center justify-center

            hover:bg-cyan-400/10 transition duration-300"

          >

            <Menu
              size={28}
              className="text-cyan-300"
            />

          </button>

          {/* LOGO */}

          <div className="flex items-center gap-4">

            {/* LOGO ICON */}

            <div className="relative">

              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-40 rounded-full" />

              <div className="relative w-14 h-14 rounded-2xl

              bg-gradient-to-br from-cyan-300 to-blue-500

              flex items-center justify-center

              text-black text-2xl font-black

              shadow-xl shadow-cyan-500/30">

                C

              </div>

            </div>

            {/* BRAND */}

            <div>

              <h1 className="text-3xl font-black tracking-tight">

                <span className="text-white">

                  Care

                </span>

                <span className="text-cyan-400">

                  Sync

                </span>

              </h1>

              <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mt-1">

                Intelligent Healthcare

              </p>

            </div>

          </div>

        </div>

        {/* CENTER LINKS */}

        <div className="hidden xl:flex items-center gap-10">

          {["Home", "Services", "Doctors", "Branches", "Contact"]

          .map((item, index) => (

            <a

              key={index}

              href="#"

              className="text-gray-300 hover:text-cyan-400

              transition duration-300 font-medium"

            >

              {item}

            </a>

          ))}

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-4">

          {/* LOGIN */}

          <NavLink to="/login">

  <button className="hidden sm:flex h-12 px-6 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-gray-200 font-semibold hover:bg-white/10 transition duration-300">
        Login
    </button>

</NavLink>

          {/* REGISTER */}

          <NavLink to="/register">

         <button className="h-12 px-7 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black hover:scale-105 transition duration-300 shadow-xl shadow-cyan-500/20">
            Register

        </button>

</NavLink>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;
