const express = require('express');
const authController=require('../Controllers/authController');
const multer = require("multer");
const router = express.Router();

// Multer setup for file upload
const upload = multer({

    dest: 'userImages/', // Folder where files will be stored
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    
  }).single('picture'); // Field name that will be sent from the client

router.route("/signup").post(upload,authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
module.exports = router;