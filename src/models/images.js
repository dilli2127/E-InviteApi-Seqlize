"use strict";
import {DataTypes, Model, NOW, Sequelize} from "sequelize";
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
        gallery_category: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "gallery_category_table",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
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
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt","deletedAt"],
            },
        },
    },
);
export const userFields = [
    "url",
    "type",
    "gallery_category",
];
