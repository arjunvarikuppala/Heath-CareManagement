# 🏥 CareFlow – Hospital Management System (HMS)

## Introduction

CareFlow is a full-stack Hospital Management System developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js). 
The main objective of this project is to simplify and digitize hospital management activities such as appointment booking, patient record handling, doctor management, prescription generation, medical report uploads, notifications, and administrative operations. 
The system uses role-based access control so that different users can access only their respective functionalities.

## Project Objective

The objective of this project is:
* To reduce manual hospital processes
* To provide secure authentication and authorization
* To manage doctors, patients, and appointments efficiently
* To maintain medical records digitally
* To improve communication among patients, doctors, and reception staff

## Technologies Used

### Frontend
* React.js
* React Router DOM
* Axios
* Lucide React Icons
* CSS

### Backend
* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication & Security
* JWT Authentication
* Protected Routes
* Role-based Access Control

### Additional Libraries

* Multer
* Cloudinary
* Cookie Parser
* CORS

# User Roles in the System
The system contains four types of users:

### 1. Patient
Patients can register and log in to the system. 
They can view available doctors, book appointments, upload medical reports, view prescriptions, and access their appointment history and analytics dashboard.

Patient features include:
* Registration and login
* Book appointments
* View doctor details
* Upload medical reports
* View prescriptions
* View appointment history
* Dashboard analytics

### 2. Doctor
Doctors are created and managed directly by the administrator in the system. 
After registration, the administrator provides access credentials and permissions. 
Doctors can log in to their dashboard and manage patient-related activities.

Doctor features include:
* Login via administrator's approval
* View appointments
* Confirm or complete appointments
* Create prescriptions
* View historical prescriptions
* Configure available time slots
* View patient reports
* Dashboard analytics


### 3. Receptionist
Receptionists assist in handling hospital appointment scheduling and patient management activities. 
They help in managing patient visits and coordinating appointment processes.

Receptionist features include:
* Login to the system
* Book appointments for walk-in patients
* Reschedule appointments
* View appointment details
* Manage appointment schedules
* Send appointment reminder emails
* Dashboard analytics


### 4. Admin
Admins manage the complete hospital system and have full access to users and hospital operations. 
They are responsible for maintaining the overall workflow of the system.

Admin features include:
* Create doctors and receptionists
* Edit doctors and receptionists
* View all users
* View all appointments
* Block or enable user accounts
* Manage hospital operations
* Send appointment reminder emails
* View audit logs
* Dashboard analytics

# conclusion
You can use this conclusion section:

## Conclusion

CareSync Hospital Management System provides a centralized and efficient platform for managing hospital operations digitally. 
The system simplifies the interaction between patients, doctors, receptionists, and administrators by reducing manual work and improving the overall workflow. 
Features such as appointment management, prescription handling, medical report management, role-based access control, and email reminder services help create a secure and user-friendly environment. 
By integrating different hospital functionalities into a single platform, CareFlow improves communication, enhances operational efficiency, and provides better healthcare management services. 
The project demonstrates the effective use of MERN stack technologies in building a real-world healthcare solution.
