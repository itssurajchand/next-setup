import { IRequestArgs } from '@/app/api/types'
import { dbConfig } from '@/configs/dbConfig'
import MovieModel, { IMovie } from '@/models/movie.model'
import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import { middlewares } from '@/utils/middlewares'
import { utils } from '@/utils/utils'
import mongoose from 'mongoose'
import { schemas } from '../../../schemas'

export async function GET(request: Request, args: IRequestArgs<{ movieId: string }>) {
  return utils.errorHandler(async function () {
    await dbConfig()

    await middlewares.withUser(request, {
      withUser: true,
      withProfileCompleted: true
    })

    const currentDate = new Date()
    const { movieId } = await schemas.getMovieAppSchema.validate({ movieId: args.params.movieId })

    let movies = await MovieModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(movieId),
          status: utils.CONST.MOVIE.STATUS.ACTIVE,
          bunnyProcessingStatus: utils.CONST.BUNNY.VIDEO.STATUS.FINISHED,
          availableTill: { $gt: currentDate }
        }
      },
      {
        $lookup: {
          localField: '_id',
          foreignField: 'movieId',
          from: 'movieCategoryMappings',
          as: 'categories',
          pipeline: [
            {
              $lookup: {
                localField: 'categoryId',
                foreignField: '_id',
                from: 'categories',
                as: 'category'
              }
            },
            {
              $unwind: '$category'
            },
            {
              $match: {
                'category.status': utils.CONST.CATEGORY.STATUS.ACTIVE
              }
            },
            {
              $project: {
                _id: 1,
                categoryId: 1,
                status: '$category.status',
                categoryName: '$category.name'
              }
            }
          ]
        }
      },
      {
        $match: {
          categories: { $ne: [] }
        }
      }
    ])

    if (!movies.length) {
      throw ErrorHandlingService.notFound({
        message: utils.CONST.RESPONSE_MESSAGES._NOT_FOUND.replace('[ITEM]', 'Movie')
      })
    }

    let movie = movies[0] as IMovie

    if (movie.trailerGuid && movie.bunnyTrailerProcessingStatus !== utils.CONST.BUNNY.VIDEO.STATUS.FINISHED) {
      throw ErrorHandlingService.somethingWentWrong({
        message: utils.CONST.RESPONSE_MESSAGES._IN_PROGRESS.replace('[ITEM]', 'Trailer upload')
      })
    }

    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          movie
        }
      })
    )
  })
}
