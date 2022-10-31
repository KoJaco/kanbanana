import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type ModalProps = {
    open: boolean;
    setOpen: (value: boolean) => void;
    children: JSX.Element;
};

const BaseModal = ({ open, setOpen, children }: ModalProps) => {
    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-opacity-75 transition-opacity bg-gray-500 dark:bg-slate-500/50" />
                </Transition.Child>

                <div className="fixed inset-0 z-[210] overflow-y-auto">
                    {/* Modal content */}
                    {children}
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default BaseModal;
