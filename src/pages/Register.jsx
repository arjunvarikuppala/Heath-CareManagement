import {
  useEffect,
  useState
} from "react";
import {
  useForm,
  useWatch
} from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  useAuthStore
} from "../store/AuthStore";

const BASE_URL =
  import.meta.env.VITE_API_URL;

function Register() {

  const {

    register,
    handleSubmit,
    control,
    formState: { errors }

  } = useForm();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [fileError, setFileError] =
    useState(null);
  const [verificationMessage, setVerificationMessage] =
    useState("");
  const [emailVerified, setEmailVerified] =
    useState(false);
  const [verifiedEmail, setVerifiedEmail] =
    useState("");
  const [verificationRequested, setVerificationRequested] =
    useState(false);

  const navigate = useNavigate();
  const emailValue =
    useWatch({
      control,
      name: "email"
    });

  const isCurrentEmailVerified =
    emailVerified &&
    verifiedEmail === emailValue;

  useEffect(() => {

    if (
      !verificationRequested ||
      !emailValue ||
      isCurrentEmailVerified
    ) {

      return;

    }

    const checkStatus =
      async () => {

        try {

          const res =
            await axios.get(
              `${BASE_URL}/common-api/registration-verification-status`,
              {
                params: {
                  email: emailValue
                }
              }
            );

          if (res.data.verified) {

            setEmailVerified(true);
            setVerifiedEmail(emailValue);
            setVerificationRequested(false);
            setVerificationMessage(
              "Email verified. You can register now."
            );

          }

        } catch {

          // Keep polling quietly until the user edits the email or retries.

        }

      };

    const intervalId =
      setInterval(
        checkStatus,
        3000
      );

    window.addEventListener(
      "focus",
      checkStatus
    );

    checkStatus();

    return () => {

      clearInterval(intervalId);
      window.removeEventListener(
        "focus",
        checkStatus
      );

    };

  }, [
    emailValue,
    isCurrentEmailVerified,
    verificationRequested
  ]);

  // IMAGE PREVIEW

  const handleImagePreview = (e) => {

    const file =
      e.target.files?.[0];

    if (!file) return;

    // IMAGE VALIDATION

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setFileError(
        "Only image files allowed"
      );

      return;

    }

    setPreview(

      URL.createObjectURL(file)

    );

    setFileError(null);

  };

  // FORM SUBMIT

  const sendVerificationLink =
    async () => {

      setVerificationMessage("");
      setEmailVerified(false);
      setVerifiedEmail("");
      setVerificationRequested(false);

      if (!emailValue) {

        setVerificationMessage(
          "Enter email before sending verification link"
        );
        return;

      }

      try {

        const res =
          await axios.post(
            `${BASE_URL}/common-api/send-registration-verification`,
            {
              email: emailValue
            }
          );

        setVerificationMessage(
          res.data.message
        );
        setVerificationRequested(true);

      } catch (err) {

        setVerificationMessage(
          err.response?.data?.message ||
          "Unable to send verification link"
        );

      }

    };

  const onFormSubmit =
    async (patientData) => {

      if (!isCurrentEmailVerified) {

        setError(
          "Please verify your email before registration"
        );
        return;

      }

      setLoading(true);

      setError(null);

      try {

        const formData =
          new FormData();

        // REMOVE IMAGE

        const {

          profilePhoto,

          ...patientObj

        } = patientData;

        // APPEND NORMAL FIELDS

        Object.keys(patientObj)
        .forEach((key) => {

          formData.append(

            key,

            patientObj[key]

          );

        });

        // APPEND IMAGE

        if (profilePhoto?.[0]) {

          formData.append(

            "profilePhoto",

            profilePhoto[0]

          );

        }

        // API CALL

        const res =
          await axios.post(

`${BASE_URL}/patient-api/register`,

            formData,

            {

              withCredentials: true,

              timeout: 120000

            }

          );

        localStorage.setItem(
          "currentUser",
          JSON.stringify(res.data.payload)
        );

        useAuthStore.setState({
          currentUser:
            res.data.payload,
          isAuthenticated: true,
          authChecked: true,
          error: null
        });

        navigate("/patient");

      }

      catch (err) {

        const msg =

          err.response?.data?.message

          || "Registration failed";

        setError(msg);

      }

      finally {

        setLoading(false);

      }

    };

  return (

    <div

      className="relative min-h-screen
      overflow-hidden bg-[#050816]
      text-white"

    >

      {/* BACKGROUND */}

      <div

        className="absolute top-0 left-0
        w-[500px] h-[500px]
        bg-cyan-500/20 rounded-full
        blur-3xl -translate-x-1/2
        -translate-y-1/2"

      />

      <div

        className="absolute bottom-0 right-0
        w-[500px] h-[500px]
        bg-blue-500/20 rounded-full
        blur-3xl translate-x-1/2
        translate-y-1/2"

      />

      {/* MAIN */}

      <div

        className="relative z-10
        grid lg:grid-cols-2
        min-h-screen"

      >

        {/* LEFT */}

        <div

          className="hidden lg:sticky
          lg:top-0 lg:flex
          h-screen flex-col
          justify-start
          px-20 pt-24"

        >

          <span

            className="bg-cyan-400/10
            border border-cyan-400/20
            text-cyan-300 px-5 py-2
            rounded-full text-sm
            font-semibold w-fit
            backdrop-blur-xl"

          >

            JOIN CARESYNC

          </span>

          <h1

            className="text-7xl
            font-black leading-tight
            mt-10"

          >

            Future Of

            <span className="text-cyan-400">

              {" "}Healthcare

            </span>

          </h1>

          <p

            className="text-gray-400
            text-xl leading-relaxed
            mt-10 max-w-xl"

          >

            Experience intelligent
            hospital management,
            smart healthcare workflows,
            and seamless patient
            experiences through the
            CareSync platform.

          </p>

        </div>

        {/* RIGHT */}

        <div

          className="flex items-start
          justify-center px-6 py-10
          lg:py-14"

        >

          {/* CARD */}

          <div

            className="w-full max-w-lg
            bg-white/5 border
            border-white/10
            backdrop-blur-2xl
            rounded-3xl
            p-8 shadow-2xl"

          >

            {/* HEADER */}

            <div>

              <h1

                className="text-4xl
                font-black"

              >

                Create Account

              </h1>

              <p

                className="text-gray-400
                mt-3 text-base"

              >

                Register as a patient
                on CareSync.

              </p>

            </div>

            {/* ERROR */}

            {

              error

              &&

              <div

                className="mt-6
                bg-red-500/10
                border border-red-500/20
                text-red-400 p-4
                rounded-2xl"

              >

                {error}

              </div>

            }

            {/* FORM */}

            <form

              onSubmit={handleSubmit(
                onFormSubmit
              )}

              className="mt-8
              flex flex-col gap-4"

            >

              {/* NAME */}

              <div>

                <label

                  className="text-sm
                  text-gray-400"

                >

                  Full Name

                </label>

                <input

                  type="text"

                  placeholder=
                  "Enter full name"

                  {...register("name", {

                    required:
                      "Name is required"

                  })}

                  className="w-full mt-2
                  h-14 rounded-2xl
                  bg-white/5 border
                  border-white/10
                  px-5 text-base
                  outline-none
                  focus:border-cyan-400
                  transition"

                />

                {

                  errors.name

                  &&

                  <p

                    className="text-red-400
                    text-sm mt-2"

                  >

                    {
                      errors.name.message
                    }

                  </p>

                }

              </div>

              {/* PHONE */}

              <div>

                <label

                  className="text-sm
                  text-gray-400"

                >

                  Phone Number

                </label>

                <input

                  type="text"

                  placeholder=
                  "Enter phone number"

                  {...register("phone", {

                    required:
                      "Phone number required"

                  })}

                  className="w-full mt-2
                  h-14 rounded-2xl
                  bg-white/5 border
                  border-white/10
                  px-5 text-base
                  outline-none
                  focus:border-cyan-400
                  transition"

                />

              </div>

              {/* AGE */}

              <div>

                <label

                  className="text-sm
                  text-gray-400"

                >

                  Age

                </label>

                <input

                  type="number"

                  min="1"

                  placeholder=
                  "Enter age"

                  {...register("age", {

                    required:
                      "Age required",

                    min: {

                      value: 1,

                      message:
                        "Age must be greater than 0"

                    }

                  })}

                  className="w-full mt-2
                  h-14 rounded-2xl
                  bg-white/5 border
                  border-white/10
                  px-5 text-base
                  outline-none
                  focus:border-cyan-400
                  transition"

                />

                {

                  errors.age

                  &&

                  <p

                    className="text-red-400
                    text-sm mt-2"

                  >

                    {
                      errors.age.message
                    }

                  </p>

                }

              </div>

              {/* GENDER */}

              <div>

                <label

                  className="text-sm
                  text-gray-400"

                >

                  Gender

                </label>

                <select

                  {...register("gender", {

                    required:
                      "Gender required"

                  })}

                  className="w-full mt-2
                  h-14 rounded-2xl
                  bg-[#0B1120]
                  border border-white/10
                  px-5 text-base
                  outline-none
                  focus:border-cyan-400
                  transition"

                >

                  <option value="">

                    Select Gender

                  </option>

                  <option value="male">

                    Male

                  </option>

                  <option value="female">

                    Female

                  </option>

                  <option value="other">

                    Other

                  </option>

                </select>

              </div>

              {/* EMAIL */}

              <div>

                <label

                  className="text-sm
                  text-gray-400"

                >

                  Email Address

                </label>

                <input

                  type="email"

                  placeholder=
                  "Enter email"

                  {...register("email", {

                    required:
                      "Email required"

                  })}

                  className="w-full mt-2
                  h-14 rounded-2xl
                  bg-white/5 border
                  border-white/10
                  px-5 text-base
                  outline-none
                  focus:border-cyan-400
                  transition"

                />

                <div
                  className="mt-3 flex flex-wrap gap-3"
                >
                  <button
                    type="button"
                    onClick={sendVerificationLink}
                    className="h-10 rounded-2xl bg-cyan-400 px-4 text-sm font-black text-black"
                  >
                    Send verification link
                  </button>
                  {isCurrentEmailVerified && (
                    <span className="flex items-center rounded-full bg-green-400/10 px-4 text-sm font-bold text-green-200">
                      Verified
                    </span>
                  )}
                </div>

                {verificationMessage && (
                  <p
                    className="mt-2 text-sm text-cyan-200"
                  >
                    {verificationMessage}
                  </p>
                )}

              </div>

              {/* PASSWORD */}

              <div>

                <label

                  className="text-sm
                  text-gray-400"

                >

                  Password

                </label>

                <input

                  type="password"

                  placeholder=
                  "Create password"

                  {...register("password", {

                    required:
                      "Password required"

                  })}

                  className="w-full mt-2
                  h-14 rounded-2xl
                  bg-white/5 border
                  border-white/10
                  px-5 text-base
                  outline-none
                  focus:border-cyan-400
                  transition"

                />

              </div>

              {/* IMAGE */}

              <div>

                <label

                  className="text-sm
                  text-gray-400"

                >

                  Profile Photo

                </label>

                <div

                  className="mt-2
                  bg-white/5 border
                  border-white/10
                  rounded-2xl p-4"

                >

                  <input

                    type="file"

                    accept="image/*"

                    {...register(

                      "profilePhoto",

                      {

                        required:
                          "Profile photo required"

                      }

                    )}

                    onChange={
                      handleImagePreview
                    }

                    className="w-full
                    text-gray-400"

                  />

                  {

                    fileError

                    &&

                    <p

                      className="text-red-400
                      text-sm mt-3"

                    >

                      {fileError}

                    </p>

                  }

                  {

                    preview

                    &&

                    <div

                      className="flex
                      justify-center mt-6"

                    >

                      <img

                        src={preview}

                        alt="preview"

                        className="w-20 h-20
                        rounded-full
                        object-cover
                        border
                        border-white/10"

                      />

                    </div>

                  }

                </div>

              </div>

              {/* BUTTON */}

              <button

                type="submit"

                disabled={loading || !isCurrentEmailVerified}

                className="mt-3 h-14
                rounded-2xl
                bg-gradient-to-r
                from-cyan-400
                to-blue-500
                text-black text-lg
                font-black
                hover:scale-[1.02]
                transition duration-300
                shadow-2xl
                shadow-cyan-500/30
                disabled:opacity-50"

              >

                {

                  loading

                  ? "Creating Account..."

                  : "Create Account"

                }

              </button>

            </form>

            {/* LOGIN */}

            <div

            className="text-center mt-7"

            >

              <p

                className="text-gray-400"

              >

                Already have an account?

              </p>

              <button

                onClick={() =>
                  navigate("/login")
                }

                className="mt-3 px-5 py-2
                rounded-2xl bg-white/5
                border border-white/10
                hover:bg-white/10
                transition"

              >

                Login

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Register;
