import { utils } from '@/utils/utils'
import { store } from './store'
import { ICategory } from '@/models/category.model'
import { IMovie } from '@/models/movie.model'
import { createMovieSchema } from '@/@core/components/page-wise/movies/create/Create'

const types = utils.CONST.USER.NUMERIC_TYPES

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type IReduxStatus = 'idle' | 'loading' | 'fulfilled' | 'failed'

type IUserTypeNumeric = keyof typeof types

export interface IUser {
  _id: string
  name: string
  email: string
  approved: boolean
  phoneCode?:number
  phoneNumber?:number
  type: IUserTypeNumeric
  profilePicture: string | null
  profileCompleted: boolean
}

export interface IUser {
  _id: string
  name: string
  email: string
  approved: boolean
  type: IUserTypeNumeric
  profilePicture: string | null
  profileCompleted: boolean
}

export interface IInitialUserSliceState {
  status: IReduxStatus
  data: {
    user: IUser | null
  }
  message: string | null
}

export interface IInitialUsersSliceState {
  creators: {
    status: IReduxStatus
    data: {
      approved: 0 | 1 | 2
      page: number
      totalCount: number
      query: string | null
      limit: number
      sort: string | null
      order: 'asc' | 'desc' | null
      users: IUser[]
    }
    message: string | null
  }
  users: {
    status: IReduxStatus
    data: {
      page: number
      totalCount: number
      query: string | null
      limit: number
      sort: string | null
      order: 'asc' | 'desc' | null
      users: IUser[]
    }
    message: string | null
  }
}

export interface IInitialMovieSliceState {
  list: {
    status: IReduxStatus
    data: {
      page: number
      totalCount: number
      query: string | null
      limit: number
      sort: string | null
      order: 'asc' | 'desc' | null
      movies: IMovie[]
    }
    message: string | null
  }
  create: {
    status: IReduxStatus
    data: {
      movie: IMovie | null
    }
    message: string | null
  }
  uploadMovie: {
    status: IReduxStatus
    data: {
      progress: number
    }
    message: string | null
  }
  uploadMovieTrailer: {
    status: IReduxStatus
    data: {
      progress: number
    }
    message: string | null
  }
}

export type ICreateMovie = (typeof createMovieSchema)['__outputType']

export interface IInitialCategorySliceState {
  addEdit: {
    message: string | null
    status: IReduxStatus
    data: ICategory | null
    add: boolean
    visible: boolean
  }
  delete: {
    message: string | null
    status: IReduxStatus
  }
  list: {
    status: IReduxStatus
    data: {
      page: number
      totalCount: number
      query: string | null
      limit: number
      sort: string | null
      order: 'asc' | 'desc' | null
      categories: ICategory[]
    }
    message: string | null
  }
}

export interface IAddEditCategory {
  add: IInitialCategorySliceState['addEdit']['add']
  data: IInitialCategorySliceState['addEdit']['data']
  visible: IInitialCategorySliceState['addEdit']['visible']
}

export type IAddEditCategoryThunkArgs = {
  _id?: string
  name: ICategory['name']
  status: ICategory['status']
}
