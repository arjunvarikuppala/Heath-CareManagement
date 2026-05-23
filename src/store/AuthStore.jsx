import axios from "axios";

import { create } from "zustand";

const BASE_URL =
  import.meta.env.VITE_API_URL;

// GLOBAL AXIOS CONFIG

axios.defaults.withCredentials = true;

// SAFE LOCALSTORAGE PARSE

const getStoredUser = () => {

  try {

    const user =
      localStorage.getItem("currentUser");

    return user
      ? JSON.parse(user)
      : null;

  }

  catch {

    return null;

  }

};

export const useAuthStore =
  create((set) => ({

    // INITIAL STATE

    currentUser:
      getStoredUser(),

    isAuthenticated:
      Boolean(getStoredUser()),

    loading: false,

    checkingAuth: true,

    authChecked: false,

    error: null,

    // CHECK AUTH

    checkAuth: async () => {

      try {

        set({

          checkingAuth: true,

          error: null

        });

        const res =
          await axios.get(

            `${BASE_URL}/common-api/check-auth`

          );

        localStorage.setItem(

          "currentUser",

          JSON.stringify(
            res.data.payload
          )

        );

        set({

          currentUser:
            res.data.payload,

          isAuthenticated: true,

          checkingAuth: false,

          authChecked: true,

          error: null

        });

      }

      catch (error) {

        console.log(
          "AUTH CHECK FAILED:",
          error?.response?.data
        );

        localStorage.removeItem(
          "currentUser"
        );

        set({

          currentUser: null,

          isAuthenticated: false,

          checkingAuth: false,

          authChecked: true

        });

      }

    },

    // LOGIN

    login: async (userCredObj) => {

      try {

        set({

          loading: true,

          error: null

        });

        const res =
          await axios.post(

            `${BASE_URL}/common-api/authenticate`,

            userCredObj

          );

        localStorage.setItem(

          "currentUser",

          JSON.stringify(
            res.data.payload
          )

        );

        set({

          currentUser:
            res.data.payload,

          isAuthenticated: true,

          loading: false,

          authChecked: true,

          error: null

        });

        return {

          success: true

        };

      }

      catch (error) {

        const message =

          error.response?.data?.message ||

          "Login failed";

        localStorage.removeItem(
          "currentUser"
        );

        set({

          currentUser: null,

          isAuthenticated: false,

          loading: false,

          authChecked: true,

          error: message

        });

        return {

          success: false,

          message

        };

      }

    },

    // LOGOUT

    logout: async () => {

      try {

        await axios.get(

          `${BASE_URL}/common-api/logout`

        );

      }

      catch (error) {

        console.log(
          "LOGOUT ERROR:",
          error
        );

      }

      finally {

        localStorage.removeItem(
          "currentUser"
        );

        set({

          currentUser: null,

          isAuthenticated: false,

          authChecked: true,

          checkingAuth: false,

          error: null

        });

      }

    }

  }));

// SESSION EXPIRED EVENT

if (typeof window !== "undefined") {

  window.addEventListener(

    "auth:expired",

    () => {

      localStorage.removeItem(
        "currentUser"
      );

      useAuthStore.setState({

        currentUser: null,

        isAuthenticated: false,

        authChecked: true,

        checkingAuth: false,

        error:
          "Session expired. Please login again"

      });

    }

  );

}