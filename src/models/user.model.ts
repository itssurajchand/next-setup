import { Document, model, Model, models, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  /** @info 1 => Admin, 2 => Creator, 3 => User */
  type: 1 | 2 | 3
  approved: boolean
  phoneNumber: number | null
  phoneCode: number | null
  profileCompleted: boolean
  profilePicture: string | null
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneCode: { type: Number },
    phoneNumber: { type: Number },
    approved: { type: Boolean, default: false },
    profilePicture: { type: String, default: null },
    profileCompleted: { type: Boolean, default: false },
    type: { type: Number, enum: [1, 2, 3], required: true }
  },
  { timestamps: true }
)

const UserModel = (models?.User as Model<IUser>) || model<IUser>('User', UserSchema, 'users')

export default UserModel
