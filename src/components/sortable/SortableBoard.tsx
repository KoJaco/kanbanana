import React, {
    createRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineEdit } from 'react-icons/md';
import {
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi';
import {
    CancelDrop,
    closestCenter,
    pointerWithin,
    rectIntersection,
    CollisionDetection,
    DndContext,
    DragOverlay,
    DropAnimation,
    getFirstCollision,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    Modifiers,
    UniqueIdentifier,
    useSensors,
    useSensor,
    MeasuringStrategy,
    KeyboardCoordinateGetter,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    AnimateLayoutChanges,
    SortableContext,
    useSortable,
    arrayMove,
    defaultAnimateLayoutChanges,
    verticalListSortingStrategy,
    SortingStrategy,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { coordinateGetter as multipleContainersCoordinateGetter } from '@/core/utils/keyboardCoordinates';

import { useLiveQuery } from 'dexie-react-hooks';
import Dexie, { ModifyError } from 'dexie';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';

import { Container, ContainerProps } from './container';
import { Item } from './item';
import Tag from '@/components/elements/Tag';

import InlineBoardForm from '@/components/forms/InlineBoardForm';
import AnimateItemReorder from './AnimateItemReorder';
import ItemAnimationWrapper from '@/components/sortable/item/ItemAnimationWrapper';

import { blankBoard } from '@/core/consts/blankBoard';
import { getMaxIdFromObjectKeyStrings } from '@/core/utils/sortableBoard';
import type {
    ContainerItemMapping,
    Containers,
    TContainer,
    Board,
    TItem,
    Items,
    BoardTags,
} from '@/core/types/sortableBoard';

const initialTags: BoardTags = [
    {
        backgroundColor: { name: 'white', value: '#fff', textDark: true },
        text: '',
    },
];

const dropAnimation: DropAnimation = {
    // custom drop animation
    duration: 300,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

const scrollButtons = [
    // scroll button for mapping
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
        throw new Error('Something went wrong while scrolling!');
    }
};

var omit = require('object.omit');
const PLACEHOLDER_ID = 'placeholder';
const empty: UniqueIdentifier[] | undefined = [];

interface SortableBoardProps {
    slug: string;
    adjustScale?: boolean;
    cancelDrop?: CancelDrop;
    columns?: number;
    containerStyle?: React.CSSProperties;
    coordinateGetter?: KeyboardCoordinateGetter;
    getItemStyles?(args: {
        value: UniqueIdentifier;
        index: number;
        overIndex: number;
        isDragging: boolean;
        containerId: UniqueIdentifier;
        isSorting: boolean;
        isDragOverlay: boolean;
    }): React.CSSProperties;
    wrapperStyle?(args: { index: number }): React.CSSProperties;
    totalItemCount?: number;
    items?: ContainerItemMapping;
    handle?: boolean;
    renderItem?: any;
    strategy?: SortingStrategy;
    modifiers?: Modifiers;
    minimal?: boolean;
    trashable?: boolean;
    scrollable?: boolean;
    vertical?: boolean;
}

export default function SortableBoard({
    slug,
    adjustScale = false,
    cancelDrop,
    columns,
    handle = false,
    coordinateGetter = multipleContainersCoordinateGetter,
    getItemStyles = () => ({}),
    wrapperStyle = () => ({}),
    minimal = false,
    modifiers,
    renderItem,
    strategy = verticalListSortingStrategy,
    vertical = false,
    scrollable = true,
}: SortableBoardProps) {
    // local state
    const [items, setItems] = useState<ContainerItemMapping>(
        blankBoard.containerItemMapping
    );
    const [containers, setContainers] = useState(
        Object.keys(items) as UniqueIdentifier[]
    );
    const [showInlineBoardForm, setShowInlineBoardForm] = useState(false);

    // Zustand global store vars
    const {
        totalItemCount,
        setTotalItemCount,
        currentBoardSlug,
        setCurrentBoardSlug,
        setMaxItemId,
        enableAnimation,
    } = useKanbanStore();

    // useLiveQuery() for indexDB state management, watch for changes in local board state.
    const board: Board | undefined = useLiveQuery(
        () => db.boards.get(slug),
        [totalItemCount, slug]
    );

    // referential vars, keep track of drag and drop and item state
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);
    const itemsReorderedExternally = useRef(false);
    const isSortingContainer = activeId ? containers.includes(activeId) : false;

    useEffect(() => {
        // initially grab boards from indexDB and set items, keep track of board changes.
        if (board !== undefined) {
            setItems(board.containerItemMapping);
            setContainers(board.containerOrder);
            setCurrentBoardSlug(slug);
            setMaxItemId(
                getMaxIdFromObjectKeyStrings(Object.keys(board.items))
            );
            setShowInlineBoardForm(false);
        }
    }, [
        board,
        setItems,
        setContainers,
        setCurrentBoardSlug,
        slug,
        setMaxItemId,
        setShowInlineBoardForm,
    ]);

    useEffect(() => {
        requestAnimationFrame(() => {
            // reset refs on item changes, onDragOver will init this.
            recentlyMovedToNewContainer.current = false;
            itemsReorderedExternally.current = false;
        });
    }, [items]);

    /**
     * Custom collision detection strategy optimized for multiple containers
     *
     * - First, find any droppable containers intersecting with the pointer.
     * - If there are none, find intersecting containers with the active draggable.
     * - If there are no intersecting containers, return the last matched intersection
     *
     */

    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            if (activeId && activeId in items) {
                return closestCenter({
                    ...args,
                    droppableContainers: args.droppableContainers.filter(
                        (container) => container.id in items
                    ),
                });
            }

            // Start by finding any intersecting droppable
            const pointerIntersections = pointerWithin(args);
            const intersections =
                pointerIntersections.length > 0
                    ? // If there are droppables intersecting with the pointer, return those
                      pointerIntersections
                    : rectIntersection(args);

            let overId = getFirstCollision(intersections, 'id');

            if (overId !== null) {
                if (overId in items) {
                    const containerItems = items[overId];

                    if (containerItems && containerItems.length > 0) {
                        overId = closestCenter({
                            ...args,
                            droppableContainers:
                                args.droppableContainers.filter(
                                    (container) =>
                                        container.id !== overId &&
                                        containerItems.includes(container.id)
                                ),
                        })[0]!.id;
                    }
                }

                lastOverId.current = overId;
                if (activeId && itemsReorderedExternally.current) {
                    // if items were just reordered by out checklist effect,
                    return [{ id: activeId }];
                }

                return [{ id: overId }];
            }

            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (
                recentlyMovedToNewContainer.current ||
                itemsReorderedExternally.current
            ) {
                lastOverId.current = activeId;
            }

            // when draggable items are re-ordered with a layout animation, do the same as above

            // If no droppable is matched, return the last match
            return lastOverId.current ? [{ id: lastOverId.current }] : [];
        },
        [activeId, items]
    );

    const [clonedItems, setClonedItems] = useState<ContainerItemMapping | null>(
        null
    );

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter,
        })
    );

    const findContainer = (id: UniqueIdentifier) => {
        if (id in items) {
            return id;
        }
        return Object.keys(items).find((key) => items[key]!.includes(id));
    };

    const getIndex = (id: UniqueIdentifier) => {
        const container = findContainer(id);
        if (!container) {
            return -1;
        }
        const index = items[container]!.indexOf(id);
        return index;
    };

    const onDragCancel = () => {
        if (clonedItems) {
            // Reset items to their original state in case items have been
            // Dragged across containers
            setItems(clonedItems);
        }
        setActiveId(null);
        setClonedItems(null);
    };

    if (!items || !board) return null;

    return (
        <div className="h-full w-full overflow-y-auto">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always,
                    },
                }}
                onDragStart={({ active }) => {
                    setActiveId(active.id);
                    setClonedItems(items);
                }}
                onDragOver={({ active, over }) => {
                    let overId: UniqueIdentifier;

                    if (over === null || over.id === PLACEHOLDER_ID) {
                        return;
                    }

                    if (active.id in items) {
                        // moving containers
                        setContainers((containers) => {
                            const activeIndex = containers.indexOf(active.id);
                            const overIndex = containers.indexOf(over.id);
                            return arrayMove(
                                containers,
                                activeIndex,
                                overIndex
                            );
                        });
                        return;
                    }
                    if (itemsReorderedExternally.current) {
                        // if we have just reordered items via the item checked (completed) functionality, overId must equal the active id.
                        overId = active.id;
                    } else {
                        overId = over.id;
                    }

                    const overContainer = findContainer(overId);
                    const activeContainer = findContainer(active.id);

                    if (!overContainer || !activeContainer) {
                        return;
                    }

                    if (!items[activeContainer] || !items[overContainer]) {
                        return;
                    }

                    if (activeContainer !== overContainer) {
                        // if we drag an item to a different container
                        setItems((items) => {
                            if (!items) {
                                throw new Error('Items were undefined');
                            }
                            const activeItems = items[activeContainer]!;
                            const overItems = items[overContainer]!;
                            const overIndex = overItems.indexOf(overId);
                            const activeIndex = activeItems.indexOf(active.id);

                            let newIndex: number;

                            if (overId in items) {
                                newIndex = overItems.length + 1;
                            } else {
                                const isBelowOverItem =
                                    over &&
                                    active.rect.current.translated &&
                                    active.rect.current.translated.top >
                                        over.rect.top + over.rect.height;

                                const modifier = isBelowOverItem ? 1 : 0;

                                newIndex =
                                    overIndex >= 0
                                        ? overIndex + modifier
                                        : overItems.length + 1;
                            }

                            recentlyMovedToNewContainer.current = true;

                            const newActiveContainer: UniqueIdentifier[] =
                                items[activeContainer]!.filter(
                                    (item) => item !== active.id
                                );
                            const newOverContainer: UniqueIdentifier[] = [
                                ...items[overContainer]!.slice(0, newIndex),
                                items[activeContainer]![activeIndex]! &&
                                    items[activeContainer]![activeIndex]!,
                                ...items[overContainer]!.slice(
                                    newIndex,
                                    items[overContainer]!.length
                                ),
                            ];

                            return {
                                ...items,
                                [activeContainer]: newActiveContainer,
                                [overContainer]: newOverContainer,
                            };
                        });
                    } else if (activeContainer === overContainer) {
                        setItems((items) => {
                            if (!items) {
                                throw new Error('Items were undefined');
                            }

                            const activeIndex = items[activeContainer]!.indexOf(
                                active.id
                            );
                            const overIndex: number =
                                items[overContainer]!.indexOf(overId);

                            const newOverContainer = arrayMove(
                                items[overContainer]!,
                                activeIndex,
                                overIndex
                            );
                            const newItems = {
                                ...items,
                                [overContainer]: newOverContainer,
                            };

                            return newItems;
                        });
                    }
                }}
                onDragEnd={({ active, over }) => {
                    if (!items) {
                        setActiveId(null);
                        return;
                    }

                    const activeContainer = findContainer(active.id);

                    if (!activeContainer || !items[activeContainer]) {
                        // error messaging service
                        setActiveId(null);
                        return;
                    }

                    let overId: UniqueIdentifier;

                    if (over === null || over.id === null) {
                        setActiveId(null);
                        return;
                    }

                    overId = over.id;

                    if (overId === PLACEHOLDER_ID) {
                        // when drop target is placeholder, we want to create a new container and move that item into this container.
                        const newContainerId = getNextContainerId();

                        // new empty container object
                        let defaultEmptyContainer: TContainer = {
                            id: newContainerId,
                            title: '',
                            badgeColor: {
                                name: 'transparent',
                                value: '#FFFFFF00',
                                textDark: true,
                            },
                            type: 'simple',
                            completedItemOrder: 'noChange',
                        };
                        const newActiveContainer: UniqueIdentifier[] = items[
                            activeContainer
                        ]!.filter((id) => id !== activeId);

                        const newContainer = [active.id];
                        const newContainerOrder = [
                            ...containers,
                            newContainerId,
                        ];
                        const newItems = {
                            ...items,
                            [activeContainer]: newActiveContainer,
                            [newContainerId]: newContainer,
                        };

                        db.transaction('rw', db.boards, async () => {
                            await db.boards
                                .where('slug')
                                .equals(currentBoardSlug)
                                .modify((boardItem: any) => {
                                    boardItem.containerItemMapping = newItems;
                                    boardItem.containerOrder =
                                        newContainerOrder;
                                    boardItem.containers[newContainerId] =
                                        defaultEmptyContainer;
                                }) // Catch modification error and generic error.
                                .catch('ModifyError', (e: ModifyError) => {
                                    // Failed with ModifyError, check e.failures.
                                    console.error(
                                        'ModifyError occurred: ' +
                                            e.failures.length +
                                            ' failures. Failed to add new container.'
                                    );
                                })
                                .catch((e: Error) => {
                                    console.error(
                                        'Uh oh! Something went wrong: ' + e
                                    );
                                });
                        });
                        setActiveId(null);
                        return;
                    }

                    db.boards
                        .update(currentBoardSlug, {
                            containerItemMapping: items,
                            containerOrder: containers,
                        })
                        .then(function (updated) {
                            if (updated) {
                                console.info(
                                    `Board ${currentBoardSlug}'s container item mapping and containers objects were updated on drag end.`
                                );
                            } else {
                                console.info(
                                    `Nothing was updated, board with slug: ${currentBoardSlug} does not exist.`
                                );
                            }
                        });
                    setActiveId(null);
                }}
                cancelDrop={cancelDrop}
                onDragCancel={onDragCancel}
                modifiers={modifiers}
            >
                <div className="my-8 ml-4 mx-4 sm:mx-10 md:mx-8 lg:mx-6">
                    {showInlineBoardForm ? (
                        <div id="boardFormContainer" className="relative z-50">
                            <InlineBoardForm
                                title={board.title}
                                slug={currentBoardSlug}
                                tags={board.tags ? board.tags : initialTags}
                                setShowForm={setShowInlineBoardForm}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-end gap-8">
                                <h1 className="sm:text-xl lg:text-2xl font-semibold text-slate-600 dark:text-white">
                                    {board?.title.length === 0
                                        ? 'Add a Board Title...'
                                        : board?.title}
                                </h1>

                                <button
                                    type="button"
                                    className="items-center text-slate-500 p-2 rounded-full hover:bg-light-gray hover:scale-110 dark:hover:bg-slate-700 cursor-pointer transition-color duration-300 dark:text-white"
                                    onClick={() => setShowInlineBoardForm(true)}
                                >
                                    <MdOutlineEdit className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                            </div>
                            <div className="flex flex-row items-end gap-8">
                                <div
                                    id="tags"
                                    className="inline-flex mt-auto mb-2 gap-x-2"
                                >
                                    {board?.tags?.map((tag, index) => (
                                        <div className="flex" key={index}>
                                            <Tag
                                                text={tag.text}
                                                backgroundColor={
                                                    tag.backgroundColor
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex ml-auto">
                                    <p className="text-sm font-light p-2 text-slate-600 dark:text-white">
                                        {board?.updatedAt.toLocaleString(
                                            'en-uk',
                                            {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div
                    id="carousel"
                    className="pb-10 mt-8 mx-4 sm:mx-10 md:mx-8 lg:mx-6 no-scrollbar h-auto overflow-x-scroll snap-x whitespace-nowrap scroll-smooth touch-pan-auto overscroll-x-none transition-all duration-500 "
                >
                    <div
                        className="inline-grid grid-auto-cols auto-cols-max relative z-40"
                        style={{
                            gridAutoFlow: vertical ? 'row' : 'column',
                        }}
                    >
                        <SortableContext
                            items={[...containers, PLACEHOLDER_ID]}
                            strategy={
                                vertical
                                    ? verticalListSortingStrategy
                                    : horizontalListSortingStrategy
                            }
                        >
                            {containers.map((containerId) => {
                                const container =
                                    board?.containers[containerId];

                                return (
                                    <div key={containerId}>
                                        <DroppableContainer
                                            key={containerId}
                                            id={containerId}
                                            container={container}
                                            itemCount={
                                                items[containerId] ===
                                                    undefined ||
                                                items[containerId]?.length === 0
                                                    ? 0
                                                    : items[containerId]!.length
                                            }
                                            label={
                                                container === undefined ||
                                                container.title.length === 0
                                                    ? 'Add a title'
                                                    : container.title
                                            }
                                            columns={columns}
                                            items={items[containerId]!}
                                            scrollable={scrollable}
                                            unstyled={minimal}
                                            onRemove={() =>
                                                handleRemoveContainer(
                                                    containerId
                                                )
                                            }
                                        >
                                            {items[containerId] && (
                                                <SortableContext
                                                    items={items[containerId]!}
                                                    strategy={strategy}
                                                >
                                                    <AnimateItemReorder
                                                        animationEnabled={
                                                            enableAnimation
                                                        }
                                                    >
                                                        {items[
                                                            containerId
                                                        ]!.map(
                                                            (itemId, index) => {
                                                                const item =
                                                                    board
                                                                        ?.items[
                                                                        itemId
                                                                    ];

                                                                return (
                                                                    <ItemAnimationWrapper
                                                                        key={
                                                                            itemId
                                                                        }
                                                                        wrapperId={
                                                                            itemId
                                                                        }
                                                                        ref={createRef()}
                                                                    >
                                                                        <SortableItem
                                                                            itemsReorderedExternally={
                                                                                itemsReorderedExternally
                                                                            }
                                                                            item={
                                                                                item
                                                                            }
                                                                            disabled={
                                                                                isSortingContainer
                                                                            }
                                                                            id={
                                                                                itemId
                                                                            }
                                                                            index={
                                                                                index
                                                                            }
                                                                            handle={
                                                                                handle
                                                                            }
                                                                            style={
                                                                                getItemStyles
                                                                            }
                                                                            wrapperStyle={
                                                                                wrapperStyle
                                                                            }
                                                                            renderItem={
                                                                                renderItem
                                                                            }
                                                                            containerId={
                                                                                containerId
                                                                            }
                                                                            container={
                                                                                container
                                                                            }
                                                                            getIndex={
                                                                                getIndex
                                                                            }
                                                                        />
                                                                    </ItemAnimationWrapper>
                                                                );
                                                            }
                                                        )}
                                                    </AnimateItemReorder>
                                                </SortableContext>
                                            )}
                                        </DroppableContainer>
                                    </div>
                                );
                            })}
                            {minimal ? undefined : (
                                <DroppableContainer
                                    id={PLACEHOLDER_ID}
                                    disabled={isSortingContainer}
                                    items={empty}
                                    itemCount={0}
                                    onClick={handleAddContainer}
                                    placeholder
                                >
                                    <button
                                        className="flex items-center justify-center h-full opacity-50"
                                        onClick={() => handleAddContainer}
                                    >
                                        + Add column
                                    </button>
                                </DroppableContainer>
                            )}
                        </SortableContext>
                    </div>
                    {createPortal(
                        <DragOverlay
                            adjustScale={adjustScale}
                            dropAnimation={dropAnimation}
                        >
                            {activeId
                                ? containers.includes(activeId)
                                    ? renderContainerDragOverlay(
                                          activeId,
                                          board?.containers[activeId]
                                      )
                                    : renderSortableItemDragOverlay(activeId)
                                : null}
                        </DragOverlay>,
                        document.body
                    )}
                </div>
                <div className="md:my-8 md:mr-6 px-6 md:px-8 text-slate-600 space-x-2 w-fit bg-white dark:bg-slate-800 rounded-full drop-shadow-lg dark:border dark:border-slate-600 fixed bottom-4 right-4 z-[120]">
                    {scrollButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => scroller(button.direction)}
                            className="bg-transparent disabled:text-gray-500/[0.5] disabled:cursor-not-allowed w-7 h-7 text-slate-600/[.8] hover:text-slate-600 dark:text-gray-50  transition-opacity duration-300 "
                        >
                            {button.icon}
                        </button>
                    ))}
                </div>
            </DndContext>
        </div>
    );

    // render functions

    function renderSortableItemDragOverlay(id: UniqueIdentifier) {
        return (
            <Item
                value={
                    board?.items[id]?.content.length === 0
                        ? '...'
                        : board?.items[id]?.content
                }
                containerId={''}
                showItemForm={false}
                setShowItemForm={() => {}}
                handle={handle}
                style={getItemStyles({
                    containerId: findContainer(id) as UniqueIdentifier,
                    overIndex: -1,
                    index: getIndex(id),
                    value: id,
                    isSorting: true,
                    isDragging: true,
                    isDragOverlay: true,
                })}
                color={board?.items[id]?.badgeColor.value}
                wrapperStyle={wrapperStyle({ index: 0 })}
                renderItem={renderItem}
                dragOverlay
            />
        );
    }

    function renderContainerDragOverlay(
        containerId: UniqueIdentifier,
        container: TContainer | undefined
    ) {
        return (
            <Container
                container={container}
                label={container?.title ? container.title : `Moving column`}
                itemCount={items[containerId]!.length}
                columns={columns}
                style={{
                    height: '100%',
                }}
                shadow
                unstyled={false}
            >
                {items[containerId]?.map((itemId, index) => (
                    <Item
                        key={index}
                        containerId={containerId}
                        showItemForm={false}
                        setShowItemForm={() => {}}
                        value={
                            board?.items[itemId]
                                ? board?.items[itemId]?.content
                                : '...'
                        }
                        handle={handle}
                        style={getItemStyles({
                            containerId,
                            overIndex: -1,
                            index: getIndex(itemId),
                            value: itemId,
                            isDragging: false,
                            isSorting: false,
                            isDragOverlay: false,
                        })}
                        color={board?.items[itemId]?.badgeColor.value}
                        wrapperStyle={wrapperStyle({ index })}
                        renderItem={renderItem}
                    />
                ))}
            </Container>
        );
    }

    function handleRemoveContainer(containerID: UniqueIdentifier) {
        let itemsToBeRemoved: UniqueIdentifier[] | undefined =
            board?.containerItemMapping[containerID];
        let newContainers: Containers;
        let newContainerItemMapping: ContainerItemMapping;
        let newContainerOrder: UniqueIdentifier[] = Array.from(containers);
        let newItems: Items;

        for (let i = 0; i < newContainerOrder.length; i++) {
            // remove containers from container order.
            if (newContainerOrder[i] === containerID) {
                newContainerOrder.splice(i, 1);
            }
        }

        db.transaction('rw', db.boards, async () => {
            let deleteCount = await db.boards
                .where('slug')
                .equals(currentBoardSlug)
                .modify((boardItem: any) => {
                    newItems = omit(boardItem.items, itemsToBeRemoved);
                    newContainers = omit(boardItem.containers, containerID);
                    newContainerItemMapping = omit(
                        boardItem.containerItemMapping,
                        containerID
                    );

                    // set to new objects
                    boardItem.items = newItems;
                    boardItem.containers = newContainers;
                    boardItem.containerOrder = newContainerOrder;
                    boardItem.containerItemMapping = newContainerItemMapping;
                    boardItem.updatedAt = new Date(Date.now());
                });
            if (deleteCount === 1) {
                console.log('Deleted container ' + containerID);
            }
        })
            .catch(Dexie.ModifyError, (error) => {
                console.error(
                    error.failures.length + 'Failed to remove container'
                );
            })
            .catch((error) => {
                console.error('Uh oh! Something went wrong. ' + error);
            });
        setTotalItemCount(board ? Object.keys(board.items).length : 0);
    }

    function handleAddContainer() {
        const newContainerId = getNextContainerId();

        let newContainer: TContainer = {
            id: newContainerId,
            title: '',
            badgeColor: {
                name: 'transparent',
                value: '#FFFFFF00',
                textDark: true,
            },
            type: 'simple',
            completedItemOrder: 'noChange',
        };

        db.transaction('rw', db.boards, async () => {
            await db.boards
                .where('slug')
                .equals(currentBoardSlug)
                .modify((board: Board) => {
                    // add container to containers object
                    board.containers[newContainerId] = newContainer;
                    board.containerOrder.push(newContainerId);
                    // add new empty array of itemIds to containerItemMapping object
                    board.containerItemMapping[newContainerId] = [];
                    board.updatedAt = new Date(Date.now());
                });
        })
            .catch(Dexie.ModifyError, (error) => {
                console.error(
                    error.failures.length + 'Failed to add container'
                );
            })
            .catch((error) => {
                console.error('Uh oh! Something went wrong. ' + error);
            });
    }

    function getNextContainerId() {
        // returns 'A' if lastContainerId is undefined
        const containerIds = Object.keys(items);
        const lastContainerId = containerIds[containerIds.length - 1];

        return !lastContainerId
            ? 'A'
            : String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
    }
}

// container function
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
    children,
    container,
    columns = 1,
    disabled,
    id,
    items,
    style,
    ...props
}: ContainerProps & {
    disabled?: boolean;
    id: UniqueIdentifier;
    items: UniqueIdentifier[] | undefined;
    style?: React.CSSProperties;
}) {
    const {
        active,
        attributes,
        isDragging,
        listeners,
        over,
        setNodeRef,
        transition,
        transform,
    } = useSortable({
        id,
        data: {
            type: 'container',
            children: items,
        },
        animateLayoutChanges,
    });

    const isOverContainer = over
        ? (id === over.id && active?.data.current?.type !== 'container') ||
          items?.includes(over.id)
        : false;

    return (
        <Container
            ref={disabled ? undefined : setNodeRef}
            container={container}
            style={{
                ...style,
                transition,
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.5 : undefined,
            }}
            hover={isOverContainer}
            handleProps={{
                ...attributes,
                ...listeners,
            }}
            columns={columns}
            {...props}
        >
            {children}
        </Container>
    );
}

// Sortable Item

interface SortableItemProps {
    item?: TItem;
    itemsReorderedExternally: React.MutableRefObject<boolean>;
    setShowItemForm?: (value: boolean) => void;
    containerId: UniqueIdentifier;
    container: TContainer | undefined;
    id: UniqueIdentifier;
    index: number;
    handle: boolean;
    disabled?: boolean;
    style(args: any): React.CSSProperties;
    getIndex(id: UniqueIdentifier): number;
    renderItem(): React.ReactElement;
    wrapperStyle({ index }: { index: number }): React.CSSProperties;
}

function useMountStatus() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setIsMounted(true), 500);

        return () => clearTimeout(timeout);
    }, []);

    return isMounted;
}

