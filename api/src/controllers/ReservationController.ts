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
      for (const inventory of inventories) {
        let [daysInventory] = inventory.DaysInventories
        let shouldCreateReservation = false;
        if (daysInventory == null) {
          // Short circuit, no reservations created for this time slot yet
          daysInventory = new DaysInventory({
            date: date,
            time: time,
            inventoryId: inventory.id
          })

          await daysInventory.save()
          shouldCreateReservation = true
        } else {
          // There are existing reservations, check the count
          const reservations = await daysInventory.getReservations()
          if (reservations.length < inventory.maxParties) {
            shouldCreateReservation = true
          }
        }

        if (!shouldCreateReservation) {
          throw new CodedError(errors.MAX_RESERVATIONS)
        }

        const reservation = new Reservation({
          name,
          email,
          size,
          date,
          time,
          daysInventoryId: daysInventory.id,
        })

        res.json(reservation);
      }

      res.json(200)
    } catch (error) {
      next(error)
    }
  }
}
