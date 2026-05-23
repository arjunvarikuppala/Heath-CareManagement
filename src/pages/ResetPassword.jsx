import axios from "axios";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL;

function ResetPassword() {

  const { token } =
    useParams();
  const [password, setPassword] =
    useState("");
  const [message, setMessage] =
    useState("");

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      try {

        const res =
          await axios.put(
            `${BASE_URL}/common-api/reset-password/${token}`,
            {
              password
            }
          );

        setMessage(res.data.message);

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to reset password"
        );

      }

    };

  return (

    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-4xl font-black">
          Reset Password
        </h1>
        <p className="text-gray-400 mt-3">
          Choose a new password for your CareSync account.
        </p>
        {message && (
          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
            {message}
          </div>
        )}
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="New password"
          className="w-full mt-8 h-14 rounded-2xl bg-white/5 border border-white/10 px-5 outline-none focus:border-cyan-400"
        />
        <button className="w-full mt-5 h-14 rounded-2xl bg-cyan-400 text-black font-black">
          Reset Password
        </button>
        <Link
          to="/login"
          className="block mt-5 text-center text-cyan-300 font-bold"
        >
          Back to login
        </Link>
      </form>
    </div>

  );

}

export default ResetPassword;
