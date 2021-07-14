import { Controller, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'

import { CodedError, errors as allErrors } from '../lib/coded-error'
import { Inventory, Reservation } from '../models'

const {
  reservation: errors,
} = allErrors

@Controller('reservations')
export class ReservationController {
  @Post('')
  private async create(req: Request, res: Response, next: NextFunction) {
    try {
      Reservation.validate(req.body);
      const { size, time } = req.body;
      const inventory = await Inventory.findBySizeAndTime({ size, time })

      if (inventory == null) {
        throw new CodedError(errors.MISSING_INVENTORY)
      }
    } catch (error) {
      next(error)
    }
  }
}
