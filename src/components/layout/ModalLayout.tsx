"use client"

import { useModal } from "@/contexts/ModalProvider";
import AlertModal from "../modals/AlertModal";
import InfoModal from "../modals/InfoModal";
import UpdatePasswordModal from "../modals/UpdatePasswordModal";

const ModalLayout = () => {

    const modalsContext = useModal();
    const modals = modalsContext.modals;

    return (
        <>
            {modals.alert && <AlertModal />}
            {modals.info && <InfoModal />}
            {modals.updatePassword && <UpdatePasswordModal />}
        </>
    )
}

export default ModalLayout
