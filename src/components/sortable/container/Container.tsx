import React, { forwardRef } from 'react';
import clsx from 'clsx';
// import styles from './Container.module.css';
import { Handle, Remove } from '../components';
import { MdAdd, MdDragIndicator, MdOutlineEdit } from 'react-icons/md';
import { Board, TContainer, TItem, UniqueIdentifier } from '../types';
import { AiOutlineDelete } from 'react-icons/ai';
import Dexie, { ModifyError } from 'dexie';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';

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
        // global store
        const { currentBoardSlug } = useKanbanStore();

        function handleAddItem() {
            const newItemIdentifier: UniqueIdentifier = `${
                container!.id
            }${itemCount}`;

            let newItem: TItem = {
                id: newItemIdentifier,
                content: '',
                badgeColor: { name: 'white', value: '#fff', textDark: true },
                createdAt: new Date(Date.now()).toLocaleString(),
                updatedAt: new Date(Date.now()).toLocaleString(),
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
                        boardItem.containerMappings[container!.id].push(
                            newItem
                        );
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
                    console.error('Generic error: ' + e);
                });
        }

        function handleRemoveContainer() {}

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
                className="flex flex-col max-content h-full w-52 md:w-80 lg:w-96 xl:w-[30rem] bg-gray-100 sm:px-1 mx-1 rounded-md group py-2"
                onClick={onClick}
                tabIndex={onClick ? 0 : undefined}
            >
                {label ? (
                    <div className="flex justify-between items-center group mt-2 mb-1 mx-1">
                        <h1 className="text-l text-slate-500 font-medium">
                            {label}
                        </h1>
                        <div className="flex items-center gap-x-4">
                            {onRemove ? (
                                <Remove
                                    onClick={onRemove}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 cursor-drag focus:cursor-drag transition-opacity duration-300"
                                />
                            ) : undefined}
                            <Handle
                                {...handleProps}
                                className="opacity-0 group-hover:opacity-100 text-gray-500 cursor-drag focus:cursor-drag transition-opacity duration-300"
                            />
                        </div>
                    </div>
                ) : null}
                {placeholder ? (
                    children
                ) : (
                    <ul className="w-full grid gap-y-2 grid-cols-auto">
                        {children}
                    </ul>
                )}
                <div className="flex my-2 w-full h-auto justify-start">
                    <button
                        className="bg-transparent hover:scale-110 text-gray-500 transition-transform duration-300"
                        onClick={handleAddItem}
                    >
                        <MdAdd className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex items-center justify-between mt-auto inset-y-0 opacity-0 border-t group-hover:opacity-100 transition-opacity duration-300 py-2">
                    <button
                        type="button"
                        className="w-5 h-5 rounded-md hover:bg-red-600 cursor-pointer text-gray-500 hover:text-gray-50 flex items-center justify-center transition-color duration-300 disabled:text-gray-500/[0.5] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        // button is disabled if we only have one column, OR if we will be deleting all our tasks.
                        disabled={
                            columns === 1 ? true : false
                            // ||
                            //   taskCount ===
                            //       columnTasks!.length
                        }
                        onClick={handleRemoveContainer}
                    >
                        <AiOutlineDelete className="w-4 h-4" />
                    </button>
                    <button className="items-center justify-end text-slate-500 py-2 rounded-full hover:text-red-500 cursor-pointer transition-color duration-300">
                        <MdOutlineEdit className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }
);

Container.displayName = 'Container';
