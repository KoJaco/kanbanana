import { useState } from 'react';
import Tag from '@/components/elements/Tag';
import { BsBrush } from 'react-icons/bs';

type TagFormProps = {
    text: string;
    color: string;
};

const TagForm = (props: TagFormProps) => {
    const [tagState, setTagState] = useState({
        text: props.text,
        color: props.color,
    });

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        setTagState({ ...tagState, [event.currentTarget.name]: value });
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

                    <Tag text={tagState.text} color={tagState.color} />
                </div>

                <div className="mt-1">
                    <input
                        type="text"
                        name="text"
                        id="text"
                        value={tagState.text}
                        placeholder={
                            props.text ? props.text : 'Write your tag here.'
                        }
                        className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onChange={handleInputChange}
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
                <div className="relative mt-1">
                    <input
                        type="color"
                        name="color"
                        value={tagState.color}
                        id="color"
                        className="appearance-none bg-transparent block outline-primary border-1 border-gray-300 w-full h-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm focus:border-none"
                        onChange={handleInputChange}
                        style={{
                            backgroundColor: tagState.color,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TagForm;
