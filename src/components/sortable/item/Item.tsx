import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { FiEdit } from 'react-icons/fi';
import { BiCheck } from 'react-icons/bi';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import { TItem, UniqueIdentifier, Board } from '@/core/types/sortableBoard';

import { Handle } from '../components';
import styles from './Item.module.css';
import ItemForm from '@/components/forms/ItemForm';

import { useOnClickOutside } from '@/core/hooks';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';
import { ModifyError } from 'dexie';

var omit = require('object.omit');

export interface ItemProps {
    item?: TItem;
    showItemForm: boolean;
    containerId: UniqueIdentifier;
    containerType?: 'simple' | 'checklist';
    completedItemOrder?: 'start' | 'end' | 'noChange' | 'remove';
    itemsReorderedExternally?: React.MutableRefObject<boolean>;

    setShowItemForm: (value: boolean) => void;
    children?: JSX.Element;
    dragOverlay?: boolean;
    color?: string;
    disabled?: boolean;
    dragging?: boolean;
    handle?: boolean;
    handleProps?: any;
    height?: number;
    index?: number;
    fadeIn?: boolean;
    transform?: Transform | null;
    listeners?: DraggableSyntheticListeners;
    sorting?: boolean;
    style?: React.CSSProperties;
    transition?: string | null;
    wrapperStyle?: React.CSSProperties;
    value: React.ReactNode;
    onRemove?(): void;
    renderItem?(args: {
        dragOverlay: boolean;
        dragging: boolean;
        sorting: boolean;
        index: number | undefined;
        fadeIn: boolean;
        listeners: DraggableSyntheticListeners;
        ref: React.Ref<HTMLElement>;
        style: React.CSSProperties | undefined;
        transform: ItemProps['transform'];
        transition: ItemProps['transition'];
        value: ItemProps['value'];
    }): React.ReactElement;
}

