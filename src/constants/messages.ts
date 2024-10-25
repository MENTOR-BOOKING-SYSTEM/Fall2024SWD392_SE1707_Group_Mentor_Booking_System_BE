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
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  GET_USER_LIST_SUCCESSFULLY: 'Get user list successfully',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESSFULLY: 'Verify forgot password token successfully',
  UPLOAD_SUCCESS: 'Upload image successfully',
  GET_STUDENTS_IN_SAME_GROUP_SUCCESS: 'Get students in same group successfully',
  SUCCESS: 'Success',
  JOIN_GROUP_SUCCESSFULLY: 'Join group successfully',
  FILTER_USERS_SUCCESSFULLY: 'Filter users successfully'
} as const

export const POSTS_MESSAGES = {
  CREATE_POST_SUCCESS: 'Create post successfully',
  GET_POSTS_SUCCESS: 'Get posts successfully',
  GET_POST_DETAIL_SUCCESS: 'Get post detail successfully',
  DESCRIPTION_IS_REQUIRED: 'Description is required',
  DESCRIPTION_MUST_BE_A_STRING: 'Description must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_IS_REQUIRED: 'Name is required'
} as const
export const GROUPS_MESSAGES = {
  GROUP_ID_IS_REQUIRED: 'Group id is required',
  GROUP_ID_MUST_BE_A_STRING: 'Group id must be a string',
  GROUP_NAME_IS_REQUIRED: 'Group name is required',
  USER_ALREADY_HAS_A_GROUP: 'User already has a group',
  GROUP_LIST_USER_LENGTH: 'Group list user length must be more than 1',
  GROUP_LIST_USER_REQUIRED: 'Group list user is required',
  GROUP_NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 10 to 100',
  PROJECT_ID_IS_REQUIRED: 'Project id is required',
  PROJECT_IS_NOT_FOUND: 'Project is not found',
  CREATE_GROUP_SUCCESSFULLY: 'Create group successfully',
  GROUP_NAME_ALREADY_EXIST: 'Group name already exist',
  GROUP_NOT_FOUND: 'Group is not found',
  GET_REQUEST_PENDING_SUCCESSFULLY: 'Get request pending successfully',
  USER_NOT_EXIST_IN_GROUP: 'User not exist in group',
  ONLY_LEADER_CAN_BE_REMOVE_THE_MEMBER: 'Only leader can be remove the member',
  ONLY_LEADER_CAN_BE_ADD_THE_MEMBER: 'Only leader can be add the member',
  ONLY_LEADER_CAN_PERFORM_THIS_ACTION: 'Only leader can perform this action',
  REMOVE_GROUP_MEMBER_SUCCESSFULLY: 'Remove group member successfully',
  ADD_MEMBER_SUCCESSFULLY: 'Add member successfully',
  USER_ALREADY_EXIST_IN_THIS_GROUP: 'User already exist in this group',
  YOU_ALREADY_IS_A_LEADER: 'You already is a leader',
  ONLY_LEADER_CAN_BE_ASSIGN: 'Only the leader can transfer authority to others',
  ASSIGN_NEW_LEADER_SUCCESSFULLY: 'Assign new leader successfully',
  GET_LIST_USER_FROM_GROUP_SUCCESSFULLY: 'Get list users from group successfully'
} as const

export const SEMESTERS_MESSAGES = {
  SEMESTER_NAME_TYPE_INVALID: 'Semester name must be a string',
  SEMESTER_NAME_ALREADY_EXISTS: 'Semester name already exists',
  DESCRIPTION_TYPE_INVALID: 'Description must be a string',
  DATE_TYPE_INVALID: 'Date format invalid',
  START_DATE_BEFORE_END_DATE: 'Start date must not be before end date',
  INVALID_PERIOD: 'A semester must last for 16 weeks',
  SEMESTERS_OVERLAP: 'Semesters overlap',
  SEMESTER_CREATED_SUCCESSFULLY: 'Semester created successfully',
  SEMESTER_NOT_FOUND: 'Semester not found',
  GET_SEMESTERS_SUCCESSFULLY: 'Get semesters successfully',
  GET_CURRENT_PHASE_SUCCESSFULLY: 'Get current phase successfully',
  TIMESTAMP_NOT_FOUND: 'Timestamp not found',
  ASSIGN_CRITERIA_SUCCESSFULLY: 'Assign criteria to semester successfully',
  CRITERIA_MUST_BE_AN_ARRAY: 'Criteria must be an array',
  SEMESTER_UPDATED_SUCCESSFULLY: 'Semester updated successfully',
  GET_CURRENT_SEMESTER_SUCCESSFULLY: 'Get current semester successfully',
  GET_SEMESTER_TIMESTAMP_SUCCESSFULLY: 'Get semester timestamp successfully'
}

