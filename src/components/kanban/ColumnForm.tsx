import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { BsCheck, BsChevronBarDown } from 'react-icons/bs';
import clsx from 'clsx';

type ColumnFormProps = {
    title: string;
};

const columnOptions = [
    { id: 1, name: 'Simple Tasks' },
    { id: 2, name: 'Checked Tasks' },
];

const taskSortingOptions = [
    { id: 1, name: 'Start' },
    { id: 2, name: 'End' },
    { id: 3, name: 'Remain' },
];

const ColumnForm = (props: ColumnFormProps) => {
    const [columnType, setColumnType] = useState(columnOptions[0]);
    const [taskSortingType, setTaskSortingType] = useState(
        taskSortingOptions[0]
    );
    const [title, setTitle] = useState(props.title ? props.title : '');

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setTitle(event.currentTarget.value);
    }

    return (
        <>
            <div className="block mb-3">
                {/* Column Title input */}
                <div className="w-full">
                    <label
                        htmlFor="Column"
                        className="block text-sm font-medium text-slate-600"
                    >
                        Title
                    </label>
                    <div className="flex mt-1">
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            placeholder={
                                props.title
                                    ? props.title
                                    : 'Add a column title.'
                            }
                            className="p-2 block outline-primary border-1 border-gray-300 w-full rounded-md  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-row gap-2">
                {/* Column type select. */}
                <div className="w-full">
                    <Listbox value={columnType} onChange={setColumnType}>
                        {({ open }) => (
                            <>
                                <Listbox.Label className="block text-sm font-medium text-gray-700">
                                    Type
                                </Listbox.Label>
                                <div className="relative mt-1">
                                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                        <span className="block truncate">
                                            {columnType?.name}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <BsChevronBarDown
                                                className="h-4 w-4 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>

                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {columnOptions.map((option) => (
                                                <Listbox.Option
                                                    key={option.id}
                                                    className={({ active }) =>
                                                        clsx(
                                                            active
                                                                ? 'text-white bg-indigo-600'
                                                                : 'text-gray-900',
                                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                                        )
                                                    }
                                                    value={option}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <span
                                                                className={clsx(
                                                                    selected
                                                                        ? 'font-semibold'
                                                                        : 'font-normal',
                                                                    'block truncate'
                                                                )}
                                                            >
                                                                {option.name}
                                                            </span>

                                                            {selected ? (
                                                                <span
                                                                    className={clsx(
                                                                        active
                                                                            ? 'text-white'
                                                                            : 'text-indigo-600',
                                                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                    )}
                                                                >
                                                                    <BsCheck
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Listbox>
                </div>
                <div className="w-full">
                    {/* Completed Task Sorting */}
                    <Listbox
                        value={taskSortingType}
                        onChange={setTaskSortingType}
                    >
                        {({ open }) => (
                            <>
                                <Listbox.Label className="block text-sm font-medium text-gray-700">
                                    Completed Task Sorting
                                </Listbox.Label>
                                <div className="relative mt-1">
                                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                        <span className="block truncate">
                                            {taskSortingType?.name}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <BsChevronBarDown
                                                className="h-4 w-4 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>

                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {taskSortingOptions.map(
                                                (option) => (
                                                    <Listbox.Option
                                                        key={option.id}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            clsx(
                                                                active
                                                                    ? 'text-white bg-indigo-600'
                                                                    : 'text-gray-900',
                                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                                            )
                                                        }
                                                        value={option}
                                                    >
                                                        {({
                                                            selected,
                                                            active,
                                                        }) => (
                                                            <>
                                                                <span
                                                                    className={clsx(
                                                                        selected
                                                                            ? 'font-semibold'
                                                                            : 'font-normal',
                                                                        'block truncate'
                                                                    )}
                                                                >
                                                                    {
                                                                        option.name
                                                                    }
                                                                </span>

                                                                {selected ? (
                                                                    <span
                                                                        className={clsx(
                                                                            active
                                                                                ? 'text-white'
                                                                                : 'text-indigo-600',
                                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                                        )}
                                                                    >
                                                                        <BsCheck
                                                                            className="h-5 w-5"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                )
                                            )}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Listbox>
                </div>
            </div>
        </>
    );
};

export default ColumnForm;
