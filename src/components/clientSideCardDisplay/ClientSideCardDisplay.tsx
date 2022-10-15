import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';

const ClientSideCardDisplay = () => {
    const boards = useLiveQuery(() => db.getAllBoards(true), []);

    const initialBoardCount = useLiveQuery(() => db.boards.count());

    // const columnInfo = { title: string; type: string; taskCount: number }[];

    // make sure boards is not undefined
    // if (boards === undefined) return null;

    return (
        <>
            {/* {boards === undefined ? (
                <div>Get Creating Boards!</div>
            ) : (
                <ul
                    role="list"
                    className="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-6"
                >
                    {boards.map((board) => {
                        let columnInfo: {
                            title: string;
                            type: 'checklist' | 'simple';
                            taskCount: number;
                        }[] = [];

                        board.columnOrder.map((columnId) => {
                            let col = board.columns[columnId];
                            col !== undefined &&
                                columnInfo.push({
                                    title: col.title,
                                    type: col.type,
                                    taskCount: col.taskIds.length,
                                });
                        });

                        return (
                            <li
                                className="mt-4 w-full col-span-1 bg-white rounded-lg divide-y divide-slate-200 shadow-md"
                                key={board.slug}
                            >
                                <div className="flex w-full items-center justify-between space-x-6 p-6">
                                    <div className="flex-1 truncate">
                                        <div className="flex justify-between items-center space-x-3">
                                            <h3 className="truncate text-md font-medium text-gray-900">
                                                {board.title}
                                            </h3>
                                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                {board.tag}
                                            </span>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-gray-500">
                                            {board.updatedAt}
                                        </p>
                                    </div>
                                </div>
                                <div>
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
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )} */}
        </>
    );
};

export default ClientSideCardDisplay;
