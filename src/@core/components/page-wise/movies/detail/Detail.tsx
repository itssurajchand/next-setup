"use client"
import CustomTabList from '@/@core/components/mui/TabList'
import { IMovie } from '@/models/movie.model'
import { useAppDispatch } from '@/store/hooks/useAppDispatch'
import { movieThunks } from '@/store/slices/movie/movie.thunk'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Card, CardMedia, Grid, Tab } from '@mui/material'
import React, { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import AboutOverview from './tabs/AboutOverview'


const Detail = ({ props }: { props?: any }) => {

    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = useState('About')
    const [movie, setMovie] = useState<IMovie | null>(null)

    const handleTabChange = (event: SyntheticEvent, value: string) => {
        setActiveTab(value)
    }

    const handleGetMovieById = async (movieId: string) => {

        const moviedata = await dispatch(movieThunks.get(movieId));
        if (moviedata) {
            setMovie((moviedata?.payload as any)?.data?.movie)
        }
    }

    const tabContentList = (data?: any, activeTab?: string) => {
        switch (activeTab) {
            case "About": return <AboutOverview data={data} />
            // case "Status" : <AboutOverview data={data?.users.profile} /> 
            // case "Payouts" : <AboutOverview data={data?.users.profile} /> 
            // case "Downloads" : <AboutOverview data={data?.users.profile} /> 
        }
    }


    useEffect(() => {
        if (props?.params?.movieId) {
            handleGetMovieById(props?.params?.movieId)
        }
    }, [props?.params?.movieId])

    return (<>
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardMedia image={movie?.thumbnail as string} className='bs-[250px]' />
                </Card>
            </Grid>
            {activeTab === undefined ? null : (
                <Grid item xs={12} className='flex flex-col gap-6'>
                    <TabContext value={activeTab}>
                        <CustomTabList onChange={handleTabChange} variant='scrollable' pill='true'>
                            <Tab
                                label={
                                    <div className='flex items-center gap-1.5'>
                                        <i className='tabler-list-details text-lg' />
                                        About
                                    </div>
                                }
                                value='About'
                            />
                            <Tab
                                label={
                                    <div className='flex items-center gap-1.5'>
                                        <i className='tabler-file-upload text-lg' />
                                        Upload Status
                                    </div>
                                }
                                value='upload_'
                            />
                            <Tab
                                label={
                                    <div className='flex items-center gap-1.5'>
                                        <i className='tabler-download text-lg' />
                                        Downloads
                                    </div>
                                }
                                value='download'
                            />
                            <Tab
                                label={
                                    <div className='flex items-center gap-1.5'>
                                        <i className='tabler-clock-dollar text-lg' />
                                        Payouts
                                    </div>
                                }
                                value='payout'
                            />
                        </CustomTabList>

                        <TabPanel value={activeTab} className='p-0'>
                            {tabContentList((movie) as any, activeTab)}
                        </TabPanel>
                    </TabContext>
                </Grid>
            )}
        </Grid></>)
}

export default Detail