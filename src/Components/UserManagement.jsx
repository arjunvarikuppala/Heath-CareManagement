import { useEffect, useState }
from "react";

import axios
from "axios";

import { useNavigate }
from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL;

const inputClassName =
  "h-12 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none";

const selectClassName =
  "h-12 rounded-2xl bg-[#0B1120] border border-white/10 px-4 outline-none";

function UserManagement({

  role,

  title,

  groupedBy

}) {

  const navigate =
    useNavigate();

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [editingUser, setEditingUser] =
    useState(null);

  const [editForm, setEditForm] =
    useState({});

  const [editLoading, setEditLoading] =
    useState(false);

  const [editMessage, setEditMessage] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const canEdit =
    role === "doctor" ||
    role === "receptionist";

  // FETCH USERS

  useEffect(() => {

    const fetchUsers =
      async () => {

        try {

          const endpoint =

            role === "doctor"

            ?

            "doctors"

            :

            role === "receptionist"

            ?

            "receptionists"

            :

            "patients";

          const res =
            await axios.get(

`${BASE_URL}/admin-api/${endpoint}`,

              {

                withCredentials: true

              }

            );

          setUsers(
            res.data.payload
          );

          setSelectedUser(null);

        }

        catch (error) {

          console.log(error);

        }

        finally {

          setLoading(false);

        }

      };

    fetchUsers();

  }, [role]);

  const toggleUserStatus =
    async (user) => {

      try {

        const endpoint =
          user.isActive
          ? "block-user"
          : "unblock-user";

        const res =
          await axios.put(

`${BASE_URL}/admin-api/${endpoint}/${user._id}`,

            {},

          {

            withCredentials: true

          }

        );

        setUsers((currentUsers) =>

          currentUsers.map(

            (currentUser) =>

              currentUser._id === user._id
              ? res.data.payload
              : currentUser

          )

        );

        setSelectedUser((currentUser) =>

          currentUser?._id === user._id
          ? res.data.payload
          : currentUser

        );

      }

      catch (error) {

        console.log(error);

      }

    };

  const openEditModal =
    (user) => {

      setEditingUser(user);

      setEditMessage("");

      setEditForm({

        name:
          user.name || "",

        phone:
          user.phone || "",

        age:
          user.age || "",

        gender:
          user.gender || "",

        email:
          user.email || "",

        oldPassword: "",

        password: "",

        specialization:
          user.specialization || "",

        experience:
          user.experience || "",

        profilePhoto: null

      });

    };

  const closeEditModal =
    () => {

      setEditingUser(null);

      setEditForm({});

      setEditMessage("");

    };

  const handleEditChange =
    (event) => {

      const {
        name,
        value,
        files,
        type
      } = event.target;

      setEditForm((currentForm) => ({

        ...currentForm,

        [name]:
          type === "file"
          ? files?.[0] || null
          : value

      }));

    };

  const updateUser =
    async (event) => {

      event.preventDefault();

      if (!editingUser || !canEdit) {

        return;

      }

      try {

        setEditLoading(true);

        setEditMessage("");

        const endpoint =
          role === "doctor"
          ? "update-doctor"
          : "update-receptionist";

        const formData =
          new FormData();

        const fields = [

          "name",

          "phone",

          "age",

          "gender",

          "email"

        ];

        if (role === "doctor") {

          fields.push(
            "specialization",
            "experience"
          );

        }

        fields.forEach((field) => {

          formData.append(
            field,
            editForm[field] || ""
          );

        });

        if (editForm.password) {

          formData.append(
            "oldPassword",
            editForm.oldPassword || ""
          );

          formData.append(
            "password",
            editForm.password
          );

        }

        if (editForm.profilePhoto) {

          formData.append(
            "profilePhoto",
            editForm.profilePhoto
          );

        }

        const res =
          await axios.put(

`${BASE_URL}/admin-api/${endpoint}/${editingUser._id}`,

            formData,

            {
              withCredentials: true,
              timeout: 120000
            }

          );

        setUsers((currentUsers) =>

          currentUsers.map((user) =>

            user._id === editingUser._id
            ? res.data.payload
            : user

          )

        );

        setSelectedUser((currentUser) =>

          currentUser?._id === editingUser._id
          ? res.data.payload
          : currentUser

        );

        closeEditModal();

      }

      catch (error) {

        console.log(error);

        setEditMessage(

          error.response?.data
          ?.message

          ||

          "Something went wrong"

        );

      }

      finally {

        setEditLoading(false);

      }

    };

  // GROUP USERS

  const groupedUsers =

    groupedBy

    ?

    users.reduce(

        (acc, user) => {

          const key =
            user[groupedBy]
            || "Other";

          if (!acc[key]) {

            acc[key] = [];

          }

          acc[key].push(user);

          return acc;

        },

        {}

      )

    :

    { All: users };

  return (

    <div

      className="min-h-screen
      bg-[#050816]
      text-white
      p-10"

    >

      {/* TITLE */}

      <div

        className="flex
        items-center
        justify-between"

      >

        <h1

          className="text-5xl
          font-black"

        >

          {title}

        </h1>

        {/* BACK BUTTON */}

        <button

          onClick={() =>
            navigate(
              "/admin"
            )
          }

          className="bg-cyan-400
          text-black
          px-5 py-3
          rounded-2xl
          font-black"

        >

          Back

        </button>

      </div>

      {/* EMPTY STATE */}

      {

        !loading

        &&

        users.length === 0

        &&

        <div

          className="mt-20
          text-center
          text-gray-400
          text-2xl"

        >

          No {title.toLowerCase()} found

        </div>

      }

      {/* LOADING */}

      {

        loading

        ?

        <div className="mt-10">

          Loading...

        </div>

        :

        <div className="mt-14">

          {

            Object.keys(
              groupedUsers
            ).map(

              (group) => (

                <div
                  key={group}
                  className="mb-16"
                >

                  {/* GROUP TITLE */}

                  {

                    groupedBy

                    &&

                    <h2

                      className="text-3xl
                      font-black
                      text-cyan-400"

                    >

                      {group}

                    </h2>

                  }

                  {/* USER CARDS */}

                  <div

                    className="grid
                    grid-cols-4
                    gap-5 mt-8"

                  >

                    {

                      groupedUsers[
                        group
                      ].map(

                        (user) => (

                          <button

                            key={user._id}

                            type="button"

                            onClick={() =>
                              setSelectedUser(user)
                            }

                            className={`bg-white/5
                            border
                            ${
                              selectedUser?._id ===
                              user._id
                              ? "border-cyan-400/60"
                              : "border-white/10"
                            }
                            rounded-3xl
                            p-4
                            text-left
                            transition
                            hover:border-cyan-400/30
                            hover:bg-white/10`}

                          >

                            {/* IMAGE */}

                            <img

                              src={
                                user.profilePhoto
                              }

                              alt={user.name}

                              className="w-full
                              h-44
                              object-cover
                              rounded-2xl
                              bg-gray-800"

                              onError={(e) => {

                                e.target.src =
"https://via.placeholder.com/300x200?text=No+Image";

                              }}

                            />

                            {/* NAME */}

                            <h2

                              className="text-2xl
                              font-black mt-5"

                            >

                              {user.name}

                            </h2>

                            {/* EXTRA INFO */}

                            {

                              role === "doctor"

                              ?

                              <p

                                className="text-gray-400
                                mt-2 text-sm"

                              >

                                Experience:
                                {" "}

                                {
                                  user.experience
                                }

                                {" "}
                                years

                              </p>

                              :

                              role === "receptionist"

                              ?

                              <p

                                className="text-gray-400
                                mt-2 text-sm"

                              >

                                {user.phone}

                              </p>

                              :

                              <p

                                className="text-gray-400
                                mt-2 text-sm"

                              >

                                Age:
                                {" "}

                                {user.age}

                              </p>

                            }

                            {/* EMAIL */}

                            <p

                              className="text-cyan-400
                              mt-2 text-sm"

                            >

                              {user.email}

                            </p>

                            <div
                              className={`mt-5
                              w-fit
                              rounded-full
                              px-4 py-2
                              text-xs
                              font-black
                              ${
                                user.isActive
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-red-400/10 text-red-300"
                              }`}
                            >

                              {
                                user.isActive
                                ? "Active"
                                : "Blocked"
                              }

                            </div>

                          </button>

                        )

                      )

                    }

                  </div>

                </div>

              )

            )

          }

        </div>

      }

      {

        selectedUser

        &&

        <div
          className="fixed
          right-6
          bottom-6
          z-40
          w-[360px]
          rounded-3xl
          border border-cyan-400/20
          bg-[#0B1120]/95
          p-5
          shadow-2xl
          shadow-cyan-950/40
          backdrop-blur-xl"
        >

          <div
            className="flex
            items-start
            gap-4"
          >

            <img
              src={selectedUser.profilePhoto}
              alt={selectedUser.name}
              className="w-16
              h-16
              rounded-2xl
              object-cover
              bg-gray-800"
              onError={(e) => {

                e.target.src =
"https://via.placeholder.com/120?text=User";

              }}
            />

            <div className="min-w-0 flex-1">

              <p
                className="text-xs
                uppercase
                tracking-[0.25em]
                text-cyan-300"
              >

                Selected {role}

              </p>

              <h3
                className="text-2xl
                font-black
                mt-1
                truncate"
              >

                {selectedUser.name}

              </h3>

              <p
                className="text-sm
                text-gray-400
                truncate"
              >

                {selectedUser.email}

              </p>

            </div>

          </div>

          <div
            className="mt-5
            grid grid-cols-2
            gap-3
            text-sm"
          >

            <div
              className="rounded-2xl
              bg-white/5
              p-3"
            >

              <p className="text-gray-500">
                Phone
              </p>

              <p className="font-bold mt-1">
                {selectedUser.phone}
              </p>

            </div>

            <div
              className="rounded-2xl
              bg-white/5
              p-3"
            >

              <p className="text-gray-500">
                Status
              </p>

              <p
                className={
                  selectedUser.isActive
                  ? "font-bold mt-1 text-emerald-300"
                  : "font-bold mt-1 text-red-300"
                }
              >

                {
                  selectedUser.isActive
                  ? "Active"
                  : "Blocked"
                }

              </p>

            </div>

          </div>

          <div
            className="flex
            gap-3
            mt-5"
          >

            {
              canEdit

              &&

              <button
                type="button"
                onClick={() =>
                  openEditModal(selectedUser)
                }
                className="flex-1
                h-11
                rounded-2xl
                bg-blue-500
                text-sm
                font-black"
              >

                Edit

              </button>
            }

            <button
              type="button"
              onClick={() =>
                toggleUserStatus(selectedUser)
              }
              className={`flex-1
              h-11
              rounded-2xl
              ${
                selectedUser.isActive
                ? "bg-red-500"
                : "bg-emerald-500"
              }
              text-sm
              font-black`}
            >

              {
                selectedUser.isActive
                ? "Block"
                : "Unblock"
              }

            </button>

          </div>

        </div>

      }

      {

        editingUser

        &&

        <div
          className="fixed inset-0
          z-50
          bg-black/70
          flex items-center
          justify-center
          px-6"
        >

          <form
            onSubmit={updateUser}
            className="w-full
            max-w-3xl
            bg-[#050816]
            border border-white/10
            rounded-3xl
            p-8"
          >

            <div
              className="flex
              items-center
              justify-between
              gap-4"
            >

              <h2
                className="text-3xl
                font-black"
              >

                Edit {editingUser.name}

              </h2>

              <button
                type="button"
                onClick={closeEditModal}
                className="h-11
                px-5
                rounded-2xl
                bg-white/10
                font-black"
              >

                Close

              </button>

            </div>

            {
              editMessage

              &&

              <div
                className="mt-5
                bg-red-500/10
                border border-red-500/20
                text-red-300
                p-4 rounded-2xl"
              >

                {editMessage}

              </div>
            }

            <div
              className="grid
              grid-cols-2
              gap-5
              mt-8"
            >

              <input
                name="name"
                value={editForm.name || ""}
                onChange={handleEditChange}
                placeholder="Name"
                className={inputClassName}
              />

              <input
                name="phone"
                value={editForm.phone || ""}
                onChange={handleEditChange}
                placeholder="Phone"
                className={inputClassName}
              />

              <input
                type="number"
                name="age"
                value={editForm.age || ""}
                onChange={handleEditChange}
                placeholder="Age"
                className={inputClassName}
              />

              <select
                name="gender"
                value={editForm.gender || ""}
                onChange={handleEditChange}
                className={selectClassName}
              >

                <option value="">
                  Gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

              </select>

              {
                role === "doctor"

                &&

                <>

                  <input
                    name="specialization"
                    value={editForm.specialization || ""}
                    onChange={handleEditChange}
                    placeholder="Specialization"
                    className={inputClassName}
                  />

                  <input
                    type="number"
                    name="experience"
                    value={editForm.experience || ""}
                    onChange={handleEditChange}
                    placeholder="Experience"
                    className={inputClassName}
                  />

                </>
              }

              <input
                type="email"
                name="email"
                value={editForm.email || ""}
                onChange={handleEditChange}
                placeholder="Email"
                className={inputClassName}
              />

              <input
                type="password"
                name="oldPassword"
                value={editForm.oldPassword || ""}
                onChange={handleEditChange}
                placeholder="Old Password"
                required={Boolean(
                  editForm.password
                )}
                className={inputClassName}
              />

              <input
                type="password"
                name="password"
                value={editForm.password || ""}
                onChange={handleEditChange}
                placeholder="New Password"
                className={inputClassName}
              />

              <input
                type="file"
                name="profilePhoto"
                onChange={handleEditChange}
                className="col-span-2
                h-12 rounded-2xl
                bg-white/5
                border border-white/10
                px-4 py-3 outline-none"
              />

            </div>

            <button
              type="submit"
              disabled={editLoading}
              className="mt-7
              w-full
              h-14
              rounded-2xl
              bg-cyan-400
              text-black
              font-black"
            >

              {
                editLoading

                ?

                "Saving..."

                :

                "Save Changes"
              }

            </button>

          </form>

        </div>

      }

    </div>

  );

}

export default UserManagement;
