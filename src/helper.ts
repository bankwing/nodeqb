import {errorType, MysqlErrorCustom} from "./types";

export const devConsoleLog = (a: any, b: any = '') => {
    console.log(a, b);
};

export const spaceRemover = (str: string) => {
    return str.replace(/\s+/g, ' ');
};

export const queryErrorThrower = (e: MysqlErrorCustom, callback: any = null, errorType: errorType) => {
    const err = Object.assign({}, e, {errorType})
    if (callback) {
        callback(err)
    } else {
        throw err
    }
}

export const errorTypeAdd = (e: MysqlErrorCustom, errorType: errorType) => {
    return Object.assign({}, e, {errorType})
}
