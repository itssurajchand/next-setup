"use client"
import ErrorField from '@/@core/components/mui/ErrorField'
import CustomTextField from '@/@core/components/mui/TextField'
import Link from 'next/link'
import { services } from '@/services/index.service'
import { useAppDispatch } from '@/store/hooks/useAppDispatch'
import { useAppSelector } from '@/store/hooks/useAppSelector'
import { userActions, userSelectors } from '@/store/slices/user/user.slice'
import { utils } from '@/utils/utils'
import type { SystemMode } from '@core/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Card, FormControl, FormLabel, Grid, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import 'react-phone-input-2/lib/style.css'
import * as yup from "yup"
import PhoneInput2 from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useModal } from '@/contexts/ModalProvider'
import { RootState } from '@/store/types'
type ErrorType = {
    message: string[]
}

type FormData = (typeof schema)["__outputType"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const schema = yup.object().shape({
    name: yup
        .string()
        .required('Name is required'),
    id: yup
        .string(),
    orignalemail: yup
        .string(),
    phoneCode: yup
        .string(),
    phone_: yup
        .string(),
    password: yup
        .string(),
    phoneNumber: yup
        .string().min(5, "Phone number is not valid")
        .matches(/^\d+$/, 'Phone number is not valid'),
    email: yup
        .string()
        .matches(emailRegex, 'Email is invalid')
        .min(1, 'Email is required')
        .required('Email is required'),
})
const EditProfile = ({ mode }: { mode: SystemMode }) => {
    const modalContext = useModal();
    const user = useAppSelector(userSelectors.user);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState<ErrorType | null>(null)
    const [focused, setFocused] = useState(false)
    const theme = useTheme()
    const palette = theme.colorSchemes[mode].palette;
    const userType = useAppSelector((state: RootState) => state.user.data.user?.type)

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            email: '',
        }
    })

    const onSubmit = async (
        formData: FormData
    ) => {
        setLoading(true);
        try {
            delete formData.phone_
            const { phoneNumber, phoneCode } = formData
            let phone_no = (phoneNumber)
            let phone_code = (phoneCode)
            const userService = new services.client.UserService()
            if (user) {
                formData = { ...formData, id: user._id, orignalemail: user.email, phoneNumber: phone_no, phoneCode: phone_code }
            }
            const updated = await userService.editProfile(formData)

            utils.toast.success({
                message: "User details updated successfully"
            })

            dispatch(userActions.updateUser(updated));
            setLoading(false);

        } catch (error: any) {
            setErrorState({ message: [utils.error.getMessage(error)] });
            console.error(error)
            setLoading(false);
        }
    }

    const onUpdatePasswordClick = () => {
        modalContext.openModal({
            type: "updatePassword",
            props: {
                status: "idle",
                visible: true,
            }
        })
    }

    useEffect(() => {
        if (user) {
            reset({ name: user.name, email: user.email })
            if(user.phoneCode && user.phoneNumber) {
                setValue("phone_", `${user.phoneCode}${(user.phoneNumber ?? "").toString()}`)
            } else {
                setValue("phone_", "+1")
            }
        }
    }, [user])

    return (
        <Grid item xs={12} className='flex flex-col gap-6'>
            <Card style={{ width: "100%" }}>
                {/* <CardHeader
                    sx={{ padding: 3 }}
                    title="Edit Profile"/> */}
                <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 '>
                    <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full mbs-8 sm:mbs-11 md:mbs-0'>

                        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                            <Grid item xs={6} sm={6} md={6}>
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
                                            placeholder='Enter your name'
                                            onChange={e => {
                                                field.onChange(e.target.value)
                                                errorState !== null && setErrorState(null)
                                            }}
                                            {...(errors.name && {
                                                error: true, helperText: utils.string.capitalize(errors.name.message, {
                                                    capitalizeAll: false
                                                })
                                            })}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={6} sm={6}>
                                <Controller
                                    name='email'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            autoFocus
                                            fullWidth
                                            type='email'
                                            label='Email'
                                            placeholder='Enter your email'
                                            onChange={e => {
                                                field.onChange(e.target.value)
                                                errorState !== null && setErrorState(null)
                                            }}
                                            {...(errors.email && {
                                                error: true, helperText: utils.string.capitalize(errors.email.message, {
                                                    capitalizeAll: false
                                                })
                                            })}
                                        />
                                    )}
                                />
                            </Grid>
                            {userType !== 1 && <Grid item xs={6} sm={6}>
                                < Controller
                                    name='phone_'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Box>
                                            <div className="phone-input-container">
                                                <FormControl fullWidth error={Boolean(errors.phoneNumber)}>
                                                    <FormLabel className={`${focused ? "cstm_label_color" : ""} text-xs mb-1`}>Phone</FormLabel>
                                                    <PhoneInput2
                                                        {...field}
                                                        country={'us'}
                                                        onFocus={() => setFocused(true)}
                                                        onBlur={() => setFocused(false)}
                                                        inputStyle={{
                                                            width: '100%',
                                                            backgroundColor: theme.palette.background.paper,
                                                            color: theme.palette.text.primary,
                                                            borderColor: errors.phoneNumber ? theme.palette.error.main : palette.divider,
                                                        }}
                                                        containerStyle={{ width: '100%' }}
                                                        buttonStyle={{
                                                            backgroundColor: theme.palette.background.paper,
                                                            borderColor: errors.phoneNumber ? theme.palette.error.main : theme.palette.divider,
                                                        }}
                                                        dropdownStyle={{
                                                            backgroundColor: theme.palette.background.paper,
                                                            color: theme.palette.text.primary,
                                                        }}

                                                        onChange={(value: string, data: { dialCode: string }) => {
                                                            const phone = value.slice(data.dialCode.length);
                                                            setValue("phoneNumber", phone)
                                                            setValue("phoneCode", "+" + data.dialCode)
                                                            field.onChange(value)
                                                        }}
                                                        inputProps={{
                                                            name: 'phone_',
                                                            required: true,
                                                            autoFocus: true
                                                        }}
                                                        specialLabel='Phone_'
                                                    />
                                                    {errors.phoneNumber && <Typography color="error" className='text-sm'>{utils.string.capitalize(errors.phoneNumber.message, { capitalizeAll: false })}</Typography>}
                                                </FormControl>
                                            </div>
                                        </Box>
                                    )}
                                />
                            </Grid>}

                            {errorState !== null && errorState?.message?.[0] ?
                                <ErrorField message={errorState?.message[0]} textAlign={"center"} /> : null}
                            <div className='flex flex-row items-center space-x-2  justify-end w-full'>
                                <Button variant='contained' className='flex items-center space-x-2 w-fit justify-end' disabled={loading} onClick={() => { onUpdatePasswordClick() }}><Typography variant='body2' sx={{ fontWeight: 500, color: "white" }}>
                                    Update Password
                                </Typography>
                                </Button>
                                <Button variant='contained' className='flex items-center space-x-2 w-fit justify-end' type='submit' disabled={loading}><Typography variant='body2' sx={{ fontWeight: 500, color: "white" }}>
                                    {loading ? `Updating...` : `Update Profile`}
                                </Typography>
                                </Button>
                            </div>
                        </form>


                    </div>
                </div>
            </Card>
        </Grid>
    )
}

export default EditProfile