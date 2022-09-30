import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Droppable } from 'react-beautiful-dnd';

import { MdDragIndicator, MdAdd, MdBrush, MdOutlineEdit } from 'react-icons/md';
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
import { useUIControlStore } from '@/stores/UIControlStore';
import { useKanbanStore } from '@/stores/KanbanStore';
import Dexie, { ModifyError } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { AiOutlineDelete } from 'react-icons/ai';

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
    const { currentColor } = useUIControlStore();

    // * STATE
    // local state variables for Column
    const [columnTitle, setColumnTitle] = useState<string>('');
    const [showEditColumnForm, setShowEditColumnForm] = useState(false);
    var omit = require('object.omit');

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
            color: { name: 'transparent', value: '#00ffffff', textDark: true },
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

    function handleRemoveColumn() {
        // TODO: 1. retrieve all taskIds in given column, 2. remove columnId from columnOrder array, 3. remove all tasks that match any of the given taskIds, 4. remove column from columns.
        // restrictions...
        // ** cannot remove column if there is only one column. handled in disabled button.
        // ** cannot remove column if there is only one task, and that column contains the task. Handled in disabled button.
        const oldColumnId = props.columnId;
        let removingTaskIds: string[] = [];
        let newTasks: Tasks = {};
        let newColumns: Columns = {};

        // need to copy tasks and then remove index while updating all task keys / ids.
        db.transaction('rw', db.boards, async () => {
            // delete count should be 1, catch error
            let deleteCount = await db.boards
                .where('slug')
                .equals(props.currentBoardSlug)
                .modify((item: any) => {
                    if (
                        props.totalTaskCount === 1 &&
                        item.columns[oldColumnId].taskIds.length > 0
                    ) {
                        throw new Error(
                            'Tried to remove column when there is only one task left, this should not have gotten past the disabled button...'
                        );
                    }
                    // get all task Ids to be removed.
                    removingTaskIds = item.columns[oldColumnId].taskIds;
                    // omit taskIds from tasks object
                    newTasks = omit(item.tasks, removingTaskIds);

                    // loop through column order
                    let newColumnOrder: string[] = Array.from(item.columnOrder);
                    for (let i = 0; i < newColumnOrder.length; i++) {
                        let columnId = newColumnOrder[i];
                        if (columnId === oldColumnId) {
                            newColumnOrder.splice(i, 1);
                        }
                    }
                    newColumns = omit(item.columns, oldColumnId);

                    // spread out column id from old columns.
                    // let oldColumns: Columns = item.columns;
                    // const newColumns = (({ oldColumnId, ...rest }) => ({
                    //     ...rest,
                    // }))(oldColumns);

                    // update state
                    // console.log(
                    //     'new Columns: ' +
                    //         `${JSON.stringify(newColumns)}` +
                    //         '\n' +
                    //         'new Tasks: ' +
                    //         `${JSON.stringify(newTasks)}` +
                    //         '\n' +
                    //         'new column order: ' +
                    //         `${newColumnOrder.toString()}`
                    // );
                    item.columns = newColumns;
                    item.tasks = newTasks;
                    item.columnOrder = newColumnOrder;
                });
            if (deleteCount === 1) {
                console.log('Deleted task Column ' + oldColumnId);
            }
        });
    }
    // If default values are returned, queries are still loading:
    if (!props.column) return null;

    return (
        <>
            <Draggable draggableId={props.column.id} index={props.index}>
                {(draggableProvided) => (
                    <div
                        className="flex flex-col w-52 md:w-80 lg:w-96 xl:w-[30rem] sm:px-1 bg-gray-100 mx-1 rounded-md group"
                        {...draggableProvided.draggableProps}
                        ref={draggableProvided.innerRef}
                    >
                        <div className="flex justify-between items-center group mt-2 mb-1 mx-1">
                            <h1 className="text-l text-slate-500 font-medium">
                                {props.columnTitle}
                            </h1>
                            <div {...draggableProvided.dragHandleProps}>
                                <MdDragIndicator className="opacity-0 group-hover:opacity-100 text-gray-500 cursor-drag focus:cursor-drag transition-opacity duration-300" />
                            </div>
                        </div>

                        {/* Indicated that column will NEVER be undefined */}
                        <Droppable droppableId={props.column!.id} type="task">
                            {(droppableProvided, droppableSnapshot) => (
                                <div
                                    className="flex flex-col py-1 rounded-md transition-color duration-300 h-full px-1"
                                    style={{
                                        backgroundColor:
                                            droppableSnapshot.isDraggingOver
                                                ? '#B0AFE6'
                                                : // ? currentColor
                                                  parsedColor(color),
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
                                    <div className="flex my-2 w-full h-auto justify-start">
                                        <button
                                            className="bg-transparent hover:scale-110 text-gray-500 transition-transform duration-300"
                                            onClick={handleAddTask}
                                        >
                                            <MdAdd className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto inset-y-0 opacity-0 border-t group-hover:opacity-100 transition-opacity duration-300 py-2">
                                        <button
                                            type="button"
                                            className="w-5 h-5 rounded-md hover:bg-red-600 cursor-pointer text-gray-500 hover:text-gray-50 flex items-center justify-center transition-color duration-300 disabled:text-gray-500/[0.5] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                            // button is disabled if we only have one column, OR if we will be deleting all our tasks.
                                            disabled={
                                                columnCount === 1
                                                    ? true
                                                    : false ||
                                                      taskCount ===
                                                          columnTasks!.length
                                            }
                                            onClick={handleRemoveColumn}
                                        >
                                            <AiOutlineDelete className="w-4 h-4" />
                                        </button>
                                        <button className="items-center justify-end text-slate-500 py-2 rounded-full hover:text-red-500 cursor-pointer transition-color duration-300">
                                            <MdOutlineEdit className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                        {/* <div className="my-4 ml-4">
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
                                </button>
                            </div>
                            {showColorPicker && (
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
                            )}
                        </div> */}
                    </div>
                )}
            </Draggable>
        </>
    );
};

export default Column;
