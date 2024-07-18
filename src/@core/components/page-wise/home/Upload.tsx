'use client'

import React, { useRef, useState } from 'react';

import { Upload as tus } from 'tus-js-client';

import { utils } from '@/utils/utils';

function Upload() {
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {

        if (!fileInputRef.current || !fileInputRef.current.files) {
            return;
        }

        const file = fileInputRef.current.files[0];

        if (!file) return;

        const title = file.name;

        const videoId = '7c1cda39-15e5-434d-a5ee-fe8495d9f999'
        const libraryId = process.env.NEXT_PUBLIC_BUNNY_SREAM_LIB_ID ?? ''
        const apiKey = process.env.NEXT_PUBLIC_BUNNY_STREAM_ACCESS_KEY ?? '';
        const expirationTime = utils.date.getExpiryTime({ duration: "1yr" });
        const signature = utils.bunny.generateSignature({ libraryId, apiKey, expirationTime: expirationTime.toString(), videoId })

        const upload = new tus(file, {
            endpoint: 'https://video.bunnycdn.com/tusupload',
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
            headers: {
                AuthorizationSignature: signature,
                AuthorizationExpire: expirationTime.toString(),
                VideoId: videoId,
                LibraryId: libraryId.toString(),
            },
            metadata: {
                filetype: file.type,
                title: title,
            },
            onError: function (error) {
                console.error('Upload failed:', error);
            },
            onProgress: function (bytesUploaded, bytesTotal) {
                const percentage = (bytesUploaded / bytesTotal) * 100;
                setUploadProgress(percentage);
            },
            onSuccess: function () {
            }
        });

        upload.findPreviousUploads().then(function (previousUploads) {
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0]);
            }

            upload.start();
        });
    };

    return (
        <div>
            <input type="file" ref={fileInputRef} />
            <button onClick={handleUpload}>Upload</button>
            {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
        </div>
    );
}

export default Upload;
