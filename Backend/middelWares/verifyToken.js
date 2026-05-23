import jwt from "jsonwebtoken";

import { config }
from "dotenv";
import { userModel }
from "../Models/userModel.js";
import {
  getAuthCookieOptions,
  TOKEN_EXPIRES_IN
} from "../Config/authCookie.js";

config();

export const verifyToken =
  (...allowedRoles) => {

    return async (
      req,
      res,
      next
    ) => {
      

      try {
        console.log("verifyToken: allowedRoles=", allowedRoles);
        console.log("verifyToken: cookies.token present=", Boolean(req.cookies?.token));

        // READ TOKEN FROM COOKIE

        const token =
          req.cookies?.token;

        if (!token) {

          return res.status(401).json({

            message:
              "Unauthorized. Please login"

          });

        }

        // VERIFY TOKEN

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        console.log("verifyToken: decodedToken=", decodedToken);

        const user = await userModel.findById(decodedToken.userId).select(
          "-password -resetPasswordToken -resetPasswordExpires"
        );

        console.log(
          "verifyToken: user found=",
          user ? true : false,
          user ? { id: user._id.toString(), role: user.role, isActive: user.isActive } : null
        );

        if (!user) {

          return res.status(401).json({
            message:
              "Unauthorized. Please login"
          });

        }

        if (!user.isActive) {
          console.log("verifyToken: blocked user trying to access", user._id.toString());
          return res.status(403).json({
            message: "Your account is blocked"
          });
        }

        // ROLE CHECK

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          console.log("verifyToken: role mismatch", { required: allowedRoles, actual: user.role });
          return res.status(403).json({ message: "Forbidden. You don't have permission" });
        }

        // ATTACH USER

        const renewedToken =
          jwt.sign(
            {
              userId:
                user._id,
              role:
                user.role
            },
            process.env.JWT_SECRET,
            {
              expiresIn:
                TOKEN_EXPIRES_IN
            }
          );

        res.cookie(
          "token",
          renewedToken,
          getAuthCookieOptions()
        );

        req.user = {
          userId:
            user._id.toString(),
          role:
            user.role
        };

        req.authUser =
          user;

        next();

      }

      catch (err) {

        console.error(

          "VERIFY TOKEN ERROR:",

          err.message

        );

        if (

          err.name ===
          "TokenExpiredError"

        ) {

          return res.status(401).json({

            message:

"Session expired. Please login again"

          });

        }

        if (

          err.name ===
          "JsonWebTokenError"

        ) {

          return res.status(401).json({

            message:

"Invalid token. Please login"

          });

        }

        return res.status(500).json({

          message:
            "Server error in token verification"

        });

      }

    };

};
