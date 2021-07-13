import {
  AllowNull,
  Column,
  CreatedAt,
  Model,
  PrimaryKey, Table,
} from 'sequelize-typescript'

@Table({ tableName: 'inventories' })
export class Inventory extends Model<Inventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  // Defined in ./relations.ts
  // @HasMany(() => Reservations)

  @AllowNull(false)
  @Column
  time: Date

  @AllowNull(false)
  @Column
  maxSize: number

  @AllowNull(false)
  @Column
  maxParties: number

  @CreatedAt
  createdAt: string
}