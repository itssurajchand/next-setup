import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { AdapterUser } from 'next-auth/adapters'
import { DefaultJWT, JWT } from 'next-auth/jwt'

import { IUser as IBaseUser } from '@/models/user.model'

interface IUser {
  id?: string
  token?: string
  type?: IBaseUser['type']
  approved?: IBaseUser['approved']
  profilePicture?: IBaseUser['profilePicture']
  profileCompleted?: IBaseUser['profileCompleted']
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      error?: any
      sub?: string
      iat?: number
      exp?: number
      jti?: string
    } & IUser &
      DefaultSession['user']
  }

  interface JWT extends DefaultJWT {
    error?: any
    accessToken?: string
    refRxpiry?: Date | string | number | null
    profileCompleted?: IBaseUser['profileCompleted']
    approved?: IBaseUser['profileCompleted']
  }

  interface User extends DefaultUser, IUser {
    sub?: string
    iat?: number
    exp?: number
    jti?: string
  }
}
