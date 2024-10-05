import { checkSchema } from 'express-validator';
import { POSTS_MESSAGES } from '~/constants/messages';
import { validate } from '~/utils/validation';

export const createPostValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: POSTS_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: POSTS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: POSTS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        }
      },
      description: {
        notEmpty: {
          errorMessage: POSTS_MESSAGES.DESCRIPTION_IS_REQUIRED
        },
        isString: {
          errorMessage: POSTS_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
        },
        trim: true
      },
      groupID: {
        notEmpty: {
          errorMessage: POSTS_MESSAGES.GROUP_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: POSTS_MESSAGES.GROUP_ID_MUST_BE_A_STRING
        },
        trim: true
      },
      technologyName: {
        notEmpty: {
          errorMessage: POSTS_MESSAGES.TECHNOLOGY_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: POSTS_MESSAGES.TECHNOLOGY_NAME_MUST_BE_A_STRING
        },
        trim: true
      }
    },
    ['body']
  )
);
