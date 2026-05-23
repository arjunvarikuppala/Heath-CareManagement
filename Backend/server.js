import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { patientRoute }  from "./APIS/patientAPI.js"
import  connectDB from "./Config/db.js"
import { commonRoute } from "./APIS/commonAPI.js";
import { adminRoute} from './APIS/adminAPI.js'
import { doctorRoute }from "./APIS/doctorAPI.js";
import { receptionistRoute } from "./APIS/receptionistApi.js";
import { upload } from "./Config/multer.js";
import { startAppointmentReminderScheduler } from "./utils/reminderScheduler.js";
import multer from "multer";



dotenv.config();

const app = express();
connectDB();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json({
  limit: "1mb"
}));
app.use(express.urlencoded({
  extended: true,
  limit: "1mb"
}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store"
  );
  next();
});
app.use(
  "/uploads",
  express.static("uploads")
);

app.use("/patient-api", patientRoute);
app.use("/common-api",commonRoute);
app.use("/admin-api", adminRoute);
app.use("/doctor-api", doctorRoute);
app.use("/receptionist-api", receptionistRoute);
app.get("/", (req, res) => {
  res.send("Hospital Management API Running");
});

app.use((err, req, res, next) => {
  console.error(
    "API ERROR:",
    err
  );

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum allowed size is 10MB"
          : err.message
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      err.message || "Internal server error"
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startAppointmentReminderScheduler();
});
