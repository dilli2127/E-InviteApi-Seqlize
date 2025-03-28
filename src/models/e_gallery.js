"use strict";
import {DataTypes, Model, NOW, Sequelize} from "sequelize";
import {sequelize} from "../config/db.js";
import Users from "./users.js";

export default class EGallery extends Model {}

EGallery.init(
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
        drive_folder_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        userid: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Users',
              key: '_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        album_cover: {
            type: Sequelize.STRING,
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
        modelName: "e_gallery",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt","deletedAt"],
            },
        },
    },
);
EGallery.hasOne(Users, {
    as: "UserItem",
    sourceKey: "userid",
    foreignKey: "_id",
});

export const egalleryFields = [
    "name",
    "drive_folder_id",
    "userid",
    "album_cover",
];
