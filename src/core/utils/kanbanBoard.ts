import { Board } from '@/core/types/kanbanBoard';

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
            },
        },
        columnOrder: ['column-1'],
    };
}
