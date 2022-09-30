import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useOnClickOutside } from '@/core/hooks/index';
import { useKanbanStore } from '@/stores/KanbanStore';
import { db } from '@/server/db';
import { stringToRandomSlug } from '@/core/utils/misc';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
    MdClose,
    MdOutlineAdd,
    MdModeEdit,
    MdFormatListBulleted,
    MdOutlineChecklist,
    MdSort,
} from 'react-icons/md';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { BsChevronBarDown } from 'react-icons/bs';
import { TiDelete } from 'react-icons/ti';
import {
    Board,
    TColumn,
    Tasks,
    Columns,
    BoardTags,
    BoardTag,
} from '@/core/types/kanbanBoard';
import { useLiveQuery } from 'dexie-react-hooks';
import { ModifyError } from 'dexie';
import { getMaxIdFromString } from '@/core/utils/kanbanBoard';
import ColumnForm from './ColumnForm';
import TagForm from './TagForm';
import Tag from '@/components/elements/Tag';
import clsx from 'clsx';

type CreateBoardFormProps = {
    showBoardForm: boolean;
    setShowBoardForm: (value: boolean) => void;
};

// Array of tags, can map over
const initialTags: BoardTags = [
    {
        id: 1,
        color: { name: 'white', value: '#fff', textDark: true },
        text: '',
    },
];

// object of columns, map through using column order.
const initialColumns: Columns = {
    'column-1': {
        id: 'column-1',
        title: '',
        type: 'simple',
        completedTaskOrder: 'noChange',
        badgeColor: { name: 'white', value: '#fff', textDark: true },
        taskIds: ['task-1'],
    },
};

const defaultColor = { name: 'white', value: '#fff', textDark: true };

const initialColumnOrder: string[] = ['column-1'];

// column-1 should point to this, don't do anything further with this just save to db upon submit.
const initialTasks: Tasks = {
    'task-1': {
        id: 1,
        color: { name: 'white', value: '#fff', textDark: true },
        completed: false,
        content: '',
        updatedAt: '',
        createdAt: '',
    },
};

var omit = require('object.omit');

