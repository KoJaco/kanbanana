import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import Tag from '@/components/elements/Tag';
import { BsBrush } from 'react-icons/bs';
import ColorPicker from '@/components/pickers/ColorPicker';
import { useOnClickOutside } from '@/core/hooks/index';
import { BiCheck } from 'react-icons/bi';
import { BoardTag, Color } from '@/core/types/sortableBoard';

type TagInputGroupProps = {
    tagLabel?: string;
    labels?: boolean;
    inlineInputs?: boolean;
    tagNextToSave?: boolean;
    tag?: BoardTag;
    tagIndex: number | null;
    addOrEdit?: 'add' | 'edit';
    handleAddOrUpdateTag: (tag: BoardTag, tagIndex?: number | null) => void;
};

const TagInputGroup = ({ addOrEdit = 'add', ...props }: TagInputGroupProps) => {
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

    const { theme } = useTheme();

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
        <>
            <div className="flex justify-between w-full gap-x-2">
                <div className="w-full">
                    <div className="flex items-center space-x-2 justify-start">
                        {props.labels && (
                            <label
                                htmlFor="tag"
                                className="block text-sm font-medium text-slate-600 dark:text-slate-100/[.75] after:content-['*'] after:ml-0.5 after:text-red-500"
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
                            id="tag"
                            value={tagText}
                            placeholder="Write your tag here."
                            className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-900 dark:border-slate-600 dark:focus:outline-none  dark:focus:ring-1 dark:focus:ring-slate-800 text-sm sm:text-md invalid:border-pink-300 dark:invalid:border-pink-500/50"
                            onChange={(event) =>
                                setTagText(
                                    event.currentTarget.value.toLowerCase()
                                )
                            }
                            required
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
                    <div className="mt-1" id="tag-color">
                        <ColorPicker
                            corner="topRight"
                            colorPaletteOptions="dark"
                            showColorPicker={showColorPicker}
                            handlePickColor={handleSetColor}
                        >
                            <button
                                type="button"
                                ref={excludedColorPickerRef}
                                className={`cursor-pointer rounded-full items-center p-1 ${
                                    colorState.name === 'transparent' &&
                                    'border-1 border-slate-500'
                                }`}
                                style={{
                                    backgroundColor: colorState.value,
                                    color: transparentTextColor(
                                        colorState.name,
                                        colorState.textDark
                                    ),
                                }}
                                onClick={handleToggleColorPicker}
                            >
                                <span className="sr-only">
                                    Pick a tag color
                                </span>
                                <BsBrush className="w-5 h-5" />
                            </button>
                        </ColorPicker>
                    </div>
                </div>
                {props.inlineInputs && (
                    <div className="flex items-center flex-col justify-center w-16">
                        {props.labels && (
                            <label
                                htmlFor="save-tag"
                                className="block text-sm font-medium text-slate-600 dark:text-slate-100/[.75]"
                            >
                                Save Tag
                            </label>
                        )}

                        <div className="mt-1" id="save-tag">
                            <button
                                type="button"
                                name="saveTag"
                                className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-1 border-emerald-600 dark:border-slate-800 bg-emerald-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 drop-shadow disabled:cursor-not-allowed disabled:opacity-50 hover:drop-shadow-lg transition-color duration-300 group"
                                onClick={() => {
                                    if (addOrEdit === 'edit') {
                                        // if update, i.e. given an index
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
                                <span className="sr-only">Save Tag</span>
                                <BiCheck
                                    className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-3">
                <div className="items-end text-sm group flex">
                    {props.tagNextToSave && (
                        <span className="">
                            <Tag text={tagText} backgroundColor={colorState} />
                        </span>
                    )}
                </div>
                {!props.inlineInputs && (
                    <button
                        type="button"
                        className="ml-auto mt-3 inline-flex w-full items-center justify-center py-1 px-2 gap-x-2 rounded-md border-1 border-emerald-600 dark:border-slate-800 bg-emerald-600 hover:bg-emerald-500 text-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 drop-shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-600 hover:drop-shadow-lg transition-color transition-all duration-300 group text-sm"
                        onClick={() => {
                            if (addOrEdit === 'edit') {
                                // if update, i.e. given an index
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
                        <span>Save Tag</span>
                        <BiCheck
                            className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                            aria-hidden="true"
                        />
                    </button>
                )}
            </div>
        </>
    );
};

export default TagInputGroup;
