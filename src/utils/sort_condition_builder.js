import lodash from "lodash";

export default function sortConditionBuilder(obj) {
    if (lodash.isEmpty(obj)) return [];

    let constructedSortCondition = [];

    Object.keys(obj).forEach(k => {
        const condition = [k, obj[k] === 1 ? "ASC" : "DESC"];
        constructedSortCondition.push(condition);
    });

    return constructedSortCondition;
}
