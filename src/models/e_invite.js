"use strict";
import {DataTypes, Model, NOW} from "sequelize";
import {sequelize} from "../config/db.js";

export default class EInvite extends Model {}
EInvite.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        invite_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mobile_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        event_address1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        event_address2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        latitude: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        image: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        LastUpdated: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
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
        modelName: "e_invite",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        },
    },
);

export const einviteFields = [
    "InviteName",
    "MobileNumber",
    "Email",
    "EventAddress1",
    "EventAddress2",
    "Longitude",
    "Latitude",
    "Image",
    "LastUpdated",
    "DeletedAt",
    "CreatedAt",
    "UpdatedAt",
];

