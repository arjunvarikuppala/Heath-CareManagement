import { Navigate } from "react-router-dom";

import { useEffect } from "react";

import { useAuthStore } from '../store/AuthStore'

function ProtectedRoute({

  children,

  allowedRole

}) {

  const {

    currentUser,

    checkAuth,

    checkingAuth

  } = useAuthStore();

  // RUN AUTH CHECK ONLY ONCE

  useEffect(() => {

    checkAuth();

    // eslint-disable-next-line

  }, []);

  // SHOW LOADING

  if (checkingAuth) {

    return (

      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">

        Loading...

      </div>

    );

  }

  // NOT LOGGED IN

  if (!currentUser) {

    return <Navigate to="/login" replace />;

  }

  // ROLE CHECK

  const allowedRoles =

    Array.isArray(allowedRole)

      ? allowedRole

      : [allowedRole];

  const userRole =

    currentUser.role
      ?.trim()
      ?.toLowerCase();

  const hasAccess =

    allowedRoles.some(

      role =>

        role
          ?.trim()
          ?.toLowerCase()

        ===

        userRole

    );

  // BLOCK WRONG ROLE

  if (!hasAccess) {

    return <Navigate to="/" replace />;

  }

  return children;

}

export default ProtectedRoute;