
import {
  AllowNull,
  Column,
  CreatedAt,
  ForeignKey,
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
  @Column
  time: Date

  @CreatedAt
  createdAt: string
}