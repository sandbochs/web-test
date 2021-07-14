import { DaysInventory, Inventory, Reservation } from './index';

// Must be run after sequelize init
// We are defining these outside of the model to avoid introducing cyclic imports
export function defineRelations() {
  Inventory.hasMany(DaysInventory)
  DaysInventory.belongsTo(Inventory)
  DaysInventory.hasMany(Reservation)
  Reservation.belongsTo(DaysInventory)
}
