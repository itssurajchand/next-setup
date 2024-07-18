const RESPONSE_MESSAGES = {
  USER_ALREADY_EXIST: 'User already exists with the provided email',
  USER_NOT_EXISTS: 'User does not exist',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  CONFLICT: 'Conflict',
  SUCCESS: 'Success',
  BAD_REQUEST: 'Bad request',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  UN_AUTHORIZED: 'Unauthorized',
  INVALID_CREDENTIALS: 'Invalid credentials',
  MISSING_AUTH_HEADER: 'Authorization header is missing or invalid',

  _NOT_FOUND: '[ITEM] not found',
  _ADDED_SUCCESSFULLY: '[ITEM] added successfully',
  _REMOVED_SUCCESSFULLY: '[ITEM] removed successfully',
  _UPDATED_SUCCESSFULLY: '[ITEM] updated successfully',
  _ALREADY_EXISTS: '[ITEM] already exists',
  _NOT_BELONGS_TO_YOU: '[ITEM] not belongs to you',
  _IN_PROGRESS: '[ITEM] in progress'
}

export { RESPONSE_MESSAGES }
