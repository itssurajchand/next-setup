// React Imports

// MUI Imports
import CustomTextField from '@/@core/components/mui/TextField'
import { useModal } from '@/contexts/ModalProvider'
import { utils } from '@/utils/utils'
import { InputAdornment, IconButton, Grid } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Controller, useForm } from 'react-hook-form'
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { services } from '@/services/index.service'

type ErrorType = {
    message: string[]
}

type FormData = (typeof updatePasswordSchema)["__outputType"];

const updatePasswordSchema = yup
    .object()
    .shape({
        password: yup.string().min(6).required('Password is required'),
        oldPassword: yup.string().min(6, "Old password must be at least 6 characters").required('Old password is required'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password')], 'Passwords must match')
            .required('Confirm password is required')
    })
    .noUnknown()
    .required()

const UpdatePasswordModal = () => {
    const [loading, setLoading] = useState(false);
    const modalContext = useModal();
    const updatePassword = modalContext.modals.updatePassword;
    const [errorState, setErrorState] = useState<ErrorType | null>(null)
    const handleClose = () => modalContext.closeModal("updatePassword");
    
    const [isCPasswordShown, setIsCPasswordShown] = useState(false)
    const [isPasswordShown, setIsPasswordShown] = useState(false)
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset
    } = useForm<FormData>({
        resolver: yupResolver(updatePasswordSchema),
        defaultValues: {
            password: "",
            oldPassword: "",
            confirmPassword: ""
        }
    })

    const handleClickShowPassword = () => setIsPasswordShown(show => !show)
    const handleClickShowCPassword = () => setIsCPasswordShown(show => !show)
   

    const onSubmit = async (
        formData: FormData
    ) => {
        try {
            setLoading(true);
            const userService = new services.client.UserService()
            const updated = await userService.updatePassword(formData)
            utils.toast.success({
                message: "User password updated successfully"
            })
            modalContext.closeModal("updatePassword")
            setTimeout(()=> {
                setLoading(false);
            }, 100)
        } catch (error: any) {
            setErrorState({ message: [utils.error.getMessage(error)] });
            console.error(error)
            utils.toast.error({
                message: error.message  ?? "Something went wrong"
            });
            setLoading(false);
        }
    }

    return (
        <Dialog
            maxWidth="sm"
            fullWidth
            open={true}
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle id='alert-dialog-title'>Update Password</DialogTitle>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                <DialogContent className='gap-4 flex flex-col'>
                    <Grid className='flex items-center gap-4'>
                        <Controller
                            name='oldPassword'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Old Password'
                                    placeholder='············'
                                    id='login-password'
                                    
                                    type={'text'}
                                    onChange={e => {
                                        field.onChange(e.target.value)
                                        errorState !== null && setErrorState(null)
                                    }}

                                    {...(errors.oldPassword && {
                                        error: true, helperText: utils.string.capitalize(errors.oldPassword.message, {
                                            capitalizeAll: false
                                        })
                                    })}
                                />
                            )}
                        />
                    </Grid>

                    <Grid className='flex items-center gap-4'>
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
                                                <IconButton edge='end'  onClick={handleClickShowPassword}  onMouseDown={e => e.preventDefault()}>
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
                    </Grid>

                    <Grid className='flex items-center gap-4'>
                        <Controller
                            name='confirmPassword'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    fullWidth
                                    label='Confirm Password'
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

                                    {...(errors.confirmPassword && {
                                        error: true, helperText: utils.string.capitalize(errors.confirmPassword.message, {
                                            capitalizeAll: false
                                        })
                                    })}
                                />
                            )}
                        />
                    </Grid>




                </DialogContent>
                <DialogActions className='dialog-actions-dense'>
                    <Button variant='outlined' onClick={handleClose}>Cancel</Button>
                    <Button variant='contained' type='submit' disabled={loading}>{loading ? "Updating..." : "Update"}</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default UpdatePasswordModal
