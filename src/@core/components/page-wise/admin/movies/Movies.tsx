'use client'

import { format } from 'date-fns';
import { useEffect, useRef } from "react";
import { Button, CardContent, CardHeader, IconButton, Typography, Card } from "@mui/material";
import { DataGrid, gridClasses, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import CustomChip from "../../../mui/Chip";
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
import CustomTextField from '../../../mui/TextField';
import { useDebounceWithSetter } from '@/hooks/useDebounceWithSetter';
import { movieActions, movieSelectors } from '@/store/slices/movie/movie.slice';
import { movieThunks } from '@/store/slices/movie/movie.thunk';
import { utils } from '@/utils/utils';
import CategoryCircles from './CategoryCircles';
import { IMovie } from '@/models/movie.model';
import { useModal } from '@/contexts/ModalProvider';
import { RootState } from '@/store/types';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
const VIDEO_STATUSES = utils.CONST.BUNNY.VIDEO.STATUS;
const VIDEO_STATUSES_NUMERIC = utils.object.swapKeysAndValues(VIDEO_STATUSES);

const Movies = () => {
    const query = useRef("");
    const modalsContext = useModal();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const list = useAppSelector(movieSelectors.list);
    const { debounceSetter } = useDebounceWithSetter({
        value: list.data.query, delay: 300, functionToFireOnDelay: onQueryChange
    });
    const userType = useAppSelector((state: RootState) => state.user.data.user?.type);

    useEffect(() => {
        dispatch(movieThunks.list({
            page: list.data.page,
            sort: list.data.sort ?? undefined,
            order: list.data.order ?? undefined,
            query: list.data.query ?? undefined,
            limit: list.data.limit,
        }));
    }, [dispatch, list.data.page, list.data.limit, list.data.query, list.data.sort, list.data.order]);

    function onQueryChange() {
        dispatch(movieActions.updatePaginationData({
            query: query.current
        }));
    }

    const onPaginationModalChange = ({ page, pageSize }: { page: number, pageSize: number }) => {
        dispatch(movieActions.updatePaginationData({
            page: page + 1,
            limit: pageSize
        }));
    };

    const handleSortModel = (newModel: GridSortModel) => {
        if (newModel.length) {
            dispatch(movieActions.updatePaginationData({
                sort: newModel[0].field,
                order: newModel[0].sort ?? undefined
            }));
        }
    };

    const onCategoryColumnClick = (movie: IMovie) => {
        type ICategory = IMovie["categories"][0] & { categoryName: string };
        modalsContext.openModal({
            type: "info",
            props: {
                heading: `Categories`,
                visible: true,
                html: (
                    <div className='space-x-2 mb-2'>
                        {movie.categories.map((currentCategory, index) => (
                            <CustomChip
                                key={`currentCategory${movie._id}${index}`}
                                className="w-fit"
                                size='small'
                                variant="filled"
                                color={'primary'}
                                label={(currentCategory as ICategory).categoryName}
                                sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                            />
                        ))}
                    </div>
                ),
                cancelButtonText: null
            }
        });
    };

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

    const handlerRouteShift = () => {
        router.push("/movies/create");
    };

    const onEditButtonClick = (movie: IMovie) => {

        const movieUploadInProgress = movie.bunnyProcessingStatus !== utils.CONST.BUNNY.VIDEO.STATUS.FINISHED && movie.movieUploaded

        const trailerUploadInProgress = movie.trailerGuid && movie.bunnyTrailerProcessingStatus !== utils.CONST.BUNNY.VIDEO.STATUS.FINISHED && movie.trailerUploaded

        if ((movieUploadInProgress || trailerUploadInProgress) && (movie.bunnyProcessingStatus !== utils.CONST.BUNNY.VIDEO.STATUS.FINISHED)) {
            utils.toast.info({ message: "Your movie is currently being uploaded to our server. Until the upload is complete, editing this movie is not possible" })
            return
        }

        router.push(`/movies/edit/${movie._id}`)
    }

    const onDetailPage = (movie: IMovie) => {
        router.push(`/movies/detail/${movie._id}`);
    };

    const columns: GridColDef[] = [
        {
            flex: 0.3,
            headerName: 'Name',
            field: 'name',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                    {params.row.name}
                </Typography>
            )
        },
        {
            flex: 0.15,
            headerName: 'Duration',
            field: 'duration',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                    {utils.date.formatDuration(params.row.duration)}
                </Typography>
            )
        },
        {
            flex: 0.2,
            headerName: 'Categories',
            field: 'categories',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <div onClick={() => onCategoryColumnClick(params.row)} className='cursor-pointer h-full flex items-center'>
                    <CategoryCircles categories={params.row.categories} />
                </div>
            )
        },
        {
            flex: 0.2,
            headerName: 'Creator',
            field: 'user.name',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                    {params.row.user.name}
                </Typography>
            )
        },
        {
            flex: 0.2,
            headerName: 'Status',
            field: 'status',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <CustomChip
                    className="w-[80px]"
                    size='small'
                    variant="filled"
                    color={params.row.status ? 'success' : 'error'}
                    label={params.row.status ? "Active" : "Inactive"}
                    sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                />
            )
        },
        {
            flex: 0.2,
            headerName: 'Upload Status',
            field: 'bunnyProcessingStatus',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => (
                <CustomChip
                    className="w-[80px]"
                    size='small'
                    variant="filled"
                    color={getStatusColor(params.row.bunnyProcessingStatus)}
                    label={params.row.movieUploaded ? VIDEO_STATUSES_NUMERIC[params.row.bunnyProcessingStatus] : "N/A"}
                    sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                />
            )
        },
        {
            flex: 0.2,
            type: "date",
            sortable: true,
            field: 'createdAt',
            headerName: 'Created at',
            valueFormatter: (value) => new Date(value),
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }} height={"100%"} display={'flex'} alignItems={'center'}>
                    {format(new Date(params.row.createdAt), 'MM-dd-yyyy')}
                </Typography>
            )
        },
        // {
        //     flex: 0.15,
        //     sortable: false,
        //     field: 'id',
        //     headerName: 'Action',
        //     valueFormatter: (value) => new Date(value),
        //     renderCell: (params: GridRenderCellParams) => (
        //         <div>
        //             <IconButton className='text-textPrimary' onClick={() => onEditButtonClick(params.row)}>
        //                 <i className='tabler-edit text-xl cursor-pointer' />
        //             </IconButton>
        //             <IconButton className='text-textPrimary' onClick={() => onDetailPage(params.row)}>
        //                 <i className='tabler-eye text-xl cursor-pointer' />
        //             </IconButton>
        //         </div>
        //     )
        // },
    ];

    if (userType && userType !== 1) {
        columns.splice(3, 1);
    }

    return (
        <>
            <Card style={{ width: '100%' }}>
                <CardHeader
                    sx={{ padding: 3 }}
                    title="Movies Listing"
                    action={
                        <div className='flex items-center flex-wrap space-x-2'>
                            <CustomTextField
                                autoFocus
                                sx={{ width: 300 }}
                                type='text'
                                name='movie'
                                defaultValue={query.current}
                                onKeyUpCapture={(e) => {
                                    query.current = (e.target as any).value;
                                    debounceSetter((e.target as any).value);
                                }}
                                placeholder="Enter movie title or creator's name"
                            />
                            {userType !== 1 && (
                                <Button variant='contained' className='flex items-center space-x-2' onClick={handlerRouteShift} startIcon={<i className='tabler-plus' />}>
                                    <Typography variant='body2' sx={{ fontWeight: 500, color: "white" }}>
                                        Create
                                    </Typography>
                                </Button>
                            )}
                        </div>
                    } 
                />
                <CardContent sx={{ padding: 0 }}>
                    <DataGrid
                        loading={list.status === "loading"}
                        sx={{
                            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                                outline: 'transparent',
                            },
                            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
                                outline: 'none',
                            },
                        }}
                        autoHeight
                        sortingMode='server'
                        rowSelection={false}
                        rows={list.data.movies}
                        columns={columns}
                        onSortModelChange={handleSortModel}
                        rowCount={list.data.totalCount}
                        disableColumnMenu
                        pageSizeOptions={[10, 25, 50]}
                        paginationMode="server"
                        paginationModel={{ page: list.data.page - 1, pageSize: list.data.limit }}
                        onPaginationModelChange={onPaginationModalChange}
                    />
                </CardContent>
            </Card>
        </>
    );
};

export default Movies;
