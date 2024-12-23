import {DataTypes, Model, NOW} from "sequelize";

import {sequelize} from "../config/db.js";

export default class JWTAccess extends Model {}

JWTAccess.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        JWT: {type: DataTypes.TEXT, unique: true},
        User: {type: DataTypes.TEXT, allowNull: false},
        LastUsed: {type: DataTypes.BIGINT, allowNull: false},
        ExpiresOn: {type: DataTypes.BIGINT},

        deletedAt: {type: DataTypes.DATE, defaultValue: null, allowNull: true},
        createdAt: {type: DataTypes.DATE, defaultValue: NOW, allowNull: false},
        updatedAt: {type: DataTypes.DATE, defaultValue: NOW, allowNull: false},
    },
    {
        sequelize,
        paranoid: true,
        modelName: "jwt_access",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        },
    },
);

export const jwtFields = ["JWT", "User", "LastUsed", "ExpiresOn"];
