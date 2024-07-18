// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
    {
        label: 'Home',
        href: '/',
        icon: 'tabler-smart-home',
        for: "creator",
    },
    {
        label: 'Home',
        href: '/admin',
        icon: 'tabler-smart-home',
        for: "admin"
    },
    {
        label: 'Platform Users',
        href: '/admin/users/creators',
        icon: 'tabler-user-circle',
        for: "admin",
        options: [
            {
                label: 'Creators',
                href: '/admin/users/creators',
                for: "admin"
            },
            {
                label: 'App Users',
                href: '/admin/users/app-users',
                for: "admin"
            }
        ]
    },
    {
        label: 'Movies',
        href: '/movies/create',
        icon: 'tabler-video',
        for: "creator",
        options: [
            {
                label: 'Listing',
                href: '/movies',
                icon: 'tabler-smart-home',
                for: "creator",
            },
            {
                label: 'Create',
                href: '/movies/create',
                icon: 'tabler-smart-home',
                for: "creator",
            }
        ]
    },
    {
        label: 'Categories',
        href: '/admin/categories',
        icon: 'tabler-apps',
        for: "admin"
    },
    {
        label: 'Movies',
        href: '/admin/movies',
        icon: 'tabler-video',
        for: "admin"
    },

]

export default verticalMenuData
