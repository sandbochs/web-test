import supertest from 'supertest'

import { Inventory, Reservation } from '../models'
import { errors } from '../lib/coded-error'
import { server } from '../index'

const request = supertest(server.getApp())
const {
  api: {
    INVALID_TIME,
  },
  reservation: {
    MISSING_INVENTORY,
    MAX_RESERVATIONS,
  }
} = errors

describe('InventoryController', () => {
  afterAll(async () => {
    await Inventory.destroy({ truncate: true })
  })

  describe('POST /reservations', () => {
    const url = '/reservations';
    it('400s if no inventory is configured for the specify time and size', async () => {
      const result = await request.post(url)
        .send({
          time: '12:30',
          size: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: MISSING_INVENTORY.code,
        error: MISSING_INVENTORY.message,
      })
    })
  })
});