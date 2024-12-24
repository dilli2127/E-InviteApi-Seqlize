import jwt from "jsonwebtoken";
// import OlgprsUsers from "../models/olgprs_users.js";
import {executeRawQuery, genericGetOne} from "./generic_controller.js";
import {genericResponse} from "./base_controllers.js";
import {statusCodes, jwtExpirationTime} from "../config/constants.js";
import {createJWT} from "./jwt_access_controller.js";
// import bcrypt from "bcrypt";
import {secretKey} from "../config/environment.js";

const populateQuery = [
    "DeeOfficeItem",
    "SquadItem",
    "ZoneItem",
    "DesignationItem",
];

export async function LoginAuth(req, res, next) {
    const {username, passwordtext} = req.body;

    try {
        // Validate input
        if (!username || !passwordtext) {
            return res
                .status(400)
                .json({message: "Username and password are required."});
        }

        // Fetch user details
        // const user = await genericGetOne({
        //     Table: OlgprsUsers,
        //     condition: {username},
        //     populateQuery,
        //     next,
        // });

        if (!user) {
            return res
                .status(401)
                .json({message: "Invalid username or password."});
        }

        // Securely compare hashed passwords
        // const isPasswordValid = await bcrypt.compare(passwordtext, user.passwordtext);
        // if (!isPasswordValid) {
        //     return res.status(401).json({ message: "Invalid username or password." });
        // }
        const expiresIn = jwtExpirationTime.seconds;
        if (user.passwordtext !== passwordtext) {
            return res
                .status(401)
                .json({message: "Invalid username or password."});
        }
        // Generate JWT token
        const token = jwt.sign(
            {
                user: {
                    userId: user._id,
                    username: user.username,
                },
            },
            secretKey,
            {
            expiresIn
            }
        );

        // Optionally store token
        if (token) createJWT(token, expiresIn, user._id);

        // Send response
        return genericResponse({
            res,
            result: {
                token,
                UserItem: user,
                // DeeOfficeItem,
                // SquadItem
            },
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        console.error("LoginAuth error:", error);
        return next(error);
    }
}
