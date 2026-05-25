<div align="center">

# 🏥 Health Care Management System  
# ⚙️ Full Stack Architecture & Technical Documentation

This document serves as the complete technical documentation for the **Health Care Management System** project.  
It explains the frontend architecture, backend architecture, routing system, authentication flow, database structure, API integration, installation setup, and complete project workflow.

</div>

---

# 📌 1. Project Overview

The **Health Care Management System** is a full-stack web application developed to simplify hospital and healthcare operations digitally.

The application provides functionalities for:

- Patient Management
- Doctor Management
- Appointment Booking
- Authentication & Authorization
- Dashboard Management
- Healthcare Data Handling
- Responsive User Interface

The system follows a modular architecture using modern web technologies for scalability, maintainability, and security.

---

# 🏗️ 2. System Architecture

The project follows a **Full Stack Client-Server Architecture**.

```text
Frontend (React.js)
        │
        ▼
REST API Communication
        │
        ▼
Backend Server (Node.js + Express.js)
        │
        ▼
MongoDB Database
```

---

# 🎨 3. Frontend Architecture

The frontend is developed using **React.js** with reusable components and client-side routing.

### Frontend Responsibilities

- UI Rendering
- Route Navigation
- API Communication
- Authentication Handling
- State Management
- Form Validation
- Responsive Design

### Frontend Features

- Responsive Dashboard
- Doctor Listing
- Appointment Booking
- Authentication Pages
- Dynamic Routing
- Protected Pages

---

# ⚙️ 4. Backend Architecture

The backend is developed using **Node.js** and **Express.js** following REST API architecture.

### Backend Responsibilities

- API Development
- Database Management
- Authentication
- Authorization
- Request Validation
- Error Handling
- Business Logic Processing

### Backend Features

- JWT Authentication
- Secure APIs
- MongoDB Integration
- CRUD Operations
- Appointment Management
- Doctor & Patient Data Handling

---

# 📂 5. Complete Project Structure

```text
Health-CareManagement/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Services/
│   │   ├── Context/
│   │   ├── Routes/
│   │   ├── Assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── APIs/
│   ├── Models/
│   ├── Middlewares/
│   ├── Services/
│   ├── database/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🚀 6. Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Geetavarshini/Heath-CareManagement.git
```

---

## 2️⃣ Navigate to Project Directory

```bash
cd Heath-CareManagement
```

---

# 🖥️ Frontend Setup

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Start Frontend Server

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# ⚙️ Backend Setup

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Create `.env` File

```env
PORT=4000
DB_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
```

---

## Start Backend Server

```bash
npm start
```

or

```bash
nodemon server.js
```

Backend runs on:

```text
http://localhost:4000
```

---

# 📦 7. Technology Stack

| Technology | Purpose |
| :--- | :--- |
| React.js | Frontend framework |
| Node.js | Backend runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| Axios | API communication |
| React Router DOM | Client-side routing |
| Bootstrap / CSS | UI styling |
| Vite | Frontend build tool |
| dotenv | Environment variables |
| bcryptjs | Password hashing |
| cors | Frontend-backend communication |

---

# 🌐 8. Frontend Routing Structure

| Route | Purpose |
| :--- | :--- |
| `/` | Home page |
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | User dashboard |
| `/appointments` | Appointment management |
| `/doctors` | Doctor listing |

---

# 🔗 9. Backend API Routes

## Authentication Routes

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| GET | `/logout` | Logout user |

---

## Doctor Routes

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| GET | `/doctors` | Fetch all doctors |
| POST | `/doctors` | Add new doctor |
| PUT | `/doctors/:id` | Update doctor |
| DELETE | `/doctors/:id` | Delete doctor |

---

## Appointment Routes

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| POST | `/appointments` | Book appointment |
| GET | `/appointments` | Fetch appointments |
| DELETE | `/appointments/:id` | Cancel appointment |

---

# 🗄️ 10. Database Models

## 👨‍⚕️ Doctor Model

Stores:

- Doctor Name
- Specialization
- Experience
- Availability
- Contact Information

---

## 👤 Patient Model

Stores:

- Patient Name
- Email
- Contact Details
- Medical Information

---

## 📅 Appointment Model

Stores:

- Appointment Date
- Doctor Details
- Patient Details
- Appointment Status

---

# 🔐 11. Authentication & Security

The application implements secure authentication mechanisms:

- JWT Token Authentication
- Password Hashing using bcrypt
- Protected Routes
- Environment Variable Security
- Secure API Communication

---

# 🔄 12. Frontend & Backend Communication

The frontend communicates with the backend using REST APIs.

### Communication Features

- Axios API requests
- Dynamic data rendering
- Authentication token handling
- Real-time UI updates
- Error handling & validations

---

# ⚡ 13. Performance Optimizations

- Modular architecture
- Reusable components
- Optimized API communication
- Efficient database queries
- Lightweight frontend rendering
- Fast development using Vite

---

# ✅ 14. Features Summary

- User Authentication
- Doctor Management
- Patient Management
- Appointment Booking
- Dashboard System
- REST API Integration
- Responsive UI
- Protected Routes
- Full Stack Architecture

---

# 📌 15. Future Enhancements

- Online Payment Integration
- Video Consultation
- Real-Time Notifications
- Medical Report Upload
- AI-Based Health Suggestions
- Dark Mode

---

# 👩‍💻 Developed By

**Team-30**  
B.Tech – Anurag University

---Enikapally Sai Vindhya
---Varikuppala Arjun
---Narala Geetavarshini
---Katike Bhargavi
---Vatti Shiva Yadav

---
