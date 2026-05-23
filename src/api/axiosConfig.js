import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("currentUser");
      window.dispatchEvent(
        new CustomEvent("auth:expired")
      );
    }

    return Promise.reject(error);
  }
);
