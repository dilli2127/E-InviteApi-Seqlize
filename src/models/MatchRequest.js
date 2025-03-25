import { DataTypes } from "sequelize";
import {sequelize} from "../config/db.js"; 

const MatchRequest = sequelize.define("MatchRequest", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    selfieKey: {
        type: DataTypes.STRING,
        allowNull: false
    },
    matchedPhotoKey: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("pending", "matched"),
        defaultValue: "pending"
    }
}, {
    timestamps: true
});

export default MatchRequest;
