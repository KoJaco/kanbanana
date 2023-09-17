import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useKanbanStore } from '@/stores/KanbanStore';
import { db } from '@/server/db';
import { stringToRandomSlug } from '@/core/utils/misc';
import { Dialog, Transition } from '@headlessui/react';
import { MdClose, MdModeEdit, MdOutlineEdit, MdSort } from 'react-icons/md';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { BsChevronBarDown } from 'react-icons/bs';
import { TiDelete } from 'react-icons/ti';
import {
    TContainer,
    Items,
    Containers,
    BoardTags,
    BoardTag,
    ContainerItemMapping,
    ContainerOrder,
    UniqueIdentifier,
} from '@/core/types/sortableBoard';
import ContainerInputGroup from './inputs/ContainerInputGroup';
import TagInputGroup from './inputs/TagInputGroup';
import Tag from '@/components/elements/Tag';
import { useTheme } from 'next-themes';

type CreateBoardFormProps = {
    showBoardForm: boolean;
    setShowBoardForm: (value: boolean) => void;
};

const defaultColor = {
    name: 'transparent',
    value: '#FFFFFF00',
    textDark: true,
};
// Array of tags, can map over
const initialTags: BoardTags = [
    {
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

const initialContainerOrder: ContainerOrder = ['A'];

const initialContainerItemMapping: ContainerItemMapping = {
    A: ['1'],
};

// container-1 should point to this, don't do anything further with this just save to db upon submit.
const initialItems: Items = {
    '1': {
        id: '1',
        badgeColor: defaultColor,
        completed: false,
        content: '',
        updatedAt: new Date(Date.now()),
        createdAt: new Date(Date.now()),
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

    const [tagFormState, setTagFormState] = useState<'add' | 'edit'>('add');
    const [currentTagIndex, setCurrentTagIndex] = useState<number | null>(null);

    const { theme } = useTheme();

    const router = useRouter();

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
        if (boardContainers !== null && boardContainerItemMapping !== null) {
            let newContainers = omit(boardContainers, containerId);
            let newContainerBoardMapping = omit(
                boardContainerItemMapping,
                containerId
            );
            setBoardContainers(newContainers);
            setBoardContainerItemMapping(newContainerBoardMapping);
        }
        setShowContainerForm(false);
        setContainerFormState('add');
        setCurrentContainerId('A');
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

    function handleUpdateTag(
        boardTag: BoardTag,
        tagIndex: number | null | undefined
    ) {
        if (boardTags !== null && tagIndex !== null && tagIndex !== undefined) {
            let newTags = Array.from(boardTags);
            newTags[tagIndex] = boardTag;
            setBoardTags(newTags);
            setTagFormState('add');
        } else {
            console.log('Could not edit tag');
        }
        setShowTagForm(false);
    }

    function handleRemoveTag(index: number) {
        if (boardTags !== null) {
            // id is simple the index + 1
            let newTags = Array.from(boardTags);
            newTags.splice(index, 1);
            setBoardTags(newTags);
            setShowTagForm(false);
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
        event.preventDefault();
        // insert an initial task in the first container, this is necessary so that auto creation of IDS works in our indexDB
        let slug = stringToRandomSlug(boardTitle);
        let tags = boardTags === null ? [] : boardTags;
        let containers =
            boardContainers === null ? initialContainers : boardContainers;
        let containerOrder =
            boardContainerItemMapping === null
                ? initialContainerOrder
                : Object.keys(boardContainerItemMapping);

        let containerItemMapping =
            boardContainerItemMapping === null
                ? initialContainerItemMapping
                : boardContainerItemMapping;

        if (boardContainers && boardContainerItemMapping) {
            for (const [key, value] of Object.entries(containerItemMapping)) {
                containerItemMapping[key] = ['1'];
                break;
            }
        }

        try {
            db.transaction('rw', db.boards, async () => {
                await db.addBoard(
                    boardTitle,
                    slug,
                    tags,
                    initialItems,
                    containers,
                    containerOrder,
                    containerItemMapping
                );
            });
            increaseBoardCount();
            console.info(`A new board was created with title: ${boardTitle}`);
            router.push(`/boards/${slug}`, undefined, { shallow: false });
        } catch (error) {
            console.error(`Failed to add board`);
            // push to fail page
            router.push(`/`);
        }
        resetState();
        setShowBoardForm(false);
    }

    function resetState() {
        // wait for transition to close, .5 sec timeout
        setTimeout(() => {
            setBoardTitle('');
            setBoardTags(null);
            setBoardContainers(null);
            setBoardContainerItemMapping(null);
            setContainerFormState('add');
            setShowTagForm(false);
            setShowContainerForm(false);
            setTagFormState('add');
            setCurrentTagIndex(null);
        }, 500);
    }

    function getNextContainerId() {
        if (boardContainers === null || boardContainerItemMapping === null) {
            return 'A';
        }

        const containerIds = Object.keys(boardContainerItemMapping);

        if (containerIds.length === 0) {
            return 'A';
        }
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

    const transparentTextColor = (colorName: string, textDark: boolean) => {
        if (colorName === 'transparent' && theme === 'light') {
            return 'rgba(0,0,0,1)';
        } else if (colorName === 'transparent' && theme === 'dark') {
            return 'rgba(255,255,255,1)';
        }
        if (textDark) {
            return '#333';
        } else {
            return '#fff';
        }
    };

    return (
        <Transition.Root show={props.showBoardForm} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-[160]"
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
                    <div className="fixed inset-0 bg-gray-500 dark:bg-slate-500/50 bg-opacity-75 transition-opacity" />
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
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-sm sm:max-w-md">
                                    <form
                                        className="flex h-full flex-col divide-y divide-gray-200 dark:divide-slate-500 bg-white dark:bg-slate-800 shadow-xl"
                                        onSubmit={handleSubmit}
                                    >
                                        <div className="h-0 flex-1 overflow-y-auto no-scrollbar">
                                            {/* HEADER SECTION */}
                                            <div className="bg-offset-bg py-6 px-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <Dialog.Title className="text-lg font-medium text-slate-800">
                                                        Create a new Board
                                                    </Dialog.Title>

                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md transparent text-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white transition-translate duration-300"
                                                            onClick={() =>
                                                                setShowBoardForm(
                                                                    false
                                                                )
                                                            }
                                                            aria-label="Close Panel"
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
                                                    <p className="text-sm text-slate-700">
                                                        Fill out the information
                                                        below and do not forget
                                                        to save!
                                                    </p>
                                                </div>
                                            </div>
                                            <div className=" mt-4 space-y-4 sm:mt-10">
                                                <div className="flex flex-1 flex-col justify-between border-b border-gray-100 dark:border-slate-600">
                                                    <div className="px-2 sm:px-4">
                                                        <div className="space-y-4 pt-6 pb-5 px-1">
                                                            <div>
                                                                <label
                                                                    htmlFor="boardTitle"
                                                                    className="block text-sm font-medium text-slate-600 after:content-['*'] after:ml-0.5 after:text-red-500 dark:text-slate-100"
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
                                                                        className="peer p-2 block outline-primary border-1 border-gray-300 w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-900 dark:border-slate-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-slate-800 dark:focus:border-slate-500 text-sm sm:text-md invalid:border-pink-300 dark:invalid:border-pink-500/50"
                                                                        required
                                                                        onChange={
                                                                            handleBoardTitleInputChange
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            {/* small display for tag and container info */}
                                                            <div className="flex flex-col w-full space-y-4 overflow-x-auto no-scrollbar">
                                                                {/* tags */}
                                                                <div className="flex flex-col max-h-16 ">
                                                                    <label
                                                                        htmlFor="boardTags"
                                                                        className="block text-sm font-medium text-slate-600 dark:text-slate-100"
                                                                    >
                                                                        Tags:
                                                                    </label>
                                                                    {/* tags map for display only */}
                                                                    <div
                                                                        id="boardTags"
                                                                        className="flex flex-wrap gap-x-2 gap-y-2 mt-1"
                                                                    >
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
                                                                                        <Tag
                                                                                            text={
                                                                                                tag.text
                                                                                            }
                                                                                            backgroundColor={
                                                                                                tag.backgroundColor
                                                                                            }
                                                                                        />

                                                                                        <div className="flex scale-0 w-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:w-auto transition-transform duration-300">
                                                                                            <button
                                                                                                type="button"
                                                                                                name="editTag"
                                                                                                className=" hover:scale-110 focus-visible:opacity-100"
                                                                                                onClick={() => {
                                                                                                    if (
                                                                                                        showTagForm
                                                                                                    ) {
                                                                                                        setCurrentTagIndex(
                                                                                                            index
                                                                                                        );
                                                                                                        setTagFormState(
                                                                                                            'edit'
                                                                                                        );
                                                                                                        setShowTagForm(
                                                                                                            false
                                                                                                        );
                                                                                                    } else {
                                                                                                        setCurrentTagIndex(
                                                                                                            index
                                                                                                        );
                                                                                                        setTagFormState(
                                                                                                            'edit'
                                                                                                        );
                                                                                                    }
                                                                                                    setTimeout(
                                                                                                        () =>
                                                                                                            setShowTagForm(
                                                                                                                true
                                                                                                            ),
                                                                                                        100
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <span className="sr-only">
                                                                                                    Edit
                                                                                                    Tag
                                                                                                </span>
                                                                                                <MdOutlineEdit className="text-slate-600 dark:text-slate-200" />
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                name="deleteTag"
                                                                                                className="hover:scale-110 focus-visible:opacity-100"
                                                                                                onClick={() =>
                                                                                                    handleRemoveTag(
                                                                                                        index
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <span className="sr-only">
                                                                                                    Delete
                                                                                                    Tag
                                                                                                </span>
                                                                                                <TiDelete className="text-slate-600 dark:text-slate-200" />
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
                                                                        className="block text-sm font-medium text-slate-600 dark:text-slate-100"
                                                                    >
                                                                        Columns:
                                                                    </label>
                                                                    <div
                                                                        id="board-containers"
                                                                        className="grid grid-cols-1 lg:grid-cols-2 mt-1 gap-y-2 gap-x-2 my-4"
                                                                    >
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
                                                                                                    className="grid-rows-auto group rounded-md drop-shadow my-2 text-md relative bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-800 px-2 py-2"
                                                                                                >
                                                                                                    <div className="flex flex-col text-slate-600 mb-1 ">
                                                                                                        <div className="flex mb-2">
                                                                                                            <div
                                                                                                                className={`flex mr-auto w-5 h-5 rounded-lg ${
                                                                                                                    container
                                                                                                                        .badgeColor
                                                                                                                        .name ===
                                                                                                                        'transparent' &&
                                                                                                                    'border-1 border-slate-500/75'
                                                                                                                }`}
                                                                                                                style={{
                                                                                                                    backgroundColor:
                                                                                                                        container
                                                                                                                            .badgeColor
                                                                                                                            .value,
                                                                                                                }}
                                                                                                            />
                                                                                                            <div className="flex items-center mb-auto">
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    name="editColumn"
                                                                                                                    className="opacity-0 group-hover:opacity-100 flex justify-end transition-opacity duration-300 hover:scale-110"
                                                                                                                    style={{
                                                                                                                        color: transparentTextColor(
                                                                                                                            container
                                                                                                                                .badgeColor
                                                                                                                                .name,
                                                                                                                            container
                                                                                                                                .badgeColor
                                                                                                                                .textDark
                                                                                                                        ),
                                                                                                                    }}
                                                                                                                    onClick={() =>
                                                                                                                        handleEditContainer(
                                                                                                                            container.id
                                                                                                                        )
                                                                                                                    }
                                                                                                                >
                                                                                                                    <span className="sr-only">
                                                                                                                        Edit
                                                                                                                        Column
                                                                                                                    </span>
                                                                                                                    <MdModeEdit className="text-slate-600 w-4 dark:text-slate-100" />
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    name="deleteColumn"
                                                                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                                                                                                                    onClick={() =>
                                                                                                                        handleRemoveContainer(
                                                                                                                            container.id
                                                                                                                        )
                                                                                                                    }
                                                                                                                >
                                                                                                                    <span className="sr-only">
                                                                                                                        Delete
                                                                                                                        Column
                                                                                                                    </span>
                                                                                                                    <TiDelete className="text-slate-600 w-5 h-5 dark:text-slate-100" />
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className="flex flex-row items-center justify-start gap-x-4 sm:gap-x-6">
                                                                                                            <div
                                                                                                                className="flex flex-col"
                                                                                                                style={{
                                                                                                                    color: transparentTextColor(
                                                                                                                        container
                                                                                                                            .badgeColor
                                                                                                                            .name,
                                                                                                                        container
                                                                                                                            .badgeColor
                                                                                                                            .textDark
                                                                                                                    ),
                                                                                                                }}
                                                                                                            >
                                                                                                                <label
                                                                                                                    className="text-sm font-bold text-slate-600 dark:text-slate-100"
                                                                                                                    htmlFor="container-title"
                                                                                                                >
                                                                                                                    Title
                                                                                                                </label>
                                                                                                                <div
                                                                                                                    id="container-title"
                                                                                                                    className="text-light text-sm text-slate-500 dark:text-slate-100/75"
                                                                                                                >
                                                                                                                    {
                                                                                                                        container.title
                                                                                                                    }
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div
                                                                                                                className="flex flex-col text-sm"
                                                                                                                style={{
                                                                                                                    color: transparentTextColor(
                                                                                                                        container
                                                                                                                            .badgeColor
                                                                                                                            .name,
                                                                                                                        container
                                                                                                                            .badgeColor
                                                                                                                            .textDark
                                                                                                                    ),
                                                                                                                }}
                                                                                                            >
                                                                                                                <label
                                                                                                                    htmlFor="container-type"
                                                                                                                    className="text-sm font-bold text-slate-600 dark:text-slate-100"
                                                                                                                >
                                                                                                                    Type
                                                                                                                </label>
                                                                                                                <div
                                                                                                                    id="container-type"
                                                                                                                    className="text-light text-slate-500 dark:text-slate-100/75"
                                                                                                                >
                                                                                                                    {
                                                                                                                        container.type
                                                                                                                    }
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            {container.type ===
                                                                                                                'checklist' && (
                                                                                                                <div
                                                                                                                    className="flex flex-col"
                                                                                                                    style={{
                                                                                                                        color: transparentTextColor(
                                                                                                                            container
                                                                                                                                .badgeColor
                                                                                                                                .name,
                                                                                                                            container
                                                                                                                                .badgeColor
                                                                                                                                .textDark
                                                                                                                        ),
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <label
                                                                                                                        htmlFor="container-ordering"
                                                                                                                        className="text-sm font-bold text-slate-600 dark:text-slate-100"
                                                                                                                    >
                                                                                                                        Ordering
                                                                                                                    </label>
                                                                                                                    <div
                                                                                                                        id="container-ordering"
                                                                                                                        className="text-light text-sm text-slate-500 dark:text-slate-100/75"
                                                                                                                    >
                                                                                                                        {
                                                                                                                            container.completedItemOrder
                                                                                                                        }
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
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
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="px-2 sm:px-4">
                                                        <div className="space-y-2 px-1">
                                                            <div className="relative inline-block w-full"></div>
                                                            <button
                                                                type="button"
                                                                className="inline-flex w-full justify-end rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:shadow-sm hover:bg-gray-50 focus:outline-none mb-4 dark:text-slate-100 dark:hover:bg-slate-700"
                                                                onClick={() => {
                                                                    if (
                                                                        tagFormState ===
                                                                        'edit'
                                                                    ) {
                                                                        setTagFormState(
                                                                            'add'
                                                                        );
                                                                        setCurrentTagIndex(
                                                                            null
                                                                        );
                                                                        setShowTagForm(
                                                                            !showTagForm
                                                                        );
                                                                    } else {
                                                                        handleToggleTagForm();
                                                                    }
                                                                }}
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
                                                                {tagFormState ===
                                                                'add' ? (
                                                                    <TagInputGroup
                                                                        labels={
                                                                            true
                                                                        }
                                                                        tagIndex={
                                                                            null
                                                                        }
                                                                        handleAddOrUpdateTag={
                                                                            handleAddTag
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <TagInputGroup
                                                                        labels={
                                                                            true
                                                                        }
                                                                        tagIndex={
                                                                            currentTagIndex
                                                                        }
                                                                        tag={
                                                                            boardTags !==
                                                                                null &&
                                                                            currentTagIndex !==
                                                                                null
                                                                                ? boardTags[
                                                                                      currentTagIndex
                                                                                  ]
                                                                                : undefined
                                                                        }
                                                                        addOrEdit="edit"
                                                                        handleAddOrUpdateTag={
                                                                            handleUpdateTag
                                                                        }
                                                                    />
                                                                )}
                                                            </Transition>
                                                        </div>
                                                    </div>
                                                    <div className="px-2 sm:px-4">
                                                        <div className="space-y-2 pt-6 pb-5 px-1">
                                                            <div className="relative inline-block w-full"></div>

                                                            <button
                                                                type="button"
                                                                className="inline-flex w-full justify-end rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:shadow-sm hover:bg-gray-50 focus:outline-none mb-4 dark:text-slate-100 dark:hover:bg-slate-700"
                                                                onClick={() => {
                                                                    if (
                                                                        containerFormState ===
                                                                        'edit'
                                                                    ) {
                                                                        setContainerFormState(
                                                                            'add'
                                                                        );
                                                                        setCurrentContainerId(
                                                                            'A'
                                                                        );
                                                                        setShowContainerForm(
                                                                            !showContainerForm
                                                                        );
                                                                    } else {
                                                                        handleToggleContainerForm();
                                                                    }
                                                                }}
                                                            >
                                                                Add some columns
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
                                                                boardContainers ? (
                                                                    <ContainerInputGroup
                                                                        id={
                                                                            currentContainerId
                                                                        }
                                                                        container={
                                                                            boardContainers[
                                                                                currentContainerId
                                                                            ]
                                                                        }
                                                                        handleAddOrUpdateContainer={
                                                                            handleUpdateContainer
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ContainerInputGroup
                                                                        id={getNextContainerId()}
                                                                        handleAddOrUpdateContainer={
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
                                        <div className="flex flex-shrink-0 justify-end items-end px-4 py-4">
                                            <button
                                                type="button"
                                                className="mr-auto rounded-md border border-gray-300 dark:border-slate-500 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                onClick={handleCancelEdit}
                                            >
                                                Cancel
                                            </button>
                                            <div className="flex flex-row items-end group">
                                                {boardTitle.length < 1 && (
                                                    <span className="flex  opacity-0 italic group-hover:opacity-100 text-sm text-slate-500 dark:text-slate-100/50 transition-opacity duration-300">
                                                        Add a board title to
                                                        save
                                                    </span>
                                                )}
                                                <button
                                                    type="submit"
                                                    className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-primary-darker py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary focus:outline-none transition-color duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                    disabled={
                                                        boardTitle.length < 1
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    Save Board
                                                </button>
                                            </div>
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
