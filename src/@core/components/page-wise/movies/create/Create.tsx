"use client"
import { useCallback, useEffect, useRef, useState } from 'react'

import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useDropzone } from 'react-dropzone'
// Third-party Imports
import * as yup from "yup"
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'
import VideoPreview from './VideoPreview'
import { utils } from '@/utils/utils'
import CustomChip from '@/@core/components/mui/Chip'
import { categorySelectors } from '@/store/slices/category/category.slice'
import { useAppSelector } from '@/store/hooks/useAppSelector'
import { useAppDispatch } from '@/store/hooks/useAppDispatch'
import { categoryThunks } from '@/store/slices/category/category.thunk'
import Loader from '@/components/Loader'
import { movieThunks } from '@/store/slices/movie/movie.thunk'
import { movieActions, movieSelectors } from '@/store/slices/movie/movie.slice'
import { IGenerateResFn } from '@/utils/generateRes'
import { FormControl, FormHelperText, FormLabel } from '@mui/material'
import { IMovie } from '@/models/movie.model'
import { useRouter } from 'next/navigation'
import { usePreventNavigation } from '@/hooks/usePreventNavigation'
import { services } from '@/services/index.service'
import { useModal } from '@/contexts/ModalProvider'
import { IRequestArgs } from '@/app/api/types'

interface ICustomFile extends File {
    preview: string
}

type ErrorType = {
    message: string[]
}

type FormData = (typeof schema)["__outputType"];

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
    PaperProps: {
        style: {
            width: 250,
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
        }
    }
}

let schemaObject = {
    _id: yup.string().nullable().optional(),
    movieUploaded: yup.boolean().optional(),
    trailerUploaded: yup.boolean().optional(),
    videoGuid: yup.string().optional().nullable(),
    trailerGuid: yup.string().optional().nullable(),
    bunnyProcessingStatus: yup.number().optional(),
    bunnyTrailerProcessingStatus: yup.number().optional(),
    name: yup.string().required('Name is required'),
    categories: yup.array().of(yup.string()).min(1, 'Categories must have at least one item').required('Categories are required'),
    premieresOn: yup
        .date().typeError('cannot select null')
        .required('Premiere date is required')
        .test('is-one-day-after', 'Premiere date must be at least one day after current date', function (value) {
            const { premieresOn } = this.parent
            if (premieresOn && value) {
                const premiersOnDate = new Date(premieresOn)
                const current = new Date()
                const oneDay = utils.date.getDurationInMilliseconds({ duration: '1day' })
                return premiersOnDate.getTime() >= current.getTime() + oneDay
            }
            return true
        }),
    availableTill: yup
        .date()
        .test(
            'is-at-least-one-day-after-premiere',
            'Available till date must be at least one day after the premiere date',
            function (value) {
                const { premieresOn, availableTill } = this.parent
                if (premieresOn && value && availableTill) {
                    const premiereDate = new Date(premieresOn)
                    const availableTillDate = new Date(value)
                    const oneDay = utils.date.getDurationInMilliseconds({ duration: '1day' })
                    return availableTillDate.getTime() >= premiereDate.getTime() + oneDay
                }
                return true
            }
        ).nullable().optional(),
    status: yup.number().oneOf([0, 1]).optional(),
    ageTag: yup.string().oneOf(utils.CONST.MOVIE.AGE_TAGS).required(),
    downloadable: yup.boolean().required('Downloadable is required'),
    synopsis: yup.string().max(250).required('Synopsis is required'),
    thumbnail: yup
        .mixed().when('_id', (_id, schema) => {
            let id = _id[0] ?? null;
            if (!id) {
                return schema.test("required", "Thumbnail is required", (value) => {
                    return value && (value instanceof File);
                }).test("fileType", "Invalid file type. Only images are allowed", (value) => {
                    if (value instanceof File) {
                        return value.type.startsWith("image/");
                    }
                    return true;
                })
            }
            return schema.optional().nullable()
        }),
    movie: yup.mixed()
        .test("required", "Movie is required", (value, context) => {
            const editMovie = !!context.parent.id;
            const movieUploaded = editMovie && context.parent.movieUploaded;
            return movieUploaded || value;
        })
        .test("fileType", "Invalid file type. Only videos are allowed", (value, context) => {
            const editMovie = !!context.parent.id;
            const movieUploaded = editMovie && context.parent.movieUploaded;

            if (editMovie && movieUploaded) {
                return true;
            }

            if (value instanceof File && value.type.startsWith("video/")) {
                return true;
            }

            return false;
        }),
    trailer: yup
        .mixed().when('_id', (_id, schema) => {
            let id = _id?.[0] ?? null;
            if (!id) {

                return schema.test("fileType", "Invalid file type. Only videos are allowed", (value) => {
                    if (value instanceof File) {
                        return value.type.startsWith("video/");
                    }
                    return true || !value;
                })
            }

            return schema.optional().nullable()
        }),
}

