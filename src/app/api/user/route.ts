import UserModel from '@/models/user.model'
import { utils } from '@/utils/utils'
import { IUser } from '../types'
import { dbConfig } from '@/configs/dbConfig'
import { middlewares } from '@/utils/middlewares'
import { ErrorHandlingService } from '@/services/ErrorHandling.service'
import { services } from '@/services/index.service'
import { schemas } from '../schemas'

export async function GET(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const authData = await middlewares.withUser(request)
    const userId = authData.userId

    const users = await UserModel.aggregate([
      {
        $match: {
          _id: userId
        }
      }
    ])

    const user = users[0]

    let data: IUser = {
      _id: user._id,
      name: user.name,
      type: user.type,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      email: user.email,
      approved: user.approved,
      profilePicture: user.profilePicture ?? null,
      profileCompleted: user.profileCompleted ?? false
    }

    return Response.json(
      utils.generateRes({
        status: true,
        data: {
          user: data
        }
      })
    )
  })
}

export async function PATCH(request: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()

    const body = await utils.getReqBody(request)
    const validatedData = await schemas.editProfileSchema.validate(body ?? {})
    const { name, email, orignalemail, id } = validatedData
    let phoneNo:any | null = null  
    let phoneCo:any | null = null  
    let {phoneCode, phoneNumber} = validatedData
    const us = services.server.UserService
    const existingUser = await us.findUserByEmail(email)
    if (existingUser) {
      phoneCo = (phoneCode ?? existingUser.phoneCode)
      phoneNo = (phoneNumber ?? existingUser.phoneNumber)
      if (existingUser.email === email && email !== orignalemail) {
        throw ErrorHandlingService.userNotFound({
          message: 'Email Id already exists'
        })
      } else if (existingUser.email === orignalemail && email === orignalemail) {
        const commonKeysValues = {
          name,
          email,
          phoneCode : phoneCo,
          phoneNumber : phoneNo
        }
        
        let user = await us.updateUser(id, commonKeysValues)

        return Response.json(
          utils.generateRes({
            status: true,
            data: user,
            message: 'Details Updated successfully'
          })
        )
      }
    } else {
      if (!existingUser) {
        const commonKeysValues = {
          name,
          email,
          phoneCode : phoneCo ?? "",
          phoneNumber : phoneNo ?? ""
        }

        let user = await us.updateUser(id, commonKeysValues)

        return Response.json(
          utils.generateRes({
            status: true,
            data: user,
            message: 'Details Updated successfully'
          })
        )
      }
    }
  })
}
