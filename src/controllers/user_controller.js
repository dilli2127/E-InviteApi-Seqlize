import bcrypt from "bcrypt";
import User from "../models/users.js";  // Ensure this is correct path

export async function RegisterUser(req, res, next) {
    try {
        const { username, name, email, mobile, password, clientcode, usertype } = req.body;

        // Simple field validation
        if (!username || !name || !email || !mobile || !password || !usertype) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!["user", "admin"].includes(usertype)) {
            return res.status(400).json({ message: "Invalid usertype." });
        }

        // Check if username already exists
        // const existingUser = await User.findOne({ where: { username } });
        // if (existingUser) {
        //     return res.status(409).json({ message: "Username already exists." });
        // }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user record
        const newUser = await User.create({
            username,
            name,
            email,
            mobile,
            password: hashedPassword,    // Save hashed password
            clientcode,
            usertype,
        });

        res.status(201).json({
            message: "User registered successfully.",
            userId: newUser._id,   // Return the UUID
        });
    } catch (error) {
        console.error("Error in RegisterUser:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}
