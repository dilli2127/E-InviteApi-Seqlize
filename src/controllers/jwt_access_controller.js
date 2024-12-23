import JWTAccess, {jwtFields} from "../models/jwt_access.js";
import {
    genericDelete,
    genericCreate,
    genericUpdate,
} from "./generic_controller.js";
import {getUtcUnix} from "./base_controllers.js";

export async function consumeJWT(jwt) {
    try {
        await genericDelete({
            Table: JWTAccess,
            condition: {JWT: jwt},
        });
        return true;
    } catch (error) {
        throw new Error(error);
    }
}

export async function createJWT(jwt, expiresIn, userId) {
    try {
        let currentTime = getUtcUnix();
        const lastUsed = currentTime;
        const expiresOn = currentTime + expiresIn;

        const item = await genericCreate({
            Table: JWTAccess,
            json: {
                JWT: jwt,
                User: userId?.toString(),
                ExpiresOn: expiresOn,
                LastUsed: lastUsed,
            },
            fieldsToInclude: jwtFields,
        });
        return item;
    } catch (error) {
        throw new Error(error);
    }
}

export async function updateJWTLastUsed(jwt) {
    try {
        const item = await genericUpdate({
            Table: JWTAccess,
            condition: {
                JWT: jwt,
            },
            json: {
                LastUsed: getUtcUnix(),
            },
            canUpsert: false,
        });
        return item;
    } catch (error) {
        throw new Error(error);
    }
}
