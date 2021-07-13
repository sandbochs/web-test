
import { Inventory, Reservation } from './index';

// Must be run after sequelize init
// We are defining these outside of the model to avoid introducing cyclic imports
export function defineRelations() {
  Reservation.belongsTo(Inventory)

  Inventory.hasMany(Reservation)
}