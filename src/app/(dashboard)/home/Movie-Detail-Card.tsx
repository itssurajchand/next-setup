// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
    icon: string
    stats: string
    title: string
    color: ThemeColor
}

const data: DataType[] = [
    {
        stats: 'Active',
        title: '30',
        color: 'primary',
        icon: 'tabler-movie'
    },
    {
        stats: 'Inactive',
        title: '13',
        color: 'error',
        icon: 'tabler-ban'
    },
    {
        stats: 'Views',
        title: '40',
        color: 'info',
        icon: 'tabler-eye'
    },
    {
        stats: 'Downloads',
        title: '15',
        color: 'success',
        icon: 'tabler-download'
    }
]

const MovieViewedMoviesCard = () => {
    return (
        <Card>
            <CardHeader
                title='Movies'
            />
            <CardContent className='flex justify-between flex-wrap gap-4 md:pbs-[10px]'>
                <Grid container spacing={4}>
                    {data.map((item, index) => (
                        <Grid key={index} item xs className='flex items-center gap-4'>
                            <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                                <i className={item.icon}></i>
                            </CustomAvatar>
                            <div className='flex flex-col'>
                                <Typography variant='h5'>{item.stats}</Typography>
                                <Typography variant='body2'>{item.title}</Typography>
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    )
}

export default MovieViewedMoviesCard
