import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true
    },


    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "admin",
        "doctor",
        "patient",
        "receptionist",
      ],
      default: "patient",
    },

    specialization: {
      type: String
    },
    experience: {
      type: Number
    },
    unavailableDates: {
      type: [String],
      default: []
    },
    resetPasswordToken: {
      type: String,
      default: ""
    },
    resetPasswordExpires: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
   },
   isVerified: {
    type: Boolean,
    default: false
},
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  role: 1,
  isActive: 1
});

export const userModel = mongoose.model("User", userSchema);

