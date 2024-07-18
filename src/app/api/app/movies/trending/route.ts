import { dbConfig } from '@/configs/dbConfig'
import MovieModel from '@/models/movie.model'
import { middlewares } from '@/utils/middlewares'
import { utils } from '@/utils/utils'
import { schemas } from '../../../schemas'

export async function GET(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const url = new URL(request.url)
    const params = new URLSearchParams(url.search)

    const body = utils.searchParamsToJson({
      params
    })

    const authData = await middlewares.withUser(request, {
      withUser: true,
      withProfileCompleted: true
    })

    const {
      page = 1,
      limit = 10,
      query = null,
      sort = 'views',
      order = 'desc'
    } = await schemas.paginationSchema.validate({
      ...(body ?? {}),
      userId: authData.id
    })

    const currentDate = new Date()
    const noPagination = page === 0
    const matchStage = {
      ...(query && {
        $or: [{ name: { $regex: new RegExp(query, 'gi') } }]
      }),
      status: utils.CONST.MOVIE.STATUS.ACTIVE,
      bunnyProcessingStatus: utils.CONST.BUNNY.VIDEO.STATUS.FINISHED,
      availableTill: { $gte: currentDate },
      premieresOn: { $lte: currentDate },
      $or: [
        { trailerGuid: { $eq: null } },
        {
          $and: [
            { trailerGuid: { $ne: null } },
            {
              bunnyTrailerProcessingStatus: utils.CONST.BUNNY.VIDEO.STATUS.FINISHED
            }
          ]
        }
      ],
    }

    const totalCount = await MovieModel.countDocuments(matchStage)

    const moviesQuery = MovieModel.aggregate([
      {
        $match: matchStage
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
      },
      {
        $addFields: {
          limitedTime: {
            $cond: { if: { $eq: ['$availableTill', null] }, then: false, else: true }
          }
        }
      }
    ])
      .sort({
        [sort]: order
      })
      .project({
        name: 1,
        duration: 1,
        limitedTime: 1,
        ageTag: 1,
        categories: 1
      })

    let movies: any[] = []

    if (noPagination) {
      movies = await moviesQuery
    } else {
      movies = await moviesQuery.skip(limit * (page - 1)).limit(limit)
    }

    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          page,
          limit,
          query,
          totalCount,
          movies
        }
      })
    )
  })
}
