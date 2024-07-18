import { dbConfig } from '@/configs/dbConfig'
import { middlewares } from '@/utils/middlewares'
import { movie } from '@/utils/movie'
import { utils } from '@/utils/utils'
import { schemas } from '../../schemas'
import { services } from '@/services/index.service'

export async function GET(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const fcms = services.server.FavouriteCategoryMappingService

    // Fetching user data with specific fields
    const authData = await middlewares.withUser(request, {
      withUser: true,
      withProfileCompleted: true,
      select: ['profileCompleted', 'approved', 'profilePicture', 'name', 'email']
    })

    // Parsing pagination parameters from request URL
    const {
      page = 1,
      limit = 10,
      query
    } = await schemas.paginationSchema.validate({
      ...(utils.searchParamsToJson({ params: new URLSearchParams(new URL(request.url).search) }) ?? {}),
      userId: authData.userId
    })

    // Fetching all active categories
    const categories = await services.server.CategoryService.getAllActiveCategories()

    // Fetching recommended movies based on user preferences
    const favouriteCategoryIds = await fcms.findMappingsByUserId(authData.userId)
    const categoryIds = (favouriteCategoryIds?.categoryIds ?? []) as unknown as string[]

    const recommendedResult = await movie.fetchMoviesByCategory({
      categoryIds,
      limit,
      page,
      query
    })
    const recommendedMovies = recommendedResult.movies
    const hasMoreRecommended = recommendedResult.totalCount > limit * page

    // Fetching latest movies
    const latestResult = await movie.fetchMovies({
      limit,
      page,
      type: 'latest'
    })
    const lastestMovies = latestResult.movies
    const hasMoreLatest = latestResult.totalCount > limit * page

    // Fetching trending movies
    const trendingResult = await movie.fetchMovies({
      limit,
      page,
      type: 'trending',
      query
    })
    const trendingMovies = trendingResult.movies
    const hasMoreTrending = trendingResult.totalCount > limit * page

    // Placeholder for continue watching movies
    const continueWatchingResult = {
      movies: [],
      totalCount: 0
    }
    const continueWatching = continueWatchingResult.movies
    const hasMoreContinueWatching = continueWatchingResult.totalCount > limit * page

    // Constants for dashboard sections
    const SECTIONS = utils.CONST.APP_CONST.DASHBOARD.SECTIONS

    // User data
    const user = {
      id: authData._id,
      subscribed: false,
      type: authData.type,
      profileCompleted: authData?.profileCompleted,
      profilePicture: authData.profilePicture ?? '',
      name: authData.name,
      email: authData.email
    }

    // Generating response with data
    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          user,
          categories,
          sections: [
            ...(trendingMovies.length
              ? [
                  {
                    title: SECTIONS.TRENDING.TITLE,
                    slug: SECTIONS.TRENDING.SLUG,
                    data: trendingMovies,
                    hasMore: hasMoreTrending
                  }
                ]
              : []),
            ...(continueWatching.length
              ? [
                  {
                    title: SECTIONS.CONTINUE.TITLE,
                    slug: SECTIONS.CONTINUE.SLUG,
                    data: continueWatching,
                    hasMore: hasMoreContinueWatching
                  }
                ]
              : []),
            ...(lastestMovies.length
              ? [
                  {
                    title: SECTIONS.LATEST.TITLE,
                    slug: SECTIONS.LATEST.SLUG,
                    data: lastestMovies,
                    hasMore: hasMoreLatest
                  }
                ]
              : []),
            ...(recommendedMovies.length
              ? [
                  {
                    title: SECTIONS.RECOMMENDED.TITLE,
                    slug: SECTIONS.RECOMMENDED.SLUG,
                    data: recommendedMovies,
                    hasMore: hasMoreRecommended
                  }
                ]
              : [])
          ]
        }
      })
    )
  })
}
