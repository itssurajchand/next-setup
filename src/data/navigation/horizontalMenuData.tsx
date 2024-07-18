// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
    {
        label: 'Home',
        href: '/',
        icon: 'tabler-smart-home',
        for: "creator"
    },
    {
        label: 'About',
        href: '/about',
        icon: 'tabler-info-circle',
        for: "creator"
    },
    {
        label: 'Home',
        href: '/admin',
        icon: 'tabler-info-home',
        for: "admin"
    }
]

export default horizontalMenuData
