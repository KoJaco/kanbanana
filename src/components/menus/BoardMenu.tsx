import { useEffect } from 'react';
import Link from 'next/link';

import { useRouter } from 'next/router';

import { useUIControlStore } from '@/stores/UIControlStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';

const BoardMenu = () => {
    const { boardCount, setBoardCount } = useKanbanStore();

    const { sidebarOpen, setSidebarOpen, screenSize, currentColor } =
        useUIControlStore();

    const router = useRouter();
    const currentRoute = router.asPath;

    const handleCloseSidebar = () => {
        if (sidebarOpen && screenSize != undefined && screenSize <= 900) {
            setSidebarOpen(false);
        }
    };

    // change this to async, user defined... can be recent boards given number, all, reverse order, specific tags, etc.
    const boards = useLiveQuery(
        () => db.getAllBoards(true),
        // () => db.boards.orderBy('updatedAt').reverse().toArray(),
        [boardCount] //we should retrieve whenever board count is updated
    );

    const initialBoardCount = useLiveQuery(() => db.boards.count());

    console.log(initialBoardCount);
    useEffect(() => {
        // board count is also updated in the CreateBoardForm component, and also when boards are deleted.
        initialBoardCount !== undefined && setBoardCount(initialBoardCount);
    }, [initialBoardCount, setBoardCount]);

    return (
        <>
            <ol>
                {boards?.map((board, index) => (
                    <li key={index}>
                        <Link
                            href={{
                                pathname: `/boards/[slug]`,
                                query: {
                                    slug: encodeURIComponent(board.slug),
                                },
                            }}
                            passHref={true}
                            key={index}
                        >
                            <a
                                // Hydration error with null value
                                style={{
                                    backgroundColor:
                                        currentRoute === `/boards/${board.slug}`
                                            ? currentColor
                                            : '',
                                }}
                                className={
                                    currentRoute === `/boards/${board.slug}`
                                        ? 'flex items-center gap-5 py-2 px-3 rounded-lg text-md text-indigo-200 drop-shadow-md mt-2 font-light'
                                        : 'flex items-center gap-5 py-2 px-3 mt-2 rounded-lg text-md text-indigo-200 bg-transparent dark:text-gray-200  hover:bg-primary-bg-darker font-light'
                                    //   `bg-[${currentColor.toLowerCase()}]`
                                }
                                onClick={handleCloseSidebar}
                            >
                                <div className="flex justify-between items-end">
                                    <span className="capitalize">
                                        {board.title}
                                    </span>
                                </div>
                            </a>
                        </Link>
                    </li>
                ))}
            </ol>
        </>
    );
};

export default BoardMenu;
