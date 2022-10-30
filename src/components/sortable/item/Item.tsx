import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import { Handle } from '../components';
import { TItem, UniqueIdentifier } from '@/core/types/sortableBoard';
import ItemForm from '@/components/forms/ItemForm';
import { FiEdit } from 'react-icons/fi';

import styles from './Item.module.css';
import { useOnClickOutside } from '@/core/hooks';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';

var omit = require('object.omit');

export interface ItemProps {
    item?: TItem;
    showItemForm: boolean;
    containerId: UniqueIdentifier;
    containerType?: 'simple' | 'checklist';
    completedItemOrder?: 'start' | 'end' | 'noChange' | 'remove';

    setShowItemForm: (value: boolean) => void;
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
    React.forwardRef<HTMLLIElement, ItemProps>(
        (
            {
                item,
                containerId,
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
            useEffect(() => {
                if (!dragOverlay) {
                    return;
                }

                document.body.style.cursor = 'grabbing';

                return () => {
                    document.body.style.cursor = '';
                };
            }, [dragOverlay]);

            const itemFormRef = useRef(null);
            const excludedRef = useRef(null);

            const { currentBoardSlug } = useKanbanStore();

            useOnClickOutside(
                itemFormRef,
                () => props.setShowItemForm(false),
                excludedRef
            );

            function handleToggleChecklistItem(
                itemId: UniqueIdentifier | undefined,
                containerId: UniqueIdentifier
            ) {
                // const item = document.getElementById(`item-${itemId}`);
                if (itemId) {
                    db.transaction('rw', db.boards, async () => {
                        await db.boards
                            .where('slug')
                            .equals(currentBoardSlug)
                            .modify((boardItem: any) => {
                                // init variables to use
                                let completedItemState: boolean =
                                    boardItem.items[itemId].completed;
                                let containerItems: UniqueIdentifier[] =
                                    Array.from(
                                        boardItem.containerItemMapping[
                                            containerId
                                        ]
                                    );

                                let itemIndex = containerItems.indexOf(itemId);

                                switch (props.completedItemOrder) {
                                    case 'noChange':
                                        // break and simply set item's completed property to !property
                                        break;
                                    case 'start':
                                        if (
                                            itemIndex < containerItems.length &&
                                            !completedItemState
                                        ) {
                                            // if item is not marked as completed, shift item to front and update completed.
                                            // asserted is not undefined, if itemIndex < length
                                            containerItems.unshift(
                                                containerItems!.splice(
                                                    itemIndex,
                                                    1
                                                )[0]!
                                            );
                                            boardItem.containerItemMapping[
                                                containerId
                                            ] = containerItems;
                                        } else if (
                                            itemIndex < containerItems.length &&
                                            completedItemState
                                        ) {
                                            // if item is completed and we want to 'uncheck' it, the item is spliced to just before the other 'checked' items.
                                            let lastCompletedIndex: number = 0;
                                            for (
                                                let i =
                                                    containerItems.length - 1;
                                                i >= 0;
                                                i--
                                            ) {
                                                let iId = containerItems[i]!;
                                                if (
                                                    boardItem.items[iId]
                                                        .completed
                                                ) {
                                                    lastCompletedIndex = i;
                                                    break;
                                                }
                                            }
                                            containerItems.splice(itemIndex, 1);
                                            containerItems.splice(
                                                lastCompletedIndex,
                                                0,
                                                itemId
                                            );

                                            boardItem.containerItemMapping[
                                                containerId
                                            ] = containerItems;
                                        }
                                        break;
                                    case 'end':
                                        if (
                                            itemIndex < containerItems.length &&
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
                                            boardItem.containerItemMapping[
                                                containerId
                                            ] = containerItems;
                                        } else if (
                                            itemIndex < containerItems.length &&
                                            completedItemState
                                        ) {
                                            // if item is completed and we want to 'uncheck' it, the item is spliced to just before the other 'checked' items.
                                            let lastCompletedIndex: number = 0;
                                            for (
                                                let i = 0;
                                                i < containerItems.length;
                                                i++
                                            ) {
                                                let iId = containerItems[i]!;
                                                if (
                                                    boardItem.items[iId]
                                                        .completed
                                                ) {
                                                    lastCompletedIndex = i;
                                                    break;
                                                }
                                            }
                                            containerItems.splice(itemIndex, 1);
                                            containerItems.splice(
                                                lastCompletedIndex,
                                                0,
                                                itemId
                                            );

                                            boardItem.containerItemMapping[
                                                containerId
                                            ] = containerItems;
                                        }
                                        break;
                                    default:
                                        throw new Error(
                                            'Something went wrong!'
                                        );
                                }

                                // toggle completed item state, happens for all cases
                                boardItem.items[itemId].completed =
                                    !completedItemState;
                            });
                    });
                }
            }

            function handleRemoveItem(
                itemId: UniqueIdentifier | undefined,
                containerId: UniqueIdentifier
            ) {
                let item = document.getElementById(`item-${itemId}`);
                if (itemId) {
                    if (item) item.style.opacity = '0.5';

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
                                });
                            // catch any errors
                        });
                    }, 300);
                }
            }

            return renderItem ? (
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
                <li
                    id={`item-${item?.id}`}
                    key={index}
                    className={clsx(
                        'group opacity-100 transition-opacity duration-300',
                        props.containerType === 'checklist' &&
                            item?.completed &&
                            'opacity-50',
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
                    <label htmlFor="content" className="sr-only">
                        Task, note, or item content
                    </label>
                    {/* main item content after wrapper */}
                    <div
                        // className="flex flex-row justify-between w-full items-center pt-1 mb-4"
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
                                props.containerType === 'checklist' &&
                                    item?.completed &&
                                    'opacity-0'
                            )}
                        >
                            <div className="flex ml-auto gap-x-2">
                                <button
                                    type="button"
                                    className="w-4 h-4 rounded-md opacity-0 group-focus-visible:opacity-75 focus:opacity-75 group-hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-slate-600 focus-visible:scale-105 transition-transform duration-300 dark:text-gray-50"
                                    onClick={() =>
                                        props.setShowItemForm(
                                            !props.showItemForm
                                        )
                                    }
                                    ref={excludedRef}
                                >
                                    <FiEdit />
                                </button>

                                <Handle
                                    {...handleProps}
                                    {...listeners}
                                    className="rounded-md opacity-0 group-focus-visible:opacity-75 focus:opacity-75 group-hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:scale-110 focus-visible:ring-offset-4 transition-transform duration-300"
                                />
                            </div>
                        </div>

                        {props.showItemForm && item ? (
                            <div ref={itemFormRef} className="relative z-40">
                                <ItemForm
                                    item={item}
                                    containerType="simple"
                                    containerId={containerId}
                                    showForm={props.showItemForm}
                                    setShowForm={
                                        props.setShowItemForm
                                            ? props.setShowItemForm
                                            : () => {}
                                    }
                                    handleRemoveItem={handleRemoveItem}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-row items-center">
                                <div>
                                    {props?.containerType === 'checklist' &&
                                        props.completedItemOrder && (
                                            <button
                                                type="button"
                                                className="w-7 h-7 rounded-full border-1 border-gray-300 dark:border-slate-500 place-self-center self-center -translate-y-2 mr-4 hover:shadow"
                                                onClick={() =>
                                                    props.completedItemOrder ===
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
                                            ></button>
                                        )}
                                </div>

                                <div
                                    id={`${value}`}
                                    className="self-start whitespace-normal pb-2 text-slate-600 dark:text-slate-100 break-all text-sm sm:text-md"
                                >
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
