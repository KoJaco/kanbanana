import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal, unstable_batchedUpdates } from 'react-dom';
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
    useDroppable,
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

import { Container, ContainerProps } from './container';
import { Item } from './item';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { getMaxIdFromString, initializeBoard } from '@/core/utils/kanbanBoard';
import { useKanbanStore } from '@/stores/KanbanStore';
import { newBoard } from './consts';
import {
    ContainerItemMapping,
    Containers,
    TContainer,
    Board,
    TItem,
    Items,
} from '@/core/types/sortableBoard';
import { MdOutlineEdit } from 'react-icons/md';
import Tag from '../elements/Tag';
import {
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi';
// local components

// import DroppableContainer from './DroppableContainer';
// import SortableItem from './SortableItem';
// TODO: fix up items undefined with active/overId selecting index

function getMaxIdFromObjectKeyStrings(keyStrings: string[]): number {
    if (!keyStrings || keyStrings.length === 0) {
        return 0;
    }
    let idArray: number[] = [];
    keyStrings.forEach((key) => {
        try {
            if (key === undefined) {
                throw new Error('Key was undefined');
            }
            // try to parse id to integer
            let idNum = parseInt(key, 10);
            if (isNaN(idNum)) {
                console.error(
                    'Something went wrong while trying to parse key to an integer. Value is Not a Number.'
                );
                // continue trying to parse
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

const dropAnimation: DropAnimation = {
    duration: 300,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            // active: {
            //     opacity: '0.5',
            // },
            dragOverlay: {
                opacity: '0',
                visibility: 'hidden',
                transition: 'opacity, 0.5s',
                transitionTimingFunction: 'ease-out',
            },
        },
    }),
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

var omit = require('object.omit');
export const TRASH_ID = 'void';
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
    containerStyle,
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
    const [items, setItems] = useState<ContainerItemMapping>(
        newBoard.containerItemMapping
    );
    const [containers, setContainers] = useState(
        Object.keys(items) as UniqueIdentifier[]
    );

    // Zustand store state
    const {
        totalItemCount,
        columnCount,
        setTotalItemCount,
        setColumnCount,
        increaseColumnCount,
        currentBoardSlug,
        setCurrentBoardSlug,
        maxColumnId,
        maxItemId,
        setMaxItemId,
        setMaxColumnId,
        increaseMaxItemId,
    } = useKanbanStore();

    // useLiveQuery() for indexDB state management, watch for changes in local board state.
    const board: Board | undefined = useLiveQuery(
        () => db.boards.get(slug),
        [totalItemCount, columnCount, slug]
    );

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);
    const isSortingContainer = activeId ? containers.includes(activeId) : false;

    useEffect(() => {
        if (board !== undefined) {
            setItems(board.containerItemMapping);
            setContainers(board.containerOrder);
            setCurrentBoardSlug(slug);
            setMaxItemId(
                getMaxIdFromObjectKeyStrings(Object.keys(board.items))
            );
        }
    }, [
        board,
        setItems,
        setContainers,
        setCurrentBoardSlug,
        slug,
        setMaxItemId,
    ]);

    /**
     * Custom collision detection strategy optimized for multiple containers
     *
     * - First, find any droppable containers intersecting with the pointer.
     * - If there are none, find intersecting containers with the active draggable.
     * - If there are no intersecting containers, return the last matched intersection
     *
     */

    //@ts-ignore
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

            if (overId != null) {
                if (overId in items) {
                    const containerItems = items[overId];

                    if (
                        containerItems !== undefined &&
                        containerItems.length > 0
                    ) {
                        // Return the closest droppable within that container
                        // @ts-ignore
                        overId = closestCenter({
                            ...args,
                            droppableContainers:
                                args.droppableContainers.filter(
                                    (container) =>
                                        container.id !== overId &&
                                        containerItems.includes(container.id)
                                ),
                        })[0]?.id;
                    }
                }

                lastOverId.current = overId;

                return [{ id: overId }];
            }

            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (recentlyMovedToNewContainer.current) {
                lastOverId.current = activeId;
            }

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

    useEffect(() => {
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false;
        });
    }, [items]);

    if (items === undefined || board === undefined) return null;

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

    return (
        <>
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
                    // local state on drag over, set server-client state on drag end.
                    const overId = over?.id;

                    if (overId == null || active.id in items) {
                        return;
                    }

                    const overContainer = findContainer(overId);
                    const activeContainer = findContainer(active.id);

                    if (!overContainer || !activeContainer) {
                        // return early if either are undefined
                        return;
                    }

                    if (activeContainer !== overContainer) {
                        // @ts-ignore
                        setItems((items) => {
                            if (items === undefined) {
                                return board.containerItemMapping;
                            }
                            const activeItems = items[activeContainer];
                            const overItems = items[overContainer];

                            const overIndex = overItems?.indexOf(overId);
                            const activeIndex = activeItems!.indexOf(active.id);

                            let newIndex: number;

                            if (overItems && overId in items) {
                                newIndex = overItems.length + 1;
                            } else {
                                const isBelowOverItem =
                                    over &&
                                    active.rect.current.translated &&
                                    active.rect.current.translated.top >
                                        over.rect.top + over.rect.height;

                                const modifier = isBelowOverItem ? 1 : 0;

                                newIndex =
                                    overIndex && overIndex >= 0
                                        ? overIndex + modifier
                                        : overItems!.length + 1;
                            }

                            recentlyMovedToNewContainer.current = true;

                            return {
                                ...items,
                                [activeContainer]: items[
                                    activeContainer
                                ]!.filter((item) => item !== active.id),
                                [overContainer]: [
                                    ...items[overContainer]!.slice(0, newIndex),
                                    items[activeContainer]![activeIndex],
                                    ...items[overContainer]!.slice(
                                        newIndex,
                                        items[overContainer]!.length
                                    ),
                                ],
                            };
                        });
                    }
                }}
                onDragEnd={({ active, over }) => {
                    if (active.id in items && over?.id) {
                        // dragging containers, set container order.
                        const activeIndex = containers.indexOf(active.id);
                        const overIndex = containers.indexOf(over.id);

                        const newContainerOrder: UniqueIdentifier[] = arrayMove(
                            containers,
                            activeIndex,
                            overIndex
                        );
                        db.transaction('rw', db.boards, async () => {
                            await db.boards
                                .where('slug')
                                .equals(currentBoardSlug)
                                .modify((boardItem: any) => {
                                    boardItem.containerOrder =
                                        newContainerOrder;
                                });
                        });
                    }

                    const activeContainer = findContainer(active.id);

                    if (!activeContainer) {
                        setActiveId(null);
                        return;
                    }

                    const overId = over?.id;

                    if (overId == null) {
                        setActiveId(null);
                        return;
                    }

                    // if (overId === TRASH_ID) {
                    //     // dragging items, set container item mappings in db.
                    //     setItems((items) => ({
                    //         ...items,
                    //         // @ts-ignore
                    //         [activeContainer]: items[activeContainer].filter(
                    //             (id) => id !== activeId
                    //         ),
                    //     }));
                    //     setActiveId(null);
                    //     return;
                    // }

                    if (overId === PLACEHOLDER_ID) {
                        // dragging items over placeholder, results in adding a containers

                        const newContainerId = getNextContainerId();

                        let newContainer: TContainer = {
                            id: newContainerId,
                            title: '',
                            badgeColor: {
                                name: 'white',
                                value: '#fff',
                                textDark: true,
                            },
                            type: 'simple',
                            completedItemOrder: 'noChange',
                        };

                        const newContainerOrder = [
                            ...containers,
                            newContainerId,
                        ];
                        const newContainerItemMapping = {
                            ...items,
                            [activeContainer]: items[activeContainer]?.filter(
                                (id) => id !== activeId
                            ),
                            [newContainerId]: [activeId],
                        };

                        db.transaction('rw', db.boards, async () => {
                            await db.boards
                                .where('slug')
                                .equals(currentBoardSlug)
                                .modify((boardItem: any) => {
                                    boardItem.containers[newContainerId] =
                                        newContainer;

                                    boardItem.containerOrder =
                                        newContainerOrder;
                                    boardItem.containerItemMapping =
                                        newContainerItemMapping;
                                });
                            setActiveId(null);
                        });
                        return;

                        // unstable_batchedUpdates(() => {
                        //     setContainers((containers) => [
                        //         ...containers,
                        //         newContainerId,
                        //     ]);
                        //     setItems((items) => ({
                        //         ...items,
                        //         [activeContainer]: items[
                        //             activeContainer
                        //         ]!.filter((id) => id !== activeId),
                        //         [newContainerId]: [active.id],
                        //     }));
                        //     setActiveId(null);
                        // });
                        // return;
                    }

                    const overContainer = findContainer(overId);

                    if (overContainer && activeContainer) {
                        // dragging items, set container item mappings in db.
                        const activeIndex = items[activeContainer]?.indexOf(
                            active.id
                        );
                        const overIndex = items[overContainer]?.indexOf(overId);
                        // console.log('overIndex: ' + overIndex);
                        // console.log('activeIndex: ' + activeIndex);

                        //@ts-ignore
                        const newContainerItemMapping = {
                            ...items,
                            [overContainer]: arrayMove(
                                //@ts-ignore
                                items[overContainer],
                                activeIndex,
                                overIndex
                            ),
                        };

                        // if (activeIndex !== overIndex) {
                        db.transaction('rw', db.boards, async () => {
                            await db.boards
                                .where('slug')
                                .equals(currentBoardSlug)
                                .modify((boardItem: any) => {
                                    boardItem.containerItemMapping =
                                        newContainerItemMapping;
                                });
                        });
                        // setItems((items) => ({
                        //     ...items,
                        //     [overContainer]: arrayMove(
                        //         // @ts-ignore
                        //         items[overContainer],
                        //         activeIndex,
                        //         overIndex
                        //     ),
                        // }));
                    }
                    // }

                    setActiveId(null);
                }}
                cancelDrop={cancelDrop}
                onDragCancel={onDragCancel}
                modifiers={modifiers}
            >
                {/* TITLE */}
                <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 ">
                    <div className="flex justify-between items-end gap-8">
                        <h1 className="text-2xl font-semibold text-slate-600">
                            {board?.title.length === 0
                                ? 'Add a Board Title...'
                                : board?.title}
                        </h1>

                        <button
                            className="items-center text-slate-500 p-2 rounded-full hover:bg-light-gray cursor-pointer transition-color duration-300"
                            // onClick={() => setShowBoardForm(true)}
                        >
                            <MdOutlineEdit className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex justify-between items-start gap-8">
                        <div>
                            {board?.tags?.map((tag, index) => (
                                <div className="inline-flex mr-1" key={index}>
                                    <Tag
                                        text={tag.text}
                                        backgroundColor={tag.backgroundColor}
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-light p-2 text-slate-600">
                                {board?.updatedAt}
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    id="carousel"
                    className="pb-10 sm:mx-8 overflow-x-scroll scroll scrollbar-rounded-horizontal snap-x whitespace-nowrap scroll-smooth touch-pan-x transition-all duration-500"
                >
                    <div
                        className="inline-grid grid-auto-cols auto-cols-max h-auto relative "
                        style={{
                            gridAutoFlow: vertical ? 'row' : 'column',
                        }}
                        // className="pb-10 mx-2 sm:mx-8 inline-grid grid-auto-cols grid-auto-rows auto-cols-max py-10 h-auto overflow-x-auto"
                        // style={{
                        //     gridAutoFlow: vertical ? 'row' : 'column',
                        // }}
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
                                    <>
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
                                            <SortableContext
                                                items={items[containerId]!}
                                                strategy={strategy}
                                            >
                                                {items[containerId]!.map(
                                                    (value, index) => {
                                                        const item =
                                                            board?.items[value];
                                                        return (
                                                            <SortableItem
                                                                item={item}
                                                                disabled={
                                                                    isSortingContainer
                                                                }
                                                                key={value}
                                                                id={value}
                                                                index={index}
                                                                handle={handle}
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
                                                                getIndex={
                                                                    getIndex
                                                                }
                                                            />
                                                        );
                                                    }
                                                )}
                                            </SortableContext>
                                        </DroppableContainer>
                                    </>
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
                            dropAnimation={null}
                            // dropAnimation={dropAnimation}
                        >
                            {activeId
                                ? containers.includes(activeId)
                                    ? renderContainerDragOverlay(
                                          activeId,
                                          board?.containers[activeId]?.title
                                      )
                                    : renderSortableItemDragOverlay(activeId)
                                : null}
                        </DragOverlay>,
                        document.body
                    )}
                </div>
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
            </DndContext>
        </>
    );

    // render functions

    function renderSortableItemDragOverlay(id: UniqueIdentifier) {
        return (
            <Item
                value={id}
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
                color={getColor(id)}
                wrapperStyle={wrapperStyle({ index: 0 })}
                renderItem={renderItem}
                dragOverlay
            />
        );
    }

    function renderContainerDragOverlay(
        containerId: UniqueIdentifier,
        containerTitle: string | undefined
    ) {
        return (
            <Container
                label={
                    containerTitle
                        ? containerTitle
                        : `Moving column ${containerId}`
                }
                itemCount={items[containerId]!.length}
                columns={columns}
                style={{
                    height: '100%',
                }}
                shadow
                unstyled={false}
            >
                {items[containerId]?.map((item, index) => (
                    <Item
                        key={item}
                        value={item}
                        handle={handle}
                        style={getItemStyles({
                            containerId,
                            overIndex: -1,
                            index: getIndex(item),
                            value: item,
                            isDragging: false,
                            isSorting: false,
                            isDragOverlay: false,
                        })}
                        color={getColor(item)}
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
                });
            if (deleteCount === 1) {
                console.log('Deleted container ' + containerID);
            }
        });
        setTotalItemCount(board ? Object.keys(board.items).length : 0);

        // setContainers((containers) =>
        //     containers.filter((id) => id !== containerID)
        // );
    }

    function handleAddContainer() {
        const newContainerId = getNextContainerId();
        // add container to index db (server-client state), should refetch via useLiveQuery

        let newContainer: TContainer = {
            id: newContainerId,
            title: '',
            badgeColor: {
                name: 'white',
                value: '#fff',
                textDark: true,
            },
            type: 'simple',
            completedItemOrder: 'noChange',
        };

        db.transaction('rw', db.boards, async () => {
            await db.boards
                .where('slug')
                .equals(currentBoardSlug)
                .modify((boardItem: any) => {
                    // add container to containers object
                    boardItem.containers[newContainerId] = newContainer;

                    boardItem.containerOrder.push(newContainerId);
                    // add new empty array of itemIds to containerItemMapping object
                    boardItem.containerItemMapping[newContainerId] = [];
                });
        });

        // unstable_batchedUpdates(() => {
        //     setContainers((containers) => [...containers, newContainerId]);
        //     setItems((items) => ({
        //         ...items,
        //         [newContainerId]: [],
        //     }));
        // });
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
    containerId: UniqueIdentifier;
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

function getColor(id: UniqueIdentifier) {
    switch (String(id)[0]) {
        case 'A':
            return '#7193f1';
        case 'B':
            return '#ffda6c';
        case 'C':
            return '#00bcd4';
        case 'D':
            return '#ef769f';
    }

    return undefined;
}

function SortableItem({
    item,
    disabled,
    id,
    index,
    handle = true,
    renderItem,
    style,
    containerId,
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

    return (
        <Item
            item={item}
            isEditing={false}
            ref={disabled ? undefined : setNodeRef}
            value={id}
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
