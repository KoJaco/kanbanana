import Dexie, { Table } from 'dexie';
import {
    Board,
    BoardTags,
    Containers,
    ContainerOrder,
    ContainerItemMapping,
    Items,
} from '@/core/types/sortableBoard';

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

    getAllBoards(reverseOrder: boolean) {
        return reverseOrder
            ? this.boards.orderBy('updatedAt').reverse().toArray()
            : this.boards.orderBy('updatedAt').toArray();
    }

    // getCurrentDatabaseMetaData() {
    //     const metaDataObject = {
    //         databaseName: '',
    //         databaseVersion: 0,
    //         tables: [
    //             {
    //                 name: '',
    //                 rowCount: 0,
    //                 schema: 'slug, tag, updatedAt',
    //             },
    //         ],
    //     };
    //     return;
    // }

    addBoard(
        title: string,
        slug: string,
        tags: BoardTags,
        items: Items,
        containers: Containers,
        containerOrder: ContainerOrder,
        containerItemMapping: ContainerItemMapping
    ) {
        return this.boards.add({
            title: title,
            tags: tags,
            slug: slug,
            // is this guaranteed to be unique? no, practically impossible but still no... need to fix.
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
            items: items,
            containers: containers,
            containerOrder: containerOrder,
            containerItemMapping: containerItemMapping,
        });
    }

    deleteBoard(slug: string) {
        return this.transaction('rw', this.boards, () => {
            this.boards.delete(slug);
        });
    }
}

export function resetDatabase() {
    return db.transaction('rw', db.boards, async () => {
        await Promise.all(db.tables.map((table) => table.clear()));
    });
}

export const db = new KanbanBoardDexie();
