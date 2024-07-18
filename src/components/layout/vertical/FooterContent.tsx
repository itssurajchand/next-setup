'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
    return (
        <div
            className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
        >
            <p>
                <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made by `}</span>
                <Link href='#' className='text-primary uppercase'>
                Meuve
                </Link>
            </p>
        </div>
    )
}

export default FooterContent
