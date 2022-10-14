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
                    className={clsx(
                        'group',
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
                            'w-full bg-white',
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
                        <div className="flex flex-row w-full">
                            {/* <button
                                className="flex rounded-md border-1 border-gray-300 p-1 w-4 h-4"
                                // style={{
                                //     backgroundColor: parseColorToString(props.color),
                                // }}
                                // onClick={() => setShowColorPicker(true)}
                                // disable when selecting color, let useOnClickOutside handle close
                                // disabled={showColorPicker ? true : false}
                            >
                            </button> */}

                            <div className="flex ml-auto opacity-50 transition-opacity duration-300">
                                {/* <Remove className="" onClick={onRemove} /> */}

                                <Handle {...handleProps} {...listeners} />
                            </div>
                        </div>
                        <div className="flex flex-row">
                            {/* content */}
                            <div
                                id={`${value}`}
                                className="whitespace-normal pb-2 text-slate-600 break-all"
                            >
                                {item && item.content ? item.content : value}
                            </div>
                        </div>
                    </div>
                </li>
            );
        }
    )
);
