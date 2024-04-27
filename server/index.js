import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import RegisterModel from "./models/Register.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await RegisterModel.findOne({ email });

    if (existingUser) {
      console.log("Account already exists");
      return res.status(400).json("Account already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await RegisterModel.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("User registered successfully");
    res.json(newUser);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json("Error registering user");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await RegisterModel.findOne({ email });

    if (!user) {
      // User not found
      return res
        .status(400)
        .json({ Login: false, message: "Invalid email or password" });
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Passwords don't match
      return res
        .status(400)
        .json({ Login: false, message: "Invalid email or password" });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN, {
      expiresIn: "5m",
    });

    // Set cookies
    res.cookie("accessToken", accessToken, { maxAge: 60000 });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 300000,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    // Login successful
    return res.json({ Login: true });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ Login: false, message: "An error occurred during login" });
  }
});

const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    let isRefreshTOken = await refreshToken(req, res);
    if (isRefreshTOken) {
      next();
    } else {
      return res.json({ valid: false, message: "Invalid Token" });
    }
  } else {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, decoded) => {
      if (err) {
        return res.json({ valid: false, message: "Invalid Token" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  let token = false;
  if (!refreshToken) {
    return res.json({ valid: false, message: "Invalid Refresh Token" });
  } else {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
      if (err) {
        return res.json({ valid: false, message: "Invalid Refresh Token" });
      } else {
        const accessToken = jwt.sign(
          { email: decoded.email },
          process.env.ACCESS_TOKEN,
          {
            expiresIn: "1m",
          }
        );
        res.cookie("accessToken", accessToken, { maxAge: 60000 });
        token = true;
      }
    });
  }
  return token;
}

app.get("/authToken", authenticateToken, async (req, res) => {
  return res.json({ valid: true, message: "authorized" });
});

app.listen(3001, () => {
  console.log("Server is running in port 3001");
});
