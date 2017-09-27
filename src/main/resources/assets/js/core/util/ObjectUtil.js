
/**
 * Util for object
 */

/**
 * Check object if it's empty return true
 * @param object {object, Array}
 * @returns {boolean}
 */
function isEmpty(object){
    if (!isExists(object)) {
        return true;
    }
    if (isObject(object)) {
        return Object.keys(object).length == 0;
    }
    if (isString(object) || Array.isArray(object)) {
        return object.length == 0;
    }
    if (isNumber(object)) {
        return false;
    }
    if (typeof object == 'boolean') {
        return false;
    }

    throw new Error('Unsupported object type: ' + typeof object);
}

function getLength(object) {
    if (!isExists(object)) {
        return 0;
    }
    if (isString(object) || Array.isArray(object)) {
        return object.length;
    }
    throw new Error('Unsupported object type: ' + typeof object);
}

/**
 * If objects have different references then compares first level keys (not deep check)
 * @param a {object}
 * @param b {object}
 * @return {boolean} true if two objects are equal by reference or first level keys
 */
function isEquals(a, b) {
    if (a == null || b == null) {
        return a == b;
    }

    if (a == b) {
        return true;
    }

    if (!isObject(a) || !isObject(b)) {
        return false;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length != bKeys.length) {
        return false;
    }

    for (let key in a) {
        if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {
            if (a[key] != b[key]) {
                return false;
            }
        }
    }
    return true;
}

function isObject(val) {
    return isExists(val) && typeof val === 'object';
}

function isString(val) {
    return isExists(val) && Object.prototype.toString.call(val) === '[object String]';
}

function isDate(val) {
    return isExists(val) && Object.prototype.toString.call(val) === '[object Date]';
}

function isNumber(val) {
    return isExists(val) && Object.prototype.toString.call(val) === '[object Number]';
}

/**
 * Safely returns object property by given path.
 * In case of null pointer - null is returned.
 * @param target {object} object, property owner
 * @param path {string} separated with dots, example: 'nestedObject.name'
 * @return {object} or null
 */
function getObjectProperty(target, path) {
    if (!target) {
        return null;
    }
    const pathParts = path.split(".");
    let currentObject = target;

    for (let i = 0; i < pathParts.length; i++) {
        let p = pathParts[i];
        currentObject = currentObject[p];
        if (!isExists(currentObject)) {
            return null;
        }
    }
    return currentObject;
}

/**
 * Safely sets object property for given path.
 * Each nested object will be copied.
 * In case of null pointer - new object will be created.
 * Example:
 *      ObjectUtil.setObjectProperty({}, "myComponent.components.table.tableData", [1, 2]);
 * @param target {object} object, property owner
 * @param path {string} separated with dots, example: 'nestedObject.name'
 * @param value any value to set
 * @return {object} or null
 */
function setObjectProperty(target, path, value) {
    const pathParts = path.split(".");
    let currentObject = target;
    for (let i = 0; i < pathParts.length; i++) {
        const key = pathParts[i];
        if (i == pathParts.length - 1) {
            currentObject[key] = value;
            break;
        } else {
            currentObject[key] = Object.assign({}, currentObject[key]);
            currentObject = currentObject[key];
        }
    }
    // TODO should be possible to use key map as second param
    /*
     ObjectUtil.setObjectProperty({}, {
     ["myComponent.components.table.tableData"]: [1, 2]
     });
     */
    return target;
}

/**
 * Return true if value exists (not null or not undefined)
 * @param value
 * @return {boolean}
 */
function isExists(value) {
    return typeof value !== 'undefined' && value !== null;
}

/**
 * Returns first not null value, or null if all values are null.
 * @param objects {...object}
 * @return {*}
 */
function getFirstNotNull(...objects) {
    for (let i = 0; i <= objects.length; i++) {
        const val = objects[i];
        if (isExists(val)) {
            return val;
        }
    }
    return null;
}




export default {
    isEmpty,
    isEquals,
    isObject,
    isString,
    isDate,
    isExists,
    getLength,
    getFirstNotNull,
    getObjectProperty,
    setObjectProperty
}
