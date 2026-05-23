import UserManagement
from '../../Components/UserManagement';

function AdminDoctors() {

  return (

    <UserManagement

      role="doctor"

      title="Doctors"

      groupedBy="specialization"

    />

  );

}

export default AdminDoctors;