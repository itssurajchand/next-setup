import { getServerMode } from "@/@core/utils/serverHelpers"
import MovieDetailCard from "./home/Movie-Detail-Card"
import Grid from '@mui/material/Grid'
import dynamic from "next/dynamic"

const MostViewedMoviesCard = dynamic(() => import('./home/Most-Viewed-Movies-Card'))

export default function Page() {
    const mode = getServerMode() 
    return <>
        <Grid item xs={12} md={6}>
            <MovieDetailCard />
        </Grid>
        <br />
        <Grid item xs={6} md={6}>
            <MostViewedMoviesCard serverMode={mode} />
        </Grid>
    </>
}
