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

describe('ReservationController', () => {
  afterEach(async () => {
    await Inventory.destroy({ truncate: true, cascade: true })
  })

  describe('POST /reservations', () => {
    const url = '/reservations';
    it('400s if no inventory is configured for the specify time and size', async () => {
      const result = await request.post(url)
        .send({
          date: '2020-11-01',
          time: '12:30',
          size: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: MISSING_INVENTORY.code,
        error: MISSING_INVENTORY.message,
      })
    })

    it.only('200...', async () => {
      const iRes = await request.post('/inventories')
        .send({
          startTime: '13:00',
          endTime: '15:00',
          maxSize: 4,
          maxParties: 3,
        })
      expect(iRes.status).toBe(200)

      const result = await request.post(url)
        .send({
          date: '2020-11-01',
          time: '13:30',
          size: 4,
        })

      expect(result.status).toBe(200)
    })
  })
});