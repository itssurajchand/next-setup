type IUploadUserProfilePictureArgs = {
  profileBase64Code: string
  accessToken?: string
}

type IUploadUserProfilePicture = (data: IUploadUserProfilePictureArgs) => Promise<any>

export type IUserServiceTypes = {
  IUploadUserProfilePicture: IUploadUserProfilePicture
  IUploadUserProfilePictureArgs: IUploadUserProfilePictureArgs
}

export interface IPaginationArgs {
  query?: string
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}