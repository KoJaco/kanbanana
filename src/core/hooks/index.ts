import { db } from '@/server/db';
import download from 'downloadjs';
import {
    importDB,
    exportDB,
    importInto,
    peakImportFile,
} from 'dexie-export-import';
import {
    RefObject,
    useState,
    useRef,
    useEffect,
    KeyboardEvent,
    ChangeEvent,
} from 'react';
import Dexie from 'dexie';
import { ExportProgress } from 'dexie-export-import/dist/export';

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

export function useOnNavigateAway() {}

export function useOnClickInsideOnly(
    ref: React.RefObject<any>,
    handler: (e: MouseEvent | TouchEvent) => void
) {
    useEffect(() => {
        // add listener, called with addEventListener(s)
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target)) {
                handler(event);
            }
            return;
        };

        // listen to both "mousedown" and "touchstart" for desktop/mobile devices
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        // cleanup function, remove both listeners
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

// export const useImportExport = () => {
//     const dropZoneDiv = document.getElementById('dropZone');
//     const exportLink = document.getElementById('exportLink');

//     if (dropZoneDiv && exportLink) {
//         // configure exportLink
//         exportLink.onclick = async () => {
//             try {
//                 const blob = await exportDB(db, {
//                     prettyJson: true,
//                     progressCallback: progressCallback,
//                 });
//                 download(blob, 'dexie-export.json', 'application/json');
//             } catch (error) {
//                 console.error('' + error);
//             }
//         };

//         // configure dropZone
//         dropZoneDiv.ondragover = (event) => {
//             event.stopPropagation();
//             event.preventDefault();
//             if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
//         };

//         // handle file drop
//         dropZoneDiv.ondrop = async (event) => {
//             event.stopPropagation();
//             event.preventDefault();

//             // pick file from drop event (file is also a Blob):
//             const file = event.dataTransfer && event.dataTransfer.files[0];

//             try {
//                 if (!file || file === null) {
//                     throw new Error(`Only files can be dropped here`);
//                 }
//                 console.log('Import ' + file.name);
//                 await db.delete();
//                 const newDB = await importDB(file, { progressCallback });
//                 console.log('Import complete');
//                 await showContent();
//             } catch (error) {
//                 console.error('');
//             }
//         };
//     }

//     function progressCallback({ totalRows, completedRows }: ExportProgress) {
//         console.log(
//             `progress: ${completedRows} of ${totalRows} rows completed`
//         );
//         return true;
//     }

//     async function showContent() {
//         const tbody = document.getElementsByTagName('tbody')[0];

//         const tables = await Promise.all(
//             db.tables.map(async (table) => ({
//                 name: table.name,
//                 count: await table.count(),
//                 primKey: table.schema.primKey.src,
//             }))
//         );

//         if (tbody) {
//             tbody.innerHTML = `
//             <tr>
//               <th>Database Name</th>
//               <td colspan="2">${db.name}</th>
//             </tr>
//             ${tables.map(
//                 ({ name, count, primKey }) => `
//               <tr>
//                 <th>Table: "${name}"</th>
//                 <td>Primary Key: ${primKey}</td>
//                 <td>Row count: ${count}</td>
//               </tr>`
//             )}
//           `;
//         }
//     }
// };

export const useEditField = ({
    fieldId,
    onCreate,
    onEdit,
    autoFocus = false,
}: UseEditFieldProps): UseEditFieldResult => {
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
