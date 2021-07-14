require('source-map-support/register')
import { Sequelize } from 'sequelize-typescript'
import { RouterServer } from './RouterServer'
import * as models from './models'

const port = process.env.PORT == null ? 8080 : parseInt(process.env.PORT, 10)

export const server = new RouterServer()

;(async () => {
  // HACK: don't start the server when running tests
  if (process.env.NODE_ENV !== 'test') {
    server.start(port)
  }
  const sequelize = new Sequelize(process.env.DATABASE_CONNECTION_STRING, {
    dialect: 'postgres',
    logging: process.env.LOG === 'debug' ? console.log : false,
    models: Object.keys(models).map(k => models[k]),
  })

  await sequelize.sync({
    alter: true
  })

})()
