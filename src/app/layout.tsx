// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'
import 'react-toastify/dist/ReactToastify.css';

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Meuve',
    description:
        'Meuve - Start Streaming Now! - Get ready to dive into greatest movies platfrom',
    icons: {
        icon: '/favicon.svg',
    },
}

const RootLayout = ({ children }: ChildrenType) => {
    // Vars
    const direction = 'ltr'

    return (
        <html id='__next' lang='en' dir={direction}>
            <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
        </html>
    )
}

export default RootLayout
