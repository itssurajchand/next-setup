import { UserService } from './client/UserService'
import { ErrorHandlingService } from './ErrorHandling.service'
import sUserService from './server/User.service'
import UserSessionService from './server/UserSession.service'

export const services = {
  ErrorHandlingService,
  server: {
    UserService: sUserService,
    UserSessionService
  },
  client: {
    UserService
  },
  thirdParty: {}
}
