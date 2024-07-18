// React Imports

// MUI Imports
import { useModal } from '@/contexts/ModalProvider'
import { utils } from '@/utils/utils'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const AlertModal = () => {

    const modalContext = useModal();
    const alert = modalContext.modals.alert;

    const handleClose = () => modalContext.closeModal("alert");

    const onOkButtonClick = async () => {
        try {
            if (alert) {
                modalContext.openModal({
                    type: "alert",
                    props: { ...alert, status: "loading" }
                })
            }
            await alert?.onOkClick?.();
            modalContext.closeModal("alert")
        } catch (error) {
            utils.toast.error({
                message: utils.error.getMessage(error)
            })
        }

    }

    return (
        <Dialog
            open={true}
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle id='alert-dialog-title'>{alert?.heading}</DialogTitle>
            <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                    {alert?.description}
                </DialogContentText>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
                {alert?.cancelButtonText !== null ?
                    <Button variant='outlined' onClick={handleClose}>{alert?.cancelButtonText}</Button> : null}
                <Button variant='contained' onClick={onOkButtonClick}>{alert?.status === "loading" ? alert?.okButtonLoadingText ?? "Loading..." : alert?.okButtonText}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AlertModal
