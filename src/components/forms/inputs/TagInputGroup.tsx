import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import Tag from '@/components/elements/Tag';
import { BsBrush } from 'react-icons/bs';
import ColorPicker from '@/components/pickers/ColorPicker';
import { useOnClickOutside } from '@/core/hooks/index';
import { IoMdAdd } from 'react-icons/io';
import { BoardTag, Color } from '@/core/types/sortableBoard';

type TagInputGroupProps = {
    tagLabel?: string;
    labels?: boolean;
    inLineInputs?: boolean;
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
                            className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-900 dark:border-slate-700 dark:focus:outline-none  dark:focus:ring-1 dark:focus:ring-slate-800 text-sm sm:text-md"
                            onChange={(event) =>
                                setTagText(
                                    event.currentTarget.value.toLowerCase()
                                )
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
                                <BsBrush className="w-5 h-5" />
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
                            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-1  border-gray-200 bg-emerald-500 text-gray-50 hover:border-green-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 drop-shadow disabled:cursor-not-allowed"
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
                            <span className="sr-only">Save column</span>
                            <IoMdAdd className="h-5 w-5 " aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="items-end text-sm group flex">
                    {props.tagNextToSave && (
                        <span className="">
                            <Tag text={tagText} backgroundColor={colorState} />
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};

export default TagInputGroup;
