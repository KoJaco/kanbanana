import React from 'react';

export function getMaxIdFromString<T extends Object>(obj: T) {
    /* 
        * Adheres to structure '<name>-<id>', splits on '-' and tries to parse Id to number.
        Takes an object with structure shown above and returns the id attached to it.
    */
    const keys = Object.keys(obj);
    let idArray: number[] = [];
    keys.forEach((key) => {
        let [str, id] = key.split('-');
        try {
            if (id === undefined) {
                throw new Error(
                    'Second half of <identifier>-<id> (id) was undefined, failed while parsing to integer.'
                );
            }
            // try to parse id to integer
            let idNum = parseInt(id, 10);
            if (isNaN(idNum)) {
                throw new Error(
                    'Second half of <identifier>-<id> could not be parsed to an integer.'
                );
            }
            // push id to number array
            idArray.push(idNum);
        } catch (error) {
            let message;
            if (error instanceof Error) message = error.message;
            else message = String(error);

            // proceed but report the error
            reportError({ message });
        }
    });
    // return the max
    return Math.max(...idArray);
}

export function getMaxIdFromObjectKeyStrings(keyStrings: string[]): number {
    // used in finding the maxId in an Objects keys (unique identifiers)
    // Aim is to always set an items ID above the maxId obtained in the items object
    if (!keyStrings || keyStrings.length === 0) {
        return 0;
    }
    let idArray: number[] = [];
    keyStrings.forEach((key) => {
        try {
            if (key === undefined) {
                throw new Error('Key was undefined');
            }
            // try to parse id to integer
            let idNum = parseInt(key, 10);
            if (isNaN(idNum)) {
                throw new Error(
                    'Something went wrong while trying to parse key to an integer. Value was NOT a Number.'
                );
                // continue trying to parse
            }
            // push id to number array
            idArray.push(idNum);
        } catch (error) {
            let message;
            if (error instanceof Error) message = error.message;
            else message = String(error);
            // proceed but report the error
            reportError({ message });
        }
    });
    return Math.max(...idArray);
}

export const calculateBoundingBoxes = (children: any) => {
    const boundingBoxes = {};

    React.Children.forEach(children, (child) => {
        const domNode = child.ref?.current;
        const nodeBoundingBox = domNode?.getBoundingClientRect();

        boundingBoxes[child.key] = nodeBoundingBox;
    });
    return boundingBoxes;
};
