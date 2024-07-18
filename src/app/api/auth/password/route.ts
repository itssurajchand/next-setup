import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import { utils } from '@/utils/utils'
import { schemas } from '../../schemas'
import { dbConfig } from '@/configs/dbConfig'
import { services } from '@/services/index.service'
import { middlewares } from '@/utils/middlewares'

export async function PATCH(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const us = services.server.UserService
    const body = await utils.getReqBody(request)

    const validatedData = await schemas.updatePasswordSchema.validate(body ?? {})

    const { oldPassword, password: newPassword } = validatedData

    const authData = await middlewares.withUser(request, {
      select: ['password']
    })

    const passwordMatched = await utils.bcrypt.comparePassword(oldPassword, authData.password)

    if (!passwordMatched) {
      throw ErrorHandlingService.badRequest({
        message: utils.CONST.RESPONSE_MESSAGES.INVALID_OLD_CREDENTIALS
      })
    }

    const password = await utils.bcrypt.hashPassword(newPassword)

    await us.updateUser(authData.userId, {
      password
    })

    return Response.json(
      utils.generateRes({
        status: true,
        message: utils.CONST.RESPONSE_MESSAGES._UPDATED_SUCCESSFULLY.replace('[ITEM]', 'Password')
      })
    )
  })
}
