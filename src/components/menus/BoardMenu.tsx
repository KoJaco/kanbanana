import { useEffect, useMemo } from 'react';
import Link from 'next/link';

import { useRouter } from 'next/router';

import { useUIControlStore } from '@/stores/UIControlStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';
import { Board, BoardTags } from '@/core/types/sortableBoard';
import { BsGrid } from 'react-icons/bs';
import { HiOutlineTag } from 'react-icons/hi';
import Tag from '@/components/elements/Tag';

const BoardMenu = () => {
    const { setSidebarOpen } = useUIControlStore();

    const router = useRouter();
    const currentRoute = router.asPath;

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
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
            <div>
                <div className="group flex items-center px-2 py-1 md:py-2 text-base font-medium rounded-md">
                    <span className="h-full ">
                        <BsGrid className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300 dark:text-slate-50" />
                    </span>
                    <p className=" text-indigo-100 dark:text-slate-50 font-regular uppercase">
                        Boards
                    </p>
                </div>
                <div className="py-1 sm:py-2 border-b border-indigo-500 dark:border-slate-600 text-indigo-200">
                    <Link
                        href={{
                            pathname: '/boards',
                        }}
                        passHref={true}
                    >
                        <a
                            style={{
                                backgroundColor:
                                    currentRoute === '/boards' ? '#FFC414' : '',
                            }}
                            className={
                                currentRoute === '/boards'
                                    ? 'flex items-center gap-5 py-2 px-3 rounded-lg text-md text-slate-900 drop-shadow-md my-1 font-regular dark:shadow-sm dark:shadow-inherit'
                                    : 'flex items-center gap-5 py-2 px-3 my-1 rounded-lg text-md text-indigo-200 dark:text-gray-50 font-light hover:bg-primary-bg-darker dark:hover:bg-slate-700'
                            }
                            onClick={handleCloseSidebar}
                            aria-label="View All Boards"
                        >
                            <div className="flex justify-between items-end">
                                <span className="capitalize">All Boards</span>
                            </div>
                        </a>
                    </Link>
                </div>

                <div className="flex flex-col max-h-48 sm:max-h-96 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
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
                                            ? '#FFC414'
                                            : '',
                                }}
                                className={
                                    currentRoute === `/boards/${board.slug}`
                                        ? 'flex items-center md:gap-5 py-2 px-3 rounded-lg text-md text-slate-900 drop-shadow-md mt-2 font-regular dark:shadow-sm dark:shadow-inherit'
                                        : 'flex items-center sm:gap-5 py-2 px-3 mt-2 rounded-lg text-md text-indigo-200 dark:text-gray-50 font-light hover:bg-primary-bg-darker dark:hover:bg-slate-700'
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
                        <HiOutlineTag className="h-6 w-6 flex-shrink-0 text-indigo-300 dark:text-slate-100" />
                    </span>
                    <p className="text-indigo-100 font-regular uppercase dark:text-slate-100">
                        Tags
                    </p>
                </div>
                <div className="flex flex-col sm:max-h-64 md:max-h-80 overflow-auto no-scrollbar hover:scrollbar-rounded transition-all duration-300">
                    {/* Dynamic component, client-side only */}
                    <ol className="inline-flex px-2 items-center gap-y-2  gap-x-1 w-full max-h-36 md:max-h-64 py-4 whitespace-normal flex-wrap">
                        {allTags.map((tag, index) => (
                            <li key={index}>
                                <Link
                                    href={{
                                        pathname: '/boards',
                                        query: { tagText: tag.text },
                                    }}
                                    passHref={true}
                                >
                                    <a
                                        className="hover:scale-110 transition-transform duration-300"
                                        onClick={handleCloseSidebar}
                                    >
                                        <span className="sr-only">{`Link to boards with tag: ${tag}`}</span>
                                        <Tag
                                            text={tag.text}
                                            backgroundColor={
                                                tag.backgroundColor
                                            }
                                        />
                                    </a>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </>
    );
};

export default BoardMenu;
