import { dbConfig } from '@/configs/dbConfig'
import { utils } from '@/utils/utils'

export async function GET(_: Request) {
  return utils.errorHandler(async function () {
    await dbConfig()
    return Response.json(
      utils.generateRes({
        status: true,
        message: utils.CONST.APP_LOG_MESSAGES_CONST.SERVER_LISTENING
      })
    )
  })
}
