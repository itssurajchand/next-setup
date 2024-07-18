import axios, { AxiosError } from 'axios'
// import { signOut } from 'next-auth/react'
import { utils } from './utils'
import { IGenerateResFn } from './generateRes'
import type { RawAxiosRequestHeaders, AxiosHeaders, Method } from 'axios'

type MethodsHeaders = Partial<
  {
    [Key in Method as Lowercase<Key>]: AxiosHeaders
  } & { common: AxiosHeaders }
>

type IHttpProps = {
  baseUrl?: string
  accessToken?: string | null
  headers?: (RawAxiosRequestHeaders & MethodsHeaders) | AxiosHeaders
  url: string
  method: string
  data?: any
  formData?: boolean
  abortSignal?: AbortSignal
}

const IS_LOCAL_ENV = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local'
const APP_PREFIX = process.env.NEXT_PUBLIC_APP_PREFIX

let baseURL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL

if (IS_LOCAL_ENV) baseURL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL

const http = async (props: IHttpProps): Promise<IGenerateResFn> => {
  return new Promise(async (resolve, reject) => {
    const Authorization =
      props?.accessToken ?? (utils.dom.isWindowPresent() ? localStorage.getItem(`${APP_PREFIX}_access_token`) ?? null : null)

    let config = {
      baseURL: `${props.baseUrl ?? baseURL}${props?.url}`,
      method: props?.method,
      headers: {
        'Content-Type': props.formData ? 'multipart/form-data' : 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        ...(Authorization && {
          Authorization: Authorization ? `Bearer ${Authorization}` : null
        }),
        ...(props.headers ?? {})
      },
      data: props?.data
    }

    try {
      const response = await axios({
        ...config,
        ...(props.abortSignal && { signal: props.abortSignal })
      })

      if (!response?.data?.status) {
        throw new Error(response?.data?.message ?? utils.CONST.RESPONSE_MESSAGES.SOMETHING_WENT_WRONG)
      }
      return resolve(response?.data)
    } catch (error: any) {
      console.error(error)
      if (error instanceof AxiosError) {
        if (error.response?.data?.message === 'jwt expired') {
          if (utils.dom.isWindowPresent()) {
            // await signOut({
            //   redirect: true,
            //   callbackUrl: '/'
            // })
          }
        }
        return reject(error.response?.data)
      }
      return reject(error)
    }
  })
}

export { http }
