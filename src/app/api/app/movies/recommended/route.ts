import { dbConfig } from '@/configs/dbConfig'
import { middlewares } from '@/utils/middlewares'
import { utils } from '@/utils/utils'
import { schemas } from '../../../schemas'
import { services } from '@/services/index.service'
import CategoryModel from '@/models/category.model'
import MovieCategoryMappingModel from '@/models/movieCategoryMapping.model'

export async function GET(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const currentDate = new Date()
    const url = new URL(request.url)
    const params = new URLSearchParams(url.search)
    const fcms = services.server.FavouriteCategoryMappingService

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
      sort = 'premieresOn',
      order = 'asc'
    } = await schemas.paginationSchema.validate({
      ...(body ?? {}),
      userId: authData.id
    })

    const noPagination = page === 0

    const favourityCategoryIds = await fcms.findMappingsByUserId(authData.userId)

    const categoryIds = favourityCategoryIds?.categoryIds ?? []

    const activeCategories = await CategoryModel.find({
      _id: {
        $in: categoryIds
      },
      status: utils.CONST.CATEGORY.STATUS.ACTIVE
    }).select('_id')

    const activeCategoriesIds = activeCategories.map(c => c._id)

    const total = await MovieCategoryMappingModel.aggregate([
      {
        $match: {
          categoryId: {
            $in: activeCategoriesIds
          }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: 'movies'
        }
      },
      {
        $unwind: '$movies'
      },
      {
        $group: {
          _id: '$movies._id',
          name: { $first: '$movies.name' },
          premieresOn: { $first: '$movies.premieresOn' },
          bunnyProcessingStatus: { $first: '$movies.bunnyProcessingStatus' },
          availableTill: { $first: '$movies.availableTill' },
          status: { $first: '$movies.status' },
          trailerGuid: { $first: '$movies.trailerGuid' },
          videoGuid: { $first: '$movies.videoGuid' },
          bunnyTrailerProcessingStatus: { $first: '$movies.bunnyTrailerProcessingStatus' }
        }
      },
      {
        $match: {
          ...(query && {
            name: new RegExp(query, 'gi')
          }),
          status: utils.CONST.MOVIE.STATUS.ACTIVE,
          bunnyProcessingStatus: utils.CONST.BUNNY.VIDEO.STATUS.FINISHED,
          availableTill: { $gte: currentDate },
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
          ]
        }
      }
    ])

    const totalCount = total.length

    const moviesQuery = MovieCategoryMappingModel.aggregate([
      {
        $match: {
          categoryId: {
            $in: activeCategoriesIds
          }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: 'movies'
        }
      },
      {
        $unwind: '$movies'
      },
      {
        $group: {
          _id: '$movies._id',
          movieId: { $first: '$movies._id' },
          name: { $first: '$movies.name' },
          premieresOn: { $first: '$movies.premieresOn' },
          status: { $first: '$movies.status' },
          duration: { $first: '$movies.duration' },
          ageTag: { $first: '$movies.ageTag' },
          bunnyProcessingStatus: { $first: '$movies.bunnyProcessingStatus' },
          availableTill: { $first: '$movies.availableTill' },
          bunnyTrailerProcessingStatus: { $first: '$movies.bunnyTrailerProcessingStatus' },
          trailerGuid: { $first: '$movies.trailerGuid' },
          videoGuid: { $first: '$movies.videoGuid' }
        }
      },
      {
        $match: {
          ...(query && {
            name: new RegExp(query, 'gi')
          }),
          status: utils.CONST.MOVIE.STATUS.ACTIVE,
          bunnyProcessingStatus: utils.CONST.BUNNY.VIDEO.STATUS.FINISHED,
          availableTill: { $gte: currentDate },
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
          ]
        }
      },
      {
        $lookup: {
          from: 'movieCategoryMappings',
          localField: '_id',
          foreignField: 'movieId',
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
      }
    ])
      .sort({
        [sort]: order
      })
      .project({
        trailerGuid: 0,
        videoGuid: 0,
        availableTill: 0,
        bunnyProcessingStatus: 0,
        bunnyTrailerProcessingStatus: 0,
        status: 0,
        movieId: 0
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
