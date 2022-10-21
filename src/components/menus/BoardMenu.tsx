import { useEffect, useMemo } from 'react';
import Link from 'next/link';

import { useRouter } from 'next/router';

import { useUIControlStore } from '@/stores/UIControlStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';
import { Board, BoardTags } from '@/core/types/sortableBoard';
import { IoList } from 'react-icons/io5';
import { HiOutlineTag } from 'react-icons/hi';
import Tag from '@/components/elements/Tag';

const BoardMenu = () => {
    // TODO: Add showTags and showTimestamp options, add styling for each if they're selected... maybe show tags on hover, or beneath.
    // const { boardCount, setBoardCount } = useKanbanStore();

    const { sidebarOpen, setSidebarOpen, screenSize, currentColor } =
        useUIControlStore();

    const router = useRouter();
    const currentRoute = router.asPath;

    const handleCloseSidebar = () => {
        if (sidebarOpen && screenSize != undefined && screenSize <= 900) {
            setSidebarOpen(false);
        }
    };

    const { boardCount, setBoardCount } = useKanbanStore();

    const boards = useLiveQuery(
        () => db.getAllBoards(true),
        // () => db.boards.orderBy('updatedAt').reverse().toArray(),
        [boardCount] //we should retrieve whenever board count is updated
    );

    const initialBoardCount = useLiveQuery(() => db.boards.count());

    useEffect(() => {
        // board count is also updated in the CreateBoardForm component, and also when boards are deleted.
        if (initialBoardCount !== undefined) {
            setBoardCount(initialBoardCount);
        }
    }, [initialBoardCount, setBoardCount]);

    const allTags = useMemo(() => {
        if (boards !== undefined) {
            // initially concat tags from each board
            let tags: BoardTags = [];
            boards.forEach((board: Board) => {
                if (board.tags) {
                    let boardTags = board.tags;
                    tags = tags.concat(boardTags);
                }
            });

            // remove duplicate tags based on text
            let lessDuplicateTags: BoardTags = [];
            let uniqueObject: any = {};
            for (let i = 0; i < tags.length; i++) {
                if (tags && tags[i]) {
                    const text = tags[i]!['text'];
                    uniqueObject[text] = tags[i]!;
                }
            }
            for (let j in uniqueObject) {
                lessDuplicateTags.push(uniqueObject[j]);
            }

            // sort tags alphabetically

            lessDuplicateTags.sort((t1, t2) => {
                // object sort algorithm, sort alphabetically by text
                const textA = t1.text.toLowerCase();
                const textB = t2.text.toLowerCase();
                if (textA > textB) {
                    return 1;
                }
                if (textA < textB) {
                    return -1;
                }
                return 0;
            });

            return lessDuplicateTags;
        } else {
            return null;
        }
    }, [boards]);

    if (!boards || !allTags) return null;

    return (
        <>
            <div className="">
                <div
                    className="text-indigo-100 
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                    <span className="h-full ">
                        <IoList className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 " />
                    </span>
                    <p className=" text-indigo-100 font-regular uppercase">
                        Boards
                    </p>
                </div>
                <div className="py-2 border-b border-indigo-500 text-indigo-200">
                    <Link
                        href={{
                            pathname: '/boards',
                        }}
                        passHref={true}
                    >
                        <a
                            style={{
                                backgroundColor:
                                    currentRoute === '/boards'
                                        ? currentColor
                                        : '',
                            }}
                            className={
                                currentRoute === '/boards'
                                    ? 'flex items-center gap-5 py-2 px-3 rounded-lg text-md text-indigo-200 drop-shadow-md mt-2 font-light'
                                    : 'flex items-center gap-5 py-2 px-3 mt-2 rounded-lg text-md text-indigo-200 font-light hover:bg-primary-bg-darker'
                            }
                            // onClick={handleCloseSidebar}
                        >
                            <div className="flex justify-between items-end">
                                <span className="capitalize">All Boards</span>
                            </div>
                        </a>
                    </Link>
                </div>

                <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                    {boards?.map((board, index) => (
                        <Link
                            key={index}
                            href={{
                                pathname: `/boards/[slug]`,
                                query: {
                                    slug: encodeURIComponent(board.slug),
                                },
                            }}
                            passHref={true}
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
                                        : 'flex items-center gap-5 py-2 px-3 mt-2 rounded-lg text-md text-indigo-200 font-light hover:bg-primary-bg-darker'
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
                    ))}
                </div>
            </div>
            <div>
                <div
                    className="text-indigo-100 
                                            group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                    <span className="h-full text-indigo-100 mr-4">
                        <HiOutlineTag className="h-6 w-6 flex-shrink-0 text-indigo-300" />
                    </span>
                    <p className="text-indigo-100 font-regular uppercase">
                        Tags
                    </p>
                </div>
                <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                    {/* Dynamic component, client-side only */}
                    <ol className="inline-flex px-2 items-center gap-x-2 gap-y-2 w-full max-h-96 py-4 whitespace-normal flex-wrap">
                        {allTags.map((tag, index) => (
                            <button
                                key={index}
                                className="hover:scale-110 transition-transform duration-300"
                            >
                                <Tag
                                    text={tag.text}
                                    backgroundColor={tag.backgroundColor}
                                />
                            </button>
                        ))}
                    </ol>
                </div>
            </div>
            <ol></ol>
        </>
    );
};

export default BoardMenu;
