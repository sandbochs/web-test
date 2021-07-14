import { Controller, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'

import { CodedError, errors as allErrors } from '../lib/coded-error'
import { Inventory } from '../models'

const { inventory: inventoryErrors } = allErrors;

@Controller('inventories')
export class InventoryController {
  @Post('')
  private async create(req: Request, res: Response, next: NextFunction) {
    try {
      Inventory.validate(req.body);

      // We expect clients to send time in UTC as described in the docs
      const time = `${req.body.time} UTC`;
      const { maxSize, maxParties } = req.body;
      const inventory = new Inventory({ time, maxSize, maxParties });

      await inventory.save();
      return res.json(inventory);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        next(new CodedError(inventoryErrors.ALREADY_EXISTS))
      } else {
        next(error)
      }
    }
  }
}
