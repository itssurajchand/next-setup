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
    const validatedData = await schemas.forgotPasswordSchema.validate(body ?? {})
    const { email } = validatedData
    

    const us = services.server.UserService
    const existingUser = await us.findUserByEmail(email)

    if (existingUser) {
        
        return Response.json(
          utils.generateRes({
            status: true,
            message: 'Forgot password mail sent successfully'
          })
        )
    } else {
        return Response.json(
            utils.generateRes({
              status: true,
              message: 'Please write correct email'
            })
          )
    } 

  })
}
