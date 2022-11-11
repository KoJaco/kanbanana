import Dexie, { Table } from 'dexie';
import { stringToRandomSlug } from '@/core/utils/misc';
import type {
    Board,
    BoardTags,
    Containers,
    ContainerOrder,
    ContainerItemMapping,
    Items,
} from '@/core/types/sortableBoard';

// https://dexie.org/docs/Version/Version.stores()#:~:text=Syntax%20For%20Primary%20Key&text=Primary%20key%20must%20always%20be%20unique.&text=Means%20that%20primary%20key%20is,not%20visible%20on%20the%20objects.

export class KanbanBoardDexie extends Dexie {
    boards!: Table<Board>;

    constructor() {
        super('checklistitDB');
        this.version(1).stores({
            boards: 'slug, tag, updatedAt', // primary key is slug, index tag and updatedAt for .where clause
        });

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

    addBoard(
        title: string,
        slug: string,
        tags: BoardTags,
        items: Items,
        containers: Containers,
        containerOrder: ContainerOrder,
        containerItemMapping: ContainerItemMapping
    ) {
        // Dexie primary keys are implicitly marked as unique, I believe
        return this.boards.add({
            title: title,
            tags: tags,
            slug: slug,
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
