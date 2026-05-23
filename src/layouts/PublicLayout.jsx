import { useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { Outlet } from "react-router-dom";

function PublicLayout() {

  const [isOpen, setIsOpen] =
    useState(false);

  const toggleSidebar = () => {

    setIsOpen(!isOpen);

  };

  return (

    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}

      <Sidebar

  isOpen={isOpen}

  toggleSidebar={toggleSidebar}

/>

      {/* Main Section */}

      <div className="flex-1 flex flex-col">

        {/* Navbar */}

        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}

        <main className="flex-1">

          <Outlet />

        </main>

      </div>

    </div>

  );

}

export default PublicLayout;