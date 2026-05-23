import mongoose from "mongoose";

const emailVerificationSchema =
  new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      token: {
        type: String,
        required: true
      },
      purpose: {
        type: String,
        enum: [
          "patient-registration"
        ],
        default: "patient-registration"
      },
      verified: {
        type: Boolean,
        default: false
      },
      expiresAt: {
        type: Date,
        required: true
      }
    },
    {
      timestamps: true
    }
  );

emailVerificationSchema.index(
  {
    expiresAt: 1
  },
  {
    expireAfterSeconds: 0
  }
);

emailVerificationSchema.index({
  email: 1,
  purpose: 1,
  verified: 1
});

export const emailVerificationModel =
  mongoose.model(
    "EmailVerification",
    emailVerificationSchema
  );
