export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  TOKEN_IS_REQUIRED: 'Token is required',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout success',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_ME_SUCCESS: 'Get my profile success',
  USER_NOT_VERIFIED: 'User not verified',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  USERNAME_INVALID:
    'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only numbers',
  UPDATE_ME_SUCCESS: 'Update my profile success',
  GET_PROFILE_SUCCESS: 'Get profile success',
  INVALID_USER_ID: 'Invalid user id',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_SUCCESS: 'Unfollow success',
  USERNAME_EXISTED: 'Username existed',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  REFRESH_TOKEN_IS_EXPIRED: 'Refresh token is expired',
  GET_USER_LIST_SUCCESSFULLY: 'Get user list successfully',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESSFULLY: 'Verify forgot password token successfully',
  UPLOAD_SUCCESS: 'Upload image successfully',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success'
} as const

export const GROUPS_MESSAGES = {
  GROUP_NAME_IS_REQUIRED: 'Group name is required',
  USER_ALREADY_HAS_A_GROUP: 'User already has a group',
  GROUP_LIST_USER_LENGTH: 'Group list user length must be more than 1',
  GROUP_LIST_USER_REQUIRED: 'Group list user is required',
  GROUP_NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 10 to 100',
  PROJECT_ID_IS_REQUIRED: 'Project id is required',
  PROJECT_IS_NOT_FOUND: 'Project is not found',
  CREATE_GROUP_SUCCESSFULLY: 'Create group successfully',
  GROUP_NAME_ALREADY_EXIST: 'Group name already exist'
} as const

export const TECHNOLOGIES_MESSAGE = {
  GET_TECHNOLOGIES_SUCCESSFULLY: 'Get technologies successfully'
} as const

export const EMAIL_MESSAGES = {
  RESET_PASSWORD_EMAIL_SUBJECT: 'Action Required: Reset Your Password'
} as const

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  FORBIDDEN: 'Forbidden access',
  BAD_REQUEST: 'Bad request',
  CONFLICT: 'Conflict'
}
export const PROJECTS_MESSAGE = {
  PROJECT_NAME_CAN_NOT_EMPTY: 'Project name can not empty',
  SUBMIT_PROJECT_SUCESSFULLY: 'Sumit project sucessfully',
  FUNCTIONAL_REQUIREMENT_CAN_NOT_EMPTY: 'Functional requirement cant not empty',
  ACTORS_IS_REQUIRED: 'Actors is required',
  TECHNOLOGY_IS_REQUIRED: 'Technology is required',
  TECHNOLOGY_IS_NOT_FOUND: 'Technology not found is :',
  MENTOR_DOES_NOT_NEED_TO_REQUEST_PROJECT_REVIEW_FROM_OTHER_MENTOR:
    'MENTOR DOES NOT NEED TO REQUEST PROJECT REVIEW FROM OTHER MENTOR',
  PROJECT_NAME_ALREADY_EXISTS: 'Project name already exist',
  MENTOR_ID_IS_REQUIRED_FOR_STUDENT_OR_BUSINESS_ROLE: 'Mentor id is required for student or business role',
  CAN_NOT_SEND_MORE_PROJECT: 'No more projects can be submitted because the previous project is being processed'
} as const
