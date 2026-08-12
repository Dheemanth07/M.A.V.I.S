import express from "express";
import crypto from "crypto";
import User from "./user.model.js";
import { seedUserHerdIfNeeded } from "../simulation/userSeed.service.js";

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

        // Only auto-provision simulation herd if registering the primary demo account
        if (newUser.email === 'dheemanth1007@gmail.com') {
            await seedUserHerdIfNeeded(newUser._id);
        }

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

        // Only ensure demo herd exists for the primary demo account
        if (user.email === 'dheemanth1007@gmail.com') {
            await seedUserHerdIfNeeded(user._id);
        }

        const userObj = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            vetContact: user.vetContact || "",
            alertSettings: user.alertSettings || { soundAlerts: true, tempSensitivity: 1.0, hrThreshold: 100 },
            collarSettings: user.collarSettings || { syncInterval: 5, motionSensitivity: "standard" },
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

// GET /api/auth/profile/:id
router.get("/profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }
        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    vetContact: user.vetContact || "",
                    alertSettings: user.alertSettings,
                    collarSettings: user.collarSettings,
                }
            }
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// PUT /api/auth/profile/:id
router.put("/profile/:id", async (req, res) => {
    try {
        const { name, email, vetContact, alertSettings, collarSettings } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }

        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (vetContact !== undefined) user.vetContact = vetContact;
        if (alertSettings) user.alertSettings = { ...user.alertSettings, ...alertSettings };
        if (collarSettings) user.collarSettings = { ...user.collarSettings, ...collarSettings };

        await user.save();

        res.status(200).json({
            status: "success",
            message: "Profile preferences updated successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    vetContact: user.vetContact,
                    alertSettings: user.alertSettings,
                    collarSettings: user.collarSettings,
                }
            }
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// PUT /api/auth/password/:id
router.put("/password/:id", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: "fail", message: "Current and new passwords are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ status: "fail", message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }

        const currentHashed = hashPassword(currentPassword);
        if (user.password !== currentHashed) {
            return res.status(401).json({ status: "fail", message: "Current password is incorrect" });
        }

        user.password = hashPassword(newPassword);
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Password updated successfully"
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

export default router;
