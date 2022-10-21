import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';

const AllBoards = () => {
    // TODO: Finish this off
    const boards = useLiveQuery(() => db.getAllBoards(true), []);
    // make sure boards is not undefined
    if (boards === undefined) return null;

    return (
        <>
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
                    return (
                        <li
                            className="mt-4 w-full col-span-1 bg-gray-50 rounded-lg divide-y divide-slate-200 drop-shadow-md hover:drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                            key={index}
                        >
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
                                    <div>
                                        {tags?.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                                                style={{
                                                    backgroundColor:
                                                        tag.backgroundColor
                                                            .value,
                                                    color: tag.backgroundColor
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
                            {/* Container info */}
                            {/* <div>
                                {columnInfo.map((info, index) => (
                                    <div
                                        key={index}
                                        className="-mt-px flex divide-x divide-gray-200"
                                    >
                                        <div className="flex w-0 flex-1">
                                            <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-slate-600 hover:text-gray-500">
                                                <span className="text-slate-500 mx-2">
                                                    Title:
                                                </span>
                                                <span> {info.title}</span>
                                            </div>
                                        </div>
                                        <div className="-ml-px flex w-0 flex-1">
                                            <div className="flex w-0 flex-1">
                                                <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-slate-600 hover:text-gray-500">
                                                    <span className="text-slate-500 mx-2">
                                                        Type:
                                                    </span>

                                                    <span>{info.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="-ml-px flex w-0 flex-1">
                                            <div className="flex w-0 flex-1">
                                                <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-slate-600 hover:text-gray-500">
                                                    <span className="text-slate-500 mx-2">
                                                        Tasks:
                                                    </span>
                                                    <span>
                                                        {info.taskCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div> */}
                        </li>
                    );
                })}
            </ul>
        </>
    );
};

export default AllBoards;
