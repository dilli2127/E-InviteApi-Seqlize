"use strict";
import {DataTypes, Model, NOW} from "sequelize";
import {sequelize} from "../config/db.js";

export default class Users extends Model {}
Users.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        clientcode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        usertype: {
            type: DataTypes.ENUM("user", "admin"),
            allowNull: false,
            defaultValue: "user",
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        paranoid: true,
        modelName: "Users",
        defaultScope: {
            attributes: {
                exclude: [ "createdAt", "updatedAt"],
            },
        },
    },
);

export const userFields = [
    "username",
    "name",
    "email",
    "mobile",
    "password",
    "clientcode",
    "usertype",
    "active",
];
