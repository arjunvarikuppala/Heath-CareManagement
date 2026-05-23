import { useState }
from "react";

import {
  Outlet
}
from "react-router-dom";

import AdminNavbar
from "../Components/AdminNavbar";

import AdminSidebar
from "../Components/AdminSidebar";



function AdminLayout() {

  const [isOpen,
    setIsOpen] =
      useState(false);

  const toggleSidebar =
    () => {

      setIsOpen(
        !isOpen
      );

    };

  return (

    <div

      className="flex
      min-h-screen
      bg-[#050816]
      text-white"

    >

      {/* SIDEBAR */}

      <AdminSidebar

        isOpen={isOpen}

        toggleSidebar={toggleSidebar}

      />

      {/* MAIN */}

      <div

        className={`

          flex-1 flex flex-col
          transition-all duration-300

          ${

            isOpen

            ?

            "ml-80"

            :

            "ml-0"

          }

        `}

      >

        {/* NAVBAR */}

        <AdminNavbar
          toggleSidebar={toggleSidebar}
        />

        {/* PAGE */}

        <Outlet />

      </div>

    </div>

  );

}

export default AdminLayout;
