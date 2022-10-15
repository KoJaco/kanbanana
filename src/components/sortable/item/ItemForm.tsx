import React, { useRef, useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { useKanbanStore } from '@/stores/KanbanStore';
import { db } from '@/server/db';
import { BsBrush } from 'react-icons/bs';
import ColorPickerPalette from '@/components/pickers/ColorPickerPalette';
import { MdOutlineDone } from 'react-icons/md';

import { useOnClickOutside, useOnClickInsideOnly } from '@/core/hooks';
import { TItem, Color, UniqueIdentifier } from '@/core/types/sortableBoard';
import { Disclosure, Transition } from '@headlessui/react';

var omit = require('object.omit');

type ItemFormProps = {
    containerType: 'checklist' | 'simple';
    containerId: UniqueIdentifier;
    item: TItem;
    showForm: boolean;
    children?: JSX.Element;
    setShowForm: (value: boolean) => void;
    handleRemoveItem: (itemId: string) => void;
};

const ItemForm = ({ setShowForm, children, ...props }: ItemFormProps) => {
    // use local state for controlled inputs, save everything to db on submit.
    const [itemState, setItemState] = useState(props.item);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const { currentBoardSlug } = useKanbanStore();

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
            });
        setShowForm(false);
    }

    console.log(props.containerId);
    console.log(itemState.id);

    function handleRemoveItem() {
        db.transaction('rw', db.boards, async () => {
            await db.boards
                .where('slug')
                .equals(currentBoardSlug)
                .modify((boardItem: any) => {
                    const newItems = omit(boardItem.items, itemState.id);
                    const newContainerItemMap = boardItem.containerItemMapping[
                        props.containerId
                    ].filter(
                        (itemId: UniqueIdentifier) => itemId !== itemState.id
                    );
                    const newContainerItemMapping = {
                        ...boardItem.containerItemMapping,
                        [props.containerId]: newContainerItemMap,
                    };

                    boardItem.items = newItems;
                    boardItem.containerItemMapping = newContainerItemMapping;
                });
            // catch any errors
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            {props.containerType === 'checklist' ? (
                <div></div>
            ) : (
                <>
                    <textarea
                        rows={1}
                        ref={textAreaRef}
                        name="content"
                        id="taskContent"
                        className="border-0 w-full mb-2 resize-none no-scrollbar bg-gray-50 text-gray-500 focus:ring-0 sm:text-md focus:outline-none placeholder:italic placeholder:text-gray-500/[0.5] focus:resize-y bg-inherit group overflow-wrap"
                        placeholder="Start writing..."
                        value={itemState.content}
                        onChange={handleUserInput}
                        onInput={handleTextAreaInput}
                    />
                    <div className="opacity-100 py-5 max-h-0 border-t border-gray-200 flex justify-between items-center">
                        <div className="flex">
                            <button
                                type="button"
                                className="w-5 h-5 rounded-md hover:bg-red-600 cursor-pointer text-gray-500 hover:text-gray-50 flex items-center justify-center transition-color duration-300 disabled:text-gray-500/[0.5] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                onClick={handleRemoveItem}
                            >
                                <AiOutlineDelete className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-shrink-0 gap-x-2">
                            <button
                                type="button"
                                className="w-5 h-5 rounded-md cursor-pointer text-gray-500 hover:text-gray-50 hover:bg-gray-500 flex items-center justify-center transition-color duration-300 disabled:text-gray-500/[0.5] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                style={{
                                    backgroundColor: itemState.badgeColor.value,
                                    color: itemState.badgeColor.textDark
                                        ? '#333'
                                        : '#fff',
                                }}
                                onClick={() =>
                                    setShowColorPicker(!showColorPicker)
                                }
                            >
                                <BsBrush className="w-4 h-4" />
                            </button>

                            <button
                                type="submit"
                                className="inline-flex items-center w-5 h-5 p-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600/[0.8] hover:bg-green hover:drop-shadow focus:outline-none focus:drop-shadow-lg transition-colors duration-1000 cursor-pointer"
                            >
                                <MdOutlineDone />
                            </button>
                        </div>
                        {children}
                    </div>
                </>
            )}
            {showColorPicker && (
                <div className="my-2">
                    <ColorPickerPalette handlePickColor={handlePickColor} />
                </div>
            )}
        </form>
    );
};

export default ItemForm;
