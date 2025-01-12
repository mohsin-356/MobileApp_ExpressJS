const express = require('express');
const authController=require('../Controllers/authController');
const upload = require("../fileHandleing/upload");
const router = express.Router();


router.route("/signup").post(upload,authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
module.exports = router;