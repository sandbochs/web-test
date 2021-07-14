import { Sequelize } from 'sequelize-typescript'
import repl from 'pretty-repl';

import { defineRelations } from './models/relations'
import * as models from './models'

// TODO: exclude this from build

const sequelize = new Sequelize(process.env.DATABASE_CONNECTION_STRING, {
  dialect: 'postgres',
  logging: process.env.LOG === 'debug' ? console.log : false,
  models: Object.keys(models).map(k => models[k]),
})

defineRelations()

const r = repl.start({
  prompt: '> ',
})

r.context.models = sequelize.models
r.context.sequelize = sequelize
for(const [name, model] of Object.entries(models)) {
  r.context[name] = model;
}