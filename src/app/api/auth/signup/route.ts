import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import { utils } from '@/utils/utils'
import { IUser } from '@/models/user.model'
import { schemas } from '../../schemas'
import { dbConfig } from '@/configs/dbConfig'
import { services } from '@/services/index.service'

export async function POST(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const body = await utils.getReqBody(request)
    const validatedData = await schemas.signUpSchema.validate(body ?? {})
    const { name, email, userType: type, phoneCode, phoneNumber } = validatedData
    const password = await utils.bcrypt.hashPassword(validatedData.password)

    const us = services.server.UserService
    const uss = services.server.UserSessionService
    const existingUser = await us.findUserByEmail(email)

    if (existingUser) {
      throw ErrorHandlingService.userAlreadyExists()
    }

    const isCreator = type === utils.CONST.USER.TYPES.CREATOR

    const user = await us.createUser({
      name,
      email,
      password,
      type: type as IUser['type'],
      profileCompleted: isCreator,
      ...(isCreator && {
        phoneCode,
        phoneNumber // Convert phoneNumber to string
      })
    })

    const commonKeysValues = {
      id: user._id,
      type,
      profileCompleted: isCreator,
      approved: !isCreator,
      phoneCode: user?.phoneCode,
      phoneNumber: user?.phoneNumber,
      profilePicture: user.type === 3 ? user.profilePicture ?? '' : user.profilePicture,
      name: user?.name,
      email: user?.email
    }

    if (!commonKeysValues.approved) {
      throw ErrorHandlingService.unAuthorized({
        data: {
          unapproved: true
        },
        message: `${utils.CONST.RESPONSE_MESSAGES.SIGNUP_GREET} ${utils.CONST.RESPONSE_MESSAGES.UNAPPROVED}`
      })
    }

    const token = utils.jwt.generateToken({
      ...commonKeysValues
    })

    await uss.createSession({
      userId: user._id as any,
      lastLogin: new Date(),
      token,
      userType: user.type,
    })

    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          token,
          user: commonKeysValues
        },
        message: 'User created successfully'
      })
    )
  })
}