export const Item = React.memo(
    /**
     * HOC for sharing logic between SortableItem and the rendered item DragOverlay.
     * **/
    React.forwardRef<HTMLLIElement, ItemProps>(
        (
            {
                item,
                showItemForm,
                containerId,
                containerType,
                completedItemOrder,
                setShowItemForm,
                itemsReorderedExternally,
                children,
                color,
                dragOverlay,
                dragging,
                disabled,
                fadeIn,
                handle,
                handleProps,
                height,
                index,
                listeners,
                onRemove,
                renderItem,
                sorting,
                style,
                transition,
                transform,
                value,
                wrapperStyle,
                ...props
            },
            ref
        ) => {
            // Zustand global store state, need current board for indexDB, animation enabled so as not to interfere with drag and drop animations and vise versa.
            const { setEnableAnimation, currentBoardSlug } = useKanbanStore();

            // click outside functionality, exclude openForm button
            const itemFormRef = useRef(null);
            const excludedRef = useRef(null);

            useOnClickOutside(
                itemFormRef,
                () => setShowItemForm(false),
                excludedRef
            );

            useEffect(() => {
                if (!dragOverlay) {
                    return;
                }
                document.body.style.cursor = 'grabbing';
                return () => {
                    document.body.style.cursor = '';
                };
            }, [dragOverlay]);

            function handleToggleChecklistItem(
                itemId: UniqueIdentifier | undefined,
                containerId: UniqueIdentifier
            ) {
                // toggles the checked (completed) status on an Item, and toggles the enable animation global state variable.
                setEnableAnimation(true);

                if (itemId) {
                    db.transaction('rw', db.boards, async () => {
                        await db.boards
                            .where('slug')
                            .equals(currentBoardSlug)
                            .modify((board: Board) => {
                                if (board.items[itemId] === undefined) {
                                    throw new Error(
                                        `Failed to modify item with id: ${itemId}. Item does not exist in board items`
                                    );
                                } else {
                                    // init variables to use in calcs.
                                    let completedItemState: boolean =
                                        board.items[itemId]!.completed;
                                    let containerItems: UniqueIdentifier[] =
                                        Array.from(
                                            board.containerItemMapping[
                                                containerId
                                            ]!
                                        );

                                    let itemIndex =
                                        containerItems.indexOf(itemId);

                                    switch (completedItemOrder) {
                                        case 'noChange':
                                            // break and set item's completed property to !property
                                            break;
                                        case 'start':
                                            if (
                                                itemIndex <
                                                    containerItems.length &&
                                                !completedItemState
                                            ) {
                                                // if item is not marked as completed, shift item to front and update completed.
                                                // assert NOT undefined, if itemIndex < length
                                                containerItems.unshift(
                                                    containerItems!.splice(
                                                        itemIndex,
                                                        1
                                                    )[0]!
                                                );
                                                board.containerItemMapping[
                                                    containerId
                                                ] = containerItems;
                                            } else if (
                                                itemIndex <
                                                    containerItems.length &&
                                                completedItemState
                                            ) {
                                                // if item is completed and we want to 'uncheck' it, the item is spliced to just before the other 'checked' items.
                                                let lastCompletedIndex: number = 0;
                                                for (
                                                    let i =
                                                        containerItems.length -
                                                        1;
                                                    i >= 0;
                                                    i--
                                                ) {
                                                    let iId =
                                                        containerItems[i]!;
                                                    // assert NOT undefined, items array is unchanged in length at this point.
                                                    if (
                                                        board.items[iId]!
                                                            .completed
                                                    ) {
                                                        lastCompletedIndex = i;
                                                        break;
                                                    }
                                                }
                                                // splice in checked item at new index.
                                                containerItems.splice(
                                                    itemIndex,
                                                    1
                                                );
                                                containerItems.splice(
                                                    lastCompletedIndex,
                                                    0,
                                                    itemId
                                                );

                                                board.containerItemMapping[
                                                    containerId
                                                ] = containerItems;
                                            }
                                            break;
                                        case 'end':
                                            if (
                                                itemIndex <
                                                    containerItems.length &&
                                                !completedItemState
                                            ) {
                                                // if item is not marked as completed, shift item to front and update completed.
                                                // asserted is not undefined, if itemIndex < length
                                                containerItems.push(
                                                    containerItems!.splice(
                                                        itemIndex,
                                                        1
                                                    )[0]!
                                                );
                                                board.containerItemMapping[
                                                    containerId
                                                ] = containerItems;
                                            } else if (
                                                itemIndex <
                                                    containerItems.length &&
                                                completedItemState
                                            ) {
                                                // if item is completed and we want to 'uncheck' it, the item is spliced to just before the other 'checked' items.
                                                let lastCompletedIndex: number = 0;
                                                for (
                                                    let i = 0;
                                                    i < containerItems.length;
                                                    i++
                                                ) {
                                                    let iId =
                                                        containerItems[i]!;
                                                    if (
                                                        board.items[iId]!
                                                            .completed
                                                    ) {
                                                        lastCompletedIndex = i;
                                                        break;
                                                    }
                                                }
                                                containerItems.splice(
                                                    itemIndex,
                                                    1
                                                );
                                                containerItems.splice(
                                                    lastCompletedIndex,
                                                    0,
                                                    itemId
                                                );

                                                board.containerItemMapping[
                                                    containerId
                                                ] = containerItems;
                                            }
                                            break;
                                        default:
                                            throw new Error(
                                                `Something went wrong while attempting to check the completed button on item: ${itemId}.`
                                            );
                                    }

                                    // toggle completed item state, happens for all cases
                                    if (board.items[itemId]) {
                                        board.items[itemId]!.completed =
                                            !completedItemState;
                                    }
                                }
                            })
                            .catch('ModifyError', (e: ModifyError) => {
                                // Failed with ModifyError, check e.failures.
                                console.error(
                                    'ModifyError occurred: ' +
                                        e.failures.length +
                                        ` failures. Failed to toggle 'completed' button in item with id: ${itemId}`
                                );
                            })
                            .catch((e: Error) => {
                                console.error(
                                    'Uh oh! Something went wrong: ' + e
                                );
                            });
                    });
                    setTimeout(() => {
                        // timeout function matches animation time frame, toggle itemReorderExt.. ref to allow drag and drop referential variables to update correctly.
                        if (itemsReorderedExternally)
                            itemsReorderedExternally.current = true;
                        setEnableAnimation(false);
                    }, 500);
                }
            }

            function handleRemoveItem(
                itemId: UniqueIdentifier | undefined,
                containerId: UniqueIdentifier
            ) {
                // function for removing an item either within ItemForm, or when 'remove' is selected in the Container type dropdown.
                let item = document.getElementById(`item-${itemId}`);
                if (itemId) {
                    if (item) item.style.opacity = '0';

                    setTimeout(() => {
                        db.transaction('rw', db.boards, async () => {
                            await db.boards
                                .where('slug')
                                .equals(currentBoardSlug)
                                .modify((boardItem: any) => {
                                    const newItems = omit(
                                        boardItem.items,
                                        itemId
                                    );
                                    const newContainerItemMap =
                                        boardItem.containerItemMapping[
                                            containerId
                                        ].filter(
                                            (id: UniqueIdentifier) =>
                                                id !== itemId
                                        );
                                    const newContainerItemMapping = {
                                        ...boardItem.containerItemMapping,
                                        [containerId]: newContainerItemMap,
                                    };

                                    boardItem.items = newItems;
                                    boardItem.containerItemMapping =
                                        newContainerItemMapping;
                                    boardItem.updatedAt = new Date(Date.now());
                                }) // Catch modification error and generic error.
                                .catch('ModifyError', (e: ModifyError) => {
                                    // Failed with ModifyError, check e.failures.
                                    console.error(
                                        'ModifyError occurred: ' +
                                            e.failures.length +
                                            ` failures. Failed to remove item with id: ${itemId}`
                                    );
                                })
                                .catch((e: Error) => {
                                    console.error(
                                        'Uh oh! Something went wrong: ' + e
                                    );
                                });
                        });
                        if (itemsReorderedExternally)
                            itemsReorderedExternally.current = true;
                    }, 500);
                }
            }

            return renderItem ? (
                // render method for drag overlay
                renderItem({
                    dragOverlay: Boolean(dragOverlay),
                    dragging: Boolean(dragging),
                    sorting: Boolean(sorting),
                    index,
                    fadeIn: Boolean(fadeIn),
                    listeners,
                    ref,
                    style,
                    transform,
                    transition,
                    value,
                })
            ) : (
                // functional item component
                <li
                    id={`item-${item?.id}`}
                    key={index}
                    className={clsx(
                        'group transition-opacity duration-500',
                        containerType === 'checklist' && item?.completed
                            ? 'opacity-50'
                            : 'opacity-100',
                        styles.Wrapper,
                        fadeIn && styles.fadeIn,
                        sorting && styles.sorting,
                        dragOverlay && styles.dragOverlay
                    )}
                    style={
                        {
                            ...wrapperStyle,
                            transition: [transition, wrapperStyle?.transition]
                                .filter(Boolean)
                                .join(', '),
                            '--translate-x': transform
                                ? `${Math.round(transform.x)}px`
                                : undefined,
                            '--translate-y': transform
                                ? `${Math.round(transform.y)}px`
                                : undefined,
                            '--scale-x': transform?.scaleX
                                ? `${transform.scaleX}`
                                : undefined,
                            '--scale-y': transform?.scaleY
                                ? `${transform.scaleY}`
                                : undefined,
                            '--index': index,
                            '--color': color,
                        } as React.CSSProperties
                    }
                    ref={ref}
                >
                    <span className="sr-only">Task, note, or item content</span>
                    {/* main content */}
                    <div
                        className={clsx(
                            'w-full bg-white dark:bg-slate-900 dark:shadow-md group',
                            styles.Item,
                            dragging && styles.dragging,
                            handle && styles.withHandle,
                            dragOverlay && styles.dragOverlay,
                            disabled && styles.disabled,
                            color && styles.color
                        )}
                        style={style}
                        data-cypress="draggable-item"
                        {...props}
                        tabIndex={!handle ? 0 : undefined}
                    >
                        <div
                            className={clsx(
                                'flex flex-row w-full transition-opacity duration-300 focus-visible:opacity-75 group-focus:opacity-75',
                                styles.actionBar,
                                containerType === 'checklist' &&
                                    item?.completed &&
                                    'opacity-0'
                            )}
                        >
                            <div className="flex ml-auto gap-x-2">
                                <button
                                    type="button"
                                    className={clsx(
                                        item?.completed
                                            ? 'w-4 h-4 rounded-md opacity-0'
                                            : 'w-4 h-4 rounded-md opacity-0 group-focus-visible:opacity-75 focus:opacity-75 group-hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-slate-600 focus-visible:scale-105 transition-transform duration-300 dark:text-gray-50'
                                    )}
                                    onClick={() =>
                                        setShowItemForm(!showItemForm)
                                    }
                                    ref={excludedRef}
                                    disabled={item?.completed}
                                    aria-label="Mark Item Completed"
                                >
                                    <FiEdit />
                                </button>

                                <Handle
                                    {...handleProps}
                                    {...listeners}
                                    className="rounded-md opacity-0 group-focus-visible:opacity-75 focus:opacity-75 group-hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:scale-110 focus-visible:ring-offset-4 transition-transform duration-300"
                                    disabled={item?.completed}
                                />
                            </div>
                        </div>

                        {showItemForm && item ? (
                            <div ref={itemFormRef} className="relative z-40">
                                <ItemForm
                                    item={item}
                                    containerType="simple"
                                    containerId={containerId}
                                    showForm={showItemForm}
                                    setShowForm={setShowItemForm}
                                    handleRemoveItem={handleRemoveItem}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-row items-center">
                                <div>
                                    {containerType === 'checklist' &&
                                        completedItemOrder && (
                                            <button
                                                id={`checkItem${item?.id}`}
                                                type="button"
                                                className="flex items-center justify-center appearance-none w-7 h-7 rounded-full border-1 border-gray-300 dark:border-slate-500 place-self-center self-center -translate-y-2 mr-4 hover:shadow transition-transform cursor-pointer"
                                                onClick={() =>
                                                    completedItemOrder ===
                                                    'remove'
                                                        ? handleRemoveItem(
                                                              item?.id,
                                                              containerId
                                                          )
                                                        : handleToggleChecklistItem(
                                                              item?.id,
                                                              containerId
                                                          )
                                                }
                                                aria-label="Show Item Form"
                                            >
                                                <BiCheck
                                                    className="opacity-0 w-6 h-6 text-slate-500 checkItem transition-opacity duration-500"
                                                    style={{
                                                        opacity: item?.completed
                                                            ? '0.75'
                                                            : '0',
                                                    }}
                                                />
                                            </button>
                                        )}
                                </div>

                                <div className="self-start whitespace-normal pb-2 text-slate-600 dark:text-slate-300 break-all text-sm sm:text-md">
                                    {/* value here is text content */}
                                    {value}
                                </div>
                            </div>
                        )}
                    </div>
                </li>
            );
        }
    )
);
