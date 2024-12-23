import lodash from "lodash";
import { sequelize } from "../config/db.js";

// Generic Create
export async function genericCreate({ Table, json, fieldsToInclude, fieldsToExclude = [] }) {
  try {
    // Exclude fields if needed
    if (fieldsToExclude.length) {
      json = lodash.omit(json, fieldsToExclude);
    }

    const item = await Table.create(json, { fields: fieldsToInclude });
    return item.toJSON();
  } catch (error) {
    throw new Error(error);
  }
}

// Generic Update
export async function genericUpdate({ Table, condition, json, canUpsert, fieldsToExclude = [] }) {
  try {
    // Exclude unwanted fields
    if (fieldsToExclude.length) {
      json = lodash.omit(json, fieldsToExclude);
    }

    const fieldsToRemove = ["__v", "createdAt", "updatedAt"];
    condition = lodash.omit(condition, fieldsToRemove);
    json = lodash.omit(json, fieldsToRemove);

    if (!condition.where) condition = { where: condition };

    let item = await Table.findOne(condition);
    if (!item) {
      if (canUpsert) {
        item = await Table.create(json);
      } else {
        throw new Error("Item not found");
      }
    } else {
      lodash.assign(item, json);
      await item.save();
    }

    return item;
  } catch (error) {
    throw new Error(error);
  }
}

// Generic Get One
export async function genericGetOne({ Table, condition, populateQuery, sortConditions, opts }) {
  try {
    const finalCondition = {
      where: condition,
      include: populateQuery || [],
      order: sortConditions ? [sortConditions] : [],
      ...opts,
    };

    const result = await Table.findOne(finalCondition);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

// Generic Delete
export async function genericDelete({ Table, condition }) {
  try {
    await Table.destroy({ where: condition });
    return true;
  } catch (error) {
    throw new Error(error);
  }
}

// Generic Get All
export async function genericGetAll({
  Table,
  condition,
  populateQuery,
  sortConditions,
  pageNumber = 1,
  pageLimit = 10,
  opts,
}) {
  try {
    const skipCount = pageLimit * (pageNumber - 1);
    const finalCondition = {
      where: condition,
      include: populateQuery || [],
      order: sortConditions ? [sortConditions] : [],
      offset: skipCount,
      limit: pageLimit,
      distinct: true,
      ...opts,
    };

    const result = await Table.findAndCountAll(finalCondition);
    const pagination = {
      pageNumber,
      pageLimit,
      skipCount,
      totalCount: result.count,
    };

    return { items: result.rows, pagination };
  } catch (error) {
    throw new Error(error);
  }
}

// Generic Get All without Pagination
export async function genericGetAllWithoutPagination({
  Table,
  condition,
  populateQuery,
  sortConditions,
  opts,
}) {
  try {
    const finalCondition = {
      where: condition,
      include: populateQuery || [],
      order: sortConditions ? [sortConditions] : [],
      ...opts,
    };

    const result = await Table.findAll(finalCondition);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

// Execute Raw Query
export async function executeRawQuery({ query }) {
  try {
    const [results, metadata] = await sequelize.query(query);
    return { results, metadata };
  } catch (error) {
    throw new Error(error);
  }
}

// Utilities
export function getNewArray(arr = []) {
  return lodash.cloneDeep(arr);
}

export function getNewObject(obj = {}) {
  return lodash.cloneDeep(obj);
}

export async function getCount({ Table, condition }) {
  try {
    const result = await Table.count({ where: condition });
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

// Hard Delete
export async function genericHardDelete({ Table, condition }) {
  try {
    await Table.destroy({ where: condition, force: true });
    return true;
  } catch (error) {
    throw new Error(error);
  }
}
