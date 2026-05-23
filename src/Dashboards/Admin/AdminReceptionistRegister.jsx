import AdminRegisterForm from "../../Components/AdminRegisterForm";

function AdminRegisterReceptionist() {

  return (

    <AdminRegisterForm
      title="Register Receptionist"
      endpoint="/admin-api/create-receptionist"
      submitLabel="Register Receptionist"
    />

  );

}

export default AdminRegisterReceptionist;
