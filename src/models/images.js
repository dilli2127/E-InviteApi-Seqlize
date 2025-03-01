"use strict";
import {DataTypes, Model, NOW} from "sequelize";
import {sequelize} from "../config/db.js"; 

export default class Images extends Model {}

Images.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true,
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
    },
    {
        sequelize,
        modelName: "Images",
        tableName: "images",
        timestamps: true,
        paranoid: true, 
    },
);
export const userFields = [
    "_id",
    "url",
    "type",
    "deletedAt",
    "createdAt",
    "updatedAt",
];
