import { Board } from '@/core/types/kanbanBoard';

const now = new Date(Date.now()).toLocaleString();

export function getMaxIdFromString<T extends Object>(obj: T) {
    // accepts format 'task-1' or 'column-1', etc... should really type of TTask | TColumn
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

export function initializeBoard(): Board {
    return {
        title: '',
        slug: '',
        createdAt: now,
        updatedAt: now,
        tags: [
            {
                id: 1,
                text: '',
                color: {
                    name: 'transparent',
                    value: '#00ffffff',
                    textDark: true,
                },
            },
        ],
        tasks: {
            'task-1': {
                id: 1,
                content: '',
                color: {
                    name: 'transparent',
                    value: '#00ffffff',
                    textDark: true,
                },
                completed: false,
                createdAt: now,
                updatedAt: now,
            },
        },
        columns: {
            'column-1': {
                id: 'column-1',
                title: '',
                badgeColor: {
                    name: 'transparent',
                    value: '#00ffffff',
                    textDark: true,
                },
                taskIds: ['task-1'],
                type: 'simple',
                completedTaskOrder: 'noChange',
            },
        },
        columnOrder: ['column-1'],
    };
}
