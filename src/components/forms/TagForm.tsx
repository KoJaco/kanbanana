import { useState, useRef, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Tag from '@/components/elements/Tag';
import { BsBrush } from 'react-icons/bs';
import ColorPickerPalette from '@/components/pickers/ColorPickerPalette';
import ColorPicker from '@/components/pickers/ColorPicker';
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
    tagIndex: number | null;
    addOrEdit?: 'add' | 'edit';
    handleAddOrUpdateTag: (tag: BoardTag, tagIndex?: number | null) => void;
};

const TagForm = ({ addOrEdit = 'add', ...props }: TagFormProps) => {
    const [tagText, setTagText] = useState(props.tag ? props.tag.text : '');
    const [colorState, setColorState] = useState(
        props.tag
            ? props.tag.backgroundColor
            : {
                  name: 'transparent',
                  value: '#FFFFFF00',
                  textDark: true,
              }
    );

    const [showColorPicker, setShowColorPicker] = useState(false);

    const colorPickerRef = useRef(null);
    const excludedColorPickerRef = useRef(null);
    useOnClickOutside(
        colorPickerRef,
        () => setShowColorPicker(false),
        excludedColorPickerRef
    );

    function handleSetColor(color: Color) {
        setColorState(color);
    }
    function handleToggleColorPicker() {
        setShowColorPicker(!showColorPicker);
    }

    // not a form, just keeps track of inputs
    return (
        <>
            <div className="flex justify-between w-full gap-x-2">
                <div className="w-full">
                    <div className="flex items-center space-x-2 justify-start">
                        {props.labels && (
                            <label
                                htmlFor="Tag"
                                className="block text-sm font-medium text-slate-600 dark:text-slate-100/[.75]"
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
                            className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-900 dark:border-slate-700 dark:focus:outline-none  dark:focus:ring-1 dark:focus:ring-slate-800"
                            onChange={(event) =>
                                setTagText(event.currentTarget.value)
                            }
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-12">
                    <div className="flex items-center space-x-2 justify-start">
                        {props.labels && (
                            <label
                                htmlFor="tag-color"
                                className="block text-sm font-medium text-slate-600 dark:text-slate-100/[.75]"
                            >
                                Color
                            </label>
                        )}
                    </div>
                    <div className="mt-1">
                        <ColorPicker
                            corner="topRight"
                            colorPaletteOptions="dark"
                            showColorPicker={showColorPicker}
                            handlePickColor={handleSetColor}
                        >
                            <button
                                type="button"
                                ref={excludedColorPickerRef}
                                className="cursor-pointer rounded-full items-center p-1"
                                style={{
                                    backgroundColor:
                                        colorState.value === '#FFFFFF00'
                                            ? '#CDCDCD'
                                            : colorState.value,
                                    color: colorState.textDark
                                        ? '#333'
                                        : '#fff',
                                }}
                                onClick={handleToggleColorPicker}
                            >
                                <BsBrush
                                    className="w-5 h-5"

                                    // style={{
                                    //     color: colorState.textDark
                                    //         ? '#333'
                                    //         : '#fff',
                                    // }}
                                />
                            </button>
                        </ColorPicker>
                    </div>
                </div>
                <div className="flex items-center flex-col justify-center w-12">
                    {props.labels && (
                        <label
                            htmlFor="tag-color"
                            className="block text-sm font-medium text-slate-600 dark:text-slate-100/[.75]"
                        >
                            Save
                        </label>
                    )}

                    <div className="mt-1">
                        <button
                            type="button"
                            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-1  border-gray-200 bg-green-500 text-gray-50 hover:border-green-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500  drop-shadow disabled:cursor-not-allowed"
                            onClick={() => {
                                console.log('saved');
                                console.log(props.tagIndex);
                                if (addOrEdit === 'edit') {
                                    console.log('update hit');
                                    // if update, i.e. given an index
                                    props.handleAddOrUpdateTag(
                                        {
                                            text: tagText,
                                            backgroundColor: colorState,
                                        },
                                        props.tagIndex
                                    );
                                } else {
                                    console.log('add hit');

                                    props.handleAddOrUpdateTag({
                                        text: tagText,
                                        backgroundColor: colorState,
                                    });
                                }
                            }}
                            disabled={tagText.length === 0}
                        >
                            <span className="sr-only">Save column</span>
                            <MdOutlineDone
                                className="h-5 w-5 "
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="items-end text-sm group flex">
                    {/* <button
                        type="button"
                        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-1  border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary drop-shadow disabled:cursor-not-allowed"
                        onClick={() => {
                            console.log('hit');

                            if (props.tagIndex !== null) {
                                props.handleAddOrUpdateTag(
                                    {
                                        text: tagText,
                                        backgroundColor: colorState,
                                    },
                                    props.tagIndex
                                );
                            } else {
                                props.handleAddOrUpdateTag({
                                    text: tagText,
                                    backgroundColor: colorState,
                                });
                            }
                        }}
                        disabled={tagText.length === 0}
                    >
                        <span className="sr-only">Add</span>
                        <MdOutlineDone className="h-5 w-5" aria-hidden="true" />
                    </button> */}
                    {props.tagNextToSave && (
                        <span className="">
                            <Tag text={tagText} backgroundColor={colorState} />
                        </span>
                    )}
                    {/* {tagText.length === 0 && (
                        <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:text-slate-100">
                            Your tag cannot be empty.
                        </span>
                    )} */}
                </div>
            </div>

            {/* {showColorPicker && (
                <div ref={colorPickerRef} className="relative mt-4">
                    <ColorPickerPalette handlePickColor={handleSetColor} />
                </div>
            )} */}
        </>
    );
};

export default TagForm;
