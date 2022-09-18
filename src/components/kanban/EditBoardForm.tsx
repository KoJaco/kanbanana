/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    MdClose,
    MdOutlineLink,
    MdOutlineAdd,
    MdQuestionAnswer,
} from 'react-icons/md';

const team = [
    {
        name: 'Tom Cook',
        email: 'tom.cook@example.com',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Whitney Francis',
        email: 'whitney.francis@example.com',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Leonard Krasner',
        email: 'leonard.krasner@example.com',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Floyd Miles',
        email: 'floy.dmiles@example.com',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Emily Selman',
        email: 'emily.selman@example.com',
        href: '#',
        imageUrl:
            'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
];

type EditBoardFormProps = {
    showEditBoardForm: boolean;
    setShowEditBoardForm: (value: boolean) => void;
};

const EditBoardForm = ({
    setShowEditBoardForm,
    ...props
}: EditBoardFormProps) => {
    // TODO: Finish this component with full data, should be able to add tags and columns here too.
    return (
        <Transition.Root show={props.showEditBoardForm} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                onClose={setShowEditBoardForm}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                                        <div className="h-0 flex-1 overflow-y-auto">
                                            <div className="bg-offset-bg py-6 px-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <Dialog.Title className="text-lg font-medium text-slate-600">
                                                        New Board
                                                    </Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md transparent text-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                            onClick={() =>
                                                                setShowEditBoardForm(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <span className="sr-only">
                                                                Close panel
                                                            </span>
                                                            <MdClose
                                                                className="h-6 w-6"
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-sm text-slate-500">
                                                        Fill out the information
                                                        below and do not forget
                                                        to save!
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="divide-y divide-gray-200 px-4 sm:px-6">
                                                    <div className="space-y-6 pt-6 pb-5">
                                                        <div>
                                                            <label
                                                                htmlFor="project-name"
                                                                className="block text-sm font-medium text-slate-600"
                                                            >
                                                                Board Title
                                                            </label>
                                                            <div className="mt-1">
                                                                <input
                                                                    type="text"
                                                                    name="project-name"
                                                                    id="project-name"
                                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label
                                                                htmlFor="Tags"
                                                                className="block text-sm font-medium text-slate-600"
                                                            >
                                                                Tags
                                                            </label>
                                                            <div className="mt-1">
                                                                <input
                                                                    type="text"
                                                                    name="project-name"
                                                                    id="project-name"
                                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="mt-2">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                                    >
                                                                        <span className="sr-only">
                                                                            Add
                                                                            team
                                                                            member
                                                                        </span>
                                                                        <MdOutlineAdd
                                                                            className="h-5 w-5"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <fieldset>
                                                            <legend className="text-sm font-medium text-gray-900">
                                                                Privacy
                                                            </legend>
                                                            <div className="mt-2 space-y-5">
                                                                <div className="relative flex items-start">
                                                                    <div className="absolute flex h-5 items-center">
                                                                        <input
                                                                            id="privacy-public"
                                                                            name="privacy"
                                                                            aria-describedby="privacy-public-description"
                                                                            type="radio"
                                                                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            defaultChecked
                                                                        />
                                                                    </div>
                                                                    <div className="pl-7 text-sm">
                                                                        <label
                                                                            htmlFor="privacy-public"
                                                                            className="font-medium text-gray-900"
                                                                        >
                                                                            Public
                                                                            access
                                                                        </label>
                                                                        <p
                                                                            id="privacy-public-description"
                                                                            className="text-gray-500"
                                                                        >
                                                                            Everyone
                                                                            with
                                                                            the
                                                                            link
                                                                            will
                                                                            see
                                                                            this
                                                                            project.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="relative flex items-start">
                                                                        <div className="absolute flex h-5 items-center">
                                                                            <input
                                                                                id="privacy-private-to-project"
                                                                                name="privacy"
                                                                                aria-describedby="privacy-private-to-project-description"
                                                                                type="radio"
                                                                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            />
                                                                        </div>
                                                                        <div className="pl-7 text-sm">
                                                                            <label
                                                                                htmlFor="privacy-private-to-project"
                                                                                className="font-medium text-gray-900"
                                                                            >
                                                                                Private
                                                                                to
                                                                                project
                                                                                members
                                                                            </label>
                                                                            <p
                                                                                id="privacy-private-to-project-description"
                                                                                className="text-gray-500"
                                                                            >
                                                                                Only
                                                                                members
                                                                                of
                                                                                this
                                                                                project
                                                                                would
                                                                                be
                                                                                able
                                                                                to
                                                                                access.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="relative flex items-start">
                                                                        <div className="absolute flex h-5 items-center">
                                                                            <input
                                                                                id="privacy-private"
                                                                                name="privacy"
                                                                                aria-describedby="privacy-private-to-project-description"
                                                                                type="radio"
                                                                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            />
                                                                        </div>
                                                                        <div className="pl-7 text-sm">
                                                                            <label
                                                                                htmlFor="privacy-private"
                                                                                className="font-medium text-gray-900"
                                                                            >
                                                                                Private
                                                                                to
                                                                                you
                                                                            </label>
                                                                            <p
                                                                                id="privacy-private-description"
                                                                                className="text-gray-500"
                                                                            >
                                                                                You
                                                                                are
                                                                                the
                                                                                only
                                                                                one
                                                                                able
                                                                                to
                                                                                access
                                                                                this
                                                                                project.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </fieldset>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-shrink-0 justify-end px-4 py-4">
                                            <button
                                                type="button"
                                                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                onClick={() =>
                                                    setShowEditBoardForm(false)
                                                }
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-primary-darker py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark-alt focus:outline-none transition-color duration-300"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default EditBoardForm;
