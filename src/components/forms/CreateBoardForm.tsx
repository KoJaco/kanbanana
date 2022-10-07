import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useOnClickOutside } from '@/core/hooks/index';
import { useKanbanStore } from '@/stores/KanbanStore';
import { db } from '@/server/db';
import { stringToRandomSlug } from '@/core/utils/misc';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { MdClose, MdModeEdit, MdSort } from 'react-icons/md';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { BsChevronBarDown } from 'react-icons/bs';
import { TiDelete } from 'react-icons/ti';
import {
    Board,
    TContainer,
    Items,
    Containers,
    BoardTags,
    BoardTag,
    ContainerItemMapping,
    UniqueIdentifier,
} from '@/core/types/sortableBoard';
import { getMaxIdFromString } from '@/core/utils/kanbanBoard';
import ContainerForm from './ContainerForm';
import TagForm from './TagForm';
import Tag from '@/components/elements/Tag';
import clsx from 'clsx';

type CreateBoardFormProps = {
    showBoardForm: boolean;
    setShowBoardForm: (value: boolean) => void;
};

const defaultColor = { name: 'white', value: '#fff', textDark: true };

// Array of tags, can map over
const initialTags: BoardTags = [
    {
        id: 1,
        backgroundColor: defaultColor,
        text: '',
    },
];

// object of containers, map through using container order.
const initialContainers: Containers = {
    A: {
        id: 'A',
        title: '',
        type: 'simple',
        completedItemOrder: 'noChange',
        badgeColor: defaultColor,
    },
};

const initialContainerItemMapping: ContainerItemMapping = {
    A: ['A1'],
};

