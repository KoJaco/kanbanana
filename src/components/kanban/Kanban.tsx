import { useState, useEffect, useCallback, useRef } from 'react';
import { Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import BoardForm from './BoardForm';
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
    TTask,
    Tasks,
    Columns,
} from '@/core/types/kanbanBoard';
import { MdAdd, MdDone, MdOutlineEdit } from 'react-icons/md';
import {
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi';
import { FiEdit } from 'react-icons/fi';

type KanbanProps = {
    slug: string;
};

const scrollButtons = [
    {
        id: 1,
        direction: 'start',
        icon: <HiChevronDoubleLeft className="w-6 h-6" />,
    },
    { id: 2, direction: 'left', icon: <HiChevronLeft className="w-6 h-6" /> },
    { id: 3, direction: 'right', icon: <HiChevronRight className="w-6 h-6" /> },
    {
        id: 4,
        direction: 'end',
        icon: <HiChevronDoubleRight className="w-6 h-6" />,
    },
];

const Kanban = ({ slug }: KanbanProps) => {
    // *** react-beautiful-dnd does not work with React Strict Mode...
    // *** should look at dnd-kit or react-draggable instead, although can simply disable strict mode when testing drag and drop functionality.

    // * STATE VARIABLES
    // instead of setting the whole board here, just set top level board attributes to use within this component.
    // Local board state.
    const [boardState, setBoardState] = useState<Board>(initializeBoard());

    const [showBoardForm, setShowBoardForm] = useState(false);

    // Zustand store state
    const {
        taskCount,
        columnCount,
        setTaskCount,
        setColumnCount,
        increaseColumnCount,
        currentBoardSlug,
        setCurrentBoardSlug,
        maxColumnId,
        maxTaskId,
        setMaxTaskId,
        setMaxColumnId,
    } = useKanbanStore();

    // * HOOKS

    // useLiveQuery() for indexDB state management, watch for changes in local board state.
    const board: Board | undefined = useLiveQuery(
        () => db.boards.get(slug),
        [taskCount, columnCount, slug]
    );

    const reportError = useCallback(({ message }: { message: string }) => {
        // send message to notification service.
    }, []);

    // use effect for setting local board state and global zustand state for this component instance.
    useEffect(() => {
        function getMaxIdFromString<T extends Object>(obj: T) {
            // accepts format 'task-1' or 'column-1', etc... should really type of TTask | TColumn
            const keys = Object.keys(obj);
            let idArray: number[] = [];
            keys.forEach((key) => {
                let [str, id] = key.split('-');
                try {
                    if (id === undefined) {
                        throw new Error(
                            'Second half of <identifier>-<id> (id) was undefined, failed while parsing to integer.'
                        );
                    }
                    // try to parse id to integer
                    let idNum = parseInt(id, 10);
                    if (isNaN(idNum)) {
                        throw new Error(
                            'Second half of <identifier>-<id> could not be parsed to an integer.'
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
            // return the max
            return Math.max(...idArray);
        }

        if (board !== undefined) {
            setBoardState(board);
            setCurrentBoardSlug(slug);
            setTaskCount(Object.keys(board.tasks).length);
            setColumnCount(Object.keys(board.columns).length);
            setMaxTaskId(getMaxIdFromString(board.tasks));
            setMaxColumnId(getMaxIdFromString(board.columns));
        }
    }, [
        board,
        setBoardState,
        setCurrentBoardSlug,
        setTaskCount,
        setColumnCount,
        setMaxTaskId,
        setMaxColumnId,
        reportError,
        slug,
    ]);

    function handleAddColumn() {
        const newColumnId = `column-${maxColumnId + 1}`;

        let newColumn: TColumn = {
            id: newColumnId,
            title: '',
            badgeColor: { r: 255, g: 255, b: 255, a: 0 },
            taskIds: [],
            type: 'simple',
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
        scroller('end');
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

    const scroller = (direction: string, value?: number) => {
        let carousel = document.getElementById('carousel');
        if (carousel !== null) {
            switch (direction) {
                case 'end':
                    carousel.scrollLeft =
                        carousel.scrollWidth - carousel.offsetWidth;
                    break;
                case 'start':
                    carousel.scrollLeft =
                        carousel.clientWidth - carousel.offsetWidth;
                    break;
                case 'left':
                    carousel.scrollLeft = value
                        ? carousel.scrollLeft - value
                        : carousel.scrollLeft - 500;
                    break;
                case 'right':
                    carousel.scrollLeft = value
                        ? carousel.scrollLeft + value
                        : carousel.scrollLeft + 500;
                    break;
                default:
                    break;
            }
        } else {
            // report the error.
            throw new Error('Something went wrong!');
        }
    };

    if (!board && boardState === undefined) return null;

    return (
        <>
            <BoardForm
                variant="edit"
                boardTitle={boardState.title}
                showBoardForm={showBoardForm}
                setShowBoardForm={setShowBoardForm}
            />
            <DragDropContext onDragEnd={onDragEnd}>
                {/* TITLE */}
                <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 ">
                    <div className="flex justify-between items-end gap-8">
                        <h1 className="text-2xl font-semibold text-slate-600">
                            {boardState.title.length === 0
                                ? 'Add a Board Title...'
                                : boardState.title}
                        </h1>
                        <button
                            className="items-center text-slate-500 p-2 rounded-full hover:bg-light-gray cursor-pointer transition-color duration-300"
                            onClick={() => setShowBoardForm(true)}
                        >
                            <MdOutlineEdit className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {/* Carousel component  */}

                <div>
                    <div
                        id="carousel"
                        // ref={carouselRef}
                        className="pb-10 mx-2 sm:mx-8 relative items-center flex overflow-x-scroll scroll invisible-scrollbar scrollbar-rounded-horizontal snap-x whitespace-nowrap scroll-smooth snap-mandatory touch-pan-x transition-all duration-500"
                    >
                        <Droppable
                            droppableId="columns"
                            direction="horizontal"
                            type="column"
                        >
                            {(droppableProvided) => (
                                // column surround
                                <div
                                    className="flex"
                                    ref={droppableProvided.innerRef}
                                    {...droppableProvided.droppableProps}
                                >
                                    {/* column map start */}
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
                                                <div
                                                    className="flex snap-start"
                                                    key={index}
                                                >
                                                    <Column
                                                        key={column.id}
                                                        columnTitle={
                                                            column.title
                                                                .length === 0
                                                                ? 'Add a Column Title...'
                                                                : column.title
                                                        }
                                                        column={column}
                                                        columnId={column.id}
                                                        // @ts-ignore
                                                        columnTasks={tasks}
                                                        totalTaskCount={
                                                            taskCount
                                                        }
                                                        setTotalTaskCount={
                                                            setTaskCount
                                                        }
                                                        currentBoardSlug={
                                                            currentBoardSlug
                                                        }
                                                        index={index}
                                                    />
                                                </div>
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
                                <MdAdd className="w-7 h-7 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* </div> */}
                {/* make this fixed, bottom right on mobile */}
                <div className="my-8 max-w-7xl px-2 sm:px-6 md:px-8 text-slate-600 space-x-2">
                    {scrollButtons.map((button) => (
                        <button
                            key={button.id}
                            onClick={() => scroller(button.direction)}
                            className="bg-transparent disabled:text-gray-500/[0.5] disabled:cursor-not-allowed w-7 h-7 text-slate-600/[.8] hover:text-slate-600  transition-opacity duration-300"
                        >
                            {button.icon}
                        </button>
                    ))}
                </div>
            </DragDropContext>
        </>
    );
};

export default Kanban;
