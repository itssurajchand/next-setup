import { CONST } from '@/constants/index.const'
import UserModel, { IUser as IUserModel } from '@/models/user.model'
import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import mongoose from 'mongoose'
import { IUser } from '../../next-auth'
import { jwt } from './jwt'
import { services } from '@/services/index.service'

type IUserDetails = {
  id: IUser['id']
  type: IUser['type']
  iat: number
  exp: number
  profileCompleted: IUser['profileCompleted']
}

type IWithUserOptions = Partial<{
  withAdmin: boolean
  withUser: boolean
  withCreator: boolean
  withProfileCompleted: boolean
  select?: (keyof IUserModel)[]
}>

const auth = async (request: Request) => {
  let token: string = ''
  const uss = services.server.UserSessionService
  const authorization = request.headers.get('authorization') ?? ''
  const tokenParts = authorization.split(' ')
  let userDetails: IUserDetails | null = null

  let bearerTokenSent = tokenParts.length === 2 && tokenParts[0] === 'Bearer'

  if (bearerTokenSent) {
    token = tokenParts[1]
    userDetails = jwt.verifyToken(token) as IUserDetails
  } else {
    throw ErrorHandlingService.badRequest({
      message: CONST.RESPONSE_MESSAGES.MISSING_AUTH_HEADER
    })
  }

  const session = await uss.findSessionByToken(token)

  if (!session) {
    throw ErrorHandlingService.badRequest({
      data: {
        logout: true
      }
    })
  }

  await uss.updateSessionByToken(token, {
    lastLogin: new Date()
  })

  return { ...userDetails, token }
}

const optionalAuth = async (request: Request) => {
  let token: string | null = null
  const uss = services.server.UserSessionService
  const authorization = request.headers.get('authorization') ?? ''
  const tokenParts = authorization.split(' ')
  let userDetails: IUserDetails | null = null
  let bearerTokenSent = tokenParts.length === 2 && tokenParts[0] === 'Bearer'

  if (bearerTokenSent) {
    token = tokenParts[1]
    userDetails = jwt.verifyToken(token) as IUserDetails
  }

  if (token) {
    const session = await uss.findSessionByToken(token)

    if (!session) {
      throw ErrorHandlingService.badRequest({
        data: {
          logout: true
        }
      })
    }

    await uss.updateSessionByToken(token, {
      lastLogin: new Date()
    })
  }

  return userDetails
}

const withUser = async (request: Request, options?: IWithUserOptions) => {
  const authData = await auth(request)

  if (options?.withProfileCompleted) {
    options = {
      ...options,
      select: [...(options?.select ?? []), 'profileCompleted']
    }
  }

  const select = [...new Set(['email', 'type', ...(options?.select ?? [])])]

  const user = await UserModel.findById(new mongoose.Types.ObjectId(authData.id!)).select(select.join(' '))

  if (!user) {
    throw ErrorHandlingService.userNotFound()
  }

  if (options?.withAdmin) {
    if (user.type !== CONST.USER.TYPES.ADMIN) {
      throw ErrorHandlingService.unAuthorized({
        message: "You aren't an admin"
      })
    }
  } else if (options?.withUser) {
    if (user.type !== CONST.USER.TYPES.USER) {
      throw ErrorHandlingService.unAuthorized({
        message: "You aren't a user"
      })
    } else if (options?.withProfileCompleted && !user.profileCompleted) {
      throw ErrorHandlingService.unAuthorized({
        message: "You profile isn't completed"
      })
    }
  } else if (options?.withCreator) {
    if (user.type !== CONST.USER.TYPES.CREATOR) {
      throw ErrorHandlingService.unAuthorized({
        message: "You aren't a creator"
      })
    }
  }

  return {
    ...authData,
    userId: user._id as any,
    ...user.toJSON()
  }
}

const middlewares = {
  optionalAuth,
  auth,
  withUser
}

export { middlewares }
