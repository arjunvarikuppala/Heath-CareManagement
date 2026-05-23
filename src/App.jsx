import { Routes, Route, Navigate}
from "react-router-dom";

import PublicLayout
from "./layouts/PublicLayout";

import AdminLayout
from "./layouts/AdminLayout";

import Home
from "./pages/HomePage";

import Register
from "./pages/Register";

import Login
from "./pages/Login";

import VerifyEmail
from "./pages/VerifyEmail";

import CheckEmail
from "./pages/CheckEmail";

import ForgotPassword
from "./pages/ForgotPassword";

import ResetPassword
from "./pages/ResetPassword";

import ProtectedRoute
from "./Components/ProtectedRoute";

// ADMIN

import AdminDashboard
from "./Dashboards/Admin/AdminDashboard";

import AdminRegisterDoctor
from "./Dashboards/Admin/AdmminRegisterDoctor";

import AdminRegisterReceptionist
from "./Dashboards/Admin/AdminReceptionistRegister";

import AdminDoctors
from "./Dashboards/Admin/AdminDoctor";

import AdminReceptionists
from "./Dashboards/Admin/AdminReceptionist";

import AdminPatients
from "./Dashboards/Admin/AdminPatient";

import AdminAppointments
from "./Dashboards/Admin/AdminAppointments";

// OTHER DASHBOARDS

import DoctorDashboard
from "./Dashboards/DoctorDashboard";

import PatientDashboard
from "./Dashboards/PatientDashboard";

import ReceptionistDashboard
from "./Dashboards/Receptionist";

function App() {

  return (

    <Routes>

      {/* PUBLIC ROUTES */}

      <Route
        element={<PublicLayout />}
      >

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/check-email"
          element={<CheckEmail />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route
          path="/verify-email/:token"
          element={<VerifyEmail />}
        />

      </Route>

      {/* DOCTOR */}

      <Route

        path="/doctor"

        element={

          <ProtectedRoute
            allowedRole="doctor"
          >

            <DoctorDashboard />

          </ProtectedRoute>

        }

      />

      {/* PATIENT */}

      <Route

        path="/patient"

        element={

          <ProtectedRoute
            allowedRole="patient"
          >

            <PatientDashboard />

          </ProtectedRoute>

        }

      />

      {/* RECEPTIONIST */}

      <Route

        path="/receptionist"

        element={

          <ProtectedRoute
            allowedRole="receptionist"
          >

            <ReceptionistDashboard />

          </ProtectedRoute>

        }

      />

      {/* ADMIN */}

      <Route

        path="/admin"

        element={

          <ProtectedRoute
            allowedRole="admin"
          >

            <AdminLayout />

          </ProtectedRoute>

        }

      >

        {/* DASHBOARD */}

        <Route
          index
          element={<AdminDashboard />}
        />

        {/* CREATE DOCTOR */}

        <Route
          path="create-doctor"
          element={
            <AdminRegisterDoctor />
          }
        />

        {/* CREATE RECEPTIONIST */}

        <Route
          path="create-receptionist"
          element={
            <AdminRegisterReceptionist />
          }
        />

        {/* DOCTORS */}

        <Route
          path="doctors"
          element={<AdminDoctors />}
        />

        {/* RECEPTIONISTS */}

        <Route
          path="receptionists"
          element={<AdminReceptionists />}
        />

        {/* PATIENTS */}

        <Route
          path="patients"
          element={<AdminPatients />}
        />

        <Route
          path="appointments"
          element={<AdminAppointments />}
        />

      </Route>
      <Route
        path="*"
        element={<Navigate to="/" replace />}
/>
    </Routes>

  );

}

export default App;
