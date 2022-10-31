import React from 'react';

const FilePreview = ({ fileData }: any) => {
    return (
        <div className="">
            <div className="">
                {/* loop over the fileData */}
                {fileData.fileList.map((f: any) => {
                    return (
                        <>
                            <ol>
                                <li key={f.lastModified} className="">
                                    {/* display the filename and type */}
                                    <div key={f.name} className="">
                                        {f.name}
                                    </div>
                                </li>
                            </ol>
                        </>
                    );
                })}
            </div>
        </div>
    );
};

export default FilePreview;
