// React Imports

// MUI Imports
import { useModal } from '@/contexts/ModalProvider'
import { utils } from '@/utils/utils'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

const InfoModal = () => {

    const modalContext = useModal();
    const info = modalContext.modals.info;
    const handleClose = () => modalContext.closeModal("info");

    const onOkButtonClick = async () => {
        try {
            if (info) {
                modalContext.openModal({
                    type: "info",
                    props: { ...info }
                })
            }
            await info?.onOkClick?.();
            modalContext.closeModal("info")
        } catch (error) {
            utils.toast.error({
                message: utils.error.getMessage(error)
            })
        }

    }

    return (
        <Dialog
            open={true}
            maxWidth="sm"
            fullWidth
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle id='alert-dialog-title'>{info?.heading}</DialogTitle>
            <DialogContent>
                {info?.html}
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
                {info?.cancelButtonText !== null ?
                    <Button variant='outlined' onClick={handleClose}>
                        {info?.cancelButtonText ?? "Close"}
                    </Button> :
                    null}
                {!info?.hidecancelbtn && <Button variant='contained' onClick={onOkButtonClick}>{info?.okButtonText ?? "Ok"}</Button>}
            </DialogActions>
        </Dialog>
    )
}

export default InfoModal
