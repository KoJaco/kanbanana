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

export function useDebounce(callback: Function, delay: number) {
    const latestCallback = useRef<null | Function>();
    const [callCount, setCallCount] = useState(0);
    // const latestTimeout = useRef<null | ReturnType<typeof setInterval>>();

    useEffect(() => {
        latestCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (callCount > 0) {
            const fire = () => {
                setCallCount(0);
                if (latestCallback.current) {
                    latestCallback.current();
                }
            };
            const id = setTimeout(fire, delay);
            return () => clearTimeout(id);
        }
    }, [callCount, delay]);

    return () => setCallCount((callCount) => callCount + 1);
}

export function useUserAgent() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const [userAgent, setUserAgent] = useState<string | null>(null);
    const [isIOS, setIsIOS] = useState<boolean | null>(null);
    const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
    const [userAgentString, setUserAgentString] = useState<string | null>(null);

    useEffect(() => {
        if (window) {
            const userAgentString = window.navigator.userAgent;
            setUserAgent(userAgentString);
            let userAgent: string;

            if (userAgentString.indexOf('SamsungBrowser') > -1) {
                userAgent = 'SamsungBrowser';
            } else if (userAgentString.indexOf('Firefox') > -1) {
                userAgent = 'Firefox';
            } else if (userAgentString.indexOf('FxiOS') > -1) {
                userAgent = 'FirefoxiOS';
            } else if (userAgentString.indexOf('CriOS') > -1) {
                userAgent = 'ChromeiOS';
            } else if (userAgentString.indexOf('Chrome') > -1) {
                userAgent = 'Chrome';
            } else if (userAgentString.indexOf('Safari') > -1) {
                userAgent = 'Safari';
            } else {
                userAgent = 'unknown';
            }

            setUserAgent(userAgent);

            // Check if user agent is mobile
            const isIOS = userAgentString.match(/iPhone|iPad|iPod/i);
            const isAndroid = userAgentString.match(/Android/i);
            setIsIOS(isIOS ? true : false);
            const isMobile = isIOS || isAndroid;
            setIsMobile(!!isMobile);

            // Check if app is installed (if it's installed we wont show the prompt)
            if (window.matchMedia('(display-mode: standalone)').matches) {
                setIsStandalone(true);
            }
        }
    }, []);

    return { isMobile, userAgent, isIOS, isStandalone, userAgentString };
}

// eslint-disable-next-line no-undef
interface Args extends IntersectionObserverInit {
    freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
    elementRef: RefObject<Element>,
    {
        threshold = 0.8,
        root = null,
        rootMargin = '0%',
        freezeOnceVisible = false,
    }: Args
): IntersectionObserverEntry | undefined {
    const [entry, setEntry] = useState<IntersectionObserverEntry>();

    const frozen = entry?.isIntersecting && freezeOnceVisible;

    const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
        setEntry(entry);
    };

    useEffect(() => {
        const node = elementRef?.current; // DOM Ref
        const hasIOSupport = !!window.IntersectionObserver;

        if (!hasIOSupport || frozen || !node) return;

        const observerParams = { threshold, root, rootMargin };
        const observer = new IntersectionObserver(updateEntry, observerParams);

        observer.observe(node);

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        elementRef?.current,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(threshold),
        root,
        rootMargin,
        frozen,
    ]);

    return entry;
}
