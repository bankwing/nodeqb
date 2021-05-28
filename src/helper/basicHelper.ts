export const devConsoleLog = (a: any, b: any = '') => {
    console.log(a, b);
};

export const spaceRemover = (str: string) => {
    return str.replace(/\s+/g, ' ');
};
