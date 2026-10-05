const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================================
// REGISTER CITIZEN
// Public registration always creates a citizen account
// ======================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      gender,
      differentlyAbled,
    } = req.body;

    // --------------------------------------------------
    // CHECK REQUIRED FIELDS
    // --------------------------------------------------

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message:
          "Name, email, password and phone are required",
      });
    }

    // --------------------------------------------------
    // CHECK EMAIL
    // --------------------------------------------------

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // --------------------------------------------------
    // CREATE CITIZEN
    // IMPORTANT:
    // Role is always citizen for public registration
    // --------------------------------------------------

    const user = await User.create({
      name: name.trim(),

      email: normalizedEmail,

      password: hashedPassword,

      phone: phone.trim(),

      address: address
        ? address.trim()
        : "",

      gender:
        gender || "prefer_not_to_say",

      differentlyAbled:
        differentlyAbled === true,

      role: "citizen",

      departmentId: null,

      officerId: null,

      isActive: true,
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(201).json({
      message:
        "Citizen registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        gender: user.gender,
        differentlyAbled:
          user.differentlyAbled,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during registration",
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      identifier: rawIdentifier,
      phone,
      password,
    } = req.body;

    const identifier = (email || rawIdentifier || phone || "").trim();

    // --------------------------------------------------
    // CHECK REQUIRED FIELDS
    // --------------------------------------------------

    if (!identifier || !password) {
      return res.status(400).json({
        message:
          "Email or mobile number and password are required",
      });
    }

    // --------------------------------------------------
    // FIND USER BY EMAIL OR PHONE
    // --------------------------------------------------

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid credentials (email/mobile or password incorrect)",
      });
    }

    // --------------------------------------------------
    // CHECK ACCOUNT STATUS
    // --------------------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been deactivated",
      });
    }

    // --------------------------------------------------
    // COMPARE PASSWORD
    // --------------------------------------------------

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    // --------------------------------------------------
    // CREATE JWT
    // --------------------------------------------------

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        departmentId:
          user.departmentId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(200).json({
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        gender: user.gender,
        differentlyAbled:
          user.differentlyAbled,
        departmentId:
          user.departmentId,
        officerId:
          user.officerId,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during login",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  registerUser,
  loginUser,
};