import { Board } from './types';

export const newBoard: Board = {
    title: 'first-board',
    slug: 'first-board-asd82j3',
    createdAt: new Date(Date.now()).toLocaleString(),
    updatedAt: new Date(Date.now()).toLocaleString(),
    tags: [
        {
            id: 1,
            backgroundColor: {
                name: 'white',
                value: '#fff',
                textDark: true,
            },
            text: 'work',
        },
    ],
    containerItemMapping: {
        A: ['A1', 'A2', 'A3'],
        B: ['B1', 'B2'],
        C: ['C1', 'C2', 'D3'],
    },
    containers: {
        A: {
            id: 'A',
            title: 'Observations',
            type: 'simple',
            completedItemOrder: 'noChange',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
        },
        B: {
            id: 'B',

            title: 'Checklist',
            type: 'checklist',
            completedItemOrder: 'start',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
        },
        C: {
            id: 'C',

            title: 'Done',
            type: 'checklist',
            completedItemOrder: 'start',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
        },
    },
    items: {
        A1: {
            id: 'A1',
            content: 'A1',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
        A2: {
            id: 'A2',
            content: 'A2',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
        A3: {
            id: 'A3',
            content: 'A3',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
        B1: {
            id: 'B1',
            content: 'B1',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
        B2: {
            id: 'B2',
            content: 'B2',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
        C1: {
            id: 'C1',
            content: 'C1',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
        C2: {
            id: 'C2',
            content: 'C2',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
        C3: {
            id: 'C3',
            content: 'C3',
            badgeColor: { name: 'white', value: '#fff', textDark: true },
            completed: false,
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
        },
    },
};
