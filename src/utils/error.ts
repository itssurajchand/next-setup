import { CONST } from '@/constants/index.const'

const getMessage = (message: any, isError = true) => {
  if (typeof message === 'string') {
    return message
  }

  return message?.message ?? (isError ? CONST.RESPONSE_MESSAGES.SOMETHING_WENT_WRONG : CONST.RESPONSE_MESSAGES.SUCCESS)
}

const error = {
  getMessage
}

export { error }