// container-1 should point to this, don't do anything further with this just save to db upon submit.
const initialItems: Items = {
    A1: {
        id: 'A1',
        badgeColor: defaultColor,
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
    // TODO: Need to fix edit container form, it updates all containers when saving. also, change the plus into a tick icon.
    // controlled inputs for form fields, everything we're editing
    const [boardTitle, setBoardTitle] = useState<string>('');
    // need separate form for editing a single tag
    const [boardTags, setBoardTags] = useState<BoardTags | null>(null);
    // need separate form for editing a single container
    const [boardContainers, setBoardContainers] = useState<Containers | null>(
        null
    );
    const [boardContainerItemMapping, setBoardContainerItemMapping] =
        useState<ContainerItemMapping | null>(null);

    // Form related state
    const [showTagForm, setShowTagForm] = useState<boolean>(false);
    const [showContainerForm, setShowContainerForm] = useState<boolean>(false);

    const [containerFormState, setContainerFormState] = useState<
        'add' | 'edit'
    >('add');
    const [currentContainerId, setCurrentContainerId] =
        useState<UniqueIdentifier>('A');

    const router = useRouter();

    console.log(boardContainers);

    const { increaseBoardCount } = useKanbanStore();

    function handleBoardTitleInputChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        setBoardTitle(event.currentTarget.value);
    }

    function handleAddContainer(container: TContainer) {
        if (boardContainers === null || boardContainerItemMapping === null) {
            // set the board container in containers object.
            setBoardContainers({ [container.id]: container });
            // set an empty item array to the container identifier.
            setBoardContainerItemMapping({ [container.id]: [] });
        } else {
            setBoardContainers({
                ...boardContainers,
                [container.id]: container,
            });
            setBoardContainerItemMapping({
                ...boardContainerItemMapping,
                [container.id]: [],
            });
        }
        setShowContainerForm(false);
    }

    function handleUpdateContainer(container: TContainer) {
        setBoardContainers({ ...boardContainers, [container.id]: container });
        setShowContainerForm(false);
        // switch form state back to add.
        setContainerFormState('add');
    }

    function handleRemoveContainer(containerId: UniqueIdentifier) {
        if (boardContainers !== null || boardContainerItemMapping !== null) {
            let newContainers = omit(boardContainers, containerId);
            let newContainerBoardMapping = omit(
                boardContainerItemMapping,
                containerId
            );

            setBoardContainers(newContainers);
            setBoardContainerItemMapping(newContainerBoardMapping);
        }
    }

    function handleEditContainer(containerId: UniqueIdentifier) {
        setCurrentContainerId(containerId);
        setContainerFormState('edit');
        if (showContainerForm) {
            setShowContainerForm(false);
            setTimeout(() => {
                setShowContainerForm(true);
            }, 100);
        } else {
            handleToggleContainerForm();
        }
    }

    function handleAddTag(tag: BoardTag) {
        if (boardTags === null) {
            setBoardTags([tag]);
        } else if (boardTags !== null) {
            let newTags = Array.from(boardTags);
            newTags.push(tag);
            setBoardTags(newTags);
        }
        setShowTagForm(false);
    }

    function handleRemoveTag(index: number) {
        if (boardTags !== null) {
            // id is simple the index + 1
            let newTags = Array.from(boardTags);
            newTags.splice(index, 1);
            setBoardTags(newTags);
        }
    }

    function handleToggleTagForm() {
        if (showContainerForm) {
            setShowContainerForm(false);
        }
        setShowTagForm((showTagForm) => !showTagForm);
    }

    function handleToggleContainerForm() {
        if (showTagForm) {
            setShowTagForm(false);
        }
        setShowContainerForm((showContainerForm) => !showContainerForm);
    }

    function handleCancelEdit() {
        // reset state if cancel was click, assume user wishes for their changes to NOT be saved in any way.
        resetState();
        // close slide over
        setShowBoardForm(false);
    }

    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        // insert an initial task in the first container, this is necessary so that auto creation of IDS works in our indexDB
        let slug = stringToRandomSlug(boardTitle);
        let tags = boardTags === null ? initialTags : boardTags;
        let containers =
            boardContainers === null ? initialContainers : boardContainers;
        let containerItemMapping =
            boardContainerItemMapping === null
                ? initialContainerItemMapping
                : boardContainerItemMapping;

        if (boardContainers !== null) {
            // If containers are non null
            Object.values(containerItemMapping)[0] = [
                `${Object.keys(containers)[0]}1`,
            ];
        }

        try {
            db.transaction('rw', db.boards, async () => {
                await db.addBoard(
                    boardTitle,
                    slug,
                    tags,
                    initialItems,
                    containers,
                    containerItemMapping
                );
            });
            increaseBoardCount();
            console.info(`A new board was created with title: ${boardTitle}`);
            router
                .push(`/boards/${slug}`, undefined, { shallow: false })
                .then(() => router.reload());
        } catch (error) {
            console.error(`Failed to add board`);
            // push to fail page
            router.push(`/`);
        }
    }

    function resetState() {
        // wait for transition to close, .5 sec timeout
        setTimeout(() => {
            setBoardTitle('');
            setBoardTags(null);
            setBoardContainers(null);
            setBoardContainerItemMapping(null);
            setContainerFormState('add');
        }, 500);
    }

    function getNextContainerId() {
        if (boardContainerItemMapping === null || boardContainers === null) {
            return 'A';
        }
        const containerIds = Object.keys(boardContainerItemMapping);
        const lastContainerId = containerIds[containerIds.length - 1];
        return String.fromCharCode(lastContainerId!.charCodeAt(0) + 1);
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
                                                                    className="block text-sm font-medium text-slate-600 after:content-['*'] after:ml-0.5 after:text-red-500"
                                                                >
                                                                    Board Title
                                                                </label>

                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="board-title"
                                                                        id="board-title"
                                                                        value={
                                                                            boardTitle
                                                                        }
                                                                        placeholder={
                                                                            boardTitle
                                                                                ? boardTitle
                                                                                : 'Give your board a title.'
                                                                        }
                                                                        className="peer p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                        required
                                                                        onChange={
                                                                            handleBoardTitleInputChange
                                                                        }
                                                                    />
                                                                    {/* <p className="invisible peer-invalid:visible text-red-400 font-regular text-sm ml-1">
                                                                        Title
                                                                        cannot
                                                                        be empty
                                                                    </p> */}
                                                                </div>
                                                            </div>
                                                            {/* small display for tag and container info */}
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
                                                                                                    .backgroundColor
                                                                                                    .textDark
                                                                                                    ? '#333'
                                                                                                    : '#fff',
                                                                                                backgroundColor:
                                                                                                    tag
                                                                                                        .backgroundColor
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
                                                                {/* containers */}
                                                                <div className="w-auto max-h-96 overflow-y-auto no-scrollbar">
                                                                    <label
                                                                        htmlFor="board-containers"
                                                                        className="block text-sm font-medium text-slate-600 "
                                                                    >
                                                                        Containers:
                                                                    </label>
                                                                    <div className="mt-1 gap-y-2 gap-x-2 my-4">
                                                                        {/* map through containers for display only*/}
                                                                        {boardContainerItemMapping !==
                                                                            null &&
                                                                            boardContainers !==
                                                                                null && (
                                                                                <>
                                                                                    {Object.keys(
                                                                                        boardContainerItemMapping
                                                                                    ).map(
                                                                                        (
                                                                                            containerId: UniqueIdentifier,
                                                                                            index: number
                                                                                        ) => {
                                                                                            const container =
                                                                                                boardContainers[
                                                                                                    containerId
                                                                                                ];
                                                                                            return container ==
                                                                                                undefined ||
                                                                                                container
                                                                                                    .title
                                                                                                    .length ===
                                                                                                    0 ? null : (
                                                                                                // Container display card
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
                                                                                                                container
                                                                                                                    .badgeColor
                                                                                                                    .value,
                                                                                                        }}
                                                                                                    >
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            className="opacity-0 group-hover:opacity-100 flex justify-end transition-opacity duration-300"
                                                                                                            style={{
                                                                                                                color: container
                                                                                                                    .badgeColor
                                                                                                                    .textDark
                                                                                                                    ? '#333'
                                                                                                                    : '#fff',
                                                                                                            }}
                                                                                                            onClick={() =>
                                                                                                                handleEditContainer(
                                                                                                                    container.id
                                                                                                                )
                                                                                                            }
                                                                                                        >
                                                                                                            <MdModeEdit className="w-5" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <div className="flex flex-col p-2 divide-x">
                                                                                                        <div className="flex gap-x-12 items-center text-slate-600">
                                                                                                            <div className="flex flex-col">
                                                                                                                <label className="text-sm font-medium">
                                                                                                                    Title
                                                                                                                </label>
                                                                                                                <div>
                                                                                                                    {
                                                                                                                        container.title
                                                                                                                    }
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div className="flex flex-col">
                                                                                                                <label className="text-sm font-medium">
                                                                                                                    Type
                                                                                                                </label>
                                                                                                                <div>
                                                                                                                    {
                                                                                                                        container.type
                                                                                                                    }
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            {container.type ===
                                                                                                                'checklist' && (
                                                                                                                <div className="flex flex-col">
                                                                                                                    <label className="text-sm font-medium">
                                                                                                                        Ordering
                                                                                                                    </label>
                                                                                                                    <div>
                                                                                                                        {
                                                                                                                            container.completedItemOrder
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
                                                                                                                handleRemoveContainer(
                                                                                                                    container.id
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
                                                                                </>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Board tag/container input*/}
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
                                                                        null
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
                                                                    handleToggleContainerForm
                                                                }
                                                            >
                                                                Add some
                                                                containers
                                                                <BsChevronBarDown
                                                                    className="-mr-1 ml-2 h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            </button>
                                                            <Transition
                                                                show={
                                                                    showContainerForm
                                                                }
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                {containerFormState ===
                                                                    'edit' &&
                                                                boardContainers !==
                                                                    null ? (
                                                                    <ContainerForm
                                                                        id={
                                                                            currentContainerId
                                                                        }
                                                                        container={
                                                                            boardContainers[
                                                                                currentContainerId
                                                                            ]
                                                                        }
                                                                        handleAddContainer={
                                                                            handleUpdateContainer
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ContainerForm
                                                                        id={getNextContainerId()}
                                                                        handleAddContainer={
                                                                            handleAddContainer
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
