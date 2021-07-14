import supertest from 'supertest'

import { Inventory } from '../models'
import { errors } from '../lib/coded-error'
import { server } from '../index'

const request = supertest(server.getApp())
const {
  api: {
    INVALID_TIME,
  },
  inventory: {
    ALREADY_EXISTS,
    INVALID_INTERVAL,
    INVALID_MAX_SIZE,
    INVALID_MAX_PARTIES,
    MISSING_PARAMS,
  }
} = errors

describe('InventoryController', () => {
  afterAll(async () => {
    await Inventory.destroy({ truncate: true })
  })

  describe('POST /inventories', () => {
    const url = '/inventories'
    it('400s if time is missing', async () => {
      const result = await request.post(url)
        .send({
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: MISSING_PARAMS.code,
        error: MISSING_PARAMS.message,
      })
    })

    it('400s if maxSize is missing', async () => {
      const result = await request.post(url)
        .send({
          time: '01:00',
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: MISSING_PARAMS.code,
        error: MISSING_PARAMS.message,
      })
    })

    it('400s if maxParties is missing', async () => {
      const result = await request.post(url)
        .send({
          time: '01:00',
          maxSize: 4,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: MISSING_PARAMS.code,
        error: MISSING_PARAMS.message,
      })
    })

    it('400s if the time is invalid', async () => {
      const result = await request.post(url)
        .send({
          time: 'HH:MM',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: INVALID_TIME.code,
        error: INVALID_TIME.message,
      })
    })

    it('400s if the interval is invalid', async () => {
      const result = await request.post(url)
        .send({
          time: '01:01',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: INVALID_INTERVAL.code,
        error: INVALID_INTERVAL.message,
      })
    })

    it('400s if maxSize is not a number', async () => {
      const result = await request.post(url)
        .send({
          time: '01:00',
          maxSize: '4',
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: INVALID_MAX_SIZE.code,
        error: INVALID_MAX_SIZE.message,
      })
    })

    it('400s if maxParties is not a number', async () => {
      const result = await request.post(url)
        .send({
          time: '01:00',
          maxSize: 4,
          maxParties: '3',
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: INVALID_MAX_PARTIES.code,
        error: INVALID_MAX_PARTIES.message,
      })
    })

    it('200s on successful creation', async () => {
      const result = await request.post(url)
        .send({
          time: '01:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(200)

      const { id, time, maxSize, maxParties } = result.body;
      const expected = {
        time: '01:00:00',
        maxSize: 4,
        maxParties: 3
      }
      expect({ time, maxSize, maxParties}).toStrictEqual(expected);
      expect(typeof id).toBe('number')
    })

    it('400s when trying to create a duplicate configuration', async () => {
      const result = await request.post(url)
        .send({
          time: '01:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: ALREADY_EXISTS.code,
        error: ALREADY_EXISTS.message,
      })
    })
  })
})