import React, {
    forwardRef,
    useEffect,
    useLayoutEffect,
    useRef,
    createRef,
    useState,
} from 'react';
import { Handle } from '../components';
import { MdAdd, MdOutlineEdit } from 'react-icons/md';
import {
    TContainer,
    TItem,
    UniqueIdentifier,
} from '@/core/types/sortableBoard';
import { AiOutlineDelete } from 'react-icons/ai';
import { ModifyError } from 'dexie';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';
import ContainerForm from '@/components/forms/ContainerForm';
import { useOnClickOutside, usePrevious } from '@/core/hooks';
import { calculateBoundingBoxes } from '@/core/utils/kanbanBoard';

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
                    console.error('Generic error: ' + e);
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
            });
            setShowContainerForm(false);
            // .catch (Dexie.ModifyError, error => {

            //     // ModifyError did occur
            //     console.error(error.failures.length + " items failed to modify");

            // }).catch (error => {
            //     console.error("Generic error: " + error);
            // })
        }

        return (
            <div
                {...props}
                ref={ref}
                style={
                    {
                        // backgroundColor: container?.badgeColor.value,
                        ...style,
                        '--columns': columns,
                    } as React.CSSProperties
                }
                className="flex flex-col max-content h-full w-80 sm:w-80 md:w-96 lg:w-[26rem] xl:w-[32rem] bg-gray-100 dark:bg-slate-800 rounded-md mr-2 dark:border-slate-600 snap-normal snap-end"
                onClick={onClick}
                tabIndex={onClick ? 0 : undefined}
            >
                {label ? (
                    <div
                        className="flex justify-start items-center mb-2 py-1 px-1 group rounded-t-md"
                        // style={{
                        //     backgroundColor: container?.badgeColor.value,
                        // }}
                    >
                        <div
                            className="w-6 h-6 rounded-md mr-3 shadow border border-inherit dark:border-slate-600"
                            style={{
                                backgroundColor: container?.badgeColor.value,
                            }}
                        ></div>
                        <div className="flex flex-wrap flex-col whitespace-normal">
                            <h1
                                className="text-l font-medium"
                                // style={{
                                //     color: container?.badgeColor.textDark
                                //         ? '#333'
                                //         : '#fff',
                                // }}
                            >
                                {label}
                            </h1>
                        </div>

                        <div className="flex items-center ml-auto gap-x-4 text-slate-600 hover:scale-105 focus:scale-105 transition-transform duration-300 ">
                            {/* <div
                                className="w-6 h-6 rounded-lg border-inherit"
                                style={{
                                    backgroundColor:
                                        container?.badgeColor.value,
                                }}
                            ></div> */}
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
                            className="bg-transparent hover:scale-110 text-gray-500 transition-transform duration-300"
                            onClick={handleAddItem}
                        >
                            <MdAdd className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>

                {container && (
                    <>
                        <div className="flex items-center justify-between mt-auto inset-y-0 border-t dark:border-slate-600 transition-opacity duration-300 py-2 px-1">
                            {/* <button
                                type="button"
                                className="w-5 h-5 rounded-md hover:bg-red-600 cursor-pointer text-gray-500 hover:text-gray-50 flex items-center justify-center transition-color duration-300 disabled:text-gray-500/[0.5] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                // button is disabled if we only have one column, OR if we will be deleting all our tasks.
                                // disabled={
                                //     columns === 1 ? true : false
                                //     // ||
                                //     //   totalItemCount ===
                                //     //       columnTasks!.length
                                // }
                                onClick={onRemove}
                            >
                                <AiOutlineDelete className="w-4 h-4" />
                            </button> */}

                            <button
                                className="ml-auto items-center justify-end text-slate-500 py-2 rounded-full hover:text-red-500 cursor-pointer transition-color duration-300"
                                // style={{
                                //     color: container?.badgeColor.textDark
                                //         ? '#333'
                                //         : '#fff',
                                // }}
                                ref={excludedRef}
                            >
                                <MdOutlineEdit
                                    className="w-5 h-5"
                                    // style={{
                                    //     color: container?.badgeColor.textDark
                                    //         ? '#333'
                                    //         : '#fff',
                                    // }}
                                    onClick={() =>
                                        setShowContainerForm(!showContainerForm)
                                    }
                                />
                            </button>
                        </div>

                        {showContainerForm && (
                            <div
                                className="bg-gray-100 border-t -my-1 mt-4 px-2 pt-2 pb-4 dark:bg-slate-800 dark:border-slate-600"
                                ref={containerFormRef}
                            >
                                <ContainerForm
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
