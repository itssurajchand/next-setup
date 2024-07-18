import { utils } from '@/utils/utils'
import mongoose from 'mongoose'
import * as yup from 'yup'

const paginationSchema = yup.object().shape({
  page: yup.number().min(0).typeError('Page should be a number').optional(),
  sort: yup.string().typeError('Sort should be a string').optional(),
  order: yup.string().oneOf(['asc', 'desc']).typeError('Order should be a string').optional(),
  limit: yup.number().positive().typeError('Limit should be a number').optional(),
  query: yup.string().optional().typeError('Query should be a string').optional()
})

const objectIdSchema = yup
  .string()
  .test(
    'is-object-id',
    '${path} is invalid ObjectId',
    value => value === undefined || mongoose.Types.ObjectId.isValid(value)
  )

const updatePasswordSchema = yup
  .object()
  .shape({
    password: yup.string().min(6).required('Password is required'),
    oldPassword: yup.string().min(6).required('Old password is required')
  })
  .noUnknown()

const getMoviesByCategory = paginationSchema
  .clone()
  .shape({
    categoryIds: yup.array().of(objectIdSchema.required()).required('CategoryIds is required')
  })
  .required()

const signInSchema = yup
  .object()
  .shape({
    email: yup.string().email().required('Email is required'),
    password: yup.string().required('Password is required')
  })
  .noUnknown()
  .required()

const editProfileSchema = yup
  .object()
  .shape({
    name: yup.string().required('Name is required'),
    id: yup.string().required('id is required'),
    orignalemail: yup.string().required('Name is required'),
    email: yup.string().email().required('Email is required'),
    phoneCode: yup.string(),
    phoneNumber: yup.string().min(5, 'Phone number is not valid').matches(/^\d+$/, 'Phone number is not valid')
  })
  .noUnknown()
  .required()

const signUpSchema = yup
  .object()
  .shape({
    userType: yup.number().oneOf([utils.CONST.USER.TYPES.CREATOR, utils.CONST.USER.TYPES.USER]).required(),
    password: yup.string().min(6).required('Password is required'),
    name: yup.string().required('Name is required'),
    email: yup.string().email().required('Email is required'),
    phoneNumber: yup
      .number()
      .typeError('Phone number must be a number')
      .when('userType', (userType, schema) => {
        return userType?.includes(utils.CONST.USER.TYPES.CREATOR) ? schema.required('Phone number is required') : schema
      }),
    phoneCode: yup
      .number()
      .typeError('Phone code must be a number')
      .when('userType', (userType, schema) => {
        return userType.includes(utils.CONST.USER.TYPES.CREATOR) ? schema.required('Phone code is required') : schema
      })
  })
  .noUnknown()
  .required()

const forgotPasswordSchema = yup
  .object()
  .shape({
    email: yup.string().email().required('Email is required')
  })
  .noUnknown()
  .required()

const createCategorySchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  status: yup.number().oneOf([0, 1]).typeError('Status should be a number').optional()
})

const addFavouriteCategoriesSchema = yup
  .object()
  .shape({
    categoryIds: yup
      .array()
      .of(objectIdSchema.required())
      .min(1, 'Category Ids must have at least one item')
      .typeError('Category Ids must have be a array')
      .required('Category Ids is required')
  })
  .required()

const updateCategorySchema = yup.object().shape({
  id: objectIdSchema.required(),
  name: yup.string().required('Name is required'),
  status: yup.number().oneOf([0, 1]).typeError('Status should be a number').optional()
})

const getMovieAppSchema = yup.object().shape({
  movieId: objectIdSchema.required()
})

const approveUnapproveCreatorSchema = yup.object().shape({
  _id: objectIdSchema.required('User id is required'),
  approve: yup.boolean().required('Approve is required')
})

const bunnyStreamCreateVideoSchema = yup.object().shape({
  title: yup.string().required('Name is required')
})

const getMoviesSchema = paginationSchema.clone().shape({
  type: yup.string().oneOf(['latest', 'trending', 'recommended', 'continue', 'by-category']).optional(),
  categoryIds: yup.array().when('type', (typeArr, schema) => {
    const type = typeArr[0]
    return type === 'by-category'
      ? schema
          .of(objectIdSchema.required())
          .min(1, 'Category Ids must have at least one item')
          .required('Category Ids are required')
      : schema.optional()
  })
})

const updateMovieTrailerStatusSchema = yup.object().shape({
  movieUploaded: yup.boolean().required('Movie uploaded is required'),
  trailerUploaded: yup.boolean().required('Trailer uploaded is required')
})

const createMovieSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  categories: yup
    .array()
    .of(yup.string())
    .min(1, 'Categories must have at least one item')
    .required('Categories are required'),
  premieresOn: yup
    .date()
    .required('Premiere date is required')
    .test('is-one-day-after', 'Premiere date must be at least one day after current date', function (value) {
      const { premieresOn } = this.parent
      if (premieresOn && value) {
        const premiersOnDate = new Date(premieresOn)
        const current = new Date()
        const oneDay = utils.date.getDurationInMilliseconds({ duration: '1day' })
        return premiersOnDate.getTime() >= current.getTime() + oneDay
      }
      return true
    }),
  availableTill: yup
    .date()
    .test(
      'is-at-least-one-day-after-premiere',
      'Available till date must be at least one day after the premiere date',
      function (value) {
        const { premieresOn, availableTill } = this.parent
        if (premieresOn && value && availableTill) {
          const premiereDate = new Date(premieresOn)
          const availableTillDate = new Date(value)
          const oneDay = utils.date.getDurationInMilliseconds({ duration: '1day' })
          return availableTillDate.getTime() >= premiereDate.getTime() + oneDay
        }
        return true
      }
    )
    .optional()
    .nullable(),
  status: yup.number().oneOf([0, 1]).optional(),
  ageTag: yup.string().oneOf(utils.CONST.MOVIE.AGE_TAGS).required(),
  downloadable: yup.boolean().required('Downloadable is required'),
  synopsis: yup.string().max(250).required('Synopsis is required'),
  thumbnail: yup
    .mixed()
    .test('required', 'Thumbnail is required', value => {
      return value && value instanceof File
    })
    .test('fileType', 'Invalid file type. Only images are allowed', value => {
      if (value instanceof File) {
        return value.type.startsWith('image/')
      }
      return true
    })
    .required('Thumbnail is required'),
  movie: yup.string().typeError('Movie is required').required('Movie is required'),
  trailer: yup.string().typeError('Trailer is required').optional().nullable()
})

export const schemas = {
  updateMovieTrailerStatusSchema,
  updatePasswordSchema,
  getMoviesSchema,
  getMoviesByCategory,
  addFavouriteCategoriesSchema,
  createMovieSchema,
  bunnyStreamCreateVideoSchema,
  approveUnapproveCreatorSchema,
  updateCategorySchema,
  createCategorySchema,
  signInSchema,
  paginationSchema,
  objectIdSchema,
  getMovieAppSchema,
  forgotPasswordSchema,
  signUpSchema,
  editProfileSchema
}
