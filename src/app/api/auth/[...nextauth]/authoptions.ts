import type { NextAuthOptions, User } from 'next-auth'
// eslint-disable-next-line import/no-named-as-default
import CredentialsProvider from 'next-auth/providers/credentials'

import { utils } from '@/utils/utils'
import { services } from '@/services/index.service'

let userResponse: any = {}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials: any) {
        const userService = new services.client.UserService()

        const type = credentials.type
        const data = JSON.parse(credentials.data)

        if (type === 'register') {
          const response = await userService.register(data)

          userResponse = {
            type: response.data.user.type,
            token: response.data.token,
            id: response.data.user.id,
            email: response.data.user.email,
            approved: response.data.user.approved,
            profileCompleted: response.data.user.profileCompleted
          } as User

          return Promise.resolve(userResponse)
        } else if (type === 'login') {
          const response = await userService.login(data)

          userResponse = {
            type: response.data.user.type,
            token: response.data.token,
            id: response.data.user.id,
            email: response.data.user.email,
            approved: response.data.user.approved,
            profileCompleted: response.data.user.profileCompleted
          } as User

          return Promise.resolve(userResponse)
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/'
  },
  callbacks: {
    async session({ session, token }) {
      if (Object.keys(userResponse).length) {
        session = {
          ...session,
          user: {
            id: token.id,
            _id: token._id,
            type: token.type,
            approved: token.approved,
            access_token: token.token,
            onboarding: token.onboarding
          } as User
        }
      }

      if (token) {
        session = {
          ...session,
          user: {
            ...session.user,
            ...token
          }
        }
      }

      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (Object.keys(userResponse).length || user) {
        token = {
          ...token,
          ...userResponse
        }
      }

      if (trigger === 'update') {
        token = {
          ...token,
          ...session?.info
        }
      }

      userResponse = {}

      return token
    }
  },
  secret: process.env.NEXT_AUTH_SECRET
}
