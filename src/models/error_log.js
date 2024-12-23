import {DataTypes, Model, NOW} from "sequelize";

import {sequelize} from "../config/db.js";

export default class ErrorLog extends Model {}

ErrorLog.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        Headers: {type: DataTypes.TEXT, defaultValue: ""},
        RequestBody: {type: DataTypes.TEXT, defaultValue: ""},
        ResponseBody: {type: DataTypes.TEXT, defaultValue: ""},
        Method: {type: DataTypes.TEXT, defaultValue: ""},
        Url: {type: DataTypes.TEXT, defaultValue: ""},
        Address: {type: DataTypes.TEXT, defaultValue: ""},
        ResponseTime: {type: DataTypes.DECIMAL},
        createdAt: {type: DataTypes.DATE, defaultValue: NOW, allowNull: false},
        updatedAt: {type: DataTypes.DATE, defaultValue: NOW, allowNull: false},
    },
    {
        sequelize,
        paranoid: true,
        modelName: "error_log",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        },
    },
);

export const userFields = [
    "Headers",
    "RequestBody",
    "ResponseBody",
    "Method",
    "Url",
    "Address",
    "ResponseTime",
];
