"use strict";
import {DataTypes, Model, NOW} from "sequelize";
import {sequelize} from "../config/db.js";

export default class GalleryCategory extends Model {}

GalleryCategory.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
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
        modelName: "gallery_category_table",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        },
    },
);

export const galleryCategoryFields = [
    "name",
    "description",
];
