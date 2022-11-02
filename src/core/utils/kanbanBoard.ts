import React from 'react';

const now = new Date(Date.now()).toLocaleString();

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

export const calculateBoundingBoxes = (children: any) => {
    const boundingBoxes = {};

    React.Children.forEach(children, (child) => {
        const domNode = child.ref.current;
        const nodeBoundingBox = domNode?.getBoundingClientRect();

        boundingBoxes[child.key] = nodeBoundingBox;
    });
    return boundingBoxes;
};