function SortableItem({
    item,
    itemsReorderedExternally,
    disabled,
    id,
    index,
    handle = true,
    renderItem,
    style,
    containerId,
    container,
    getIndex,
    wrapperStyle,
}: SortableItemProps) {
    const {
        setNodeRef,
        setActivatorNodeRef,
        listeners,
        isDragging,
        isSorting,
        over,
        overIndex,
        transform,
        transition,
    } = useSortable({
        id,
    });
    const mounted = useMountStatus();
    const mountedWhileDragging = isDragging && !mounted;
    const [showItemForm, setShowItemForm] = useState(false);

    return (
        <Item
            item={item}
            containerId={containerId}
            containerType={container ? container.type : 'simple'}
            completedItemOrder={
                container ? container.completedItemOrder : 'noChange'
            }
            itemsReorderedExternally={itemsReorderedExternally}
            ref={disabled ? undefined : setNodeRef}
            showItemForm={showItemForm}
            setShowItemForm={setShowItemForm}
            value={item?.content || '...'}
            dragging={isDragging}
            sorting={isSorting}
            handle={handle}
            handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
            index={index}
            wrapperStyle={wrapperStyle({ index })}
            style={style({
                index,
                value: id,
                isDragging,
                isSorting,
                overIndex: over ? getIndex(over.id) : overIndex,
                containerId,
            })}
            color={item ? item.badgeColor.value : '#fff'}
            transition={transition}
            transform={transform}
            fadeIn={mountedWhileDragging}
            listeners={listeners}
            renderItem={renderItem}
        />
    );
}
