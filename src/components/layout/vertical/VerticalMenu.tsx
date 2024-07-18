'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import Loader from '@/components/Loader'
import verticalMenuData from '@/data/navigation/verticalMenuData'
import { useAppSelector } from '@/store/hooks/useAppSelector'
import { userSelectors } from '@/store/slices/user/user.slice'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
    open?: boolean
    transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
    scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
    <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
        <i className='tabler-chevron-right' />
    </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
    // Hooks
    const theme = useTheme()
    const verticalNavOptions = useVerticalNav()
    const { settings } = useSettings()
    const { isBreakpointReached } = useVerticalNav()
    const isCreatorLoggedIn = useAppSelector(userSelectors.isCreatorLoggedIn);
    const loading = useAppSelector(userSelectors.userStatus) === "loading";

    const menuItems = verticalMenuData();

    // Vars
    const { transitionDuration } = verticalNavOptions

    const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

    return (
        // eslint-disable-next-line lines-around-comment
        /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
        <ScrollWrapper
            {...(isBreakpointReached
                ? {
                    className: 'bs-full overflow-y-auto overflow-x-hidden',
                    onScroll: container => scrollMenu(container, false)
                }
                : {
                    options: { wheelPropagation: false, suppressScrollX: true },
                    onScrollY: container => scrollMenu(container, true)
                })}
        >
            {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
            {/* Vertical Menu */}
            {loading ?
                <div className='flex justify-center mt-2'>
                    <Loader size='md' />
                </div> :
                <Menu
                    popoutMenuOffset={{ mainAxis: 23 }}
                    menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
                    renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
                    renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
                    menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
                >

                    {menuItems.map((currMenuItem, index) => {
                        if ("for" in currMenuItem) {
                            if (isCreatorLoggedIn && currMenuItem.for === "creator" || !isCreatorLoggedIn && currMenuItem.for === "admin") {

                                if (currMenuItem.options) {
                                    return (<SubMenu
                                        key={`currMenuItem${index}`}
                                        label={currMenuItem.label}
                                        icon={<i className={currMenuItem.icon} />}
                                    >
                                        {currMenuItem.options.map((currOption, index_) => {
                                            if ("href" in currOption) {
                                                return <MenuItem key={`currMenuItem${index}Option${index_}`} href={currOption.href}>{currOption.label}</MenuItem>
                                            }
                                        })}
                                    </SubMenu>)
                                }

                                return (
                                    <MenuItem
                                        key={`currMenuItem${index}`}
                                        href={currMenuItem.href}
                                        icon={<i className={currMenuItem.icon} />}>
                                        {currMenuItem.label}
                                    </MenuItem>
                                )
                            }
                        }

                        return null;
                    })
                    }

                </Menu>}
            {/* <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
      </Menu> */}
        </ScrollWrapper >
    )
}

export default VerticalMenu