export const TECHNOLOGIES_MESSAGE = {
  GET_TECHNOLOGIES_SUCCESSFULLY: 'Get technologies successfully',
  TECHNOLOGY_NAME_IS_REQUIRED: 'Technology name is required',
  TECHNOLOGY_NAME_MUST_BE_A_STRING: 'Technology name must be a string',
  GET_TECHNOLOGIES_BY_PROJECT_SUCCESSFULLY: 'Get technologies by project successfully'
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
  CAN_NOT_SEND_MORE_PROJECT:
    'No more projects can be submitted because the previous project is being processed and maximum of 3 projects can be submitted.',
  PROJECT_HAS_BEEN_APPROVED: 'No more projects can be submitted because PROJECT IS ACCEPTED',
  TECHNOLOGY_MUST_BE_AN_ARRAY_WITH_AT_LEAST_1_ELEMENT: 'Technology Must Be An Array With At Least 1 Element',
  PARAMS_IN_VALID: `Params must bev ${'all'} or "get-review-mentor" or "get-review-reviewer" or "get-submit`,
  GET_PROJECT_SUCCESSFULLY: 'Get project successfully',
  PROJECT_ID_INVALID: 'Project id is invalid  ',
  GET_PROJECT_DETAIL_SUCCESSFULLY: 'Get project detail successfully',
  GET_PROJECT_TECHNOLOGIES_SUCCESSFULLY: 'Get project technologies successfully',
  GET_PROJECT_POST_SUCCESSFULLY: 'Get project post successfully',
  GET_PROJECT_OWN_SUCCESSFULLY: 'Get project owners successfully',
  GET_PROJECT_REVIEW_SUCCESSFULLY: 'Get project reviewers successfully',
  GET_PROJECT_GUIDE_SUCCESSFULLY: 'Get project guides successfully',
  GET_PROJECT_SPRINT_SUCCESSFULLY: 'Get project sprints successfully',
  TYPE_GROUP_ONLY_SENT_1_COLLABORATORS: 'With group mode you can only pass on 1 contributor',
  TYPE_MUST_BE_JPG: 'File type must be JPG'
} as const

export const CRITERIA_MESSAGES = {
  CREATE_CRITERIA_SUCCESSFULLY: 'Create criteria successfully',
  GET_ALL_CRITERIA_SUCCESSFULLY: 'Get all criteria successfully',
  GET_CRITERIA_SUCCESSFULLY: 'Get criteria successfully',
  CRITERIA_NAME_IS_REQUIRED: 'Criteria name is required',
  CRITERIA_NAME_MUST_BE_A_STRING: 'Criteria name must be a string',
  CRITERIA_TYPE_IS_REQUIRED: 'Criteria type is required',
  CRITERIA_TYPE_MUST_BE_A_STRING: 'Criteria type must be a string',
  CRITERIA_DESCRIPTION_MUST_BE_A_STRING: 'Criteria description must be a string',
  CRITERIA_NAME_ALREADY_EXISTS: 'Criteria name already exists',
  CRITERIA_NOT_FOUND: 'Criteria not found',
  SEMESTER_ID_IS_REQUIRED: 'Semester ID is required',
  GET_CRITERIA_BY_SEMESTER_SUCCESSFULLY: 'Get criteria by semester successfully',
  GET_CRITERIA_TYPES_SUCCESSFULLY: 'Get criteria types successfully',
  EDIT_CRITERIA_SUCCESSFULLY: 'Edit criteria successfully'
} as const

export const REVIEW_MESSAGES = {
  USER_DIFFERENT_GROUP: 'Other groups cannot be evaluated.',
  RATE_MUST_BE_LESS_THAN_5_AND_MORE_THAN_1: 'Rate must be less than 5 and more than 1',
  REVIEW_MEMBER_SUCCESSFULLY: 'Review member successfully',
  YOU_CAN_NOT_REVIEW_YOURSELF: 'You can not review yourself'
}

export const TIMESTAMP_MESSAGES = {
  GET_ALL_TIMESTAMPS_SUCCESSFULLY: 'Get all timestamps successfully'
}

export const DASHBOARD_MESSAGES = {
  GET_ACCOUNTS_SUCCESSFULLY: 'Get accounts successfully',
  GET_ROLES_SUCCESSFULLY: 'Get roles successfully',
  FIRST_NAME_TYPE_INVALID: 'First name must be a string',
  LAST_NAME_TYPE_INVALID: 'Last name must be a string',
  USERNAME_TYPE_INVALID: 'Username must be a string',
  USERNAME_LENGTH_INVALID: 'Username length must be from 4 to 50',
  USERNAME_FORMAT_INVALID:
    'Username can only include alphanumeric characters, underscores, and periods, and must start with a letter',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  EMAIL_INVALID: 'Email is invalid',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  AVATAR_URL_TYPE_INVALID: 'Avatar URL must be a string',
  ROLES_TYPE_INVALID: 'Roles must be an array',
  ROLES_REQUIRED: 'Roles are required',
  INVALID_ROLE_ID: 'Invalid role ID',
  CREATE_ACCOUNT_SUCCESSFULLY: 'Create account successfully',
  GET_ACCOUNT_SUCCESSFULLY: 'Get account successfully',
  EDIT_ACCOUNT_SUCCESSFULLY: 'Edit account successfully'
}
