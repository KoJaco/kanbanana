import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MdClose, MdOutlineAdd } from 'react-icons/md';
import {
    Board,
    TColumn,
    Columns,
    BoardTags,
    BoardTag,
} from '@/core/types/kanbanBoard';
import { useLiveQuery } from 'dexie-react-hooks';
import { ModifyError } from 'dexie';
import { db } from '@/server/db';
import { stringToRandomSlug } from '@/core/utils/misc';
import { getMaxIdFromString } from '@/core/utils/kanbanBoard';

import { useKanbanStore } from '@/stores/KanbanStore';

import ColumnForm from './ContainerForm';
import TagForm from './TagForm';
import router from 'next/router';

const initialBoardTag = {
    id: 1,
    color: '#fff',
    text: '',
};

type BoardFormProps = {
    boardSlug: string;
    columnId?: string;
    showBoardForm: boolean;
    setShowBoardForm: (value: boolean) => void;
};

const BoardForm = ({ setShowBoardForm, ...props }: BoardFormProps) => {
    // TODO: Finish this component with full data, should be able to add tags and columns here too.

    // controlled inputs for form fields, everything we're editing
    const [boardTitle, setBoardTitle] = useState<string>('');
    // need separate form for editing a single tag
    const [boardTags, setBoardTags] = useState<BoardTags>();
    // need separate form for editing a single column
    const [boardColumns, setBoardColumns] = useState<Columns>();
    const [showEditColumn, setShowEditColumn] = useState(false);

    const { setCurrentBoardSlug, columnCount, setColumnCount, setMaxColumnId } =
        useKanbanStore();

    const board: Board | undefined = useLiveQuery(
        // only want this to run once, then use local state to handle incremental updates.
        // cancel button should revert board to previous state.
        // submit should be our save all changes button.
        () => db.boards.get(props.boardSlug),
        [props.boardSlug]
    );

    const reportError = useCallback(({ message }: { message: string }) => {
        // send message to notification service.
    }, []);

    function handleBoardTitleInputChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        setBoardTitle(event.currentTarget.value);
    }

    useEffect(() => {
        if (board !== undefined) {
            setBoardTitle(board.title);
            setCurrentBoardSlug(board.slug);
            setBoardColumns(board.columns);
            setBoardTags(
                board.tags
                    ? board.tags
                    : [
                          {
                              id: 1,
                              text: '',
                              color: {
                                  name: 'transparent',
                                  value: '#00ffffff',
                                  textDark: true,
                              },
                          },
                      ]
            );
            setColumnCount(Object.keys(board.columns).length);
            setMaxColumnId(getMaxIdFromString(board.columns));
        }
    }, [
        board,
        setBoardTitle,
        setCurrentBoardSlug,
        setBoardColumns,
        setBoardTags,
        setColumnCount,
        setMaxColumnId,
        reportError,
    ]);

    function handleShowEditColumn() {}

    function handleAddColumn() {
        if (boardColumns !== undefined) {
            const newColumn: TColumn = {
                id: `column-${getMaxIdFromString(boardColumns)}`,
                title: '',
                type: 'simple',
                completedTaskOrder: 'noChange',
                badgeColor: {
                    name: 'transparent',
                    value: '#00ffffff',
                    textDark: true,
                },
                taskIds: [],
            };
            setBoardColumns({ ...boardColumns, newColumn });
        } else {
            throw new Error('Error trying to add a column.');
        }
    }

    function handleAddTag() {
        if (boardTags !== undefined) {
            const newTag: BoardTag = {
                id: boardTags.length + 1,
                text: '',
                color: {
                    name: 'transparent',
                    value: '#00ffffff',
                    textDark: true,
                },
            };
            setBoardTags([...boardTags, newTag]);
        } else {
            throw new Error('Error trying to add a tag.');
        }
    }

    function handleCancelEdit() {
        // reset state if cancel was click, assume user wishes for their changes to NOT be saved in any way.
        if (board !== undefined) {
            setBoardTitle(board.title);
            setCurrentBoardSlug(board.slug);
            setBoardColumns(board.columns);
            setBoardTags(
                board.tags
                    ? board.tags
                    : [
                          {
                              id: 1,
                              text: '',
                              color: {
                                  name: 'transparent',
                                  value: '#00ffffff',
                                  textDark: true,
                              },
                          },
                      ]
            );
            setColumnCount(Object.keys(board.columns).length);
            setMaxColumnId(getMaxIdFromString(board.columns));
        }
        // close slide over
        setShowBoardForm(false);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // remember to set the key from task options object
        db.transaction('rw', db.boards, async () => {
            // modify the board state, assert board slug is not undefined.
            await db.boards
                .where('slug')
                .equals(props.boardSlug)
                .modify((item: any) => {
                    item.title = boardTitle;
                    item.updatedAt = Date.now().toLocaleString();
                    item.tags = boardTags;
                    item.columns = boardColumns;
                    // must update the column order
                    item.columnOrder = [''];
                    item.slug = stringToRandomSlug(boardTitle);
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
                                                    <Dialog.Title className="text-lg font-medium text-slate-600">
                                                        {boardTitle}
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
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="px-2 sm:px-4">
                                                    <div className="space-y-4 pt-6 pb-5 px-1">
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
                                                    </div>
                                                    {/* Map through tags, on edit show tag form. */}

                                                    <div
                                                        id="tags"
                                                        className="items-center justify-between gap-3 w-full flex-wrap space-y-4 max-h-96 overflow-y-auto no-scrollbar pb-4 px-1"
                                                    >
                                                        {boardTags ? (
                                                            // if a user has inputted some tags already, map through them with inputs provided.
                                                            boardTags.map(
                                                                (
                                                                    tag,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="space-y-4"
                                                                    >
                                                                        <TagForm
                                                                            text={
                                                                                tag.text
                                                                            }
                                                                            color={
                                                                                tag.color
                                                                            }
                                                                        />
                                                                    </div>
                                                                )
                                                            )
                                                        ) : (
                                                            // if the user has not provided any tags (undefined), allow them to add some.
                                                            <div className="flex flex-row gap-3 justify-between space-y-4">
                                                                <TagForm
                                                                    text=""
                                                                    color={{
                                                                        name: 'transparent',
                                                                        value: '#00ffffff',
                                                                        textDark:
                                                                            true,
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mb-6">
                                                        <div className="flex space-x-3 items-end text-sm group">
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-1  border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary drop-shadow"
                                                                onClick={
                                                                    handleAddTag
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
                                                                Add a Tag
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Map through columns, on edit show column form. */}
                                                    <div
                                                        id="columns"
                                                        className="items-center justify-between gap-3 w-full flex-wrap max-h-[30rem] overflow-y-auto no-scrollbar mt-8 px-1"
                                                    >
                                                        {boardColumns &&
                                                            Object.values(
                                                                boardColumns
                                                            ).map(
                                                                (
                                                                    column: TColumn,
                                                                    index: number
                                                                ) => {
                                                                    return (
                                                                        // return column info with edit button
                                                                        <div
                                                                            className="mb-4 space-y-4 pb-4"
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <ColumnForm
                                                                                index={
                                                                                    index
                                                                                }
                                                                                column={
                                                                                    column
                                                                                }
                                                                            />
                                                                        </div>
                                                                        // return column form on edit.
                                                                    );
                                                                }
                                                            )}
                                                    </div>
                                                    <div className="my-6">
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
                                                onClick={handleCancelEdit}
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
