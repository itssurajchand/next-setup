'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { useAppSelector } from '@/store/hooks/useAppSelector'
import { userActions, userSelectors } from '@/store/slices/user/user.slice'
import Loader from '@/components/Loader'
import { signOut } from 'next-auth/react'
import { useAppDispatch } from '@/store/hooks/useAppDispatch'
import { useModal } from '@/contexts/ModalProvider'
import { services } from '@/services/index.service'
import { utils } from '@/utils/utils'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
    width: 8,
    height: 8,
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: 'var(--mui-palette-success-main)',
    boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {

    // States
    const modalContext = useModal();

    const [open, setOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false);

    const user = useAppSelector(userSelectors.user);
    const isSignedIn = useAppSelector(userSelectors.isSignedIn);
    const userStatus = useAppSelector(userSelectors.userStatus);
    const loading = userStatus === "loading";

    // Refs
    const anchorRef = useRef<HTMLDivElement>(null)

    // Hooks
    const router = useRouter()
    const dispatch = useAppDispatch();

    const { settings } = useSettings()

    const handleDropdownOpen = () => {
        !open ? setOpen(true) : setOpen(false)
    }

    const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
        if (url) {
            router.push(url)
        }

        if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
            return
        }

        setOpen(false)
    }

    const handleUserLogout = async () => {
        try {
            setLoggingOut(true)
            if (isSignedIn) {
                const us = new services.client.UserService();
                await us.logout()
                await signOut({
                    redirect: false,
                });
                dispatch(userActions.resetUser());
            }
            router.push("/login");
        } catch (error) {
            utils.toast.error({
                message: utils.error.getMessage(error)
            });
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

    if (loading) {
        return <Loader size='sm' />
    }

    const handlerRouteShift = () => {
        router.push("/admin/settings")
    }


    return (
        <>
            <Badge
                ref={anchorRef}
                overlap='circular'
                badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                className='mis-2'
            >
                <Avatar
                    ref={anchorRef}
                    alt={user?.name}
                    src={user?.profilePicture ?? '/images/avatars/1.png'}
                    onClick={handleDropdownOpen}
                    className='cursor-pointer bs-[38px] is-[38px]'
                />
            </Badge>
            <Popper
                open={open}
                transition
                disablePortal
                placement='bottom-end'
                anchorEl={anchorRef.current}
                className='min-is-[240px] !mbs-3 z-[1]'
            >
                {({ TransitionProps, placement }) => (
                    <Fade
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
                        }}
                    >
                        <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
                            <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                                <MenuList>
                                    <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                                        <Avatar alt={user?.name} src='/images/avatars/1.png' />
                                        <div className='flex items-start flex-col'>
                                            <Typography className='font-medium limit_sentense' color='text.primary'>
                                                {user?.name}
                                            </Typography>
                                            <Typography variant='caption'>{user?.email}</Typography>
                                        </div>
                                    </div>
                                    <Divider className='mlb-1' />
                                   

                                    {true ?
                                        <>
                                            <MenuItem className='mli-2 gap-3' onClick={e => {
                                                handleDropdownClose(e)
                                                handlerRouteShift()
                                                }}>
                                                <i className='tabler-user text-[22px]' />
                                                <Typography color='text.primary'>My Profile</Typography>
                                            </MenuItem>
                                        </>
                                        : null}

                                    

                                    <div className='flex items-center plb-2 pli-3'>
                                        <Button
                                            fullWidth
                                            variant='contained'
                                            color='error'
                                            size='small'
                                            endIcon={<i className='tabler-logout' />}
                                            onClick={handleUserLogout}
                                            sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                                        >
                                            {loggingOut ? `Loggging out...` : `Logout`}
                                        </Button>
                                    </div>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </>
    )
}

export default UserDropdown
