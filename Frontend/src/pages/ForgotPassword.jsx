import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL;

function ForgotPassword() {

  const [email, setEmail] =
    useState("");
  const [message, setMessage] =
    useState("");

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      try {

        const res =
          await axios.post(
            `${BASE_URL}/common-api/forgot-password`,
            {
              email
            }
          );

        setMessage(res.data.message);

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Unable to send reset link"
        );

      }

    };

  return (

    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-4xl font-black">
          Forgot Password
        </h1>
        <p className="text-gray-400 mt-3">
          Enter your account email and we will send a reset link.
        </p>
        {message && (
          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
            {message}
          </div>
        )}
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Email address"
          className="w-full mt-8 h-14 rounded-2xl bg-white/5 border border-white/10 px-5 outline-none focus:border-cyan-400"
        />
        <button className="w-full mt-5 h-14 rounded-2xl bg-cyan-400 text-black font-black">
          Send Reset Link
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

export default ForgotPassword;
