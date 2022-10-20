import { BoardTag, BoardTags } from '@/core/types/sortableBoard';
import { useState } from 'react';
import Tag from '@/components/elements/Tag';
import TagForm from './TagForm';
import { TiDelete } from 'react-icons/ti';
import { BsChevronBarDown } from 'react-icons/bs';
import { Transition } from '@headlessui/react';
import { db } from '@/server/db';

type InlineBoardFormProps = {
    title: string;
    slug: string;
    tags: BoardTags;
    setShowForm: (value: boolean) => void;
};

const InlineBoardForm = ({ setShowForm, ...props }: InlineBoardFormProps) => {
    // controlled inputs for form fields, everything we're editing
    const [boardTitle, setBoardTitle] = useState<string>(props.title);
    const [boardTags, setBoardTags] = useState<BoardTags>(props.tags);

    const [showTagForm, setShowTagForm] = useState(false);

    function handleAddTag(boardTag: BoardTag) {
        let newTags = Array.from(boardTags);
        newTags.push(boardTag);
        setBoardTags(newTags);
        setShowTagForm(false);
    }

    function handleUserInput(event: React.ChangeEvent<HTMLInputElement>) {
        setBoardTitle(event.currentTarget.value);
    }

    function handleRemoveTag(boardTag: BoardTag) {
        let newTags = Array.from(boardTags);
        for (let i = 0; i < newTags.length; i++) {
            let tag = newTags[i];
            if (boardTag.text === tag?.text) {
                newTags.splice(i, 1);
            }
        }
        setBoardTags(newTags);
    }

    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        // update title, board tags, and updatedAt timestamp
        db.boards.update(props.slug, {
            title: boardTitle,
            tags: boardTags,
            updatedAt: new Date(Date.now()),
        });
        setShowForm(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="border-t border-b py-4 space-x-4 flex items-start justify-start">
                <div className="flex flex-col w-1/3">
                    <label
                        htmlFor="boardTitle"
                        className="block text-sm font-medium text-slate-600 after:content-['*'] after:ml-0.5 after:text-red-500"
                    >
                        Title
                    </label>

                    <div className="mt-1">
                        <input
                            type="text"
                            name="boardTitle"
                            id="boardTitle"
                            value={boardTitle}
                            placeholder={
                                boardTitle
                                    ? boardTitle
                                    : 'Give your board a title.'
                            }
                            className="peer p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                            onChange={handleUserInput}
                        />
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-2 mt-3">
                        {boardTags?.map(
                            (tag, index) =>
                                tag.text.length > 0 && (
                                    <div
                                        key={index}
                                        className="flex group"
                                        style={{}}
                                    >
                                        <span
                                            className="text-sm rounded-full px-2"
                                            style={{
                                                color: tag.backgroundColor
                                                    .textDark
                                                    ? '#333'
                                                    : '#fff',
                                                backgroundColor:
                                                    tag.backgroundColor.value,
                                            }}
                                        >
                                            {tag.text}
                                        </span>
                                        <div className="flex">
                                            <button
                                                type="button"
                                                name="delete-tag"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                onClick={() =>
                                                    handleRemoveTag(tag)
                                                }
                                            >
                                                <TiDelete className="text-slate-600" />
                                            </button>
                                        </div>
                                    </div>
                                )
                        )}
                    </div>
                </div>
                <div className="w-2/3 flex flex-col">
                    <button
                        type="button"
                        className="inline-flex items-start text-sm font-medium text-slate-600"
                        onClick={() => {
                            setShowTagForm(!showTagForm);
                        }}
                    >
                        Add some tags
                        <BsChevronBarDown
                            className="ml-2 h-4 w-4"
                            aria-hidden="true"
                        />
                    </button>
                    <Transition
                        show={showTagForm}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <TagForm
                            labels={false}
                            inLineInputs={true}
                            tagNextToSave={true}
                            handleAddTag={handleAddTag}
                        />
                    </Transition>
                </div>
            </div>
            <div className="flex flex-shrink-0 justify-end px-4 py-4">
                <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setShowForm(false)}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-primary-darker py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark-alt focus:outline-none transition-color duration-300 disabled:cursor-not-allowed invalid:border-pink-500"
                    disabled={boardTitle.length < 1 ? true : false}
                >
                    Save
                </button>
            </div>

            {/* <TagForm tagLabel="Add tags here" handleAddTag={handleAddTag} /> */}
        </form>
    );
};

export default InlineBoardForm;
