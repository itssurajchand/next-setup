import { NextResponse } from 'next/server'

import MovieModel from '@/models/movie.model'
import { services } from '@/services/index.service'

export async function POST(request: Request) {
  const body = await request.json()
  const { VideoGuid, Status } = body

  const bs = services.thirdParty.BunnyService

  const getVideoResponse = await bs.getVideo({
    videoGuid: VideoGuid
  })

  const movie = await MovieModel.findOne({
    $or: [
      {
        videoGuid: VideoGuid
      },
      {
        trailerGuid: VideoGuid
      }
    ]
  })

  if (movie) {
    const isMovie = movie.videoGuid === VideoGuid

    await MovieModel.findByIdAndUpdate(movie.id, {
      [isMovie ? 'bunnyProcessingStatus' : 'bunnyTrailerProcessingStatus']: Status,
      [isMovie ? 'duration' : 'trailerDuration']: getVideoResponse.length
    })

    console.info(
      `Update: Movie with ${isMovie ? 'videoGuid' : 'trailerGuid'} updated ${isMovie ? 'bunnyProcessingStatus' : 'bunnyTrailerProcessingStatus'} to ${Status}`
    )
  } else {
    console.info(`Update: No movie found with videoGuid or trailerGuid equal to ${VideoGuid}`)
  }

  return NextResponse.json({})
}

export async function PUT(request: Request) {
  const body = await request.json()

  const data = { message: `Updated name to ${body.name}` }

  return NextResponse.json(data)
}
