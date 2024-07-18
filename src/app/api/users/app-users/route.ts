import { utils } from '@/utils/utils'
import { schemas } from '../../schemas'
import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import UserModel from '@/models/user.model'
import { dbConfig } from '@/configs/dbConfig'
import { services } from '@/services/index.service'
import { middlewares } from '@/utils/middlewares'

export async function GET(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const url = new URL(request.url)
    const params = new URLSearchParams(url.search)

    const body = utils.searchParamsToJson({
      params
    })

    const authData = await middlewares.withUser(request, {
      withAdmin: true
    })

    const {
      page = 1,
      limit = 10,
      query = null,
      sort = 'createdAt',
      order = 'desc'
    } = await schemas.paginationSchema.validate({
      ...(body ?? {}),
      userId: authData.id
    })

    const noPagination = page === 0

    const totalCount = await UserModel.countDocuments({
      type: utils.CONST.USER.TYPES.USER,
      ...(query && {
        $or: [
          {
            name: {
              $regex: new RegExp(query, 'gi')
            }
          },
          {
            email: {
              $regex: new RegExp(query, 'gi')
            }
          }
        ]
      })
    })

    const usersQuery = UserModel.aggregate([
      {
        $match: {
          type: utils.CONST.USER.TYPES.USER,
          ...(query && {
            $or: [
              {
                name: {
                  $regex: new RegExp(query, 'gi')
                }
              },
              {
                email: {
                  $regex: new RegExp(query, 'gi')
                }
              }
            ]
          })
        }
      },
      {
        $addFields: {
          id: '$_id'
        }
      }
    ])
      .project({
        password: 0,
        __v: 0
      })
      .sort({
        [sort]: order
      })

    let users: any[] = []

    if (noPagination) {
      users = await usersQuery
    } else {
      users = await usersQuery.skip(limit * (page - 1)).limit(limit)
    }

    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          page,
          limit,
          query,
          totalCount,
          users
        }
      })
    )
  })
}

export async function POST(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    await middlewares.withUser(request, {
      withAdmin: true
    })

    const body = await utils.getReqBody(request)

    const { name, status = null } = await schemas.createCategorySchema.validate(body)

    const cs = services.server.CategoryService

    let category = await cs.findCategoryByName(name, true)

    if (category) {
      throw ErrorHandlingService.conflict({
        message: utils.CONST.RESPONSE_MESSAGES._ALREADY_EXISTS.replace('[ITEM]', 'Category')
      })
    }

    category = await cs.createCategory({
      name,
      status: (status ?? 0) as any
    })

    return Response.json(
      utils.generateRes({
        status: true,
        message: utils.CONST.RESPONSE_MESSAGES._ADDED_SUCCESSFULLY.replace('[ITEM]', 'Category'),
        data: {
          category
        }
      })
    )
  })
}
