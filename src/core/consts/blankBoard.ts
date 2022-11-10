import { Board } from '@/core/types/sortableBoard';

export const blankBoard: Board = {
    title: '',
    slug: '',
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
    tags: [],
    containerItemMapping: {},
    containerOrder: [],
    containers: {},
    items: {},
};
