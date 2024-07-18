import { errorHandler } from './errorHandler'
import { formDataToJson } from './formDataToJson'
import { generateRes } from './generateRes'
import { getInitials } from './getInitials'
import { string } from './string'
import { bcrypt } from './bcrypt'
import { CONST } from '@/constants/index.const'
import { dom } from './dom'
import { object } from './object'
import { file } from './file'
import { error } from './error'
import { getReqBody } from './getReqBody'
import { jwt } from './jwt'
import { isJson } from './isJson'
import { getParsedJson } from './getParsedJson'
import { searchParamsToJson } from './searchParamsToJson'
import { toast } from './toast'
import { date } from './date'

export const utils = {
  toast,
  date,
  getReqBody,
  object,
  dom,
  jwt,
  file,
  getParsedJson,
  error,
  CONST,
  bcrypt,
  isJson,
  errorHandler,
  formDataToJson,
  generateRes,
  getInitials,
  searchParamsToJson,
  string,
}
