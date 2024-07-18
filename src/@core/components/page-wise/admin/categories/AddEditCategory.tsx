'use client'

// MUI Imports
import { useAppDispatch } from '@/store/hooks/useAppDispatch'
import { useAppSelector } from '@/store/hooks/useAppSelector'
import { categoryActions, categorySelectors } from '@/store/slices/category/category.slice'
import { Alert, Button, Divider, Drawer, FormControl, MenuItem, Typography } from '@mui/material'
import classNames from 'classnames'


// Hook Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import * as yup from "yup"
import CustomTextField from '../../../mui/TextField'
import { categoryThunks } from '@/store/slices/category/category.thunk'
import { utils } from '@/utils/utils'

const schema = yup.object().shape({
    _id: yup.string().optional(),
    name: yup.string().required('Name is required'),
    status: yup.number().oneOf([0, 1]).typeError('Status should be a number').required("Status is required")
})

type ErrorType = {
    message: string[]
}

type FormData = (typeof schema)["__outputType"];

const AddEditCategory = () => {

    const dispatch = useAppDispatch();
    const list = useAppSelector(categorySelectors.list);
    const addEditCategory = useAppSelector(categorySelectors.addEditCategory)

    const [errorState, setErrorState] = useState<ErrorType | null>(null)

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitted },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            status: 0
        }
    })

    useEffect(() => {
        if (addEditCategory.data) {
            reset({
                _id: addEditCategory.data._id as string,
                name: addEditCategory.data.name,
                status: addEditCategory.data.status,
            })
        } else {
            reset({
                name: "",
                status: 1,
            })
        }
    }, [addEditCategory.data])

    const onClose = () => {
        dispatch(categoryActions.addEditCategory(null))
    }

    const onSubmit: SubmitHandler<FormData> = (category: FormData) => {
        dispatch(categoryThunks.addEditCategory(category as any)).then(data => {
            if (data.meta.requestStatus === "fulfilled") {
                onClose();
                dispatch(categoryThunks.list({
                    page: list.data.page,
                    query: list.data.query ?? undefined,
                    limit: list.data.limit,
                }))
            }
        })
    }

    return (
        <Drawer
            anchor='right'
            open={addEditCategory.visible}
            onClose={onClose}
            ModalProps={{
                disablePortal: true,
                disableAutoFocus: true,
                disableScrollLock: true
            }}
            className={classNames('block', { static: !addEditCategory.visible, absolute: addEditCategory.visible })}
            PaperProps={{
                className: classNames('is-[400px] shadow-none rounded-s-[6px]', {
                    static: false,
                })
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                },
                '& .MuiBackdrop-root': {
                    borderRadius: 1,
                    position: 'absolute'
                }
            }}
        >
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='w-full'>
                <div className='is-full p-6'>
                    <Typography variant='h6'>
                        {addEditCategory.add ? "Add Category" : "Edit Category"}
                    </Typography>
                </div>

                <Divider className='is-full' />

                <div className='is-full p-6 flex flex-col gap-6'>
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
                                placeholder='Enter category name'
                                onChange={e => {
                                    field.onChange(e.target.value)
                                    errorState !== null && setErrorState(null)
                                }}
                                {...(errors.name && { error: true, helperText: errors.name.message })}
                            />
                        )}
                    />

                    <Controller
                        name='status'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormControl size="small">
                                <CustomTextField
                                    {...field}
                                    select
                                    label="Status"
                                    onChange={e => {
                                        field.onChange(e.target.value)
                                        errorState !== null && setErrorState(null)
                                    }}
                                >
                                    <MenuItem value={1}>Active</MenuItem>
                                    <MenuItem value={0}>Inactive</MenuItem>
                                </CustomTextField>
                            </FormControl>
                        )}
                    />


                    {!isSubmitted && !!watch("_id") && watch("status") === utils.CONST.CATEGORY.STATUS.INACTIVE && addEditCategory.data?.status === utils.CONST.CATEGORY.STATUS.ACTIVE ?
                        <Alert
                            severity='error'
                            className='flex items-center'
                        >
                            Making this category inactive will cause the movies associated with this category to become inactive.
                        </Alert> :
                        null}
                </div>
            </form>

            <div className='is-full p-6 flex flex-col space-y-2 webkit-bottom' >
                <Button
                    disabled={addEditCategory.status === "loading"}
                    fullWidth
                    variant='contained'
                    onClick={e => handleSubmit(onSubmit)(e)}
                >
                    {!addEditCategory.add ?
                        `Updat${addEditCategory.status === "loading" ? "ing..." : "e"}` :
                        `Creat${addEditCategory.status === "loading" ? "ing..." : "e"}`}
                </Button>
                <Button
                    type='button'
                    disabled={addEditCategory.status === "loading"}
                    onClick={onClose}
                    fullWidth
                    variant='outlined'
                >
                    Cancel
                </Button>
            </div>
        </Drawer>
    )
}

export default AddEditCategory
