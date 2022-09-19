import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MdClose, MdOutlineAdd } from 'react-icons/md';
import {
    Columns,
    Board,
    BoardTag,
    BoardTags,
    Color,
} from '@/core/types/kanbanBoard';
import { useLiveQuery } from 'dexie-react-hooks';
import { ModifyError } from 'dexie';
import { db } from '@/server/db';
import {
    initializeColumns,
    initializeBoardWithColumns,
} from '@/core/utils/kanbanBoard';
import { parseColorToString, stringToRandomSlug } from '@/core/utils/misc';

type BoardFormProps = {
    variant: 'create' | 'edit';
    // just need the board slug? update indexDB directly
    boardSlug?: string;
    boardTitle?: string;
    boardTag?: BoardTag;
    columnTitles?: string[];
    showBoardForm: boolean;
    setShowBoardForm: (value: boolean) => void;
};
import { useKanbanStore } from '@/stores/KanbanStore';

import ColumnForm from './ColumnForm';
import router from 'next/router';
const initialBoardTag = {
    id: 1,
    color: '#fff',
    text: '',
};

const BoardForm = ({
    setShowBoardForm,
    boardTitle = '',
    ...props
}: BoardFormProps) => {
    // TODO: Finish this component with full data, should be able to add tags and columns here too.

    // controlled inputs for form fields

    const { setCurrentBoardSlug } = useKanbanStore();

    const [state, setState] = useState({
        boardTitle: boardTitle,
        columnTitles: props.columnTitles ? props.columnTitles : [''],
    });

    const [boardTag, setBoardTag] = useState(
        props.boardTag ? props.boardTag : initialBoardTag
    );

    function handleTitleInputChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const value = event.currentTarget.value;
        setState({
            ...state,
            [event.target.name]: value,
        });
    }

    function handleTagInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        setBoardTag({
            ...boardTag,
            [event.target.name]: value,
        });
    }

    function handleAddColumn() {
        setState({
            ...state,
            columnTitles: [...state.columnTitles, ''],
        });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        if (props.boardSlug !== undefined && props.variant === 'edit') {
            db.transaction('rw', db.boards, async () => {
                // put the new board state, assert board slug is not undefined.
                await db.boards
                    .where('slug')
                    .equals(props.boardSlug!)
                    .modify((item: any) => {
                        item.title = boardTitle;
                        item.updatedAt = Date.now().toLocaleString();
                        // need to update columns and columnOrder
                    });
            })
                // Catch modification error and generic error.
                .catch('ModifyError', (e: ModifyError) => {
                    // Failed with ModifyError, check e.failures.
                    console.error(
                        'ModifyError occurred: ' +
                            e.failures.length +
                            ' failures'
                    );
                })
                .catch((e: Error) => {
                    console.error('Generic error: ' + e);
                });
        } else if (props.variant === 'create') {
            let { columns, columnOrder } = initializeColumns(
                state.columnTitles
            )!;
            let newBoard = initializeBoardWithColumns(
                Date.now().toLocaleString(),
                columns,
                columnOrder
            );

            createBoard(newBoard);
        }
    }

    const createBoard = async (board: Board) => {
        const slug = stringToRandomSlug(board.title);
        try {
            db.boards.add(board, [slug]);
            console.info(
                `A new board was created with title: ${board.title} and tag: ${board.tag}`
            );
            setCurrentBoardSlug(slug);
            // push to board detail endpoint
            router
                .push(`/boards/${slug}`, undefined, { shallow: false })
                .then(() => router.reload());
        } catch (error) {
            console.error(`Failed to add board`);
            // push to fail page...
            router.push(`/`);
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
                                        <div className="h-0 flex-1 overflow-y-auto">
                                            <div className="bg-offset-bg py-6 px-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    {props.variant ===
                                                    'create' ? (
                                                        <Dialog.Title className="text-lg font-medium text-slate-600">
                                                            New Board
                                                        </Dialog.Title>
                                                    ) : (
                                                        <Dialog.Title className="text-lg font-medium text-slate-600">
                                                            {boardTitle}
                                                        </Dialog.Title>
                                                    )}

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
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className=" px-4 sm:px-6">
                                                    <div className="space-y-4 pt-6 pb-5">
                                                        <div className="text-slate-600">
                                                            <h3>Board info</h3>
                                                        </div>
                                                        <div>
                                                            <label
                                                                htmlFor="boardTitle"
                                                                className="block text-sm font-medium text-slate-600"
                                                            >
                                                                Board Title
                                                            </label>
                                                            <div className="mt-1">
                                                                <input
                                                                    type="text"
                                                                    name="boardTitle"
                                                                    id="boardTitle"
                                                                    value={
                                                                        state.boardTitle
                                                                    }
                                                                    placeholder={
                                                                        boardTitle
                                                                            ? boardTitle
                                                                            : 'Give your board a title.'
                                                                    }
                                                                    className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                    onChange={
                                                                        handleTitleInputChange
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-row gap-3 justify-between">
                                                            <div className="w-full">
                                                                <label
                                                                    htmlFor="Tag"
                                                                    className="block text-sm font-medium text-slate-600"
                                                                >
                                                                    Tag
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="text"
                                                                        id="text"
                                                                        value={
                                                                            boardTag.text
                                                                        }
                                                                        placeholder={
                                                                            boardTag.text
                                                                                ? boardTag.text
                                                                                : 'Write something here.'
                                                                        }
                                                                        className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                        onChange={
                                                                            handleTagInputChange
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="">
                                                                <label
                                                                    // htmlFor="Tags"
                                                                    htmlFor="tag-color"
                                                                    className="block text-sm font-medium text-slate-600"
                                                                >
                                                                    Color
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="color"
                                                                        name="color"
                                                                        value={
                                                                            boardTag.color
                                                                        }
                                                                        id="color"
                                                                        className="appearance-none bg-transparent p-3 block outline-primary border-1 border-gray-300 w-full h-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm focus:border-none"
                                                                        onChange={
                                                                            handleTagInputChange
                                                                        }
                                                                        style={{
                                                                            backgroundColor:
                                                                                boardTag.color,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        id="column-heading"
                                                        className="mt-10 text-slate-600"
                                                    >
                                                        <h3>Columns</h3>
                                                    </div>

                                                    <div className="items-center justify-between mt-10 gap-3 w-full flex-wrap space-y-4">
                                                        {state.columnTitles.map(
                                                            (title, index) => (
                                                                <div
                                                                    key={index}
                                                                >
                                                                    <ColumnForm
                                                                        title={
                                                                            title
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="mt-6">
                                                        <div className="flex space-x-3 items-end text-sm group">
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-1  border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary drop-shadow"
                                                                onClick={
                                                                    handleAddColumn
                                                                }
                                                            >
                                                                <span className="sr-only">
                                                                    Add a Column
                                                                </span>
                                                                <MdOutlineAdd
                                                                    className="h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            </button>
                                                            <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                Add a Column
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-shrink-0 justify-end px-4 py-4">
                                            <button
                                                type="button"
                                                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                onClick={() =>
                                                    setShowBoardForm(false)
                                                }
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-primary-darker py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark-alt focus:outline-none transition-color duration-300"
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

export default BoardForm;
