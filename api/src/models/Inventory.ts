import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey, Table,
} from 'sequelize-typescript'
import { Op } from 'sequelize'

import { CodedError, errors as allErrors } from '../lib/coded-error'
import {
  isTimeString,
  isValidInterval,
} from '../lib/validations';

// TODO: should be configurable
const reservationIntervalMinutes = 15;

const { inventory: errors, api: apiErrors } = allErrors;

@Table({
  tableName: 'inventories',
  indexes: [
    {
      unique: true,
      fields: ['time', 'maxSize'],
    }
  ]
})
export class Inventory extends Model<Inventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @AllowNull(false)
  @Column(DataType.TIME)
  time: string

  @AllowNull(false)
  @Column
  maxSize: number

  @AllowNull(false)
  @Column
  maxParties: number

  @CreatedAt
  createdAt: string

  static validate(params: { [key: string]: any }): void {
    const { time, maxSize, maxParties } = params;
    if (time == null || maxSize == null || maxParties == null) {
      throw new CodedError(errors.MISSING_PARAMS)
    }

    if (!isTimeString(time)) {
      throw new CodedError(apiErrors.INVALID_TIME)
    }

    if (!isValidInterval(time, reservationIntervalMinutes)) {
      throw new CodedError(errors.INVALID_INTERVAL)
    }

    if(typeof maxSize !== 'number') {
      throw new CodedError(errors.INVALID_MAX_SIZE)
    }

    if(typeof maxParties !== 'number') {
      throw new CodedError(errors.INVALID_MAX_PARTIES)
    }
  }

  static async findBySizeAndTime(params: { size: number, time: string }) {
    const { size, time } = params

    return Inventory.findOne({
      where: {
        [Op.and]: {
          maxSize: {
            [Op.or]: {
              [Op.eq]: size,
              [Op.gt]: size,
            }
          },
          time: {
            [Op.eq]: time,
          }
        }
      }
    })
  }
}