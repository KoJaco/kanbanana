import React from 'react';
import { resetDatabase } from '@/server/db';

type ResetDBFormProps = {
    handleCloseResetDBForm: () => void;
};

const ResetDBForm = ({ handleCloseResetDBForm }: ResetDBFormProps) => {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        resetDatabase();
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="border-t h-auto dark:border-slate-700 flex flex-col mt-4">
                <div>
                    <h1 className="mt-2 text-xl dark:text-slate-200 self-start w-full">
                        Are you sure?
                    </h1>
                    <p className="text-sm dark:text-slate-200/75">
                        Resetting your database will remove all of your saved
                        boards!
                    </p>
                </div>
                <div className="flex justify-between py-4">
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 dark:border-slate-500 py-2 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm dark:hover:bg-slate-800 hover:bg-gray-100  focus:outline-none"
                        onClick={handleCloseResetDBForm}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="rounded-md border border-transparent bg-primary-darker py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none transition-color duration-300 disabled:cursor-not-allowed invalid:border-pink-500"
                    >
                        Reset Database
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ResetDBForm;
