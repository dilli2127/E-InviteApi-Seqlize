import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Users from "../models/users.js";
import { genericGetOne } from "./generic_controller.js";
import { genericResponse } from "./base_controllers.js";
import { statusCodes, jwtExpirationTime } from "../config/constants.js";
import { createJWT } from "./jwt_access_controller.js";
import { secretKey } from "../config/environment.js";

export async function LoginAuth(req, res, next) {
    const { username, passwordtext } = req.body;

    try {
        if (!username || !passwordtext) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Fetch user details (add usertype/clientcode if needed)
        const user = await genericGetOne({
            Table: Users,
            condition: { username },
            next,
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        // Compare password (hashed comparison)
        const isPasswordValid = await bcrypt.compare(passwordtext, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        // Generate JWT payload (include usertype/clientcode if needed)
        const tokenPayload = {
            userId: user._id,
            username: user.username,
            usertype: user.usertype,      // Example if you need this in token
            clientcode: user.clientcode,  // Example if you need this in token
        };

        const token = jwt.sign(
            { user: tokenPayload },
            secretKey,
            { expiresIn: jwtExpirationTime.seconds }
        );

        // Store token (if needed)
        if (token) await createJWT(token, jwtExpirationTime.seconds, user._id);

        // Send success response
        return genericResponse({
            res,
            result: {
                token,
                UserItem: user,
            },
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });

    } catch (error) {
        console.error("LoginAuth error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
