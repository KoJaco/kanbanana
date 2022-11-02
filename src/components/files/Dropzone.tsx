import React, { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import {
    exportDB,
    importDB,
    importInto,
    peakImportFile,
} from 'dexie-export-import';
import { db } from '@/server/db';
import download from 'downloadjs';

import { ExportProgress } from 'dexie-export-import/dist/export';
import { BsDownload, BsUpload } from 'react-icons/bs';
import { MdOutlineDone } from 'react-icons/md';
import { stringToSlug } from '@/core/utils/misc';

import clsx from 'clsx';
import assert from 'assert';
import { IndexableType, Table } from 'dexie';
import { UniqueIdentifier } from '@/core/types/sortableBoard';

type DropZoneProps = {
    handleCloseModal: (value: boolean) => void;
};

const Dropzone = ({ handleCloseModal }: DropZoneProps) => {
    const [metaDataObject, setMetaDataObject] = useState({
        formatName: '',
        formatVersion: 0,
        databaseName: '',
        databaseVersion: 0,
        tables: [
            {
                name: '',
                rowCount: 0,
                schema: '',
            },
        ],
    });

    const [currentDbObject, setCurrentDbObject] = useState<{
        databaseName: string;
        tables: {
            name: string;
            rowCount: number;
            schema: string;
        }[];
    }>({
        databaseName: db.name,
        tables: [
            {
                name: '',
                rowCount: 0,
                schema: '',
            },
        ],
    });

    const onDrop = useCallback(
        async (acceptedFiles: FileWithPath[]) => {
            // do something
            acceptedFiles.forEach(async (file) => {
                const reader = new FileReader();

                reader.onabort = () => console.log('File reading was aborted');
                reader.onerror = () => console.log('file reading has failed');
                reader.onload = () => {
                    async function handleSetData(file: FileWithPath) {
                        setImportBlob(file);
                        const importMeta = await peakImportFile(file);
                        setMetaDataObject({
                            formatName: importMeta.formatName,
                            formatVersion: importMeta.formatVersion,
                            ...importMeta.data,
                        });

                        let i = 0;
                        db.tables.forEach((table) => {
                            assert(table === db[table.name]);
                            const tableName = table.name;

                            const tableRowCount = async (
                                table: Table<any, IndexableType>
                            ) => {
                                return await table.toCollection().count();
                            };

                            const primKeyObj = table.schema.primKey;
                            assert(primKeyObj.name === primKeyObj.keyPath);
                            let tableSchema = primKeyObj.name;
                            const indexObjs = table.schema.indexes;
                            for (let j = 0; j < indexObjs.length; j++) {
                                let iObj = indexObjs[j];
                                if (iObj) {
                                    assert(iObj.name === iObj.keyPath);
                                    tableSchema = tableSchema + ',' + iObj.name;
                                }
                            }
                            let tableObject = {
                                name: tableName,
                                rowCount: 0,
                                schema: tableSchema,
                            };

                            let rowCount = tableRowCount(table)
                                .then((result) => result)
                                .then((result) => {
                                    tableObject.rowCount = result;
                                })
                                .catch((error) => console.error(error));

                            if (i === 0) {
                                let newTables = Array.from(
                                    currentDbObject.tables
                                );
                                newTables.push(tableObject);
                                newTables.splice(0, 1);
                                setCurrentDbObject({
                                    ...currentDbObject,
                                    tables: newTables,
                                });
                            } else {
                                let newTables = Array.from(
                                    currentDbObject.tables
                                );
                                newTables.push(tableObject);
                                setCurrentDbObject({
                                    ...currentDbObject,
                                    tables: newTables,
                                });
                            }
                            i + 1;
                        });
                    }
                    handleSetData(file);
                };
                reader.readAsArrayBuffer(file);
            });
        },
        [currentDbObject]
    );

    const {
        acceptedFiles,
        isDragActive,
        isDragAccept,
        isDragReject,
        getRootProps,
        getInputProps,
    } = useDropzone({
        accept: { 'application/json': ['.json'] },
        maxFiles: 1,
        onDrop,
    });

    const [filename, setFilename] = useState('');

    // const [metaComparison, setMetaComparison] = useState({
    //     databaseName: { name: 'checklistitDB', equals: false },
    //     databaseVersion: { version: '1', equals: false },
    //     tables: {
    //         tableCount: { count: 1, equals: false },
    //         tableName: { name: 'boards', equals: false },
    //         tableSchema: { schema: 'slug,tag,updatedAt', equals: false },
    //         tableRowCount: { rowCount: 9, equals: false },
    //     },
    // });

    const [loadingStatus, setLoadingStatus] = useState({
        inProgress: false,
        done: true,
        totalRows: 0,
        completedRows: 0,
    });

    const [importBlob, setImportBlob] = useState<FileWithPath | null>(null);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFilename(event.currentTarget.value);
    }

    function handleDone() {
        handleCloseModal(false);
        setLoadingStatus({
            ...loadingStatus,
            done: true,
        });
        setImportBlob(null);
    }

    async function handleExportDB() {
        try {
            const blob = await exportDB(db, {
                prettyJson: true,
                progressCallback: progressCallback,
            });
            download(
                blob,
                `${stringToSlug(filename)}.json`,
                'application/json'
            );
        } catch (error) {
            console.error('' + error);
        }
    }

    async function handleImportDB() {
        if (importBlob !== null) {
            const dbNamesEqual =
                currentDbObject.databaseName === metaDataObject.databaseName;
            let schemaEqual = false;
            for (let i = 0; i < currentDbObject.tables.length; i++) {
                let currentDbTable = currentDbObject.tables[i];
                let currentMetaDataTable = metaDataObject.tables[i];
                if (currentDbTable && currentMetaDataTable) {
                    schemaEqual =
                        currentDbTable.schema === currentMetaDataTable.schema;
                }
            }
            if (dbNamesEqual && schemaEqual) {
                // importInto

                await importInto(db, importBlob, {
                    overwriteValues: true,
                    progressCallback: progressCallback,
                });
            } else {
                // import as a separate database
                const db = await importDB(importBlob, {
                    progressCallback: progressCallback,
                });
            }
        } else {
            throw new Error(
                'Something went wrong, there is no file to import!'
            );
        }
    }

    function progressCallback({ totalRows, completedRows }: ExportProgress) {
        let newImportStatus = { ...loadingStatus, done: false };
        if (totalRows) {
            newImportStatus = {
                inProgress: true,
                done: false,
                totalRows: totalRows,
                completedRows: completedRows,
            };
        } else {
            newImportStatus = {
                inProgress: true,
                done: false,
                totalRows: 0,
                completedRows: completedRows,
            };
        }
        console.log(
            `progress: ${completedRows} of ${totalRows} rows completed`
        );
        if (completedRows === totalRows) {
            setLoadingStatus({
                inProgress: false,
                done: false,
                totalRows: totalRows,
                completedRows: completedRows,
            });
            return true;
        }
        setLoadingStatus(newImportStatus);
        return false;
    }

    const acceptedFileItems = acceptedFiles.map((file: FileWithPath) => {
        return (
            <li className="" key={file.path}>
                {file.path} - {file.size} bytes
            </li>
        );
    });

    return (
        <>
            <div className="flex flex-col gap-y-8 w-full h-full">
                {!loadingStatus.inProgress && loadingStatus.done ? (
                    <>
                        <div className="flex flex-row">
                            <p className="text-sm dark:text-slate-200/50 whitespace-normal">
                                Import a database from another device, or export
                                your existing database to share with yourself or
                                others!
                            </p>
                        </div>
                        <div className="flex flex-row w-full gap-x-10">
                            <div className="flex flex-col w-full">
                                <h1 className="text-xl dark:text-slate-200/75 text-slate-600 self-start mb-4 w-full border-b pb-2  dark:border-slate-700">
                                    Import
                                </h1>

                                <div>
                                    <div
                                        id="dropzone"
                                        className={clsx(
                                            'flex items-center justify-center border-2 border-dashed border-black dark:border-white w-full h-32 rounded-lg text-md opacity-50 hover:border-solid  cursor-pointer transition-color duration-100',
                                            acceptedFiles.length > 0 &&
                                                'border-emerald-600 dark:border-emerald-500',
                                            isDragAccept &&
                                                'border-emerald-600 dark:border-emerald-500',
                                            isDragReject &&
                                                'border-red-600 dark:border-red-500'
                                        )}
                                        {...getRootProps()}
                                    >
                                        <input {...getInputProps()} />
                                        {/* <input /> */}
                                        {isDragAccept && (
                                            <p className="text-emerald-500 w-2/3">
                                                File type accepted
                                            </p>
                                        )}
                                        {isDragReject && (
                                            <p className="text-red-500 w-2/3">
                                                File must be in JSON format
                                            </p>
                                        )}
                                        {!isDragActive && (
                                            <p className="w-2/3">
                                                Drop database JSON file here or
                                                click to open dialog
                                            </p>
                                        )}
                                    </div>
                                    {acceptedFileItems.length > 0 && (
                                        <>
                                            <div className="grid grid-rows-2 gap-x-2 items-start mt-4 w-full">
                                                <div className="grid-rows-1">
                                                    <p className="text-slate-600 font-medium text-sm mt-2 dark:text-slate-200/75">
                                                        File accepted
                                                    </p>
                                                    <ul className="text-sm text-slate-600 dark:text-slate-200/50  whitespace-normal">
                                                        {acceptedFileItems}
                                                    </ul>
                                                </div>

                                                <div className="flex flex-row grid-rows-1 mt-2">
                                                    {/* Import DB */}
                                                    <div className="flex flex-col gap-x-4 text-sm">
                                                        <p className="dark:text-slate-200/75 text-slate-600 font-medium">
                                                            Importing database:
                                                        </p>
                                                        <div className="flex gap-x-4">
                                                            <p className="dark:text-slate-200/50 text-slate-600">
                                                                {
                                                                    metaDataObject.databaseName
                                                                }
                                                            </p>

                                                            {metaDataObject.tables.map(
                                                                (
                                                                    table,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className=""
                                                                    >
                                                                        <p className="text-slate-600 dark:text-slate-200/50">
                                                                            {
                                                                                table.name
                                                                            }{' '}
                                                                            <span>
                                                                                (
                                                                                {
                                                                                    table.rowCount
                                                                                }

                                                                                )
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Current DB */}
                                                    <div className="flex flex-col ml-auto text-sm">
                                                        <p className="text-slate-600 font-medium dark:text-slate-200/75">
                                                            Current Database:
                                                        </p>
                                                        <div className="flex gap-x-4">
                                                            <p className="text-slate-600 dark:text-slate-200/50">
                                                                {
                                                                    currentDbObject.databaseName
                                                                }
                                                            </p>

                                                            {currentDbObject.tables.map(
                                                                (
                                                                    table,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className=""
                                                                    >
                                                                        <p className="text-slate-600 dark:text-slate-200/50">
                                                                            {
                                                                                table.name
                                                                            }{' '}
                                                                            <span>
                                                                                (
                                                                                {
                                                                                    table.rowCount
                                                                                }

                                                                                )
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                id="importButton"
                                                className="mt-5 flex items-center justify-center h-10 w-full rounded-lg border-1 border-emerald-500 text-emerald-500 hover:hue-rotate-15 transition-color duration-300 disabled:border-red-500 disabled:text-red-500 disabled:cursor-not-allowed"
                                                onClick={() => {
                                                    handleImportDB();
                                                }}
                                            >
                                                <BsDownload className="w-7 h-7" />
                                            </button>
                                            {/* <button className="flex mt-6 items-center justify-center w-full ml-auto  rounded-md text-md dark:text-slate-200 ">
                                        <span className="border-b rounded-sm w-1/2 mr-4 dark:border-slate-200/50 "></span>
                                        Import
                                        <span className="border-b rounded-sm w-1/2 ml-4 dark:border-slate-200/50"></span>
                                    </button> */}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl dark:text-slate-200/75 self-start mb-4 w-full border-b pb-2 dark:border-slate-700">
                                    Export
                                </h1>
                                <div className="mb-4 flex flex-col h-32 items-start justify-center">
                                    <label className="text-sm text-slate-600 font-medium dark:text-slate-200/75 self-start mb-2 after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Filename:
                                    </label>
                                    <input
                                        type="text"
                                        className="appearance-none bg-gray-100 dark:bg-slate-800 rounded-md border-1 border-emerald-500/50 outline-none text-sm py-1 px-2 self-center invalid:border-red-500/50"
                                        value={filename}
                                        onChange={handleInputChange}
                                        autoFocus
                                        required
                                    />
                                    <p className="text-sm text-slate-600 dark:text-slate-200/50 mt-2 whitespace-normal">
                                        {stringToSlug(filename)}.json
                                    </p>
                                </div>

                                <button
                                    id="exportButton"
                                    className="group mt-auto flex items-center justify-center h-10 w-full rounded-lg border-1 border-emerald-500 text-emerald-500 hover:hue-rotate-15 transition-color duration-300 disabled:border-red-500 disabled:text-red-500 disabled:cursor-not-allowed"
                                    onClick={handleExportDB}
                                    disabled={filename.length === 0}
                                >
                                    <BsUpload className="w-7 h-7" />
                                </button>
                            </div>
                        </div>
                        {/* <div className="flex flex-row border-t dark:border-slate-700 mt-4">
                            <div className="py-2">
                                <button
                                    type="button"
                                    className="bg-red-500 p-2 rounded-md"
                                >
                                    Reset Database
                                </button>
                            </div>
                        </div> */}
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-y-10 items-center justify-center w-full">
                            {/* loading spinner */}
                            {loadingStatus.inProgress && (
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-center ">
                                        <div className="w-40 h-40 border-t-4 border-b-4 dark:border-white rounded-full motion-safe:animate-spin-slow duration-[1500]"></div>
                                    </div>
                                </div>
                            )}

                            {!loadingStatus.done && (
                                <button
                                    className="flex items-center justify-center w-32 h-32 border-1 border-emerald-500 rounded-lg hover:scale-105 hover:hue-rotate-15 hover:border-2 transition-transform duration-300"
                                    onClick={() => handleDone()}
                                >
                                    <MdOutlineDone className="w-16 h-16 text-emerald-500" />
                                </button>
                            )}

                            {/* progress status text */}
                            <div className="inline-flex">
                                <p className="dark:text-slate-200/75 mr-4">
                                    Rows Completed:
                                </p>
                                <span className="dark:text-slate-200/75">
                                    {loadingStatus.completedRows}/
                                    {loadingStatus.totalRows}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Dropzone;
