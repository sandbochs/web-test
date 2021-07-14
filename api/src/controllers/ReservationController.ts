import { Controller, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'

import { CodedError, errors as allErrors } from '../lib/coded-error'
import { DaysInventory, Inventory, Reservation } from '../models'

const {
  reservation: errors,
} = allErrors

@Controller('reservations')
export class ReservationController {
  @Post('')
  private async create(req: Request, res: Response, next: NextFunction) {
    try {
      Reservation.validate(req.body);
      const {
        name,
        email,
        size,
        date,
        time: timeWithoutTz,
      } = req.body;

      const time = `${timeWithoutTz} UTC`

      // Find valid configurations
      const inventories = await Inventory.findBySizeAndTime({ size, time, date })
      if (inventories.length === 0) {
        throw new CodedError(errors.MISSING_INVENTORY)
      }

      // Check if we can book a reservation
      let DaysInventoryId;
      for (const inventory of inventories) {
        let [daysInventory] = inventory.DaysInventories
        if (daysInventory == null) {
          // Short circuit, no reservations created for this time slot yet
          daysInventory = new DaysInventory({
            date: date,
            time: time,
            InventoryId: inventory.id
          })

          await daysInventory.save()
          DaysInventoryId = daysInventory.id;
        } else {
          // There are existing reservations, check the count
          const reservations = await daysInventory.getReservations()
          if (reservations.length < inventory.maxParties) {
            DaysInventoryId = daysInventory.id;
          }
        }

        if (DaysInventoryId != null) {
          break;
        }
      }

      if (DaysInventoryId == null) {
        throw new CodedError(errors.MAX_RESERVATIONS)
      }

      const reservation = new Reservation({
        name,
        email,
        size,
        date,
        time,
        DaysInventoryId,
      })

      await reservation.save()

      res.json(reservation);
    } catch (error) {
      next(error)
    }
  }
}
