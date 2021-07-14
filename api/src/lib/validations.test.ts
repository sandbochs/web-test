import * as validations from './validations'

describe('lib/validations', () => {
  describe('isTimeString', () => {
    const { isTimeString } = validations

    it('returns false for invalid times', () => {
      expect(isTimeString('25:50')).toBe(false)
      expect(isTimeString('24:50')).toBe(false)
      expect(isTimeString('23:60')).toBe(false)
      expect(isTimeString('HH:60')).toBe(false)
      expect(isTimeString(2340)).toBe(false)
    })

    it('returns true for a valid time', () => {
      expect(isTimeString('22:50')).toBe(true)
    })
  })

  describe('isValidInterval', () => {
    const { isValidInterval } = validations

    it('returns false for invalid intervals', () => {
      expect(isValidInterval('23:50', 15)).toBe(false)
      expect(isValidInterval('23:51', 10)).toBe(false)
      expect(isValidInterval('23:01', 7)).toBe(false)
    })

    it('handles non-integers', () => {
      expect(isValidInterval('23:HH', 7)).toBe(false)
    })

    it('returns true for valid intervals', () => {
      expect(isValidInterval('23:00', 15)).toBe(true)
      expect(isValidInterval('23:15', 15)).toBe(true)
      expect(isValidInterval('23:30', 15)).toBe(true)
      expect(isValidInterval('23:45', 15)).toBe(true)
    })
  })
})