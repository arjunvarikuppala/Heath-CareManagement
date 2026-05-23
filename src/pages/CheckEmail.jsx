import { useSearchParams }
from "react-router-dom";

function CheckEmail() {

  const [searchParams] =
    useSearchParams();

  const email =
    searchParams.get("email");

  return (

    <div

      className="min-h-screen
      bg-[#050816]
      flex items-center
      justify-center
      text-white px-6"

    >

      <div

        className="bg-white/5
        border border-white/10
        rounded-3xl p-12
        text-center max-w-xl"

      >

        <h1

          className="text-5xl
          font-black text-cyan-400"

        >

          Verification Email Sent

        </h1>

        <p

          className="mt-6 text-gray-400
          text-xl leading-relaxed"

        >

          Please check your email:

        </p>

        <p

          className="mt-4
          text-cyan-300 text-lg"

        >

          {email}

        </p>

      </div>

    </div>

  );

}

export default CheckEmail;