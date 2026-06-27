import express from "express";
import crypto from "crypto";
import User from "./user.model.js";

const router = express.Router();

// Helper to hash password using node's built-in crypto (pbkdf2)
function hashPassword(password) {
    return crypto.pbkdf2Sync(password, "mavis_salt_2026", 1000, 64, "sha512").toString("hex");
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ status: "fail", message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ status: "fail", message: "Email is already registered" });
        }

        const hashedPassword = hashPassword(password);
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "user"
        });

        const userObj = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        };

        res.status(201).json({
            status: "success",
            message: "Registration successful",
            data: { user: userObj, token: `mock_jwt_token_${newUser._id}` }
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: "fail", message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ status: "fail", message: "Invalid email or password" });
        }

        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            return res.status(401).json({ status: "fail", message: "Invalid email or password" });
        }

        const userObj = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: { user: userObj, token: `mock_jwt_token_${user._id}` }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

export default router;
