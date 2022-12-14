export function generateRandomString() {
    const rand = Math.random().toString(16).substr(2, 8);
    return rand;
}

export function stringToRandomSlug(str: string, separator: '-' | '_' = '-') {
    const rand = Math.random().toString(16).substr(2, 8);
    let slug = str
        .toString()
        .normalize('NFD') // split accented letter into the base letter and accent
        .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, separator);
    return slug + `-${rand}`;
}

export function stringToSlug(str: string, separator: '-' | '_' = '-') {
    let slug = str
        .toString()
        .normalize('NFD') // split accented letter into the base letter and accent
        .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, separator);
    return slug;
}
export const arrayToObject = (array: Array<any>) =>
    array.reduce((obj, item) => {
        obj[item._id] = item;
        return obj;
    }, {});

export function parseColorToString(color: {
    r: number;
    g: number;
    b: number;
    a: number;
}) {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}
