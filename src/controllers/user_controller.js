import lodash from "lodash";
import bcrypt from "bcrypt";
import {genericResponse} from "./base_controllers.js";
import {
    genericCreate,
    genericGetAll,
    genericGetAllWithoutPagination,
    genericGetOne,
    genericUpdate,
    genericDelete,
} from "./generic_controller.js";
import {statusCodes} from "../config/constants.js";
import sortConditionBuilder from "../utils/sort_condition_builder.js";
import Users, {userFields} from "../models/users.js";

export async function RegisterUser(req, res, next) {
    try {
        const {username, name, email, mobile, password, clientcode} = req.body;
        const usertype = "user";
        if (!username || !name || !email || !mobile || !password) {
            return res.status(400).json({message: "All fields are required."});
        }

        if (!["user", "admin"].includes(usertype)) {
            return res.status(400).json({message: "Invalid usertype."});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const json = {
            username,
            name,
            email,
            mobile,
            password: hashedPassword,
            clientcode,
            usertype,
            active: true,
        };

        const item = await genericCreate({
            Table: Users,
            json,
            fieldsToInclude: userFields,
            canUpsert: false,
            next,
        });

        return genericResponse({
            res,
            result: item || null,
            exception: null,
            pagination: null,
            statusCode: item ? statusCodes.SUCCESS : statusCodes.SERVER_ERROR,
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return next(error);
    }
}

export async function update(req, res, next) {
    try {
        const json = req.body;
        const item = await genericUpdate({
            Table: Users,
            condition: {_id: req.params._id},
            json,
            canUpsert: false,
            next,
        });
        return genericResponse({
            res,
            result: item,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function remove(req, res, next) {
    try {
        await genericDelete({
            Table: Users,
            condition: {_id: req.params._id},
            next,
            softDelete: false,
        });
        return genericResponse({
            res,
            result: null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getOne(req, res, next) {
    try {
        let item = await genericGetOne({
            Table: Users,
            condition: {invite_name: req.params._id},
            next,
        });
        if (item) item = item.toJSON();

        return genericResponse({
            res,
            result: item || null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getAll(req, res, next) {
    try {
        const json = req.body;
        const defaultSortConditions = [["_id", "DESC"]];
        const sortConditions = lodash.defaults(
            sortConditionBuilder(json.sortCondition),
            defaultSortConditions,
        );
        let condition = {};
        const getResult = await genericGetAll({
            Table: Users,
            condition,
            sortConditions,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
        });
        let {items} = getResult;
        const {pagination} = getResult;

        if (items) items = items.map(x => x.toJSON());
        return genericResponse({
            res,
            result: items,
            exception: null,
            pagination,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getAllWithoutPagination(req, res, next) {
    try {
        const json = req.body;
        const sortConditions = [["_id", "DESC"]];
        const condition = {};

        let getResult = await genericGetAllWithoutPagination({
            Table: Users,
            condition,
            sortConditions,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
        });

        if (getResult) getResult = getResult.map(x => x.toJSON());

        return genericResponse({
            res,
            result: getResult,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}
