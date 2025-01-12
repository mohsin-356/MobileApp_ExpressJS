const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "userImages/"); // Folder where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, `user-${uniqueSuffix}${ext}`); // Example: user-1234567890.jpg
    },
});

// Multer filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true); // Accept file
    } else {
        cb(new Error("Not an image! Please upload only images."), false); // Reject file
    }
};

// Multer setup
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).single("picture"); // Field name sent from the client

module.exports = upload;
