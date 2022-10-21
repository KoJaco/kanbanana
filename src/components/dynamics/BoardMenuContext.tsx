import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';

type BoardMenuContextProps = {
    children: JSX.Element;
};

const BoardMenuContext = ({ children }: BoardMenuContextProps) => {
    const { boardCount, setBoardCount } = useKanbanStore();

    const boards = useLiveQuery(
        () => db.getAllBoards(true),
        // () => db.boards.orderBy('updatedAt').reverse().toArray(),
        [boardCount] //we should retrieve whenever board count is updated
    );

    const initialBoardCount = useLiveQuery(() => db.boards.count());

    useEffect(() => {
        // board count is also updated in the CreateBoardForm component, and also when boards are deleted.
        initialBoardCount !== undefined && setBoardCount(initialBoardCount);
    }, [initialBoardCount, setBoardCount]);

    if (!boards) return;

    return <div>{children}</div>;
};

export default BoardMenuContext;
