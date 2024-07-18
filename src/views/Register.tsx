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
import PhoneInput2 from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import classnames from 'classnames'
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from "yup"
import themeConfig from '@configs/themeConfig'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { utils } from '@/utils/utils'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import ErrorField from '@/@core/components/mui/ErrorField'
import { useModal } from '@/contexts/ModalProvider'
import { Box, FormControl, FormLabel } from '@mui/material'

const MaskImg = styled('img')({
    blockSize: 'auto',
    maxBlockSize: 345,
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
    name: yup
        .string()
        .min(1, 'Name is required')
        .required('Name is required'),
    phoneCode: yup
        .string()
        .required('Country code is required'),
    phone_: yup
        .string(),
    phoneNumber: yup
        .string().min(5, "Phone number is not valid")
        .required('Phone is required')
        .matches(/^\d+$/, 'Phone number is not valid'),
    email: yup
        .string()
        .min(1, 'Email is required')
        .email('Email is invalid')
        .required('Email is required'),
    password: yup
        .string()
        .min(6)
        .required("Password is required"),
    cPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required('This field is required')
});

const Register = ({ mode }: { mode: SystemMode }) => {
    // States
    const [loading, setLoading] = useState(false);
    const [isPasswordShown, setIsPasswordShown] = useState(false)
    const [isCPasswordShown, setIsCPasswordShown] = useState(false)
    const [errorState, setErrorState] = useState<ErrorType | null>(null)
    const [aggred, setAgreed] = useState(false)
    const [focused, setFocused] = useState(false)
    // Vars
    const darkImg = '/images/pages/auth-mask-dark.png'
    const lightImg = '/images/pages/auth-mask-light.png'
    const commonIllustration = '/images/illustrations/auth/v2-login.jpg'
    const modalsContext = useModal();
    // Hooks
    const router = useRouter()
    const { settings } = useSettings()
    const theme = useTheme()
    const hidden = useMediaQuery(theme.breakpoints.down('md'))
    const authBackground = useImageVariant(mode, lightImg, darkImg)
    const palette = theme.colorSchemes[mode].palette;
    const url = `url("${commonIllustration}")`;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            cPassword: '',
            phoneNumber: "",
            phoneCode: "",
            phone_: ""
        }
    })


    const handleClickShowPassword = () => setIsPasswordShown(show => !show)
    const handleClickShowCPassword = () => setIsCPasswordShown(show => !show)

    const onSubmit = async (
        formData: FormData
    ) => {
        delete formData.phone_
        const {phoneNumber ,  phoneCode } = formData
        let phone_no = parseInt(phoneNumber)
        let phone_code = parseInt(phoneCode)
        try {
            if (!aggred) {
                utils.toast.error({
                    message: `${utils.CONST.RESPONSE_MESSAGES.PRIVACY_POLICY_REQURED}`
                })
                return true
            }

            setLoading(true);

            const data = await signIn("credentials", {
                data: JSON.stringify({ ...formData, userType: utils.CONST.USER.TYPES.CREATOR, phoneNumber : phone_no , phoneCode : phone_code }),
                type: "register",
                redirect: false,
            });


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
                    setAgreed(false)
                    reset({
                        name: '',
                        email: '',
                        password: '',
                        cPassword: ''
                    })
                } else {
                    utils.toast.error({
                        message: data?.error
                    })
                    // throw data?.error
                }

                setLoading(false);
            } else {
                router.push("/");
            }

        } catch (error: any) {
            setErrorState({ message: [utils.error.getMessage(error)] });
            setLoading(false);
            console.error({ error })
        }
    };

    return (
        <div className='flex bs-full justify-center'>
            <div
                className={classnames(
                    'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
                    {
                        'border-ie': settings.skin === 'bordered'
                    }
                )}
                style={{
                    backgroundAttachment: "fixed",
                    backgroundImage: url,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100%",
                }}>
                {!hidden && <MaskImg alt='mask' src={authBackground} />}
            </div>
            <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
                <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
                    <div className='flex items-center w-100 justify-center'>
                        <Logo />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!`}</Typography>
                        <Typography>Please sign-up to start your adventure</Typography>
                    </div>
                    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-6'>
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
                        <Controller
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

                        <Controller
                            name='cPassword'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Confirm password'
                                    placeholder='············'
                                    id='login-password'
                                    type={isCPasswordShown ? 'text' : 'password'}
                                    onChange={e => {
                                        field.onChange(e.target.value)
                                        errorState !== null && setErrorState(null)
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton edge='end' onClick={handleClickShowCPassword} onMouseDown={e => e.preventDefault()}>
                                                    <i className={isCPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    {...(errors.cPassword && {
                                        error: true, helperText: utils.string.capitalize(errors.cPassword.message, {
                                            capitalizeAll: false
                                        })
                                    })}
                                />
                            )}
                        />

                        <FormControlLabel
                            control={<Checkbox onClick={(e) => setAgreed((e?.target as any)?.checked)} checked={aggred}/>}
                            label={
                                <>
                                    <span>I agree to </span>
                                    <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                                        privacy policy & terms & conditions
                                    </Link>
                                </>
                            }
                        />
                        {errorState !== null && errorState?.message?.[0] ?
                            <ErrorField message={errorState?.message[0]} textAlign={"center"} /> : null}

                        <Button fullWidth variant='contained' type='submit' disabled={loading}>
                            {loading ? `Signing up..` : `Sign Up`}
                        </Button>
                        <div className='flex justify-center items-center flex-wrap gap-2'>
                            <Typography>Already have an account?</Typography>
                            <Typography component={Link} href='/login' color='primary'>
                                Sign in instead
                            </Typography>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
