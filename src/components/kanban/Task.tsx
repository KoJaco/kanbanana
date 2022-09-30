import React, { useRef, useState, Fragment } from 'react';
import ArrowIcon from '@/components/elements/ArrowIcon';
import { useKanbanStore } from '@/stores/KanbanStore';
import { RgbaColorPicker } from 'react-colorful';
import { db } from '@/server/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { MdOutlineEdit } from 'react-icons/md';
import { useOnClickOutside, useOnClickInsideOnly } from '@/core/hooks';
import { parseColorToString } from '@/core/utils/misc';

import { TTask, Tasks, Color } from '@/core/types/kanbanBoard';
import BaseModal from '@/components/modals/BaseModal';
import TaskForm from './TaskForm';

import clsx from 'clsx';

type TaskProps = {
    children?: JSX.Element;
    id: number;
    columnId: string;
    color: Color;
    taskCount: number;
    content: string;
    editing: boolean;
};

const Task = ({ id, editing = false, ...props }: TaskProps) => {
    // TODO: add edit button instead of clicking inside the task, add a nice transition for displaying this form using headlessui.

    // * STATE
    // local state and controlled inputs
    // Controlled text area input, save button submits the form and affects DB + boardState
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Zustand global state
    const { taskCount, currentBoardSlug } = useKanbanStore();

    // * HOOKS and REFS

    const isEditingRef = useRef<HTMLDivElement>(null);
    useOnClickInsideOnly(isEditingRef, () => setIsEditing(true));
    useOnClickOutside(isEditingRef, () => setIsEditing(false));

    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [color, setColor] = useState<Color>(props.color);

    const colorPickerRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(colorPickerRef, () => setShowColorPicker(false));

    // dispatch task save and content back
    // async:: generate new task object, save to BoardState, write to DB.
    function handleSaveColor() {
        const currentTaskId = `task-${id}`;

        db.boards
            .where('slug')
            .equals(currentBoardSlug)
            .modify((item: any) => {
                item.tasks[currentTaskId].color = color;
            });
        setShowColorPicker(false);
        setIsEditing(false);
    }

    function handleColorReset() {
        // set color back to props color
        setColor(props.color);
    }

    function handleMoveColumnTask(direction: string) {
        const currentTaskId = `task-${id}`;
        const currentColumnId = props.columnId;
        let newColumnId: string;

        db.boards
            .where('slug')
            .equals(currentBoardSlug)
            .modify((item: any) => {
                item.tasks[currentTaskId];
            });

        switch (direction) {
            case 'up':
                break;
            case 'down':
                break;
            case 'left':
                break;
            case 'right':
                break;
        }
    }

    return (
        <div
            ref={isEditingRef}
            className="w-full py-1 px-2 border-[1.5px] border-gray-300 rounded-sm bg-gray-50  focus-within:border-gray-500 focus-within:ring-0.5 focus-within:ring-slate-500 focus-within:drop-shadow group h-full max-w-auto"
        >
            <BaseModal open={showColorPicker} setOpen={setShowColorPicker}>
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <div
                        className="bg-gray-50 py-8 px-12 rounded-sm"
                        ref={colorPickerRef}
                    >
                        <div className="flex justify-between items-center pb-2 mb-4 text-slate-600 text-xl font-regular">
                            <h1>Color Picker</h1>
                            <div className="flex justify-end py-2">
                                <button
                                    type="button"
                                    value="Save"
                                    className="inline-flex justify-end px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600/[0.8] hover:bg-green hover:drop-shadow focus:outline-none focus:drop-shadow-lg transition-colors duration-1000 cursor-pointer"
                                    onClick={handleSaveColor}
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="grid-col">
                                {/* <RgbaColorPicker
                                    className="w-28 h-28 cursor-pointer "
                                    color={color}
                                    onChange={setColor}
                                ></RgbaColorPicker> */}
                            </div>
                            {/* <div
                                className="grid-col rounded-lg border-1 drop-shadow-sm"
                                style={{
                                    backgroundColor: parseColorToString(color),
                                }}
                            ></div> */}
                        </div>
                    </div>
                </div>
            </BaseModal>
            <label htmlFor="description" className="sr-only">
                Description
            </label>

            <div className="flex flex-row justify-between w-full items-center pt-1 mb-4">
                <div className="flex">
                    <button
                        className={clsx(
                            'rounded-md border-1 border-gray-300 p-1 w-4 h-4',
                            showColorPicker &&
                                'scale-110 transition-transform duration-300 drop-shadow-lg '
                        )}
                        // style={{
                        //     backgroundColor: parseColorToString(props.color),
                        // }}
                        onClick={() => setShowColorPicker(true)}
                        // disable when selecting color, let useOnClickOutside handle close
                        // disabled={showColorPicker ? true : false}
                    >
                        {/* colour picker component, fixed to bottom of screen */}
                    </button>
                </div>

                {/* insert drag handle, didn't want to drill props further with react-dnd*/}
                <div className="flex items-center gap-3 opacity-100">
                    {/* Is this preferred? rather than ref. */}
                    {/* <button
                        className="opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => {
                            setIsEditing((prev) => !prev);
                        }}
                    >
                        <MdOutlineEdit />
                    </button> */}
                    {props.children}
                </div>
            </div>

            {isEditing ? (
                <>
                    <TaskForm
                        id={id}
                        columnId={props.columnId}
                        taskCount={taskCount}
                        color={props.color}
                        previousTaskContent={props.content}
                        currentBoardSlug={currentBoardSlug}
                        showForm={isEditing}
                        setIsEditing={setIsEditing}
                        resetColor={handleColorReset}
                    >
                        <>
                            <div className="flex opacity-0 group-hover:opacity-100 space-x-2 transition-opacity duration-300">
                                <ArrowIcon direction="left" disabled={false} />
                                <ArrowIcon direction="right" disabled={false} />
                                <ArrowIcon direction="up" disabled={false} />
                                <ArrowIcon direction="down" disabled={false} />
                            </div>
                        </>
                    </TaskForm>
                </>
            ) : (
                <div className="whitespace-normal pb-2 text-slate-600 break-all">
                    {props.content ? props.content : '...'}
                </div>
            )}
        </div>
    );
};

export default Task;
