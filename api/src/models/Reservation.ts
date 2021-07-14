
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey, Table,
} from 'sequelize-typescript'

@Table({ tableName: 'reservations' })
export class Reservation extends Model<Reservation> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @AllowNull(false)
  @Column
  name: string

  @AllowNull(false)
  @Column
  email: string

  @AllowNull(false)
  @Column
  size: number

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  date: string

  @AllowNull(false)
  @Column(DataType.TIME)
  time: string

  @CreatedAt
  createdAt: string
}