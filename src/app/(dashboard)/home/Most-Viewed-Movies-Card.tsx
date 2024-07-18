'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import { useColorScheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Types Imports
import type { ThemeColor, SystemMode } from '@core/types'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import CustomChip from '@/@core/components/mui/Chip'

type DataType = {
  date: string
  name: string,
  duration: string,
  imgName?: string,
  views: number,
  creator: string,
  status: 'Active' | 'Inactive'
}

type StatusObj = Record<
  DataType['status'],
  {
    text: string
    color: ThemeColor
  }
>

// Vars
const data: DataType[] = [
  {
    date: `12 Feb ${new Date().getFullYear()}`,
    name: "Aprichit",
    duration: "3 min",
    creator: "Atul",
    views: 3,
    status: 'Active'
  },
  {
    name: "Maharaja",
    duration: "30 min",
    creator: "Atul",
    status: 'Active',
    views: 6,
    date: `12 Feb ${new Date().getFullYear()}`
  },
  {
    name: "Golden Heights",
    duration: "1 hour",
    creator: "Atul",
    status: 'Inactive',
    views: 12,
    date: `28 Feb ${new Date().getFullYear()}`
  },
  {
    name: "Spider",
    duration: "2 hours",
    creator: "Atul",
    status: 'Active',
    views: 16,
    date: `08 Jan ${new Date().getFullYear()}`
  }
]

const statusObj: StatusObj = {
  Inactive: { text: 'Inactive', color: 'error' },
  Active: { text: 'Active', color: 'success' }
}

const MostViewedMoviesCard = ({ serverMode }: { serverMode: SystemMode }) => {
  // Hooks
  const { mode } = useColorScheme()

  // Vars
  const _mode = (mode === 'system' ? serverMode : mode) || serverMode

  return (
    <Card>
      <CardHeader
        title='Most Viewed Movies'
        action={<OptionMenu options={['Show all entries', 'Refresh', 'Download']} />}
      />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead className='uppercase'>
            <tr className='border-be'>
              <th className='leading-6 plb-4 pis-6 pli-2'>Movie Name</th>
              <th className='leading-6 plb-4 pli-2'>View Count</th>
              <th className='leading-6 plb-4 pli-2'>Status</th>
              <th className='leading-6 plb-4 pie-6 pli-2 text-right'>Duration</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className='border-0'>
                <td className='pis-6 pli-2 plb-3'>
                  <div className='flex items-center gap-4'>

                    <div className='flex flex-col'>
                      <Typography color='text.primary'>{row.name}</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        {/* {row.cardType} */}
                      </Typography>
                    </div>
                  </div>
                </td>
                <td className='pli-2 plb-3'>
                  <div className='flex flex-col'>
                    <Typography color='text.primary'>{row.views}</Typography>

                  </div>
                </td>
                <td className='pli-2 plb-3'>
                  <CustomChip
                    variant='tonal'
                    size='small'
                    className='!w-[73px]'
                    label={statusObj[row.status].text}
                    color={statusObj[row.status].color}
                    sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                  />
                </td>
                <td className='pli-2 plb-3 pie-6 text-right'>
                  <Typography color='text.primary'>{row.duration}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default MostViewedMoviesCard
