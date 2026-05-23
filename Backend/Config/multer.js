import multer from "multer";
export const upload = multer({
        storage: multer.memoryStorage(),
        //to avoid RAM overflow
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
        //for security validation
        fileFilter: (req, file, cb) => {
            if (
              file.mimetype === "image/jpeg" ||
              file.mimetype === "image/png" ||
              file.mimetype === "image/webp" ||
              file.mimetype === "application/pdf"
            ) {
            cb(null, true);
            } else {
            const err = new Error("Only JPG, PNG and PDF allowed");
            err.status = 400;
            cb(err, false);
            }
        },
});
