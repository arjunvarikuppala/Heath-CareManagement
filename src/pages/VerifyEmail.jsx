import { useEffect, useState }
from "react";

import axios
from "axios";

import { useParams }
from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL;

function VerifyEmail() {

  const { token } =
    useParams();

  const [status, setStatus] =
    useState("loading");
  const [message, setMessage] =
    useState("");

  // VERIFY EMAIL

  useEffect(() => {

    const verifyEmail =
      async () => {

        try {

          const res =
            await axios.get(

`${BASE_URL}/common-api/verify-email/${token}`

          );

          setStatus("success");
          setMessage(
            res.data.purpose === "patient-registration"
              ? "Email verified. Return to registration and click I verified."
              : "Your account is now verified."
          );

        }

        catch (error) {

          console.log(error);

          setStatus("failed");

        }

      };

    verifyEmail();

  }, [token]);

  return (

    <div

      className="min-h-screen
      bg-[#050816]
      flex items-center
      justify-center
      text-white"

    >

      <div

        className="bg-white/5
        border border-white/10
        rounded-3xl p-12
        text-center"

      >

        {

          status === "loading"

          &&

          <h1

            className="text-3xl
            font-bold"

          >

            Verifying Email...

          </h1>

        }

        {

          status === "success"

          &&

          <div>

            <h1

              className="text-5xl
              font-black
              text-cyan-400"

            >

              Email Verified

            </h1>

            <p

              className="mt-6
              text-gray-400
              text-xl"

            >

              {message}

            </p>

          </div>

        }

        {

          status === "failed"

          &&

          <div>

            <h1

              className="text-5xl
              font-black
              text-red-400"

            >

              Verification Failed

            </h1>

            <p

              className="mt-6
              text-gray-400
              text-xl"

            >

              Invalid or expired link.

            </p>

          </div>

        }

      </div>

    </div>

  );

}

export default VerifyEmail;
