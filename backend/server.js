require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Favorite = require("./models/Favorite");
const User = require("./models/User");
const app = express();
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "smart-recipe-finder-secret";
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login first."
        });
    }
    jwt.verify(token, JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token."
            });
        }
        req.user = user;
        next();
    });
}
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });
app.get("/", (req, res) => {
    res.send("Smart Recipe Finder Backend is running!");
});
app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });
        if (existingUser) {
            return res.status(400).json({
                message: "Username or email already exists."
            });
        }
        const user = new User({
            username,
            email,
            password
        });
        const savedUser = await user.save();
        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email
            }
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Unable to register user."
        });
    }
});
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }
        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }
        const token = jwt.sign(
    {
        id: user._id,
        username: user.username,
        email: user.email
    },
    JWT_SECRET,
    {
        expiresIn: "1h"
    });
    res.json({
    message: "Login successful.",
    token: token,
    user: {
        id: user._id,
        username: user.username,
        email: user.email
    }
    });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Unable to login."
        });
    }
});
app.post("/api/favorites", authenticateToken,async (req, res) => {
    try {
        const {
        idMeal,
        strMeal,
        strMealThumb,
        strCategory,
        strArea
        } = req.body;
        const favorite = new Favorite({
            userId: req.user.id,
            idMeal,
            strMeal,
            strMealThumb,
            strCategory,
            strArea
        });
        const savedFavorite = await favorite.save();
        res.status(201).json(savedFavorite);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Unable to save favorite recipe."
        });
    }
});
app.get("/api/favorites", authenticateToken, async (req, res) => {
    try {
        const favorites = await Favorite.find({
            userId: req.user.id
        });
        res.json(favorites);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Unable to get favorite recipes."
        });
    }
});
app.delete("/api/favorites/:idMeal", authenticateToken, async (req, res) => {
    try {
        const deletedFavorite = await Favorite.findOneAndDelete({
            idMeal: req.params.idMeal,
            userId: req.user.id
        });
        if (!deletedFavorite) {
            return res.status(404).json({
                message: "Favorite recipe not found."
            });
        }
        res.json({
            message: "Favorite recipe deleted successfully."
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Unable to delete favorite recipe."
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});