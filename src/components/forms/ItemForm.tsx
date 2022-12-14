import React, { useRef, useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { useKanbanStore } from '@/stores/KanbanStore';
import { db } from '@/server/db';
import { BsBrush } from 'react-icons/bs';
import ColorPicker from '@/components/pickers/ColorPicker';

import { MdOutlineDone } from 'react-icons/md';

import { TItem, Color, UniqueIdentifier } from '@/core/types/sortableBoard';
import { useTheme } from 'next-themes';
import { ModifyError } from 'dexie';

type ItemFormProps = {
    containerType: 'checklist' | 'simple';
    containerId: UniqueIdentifier;
    item: TItem;
    showForm: boolean;
    children?: JSX.Element;
    setShowForm: (value: boolean) => void;
    handleRemoveItem: (
        itemId: UniqueIdentifier,
        containerId: UniqueIdentifier
    ) => void;
};

const ItemForm = ({
    handleRemoveItem,
    setShowForm,
    children,
    ...props
}: ItemFormProps) => {
    // use local state for controlled inputs, save everything to db on submit.
    const [itemState, setItemState] = useState(props.item);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const { currentBoardSlug } = useKanbanStore();

    const { theme } = useTheme();

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // scroll textAreaRef on initial render.
        if (textAreaRef.current !== null) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, []);

    function handleTextAreaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
        // Auto adjust the text area height.
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${e.target.scrollHeight}px`;
        }
    }

    function handleUserInput(
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) {
        // could be either a user selecting 'completed' or a user inputting text content
        const newItemState = {
            ...itemState,
            [e.currentTarget.name]: e.currentTarget.value,
        };
        setItemState(newItemState);
    }

    function handlePickColor(color: Color) {
        const newItemState = {
            ...itemState,
            badgeColor: color,
        };
        setItemState(newItemState);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        db.boards
            .where('slug')
            .equals(currentBoardSlug)
            .modify((boardItem: any) => {
                boardItem.items[itemState.id] = itemState;
                boardItem.updatedAt = new Date(Date.now());
            })
            .catch('ModifyError', (e: ModifyError) => {
                console.error(
                    'ModifyError occurred: ' +
                        e.failures.length +
                        ` failures. Failed to updated item: ${itemState.id}.`
                );
            })
            .catch((e: Error) => {
                console.error(
                    'Uh oh! Something went wrong when updated the item: ' + e
                );
            });
        setShowForm(false);
    }

    const transparentTextColor = (colorName: string, textDark: boolean) => {
        if (colorName === 'transparent' && theme === 'light') {
            return 'rgba(0,0,0,1)';
        } else if (colorName === 'transparent' && theme === 'dark') {
            return 'rgba(255,255,255,1)';
        }
        if (textDark) {
            return '#333';
        } else {
            return '#fff';
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className=""
            id={`item-${props.item?.id}-form`}
        >
            <textarea
                rows={1}
                ref={textAreaRef}
                name="content"
                id="taskContent"
                className="border-0 w-full mb-2 resize-none no-scrollbar bg-gray-50 dark:border-slate-700 text-slate-500 dark:text-slate-200 focus:ring-0 text-sm sm:text-md focus:outline-none placeholder:italic placeholder:text-gray-500/[0.5] dark:placeholder:text-slate-200/50 focus:resize-y bg-inherit group overflow-wrap"
                placeholder="Start writing..."
                value={itemState.content}
                onChange={handleUserInput}
                onInput={handleTextAreaInput}
            />
            <div className="opacity-100 py-5 max-h-0 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex">
                    <button
                        type="button"
                        className="w-5 h-5 rounded-md hover:bg-red-600 cursor-pointer text-gray-500 hover:text-gray-50 flex items-center justify-center transition-color duration-300 disabled:text-gray-500/[0.5] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        onClick={() =>
                            handleRemoveItem(itemState.id, props.containerId)
                        }
                    >
                        <span className="sr-only">Delete Item</span>
                        <AiOutlineDelete className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-shrink-0 gap-x-2">
                    <button
                        type="button"
                        className={`flex cursor-pointer rounded-lg items-center  justify-center w-5 h-5 ${
                            itemState.badgeColor.name === 'transparent' &&
                            'border-1 border-slate-500'
                        }`}
                        style={{
                            backgroundColor: itemState.badgeColor.value,
                            color: transparentTextColor(
                                itemState.badgeColor.name,
                                itemState.badgeColor.textDark
                            ),
                        }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                        <span className="sr-only">Choose an item color</span>
                        <BsBrush className="w-3 h-3" />
                    </button>

                    <button
                        type="submit"
                        className="inline-flex items-center w-5 h-5 p-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600/[0.8] hover:bg-green hover:drop-shadow focus:outline-none focus:drop-shadow-lg transition-colors duration-1000 cursor-pointer"
                    >
                        <span className="sr-only">Save Item</span>
                        <MdOutlineDone />
                    </button>
                </div>

                {children}
            </div>

            {showColorPicker && (
                <div className="my-2">
                    <ColorPicker
                        pickerType="inline"
                        corner="topRight"
                        popoverDirection="down"
                        colorPaletteOptions="full"
                        showColorPicker={showColorPicker}
                        handlePickColor={handlePickColor}
                    />
                </div>
            )}
        </form>
    );
};

export default ItemForm;
