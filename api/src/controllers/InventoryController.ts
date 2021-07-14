import { Controller, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { UniqueConstraintError } from 'sequelize'

import { CodedError, errors as allErrors } from '../lib/coded-error'
import { Inventory } from '../models'

const { inventory: inventoryErrors } = allErrors;

@Controller('inventories')
export class InventoryController {
  @Post('')
  private async create(req: Request, res: Response) {
    Inventory.validate(req.body);

    // We expect clients to send time in UTC tz
    const time = `${req.body.time} UTC`;
    const { maxSize, maxParties } = req.body;
    const inventory = new Inventory({ time, maxSize, maxParties });

    try {
      await inventory.save();
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new CodedError(inventoryErrors.ALREADY_EXISTS)
      }
    }

    return res.json(inventory);
  }
}
