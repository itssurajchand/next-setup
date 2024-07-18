import React from 'react'
import Typography from '@mui/material/Typography'
import { IconButton, LinearProgress } from '@mui/material'
import { IReduxStatus } from '@/store/types'

type IVideoPreviewProps = {
    file: ICustomFile | null | any
    progress: number
    status: IReduxStatus
    hideRemoveButton?: boolean
    readOnly?: boolean
    onRemoveButtonClick: () => void
}

interface ICustomFile extends File {
    preview: string
}

const VideoPreview = (props: IVideoPreviewProps) => {
    const { file, readOnly } = props;
    return (
        <div key={file?.name} className='flex w-[calc(100%-20px)] shadow-md h-[45px] items-center'>
            <div className='h-full w-[42px] flex-shrink-0 flex justify-center items-center border-r ml-1'>
                <i className='tabler-video' />
            </div>
            <div className='flex-grow px-2'>
                <Typography variant='body2' className='mb-1 line-clamp-1'>
                    File <b>{file?.name}</b>
                </Typography>
                {!readOnly && <>
                    {props.status === "idle" ?
                        <Typography className='text-xs'>
                            Upload not initiated
                        </Typography>
                        : props.status === "loading" ?
                            <LinearProgress variant='determinate' className='animate-pulse' value={props.progress} /> :
                            <Typography variant='body2'>
                                Uploaded
                            </Typography>}
                </>}

            </div>
            {(props.status !== "loading" && props.status !== "fulfilled" && !props.hideRemoveButton) &&
                <IconButton className='text-textPrimary mr-1' onClick={props.onRemoveButtonClick}>
                    <i className='tabler-x text-lg' />
                </IconButton>
            }
        </div>
    )
}

export default VideoPreview