const CreateBoardForm = ({
    setShowBoardForm,
    ...props
}: CreateBoardFormProps) => {
    // TODO: Need to fix edit column form, it updates all columns when saving. also, change the plus into a tick icon.
    // controlled inputs for form fields, everything we're editing
    const [boardTitle, setBoardTitle] = useState<string>('');
    // need separate form for editing a single tag
    const [boardTags, setBoardTags] = useState<BoardTags>();
    // need separate form for editing a single column
    const [boardColumns, setBoardColumns] = useState<Columns | undefined>();
    const [boardColumnOrder, setBoardColumnOrder] = useState<string[]>();

    const [showTagForm, setShowTagForm] = useState<boolean>(false);
    const [showColumnForm, setShowColumnForm] = useState<boolean>(false);

    const [columnFormState, setColumnFormState] = useState<'add' | 'edit'>(
        'add'
    );
    const [currentColumnId, setCurrentColumnId] = useState<string>('column-1');

    const { setCurrentBoardSlug, columnCount, setColumnCount, setMaxColumnId } =
        useKanbanStore();

    function handleBoardTitleInputChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        setBoardTitle(event.currentTarget.value);
    }

    function initNewColumn() {
        if (boardColumns !== undefined) {
            const columnId = `column-${getMaxIdFromString(boardColumns)}`;
            const newColumn: TColumn = {
                id: columnId,
                title: '',
                type: 'simple',
                completedTaskOrder: 'noChange',
                badgeColor: { name: 'white', value: 'fff', textDark: true },
                taskIds: columnId === 'column-1' ? ['task-1'] : [],
            };
            return newColumn;
        } else {
            throw new Error('Error trying to initialise new column.');
        }
    }

    function handleAddColumn(column: TColumn) {
        if (boardColumnOrder === undefined || boardColumnOrder.length === 0) {
            setBoardColumns({ [column.id]: column });
            setBoardColumnOrder([column.id]);
        } else {
            let newColumnOrder = Array.from(boardColumnOrder);
            setBoardColumns({ ...boardColumns, [column.id]: column });
            newColumnOrder.push(column.id);
            setBoardColumnOrder(newColumnOrder);
        }
        setShowColumnForm(false);
    }

    function handleRemoveColumn(columnId: string) {
        if (boardColumnOrder !== undefined) {
            let newColumns = omit(boardColumns, columnId);
            let newColumnOrder = Array.from(boardColumnOrder);
            for (let i = 0; i < newColumnOrder.length; i++) {
                let id = newColumnOrder[i];
                if (id === columnId) {
                    newColumnOrder.splice(i, 1);
                }
            }
            setBoardColumns(newColumns);
            setBoardColumnOrder(newColumnOrder);
        }
    }

    function handleEditColumn(columnId: string) {
        setCurrentColumnId(columnId);
        setColumnFormState('edit');
        if (showColumnForm) {
            setShowColumnForm(false);
            setTimeout(() => {
                setShowColumnForm(true);
            }, 100);
        } else {
            handleToggleColumnForm();
        }
    }

    function handleAddTag(tag: BoardTag) {
        if (boardTags === undefined || boardTags.length === 0) {
            setBoardTags([tag]);
        } else {
            let newTags = Array.from(boardTags);
            newTags.push(tag);
            setBoardTags(newTags);
        }
        setShowTagForm(false);
    }

    function handleRemoveTag(index: number) {
        if (boardTags !== undefined) {
            // id is simple the index + 1
            let newTags = Array.from(boardTags);
            newTags.splice(index, 1);
            setBoardTags(newTags);
        }
    }

    function handleToggleTagForm() {
        if (showColumnForm) {
            setShowColumnForm(false);
        }
        setShowTagForm((showTagForm) => !showTagForm);
    }

    function handleToggleColumnForm() {
        if (showTagForm) {
            setShowTagForm(false);
        }
        setShowColumnForm((showColumnForm) => !showColumnForm);
    }

    function handleCancelEdit() {
        // reset state if cancel was click, assume user wishes for their changes to NOT be saved in any way.
        resetState();
        // close slide over
        setShowBoardForm(false);
    }

    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        let tags = boardTags === undefined ? initialTags : boardTags;
        let columns =
            boardColumns === undefined ? initialColumns : boardColumns;
        let columnOrder =
            boardColumnOrder === undefined
                ? initialColumnOrder
                : boardColumnOrder;
        console.log(boardTitle);
        // remember to set the key from task options object
        db.transaction('rw', db.boards, async () => {
            // modify the board state, assert board slug is not undefined.
            await db.addBoard(
                boardTitle,
                tags,
                initialTasks,
                columns,
                columnOrder
            );
        });
        // // Catch modification error and generic error.
        // .catch('ModifyError', (e: ModifyError) => {
        //     // Failed with ModifyError, check e.failures.
        //     console.error(
        //         'ModifyError occurred: ' + e.failures.length + ' failures'
        //     );
        // })
        // .catch((e: Error) => {
        //     console.error('Generic error: ' + e);
        // });
    }

    function resetState() {
        // wait for transition to close, .5 sec timeout
        setTimeout(() => {
            setBoardTitle('');
            setBoardTags(undefined);
            setBoardColumns(undefined);
            setBoardColumnOrder(undefined);
        }, 500);
    }

    function retrieveMaxColumnId() {
        if (boardColumns === undefined) {
            return 0;
        } else if (
            boardColumnOrder === undefined ||
            boardColumnOrder.length === 0
        ) {
            return 0;
        } else {
            return getMaxIdFromString(boardColumns);
        }
    }

    const reportError = useCallback(({ message }: { message: string }) => {
        // send message to notification service.
    }, []);

    const renderSortingIcon = (sortingMethod: string) => {
        switch (sortingMethod) {
            case 'start':
                return (
                    <span>
                        <BiSortUp />
                    </span>
                );

            case 'end':
                return (
                    <span>
                        <BiSortDown />
                    </span>
                );

            case 'noChange':
                return (
                    <span>
                        <MdSort />
                    </span>
                );

            default:
                return (
                    <span>
                        <MdSort />
                    </span>
                );
        }
    };

    return (
        <Transition.Root show={props.showBoardForm} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                onClose={setShowBoardForm}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <form
                                        className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                                        onSubmit={handleSubmit}
                                    >
                                        <div className="h-0 flex-1 overflow-y-auto no-scrollbar">
                                            {/* HEADER SECTION */}
                                            <div className="bg-offset-bg py-6 px-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <Dialog.Title className="text-lg font-medium text-slate-600">
                                                        Create a new Board
                                                    </Dialog.Title>

                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md transparent text-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                            onClick={() =>
                                                                setShowBoardForm(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <span className="sr-only">
                                                                Close panel
                                                            </span>
                                                            <MdClose
                                                                className="h-6 w-6"
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-sm text-slate-500">
                                                        Fill out the information
                                                        below and do not forget
                                                        to save!
                                                    </p>
                                                </div>
                                            </div>
                                            <div className=" mt-4 space-y-4 sm:mt-10">
                                                {/* Board tag input*/}
                                                <div className="flex flex-1 flex-col justify-between border-b border-gray-100">
                                                    <div className="px-2 sm:px-4">
                                                        <div className="space-y-4 pt-6 pb-5 px-1">
                                                            <div>
                                                                <label
                                                                    htmlFor="boardTitle"
                                                                    className="block text-sm font-medium text-slate-600"
                                                                >
                                                                    Board Title
                                                                    *
                                                                </label>

                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="boardTitle"
                                                                        id="boardTitle"
                                                                        value={
                                                                            boardTitle
                                                                        }
                                                                        placeholder={
                                                                            boardTitle
                                                                                ? boardTitle
                                                                                : 'Give your board a title.'
                                                                        }
                                                                        className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                        onChange={
                                                                            handleBoardTitleInputChange
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            {/* small display for tag and column info */}
                                                            <div className="flex flex-col w-full space-y-4 overflow-x-auto no-scrollbar">
                                                                {/* tags */}
                                                                <div className="flex flex-col max-h-16 ">
                                                                    <label
                                                                        htmlFor="boardTags"
                                                                        className="block text-sm font-medium text-slate-600"
                                                                    >
                                                                        Tags:
                                                                    </label>
                                                                    {/* tags map for display only */}
                                                                    <div className="flex flex-wrap gap-x-2 gap-y-2 mt-1">
                                                                        {boardTags?.map(
                                                                            (
                                                                                tag,
                                                                                index
                                                                            ) =>
                                                                                tag
                                                                                    .text
                                                                                    .length >
                                                                                    0 && (
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="flex group"
                                                                                        style={{}}
                                                                                    >
                                                                                        <span
                                                                                            className="text-sm rounded-full px-2"
                                                                                            style={{
                                                                                                color: tag
                                                                                                    .color
                                                                                                    .textDark
                                                                                                    ? '#333'
                                                                                                    : '#fff',
                                                                                                backgroundColor:
                                                                                                    tag
                                                                                                        .color
                                                                                                        .value,
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                tag.text
                                                                                            }
                                                                                        </span>
                                                                                        <div className="flex">
                                                                                            <button
                                                                                                type="button"
                                                                                                name="delete-tag"
                                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                                                onClick={() =>
                                                                                                    handleRemoveTag(
                                                                                                        index
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <TiDelete className="text-slate-600" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* columns */}
                                                                <div className="w-auto max-h-96 overflow-y-auto no-scrollbar">
                                                                    <label
                                                                        htmlFor="board-columns"
                                                                        className="block text-sm font-medium text-slate-600 "
                                                                    >
                                                                        Columns:
                                                                    </label>
                                                                    <div className="mt-1 gap-y-2 gap-x-2 my-4">
                                                                        {/* map through columns for display only*/}
                                                                        {boardColumnOrder?.map(
                                                                            (
                                                                                columnId: string,
                                                                                index: number
                                                                            ) => {
                                                                                const column =
                                                                                    boardColumns![
                                                                                        columnId
                                                                                    ];
                                                                                return column ==
                                                                                    undefined ||
                                                                                    column
                                                                                        .title
                                                                                        .length ===
                                                                                        0 ? null : (
                                                                                    // Column display card
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="group rounded-md border shadow my-2 text-md"
                                                                                    >
                                                                                        <div
                                                                                            className="flex flex-col p-2 rounded-t-md"
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    column
                                                                                                        .badgeColor
                                                                                                        .value,
                                                                                            }}
                                                                                        >
                                                                                            <button
                                                                                                type="button"
                                                                                                className="opacity-0 group-hover:opacity-100 flex justify-end transition-opacity duration-300"
                                                                                                style={{
                                                                                                    color: column
                                                                                                        .badgeColor
                                                                                                        .textDark
                                                                                                        ? '#333'
                                                                                                        : '#fff',
                                                                                                }}
                                                                                                onClick={() =>
                                                                                                    handleEditColumn(
                                                                                                        column.id
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <MdModeEdit className="w-5" />
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className="flex flex-col p-2 divide-x">
                                                                                            {/* upper flex, column number and badge
                                                                                            <div
                                                                                                className="flex items-center mb-2"
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        column
                                                                                                            .badgeColor
                                                                                                            .value,
                                                                                                }}
                                                                                            >
                                                                                                <div>{`${
                                                                                                    index +
                                                                                                    1
                                                                                                }.`}</div>

                                                                                                <div
                                                                                                    className="flex ml-auto w-5 h-5 rounded-full"
                                                                                                    style={{
                                                                                                        backgroundColor:
                                                                                                            column
                                                                                                                .badgeColor
                                                                                                                .value,
                                                                                                    }}
                                                                                                ></div>
                                                                                            </div> */}

                                                                                            <div className="flex gap-x-12 items-center text-slate-600">
                                                                                                <div className="flex flex-col">
                                                                                                    <label className="text-sm font-medium">
                                                                                                        Title
                                                                                                    </label>
                                                                                                    <div>
                                                                                                        {
                                                                                                            column.title
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="flex flex-col">
                                                                                                    <label className="text-sm font-medium">
                                                                                                        Type
                                                                                                    </label>
                                                                                                    <div>
                                                                                                        {
                                                                                                            column.type
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                {column.type ===
                                                                                                    'checklist' && (
                                                                                                    <div className="flex flex-col">
                                                                                                        <label className="text-sm font-medium">
                                                                                                            Ordering
                                                                                                        </label>
                                                                                                        <div>
                                                                                                            {
                                                                                                                column.completedTaskOrder
                                                                                                            }
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex items-center justify-end mt-2">
                                                                                            <button
                                                                                                type="button"
                                                                                                name="delete-tag"
                                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2"
                                                                                                onClick={() =>
                                                                                                    handleRemoveColumn(
                                                                                                        column.id
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <TiDelete className="text-slate-600 w-5 h-5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Board tag/column input*/}
                                                <div className="flex flex-1 flex-col justify-between border-b border-gray-100">
                                                    <div className="px-2 sm:px-4">
                                                        <div className="space-y-2 px-1">
                                                            <div className="relative inline-block w-full"></div>
                                                            <button
                                                                type="button"
                                                                className="inline-flex w-full justify-end rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:shadow-sm hover:bg-gray-50 focus:outline-none mb-4"
                                                                onClick={
                                                                    handleToggleTagForm
                                                                }
                                                            >
                                                                Add some tags
                                                                <BsChevronBarDown
                                                                    className="-mr-1 ml-2 h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            </button>
                                                            <Transition
                                                                show={
                                                                    showTagForm
                                                                }
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <TagForm
                                                                    id={
                                                                        boardTags ===
                                                                        undefined
                                                                            ? 1
                                                                            : boardTags.length
                                                                    }
                                                                    handleAddTag={
                                                                        handleAddTag
                                                                    }
                                                                />
                                                            </Transition>
                                                        </div>
                                                    </div>
                                                    <div className="px-2 sm:px-4">
                                                        <div className="space-y-2 pt-6 pb-5 px-1">
                                                            <div className="relative inline-block w-full"></div>

                                                            <button
                                                                type="button"
                                                                className="inline-flex w-full justify-end rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:shadow-sm hover:bg-gray-50 focus:outline-none mb-4"
                                                                onClick={
                                                                    handleToggleColumnForm
                                                                }
                                                            >
                                                                Add some columns
                                                                <BsChevronBarDown
                                                                    className="-mr-1 ml-2 h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            </button>
                                                            <Transition
                                                                show={
                                                                    showColumnForm
                                                                }
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                {columnFormState ===
                                                                    'edit' &&
                                                                boardColumns !==
                                                                    undefined ? (
                                                                    <ColumnForm
                                                                        id={
                                                                            retrieveMaxColumnId() +
                                                                            1
                                                                        }
                                                                        column={
                                                                            boardColumns[
                                                                                currentColumnId
                                                                            ]
                                                                        }
                                                                        handleAddColumn={
                                                                            handleAddColumn
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ColumnForm
                                                                        id={
                                                                            retrieveMaxColumnId() +
                                                                            1
                                                                        }
                                                                        handleAddColumn={
                                                                            handleAddColumn
                                                                        }
                                                                    />
                                                                )}
                                                            </Transition>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-shrink-0 justify-end px-4 py-4">
                                            <button
                                                type="button"
                                                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                onClick={handleCancelEdit}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-primary-darker py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark-alt focus:outline-none transition-color duration-300 disabled:cursor-not-allowed"
                                                disabled={
                                                    boardTitle.length < 1
                                                        ? true
                                                        : false
                                                }
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default CreateBoardForm;
