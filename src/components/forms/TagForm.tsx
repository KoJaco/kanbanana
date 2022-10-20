import { useState, useRef, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Tag from '@/components/elements/Tag';
import { BsBrush } from 'react-icons/bs';
import ColorPickerPalette from '@/components/pickers/ColorPickerPalette';
import { useOnClickOutside } from '@/core/hooks/index';
import { MdOutlineDone } from 'react-icons/md';
import { BoardTag, Color } from '@/core/types/sortableBoard';

type TagFormProps = {
    tagLabel?: string;
    labels?: boolean;
    inLineInputs?: boolean;
    tagNextToSave?: boolean;
    // can optionally be given a tag, for editing
    tag?: BoardTag;
    handleAddTag: (tag: BoardTag) => void;
};

const TagForm = (props: TagFormProps) => {
    const [tagText, setTagText] = useState('');
    const [colorState, setColorState] = useState({
        name: 'white',
        value: '#fff',
        textDark: true,
    });
    const [showColorPicker, setShowColorPicker] = useState(false);

    const colorPickerRef = useRef(null);
    useOnClickOutside(colorPickerRef, () => setShowColorPicker(false));

    function handleSetColor(color: Color) {
        setColorState(color);
    }
    function handleToggleColorPicker() {
        setShowColorPicker(!showColorPicker);
    }

    function renderSaveButton() {
        return (
            <>
                <button
                    type="button"
                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-1  border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary drop-shadow disabled:cursor-not-allowed"
                    onClick={() =>
                        props.handleAddTag({
                            text: tagText,
                            backgroundColor: colorState,
                        })
                    }
                    disabled={tagText.length === 0}
                >
                    <span className="sr-only">Add</span>
                    <MdOutlineDone className="h-5 w-5" aria-hidden="true" />
                </button>
                {tagText.length === 0 && (
                    <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Your tag cannot be empty.
                    </span>
                )}
            </>
        );
    }

    // not a form per-say, just keeps track of inputs
    return (
        <>
            <div className="flex justify-between w-full gap-x-2">
                <div className="w-full">
                    <div className="flex items-center space-x-2 justify-start">
                        {props.labels && (
                            <label
                                htmlFor="Tag"
                                className="block text-sm font-medium text-slate-600"
                            >
                                {props.tagLabel ? props.tagLabel : 'Tag:'}
                            </label>
                        )}

                        {!props.tagNextToSave && (
                            <Tag text={tagText} backgroundColor={colorState} />
                        )}
                    </div>

                    <div className="mt-1">
                        <input
                            type="text"
                            name="text"
                            id="text"
                            value={tagText}
                            placeholder="Write your tag here."
                            className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            onChange={(event) =>
                                setTagText(event.currentTarget.value)
                            }
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2 justify-start">
                        {props.labels && (
                            <label
                                htmlFor="tag-color"
                                className="block text-sm font-medium text-slate-600"
                            >
                                Color
                            </label>
                        )}
                    </div>
                    <div className="mt-1">
                        <button
                            type="button"
                            className="cursor-pointer rounded-full items-center p-1"
                            style={{
                                backgroundColor: colorState.value,
                                color: colorState.textDark ? '#333' : '#fff',
                            }}
                            onClick={handleToggleColorPicker}
                        >
                            <BsBrush
                                className="w-5 h-5"
                                style={{
                                    color: colorState.textDark
                                        ? '#333'
                                        : '#fff',
                                }}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="items-end text-sm group flex">
                    <button
                        type="button"
                        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-1  border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary drop-shadow disabled:cursor-not-allowed"
                        onClick={() =>
                            props.handleAddTag({
                                text: tagText,
                                backgroundColor: colorState,
                            })
                        }
                        disabled={tagText.length === 0}
                    >
                        <span className="sr-only">Add</span>
                        <MdOutlineDone className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {props.tagNextToSave && (
                        <span className="ml-4">
                            <Tag text={tagText} backgroundColor={colorState} />
                        </span>
                    )}
                    {tagText.length === 0 && (
                        <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Your tag cannot be empty.
                        </span>
                    )}
                </div>
            </div>

            {showColorPicker && (
                <div ref={colorPickerRef} className="relative mt-4">
                    <ColorPickerPalette handlePickColor={handleSetColor} />
                </div>
            )}
        </>
    );
};

export default TagForm;
