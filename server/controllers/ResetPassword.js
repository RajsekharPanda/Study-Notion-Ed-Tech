const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from body
    const email = req.body.email;
    //check user for this email, email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      });
    }

    const token = crypto.randomBytes(20).toString("hex")

    const updateDetails = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );
    //return response
    res.json({
      success: true,
      message:
        "Email sent successfully, please check email and change password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong which sending reset password mail",
    });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "new password and confirm password do not match",
      });
    }
    //get user details from DB using token
    const userDetails = await User.findOne({ token: token });
    //if no entry - invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }
    //token time expired check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token expired, please try again",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //password update
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    //return response
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong which sending reset password mail",
    });
  }
};
