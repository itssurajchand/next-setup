import { file } from '@/utils/file'
import { http } from '@/utils/http'
import { IApproveUnapproveCreator, IListCreators, IPaginationArgs, IUserServiceTypes } from '../types'
import { object } from '@/utils/object'

class UserService {
  async register(data: Record<any, any>) {
    try {
      const response = await http({
        url: 'auth/signup',
        data,
        method: 'POST'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async logout() {
    try {
      const response = await http({
        url: 'auth/logout',
        method: 'DELETE'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async listCreators(data: IListCreators) {
    try {
      const response = await http({
        url: `users/creators?${object.objectToUrlParams({ ...data })}`,
        data,
        method: 'GET'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async listUsers(data: IPaginationArgs) {
    try {
      const response = await http({
        url: `users/app-users?${object.objectToUrlParams({ ...data })}`,
        data,
        method: 'GET'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async approveUnapproveCreator(data: IApproveUnapproveCreator) {
    try {
      const response = await http({
        url: `users/creators/${data._id}`,
        data,
        method: 'PATCH'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async login(data: Record<any, any>) {
    try {
      const response = await http({
        url: 'auth/signin',
        data,
        method: 'POST'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async uploadUserProfilePicture(data: IUserServiceTypes['IUploadUserProfilePictureArgs']) {
    let formData = new FormData()
    const profilePic = file.base64ToFile(data.profileBase64Code)
    formData.append('image', profilePic)
    try {
      const response = await http({
        url: 'user/image',
        data: formData,
        formData: true,
        accessToken: data?.accessToken,
        method: 'PATCH'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async get() {
    try {
      const response = await http({
        url: 'user',
        method: 'GET'
      })
      return response.data?.user
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async editProfile(data: Record<any, any>) {
    try {
      const response = await http({
        url: 'user',
        data,
        method: 'PATCH'
      })
      return response.data
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async updatePassword(data: Record<string, any>) {
    try {
      const response = await http({
        url: 'auth/password',
        data,
        method: 'PATCH'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }

  async updateUser(data: Record<string, any>) {
    try {
      const response = await http({
        url: 'user',
        data,
        method: 'PATCH'
      })
      return response
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }
}

export { UserService }
