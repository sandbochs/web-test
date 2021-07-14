import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey, Table,
} from 'sequelize-typescript'
import { Op } from 'sequelize'

import { CodedError, errors as allErrors } from '../lib/coded-error'
import {
  isTimeString,
  isValidInterval,
} from '../lib/validations';
import { DaysInventory } from './DaysInventory'

// TODO: should be configurable
const reservationIntervalMinutes = 15;

const { inventory: errors, api: apiErrors } = allErrors;

@Table({ tableName: 'inventories' })
export class Inventory extends Model<Inventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @AllowNull(false)
  @Index
  @Column(DataType.TIME)
  startTime: string

  @AllowNull(false)
  @Index
  @Column(DataType.TIME)
  endTime: string

  @AllowNull(false)
  @Column
  maxSize: number

  @AllowNull(false)
  @Column
  maxParties: number

  @CreatedAt
  createdAt: string

  static validate(params: { [key: string]: any }): void {
    const { startTime, endTime, maxSize, maxParties } = params;
    if (startTime == null || endTime == null || maxSize == null || maxParties == null) {
      throw new CodedError(errors.MISSING_PARAMS)
    }

    if (!isTimeString(startTime) || !isTimeString(endTime)) {
      throw new CodedError(apiErrors.INVALID_TIME)
    }

    if (
      !isValidInterval(startTime, reservationIntervalMinutes) ||
      !isValidInterval(endTime, reservationIntervalMinutes)
      ) {
      throw new CodedError(errors.INVALID_INTERVAL)
    }

    if(typeof maxSize !== 'number') {
      throw new CodedError(errors.INVALID_MAX_SIZE)
    }

    if(typeof maxParties !== 'number') {
      throw new CodedError(errors.INVALID_MAX_PARTIES)
    }
  }

  static async findBySizeAndTime(params: { size: number, time: string, date: string }) {
    const { size, time, date } = params

    return Inventory.findAll({
      order: [['maxSize', 'ASC']],
      where: {
        [Op.and]: [
          { maxSize: { [Op.gte]: size } },
          { startTime: { [Op.lte]: time } },
          { endTime: { [Op.gte]: time } }
        ]
      },
      include: [{
        model: DaysInventory,
        required: false, 
        where: { date: { [Op.eq]: date } } 
      }]
    })
  }

  static async findOverlapping(params: { startTime: string, endTime: string, maxSize: number }) {
    const { startTime, endTime, maxSize } = params;

    return Inventory.findAll({
      where: {
        [Op.and]: [
          { maxSize: { [Op.eq]: maxSize } },
          // TODO: revisit for potential simplification
          {
            [Op.or]: [
              // Superset
              {
                startTime: { [Op.lte]: startTime },
                endTime: { [Op.gte]: endTime },
              },

              // Subset
              {
                startTime: { [Op.gte]: startTime },
                endTime: { [Op.lte]: endTime },
              },

              // Overlapping start
              {
                startTime: { [Op.lte]: startTime },
                endTime: { [Op.lte]: endTime },
              },

              // Overlapping end
              {
                startTime: { [Op.gte]: startTime },
                endTime: { [Op.gte]: endTime },
              },
            ]
          }
        ]
      }
    })
  }
}