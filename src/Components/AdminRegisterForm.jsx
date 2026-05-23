import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

const BASE_URL =
  import.meta.env.VITE_API_URL;

const textInputClassName =
  "h-14 rounded-2xl bg-white/5 border border-white/10 px-5 outline-none";

const selectClassName =
  "h-14 rounded-2xl bg-[#0B1120] border border-white/10 px-5 outline-none";

const fileInputClassName =
  "col-span-2 h-14 rounded-2xl bg-white/5 border border-white/10 px-5 py-3 outline-none";

const baseFields = [
  {
    name: "name",
    type: "text",
    placeholder: "Name"
  },
  {
    name: "phone",
    type: "text",
    placeholder: "Phone"
  },
  {
    name: "age",
    type: "number",
    placeholder: "Age"
  },
  {
    name: "gender",
    type: "select",
    placeholder: "Gender",
    options: [
      {
        value: "male",
        label: "Male"
      },
      {
        value: "female",
        label: "Female"
      }
    ]
  }
];

const accountFields = [
  {
    name: "email",
    type: "email",
    placeholder: "Email"
  },
  {
    name: "password",
    type: "password",
    placeholder: "Password"
  },
  {
    name: "profilePhoto",
    type: "file"
  }
];

function AdminRegisterForm({
  title,
  endpoint,
  submitLabel,
  extraFields = []
}) {

  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const fields = [
    ...baseFields,
    ...extraFields,
    ...accountFields
  ];

  const onSubmit =
    async (formValues) => {

      try {

        setLoading(true);

        setMessage("");

        const formData =
          new FormData();

        Object.keys(formValues)
        .forEach((key) => {

          if (key === "profilePhoto") {

            formData.append(
              key,
              formValues[key][0]
            );

          }

          else {

            formData.append(
              key,
              formValues[key]
            );

          }

        });

        const res =
          await axios.post(

            `${BASE_URL}${endpoint}`,

            formData,

            {
              withCredentials: true,
              timeout: 120000
            }

          );

        setMessage(
          res.data.message
        );

        reset();

      }

      catch (error) {

        console.log(error);

        setMessage(

          error.response?.data
          ?.message

          ||

          "Something went wrong"

        );

      }

      finally {

        setLoading(false);

      }

    };

  return (

    <div
      className="min-h-screen
      bg-[#050816]
      text-white
      flex items-center
      justify-center
      px-6 py-20"
    >

      <div
        className="w-full
        max-w-5xl
        bg-white/5
        border border-white/10
        rounded-3xl
        p-10"
      >

        <h1
          className="text-5xl
          font-black"
        >

          {title}

        </h1>

        {
          message

          &&

          <div
            className="mt-6
            bg-cyan-400/10
            border border-cyan-400/20
            text-cyan-300
            p-4 rounded-2xl"
          >

            {message}

          </div>
        }

        <form

          onSubmit={handleSubmit(
            onSubmit
          )}

          className="mt-10
          grid grid-cols-2
          gap-6"
        >

          {
            fields.map((field) => {

              if (field.type === "select") {

                return (

                  <select
                    key={field.name}

                    {...register(field.name)}

                    className={selectClassName}
                  >

                    <option value="">
                      {field.placeholder}
                    </option>

                    {
                      field.options.map((option) => (

                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>

                      ))
                    }

                  </select>

                );

              }

              return (

                <input
                  key={field.name}
                  type={field.type}
                  placeholder={field.placeholder}

                  {...register(field.name)}

                  className={
                    field.type === "file"
                    ? fileInputClassName
                    : textInputClassName
                  }
                />

              );

            })
          }

          <button

            type="submit"

            disabled={loading}

            className="col-span-2
            h-16 rounded-2xl
            bg-cyan-400
            text-black
            text-xl font-black"
          >

            {
              loading

              ?

              "Registering..."

              :

              submitLabel
            }

          </button>

        </form>

      </div>

    </div>

  );

}

export default AdminRegisterForm;
