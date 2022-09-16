import React, { useRef, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { useKanbanStore } from '@/stores/KanbanStore';
import { db } from '@/server/db';

import { useOnClickOutside, useOnClickInsideOnly } from '@/core/hooks';
import { TTask, Tasks, TColumn } from '@/core/types/kanbanBoard';
import { RgbaColorPicker } from 'react-colorful';

type TaskFormProps = {
    id: number;
    columnId: string;
    taskCount: number;
    color: { r: number; g: number; b: number; a: number };
    previousTaskContent: string;
    currentBoardSlug: string;
    setIsEditing: (value: boolean) => void;
    resetColor: () => void;
    children: JSX.Element;
};

const TaskForm = ({ id, setIsEditing, taskCount, ...props }: TaskFormProps) => {
    const [taskContent, setTaskContent] = useState<string>(
        props.previousTaskContent
    );

    // Zustand global state
    const { increaseTaskCount } = useKanbanStore();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    function handleTextAreaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${e.target.scrollHeight}px`;
        }
    }

    function handleTaskContentChange(
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) {
        setTaskContent(event.currentTarget.value);
    }

    // dispatch task save and content back to reducer
    // async:: generate new task object, save to BoardState, write to DB.
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const currentTaskId = `task-${id}`;

        db.boards
            .where('slug')
            .equals(props.currentBoardSlug)
            .modify((item: any) => {
                item.tasks[currentTaskId].content = taskContent;
                item.tasks[currentTaskId].color = props.color;
            });
        increaseTaskCount();

        setIsEditing(false);
    }

    // server/client handlers

    function handleRemoveTask() {
        const removingTaskId = `task-${id}`;
        let newTasks: Tasks = {};
        let newTaskIds: string[] = [];

        // need to copy tasks and then remove index while updating all task keys / ids.
        db.transaction('rw', db.boards, async () => {
            // delete count should be 1, catch error
            let deleteCount = await db.boards
                .where('slug')
                .equals(props.currentBoardSlug)
                .modify((item: any) => {
                    // handle deleting task from tasks object and updating keys and ids accordingly.
                    const oldTasks: TTask[] = Object.values(item.tasks);

                    for (let i = 0; i < oldTasks.length; i++) {
                        // assign each task a new id
                        let task = oldTasks[i]!;
                        let idCheck = task.id;
                        if (idCheck !== id) {
                            let taskKey = `task-${task.id}`;
                            newTasks[taskKey] = task;
                        }
                    }

                    console.log(newTasks);
                    item.tasks = newTasks;

                    // handle updating taskIds in column object.
                    newTaskIds = Array.from(
                        item.columns[props.columnId].taskIds
                    );

                    for (let i = 0; i < newTaskIds.length; i++) {
                        let taskId = newTaskIds[i];
                        if (taskId === removingTaskId) newTaskIds.splice(i, 1);
                    }
                    item.columns[props.columnId].taskIds = newTaskIds;
                });
            if (deleteCount === 1) {
                console.log('Deleted task ' + removingTaskId);
            }
        });
        setIsEditing(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                rows={1}
                ref={textAreaRef}
                name="taskContent"
                id="taskContent"
                className="border-0 w-full mb-2 resize-none no-scrollbar bg-gray-50 text-gray-500 focus:ring-0 sm:text-md focus:outline-none placeholder:italic placeholder:text-gray-500/[0.5] focus:resize-y bg-inherit group overflow-wrap"
                placeholder="Start writing..."
                value={taskContent}
                onChange={handleTaskContentChange}
                onInput={handleTextAreaInput}
            />
            <div className="opacity-100 py-5 max-h-0 border-t border-gray-200 flex justify-between items-center">
                <div className="flex">
                    <button
                        type="button"
                        className="w-5 h-5 rounded-md hover:bg-red-600 cursor-pointer text-gray-500 hover:text-gray-50 flex items-center justify-center transition-color duration-300 disabled:text-gray-500/[0.5] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        disabled={taskCount === 1 ? true : false}
                        onClick={handleRemoveTask}
                    >
                        <AiOutlineDelete className="w-4 h-4" />
                    </button>
                </div>
                {props.children}
                <div className="flex-shrink-0">
                    <input
                        type="submit"
                        value="Save"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600/[0.8] hover:bg-green hover:drop-shadow focus:outline-none focus:drop-shadow-lg transition-colors duration-1000 cursor-pointer"
                    />
                </div>
            </div>
        </form>
    );
};

export default TaskForm;
