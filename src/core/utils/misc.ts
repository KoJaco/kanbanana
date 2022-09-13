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

export const arrayToObject = (array: Array<any>) =>
    array.reduce((obj, item) => {
        obj[item._id] = item;
        return obj;
    }, {});

export function parseBgColor(color: string) {
    return `bg-[${color.toLowerCase()}]`;
}

export function parseCurrentColumnId(currentColumnId: number) {
    return `column-${currentColumnId}`;
}