type IProps = { movieId?: string }

export const schema = yup.object().shape(schemaObject)
export const createMovieSchema = schema;

export default function Create(props: IProps) {

    const router = useRouter();
    const modalsContext = useModal();
    const dispatch = useAppDispatch();

    const list = useAppSelector(categorySelectors.list);
    const createMovie = useAppSelector(movieSelectors.create);
    const uploadMovie = useAppSelector(movieSelectors.uploadMovie);
    const uploadMovieTrailer = useAppSelector(movieSelectors.uploadMovieTrailer);

    const categoryIdMapping = useRef<Map<string, string>>(new Map());

    const [movie, setMovie] = useState<ICustomFile | null>(null);
    const [trailer, setTrailer] = useState<ICustomFile | null>(null);
    const [thumbnail, setThumbnail] = useState<ICustomFile | null>(null);
    const [errorState, setErrorState] = useState<ErrorType | null>(null)
    const [disableBtn, setDisableBtn] = useState(false)

    const movieUploading = [createMovie.status, uploadMovieTrailer.status, uploadMovie.status].includes("loading")

    usePreventNavigation({
        preventNavigation: movieUploading,
    })

    const {
        control,
        setValue,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitted },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            synopsis: '',
            downloadable: true,
            status: 1,
            ageTag: utils.CONST.MOVIE.AGE_TAGS[0],
            categories: [],
        }
    })

    const editMovie = !!watch("_id");

    const movieDropzone = useDropzone({
        multiple: false,
        accept: {
            'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv']
        },
        disabled: !!(movie || (editMovie && watch("movieUploaded"))),
        onDrop: (acceptedFiles: File[]) => {
            if (errorState !== null) setErrorState(null);

            if (acceptedFiles.length) {
                setValue("movie", acceptedFiles[0], {
                    shouldValidate: true
                });
                setMovie(Object.assign(acceptedFiles[0], {
                    preview: URL.createObjectURL(acceptedFiles[0])
                }));
            } else {
                if (isSubmitted) {
                    onRemoveMovieClick();
                }
            }
        }
    });

    const trailerDropzone = useDropzone({
        multiple: false,
        accept: {
            'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv']
        },
        disabled: !!(trailer || (editMovie && watch("trailerUploaded"))),
        onDrop: (acceptedFiles: File[]) => {
            if (acceptedFiles.length) {
                setValue("trailer", acceptedFiles[0], {
                    shouldValidate: true
                });
                setTrailer(Object.assign(acceptedFiles[0], {
                    preview: URL.createObjectURL(acceptedFiles[0])
                }));
            } else {
                if (isSubmitted) {
                    onRemoveTrailerClick();
                }
            }
        }
    });

    const thumbnailDropzone = useDropzone({
        multiple: false,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        onDrop: (acceptedFiles: File[]) => {
            if (acceptedFiles.length) {
                setValue("thumbnail", acceptedFiles[0], {
                    shouldValidate: true
                });
                setThumbnail(Object.assign(acceptedFiles[0], {
                    preview: URL.createObjectURL(acceptedFiles[0])
                }));
            } else {
                setThumbnail(null);
            }
        }
    });

    const handleGetMovieById = useCallback(async (movieId: string) => {
        if (!movieId) return;

        try {
            const response = await dispatch(movieThunks.get(movieId));
            const movie = (response.payload as IGenerateResFn)?.data?.movie;

            if (movie) {
                const categoryIds = movie.categories.map((category: any) => category.categoryId);
                reset({ ...movie, categories: categoryIds });

                if (movie.thumbnail) {
                    setThumbnail(movie.thumbnail);
                }
            }
        } catch (error) {
            console.error("Failed to fetch movie data:", error);
        }
    }, [props.movieId]);

    useEffect(() => {
        if(props.movieId) {
            handleGetMovieById(props.movieId)
        }
    }, [])

    useEffect(() => {
        const categories = list.data.categories;
        const categoryIdMapping_ = new Map();
        categories.forEach(c => categoryIdMapping_.set(c._id, c.name));
        categoryIdMapping.current = new Map(categoryIdMapping_);
        if (list.status !== "fulfilled") {
            dispatch(categoryThunks.list({
                page: list.data.page,
                sort: list.data.sort ?? undefined,
                order: list.data.order ?? undefined,
                query: list.data.query ?? undefined,
                limit: 100,
            })).then((arg) => {
                if (arg.meta.requestStatus === "fulfilled") {
                    if(props.movieId) {
                        handleGetMovieById(props.movieId)
                    }
                }
            })
        }
    }, [dispatch, list, handleGetMovieById, props.movieId])


    useEffect(() => {
        dispatch(movieActions.resetUploads())
    }, [dispatch])

    const uploadVideoToBunny = async (type: "movie" | "trailer", movie_: IMovie) => {
        await new Promise(resolve => {
            const bs = services.client.BunnyService;
            const isMovie = type === "movie";
            const fileName = `${movie_._id}-${isMovie ? "movie" : "trailer"}`

            bs.uploadMovie({
                fileName,
                file: isMovie ? movie! : trailer!,
                videoGuid: isMovie ? movie_.videoGuid! : movie_.trailerGuid!,
                onError: (error) => {
                    if (isMovie) {
                        dispatch(movieActions.updateUploadMovieStats({
                            message: utils.error.getMessage(error)
                        }))
                    } else {
                        dispatch(movieActions.updateUploadMovieTrailerStats({
                            message: utils.error.getMessage(error)
                        }))
                    }
                    resolve(true)
                },
                onProgress: (percentage) => {
                    if (isMovie) {
                        dispatch(movieActions.updateUploadMovieStats({
                            data: {
                                progress: percentage
                            }
                        }))
                    } else {
                        dispatch(movieActions.updateUploadMovieTrailerStats({
                            data: {
                                progress: percentage
                            }
                        }))
                    }
                },
                onSuccess: () => {
                    if (isMovie) {
                        dispatch(movieActions.updateUploadMovieStats({
                            status: "fulfilled"
                        }))
                    } else {
                        dispatch(movieActions.updateUploadMovieTrailerStats({
                            status: "fulfilled"
                        }))
                    }
                    resolve(true)
                }
            })
        })
    }

    const onRemoveMovieClick = () => {
        if (1) {
            // utils.toast.info({ message: "" })
            modalsContext.openModal({
                type: "info",
                props: {
                    heading: ``,
                    visible: true,
                    hidecancelbtn: true,
                    html: (
                        <div className='space-x-2 mb-2'>
                            Since your movie has been successfully uploaded, editing or removing it is now restricted. To make changes, please deactivate this movie and create a new one.
                        </div>)
                }
            })
            return
        }
        setMovie(null)
        setValue("movie", '' as any, {
            shouldValidate: true
        });
    }

    const onRemoveTrailerClick = () => {
        setTrailer(null)
        setValue("trailerUploaded", false)
        setValue("trailer", '' as any, {
            shouldValidate: true
        });
    }

    const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {

        let trailerUploaded = false;
        let movieUploaded = false;

        setDisableBtn(true)

        const toastId = utils.toast.loading({
            message: `Creating your movie`
        })

        try {

            if (editMovie) {
                let update = { ...data };

                update = {
                    ...update,
                    movie: "movie",
                    trailer: data.trailer ? "trailer" : undefined
                }

                if (!data.availableTill) {
                    update.availableTill = null;
                }

                const returnType = await dispatch(movieThunks.update((update as any) as IMovie));
                const { meta, payload } = returnType;

                if (meta.requestStatus !== "fulfilled") {
                    throw payload;
                }

                let payload_ = payload as IGenerateResFn;
                const message = payload_?.message ?? "";
                const movie = payload_.data?.movie as IMovie;
                movieUploaded = movie.movieUploaded
                trailerUploaded = movie.trailerUploaded

                if (typeof data.movie !== "string" || typeof data.trailer !== "string") {
                    utils.toast.updateLoading({
                        loadingToastId: toastId,
                        message: `Uploading the movie`,
                        isError: false
                    })

                    if (data.movie && typeof data.movie !== "string") {
                        dispatch(movieActions.updateUploadMovieStats({
                            status: "loading"
                        }))
                        await uploadVideoToBunny("movie", movie)
                        movieUploaded = true
                    }

                    if (trailer instanceof File) {
                        dispatch(movieActions.updateUploadMovieTrailerStats({
                            status: "loading"
                        }))
                        utils.toast.updateLoading({
                            loadingToastId: toastId,
                            message: `Uploading the movie trailer`,
                            isError: false
                        })
                        await uploadVideoToBunny("trailer", movie);
                        trailerUploaded = true;
                    }
                }

                await dispatch(movieThunks.updateMovieTrailerStatus({
                    movieId: movie._id as string,
                    movieUploaded,
                    trailerUploaded
                }))

                utils.toast.stopLoading({
                    loadingToastId: toastId,
                    message,
                    isError: false
                })

                setDisableBtn(false)
                router.push("/movies")

            } else {

                if (!data.availableTill) {
                    data.availableTill = null
                }

                data = {
                    ...data,
                    movie: (data.movie as File).name,
                    ...(data.trailer && {
                        trailer: (data.trailer as File).name
                    })
                }
                const returnType = await dispatch(movieThunks.create(data));
                const { meta, payload } = returnType;

                if (meta.requestStatus !== "fulfilled") {
                    throw payload;
                }

                let payload_ = payload as IGenerateResFn;
                const message = payload_?.message ?? "";
                const movie = payload_.data?.movie as IMovie;
                movieUploaded = movie.movieUploaded
                trailerUploaded = movie.trailerUploaded

                utils.toast.updateLoading({
                    loadingToastId: toastId,
                    message: `Uploading the movie`,
                    isError: false
                })

                if (movie?.videoGuid) {
                    dispatch(movieActions.updateUploadMovieStats({
                        status: "loading"
                    }))
                }
                if (movie?.trailerGuid) {
                    dispatch(movieActions.updateUploadMovieTrailerStats({
                        status: "loading"
                    }))
                }

                await uploadVideoToBunny("movie", movie)
                movieUploaded = true

                if (movie.trailerGuid) {
                    utils.toast.updateLoading({
                        loadingToastId: toastId,
                        message: `Uploading the movie trailer`,
                        isError: false
                    })
                    await uploadVideoToBunny("trailer", movie);
                    trailerUploaded = true
                }

                await dispatch(movieThunks.updateMovieTrailerStatus({
                    movieId: movie._id as string,
                    movieUploaded,
                    trailerUploaded
                }))

                utils.toast.stopLoading({
                    loadingToastId: toastId,
                    message,
                    isError: false
                })

                setDisableBtn(false)
                router.push("/movies")
            }
        } catch (error) {
            console.error({ errormessage: error })
            utils.toast.error({
                message: utils.error.getMessage(error)
            });
        }
    }

    const thumbnailPreview = (thumbnail) ?
        <div className='flex w-[100%] '>
            {typeof thumbnail === "string" ?
                <img alt="Thumbnail"
                    className=' w-[100%] max-h-[192px] object-cover'
                    src={watch("thumbnail") as string} /> :
                <img alt={thumbnail!.name}
                    className=' w-[100%] max-h-[192px] object-cover'
                    src={thumbnail!.preview} />}
        </div> : null;

    return (
        <>
            <Card>
                <TabContext value="">
                    {list.status === "loading" ?
                        <div className='w-full h-[300px] flex justify-center items-center'>
                            <Loader size='lg' />
                        </div> :
                        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                            <CardContent>
                                <TabPanel value=''>
                                    <Grid container spacing={6}>
                                        <Grid item xs={12} sm={6}>
                                            <Controller
                                                name='name'
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        autoFocus
                                                        fullWidth
                                                        type='text'
                                                        label='Name'
                                                        placeholder='Enter name'
                                                        onChange={e => {
                                                            field.onChange(e.target.value)
                                                            errorState !== null && setErrorState(null)
                                                        }}
                                                        {...(errors.name && {
                                                            error: true,
                                                            helperText: utils.string.capitalize(errors.name.message, {
                                                                capitalizeAll: false
                                                            })
                                                        })}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Controller
                                                name='downloadable'
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        select
                                                        fullWidth
                                                        label='Downloadable'
                                                        value={field.value ? 1 : 0}
                                                        onChange={e => {
                                                            field.onChange(e.target.value === "1")
                                                            errorState !== null && setErrorState(null)
                                                        }}
                                                        {...(errors.downloadable && { error: true, helperText: errors.downloadable.message })}
                                                    >
                                                        <MenuItem value={1}>Yes</MenuItem>
                                                        <MenuItem value={0}>No</MenuItem>
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Controller
                                                name='premieresOn'
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <AppReactDatepicker
                                                        excludeScrollbar={{}}
                                                        selected={field.value ?? null}
                                                        openToDate={new Date()}
                                                        onChange={(dateOpen) => field.onChange(dateOpen)}
                                                        minDate={new Date()}
                                                        onSelect={(dateOpen) => field.onChange(dateOpen)}
                                                        placeholderText='Click to select'
                                                        customInput={
                                                            <CustomTextField
                                                                {...field}
                                                                fullWidth
                                                                label='Premiere Date'
                                                                placeholder='MM-DD-YYYY'
                                                                {...(errors.premieresOn && {
                                                                    error: true,
                                                                    helperText: utils.string.capitalize(errors.premieresOn.message, {
                                                                        capitalizeAll: false
                                                                    })
                                                                })}
                                                            />
                                                        } />
                                                )}
                                            />
                                        </Grid>

                                        {/*optional  */}
                                        <Grid item xs={12} sm={6}>
                                            <Controller
                                                name="availableTill"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => {
                                                    return (
                                                        <>
                                                            <AppReactDatepicker
                                                                excludeScrollbar={{}}
                                                                selected={field.value ?? undefined}
                                                                onChange={(dateOpen) => {
                                                                    field.onChange(dateOpen ?? undefined);
                                                                }}
                                                                onFocus={(dateOpen) => {
                                                                    field.onChange(dateOpen ?? undefined);
                                                                }}
                                                                minDate={new Date()}
                                                                onSelect={(dateOpen) => {
                                                                    field.onChange(dateOpen ?? undefined);
                                                                }}
                                                                placeholderText="Click to select"
                                                                customInput={
                                                                    <CustomTextField
                                                                        {...field}
                                                                        fullWidth
                                                                        label="Available Till"
                                                                        placeholder="MM-DD-YYYY"
                                                                        error={!!errors.availableTill}
                                                                        helperText={errors.availableTill ? errors.availableTill.message : ''}
                                                                    />
                                                                }
                                                            />
                                                        </>
                                                    );
                                                }}
                                            />
                                        </Grid>

                                        {/* Age Tag */}
                                        <Grid item xs={12} sm={6}>
                                            <Controller
                                                name='ageTag'
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        select
                                                        autoFocus
                                                        fullWidth
                                                        defaultValue={""}
                                                        label='Age Restriction'
                                                        onChange={e => {
                                                            field.onChange(e.target.value)
                                                            errorState !== null && setErrorState(null)
                                                        }}
                                                        {...(errors.ageTag && { error: true, helperText: errors.ageTag.message })}
                                                    >
                                                        {utils.CONST.MOVIE.AGE_TAGS.map((c, index) => {
                                                            return (
                                                                <MenuItem key={`currentAgeRestriction${index}`} value={c}>{c}</MenuItem>
                                                            )
                                                        })}
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>

                                        {/* STATUS */}
                                        <Grid item xs={12} sm={6}>
                                            <Controller
                                                name='status'
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        select
                                                        fullWidth
                                                        defaultValue={1}
                                                        label='Status'
                                                        onChange={e => {
                                                            field.onChange(e.target.value)
                                                            errorState !== null && setErrorState(null)
                                                        }}
                                                        {...(errors.status && { error: true, helperText: errors.status.message })}
                                                    >
                                                        <MenuItem value={1}>Active</MenuItem>
                                                        <MenuItem value={0}>Inactive</MenuItem>
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={12}>
                                            <Controller
                                                name='categories'
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        select
                                                        fullWidth
                                                        label='Categories'
                                                        {...{ ...field, onChange: undefined }}
                                                        id='demo-multiple-chip'
                                                        SelectProps={{
                                                            multiple: true,
                                                            MenuProps,
                                                            onChange: (e) => {
                                                                field.onChange(e.target.value)
                                                                errorState !== null && setErrorState(null)
                                                            },
                                                            renderValue: selected => {
                                                                return <div className='flex flex-wrap gap-1'>
                                                                    {(selected as unknown as string[]).map((category, index) => (
                                                                        <CustomChip
                                                                            key={index}
                                                                            label={categoryIdMapping.current.get((category))}
                                                                            size='small'
                                                                            deleteIcon={
                                                                                <i
                                                                                    className='tabler-xbox-x-filled text-[16px]'
                                                                                    onMouseDown={(e) => {
                                                                                        e.stopPropagation();
                                                                                        e.preventDefault();
                                                                                        const newSelected = (selected as string[]).filter((sel) => sel !== category);
                                                                                        field.onChange(newSelected);
                                                                                    }}
                                                                                />
                                                                            }
                                                                            onDelete={(e) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                const newSelected = (selected as string[]).filter((sel) => sel !== category);
                                                                                field.onChange(newSelected);
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            }
                                                        }}
                                                        {...(errors.categories && {
                                                            error: true,
                                                            helperText: utils.string.capitalize(errors.categories.message, {
                                                                capitalizeAll: false
                                                            })
                                                        })}
                                                    >
                                                        {list.data.categories.map(category => (
                                                            <MenuItem key={category._id as string} value={category._id as string}>
                                                                {category.name}
                                                            </MenuItem>
                                                        ))}
                                                    </CustomTextField>
                                                )} />
                                        </Grid>

                                        <Grid item xs={12} sm={12} >
                                            <Controller
                                                name='synopsis'
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        {...field}
                                                        rows={4}
                                                        fullWidth
                                                        multiline
                                                        type='text'
                                                        label='Synopsis'
                                                        placeholder='Enter description in brief'
                                                        onChange={e => {
                                                            field.onChange(e.target.value)
                                                            errorState !== null && setErrorState(null)
                                                        }}
                                                        {...(errors.synopsis && {
                                                            error: true,
                                                            helperText: utils.string.capitalize(errors.synopsis.message, {
                                                                capitalizeAll: false
                                                            })
                                                        })}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth error={Boolean(errors.movie)}>
                                                <FormLabel>Movie</FormLabel>
                                                <Box
                                                    {...movieDropzone.getRootProps({ className: 'dropzone border border-1 rounded -full' })}
                                                    sx={{
                                                        height: 170,
                                                        borderColor: errors.movie ? 'var(--mui-palette-error-main)' : undefined
                                                    }}
                                                >
                                                    <input
                                                        {...movieDropzone.getInputProps()}
                                                    />
                                                    <div className="flex items-center flex-col justify-items-center py-3 px-3 md:py-6 space-y-4">
                                                        <Typography variant="h5">
                                                            You can upload video
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Click on the button or drag & drop file here
                                                        </Typography>
                                                        {(movie || editMovie && watch("movieUploaded")) ? (
                                                            <>{(!movie) ?
                                                                <VideoPreview
                                                                    status="idle"
                                                                    progress={0}
                                                                    readOnly={true}
                                                                    onRemoveButtonClick={onRemoveMovieClick}
                                                                    file={{ name: watch("videoGuid") }} /> : <VideoPreview
                                                                    status={uploadMovie.status}
                                                                    progress={uploadMovie.data.progress}
                                                                    onRemoveButtonClick={onRemoveMovieClick}
                                                                    file={movie}
                                                                    readOnly={false} />}</>
                                                        ) : (
                                                            <Button
                                                                className="text-sm"
                                                                startIcon={<i className="tabler-cloud-upload" />}
                                                                type="button"
                                                                variant="contained"
                                                            >
                                                                Upload Movie
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Box>

                                                {errors.movie?.message ?
                                                    <FormHelperText className='!mx-0'>{utils.string.capitalize(errors.movie.message, {
                                                        capitalizeAll: false
                                                    })}</ FormHelperText> : null}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth error={Boolean(errors.trailer)}>
                                                <FormLabel>Trailer</FormLabel>
                                                <Box
                                                    {...trailerDropzone.getRootProps({ className: 'dropzone border border-1 rounded -full' })}
                                                    sx={{
                                                        height: 170,
                                                        borderColor: errors.trailer ? 'var(--mui-palette-error-main)' : undefined
                                                    }}>
                                                    <input {...trailerDropzone.getInputProps()} />
                                                    <div className='flex items-center flex-col justify-items-center py-3 px-3 md:py-6 space-y-4'>
                                                        <Typography variant='h5'>
                                                            You can upload video
                                                        </Typography>
                                                        <Typography variant='body2'>
                                                            Click on the button or drag & drop file here
                                                        </Typography>
                                                        {(trailer || editMovie && watch("trailerUploaded")) ?
                                                            <VideoPreview
                                                                hideRemoveButton={uploadMovieTrailer.status !== "idle"}
                                                                status={
                                                                    (uploadMovie.status === "fulfilled" || editMovie) ? uploadMovieTrailer.status : "idle"
                                                                }
                                                                readOnly={watch("trailerUploaded") && uploadMovieTrailer.status === "idle"}
                                                                progress={uploadMovieTrailer.data.progress}
                                                                onRemoveButtonClick={onRemoveTrailerClick}
                                                                file={editMovie && watch("trailerUploaded") ? { name: watch("trailerGuid") } : trailer} /> :
                                                            <Button
                                                                className='text-sm'
                                                                startIcon={<i className="tabler-cloud-upload" />} type='button'
                                                                variant='contained'>
                                                                Upload Trailer
                                                            </Button>}
                                                    </div>
                                                </Box>
                                                {errors.trailer?.message ?
                                                    <FormHelperText className='!mx-0'>
                                                        {utils.string.capitalize(errors.trailer.message, {
                                                            capitalizeAll: false
                                                        })}
                                                    </ FormHelperText> : null}
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth error={Boolean(errors.thumbnail)}>
                                                <FormLabel>Thumbnail</FormLabel>
                                                <Box
                                                    {...thumbnailDropzone.getRootProps({ className: 'dropzone border border-1 rounded -full ' })}
                                                    sx={{
                                                        height: 170,
                                                        borderColor: errors.thumbnail ? 'var(--mui-palette-error-main)' : undefined
                                                    }}
                                                >
                                                    <input
                                                        {...thumbnailDropzone.getInputProps()}
                                                    />
                                                    {thumbnail || watch("thumbnail") ? (
                                                        thumbnailPreview
                                                    ) : (
                                                        <div className='flex items-center flex-col justify-items-center py-3 px-3 md:py-6 space-y-4'>
                                                            <Typography variant='h5'>
                                                                You can upload image
                                                            </Typography>
                                                            <Typography variant='body2'>
                                                                Click on the button or drag & drop file here
                                                            </Typography>
                                                            <Button
                                                                className='text-sm'
                                                                startIcon={<i className="tabler-cloud-upload" />} type='button'
                                                                variant='contained'>
                                                                Upload Thumbnail
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Box>
                                                {errors.thumbnail?.message ?
                                                    <FormHelperText className='!mx-0'>{utils.string.capitalize(errors.thumbnail.message, {
                                                        capitalizeAll: false
                                                    })}
                                                    </ FormHelperText> : null}
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </TabPanel>
                            </CardContent>

                            <CardActions className='flex justify-end'>
                                <Button
                                    type='submit'
                                    disabled={disableBtn}
                                    variant='contained'
                                    className='mie-2'>
                                    {movieUploading ? `${editMovie ? "Updating" : "Creating"} & Uploading` : editMovie ? `Update` : `Create & Upload`}
                                </Button>

                            </CardActions>
                        </form>
                    }
                </TabContext>
            </Card>

        </>

    );
}