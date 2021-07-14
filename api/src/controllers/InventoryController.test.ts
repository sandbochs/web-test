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
  afterEach(async () => {
    await Inventory.destroy({ truncate: true, cascade: true })
  })

  describe('POST /inventories', () => {
    const url = '/inventories'
    it('400s if startTime is missing', async () => {
      const result = await request.post(url)
        .send({
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: MISSING_PARAMS.code,
        error: MISSING_PARAMS.message,
      })
    })

    it('400s if endTime is missing', async () => {
      const result = await request.post(url)
        .send({
          startTime: '03:00',
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
          startTime: '01:00',
          endTime: '03:00',
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
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: MISSING_PARAMS.code,
        error: MISSING_PARAMS.message,
      })
    })

    it('400s if the startTime is invalid', async () => {
      const result = await request.post(url)
        .send({
          startTime: 'HH:MM',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: INVALID_TIME.code,
        error: INVALID_TIME.message,
      })
    })

    it('400s if the endTime is invalid', async () => {
      const result = await request.post(url)
        .send({
          startTime: '03:00',
          endTime: 'HH:MM',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: INVALID_TIME.code,
        error: INVALID_TIME.message,
      })
    })

    it('400s if the startTime interval is invalid', async () => {
      const result = await request.post(url)
        .send({
          startTime: '01:01',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: INVALID_INTERVAL.code,
        error: INVALID_INTERVAL.message,
      })
    })

    it('400s if the endTime interval is invalid', async () => {
      const result = await request.post(url)
        .send({
          startTime: '01:00',
          endTime: '03:01',
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
          startTime: '01:00',
          endTime: '03:00',
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
          startTime: '01:00',
          endTime: '03:00',
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
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(200)

      const { id, startTime, endTime, maxSize, maxParties } = result.body;
      const expected = {
        startTime: '01:00:00',
        endTime: '03:00:00',
        maxSize: 4,
        maxParties: 3
      }
      expect({ startTime, endTime, maxSize, maxParties}).toStrictEqual(expected);
      expect(typeof id).toBe('number')
    })

    it('400s when trying to create a duplicate configuration', async () => {
      await request.post(url)
        .send({
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      const result = await request.post(url)
        .send({
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: ALREADY_EXISTS.code,
        error: ALREADY_EXISTS.message,
      })
    })

    it('400s when trying to create a duplicate configuration that is a subset', async () => {
      await request.post(url)
        .send({
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      const result = await request.post(url)
        .send({
          startTime: '02:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: ALREADY_EXISTS.code,
        error: ALREADY_EXISTS.message,
      })
    })

    it('400s when trying to create a duplicate configuration that is a superset', async () => {
      await request.post(url)
        .send({
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      const result = await request.post(url)
        .send({
          startTime: '00:00',
          endTime: '04:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: ALREADY_EXISTS.code,
        error: ALREADY_EXISTS.message,
      })
    })

    it('400s when trying to create a duplicate configuration that overlaps from start', async () => {
      await request.post(url)
        .send({
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      const result = await request.post(url)
        .send({
          startTime: '00:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        code: ALREADY_EXISTS.code,
        error: ALREADY_EXISTS.message,
      })
    })

    it('400s when trying to create a duplicate configuration that overlaps from end', async () => {
      await request.post(url)
        .send({
          startTime: '01:00',
          endTime: '03:00',
          maxSize: 4,
          maxParties: 3,
        })

      const result = await request.post(url)
        .send({
          startTime: '02:00',
          endTime: '04:00',
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