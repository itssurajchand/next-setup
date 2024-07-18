import { IPaginationArgs } from '@/services/types'

interface ICapitalizeOptions {
  /** @info Default `true`, if `true` then capitalizes first letter of each word  */
  capitalizeAll?: boolean
  /** @info Default `false`, if `true` then capitalizes each letter of each word  */
  fullyCapitalize?: boolean
  /** @info If `valueToGenerateStringFrom` is a falsy value, then returnValueIfNotString is returned if passed  */
  returnValueIfNotString?: any
}

type ICapitalizeReturnValue<T extends ICapitalizeOptions> =
  T['returnValueIfNotString'] extends Exclude<any, undefined> ? string : T['returnValueIfNotString']

export type ICapitalize = <T extends ICapitalizeOptions>(
  valueToCapitalize: any,
  options?: T
) => ICapitalizeReturnValue<T>

export type IGetExpiryTimeDurationArgs = {
  duration: `${number}${'sec' | 'min' | 'hr' | 'day' | 'mon' | 'yr'}` | 'infinity'
}

export type IGetExpiryTime = (args: IGetExpiryTimeDurationArgs) => number

export type ISignUrlArgs = {
  /** @info CDN URL w/o the trailing '/' - exp. http://test.b-cdn.net/file.png */
  url: string
  /** @info Optional parameter - "true" returns a URL separated by forward slashes (exp. (domain)/bcdn_token=...) */
  isDirectory?: boolean
  /** @info If not passed will be considered infinity */
  expirationTime?: IGetExpiryTimeDurationArgs['duration']
  /** @info Directory to authenticate (exp. /path/to/images) */
  pathAllowed?: string
  /** @info List of countries allowed (exp. CA, US, TH) */
  countriesAllowed?: string
  /** @info Optional parameter if you have the User IP feature enabled */
  userIP?: string
  /** @info List of countries blocked (exp. CA, US, TH) */
  countriesBlocked?: string
}

export type ISignUrl = (arg: ISignUrlArgs) => string

export type IGenerateSignature = (arg: {
  libraryId: string
  apiKey: string
  expirationTime: string
  videoId: string
}) => string

export type IFetchRecommendedMoviesArgs = IPaginationArgs & {
  categoryIds: string[]
}

export type IFetchMovies = IPaginationArgs & {
  type: 'latest' | 'trending'
}
