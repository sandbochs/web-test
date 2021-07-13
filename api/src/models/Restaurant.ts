import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey, Table,
  UpdatedAt
} from 'sequelize-typescript'

@Table({ tableName: 'restaurants' })
export class Restaurant extends Model<Restaurant> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  // Defined in ./relations.ts
  // @BelongsTo(() => Inventory)

  @Column
  name: string

  @Column
  address: string

  @DeletedAt
  deletedAt: string

  @CreatedAt
  createdAt: string

  @UpdatedAt
  updatedAt: string
}
