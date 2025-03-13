"use strict";
import { DataTypes, Model, NOW } from "sequelize";
import { sequelize } from "../config/db.js";

export default class Gallery extends Model {}

Gallery.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        galleryname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        galleryurl: {
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
        gallerycover: {
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
        modelName: "gallery",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        },
    }
);

export const galleryFields = [
    "galleryname",
    "galleryurl",
    "userid",
    "gallerycover",
    "DeletedAt",
    "CreatedAt",
    "UpdatedAt",
];
