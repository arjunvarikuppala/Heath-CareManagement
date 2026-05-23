import mongoose from "mongoose";

const appointmentSchema =
  new mongoose.Schema(

    {

      patientId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

      },

      doctorId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

      },

      appointmentDate: {

        type: String,

        required: true

      },

      appointmentTime: {

        type: String,

        required: true

      },

      reason: {

        type: String,

        required: true

      },

      status: {

        type: String,

        enum: [

          "pending",

          "approved",

          "accepted",

          "rejected",

          "completed",

          "cancelled"

        ],

        default: "pending"

      },

      patientReports: {
        type: [
          {
            title: String,
            fileUrl: String,
            uploadedAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        default: []
      },

      doctorReports: {
        type: [
          {
            title: String,
            fileUrl: String,
            uploadedAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        default: []
      },

      prescriptions: {
        type: [
          {
            title: String,
            fileUrl: String,
            notes: String,
            uploadedAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        default: []
      },

      doctorNotes: {
        type: [
          {
            text: String,
            createdAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        default: []
      },

      reminderSent: {
        oneDay: {
          type: Boolean,
          default: false
        },
        fourHours: {
          type: Boolean,
          default: false
        },
        thirtyMinutes: {
          type: Boolean,
          default: false
        }
      }

    },

    {

      timestamps: true

    }

);

appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
  appointmentTime: 1,
  status: 1
});

appointmentSchema.index({
  patientId: 1,
  appointmentDate: 1,
  appointmentTime: 1,
  status: 1
});

appointmentSchema.index({
  updatedAt: -1
});

export const appointmentModel = mongoose.model("appointments",appointmentSchema);
