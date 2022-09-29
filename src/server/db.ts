import Dexie, { Table } from 'dexie';
import { Board, BoardTags, BoardTag } from '@/core/types/kanbanBoard';

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

    addBoard(boardTitle: string, boardTags: BoardTags, boardSlug: string) {
        // initialising a board after use inputs a title and a tag
        // returns a promise that resolves when the underlying indexedDB request succeeds.
        // use promise chaining or async/await pattern.
        return this.boards.add({
            title: boardTitle,
            tags: boardTags,
            slug: boardSlug,
            // is this guaranteed to be unique? no, practically impossible but still no... need to fix.
            createdAt: new Date(Date.now()).toLocaleString(),
            updatedAt: new Date(Date.now()).toLocaleString(),
            // initialise tasks, always start with one blank task.
            tasks: {
                'task-1': {
                    id: 1,
                    content: '',
                    color: {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 1,
                    },
                    completed: false,
                    createdAt: new Date(Date.now()).toLocaleString(),
                    updatedAt: new Date(Date.now()).toLocaleString(),
                },
            },
            // initialise columns, always start with one blank column.
            columns: {
                'column-1': {
                    id: 'column-1',
                    title: '',
                    badgeColor: {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 1,
                    },
                    type: 'simple',
                    completedTaskOrder: 'noChange',
                    taskIds: ['task-1'],
                },
            },
            columnOrder: ['column-1'],
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
