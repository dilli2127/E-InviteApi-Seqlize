"use strict";
import { DataTypes, Model, NOW } from "sequelize";
import { sequelize } from "../config/db.js";

export default class Album extends Model {}

Album.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        albumname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        albumurl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "_id",
            },
        },
        albumcover: {
            type: DataTypes.STRING,
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
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        paranoid: true,
        modelName: "album",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        },
    }
);

export const albumFields = [
    "albumname",
    "albumurl",
    "userid",
    "albumcover",
    "DeletedAt",
    "CreatedAt",
    "UpdatedAt",
];
