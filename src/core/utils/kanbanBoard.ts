import { Board, Columns } from '@/core/types/kanbanBoard';

export function initializeBoard(currentTime: string): Board {
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
            },
        },
        columns: {
            'column-1': {
                id: 'column-1',
                title: '',
                bgColor: { r: 255, g: 255, b: 255, a: 0 },
                taskIds: ['task-1'],
                type: 'simple',
            },
        },
        columnOrder: ['column-1'],
    };
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
                bgColor: { r: 255, g: 255, b: 255, a: 0 },
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
                bgColor: { r: 255, g: 255, b: 255, a: 0 },
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
                bgColor: { r: 255, g: 255, b: 255, a: 0 },
                taskIds: ['task-1'],
                type: 'simple',
            },
        };
        let columnOrder: string[] = ['column-1'];

        return { columns, columnOrder };
    }
    return;
}
