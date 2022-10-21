import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useMemo } from 'react';
import { BoardTags } from '@/core/types/sortableBoard';

const AllBoards = () => {
    // TODO: Finish this off
    const boards = useLiveQuery(() => db.getAllBoards(true), []);
    const router = useRouter();

    const data = router.query;

    console.log(data);

    // make sure boards is not undefined
    if (boards === undefined) return null;

    return (
        <>
            {/* <div className="text-slate-600 text-sm py-2">
                Total boards: {boards.length}
            </div> */}
            <ul
                role="list"
                className="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-6"
            >
                {/* map through boards */}
                {boards?.map((board, index) => {
                    let {
                        title,
                        slug,
                        updatedAt,
                        tags,
                        containers,
                        items,
                        containerItemMapping,
                        containerOrder,
                    } = board;
                    // single board

                    if (
                        (data &&
                            tags &&
                            tags?.filter((tag) => {
                                return tag.text === data.tagText;
                            }).length > 0) ||
                        data.boards === 'all'
                    ) {
                        return (
                            <Link
                                key={index}
                                href={{
                                    pathname: `/boards/[slug]`,
                                    query: {
                                        slug: encodeURIComponent(slug),
                                    },
                                }}
                                passHref={true}
                            >
                                <a className="mt-4 w-full col-span-1 bg-gray-50 rounded-lg divide-y divide-slate-200 drop-shadow-md hover:drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                                    {/* Title, timestamp, and tags */}
                                    <div className="flex w-full items-end justify-between space-x-6 p-6">
                                        <div className="flex-1 truncate">
                                            <div className="flex justify-between items-center space-x-3">
                                                <h3 className="truncate text-md font-medium text-gray-900">
                                                    {board.title}
                                                </h3>
                                                <p className="mt-1 truncate text-sm text-gray-500">
                                                    {board.updatedAt.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="space-x-1">
                                                {tags?.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                tag
                                                                    .backgroundColor
                                                                    .value,
                                                            color: tag
                                                                .backgroundColor
                                                                .textDark
                                                                ? '#333'
                                                                : '#fff',
                                                        }}
                                                    >
                                                        {tag.text}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </Link>
                        );
                    } else if (!data) {
                        return (
                            <Link
                                key={index}
                                href={{
                                    pathname: `/boards/[slug]`,
                                    query: {
                                        slug: encodeURIComponent(slug),
                                    },
                                }}
                                passHref={true}
                            >
                                <a className="mt-4 w-full col-span-1 bg-gray-50 rounded-lg divide-y divide-slate-200 drop-shadow-md hover:drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                                    {/* Title, timestamp, and tags */}
                                    <div className="flex w-full items-end justify-between space-x-6 p-6">
                                        <div className="flex-1 truncate">
                                            <div className="flex justify-between items-center space-x-3">
                                                <h3 className="truncate text-md font-medium text-gray-900">
                                                    {board.title}
                                                </h3>
                                                <p className="mt-1 truncate text-sm text-gray-500">
                                                    {board.updatedAt.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="space-x-1">
                                                {tags?.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                tag
                                                                    .backgroundColor
                                                                    .value,
                                                            color: tag
                                                                .backgroundColor
                                                                .textDark
                                                                ? '#333'
                                                                : '#fff',
                                                        }}
                                                    >
                                                        {tag.text}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </Link>
                        );
                    } else {
                        return null;
                    }
                })}
            </ul>
        </>
    );
};

export default AllBoards;
