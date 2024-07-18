import { utils } from '@/utils/utils'

const types = utils.CONST.USER.NUMERIC_TYPES

type IUserTypeNumeric = keyof typeof types

export type IRequestArgs<T> = {
  params: T
}

export interface IUser {
  _id: string
  name: string
  phoneCode?:number
  phoneNumber?:number
  email: string
  approved: boolean
  type: IUserTypeNumeric
  profileCompleted: boolean
  profilePicture: string | null
}
