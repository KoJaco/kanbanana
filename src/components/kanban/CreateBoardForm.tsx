import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useOnClickOutside } from '@/core/hooks/index';
import { useKanbanStore } from '@/stores/KanbanStore';
import { db } from '@/server/db';
import { stringToRandomSlug } from '@/core/utils/misc';

type CreateBoardFormProps = {
    setOpen: (value: boolean) => void;
};

const CreateBoardForm = ({ setOpen }: CreateBoardFormProps) => {
    // keep track of local state, upon save add the board to db.
    const [state, setState] = useState<{
        boardTitle: string;
        boardTag: string;
        formErrors: {
            boardTitle: string;
        };
        boardTitleValid: boolean;
        formValid: boolean;
    }>({
        boardTitle: '',
        boardTag: '',
        formErrors: { boardTitle: '' },
        boardTitleValid: false,
        formValid: false,
    });

    // Zustand store state
    const { setCurrentBoardSlug } = useKanbanStore();

    const router = useRouter();

    const { increaseBoardCount } = useKanbanStore();

    const createBoardFormRef = useRef(null);
    useOnClickOutside(createBoardFormRef, () => setOpen(false));

    function handleUserInput(event: React.ChangeEvent<HTMLInputElement>) {
        const name = event.currentTarget.name;
        const value = event.currentTarget.value;

        setState({
            ...state,
            [name]: value,
        });
    }

    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        createBoard(state.boardTitle, state.boardTag);
        increaseBoardCount();
        setOpen(false);
    }

    // function validateField(name: string, value: string) {
    //     let fieldValidationErrors = state.formErrors;
    //     let boardTitleValid = state.boardTitleValid;
    //     // let boardTagValid = state.boardTagValid;

    //     switch (name) {
    //         case 'boardTitle':
    //             boardTitleValid = value.length > 0;
    //             fieldValidationErrors.boardTitle = boardTitleValid
    //                 ? ''
    //                 : 'invalid';
    //             break;
    //         // case 'boardTag':
    //         //     boardTagValid = value.length > 0;
    //         //     fieldValidationErrors.boardTag = boardTagValid ? '' : 'invalid';
    //         //     break;
    //     }

    //     setState({
    //         ...state,
    //         formErrors: fieldValidationErrors,
    //         boardTitleValid: boardTitleValid,
    //     });
    //     validateForm;
    // }

    // function validateForm() {
    //     setState({
    //         ...state,
    //         formValid: state.boardTitleValid,
    //     });
    // }

    const createBoard = async (title: string, tag: string) => {
        const slug = stringToRandomSlug(title);
        try {
            db.addBoard(title, tag, slug);
            console.info(
                `A new board was created with title: ${title} and tag: ${tag}`
            );
            setCurrentBoardSlug(slug);
            // push to board detail endpoint
            router
                .push(`/boards/${slug}`, undefined, { shallow: false })
                .then(() => router.reload());
        } catch (error) {
            console.error(`Failed to add board`);
            // push to fail page...
            router.push(`/`);
        }
    };

    // const FormErrors = (formErrors: {
    //     boardTitle: string;
    //     boardTag: string;
    //     columnTitles: Set<string>;
    // }) => {
    //     // stateless functional component, iterates through form errors and displays them.
    //     return (
    //         <div>
    //             {Object.keys(formErrors).map((fieldName, index) => {
    //                 if (formErrors[fieldName].length > 0) {
    //                     return (
    //                         <p key={index}>
    //                             {fieldName} {formErrors[fieldName]}
    //                         </p>
    //                     );
    //                 } else {
    //                     return '';
    //                 }
    //             })}
    //         </div>
    //     );
    // };

    return (
        <form
            className="flex min-h-full items-center justify-center p-4 text-center"
            onSubmit={handleSubmit}
        >
            <div
                ref={createBoardFormRef}
                className="flex items-center p-10 bg-gray-50 rounded-lg drop-shadow-lg w-1/2"
            >
                <div className="mt-1 flex flex-col w-full">
                    <div className="flex mb-10">
                        <h1 className="text-2xl text-gray-700">
                            Create a New Board
                        </h1>
                    </div>
                    <div className="grid grid-cols-5">
                        <div className="col-span-3">
                            <label
                                htmlFor="boardTitle"
                                className="block text-xl text-left font-medium text-gray-500 mb-2"
                            >
                                Title *
                            </label>
                            {/* control input, MUST enter title for form to be submitted. */}
                            <input
                                type="text"
                                name="boardTitle"
                                id="boardTitle"
                                autoComplete="boardTitle"
                                className="block w-full rounded-md border-gray-300 shadow-sm outline-none focus:drop-shadow-lg transition-all duration-500 sm:text-xl p-4"
                                value={state.boardTitle}
                                onChange={handleUserInput}
                            />
                        </div>
                        <div className="col-span-2 ml-4">
                            <label
                                htmlFor="boardTag"
                                className="block text-xl text-left font-medium text-gray-500 mb-2"
                            >
                                Tag
                            </label>
                            <input
                                type="text"
                                name="boardTag"
                                id="boardTag"
                                autoComplete="boardTag"
                                className="block w-full rounded-md outline-none border-gray-300 shadow-sm focus:drop-shadow-lg transition-all duration-500 sm:text-xl p-4"
                                value={state.boardTag}
                                onChange={handleUserInput}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row justify-end mt-10">
                        {/* <button
                            className="px-4 py-2 bg-gradient-to-r from-slate-300 to-slate-400 rounded-lg text-gray-50 drop-shadow-md transition-transform hover:scale-105 duration-500"
                            onClick={() => {}}
                        >
                            Cancel
                        </button> */}
                        <div className="group items-end content-end inline-flex">
                            {state.boardTitle.length < 1 && (
                                <span className="font-light italic text-sm mr-4 opacity-0 group-hover:opacity-100 transition-color duration-500">
                                    Title cannot be empty
                                </span>
                            )}

                            <button
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-gray-50 drop-shadow-md transition-transform hover:scale-105 duration-500 disabled:bg-green-600/[0.5] disabled:cursor-not-allowed"
                                type="submit"
                                disabled={
                                    state.boardTitle.length < 1 ? true : false
                                }
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CreateBoardForm;
