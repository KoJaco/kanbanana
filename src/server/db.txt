import Dexie, { Table } from 'dexie';
import {
    Board,
    BoardTags,
    BoardTag,
    Columns,
    Tasks,
} from '@/core/types/kanbanBoard';
import { stringToRandomSlug } from '@/core/utils/misc';

// https://dexie.org/docs/Version/Version.stores()
// https://dexie.org/docs/Table/Table.update()

export class KanbanBoardDexie extends Dexie {
    boards!: Table<Board>;

    constructor() {
        super('checklistitDB');
        this.version(1).stores({
            boards: 'slug, tag, updatedAt', // primary key is slug, index tag and updatedAt for .where clause
        });
        // get a Dexie Table object, which is a class that represents our object store
        // this means we can interact with the boards object store using this.boards.add(), etc.
        this.boards = this.table('boards');
    }

    getRecentBoards(howMany: number) {
        return howMany <= 1
            ? this.boards.orderBy('updatedAt').reverse().limit(1).toArray()
            : this.boards
                  .orderBy('updatedAt')
                  .reverse()
                  .limit(howMany)
                  .toArray();
    }

    // getBoardsByTag(boardTagId: number) {
    //     return this.boards
    //         .orderBy('updatedAt')
    //         .reverse()
    //         .filter((board) => {
    //             return board.tags.filter((tag) => tag.id === boardTagId);
    //         });
    // }

    getAllBoards(reverseOrder: boolean) {
        return reverseOrder
            ? this.boards.orderBy('updatedAt').reverse().toArray()
            : this.boards.orderBy('updatedAt').toArray();
    }

    getColumn(id: string, boardSlug: string) {
        return this.boards
            .where('slug')
            .equals(boardSlug)
            .filter((item: any) => {
                return item.columns[id];
            });
    }

    addBoard(
        title: string,
        slug: string,
        tags: BoardTags,
        tasks: Tasks,
        columns: Columns,
        columnOrder: string[]
    ) {
        // initialising a board after use inputs a title and a tag
        // returns a promise that resolves when the underlying indexedDB request succeeds.
        // use promise chaining or async/await pattern.
        return this.boards.add({
            title: title,
            tags: tags,
            slug: slug,
            // is this guaranteed to be unique? no, practically impossible but still no... need to fix.
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
            tasks: tasks,
            // initialise tasks, always start with one blank task.
            // tasks: {
            //     'task-1': {
            //         id: 1,
            //         content: '',
            //         color: {
            //             name: 'transparent',
            //             value: '#00ffffff',
            //             textDark: true,
            //         },
            //         completed: false,
            //         createdAt: new Date(Date.now()).toLocaleString(),
            //         updatedAt: new Date(Date.now()).toLocaleString(),
            //     },
            // },
            columns: columns,
            // initialise columns, always start with one blank column.
            // columns: {
            //     'column-1': {
            //         id: 'column-1',
            //         title: '',
            //         badgeColor: {
            //             name: 'transparent',
            //             value: '#00ffffff',
            //             textDark: true,
            //         },
            //         type: 'simple',
            //         completedTaskOrder: 'noChange',
            //         taskIds: ['task-1'],
            //     },
            // },
            columnOrder: columnOrder,
        });
    }

    deleteBoard(boardId: number) {
        return this.transaction('rw', this.boards, () => {
            this.boards.delete(boardId);
        });
    }

    addColumn(columnId: string) {}

    addTask(taskId: number, taskContent: string) {}
}

export function resetDatabase() {
    return db.transaction('rw', db.boards, async () => {
        await Promise.all(db.tables.map((table) => table.clear()));
    });
}

export const db = new KanbanBoardDexie();
