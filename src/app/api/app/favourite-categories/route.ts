import { utils } from '@/utils/utils'
import { schemas } from '../../schemas'
import { dbConfig } from '@/configs/dbConfig'
import { services } from '@/services/index.service'
import { middlewares } from '@/utils/middlewares'
import FavouriteCategoryMappingModel from '@/models/favouriteCategoryMapping.model'

export async function GET(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const authData = await middlewares.withUser(request, {
      withUser: true
    })

    const favouriteCategories = await FavouriteCategoryMappingModel.aggregate([
      {
        $match: {
          userId: authData.userId
        }
      },
      {
        $lookup: {
          localField: 'categoryIds',
          foreignField: '_id',
          from: 'categories',
          as: 'categories',
          pipeline: [
            {
              $match: {
                status: 1
              }
            },
            {
              $project: {
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$categories'
      },
      {
        $replaceRoot: {
          newRoot: '$categories'
        }
      }
    ])

    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          favouriteCategories
        }
      })
    )
  })
}

export async function POST(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const user = await middlewares.withUser(request, {
      withUser: true,
      select: ['profileCompleted']
    })

    const body = await utils.getReqBody(request)

    const { categoryIds } = await schemas.addFavouriteCategoriesSchema.validate(body)

    const us = services.server.UserService
    const fcms = services.server.FavouriteCategoryMappingService

    let categoryMapping = await fcms.findMappingsByUserId(user.userId)

    if (categoryMapping) {
      await fcms.deleteMapping(user.userId)
    }

    let favouriteCategories = await fcms.createMapping({
      userId: user.userId,
      categoryIds: categoryIds as any[]
    })

    if (!user['profileCompleted']) {
      await us.updateUser(user.userId, {
        profileCompleted: true
      })
    }

    return Response.json(
      utils.generateRes({
        status: true,
        message: utils.CONST.RESPONSE_MESSAGES[
          user['profileCompleted'] ? '_UPDATED_SUCCESSFULLY' : '_ADDED_SUCCESSFULLY'
        ].replace('[ITEM]', 'Favourite categories'),
        data: {
          favouriteCategories: favouriteCategories.categoryIds,
          user: !user['profileCompleted']
            ? {
                profileCompleted: true
              }
            : null
        }
      })
    )
  })
}
