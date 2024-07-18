import { dbConfig } from '@/configs/dbConfig'
import MovieModel from '@/models/movie.model'
import { middlewares } from '@/utils/middlewares'
import { utils } from '@/utils/utils'
import { schemas } from '../../schemas'
import { movie } from '@/utils/movie'
import { services } from '@/services/index.service'

export async function GET(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

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
      query,
      sort = 'premieresOn',
      order = 'desc',
      type = null,
      categoryIds = []
    } = await schemas.getMoviesSchema.validate({
      ...(body ?? {})
    })

    let totalCount = 0
    let hasMore = false
    let movies: any[] = []

    const paginationArgs = {
      limit,
      page,
      query,
      sort,
      order
    }

    switch (type) {
      case 'by-category':
        const moviesByCategoryResult = await movie.fetchMoviesByCategory({
          ...paginationArgs,
          categoryIds: categoryIds
        })
        totalCount = moviesByCategoryResult.totalCount
        movies = moviesByCategoryResult.movies
        break

      case 'continue':
        const continueWatchingResult = {
          movies: [],
          totalCount: 0
        }
        totalCount = continueWatchingResult.totalCount
        movies = continueWatchingResult.movies
        break

      case 'recommended':
        const favouriteCategoryIds = await fcms.findMappingsByUserId(authData.userId)
        const categoryIds_ = (favouriteCategoryIds?.categoryIds ?? []) as unknown as string[]
        const recommendedResult = await movie.fetchMoviesByCategory({
          ...paginationArgs,
          categoryIds: categoryIds_
        })
        totalCount = recommendedResult.totalCount
        movies = recommendedResult.movies
        break

      case 'recommended':
        const trendingResult = await movie.fetchMovies({
          ...paginationArgs,
          type: 'trending'
        })
        totalCount = trendingResult.totalCount
        movies = trendingResult.movies
        break

      default:
        const latestResult = await movie.fetchMovies({
          ...paginationArgs,
          type: 'latest'
        })
        totalCount = latestResult.totalCount
        movies = latestResult.movies
        break
    }

    hasMore = movies.length > limit * page

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
