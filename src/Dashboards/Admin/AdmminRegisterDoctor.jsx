import AdminRegisterForm from "../../Components/AdminRegisterForm";

const doctorFields = [
  {
    name: "specialization",
    type: "text",
    placeholder: "Specialization"
  },
  {
    name: "experience",
    type: "number",
    placeholder: "Experience"
  }
];

function AdminRegisterDoctor() {

  return (

    <AdminRegisterForm
      title="Register Doctor"
      endpoint="/admin-api/create-doctor"
      submitLabel="Register Doctor"
      extraFields={doctorFields}
    />

  );

}

export default AdminRegisterDoctor;
