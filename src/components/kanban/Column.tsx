import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Droppable } from 'react-beautiful-dnd';

import { MdDragIndicator, MdAdd, MdBrush } from 'react-icons/md';
import { RgbaColorPicker } from 'react-colorful';

import Task from './Task';
import type {
    TColumn,
    TTask,
    Board,
    Tasks,
    Columns,
} from '@/core/types/kanbanBoard';
import { useOnClickOutside } from '@/core/hooks';
import { useKanbanStore } from '@/stores/KanbanStore';
import Dexie, { ModifyError } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';

import clsx from 'clsx';

type ColumnProps = {
    column: TColumn | undefined;
    columnId: string;
    index: number;
    columnTitle: string;
    columnTasks: Array<TTask> | undefined;
    totalTaskCount: number;
    setTotalTaskCount: (newTotal: number) => void;
    currentBoardSlug: string;
    children?: JSX.Element;
};

const Column = ({ children, columnTasks, ...props }: ColumnProps) => {
    // * STATE
    // local state variables for Column
    const [columnTitle, setColumnTitle] = useState<string>('');

    const [color, setColor] = useState<{
        r: number;
        g: number;
        b: number;
        a: number;
    }>({ r: 250, g: 250, b: 250, a: 0 });

    const [showColorPicker, setShowColorPicker] = useState(false);

    // Zustand global state
    const {
        columnCount,
        taskCount,
        increaseTaskCount,
        decreaseTaskCount,
        currentBoardSlug,
        maxTaskId,
        increaseMaxTaskId,
    } = useKanbanStore();

    // * HOOKS and REFS

    const colorPickerRef = useRef(null);
    useOnClickOutside(colorPickerRef, () => handleShowColorPicker(false));

    // const column: TColumn | undefined = useLiveQuery(
    //     async () =>
    //         await db.boards
    //             .get(currentBoardSlug)
    //             .then((board: Board | undefined) => {
    //                 return board === undefined
    //                     ? undefined
    //                     : board.columns[props.columnId];
    //             }),
    //     []
    // );

    // * HANDLER FUNCTIONS
    function handleAddTask() {
        const newTaskId = `task-${maxTaskId + 1}`;

        let newTask = {
            id: maxTaskId + 1,
            content: '',
            color: 'rgba(255, 255, 255, 1)',
        };

        db.transaction('rw', db.boards, async () => {
            // add a new task and push that task Id to the column it was added in.
            await db.boards
                .where('slug')
                .equals(props.currentBoardSlug)
                .modify((item: any) => {
                    item.tasks[newTaskId] = newTask;
                    // props.columnId will always be defined.
                    item.columns[props.columnId]!.taskIds.push(newTaskId);
                });
        })
            // Catch modification error and generic error.
            .catch('ModifyError', (e: ModifyError) => {
                // Failed with ModifyError, check e.failures.
                console.error(
                    'ModifyError occurred: ' + e.failures.length + ' failures'
                );
            })
            .catch((e: Error) => {
                console.error('Generic error: ' + e);
            });
    }

    function handleShowColorPicker(value: boolean) {
        // this should async save the bg color to DB for the column
        setShowColorPicker(value);
    }

    // * OTHER FUNCTIONS
    function parsedColor(color: {
        r: number;
        g: number;
        b: number;
        a: number;
    }) {
        return `rgba(${color.r},${color.g},${color.b},${color.a})`;
    }

    // If default values are returned, queries are still loading:
    if (!props.column) return null;

    return (
        <>
            <Draggable draggableId={props.column.id} index={props.index}>
                {(draggableProvided) => (
                    <div
                        className="flex flex-col sm:w-28 md:w-56 lg:w-96 bg-red-50 px-2"
                        {...draggableProvided.draggableProps}
                        ref={draggableProvided.innerRef}
                    >
                        <div className="flex justify-between items-center group my-2">
                            <h1 className="text-l text-gray-500 font-medium italic">
                                {props.columnTitle}
                            </h1>
                            <div
                                className="mr-4"
                                {...draggableProvided.dragHandleProps}
                            >
                                <MdDragIndicator className="opacity-0 group-hover:opacity-100 text-gray-500 cursor-drag focus:cursor-drag transition-opacity duration-300" />
                            </div>
                        </div>

                        {/* Indicated that column will NEVER be undefined */}
                        <Droppable droppableId={props.column!.id} type="task">
                            {(droppableProvided, droppableSnapshot) => (
                                <div
                                    className="py-2 rounded-md transition-color duration-300 h-full"
                                    style={{
                                        backgroundColor:
                                            droppableSnapshot.isDraggingOver
                                                ? '#F0F0F0'
                                                : parsedColor(color),
                                    }}
                                    ref={droppableProvided.innerRef}
                                    {...droppableProvided.droppableProps}
                                >
                                    {columnTasks?.map(
                                        (task: TTask, index: number) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={`task-${task.id}`}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        className="py-2"
                                                        {...provided.draggableProps}
                                                        ref={provided.innerRef}
                                                    >
                                                        <Task
                                                            id={task.id}
                                                            content={
                                                                task.content
                                                            }
                                                            taskCount={6}
                                                            columnId={
                                                                props.columnId
                                                            }
                                                            editing={false}
                                                            color={task.color}
                                                        >
                                                            <div
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <MdDragIndicator className="flex text-gray-500 cursor-drag focus:cursor-drag" />
                                                            </div>
                                                        </Task>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )
                                    )}
                                    {droppableProvided.placeholder}
                                    <div className="flex my-2 w-full h-auto justify-end">
                                        <button
                                            className="bg-transparent hover:scale-110 text-gray-500 transition-transform duration-300"
                                            onClick={handleAddTask}
                                        >
                                            <MdAdd className="w-5 h-5 text-gray-500 dark:text-gray-50" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                        <div className="my-4 ml-4">
                            <div className="flex justify-start mt-4">
                                <button
                                    className={clsx(
                                        'rounded-md border-1 border-gray-300 p-1 drop-shadow-sm',
                                        showColorPicker &&
                                            'scale-110 transition-transform duration-300 drop-shadow-lg '
                                    )}
                                    style={{
                                        backgroundColor: parsedColor(color),
                                    }}
                                    onClick={() => setShowColorPicker(true)}
                                    // disable when selecting color, let useOnClickOutside handle close
                                    disabled={showColorPicker ? true : false}
                                >
                                    <MdBrush className="w-5 h-5 text-gray-50 hover:text-gray-500 transition-colors duration-500 focus:text-gray-500" />
                                    {/* colour picker component, fixed to bottom of screen */}
                                </button>
                            </div>
                            {/* {showColorPicker && (
                                <div
                                    ref={colorPickerRef}
                                    className="fixed bottom-12 right-12 drop-shadow-lg hover:scale-110 transition-all duration-500 z-10000 cursor-pointer"
                                >
                                    <RgbaColorPicker
                                        className="w-28 h-28"
                                        color={color}
                                        onChange={setColor}
                                    ></RgbaColorPicker>
                                </div>
                            )} */}
                        </div>
                    </div>
                )}
            </Draggable>
        </>
    );
};

export default Column;