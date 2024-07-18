import { Typography, TypographyOwnProps } from "@mui/material"

export type ErrorFieldProps = {
    message: string
    center?: boolean
} & TypographyOwnProps

const ErrorField = (props: ErrorFieldProps) => {
    const { message, ..._props } = props;
    return (
        <Typography variant='body2' color={'var(--mui-palette-error-main)'} {..._props}>{message}</Typography>
    )
}

export default ErrorField
