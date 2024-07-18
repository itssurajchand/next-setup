import Create from '@/@core/components/page-wise/movies/create/Create'
import { IRequestArgs } from '@/app/api/types'
import React from 'react'

const Page = (args: IRequestArgs<{ movieId: string }>) => {
    return (
        <Create movieId={args.params.movieId} />
    )
}

export default Page