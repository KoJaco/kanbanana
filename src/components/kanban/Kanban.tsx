import { useState, useEffect, useCallback, useRef } from 'react';
import { Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import { ModifyError } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { initializeBoard } from '@/core/utils/kanbanBoard';
import { useKanbanStore } from '@/stores/KanbanStore';

import type {
    Board,
    TaskId,
    ColumnId,
    TColumn,
    Tasks,
    Columns,
} from '@/core/types/kanbanBoard';
import {
    MdAdd,
    MdDone,
    MdOutlineEdit,
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
} from 'react-icons/md';
import { FiEdit } from 'react-icons/fi';

type KanbanProps = {
    slug: string;
};

const Kanban = ({ slug }: KanbanProps) => {
    // *** react-beautiful-dnd does not work with React Strict Mode...
    // *** should look at dnd-kit or react-draggable instead, although can simply disable strict mode when testing drag and drop functionality.

    // * STATE VARIABLES
    // instead of setting the whole board here, just set top level board attributes to use within this component.
    // Local board state.
    const [boardState, setBoardState] = useState<Board>(
        initializeBoard(Date.now().toLocaleString())
    );

    // detect start of scroll position
    const [scrollX, setScrollX] = useState(0);
    // detect end of scroll available
    const [scrollEnd, setScrollEnd] = useState(false);
    const scroller = useRef<HTMLDivElement>(null);

    // Zustand store state
    const {
        taskCount,
        columnCount,
        setTaskCount,
        setColumnCount,
        increaseColumnCount,
        currentBoardSlug,
        setCurrentBoardSlug,
        maxTaskId,
        setMaxTaskId,
    } = useKanbanStore();

    // * HOOKS

    // useLiveQuery() for indexDB state management, watch for changes in local board state.
    const board: Board | undefined = useLiveQuery(
        () => db.boards.get(slug),
        [taskCount, columnCount, slug]
    );

    // console.log(Object.keys(board.tasks).length);
    // console.log('task count: ' + taskCount + ' column count: ' + columnCount);
    // console.log('Max task id: ' + maxTaskId);

    const reportError = useCallback(({ message }: { message: string }) => {
        // send message to notification service.
    }, []);
    // use effect for setting local board state and global zustand state for this component instance.
    useEffect(() => {
        function getMaxTaskId(tasks: Tasks) {
            const taskIds = Object.keys(tasks);
            let idArray: number[] = [];
            taskIds.forEach((task) => {
                let [t, id] = task.split('-');
                try {
                    if (id === undefined) {
                        throw new Error(
                            'Second half of task-id (id) was undefined, failed while parsing to integer.'
                        );
                    }
                    // try to parse the id to an integer
                    let idNum = parseInt(id, 10);
                    if (isNaN(idNum)) {
                        throw new Error(
                            'Second half of task-id could not be parsed to an integer.'
                        );
                    }
                    // push id to number array
                    idArray.push(idNum);
                } catch (error) {
                    let message;
                    if (error instanceof Error) message = error.message;
                    else message = String(error);

                    // proceed but report the error
                    reportError({ message });
                }
            });
            return Math.max(...idArray);
        }
        if (board !== undefined) {
            setBoardState(board);
            setCurrentBoardSlug(slug);
            setTaskCount(Object.keys(board.tasks).length);
            setColumnCount(Object.keys(board.columns).length);
            setMaxTaskId(getMaxTaskId(board.tasks));
        }
    }, [
        board,
        setBoardState,
        setCurrentBoardSlug,
        setTaskCount,
        setColumnCount,
        setMaxTaskId,
        reportError,
        slug,
    ]);

    // useEffect(() => {
    //     //Check width of the scollings
    //     if (
    //         scroller.current &&
    //         scroller?.current?.scrollWidth === scroller?.current?.offsetWidth
    //     ) {
    //         setScrollEnd(true);
    //     } else {
    //         setScrollEnd(false);
    //     }
    //     return () => {};
    // }, [scroller?.current?.scrollWidth, scroller?.current?.offsetWidth]);

    function handleAddColumn() {
        const newColumnId = `column-${columnCount + 1}`;

        let newColumn: TColumn = {
            id: newColumnId,
            title: '',
            bgColor: { r: 255, g: 255, b: 255, a: 0 },
            taskIds: [],
        };

        db.transaction('rw', db.boards, async () => {
            // add a new task and push that task Id to the column it was added in.
            await db.boards
                .where('slug')
                .equals(currentBoardSlug)
                .modify((item: any) => {
                    item.columns[newColumnId] = newColumn;
                    item.columnOrder.push(newColumnId);
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
        increaseColumnCount();
    }

    // * CONSTS

    // main drag and drop
    // * must save board state to database.
    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // handle re-ordering for a column
        if (type === 'column') {
            const newColumnOrder = Array.from(boardState.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            const newState = {
                ...boardState,
                columnOrder: newColumnOrder,
            };

            db.boards.put(newState, [currentBoardSlug]);

            setBoardState(newState);
            return;
        }

        const startColumn = boardState.columns[source.droppableId];
        const finishColumn = boardState.columns[destination.droppableId];

        if (startColumn === finishColumn && startColumn !== undefined) {
            // create new task id array
            const newTaskIds = Array.from(startColumn.taskIds);
            // move task id from old index to new index
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...startColumn,
                taskIds: newTaskIds,
            };

            const newState = {
                ...boardState,
                columns: {
                    ...boardState.columns,
                    [newColumn.id]: newColumn,
                },
            };
            db.boards.put(newState, [currentBoardSlug]);

            setBoardState(newState);
            return;
        }

        if (startColumn !== undefined && finishColumn !== undefined) {
            // moving from one column to another
            const startTaskIds = Array.from(startColumn.taskIds);
            startTaskIds.splice(source.index, 1);

            const newStartColumn = {
                ...startColumn,
                taskIds: startTaskIds,
            };

            const finishTaskIds = Array.from(finishColumn.taskIds);
            finishTaskIds.splice(destination.index, 0, draggableId);
            const newFinishColumn = {
                ...finishColumn,
                taskIds: finishTaskIds,
            };

            const newState = {
                ...boardState,
                columns: {
                    ...boardState.columns,
                    [newStartColumn.id]: newStartColumn,
                    [newFinishColumn.id]: newFinishColumn,
                },
            };
            db.boards.put(newState, [currentBoardSlug]);

            setBoardState(newState);
        }
    };

    function handleSlide(xShift: number) {
        console.log('slide start:' + scrollX);
        if (scroller.current !== null && scroller !== null) {
            scroller.current.scrollLeft += xShift;
            setScrollX(scrollX + xShift); // updates latest scrolled position

            if (
                Math.floor(
                    scroller.current.scrollWidth - scroller.current.scrollLeft
                ) <= scroller.current.offsetWidth
            ) {
                setScrollEnd(true);
            } else {
                setScrollEnd(false);
            }
        }
        console.log('slide end:' + scrollX);
    }

    function checkScroll() {
        if (scroller.current !== null) {
            setScrollX(scroller.current.scrollLeft);
            if (
                Math.floor(
                    scroller.current.scrollWidth - scroller.current.scrollLeft
                ) <= scroller.current.offsetWidth
            ) {
                setScrollEnd(true);
            } else {
                setScrollEnd(false);
            }
        }
    }

    if (!board && boardState === undefined) return null;

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                {/* TITLE */}
                <div className="my-8 mx-2 max-w-7xl px-4 sm:px-6 md:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {boardState.title.length === 0
                            ? 'Add a Board Title...'
                            : boardState.title}
                    </h1>
                </div>
                <div
                    className="flex flex-row mx-auto px-4 sm:px-6 md:px-8 overflow-x-auto no-scrollbar"
                    ref={scroller}
                    onScroll={checkScroll}
                >
                    {/* Board */}
                    <Droppable
                        droppableId="columns"
                        direction="horizontal"
                        type="column"
                    >
                        {(droppableProvided) => (
                            <div
                                className="flex"
                                ref={droppableProvided.innerRef}
                                {...droppableProvided.droppableProps}
                            >
                                {boardState.columnOrder.map(
                                    (columnId: ColumnId, index: number) => {
                                        // Columns should always be defined, see server/db.ts
                                        const column =
                                            boardState.columns[columnId]!;

                                        const tasks = column.taskIds.map(
                                            (taskId: TaskId) =>
                                                boardState.tasks[taskId]
                                        );

                                        return (
                                            <Column
                                                key={column.id}
                                                columnTitle={
                                                    column.title.length === 0
                                                        ? 'Add a Column Title...'
                                                        : column.title
                                                }
                                                column={column}
                                                columnId={column.id}
                                                // @ts-ignore
                                                columnTasks={tasks}
                                                totalTaskCount={taskCount}
                                                setTotalTaskCount={setTaskCount}
                                                currentBoardSlug={
                                                    currentBoardSlug
                                                }
                                                index={index}
                                            />
                                        );
                                    }
                                )}
                                {droppableProvided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <div className="flex mb-auto ml-2 items-center">
                        <button
                            className="bg-transparent text-gray-500 bg-gray-100 p-1 rounded-full transition-transform duration-300 hover:drop-shadow"
                            onClick={handleAddColumn}
                        >
                            <MdAdd className="w-7 h-7 text-gray-500 dark:text-gray-50" />
                        </button>
                    </div>
                </div>
                <div className="my-8 mx-2 max-w-7xl px-4 sm:px-6 md:px-8 text-slate-600 space-x-2">
                    {/* scroll left button, disable on initial scroll position */}
                    <button
                        onClick={() => handleSlide(-384)}
                        disabled={scrollX === 0}
                    >
                        <MdKeyboardArrowLeft className="w-7 h-7 rounded-full hover:bg-light-gray transition-color duration-300 cursor-pointer disabled:cursor-not-allowed" />
                    </button>

                    {/* scroll right button, disable when we cannot scroll right more */}
                    <button
                        onClick={() => handleSlide(+384)}
                        disabled={scrollEnd}
                    >
                        <MdKeyboardArrowRight className="w-7 h-7 rounded-full hover:bg-light-gray transition-color duration-300 cursor-pointer disabled:cursor-not-allowed" />
                    </button>
                </div>
            </DragDropContext>
        </>
    );
};

export default Kanban;
