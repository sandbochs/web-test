import { NextFunction, Request, Response } from 'express'

import { CodedError, errors } from '../lib/coded-error'

type AllErrors = Error | CodedError

const { INTERNAL_ERROR } = errors.api;

export function errorMiddleware(error: AllErrors, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error)
  }

  if (error instanceof CodedError) {
    res.status(error.status)
    res.json({ code: error.code, error: error.message })
  } else {
    // handle all unexpected errors
    // log for posterity and debugging
    console.error(error)

    // don't leak errors to clients
    res.status(INTERNAL_ERROR.status)
    res.json({ code: INTERNAL_ERROR.code, error: INTERNAL_ERROR.message })
  }
}