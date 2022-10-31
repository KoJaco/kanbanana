import React, { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { exportDB, importDB, peakImportFile } from 'dexie-export-import';
import { db } from '@/server/db';
import download from 'downloadjs';

import { ExportProgress } from 'dexie-export-import/dist/export';
import { VscExport } from 'react-icons/vsc';
import { stringToSlug } from '@/core/utils/misc';

const Dropzone = () => {
    const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
        // do something
        acceptedFiles.forEach(async (file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('File reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
                // do whatever with the file content
                // const binaryStr = reader.result;

                handleSetMetaDataObject(file);
            };
            reader.readAsArrayBuffer(file);
        });
    }, []);

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

    const [metaDataObject, setMetaDataObject] = useState({
        databaseName: '',
        databaseVersion: 0,
        tables: [
            {
                name: '',
                rowCount: 9,
                schema: '',
            },
        ],
    });

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFilename(event.currentTarget.value);
    }

    async function handleSetMetaDataObject(file: FileWithPath) {
        const importMeta = await peakImportFile(file);
        setMetaDataObject(importMeta.data);
        // console.log(importMeta.data);
        // console.log(importMeta);
        // console.log(
        //     'Tables ',
        //     importMeta.data.tables.map(
        //         (t) => `${t.name} (${t.rowCount} rows) + schema: ${t.schema}`
        //     )
        // );
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

    async function handleImportDB() {}

    function progressCallback({ totalRows, completedRows }: ExportProgress) {
        console.log(
            `progress: ${completedRows} of ${totalRows} rows completed`
        );
        return true;
    }

    const acceptedFileItems = acceptedFiles.map((file: FileWithPath) => {
        return (
            <li key={file.path}>
                {file.path} - {file.size} bytes
            </li>
        );
    });

    return (
        <>
            <div className="flex flex-col gap-y-8">
                <div className="flex flex-row">
                    <p className="text-sm dark:text-slate-200/50 whitespace-normal">
                        Import a database that you have exported on another
                        device, or export your existing database to share with
                        yourself or others!
                    </p>
                </div>
                <div className="flex flex-row w-full gap-x-10">
                    <div className="flex flex-col w-full">
                        <h1 className="text-xl dark:text-slate-200/75 self-start mb-4 w-full border-b pb-2 dark:border-slate-700">
                            Import
                        </h1>

                        <div>
                            <div
                                id="dropzone"
                                className="flex items-center justify-center border-1 border-dashed border-black dark:border-white w-full h-32 rounded-lg text-md opacity-50 hover:border-solid dark:hover:border-indigo-500 cursor-pointer transition-color duration-100"
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                {/* <input /> */}
                                {isDragAccept && (
                                    <p className="text-indigo-500 w-2/3">
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
                                        Drop database JSON file here or click to
                                        open dialog
                                    </p>
                                )}
                            </div>
                            {acceptedFileItems.length > 0 && (
                                <>
                                    <div className="grid grid-cols-2 gap-x-2 items-start mt-4 w-full">
                                        <div className="">
                                            <p className="text-sm mt-2 dark:text-slate-200/75">
                                                File accepted
                                            </p>
                                            <ul className="text-sm dark:text-slate-200/50 whitespace-normal">
                                                {acceptedFileItems}
                                            </ul>
                                        </div>
                                        <div className="flex flex-col mt-2 ml-2 w-full gap-x-4 text-sm">
                                            <p className="dark:text-slate-200/75">
                                                Importing database:
                                            </p>
                                            <div className="flex gap-x-4">
                                                <p className="dark:text-slate-200/50">
                                                    {
                                                        metaDataObject.databaseName
                                                    }
                                                </p>

                                                {metaDataObject.tables.map(
                                                    (table, index) => (
                                                        <div
                                                            key={index}
                                                            className=""
                                                        >
                                                            <p className="dark:text-slate-200/50">
                                                                {table.name}{' '}
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
                                    <button className="flex mt-6 items-center justify-center w-full ml-auto  rounded-md text-md dark:text-slate-200 ">
                                        <span className="border-b rounded-sm w-1/2 mr-4 dark:border-slate-200/50 "></span>
                                        Import
                                        <span className="border-b rounded-sm w-1/2 ml-4 dark:border-slate-200/50"></span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl dark:text-slate-200/75 self-start mb-4 w-full border-b pb-2 dark:border-slate-700">
                            Export
                        </h1>
                        <p className="text-sm dark:text-slate-200/75 self-start mb-2">
                            Filename:
                        </p>
                        <input
                            type="text"
                            className="appearance-none bg-slate-800 rounded-md border-none outline-none text-sm py-1 px-2"
                            value={filename}
                            onChange={handleInputChange}
                        ></input>
                        <span className="text-sm dark:text-slate-200/50 mt-2">
                            {stringToSlug(filename)}.json
                        </span>
                        <button
                            id="exportLink"
                            className=" mt-2 flex items-center justify-center h-3/4 w-full rounded-lg hover:border-1 transition-all duration-300 dark:border-slate-500 "
                            onClick={handleExportDB}
                        >
                            <VscExport className="w-10 h-10" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dropzone;
