import {
    RefObject,
    useState,
    useRef,
    useEffect,
    KeyboardEvent,
    ChangeEvent,
} from 'react';

type UseEditFieldProps = {
    fieldId?: string;
    onCreate: (field: string) => void;
    onEdit: (id: string, field: string) => void;
    autoFocus?: boolean;
};

interface UseEditFieldResult {
    field: string;
    setField: (s: string) => void;
    isEditing: boolean;
    setIsEditing: (bool: boolean) => void;
    onKeyPressed: (event: KeyboardEvent) => void;
    handleBlur: () => void;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    inputRef: RefObject<HTMLInputElement> | null;
}

export function useOnClickOutside(
    // primary ref
    ref: React.RefObject<any>,
    // handler callback
    handler: (e: MouseEvent | TouchEvent) => void,
    // optional excluded Ref for a button component...
    excludedRef?: React.RefObject<any>
) {
    useEffect(() => {
        // add listener, called with addEventListener(s)
        const listener = (event: MouseEvent | TouchEvent) => {
            if (
                !ref.current ||
                ref.current.contains(event.target) ||
                excludedRef?.current?.contains(event.target)
            ) {
                return;
            }

            handler(event);
        };
        // listen to both "mousedown" and "touchstart" for desktop/mobile devices
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        // cleanup function, remove both listeners
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, excludedRef, handler]);
}

export function usePrevious<T>(value: T): T {
    // generic container whose current property is mutable and can hold any value, similar to instance property on a class.
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    // return previous value (happens before update in useEffect)
    return ref.current ? ref.current : value;
}

export const useEditField = ({
    fieldId,
    onCreate,
    onEdit,
    autoFocus = false,
}: UseEditFieldProps): UseEditFieldResult => {
    // unused, may implement at some point
    const [field, setField] = useState('');
    const [isEditing, setIsEditing] = useState(autoFocus);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef?.current) inputRef?.current?.focus();
    }, [isEditing, inputRef]);

    const handleCreate = () => {
        if (field.length > 0) {
            onCreate(field);
            setIsEditing(false);
            setField('');
        } else {
            setIsEditing(false);
        }
    };

    const handleEdit = () => {
        if (fieldId && field.length > 0) {
            onEdit(fieldId, field);
            setIsEditing(false);
            setField('');
        } else {
            setIsEditing(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
        setField(e.target.value);

    const handleBlur = () => {
        if (fieldId) handleEdit();
        else handleCreate();
    };

    const onKeyPressed = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            if (fieldId) handleEdit();
            else handleCreate();
        }
    };

    return {
        field,
        setField,
        isEditing,
        setIsEditing,
        onKeyPressed,
        handleBlur,
        handleChange,
        inputRef,
    };
};
