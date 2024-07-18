import { Document, model, Model, models, Schema } from 'mongoose'
import { IUser } from './user.model'

export interface IUserSession extends Document {
  userId: Schema.Types.ObjectId
  userType: IUser['type']
  deviceId?: string
  token: string
  lastLogin: Date
}

const UserSessionSchema: Schema<IUserSession> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: Number,
      enum: [1, 2, 3],
      required: true
    },
    lastLogin: {
      type: Date,
      required: true
    },
    deviceId: {
      type: String,
      default: null
    },
    token: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const UserSessionModel =
  (models?.UserSession as Model<IUserSession>) || model<IUserSession>('UserSession', UserSessionSchema, 'userSessions')

export default UserSessionModel
