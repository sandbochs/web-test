import supertest from 'supertest'

import { DaysInventory, Inventory, Reservation } from '../models'
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
    await Reservation.destroy({ truncate: true, cascade: true })
    await DaysInventory.destroy({ truncate: true, cascade: true })
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

    it('when inventory maxSize === size', async () => {
      const maxSize = 4;
      const maxParties = 3;
      const iRes = await request.post('/inventories')
        .send({
          startTime: '13:00',
          endTime: '15:00',
          maxSize,
          maxParties,
        })
      expect(iRes.status).toBe(200)

      for (let i=0; i < maxParties; i++) {
        const result = await request.post(url)
          .send({
            name: 'Valentino Rossi',
            email: 'vr46@yamaha.com',
            date: '2020-11-01',
            time: '13:30',
            size: maxSize,
          })

        expect(result.status).toBe(200)
      }

      const result = await request.post(url)
        .send({
          name: 'Valentino Rossi',
          email: 'vr46@yamaha.com',
          date: '2020-11-01',
          time: '13:30',
          size: maxSize,
        })

      expect(result.status).toBe(400)
    })

    it('when inventory maxSize > size', async () => {
      const maxSize = 4;
      const maxParties = 3;
      const iRes = await request.post('/inventories')
        .send({
          startTime: '13:00',
          endTime: '15:00',
          maxSize,
          maxParties,
        })
      expect(iRes.status).toBe(200)

      const iRes2 = await request.post('/inventories')
        .send({
          startTime: '13:00',
          endTime: '15:00',
          maxSize: 10,
          maxParties: 1,
        })
      expect(iRes2.status).toBe(200)

      for (let i=0; i < maxParties; i++) {
        const result = await request.post(url)
          .send({
            name: 'Valentino Rossi',
            email: 'vr46@yamaha.com',
            date: '2020-11-01',
            time: '13:30',
            size: maxSize,
          })

        expect(result.status).toBe(200)
      }

      const result = await request.post(url)
        .send({
          name: 'Valentino Rossi',
          email: 'vr46@yamaha.com',
          date: '2020-11-01',
          time: '13:30',
          size: maxSize,
        })

      expect(result.status).toBe(200)

      const result2 = await request.post(url)
        .send({
          name: 'Valentino Rossi',
          email: 'vr46@yamaha.com',
          date: '2020-11-01',
          time: '13:30',
          size: maxSize,
        })

      expect(result2.status).toBe(400)
    })
  })
});