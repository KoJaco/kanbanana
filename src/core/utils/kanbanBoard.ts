import { Board, Columns, BoardTags } from '@/core/types/kanbanBoard';

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
        tags: [{ id: 1, text: '', color: '#FFF' }],
        tasks: {
            'task-1': {
                id: 1,
                content: '',
                color: { r: 255, g: 255, b: 255, a: 0 },
                completed: false,
                createdAt: now,
                updatedAt: now,
            },
        },
        columns: {
            'column-1': {
                id: 'column-1',
                title: '',
                badgeColor: { r: 255, g: 255, b: 255, a: 0 },
                taskIds: ['task-1'],
                type: 'simple',
            },
        },
        columnOrder: ['column-1'],
    };
}

export function initEmptyColumns() {
    const columns: Columns = {
        'column-1': {
            id: 'column-1',
            title: '',
            badgeColor: { r: 255, g: 255, b: 255, a: 0 },
            taskIds: ['task-1'],
            type: 'simple',
        },
    };
    return columns;
}

export function initEmptyTags() {
    const tags: BoardTags = [{ id: 1, text: '', color: '#FFF' }];
    return tags;
}

export function initializeBoardWithColumns(
    currentTime: string,
    initializedColumns: Columns,
    initializedColumnOrder: string[]
): Board {
    return {
        title: '',
        slug: '',
        createdAt: currentTime,
        updatedAt: currentTime,
        tasks: {
            'task-1': {
                id: 1,
                content: '',
                color: { r: 255, g: 255, b: 255, a: 0 },
                completed: false,
                createdAt: now,
                updatedAt: now,
            },
        },
        columns: initializedColumns,
        columnOrder: initializedColumnOrder,
    };
}

export function initializeColumns(columnTitles: string[]) {
    if (columnTitles.length > 1) {
        // always initialise 1 column
        let columns: Columns = {
            'column-1': {
                id: 'column-1',
                title: `${columnTitles[0]}`,
                badgeColor: { r: 255, g: 255, b: 255, a: 0 },
                taskIds: ['task-1'],
                type: 'simple',
            },
        };
        let columnOrder: string[] = ['column-1'];
        for (let i = 1; i < columnTitles.length; i++) {
            let columnKey = `column-${i + 1}`;
            let title = `${columnTitles[i]}`;
            columns[columnKey] = {
                id: columnKey,
                title: title,
                badgeColor: { r: 255, g: 255, b: 255, a: 0 },
                taskIds: [],
                type: 'simple',
            };
            columnOrder.push(columnKey);

            return { columns, columnOrder };
        }
    } else if (columnTitles.length <= 1) {
        // always initialise 1 column
        let columns: Columns = {
            'column-1': {
                id: 'column-1',
                title: `${columnTitles[0]}`,
                badgeColor: { r: 255, g: 255, b: 255, a: 0 },
                taskIds: ['task-1'],
                type: 'simple',
            },
        };
        let columnOrder: string[] = ['column-1'];

        return { columns, columnOrder };
    }
    return;
}
