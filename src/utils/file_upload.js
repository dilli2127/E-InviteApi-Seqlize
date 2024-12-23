// eslint-disable-next-line import/prefer-default-export
export function getFileExtension(name) {
    if (!name) return "";
    return name.slice((Math.max(0, name.lastIndexOf(".")) || Infinity) + 1);
}
