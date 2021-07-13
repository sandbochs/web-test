require('source-map-support/register')
import { Sequelize } from 'sequelize-typescript'
import { RouterServer } from './RouterServer'
import { defineRelations } from './models/relations'
import * as models from './models'

;(async () => {
  new RouterServer().start(8080)

  const sequelize = new Sequelize(process.env.DATABASE_CONNECTION_STRING, {
    dialect: 'postgres',
    logging: process.env.LOG === 'debug' ? console.log : false,
    models: Object.keys(models).map(k => models[k]),
  })

  // must be run after sequelize instance is created
  defineRelations();

  await sequelize.sync({
    alter: true
  })

})()
