import { useState } from 'react';
import Tag from '@/components/elements/Tag';
import { BsBrush } from 'react-icons/bs';
import ColorPickerPalette from '@/components/pickers/ColorPickerPalette';
import { Color } from '@/core/types/kanbanBoard';

type TagFormProps = {
    text: string;
    color: Color;
};

const TagForm = (props: TagFormProps) => {
    const [tagText, setTagText] = useState(props.text);
    const [colorState, setColorState] = useState(props.color);
    const [showColorPicker, setShowColorPicker] = useState(false);

    function handleSetColor(color: Color) {
        setColorState(color);
    }

    // not a form per-say, just keeps track of inputs
    return (
        <div className="flex justify-between w-full gap-x-2">
            <div className="w-full">
                <div className="flex items-center space-x-2 justify-start">
                    <label
                        htmlFor="Tag"
                        className="block text-sm font-medium text-slate-600"
                    >
                        Tag:
                    </label>

                    <Tag text={tagText} color={colorState} />
                </div>

                <div className="mt-1">
                    <input
                        type="text"
                        name="text"
                        id="text"
                        value={tagText}
                        placeholder={
                            props.text ? props.text : 'Write your tag here.'
                        }
                        className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onChange={(event) =>
                            setTagText(event.currentTarget.value)
                        }
                    />
                </div>
            </div>

            <div className="">
                <label
                    // htmlFor="Tags"
                    htmlFor="tag-color"
                    className="block text-sm font-medium text-slate-600"
                >
                    Color
                </label>
                <button onClick={() => setShowColorPicker(!setShowColorPicker)}>
                    <BsBrush />
                </button>
                {showColorPicker && (
                    <div className="relative mt-1">
                        <ColorPickerPalette handlePickColor={handleSetColor} />
                    </div>
                )}
                {/* <div className="relative mt-1">
                    <input
                        type="color"
                        name="color"
                        value={tagState.colorValue}
                        id="color"
                        className="appearance-none bg-transparent block outline-primary border-1 border-gray-300 w-full h-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm focus:border-none"
                        onChange={handleInputChange}
                        style={{
                            backgroundColor: tagState.colorValue,
                        }}
                    />
                </div> */}
            </div>
        </div>
    );
};

export default TagForm;
