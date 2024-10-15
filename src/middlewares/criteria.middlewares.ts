import { checkSchema } from 'express-validator';
import { CRITERIA_MESSAGES } from '~/constants/messages';
import { validate } from '~/utils/validation';

export const createCriteriaValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: CRITERIA_MESSAGES.CRITERIA_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: CRITERIA_MESSAGES.CRITERIA_NAME_MUST_BE_A_STRING
        },
        trim: true
      },
      type: {
        notEmpty: {
          errorMessage: CRITERIA_MESSAGES.CRITERIA_TYPE_IS_REQUIRED
        },
        isString: {
          errorMessage: CRITERIA_MESSAGES.CRITERIA_TYPE_MUST_BE_A_STRING
        },
        trim: true
      },
      description: {
        optional: true,
        isString: {
          errorMessage: CRITERIA_MESSAGES.CRITERIA_DESCRIPTION_MUST_BE_A_STRING
        },
        trim: true
      }
    },
    ['body']
  )
);

