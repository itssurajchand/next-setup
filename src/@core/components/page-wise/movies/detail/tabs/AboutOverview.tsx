import CustomChip from "@/@core/components/mui/Chip"

import { IMovie } from "@/models/movie.model"
import { movie } from "@/store/slices/movie/movie.slice"
import { utils } from "@/utils/utils";
import { Grid, Card, CardContent, Typography } from "@mui/material"

type ICategory = IMovie["categories"][0] & { categoryName: string };
const VIDEO_STATUSES = utils.CONST.BUNNY.VIDEO.STATUS;
const VIDEO_STATUSES_NUMERIC = utils.object.swapKeysAndValues(VIDEO_STATUSES);
const AboutOverview = ({ data }: { data?: IMovie }) => {

    const getStatusColor = (status: number): 'success' | 'error' | 'default' => {
        switch (status) {
            case VIDEO_STATUSES.FINISHED:
            case VIDEO_STATUSES.RESOLUTION_FINISHED:
            case VIDEO_STATUSES.CAPTIONS_GENERATED:
            case VIDEO_STATUSES.TITLE_OR_DESCRIPTION_GENERATED:
                return 'success';
            case VIDEO_STATUSES.FAILED:
            case VIDEO_STATUSES.PRESIGNED_UPLOAD_FAILED:
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Grid container spacing={6}>
        <Grid item xs={12}>
            <Card>
                <CardContent className='flex flex-col gap-6'>
                    <div className='flex flex-col gap-4'>
                        <Typography className='uppercase' variant='body2' color='text.disabled'>
                            About
                        </Typography>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                        <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-movie" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Movie Name :
                                </Typography>
                                <Typography> {data?.name} </Typography>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-time-duration-45" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Duration :
                                </Typography>
                                {data?.duration && <Typography> {utils.date.formatDuration(data?.duration)} </Typography>}
                            </div>
                        </div>
                      
                        <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-user-circle" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Creator :
                                </Typography>
                                <Typography> <div className='space-x-2 mb-2'>
                                    {data?.userName}
                                </div> </Typography>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-clock-cancel" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Status :
                                </Typography>
                                <Typography> <div className='space-x-2 mb-2'>
                                    <CustomChip
                                        className="w-[80px]"
                                        size='small'
                                        variant="filled"
                                        color={data?.status ? 'success' : 'error'}
                                        label={data?.status ? "Active" : "Inactive"}
                                        sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                                    />
                                </div> </Typography>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-upload" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Upload Status :
                                </Typography>
                                <Typography> <div className='space-x-2 mb-2'>
                                    <CustomChip
                                        className="w-[80px]"
                                        size='small'
                                        variant="filled"
                                        color={getStatusColor(data?.bunnyProcessingStatus as number)}
                                        label={VIDEO_STATUSES_NUMERIC[data?.bunnyProcessingStatus as any]}
                                        sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                                    />
                                </div> </Typography>
                            </div>
                        </div>

                        <div className='flex items-center gap-2 w-full'>
                            <i className="tabler-category" />
                            <div className='flex items-center flex-wrap gap-2 w-full'>
                                <Typography className='font-medium'>
                                    Categories :
                                </Typography>
                                <Typography> <div className='space-x-2 mb-2'>
                                    {data?.categories.map((currentCategory, index) => {
                                        return <>{index < 1 && <CustomChip
                                            key={`currentCategory${data._id}${index}`}
                                            className="w-fit"
                                            size='small'
                                            variant="filled"
                                            color={'primary'}
                                            label={(currentCategory as ICategory)?.categoryName}
                                            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                                        />} {index === 1 && <CustomChip
                                            key={`currentCategory${data._id}${index}`}
                                            className="w-fit"
                                            size='small'
                                            variant="filled"
                                            color={'primary'}
                                            label={`${data.categories.length - 1} more`}
                                            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                                        /> }</>
                                    })}
                                </div> </Typography>
                            </div>
                        </div>

                        <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-upload" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Downloads :
                                </Typography>
                                <Typography> <div className='space-x-2 mb-2'>
                                    <CustomChip
                                        className="w-[80px]"
                                        size='small'
                                        variant="filled"
                                        color={data?.downloadable ? 'success' : 'error'}
                                        label={data?.downloadable ? "Yes" : "No"}
                                        sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                                    />
                                </div> </Typography>
                            </div>
                        </div>      

                        <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-user-circle" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Required Age :
                                </Typography>
                                <Typography> <div className='space-x-2 mb-2'>
                                    {data?.ageTag}
                                </div> </Typography>
                            </div>
                        </div>
                        
                        {/* <div className='flex items-center gap-2 w-fit'>
                            <i className="tabler-user-circle" />
                            <div className='flex items-center flex-wrap gap-2 w-fit'>
                                <Typography className='font-medium'>
                                    Created At :
                                </Typography>
                                <Typography> <div className='space-x-2 mb-2'>
                                    {data?.createdAt}
                                </div> </Typography>
                            </div>
                        </div> */}

                    </div>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
    )
}

export default AboutOverview
