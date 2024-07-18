'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import classnames from 'classnames'
import { signIn } from 'next-auth/react'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import * as yup from "yup"

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import ErrorField from '@/@core/components/mui/ErrorField'
import { useModal } from '@/contexts/ModalProvider'
import { utils } from '@/utils/utils'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

const MaskImg = styled('img')({
    blockSize: 'auto',
    maxBlockSize: 355,
    inlineSize: '100%',
    position: 'absolute',
    insetBlockEnd: 0,
    zIndex: -1
})

type ErrorType = {
    message: string[]
}

type FormData = (typeof schema)["__outputType"];

const schema = yup.object().shape({
    email: yup
        .string()
        .min(1, 'Email is required')
        .email('Email is invalid')
        .required('Email is required'),
    password: yup
        .string()
        // .min(6)
        // .max(10)
        // .matches(/[a-zA-Z]/, "Password must contain at least one letter")
        // .matches(/^\S*$/, "Password cannot contain spaces")
        .required("Password is required"),
})

const Login = ({ mode }: { mode: SystemMode }) => {

    // States
    const [loading, setLoading] = useState(false);
    const [isPasswordShown, setIsPasswordShown] = useState(false)
    const [errorState, setErrorState] = useState<ErrorType | null>(null)

    // Vars
    const darkImg = '/images/pages/auth-mask-dark.png'
    const lightImg = '/images/pages/auth-mask-light.png'
    const commonIllustration = '/images/illustrations/auth/v2-login.jpg'

    // Hooks
    const router = useRouter()
    const modalsContext = useModal();
    const { settings } = useSettings()
    const theme = useTheme()
    const hidden = useMediaQuery(theme.breakpoints.down('md'))
    const authBackground = useImageVariant(mode, lightImg, darkImg)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const url = `url("${commonIllustration}")`;

    const handleClickShowPassword = () => setIsPasswordShown(show => !show)

    const onSubmit: SubmitHandler<FormData> = async (credentials: FormData) => {

        setLoading(true);

        try {
            const data = await signIn("credentials", {
                data: JSON.stringify(credentials),
                type: "login",
                redirect: false
            })

            if (data?.error) {

                if (data?.error.includes("currently under review for verification")) {
                    modalsContext.openModal({
                        type: "info",
                        props: {
                            heading: ``,
                            visible: true,
                            hidecancelbtn: true,
                            html: (
                                <div className='space-x-2 mb-2'>
                                    {data?.error}
                                </div>)
                        }
                    })
                    reset({
                        email: '',
                        password: ''
                    })
                } else {
                    utils.toast.error({
                        message: data?.error
                    })
                }

                setLoading(false);

            } else {
                window.location.href = "/";
            }

        } catch (error: any) {
            setErrorState({ message: [utils.error.getMessage(error)] });
            setLoading(false);
            console.error(error)
        }
    }

    return (
        <div className='flex bs-full justify-center' style={{
            backgroundAttachment: "fixed",
            backgroundImage: url,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100%",
        }}>
            <div
                className={classnames(
                    'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
                    {
                        'border-ie': settings.skin === 'bordered'
                    }
                )}
            >
                {!hidden && <MaskImg alt='mask' src={authBackground} />}
            </div>
            <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
                <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
                    <div className='flex items-center w-100 justify-center'>
                        <Logo />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!`}</Typography>
                        <Typography>Please sign-in to your account and start the adventure</Typography>
                    </div>
                    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
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
                        <Controller
                            name='password'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Password'
                                    placeholder='············'
                                    id='login-password'
                                    type={isPasswordShown ? 'text' : 'password'}
                                    onChange={e => {
                                        field.onChange(e.target.value)
                                        errorState !== null && setErrorState(null)
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                                                    <i className={isPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    {...(errors.password && {
                                        error: true, helperText: utils.string.capitalize(errors.password.message, {
                                            capitalizeAll: false
                                        })
                                    })}
                                />
                            )}
                        />
                        <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                            <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
                            <Typography
                                className='text-end'
                                color='primary'
                                component={Link}
                                href="/forgot-password"
                            >
                                Forgot password?
                            </Typography>
                        </div>

                        {errorState !== null && errorState?.message?.[0] ?
                            <ErrorField message={errorState?.message[0]} textAlign={"center"} /> : null}

                        <Button fullWidth variant='contained' type='submit' disabled={loading}>
                            {loading ? `Logging in..` : `Login`}
                        </Button>
                        <div className='flex justify-center items-center flex-wrap gap-2'>
                            <Typography>New on our platform?</Typography>
                            <Typography component={Link} href='/register' color='primary'>
                                Create an account
                            </Typography>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
