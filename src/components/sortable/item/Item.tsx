import React, { useEffect } from 'react';
import clsx from 'clsx';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import { Handle, Remove } from '../components';
import { TItem } from '@/core/types/sortableBoard';
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
    isEditing: boolean;
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
    React.forwardRef<HTMLDivElement, ItemProps>(
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
                <div
                    className="row-span-1 w-full h-full py-1 px-2 border-[1.5px] border-gray-300 rounded-sm bg-gray-50  focus-within:border-slate-500 focus-within:ring-0.2 focus-within:ring-slate-500 focus-within:drop-shadow group max-w-auto"
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
                        // className={clsx(
                        //     styles.Item,
                        //     dragging && styles.dragging,
                        //     handle && styles.withHandle,
                        //     dragOverlay && styles.dragOverlay,
                        //     disabled && styles.disabled,
                        //     color && styles.color
                        // )}
                        className=""
                        style={style}
                        data-cypress="draggable-item"
                        {...(!handle ? listeners : undefined)}
                        {...props}
                        tabIndex={!handle ? 0 : undefined}
                    >
                        {value}
                        <span className="">
                            {/* <span className={styles.Actions}> */}
                            {onRemove ? (
                                <Remove
                                    className=""
                                    // className={styles.Remove}
                                    onClick={onRemove}
                                />
                            ) : null}
                            {handle ? (
                                <Handle {...handleProps} {...listeners} />
                            ) : null}
                        </span>
                    </div>
                </div>
            );
        }
    )
);
