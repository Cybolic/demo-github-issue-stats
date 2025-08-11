import type { NextFunction, Request, Response } from 'express';

/* Possible improvements:
 - Use a validation library, such as express-validator or Joi
*/

export default function apiValidation(req: Request, res: Response, next: NextFunction) {
  let errorMessage = '';

  if (!req.body || Object.keys(req.body).length === 0) {
    errorMessage = 'Missing request body';
  } else if (!req.body.repos) {
    errorMessage = 'Missing "repos" in request body';
  } else if (
    (
      typeof req.body.repos !== 'string' &&
      !Array.isArray(req.body.repos)
    ) ||
    req.body.repos.length < 1
  ) {
    errorMessage = 'Parameter "repos" must be a non-empty string or an array of strings';
  } else if (req.body.months !== undefined && (
    isNaN(parseInt(req.body.months, 10)) ||
    parseInt(req.body.months, 10) < 1 ||
    parseInt(req.body.months, 10) > 12
  )) {
    errorMessage = 'Parameter "months" must be a positive integer no higher than 12';
  }

  if (errorMessage) {
    res.status(400).json({ success: false, errorMessage });
  }

  next();
}
