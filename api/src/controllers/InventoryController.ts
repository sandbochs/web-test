import { Controller, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'

import { CodedError, errors as allErrors } from '../lib/coded-error';
import { Inventory } from '../models'

const { inventory: errors } = allErrors;
@Controller('inventories')
export class InventoryController {
  @Post('')
  private async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate params
      Inventory.validate(req.body);

      // We expect clients to send time in UTC as described in the docs
      const startTime = `${req.body.startTime} UTC`;
      const endTime = `${req.body.endTime} UTC`;
      const { maxSize, maxParties } = req.body;

      // Ensure no overlap
      const existing = await Inventory.findOverlapping({ startTime, endTime, maxSize })
      if (existing.length > 0) {
        throw new CodedError(errors.ALREADY_EXISTS)
      }

      const inventory = new Inventory({ startTime, endTime, maxSize, maxParties });
      await inventory.save();
      return res.json(inventory);
    } catch (error) {
      next(error)
    }
  }
}
