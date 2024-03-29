import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Board, UniqueIdentifier } from '@/core/types/sortableBoard';
import clsx from 'clsx';
import { useTheme } from 'next-themes';

const tabs = ['months', 'weeks', 'days'];

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const daysPerMonths = [
    // 29 in a year divisible by 4
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
];

interface Days {
    [key: UniqueIdentifier]: Board[];
    // {'22/9/2022': [board1, board2]},
    // {'23/9/2022': ...etc}
}

interface Weeks {
    [key: UniqueIdentifier]: Board[];
    // {'22/9/2022-27/9/2022': [board1, board2]},
    // {'14/9/2022 - 21/9/2022': ...etc}
}

interface Months {
    [key: UniqueIdentifier]: Board[];
    // {'09/2022': [board1, board2]},
    // ... etc
}

const AllBoards = () => {
    const [currentTime, setCurrentTime] = useState<string>('months');

    const { theme } = useTheme();

    const boards = useLiveQuery(() => db.getAllBoards(true), []);

    // Could have used date-fns here, cleaner solution.
    const filteredBoards: Months | Weeks | Days = useMemo(() => {
        // let filteredDatesSet = new Set<string>();
        let filteredBoardsObject: any = {};

        if (boards && boards[0] && boards.length > 0) {
            boards.forEach((board) => {
                // one loop to add unique object keys
                const date = board.updatedAt;
                const dayOfTheWeek = date.getDay();
                const dayIndex = date.getDate();

                const monthIndex = date.getMonth();

                const year = date.getFullYear();
                let identifier = '';
                let startOfWeek = '';
                let difference = 0;
                let endOfWeek = '';
                switch (currentTime) {
                    case 'days':
                        identifier = date.toLocaleString('en-uk', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                        // identifier = `${date.getDate()}/${monthIndex}/${year}`;
                        break;
                    case 'weeks':
                        // start of week is: the day index - the day of the week
                        difference = 7 - dayOfTheWeek;
                        startOfWeek = `${dayIndex - dayOfTheWeek} ${
                            months[monthIndex]
                        } ${year}`;

                        if (dayIndex - dayOfTheWeek <= 1) {
                            // if we're in day 3 and it's Nov 2, start of the week is 31 (oct) - difference (3-2)

                            if (monthIndex === 0) {
                                // if it's january, we need to subtract 1 from the year
                                startOfWeek = `${dayIndex - dayOfTheWeek} ${
                                    months[0]
                                } ${year}`;
                            } else {
                                startOfWeek = `${
                                    daysPerMonths[monthIndex - 1]! -
                                    (dayOfTheWeek - dayIndex)
                                } ${months[monthIndex - 1]} ${year}`;
                            }
                        }

                        if (
                            dayIndex - dayOfTheWeek + 7 >
                            daysPerMonths[monthIndex]!
                        ) {
                            // if the week will bridge into the next month, need to add 1 to month index
                            endOfWeek = `${
                                dayIndex -
                                dayOfTheWeek +
                                7 -
                                daysPerMonths[monthIndex]!
                            } ${months[monthIndex + 1]} ${year}`;
                        } else if (monthIndex === 1 && year % 4 === 0) {
                            // if it is a leap year
                            if (
                                dayIndex - dayOfTheWeek + 7 >
                                daysPerMonths[monthIndex]! + 1
                            ) {
                                startOfWeek = `${
                                    daysPerMonths[monthIndex - 1]! -
                                    dayOfTheWeek +
                                    1
                                } ${months[monthIndex - 1]} ${year}`;
                                endOfWeek = `${
                                    dayIndex -
                                    dayOfTheWeek +
                                    7 -
                                    daysPerMonths[monthIndex]!
                                } ${months[monthIndex + 1]} ${year}`;
                            }
                        } else {
                            endOfWeek = `${dayIndex - dayOfTheWeek + 7} ${
                                months[monthIndex]
                            } ${year}`;
                        }

                        identifier = `${startOfWeek} - ${endOfWeek}`;

                        break;
                    case 'months':
                        identifier = `${months[monthIndex]}, ${year}`;
                        break;
                    default:
                        break;
                }
                // filteredDatesSet.add(identifier);

                if (filteredBoardsObject[identifier]) {
                    filteredBoardsObject[identifier].push(board);
                } else {
                    filteredBoardsObject[identifier] = [];
                    filteredBoardsObject[identifier].push(board);
                }
            });
        }
        return filteredBoardsObject;
    }, [boards, currentTime]);

    const router = useRouter();

    const data = router.query;

    const textColorStyle = (colorName: string, textDark: boolean) => {
        if (colorName === 'transparent' && theme === 'light') {
            return 'rgba(0,0,0,1)';
        } else if (colorName === 'transparent' && theme === 'dark') {
            return 'rgba(255,255,255,1)';
        }
        if (textDark) {
            return '#333';
        } else {
            return '#fff';
        }
    };

    // make sure boards is not undefined
    if (boards === undefined) return null;

    return (
        <>
            <div className="flex items-center mb-4">
                <h1 className="text-2xl font-semibold text-slate-600 dark:text-gray-50">
                    Boards
                </h1>
                <div className="flex ml-auto">
                    <div className="block">
                        <div
                            className="isolate flex divide-x divide-gray-200 dark:divide-slate-500 rounded-lg shadow"
                            aria-label="Tabs"
                        >
                            {tabs.map((tab, tabIdx) => (
                                <button
                                    key={tab}
                                    className={clsx(
                                        tab === currentTime
                                            ? 'text-gray-900 dark:text-slate-100'
                                            : 'text-gray-500 dark:text-slate-100/75 hover:text-gray-700 dark:hover:text-slate-100',
                                        tabIdx === 0 ? 'rounded-l-lg' : '',
                                        tabIdx === tabs.length - 1
                                            ? 'rounded-r-lg'
                                            : '',
                                        'group relative min-w-0 flex-1 overflow-hidden bg-white dark:bg-slate-700 py-2 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
                                    )}
                                    aria-current={
                                        tab === currentTime ? 'page' : undefined
                                    }
                                    aria-label={`Set Timeframe to ${tab}`}
                                    onClick={() => {
                                        setCurrentTime(tab);
                                    }}
                                >
                                    <span>{tab}</span>
                                    <span
                                        aria-hidden="true"
                                        className={clsx(
                                            tab === currentTime
                                                ? 'bg-indigo-500 dark:bg-offset-bg'
                                                : 'bg-transparent',
                                            'absolute inset-x-0 bottom-0 h-0.5'
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {boards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] w-full text-slate-700 dark:text-slate-100 px-4">
                    <h1 className="text-3xl mb-4">No boards yet?</h1>
                    <p className="text-lg whitespace-normal">
                        Click the New Board button in the sidebar to get
                        creating!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {/* map through sorted objects. */}
                    {Object.entries(filteredBoards).map(
                        (boardsInDateRange, index) => {
                            const dateIdentifier: string = boardsInDateRange[0];
                            const boards: Board[] = boardsInDateRange[1];

                            return (
                                <div key={index} className="mt-4">
                                    {/* Date range identifier */}
                                    <div className="flex flex-col h-auto w-full text-slate-600 dark:text-slate-100/75">
                                        {dateIdentifier}
                                    </div>

                                    <div className="mb-10">
                                        {/* Map through boards to generate board cards*/}
                                        <ul
                                            role="list"
                                            className="grid 2xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-2 md:gap-4 lg:gap-6"
                                        >
                                            {/* map through boards */}
                                            {boards?.map((board, index) => {
                                                let { title, slug, tags } =
                                                    board;

                                                if (
                                                    (data &&
                                                        tags &&
                                                        tags?.filter((tag) => {
                                                            return (
                                                                tag.text ===
                                                                data.tagText
                                                            );
                                                        }).length > 0) ||
                                                    router.asPath === '/boards'
                                                ) {
                                                    return (
                                                        <li
                                                            key={index}
                                                            className="mt-4 w-full col-span-1 bg-gray-50 dark:bg-gradient-to-r dark:from-slate-700 dark:to-slate-800 rounded-lg divide-y divide-slate-200 drop-shadow-md hover:drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                        >
                                                            <Link
                                                                href={{
                                                                    pathname: `/boards/[slug]`,
                                                                    query: {
                                                                        slug: encodeURIComponent(
                                                                            slug
                                                                        ),
                                                                    },
                                                                }}
                                                                passHref={true}
                                                            >
                                                                <a>
                                                                    {/* Title, timestamp, and tags */}
                                                                    <div className="flex w-full items-end justify-between space-x-6 p-6">
                                                                        <div className="flex-1 truncate">
                                                                            <div className="flex justify-between items-start space-x-3">
                                                                                <h2 className="truncate text-md font-medium text-slate-900 dark:text-gray-50">
                                                                                    {
                                                                                        title
                                                                                    }
                                                                                </h2>
                                                                            </div>
                                                                            <p className="mt-1 truncate text-sm text-gray-500 dark:text-slate-200 whitespace-normal">
                                                                                {board.updatedAt.toLocaleString(
                                                                                    'en-uk',
                                                                                    {
                                                                                        weekday:
                                                                                            'long',
                                                                                        month: 'short',
                                                                                        day: 'numeric',
                                                                                        hour: 'numeric',
                                                                                        minute: 'numeric',
                                                                                        second: 'numeric',
                                                                                    }
                                                                                )}
                                                                            </p>
                                                                            <div className="space-x-1">
                                                                                {tags?.map(
                                                                                    (
                                                                                        tag,
                                                                                        index
                                                                                    ) => (
                                                                                        <span
                                                                                            key={
                                                                                                index
                                                                                            }
                                                                                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                                                tag
                                                                                                    .backgroundColor
                                                                                                    .name ===
                                                                                                    'transparent' &&
                                                                                                'border-1 border-slate-500'
                                                                                            }`}
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    tag
                                                                                                        .backgroundColor
                                                                                                        .value,
                                                                                                color: textColorStyle(
                                                                                                    tag
                                                                                                        .backgroundColor
                                                                                                        .name,
                                                                                                    tag
                                                                                                        .backgroundColor
                                                                                                        .textDark
                                                                                                ),
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                tag.text
                                                                                            }
                                                                                        </span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            </Link>
                                                        </li>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            )}
        </>
    );
};

export default AllBoards;
