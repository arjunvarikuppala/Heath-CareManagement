import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

function Login() {

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();

  const {
    login,
    loading,
    error
  } = useAuthStore();

  // SUBMIT

  const onFormSubmit = async (userCredObj) => {

    const result =
      await login(userCredObj);

    if (result.success) {

      const role =
        useAuthStore
        .getState()
        .currentUser
        .role;

      if (role === "admin") {

        navigate("/admin");

      }

      else if (role === "doctor") {

        navigate("/doctor");

      }

      else if (role === "patient") {

        navigate("/patient");

      }

      else if (
        role === "receptionist"
      ) {

        navigate("/receptionist");

      }

    }

  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* BACKGROUND */}

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* MAIN */}

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">

        {/* LEFT */}

        <div className="hidden lg:flex flex-col justify-center px-20">

          <span

            className="bg-cyan-400/10 border border-cyan-400/20
            text-cyan-300 px-5 py-2 rounded-full
            text-sm font-semibold w-fit backdrop-blur-xl"

          >

            WELCOME BACK

          </span>

          <h1 className="text-7xl font-black leading-tight mt-10">

            Smart Healthcare

            <span className="text-cyan-400">

              {" "}Access

            </span>

          </h1>

          <p className="text-gray-400 text-xl leading-relaxed mt-10 max-w-xl">

            Continue managing appointments,
            healthcare operations, and patient
            workflows through the CareSync platform.

          </p>

        </div>

        {/* RIGHT */}

        <div className="flex items-center justify-center px-6 py-20">

          <div

            className="w-full max-w-xl bg-white/5
            border border-white/10 backdrop-blur-2xl
            rounded-[2.5rem] p-10 shadow-2xl"

          >

            {/* HEADER */}

            <div>

              <h1 className="text-5xl font-black">

                Login

              </h1>

              <p className="text-gray-400 mt-4 text-lg">

                Access your CareSync account.

              </p>

            </div>

            {/* ERROR */}

            {error && (

              <div

                className="mt-6 bg-red-500/10
                border border-red-500/20
                text-red-400 p-4 rounded-2xl"

              >

                {error}

              </div>

            )}

            {/* FORM */}

            <form

              onSubmit={handleSubmit(
                onFormSubmit
              )}

              autoComplete="on"

              className="mt-12 flex flex-col gap-6"

            >

              {/* EMAIL */}

              <div>

                <label className="text-sm text-gray-400">

                  Email Address

                </label>

                <input

                  type="email"

                  autoComplete="username"

                  placeholder="Enter email"

                  {...register("email", {

                    required:
                      "Email is required"

                  })}

                  className="w-full mt-3 h-16 rounded-2xl
                  bg-white/5 border border-white/10
                  px-6 text-lg outline-none
                  focus:border-cyan-400 transition"

                />

                {errors.email && (

                  <p className="text-red-400 text-sm mt-2">

                    {errors.email.message}

                  </p>

                )}

              </div>

              {/* PASSWORD */}

              <div>

                <label className="text-sm text-gray-400">

                  Password

                </label>

                <input

                  type="password"

                  autoComplete="current-password"

                  placeholder="Enter password"

                  {...register("password", {

                    required:
                      "Password is required"

                  })}

                  className="w-full mt-3 h-16 rounded-2xl
                  bg-white/5 border border-white/10
                  px-6 text-lg outline-none
                  focus:border-cyan-400 transition"

                />

                {errors.password && (

                  <p className="text-red-400 text-sm mt-2">

                    {errors.password.message}

                  </p>

                )}

                <Link
                  to="/forgot-password"
                  className="block text-right text-cyan-300 font-bold mt-3"
                >
                  Forgot password?
                </Link>

              </div>

              {/* BUTTON */}

              <button

                type="submit"

                disabled={loading}

                className="mt-4 h-16 rounded-2xl
                bg-gradient-to-r from-cyan-400 to-blue-500
                text-black text-lg font-black
                hover:scale-[1.02]
                transition duration-300
                shadow-2xl shadow-cyan-500/30
                disabled:opacity-50"

              >

                {

                  loading

                  ? "Logging In..."

                  : "Login"

                }

              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Login;
