import React, { useEffect } from 'react';
import clsx from 'clsx';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import { Handle, Remove } from '../components';
import { TItem } from '@/core/types/sortableBoard';
import TaskForm from './TaskForm';
import ArrowIcon from '@/components/elements/ArrowIcon';

import styles from './Item.module.css';
export interface ItemProps {
    item?: TItem;
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
    isEditing?: boolean;
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
                    key={index}
                    // className="list-none row-span-1 w-full h-full py-1 px-2 border-[1.5px] border-gray-300 rounded-sm bg-gray-50  focus-within:border-slate-500 focus-within:ring-0.2 focus-within:ring-slate-500 focus-within:drop-shadow max-w-auto"
                    className={clsx(
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
                    <label htmlFor="description" className="sr-only">
                        Task, note, or item content
                    </label>
                    <div
                        // className="flex flex-row justify-between w-full items-center pt-1 mb-4"
                        className={clsx(
                            styles.Item,
                            dragging && styles.dragging,
                            handle && styles.withHandle,
                            dragOverlay && styles.dragOverlay,
                            disabled && styles.disabled,
                            item?.badgeColor && styles.color
                        )}
                        style={style}
                        data-cypress="draggable-item"
                        {...props}
                        // {...(!handle ? listeners : undefined)}

                        tabIndex={!handle ? 0 : undefined}
                    >
                        <div className="flex">
                            <button
                                className="rounded-md border-1 border-gray-300 p-1 w-4 h-4"
                                // style={{
                                //     backgroundColor: parseColorToString(props.color),
                                // }}
                                // onClick={() => setShowColorPicker(true)}
                                // disable when selecting color, let useOnClickOutside handle close
                                // disabled={showColorPicker ? true : false}
                            >
                                {/* colour picker component, fixed to bottom of screen */}
                            </button>
                        </div>

                        <div className="flex ml-auto opacity-50 hover:opacity-100 transition-opacity duration-300">
                            {/* <Remove className="" onClick={onRemove} /> */}

                            <Handle {...handleProps} {...listeners} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {props.isEditing && item ? (
                            <>
                                <TaskForm
                                    id={item.id}
                                    // columnId={props.columnId}
                                    // totalItemCount={totalItemCount}
                                    // color={props.color}
                                    // previousTaskContent={props.content}
                                    // currentBoardSlug={currentBoardSlug}
                                    // showForm={isEditing}
                                    // setIsEditing={setIsEditing}
                                    // resetColor={handleColorReset}
                                >
                                    <>
                                        <div className="flex opacity-0 group-hover:opacity-100 space-x-2 transition-opacity duration-300">
                                            <ArrowIcon
                                                direction="left"
                                                disabled={false}
                                            />
                                            <ArrowIcon
                                                direction="right"
                                                disabled={false}
                                            />
                                            <ArrowIcon
                                                direction="up"
                                                disabled={false}
                                            />
                                            <ArrowIcon
                                                direction="down"
                                                disabled={false}
                                            />
                                        </div>
                                    </>
                                </TaskForm>
                            </>
                        ) : (
                            <div className="whitespace-normal pb-2 text-slate-600 break-all">
                                {item && item.content ? item.content : value}
                            </div>
                        )}
                    </div>
                </li>
            );
        }
    )
);
