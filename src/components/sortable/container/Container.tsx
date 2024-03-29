import React, { forwardRef, useRef, useState } from 'react';
import { MdAdd, MdOutlineCancel, MdOutlineEdit } from 'react-icons/md';
import { ModifyError } from 'dexie';

import { Handle } from '../components';
import ContainerInputGroup from '@/components/forms/inputs/ContainerInputGroup';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';
import { useOnClickOutside } from '@/core/hooks';
import type {
    TContainer,
    TItem,
    UniqueIdentifier,
} from '@/core/types/sortableBoard';

export interface ContainerProps {
    children: React.ReactNode;
    itemCount: number;
    container?: TContainer;
    columns?: number;
    label?: string;
    style?: React.CSSProperties;
    horizontal?: boolean;
    hover?: boolean;
    handleProps?: React.HTMLAttributes<any>;
    scrollable?: boolean;
    shadow?: boolean;
    placeholder?: boolean;
    unstyled?: boolean;
    onClick?(): void;
    onRemove?(): void;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
    (
        {
            children,
            container,
            itemCount,
            columns = 1,
            handleProps,
            horizontal,
            hover,
            onClick,
            onRemove,
            label,
            placeholder,
            style,
            scrollable,
            shadow,
            unstyled,
            ...props
        }: ContainerProps,
        ref
    ) => {
        // local state
        const [showContainerForm, setShowContainerForm] = useState(false);
        // global store
        const { maxItemId, increaseMaxItemId, currentBoardSlug } =
            useKanbanStore();

        const containerFormRef = useRef(null);
        const excludedRef = useRef(null);

        useOnClickOutside(
            containerFormRef,
            () => setShowContainerForm(false),
            excludedRef
        );

        function handleAddItem() {
            // maxItemId has been set in upon loading the board in SortableBoard.
            const newItemIdentifier: UniqueIdentifier = `${maxItemId + 1}`;

            let newItem: TItem = {
                id: newItemIdentifier,
                content: '',
                badgeColor: {
                    name: 'transparent',
                    value: '#FFFFFF00',
                    textDark: true,
                },
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                completed: false,
            };

            db.transaction('rw', db.boards, async () => {
                // add a new task and push that task Id to the column it was added in.
                await db.boards
                    .where('slug')
                    .equals(currentBoardSlug)
                    .modify((boardItem: any) => {
                        // add item to item object
                        boardItem.items[newItemIdentifier] = newItem;
                        // props.columnId will always be defined.
                        boardItem.containerItemMapping[container!.id].push(
                            newItemIdentifier
                        );
                        boardItem.updatedAt = new Date(Date.now());
                    });
            })
                // Catch modification error and generic error.
                .catch('ModifyError', (e: ModifyError) => {
                    // Failed with ModifyError, check e.failures.
                    console.error(
                        'ModifyError occurred: ' +
                            e.failures.length +
                            ' failures'
                    );
                })
                .catch((e: Error) => {
                    console.error('Uh oh! Something went wrong: ' + e);
                });

            increaseMaxItemId();
        }

        function handleUpdateContainer(container: TContainer) {
            db.transaction('rw', db.boards, async () => {
                await db.boards
                    .where('slug')
                    .equals(currentBoardSlug)
                    .modify((boardItem: any) => {
                        boardItem.containers[container.id] = container;
                        boardItem.updatedAt = new Date(Date.now());
                    });
            })
                .catch('ModifyError', (e: ModifyError) => {
                    // ModifyError did occur
                    console.error(
                        e.failures.length + ' items failed to modify'
                    );
                })
                .catch((e) => {
                    console.error('Generic error: ' + e);
                });

            setShowContainerForm(false);
        }

        return (
            <div
                {...props}
                ref={ref}
                style={
                    {
                        ...style,
                        '--columns': columns,
                    } as React.CSSProperties
                }
                className="flex flex-col max-content h-full w-80 sm:w-80 md:w-[360px] lg:w-[400px] bg-gray-100 dark:bg-slate-800 rounded-md mr-2 dark:border-slate-600 snap-end snap-always"
                onClick={onClick}
                tabIndex={onClick ? 0 : undefined}
            >
                {label ? (
                    <div className="flex justify-start items-center mb-2 py-1 px-1 group rounded-t-md">
                        <div
                            className="w-6 h-6 rounded-md mr-3 shadow border border-inherit dark:border-slate-600"
                            style={{
                                backgroundColor: container?.badgeColor.value,
                            }}
                        ></div>
                        <div className="flex flex-wrap flex-col whitespace-normal">
                            <h1 className="text-l font-medium">{label}</h1>
                        </div>

                        <div className="flex items-center ml-auto gap-x-4 text-slate-600 hover:scale-105 focus:scale-105 transition-transform duration-300 ">
                            <Handle
                                {...handleProps}
                                className="rounded-md opacity-0 group-focus-visible:opacity-75 focus:opacity-75 group-hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:scale-110 focus-visible:ring-offset-4 transition-transform duration-300"
                            />
                        </div>
                    </div>
                ) : null}
                {placeholder ? (
                    children
                ) : (
                    // all items
                    <ul className="w-full grid gap-y-1 sm:gap-y-2  grid-cols-auto px-1">
                        {children}
                    </ul>
                )}
                <div className="flex my-2 w-full h-auto justify-start px-1">
                    {container && (
                        <button
                            className="bg-transparent text-gray-500 transition-transform duration-300 w-full flex mx-2 group py-2"
                            onClick={handleAddItem}
                            aria-label="Add Item"
                            title="Add Empty Item"
                        >
                            <span className="w-1/2 h-0.5 bg-gray-300 dark:bg-slate-500 rounded-full self-center opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                            <MdAdd className="w-5 h-5 mx-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-color duration-300" />
                            <span className="w-1/2 h-0.5 bg-gray-300 dark:bg-slate-500 rounded-full self-center opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    )}
                </div>

                {container && (
                    <>
                        <div className="flex items-center justify-between mt-auto inset-y-0 border-t dark:border-slate-600 transition-opacity duration-300 py-2 px-1">
                            <button
                                className="ml-auto rounded-full items-center justify-end text-slate-500 p-1 hover:scale-110 hover:bg-white  dark:hover:bg-slate-900 dark:hover:text-slate-100 cursor-pointer transition-color duration-300"
                                ref={excludedRef}
                                onClick={() =>
                                    setShowContainerForm(!showContainerForm)
                                }
                            >
                                {showContainerForm ? (
                                    <>
                                        <span className="sr-only">
                                            Cancel Edit
                                        </span>

                                        <MdOutlineCancel className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        <span className="sr-only">
                                            Edit Board
                                        </span>
                                        <MdOutlineEdit className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        {showContainerForm && (
                            <div
                                className="bg-gray-100 -my-1 mt-4 px-2 pt-2 pb-4 dark:bg-slate-800"
                                ref={containerFormRef}
                            >
                                <ContainerInputGroup
                                    id={container.id}
                                    container={container}
                                    handleAddOrUpdateContainer={
                                        handleUpdateContainer
                                    }
                                    handleRemoveContainer={onRemove}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }
);

Container.displayName = 'Container';
