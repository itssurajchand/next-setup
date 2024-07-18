import { utils } from '@/utils/utils'
import { IRequestArgs } from '@/app/api/types'
import { schemas } from '@/app/api/schemas'
import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import { dbConfig } from '@/configs/dbConfig'
import { services } from '@/services/index.service'
import { middlewares } from '@/utils/middlewares'

export async function PATCH(request: Request, args: IRequestArgs<{ id: string }>) {
  return utils.errorHandler(async function () {
    await dbConfig()

    await middlewares.withUser(request, {
      withAdmin: true
    })

    const body = await utils.getReqBody(request)

    const { approve, _id } = await schemas.approveUnapproveCreatorSchema.validate({ ...body, id: args.params.id })

    const us = services.server.UserService
    let user = await us.getUserById(_id)

    if (!user) {
      throw ErrorHandlingService.notFound({
        message: utils.CONST.RESPONSE_MESSAGES._NOT_FOUND.replace('[ITEM]', 'User')
      })
    }

    if (user.approved) {
      throw ErrorHandlingService.unAuthorized({
        message: utils.CONST.RESPONSE_MESSAGES.APPROVED_USERS_CANT_BE_UNAPPROVED
      })
    }

    user = await us.updateUser(user.id, {
      ...(typeof approve === 'boolean' && { approved: approve })
    })

    return Response.json(
      utils.generateRes({
        status: true,
        message: utils.CONST.RESPONSE_MESSAGES._UPDATED_SUCCESSFULLY.replace('[ITEM]', 'User'),
        data: {
          user
        }
      })
    )
  })
}

export async function DELETE(request: Request, args: IRequestArgs<{ id: string }>) {
  return utils.errorHandler(async function () {
    await dbConfig()

    await middlewares.withUser(request, {
      withAdmin: true
    })

    const cs = services.server.CategoryService

    const id = await schemas.objectIdSchema.required().validate(args.params.id)

    let category = await cs.getCategoryById(id)

    if (!category) {
      throw ErrorHandlingService.notFound({
        message: utils.CONST.RESPONSE_MESSAGES._NOT_FOUND.replace('[ITEM]', 'Category')
      })
    }

    category = await cs.deleteCategory(category.id)

    return Response.json(
      utils.generateRes({
        status: true,
        message: utils.CONST.RESPONSE_MESSAGES._REMOVED_SUCCESSFULLY.replace('[ITEM]', 'Category'),
        data: {
          category
        }
      })
    )
  })
}
