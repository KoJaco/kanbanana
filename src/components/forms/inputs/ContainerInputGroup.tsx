import { Fragment, useState, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { BsBrush, BsCheck, BsChevronBarDown } from 'react-icons/bs';
import {
    TContainer,
    Color,
    UniqueIdentifier,
} from '@/core/types/sortableBoard';
import clsx from 'clsx';
import { useOnClickOutside } from '@/core/hooks/index';
import ColorPicker from '@/components/pickers/ColorPicker';
import Tooltip from '@/components/tooltip/Tooltip';

type ContainerInputGroupProps = {
    id: UniqueIdentifier;
    // can optionally be given a container to edit.
    container?: TContainer;
    handleAddOrUpdateContainer: (container: TContainer) => void;
    handleRemoveContainer?: () => void;
};

const containerOptions: {
    id: number;
    key: 'simple' | 'checklist';
    name: string;
}[] = [
    { id: 1, key: 'simple', name: 'Simple Items' },
    { id: 2, key: 'checklist', name: 'Checked Items' },
];

const itemSortingOptions: {
    id: number;
    key: 'start' | 'end' | 'noChange' | 'remove';
    name: string;
}[] = [
    { id: 1, key: 'start', name: 'Start' },
    { id: 2, key: 'end', name: 'End' },
    { id: 3, key: 'noChange', name: 'No Change' },
    { id: 4, key: 'remove', name: 'Remove' },
];

const ContainerInputGroup = ({
    handleAddOrUpdateContainer,
    ...props
}: ContainerInputGroupProps) => {
    const [title, setTitle] = useState(
        props.container === undefined ? '' : props.container.title
    );
    const [containerType, setContainerType] = useState(
        props.container === undefined
            ? containerOptions[0]
            : containerOptions[findContainerTypeIndex(props.container.type)]
    );
    const [itemSortingType, setItemSortingType] = useState(
        props.container === undefined
            ? itemSortingOptions[0]
            : itemSortingOptions[
                  findItemSortingTypeIndex(props.container.completedItemOrder)
              ]
    );

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [badgeColor, setBadgeColor] = useState<Color>(
        props.container === undefined
            ? {
                  name: 'transparent',
                  value: '#FFFFFF00',
                  textDark: true,
              }
            : props.container.badgeColor
    );

    const colorPickerRef = useRef(null);
    const excludedColorPickerRef = useRef(null);

    useOnClickOutside(
        colorPickerRef,
        () => setShowColorPicker(false),
        excludedColorPickerRef
    );

    function handleSetBadgeColor(color: Color) {
        setBadgeColor(color);
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setTitle(event.currentTarget.value);
    }
    function handleToggleColorPicker() {
        setShowColorPicker(!showColorPicker);
    }

    function findContainerTypeIndex(type: 'simple' | 'checklist') {
        // returns the index of the matching container options, else returns 0
        for (let i = 0; i < containerOptions.length; i++) {
            let option = containerOptions[i];
            if (option?.key === type) {
                return i;
            }
        }
        return 0;
    }
    function findItemSortingTypeIndex(
        type: 'start' | 'end' | 'noChange' | 'remove'
    ) {
        // returns the index of the matching container options, else returns 0
        for (let i = 0; i < itemSortingOptions.length; i++) {
            let option = itemSortingOptions[i];
            if (option?.key === type) {
                return i;
            }
        }
        return 0;
    }

    // need to conditionally change styling using this const, as HeadlessUi Listbox doesn't seem to pass down disabled?
    const sortingOptionsDisabled =
        containerType?.name === 'Simple Items' ? true : false;

    return (
        <>
            <div id={`${props.id}`} className="pb-4">
                <div className="flex justify-between w-full gap-x-2 mb-3 ">
                    {/* Container Title input */}
                    <div className="w-full">
                        <label
                            htmlFor="Container"
                            className="block text-sm font-medium text-slate-600 dark:text-slate-50 after:content-['*'] after:ml-0.5 after:text-red-500"
                        >
                            Title
                        </label>
                        <div className="flex mt-1">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={title}
                                placeholder="Add a column title."
                                className="p-2 block outline-primary border-1 border-gray-300 dark:border-slate-700 w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm invalid:border-pink-300 dark:bg-slate-900 dark:focus:ring-1 dark:focus:ring-slate-700 dark:focus:border-slate-800 dark:focus:outline-none text-sm sm:text-md"
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center space-x-2 justify-start">
                            <label
                                htmlFor="tag-color"
                                className="block text-sm font-medium text-slate-600 dark:text-slate-50"
                            >
                                Color
                            </label>
                        </div>

                        <div className="mt-1">
                            <ColorPicker
                                corner="topRight"
                                popoverDirection="down"
                                colorPaletteOptions="minimal"
                                showColorPicker={showColorPicker}
                                handlePickColor={handleSetBadgeColor}
                            >
                                <button
                                    type="button"
                                    ref={excludedColorPickerRef}
                                    className="cursor-pointer rounded-full items-center p-1"
                                    style={{
                                        backgroundColor: badgeColor.value,
                                        color: badgeColor.textDark
                                            ? '#555'
                                            : '#fff',
                                    }}
                                    onClick={handleToggleColorPicker}
                                >
                                    <BsBrush
                                        className="w-5 h-5"
                                        style={{
                                            color: badgeColor.textDark
                                                ? '#555'
                                                : '#fff',
                                        }}
                                    />
                                </button>
                            </ColorPicker>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-2">
                    {/* Container type select. */}
                    <div className="w-full">
                        <Listbox
                            value={containerType}
                            onChange={setContainerType}
                        >
                            {({ open }) => (
                                <>
                                    <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-slate-50">
                                        Type
                                    </Listbox.Label>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-1 dark:focus:ring-slate-700 dark:focus:border-slate-800 dark:focus:outline-none sm:text-sm">
                                            <span className="block truncate text-sm sm:text-md">
                                                {containerType?.name}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <BsChevronBarDown
                                                    className="h-4 w-4 text-gray-400 dark:text-slate-50"
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
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 border dark:border-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {containerOptions.map(
                                                    (option) => (
                                                        <Listbox.Option
                                                            key={option.id}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                clsx(
                                                                    active
                                                                        ? 'text-gray-50 bg-dark-alt-bg dark:bg-offset-bg dark:text-slate-900 text-sm sm:text-md'
                                                                        : 'text-gray-900 dark:text-gray-50',
                                                                    'relative cursor-default select-none py-2 pl-3 pr-9 text-sm sm:text-md'
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
                                                                                    : 'text-slate-900 dark:text-gray-50',
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
                    <div className="w-full">
                        {/* Completed Item Sorting */}
                        <Listbox
                            value={itemSortingType}
                            onChange={setItemSortingType}
                            disabled={
                                containerType?.name === 'Simple Items'
                                    ? true
                                    : false
                            }
                        >
                            {({ open }) => (
                                <>
                                    <Listbox.Label
                                        className="block font-medium text-gray-700 dark:text-gray-50 text-sm sm:text-md"
                                        style={{
                                            opacity: sortingOptionsDisabled
                                                ? '0.50'
                                                : '1',
                                        }}
                                    >
                                        Completed Item Sorting
                                    </Listbox.Label>
                                    <div
                                        className="relative mt-1 pb-10 text-sm sm:text-md"
                                        style={{
                                            opacity: sortingOptionsDisabled
                                                ? '0.50'
                                                : '1',
                                        }}
                                    >
                                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-1 dark:focus:ring-slate-700 dark:focus:border-slate-800 dark:focus:outline-none sm:text-sm">
                                            <span className="block truncate">
                                                {itemSortingType?.name}
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
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ">
                                                {itemSortingOptions.map(
                                                    (option) => (
                                                        <Listbox.Option
                                                            key={option.id}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                clsx(
                                                                    active
                                                                        ? 'text-gray-50 bg-dark-alt-bg dark:bg-offset-bg dark:text-slate-900 text-sm sm:text-md'
                                                                        : 'text-gray-900 dark:text-gray-50',
                                                                    'relative cursor-default select-none py-2 pl-3 pr-9 text-sm sm:text-md'
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
                                                                                    : 'text-slate-900 dark:text-gray-50',
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
                <div className="flex flex-shrink-0 justify-end pr-2">
                    {props.handleRemoveContainer && (
                        <button
                            type="button"
                            className="rounded-md border mr-auto border-gray-300 dark:border-slate-700 bg-red-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={props.handleRemoveContainer}
                        >
                            Delete Column
                        </button>
                    )}

                    <button
                        type="submit"
                        className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-primary-darker py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark-alt focus:outline-none transition-color duration-300 disabled:cursor-not-allowed invalid:border-pink-500"
                        onClick={() => {
                            handleAddOrUpdateContainer({
                                id: props.id,
                                title: title,
                                type: containerType!.key,
                                completedItemOrder: itemSortingType!.key,
                                badgeColor: badgeColor,
                            });
                        }}
                        disabled={title.length === 0}
                    >
                        Save
                    </button>
                </div>
            </div>
        </>
    );
};

export default ContainerInputGroup;
