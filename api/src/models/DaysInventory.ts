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

@Table({ tableName: 'days_inventories' })
// TODO: rename this Inventory, rename Inventory to Configuration
export class DaysInventory extends Model<DaysInventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Index
  @AllowNull(false)
  @Column(DataType.DATEONLY)
  date: string

  @AllowNull(false)
  @Column(DataType.TIME)
  time: string

  @CreatedAt
  createdAt: string

  static upsertByDateAndTime(params: { date: string, time: string }) {
    const { date, time } = params;
    return DaysInventory.findOrCreate({
      where: {
        [Op.and]: [
          { date: { [Op.eq]: date }},
          { time: { [Op.eq]: time }},
        ]
      },
      // include: [Reservation]
    })
  }
}
