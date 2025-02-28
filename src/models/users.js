"use strict";
import { DataTypes, Model, NOW } from "sequelize";
import { sequelize } from "../config/db.js";

export default class Users extends Model {}
Users.init(
    {
        id: {
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
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: NOW,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: NOW,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        paranoid: true,
        modelName: "users",
        defaultScope: {
            attributes: {
                exclude: ["password", "createdAt", "updatedAt"],
            },
        },
    },
);

export const userFields = [
    "Username",
    "Name",
    "Email",
    "Mobile",
    "Active",
    "DeletedAt",
    "CreatedAt",
    "UpdatedAt",
];
