import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import { utils } from '@/utils/utils'
import { schemas } from '../../schemas'
import { dbConfig } from '@/configs/dbConfig'
import { services } from '@/services/index.service'

export async function POST(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const body = await utils.getReqBody(request)
    const validatedData = await schemas.signInSchema.validate(body ?? {})
    const { email, password } = validatedData

    const us = services.server.UserService
    const uss = services.server.UserSessionService
    const existingUser = await us.findUserByEmail(email)

    if (!existingUser) {
      throw ErrorHandlingService.userNotFound()
    }

    const passwordMatched = await utils.bcrypt.comparePassword(password, existingUser.password)

    if (!passwordMatched) {
      throw ErrorHandlingService.badRequest({
        message: utils.CONST.RESPONSE_MESSAGES.INVALID_CREDENTIALS
      })
    }

    const isCreator = existingUser.type === utils.CONST.USER.TYPES.CREATOR

    const commonKeysValues = {
      id: existingUser._id,
      type: existingUser.type,
      profileCompleted: existingUser?.profileCompleted,
      approved: !isCreator || existingUser.approved,
      profilePicture: existingUser.type === 3 ? existingUser.profilePicture ?? '' : existingUser.profilePicture,
      name: existingUser.name,
      email: existingUser.email
    }

    if (!commonKeysValues.approved) {
      throw ErrorHandlingService.unAuthorized({
        data: {
          unapproved: true
        },
        message: utils.CONST.RESPONSE_MESSAGES.UNAPPROVED
      })
    }

    const token = utils.jwt.generateToken(commonKeysValues)

    await uss.createSession({
      userId: existingUser._id as any,
      lastLogin: new Date(),
      token,
      userType: existingUser.type
    })

    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          token,
          user: commonKeysValues
        },
        message: 'User logged in successfully'
      })
    )
  })
}
