import { formatTime } from './time';

describe('time', () => {
  describe('formatTime', () => {
    it('should format 0 seconds as "00s"', () => {
      expect(formatTime(0)).toBe('00s');
    });

    it('should format seconds less than a minute correctly', () => {
      expect(formatTime(30)).toBe('30s');
    });

    it('should format exactly one minute correctly', () => {
      expect(formatTime(60)).toBe('1m 00s');
    });

    it('should format minutes and seconds correctly', () => {
      expect(formatTime(150)).toBe('2m 30s'); // 2 minutes 30 seconds
    });

    it('should format exactly one hour correctly', () => {
      expect(formatTime(3600)).toBe('1h 00m 00s');
    });

    it('should format hours, minutes, and seconds correctly', () => {
      expect(formatTime(3661)).toBe('1h 01m 01s'); // 1 hour 1 minute 1 second
    });

    it('should format large time values correctly', () => {
      expect(formatTime(7265)).toBe('2h 01m 05s'); // 2 hours 1 minute 5 seconds
    });

    it('should handle decimal inputs by flooring them', () => {
      expect(formatTime(90.9)).toBe('1m 30s'); // 90.9 seconds floored to 90
    });

    it('should format infinity as "Infinity"', () => {
      expect(formatTime(Infinity)).toBe('Infinity');
    });

    it('should throw an error for negative numbers', () => {
      expect(() => formatTime(-1)).toThrow('Input must be a non-negative number');
    });

    it('should throw an error for non-number inputs', () => {
      expect(() => formatTime('abc' as any)).toThrow('Input must be a non-negative number');
      expect(() => formatTime(null as any)).toThrow('Input must be a non-negative number');
      expect(() => formatTime(undefined as any)).toThrow('Input must be a non-negative number');
      expect(() => formatTime({} as any)).toThrow('Input must be a non-negative number');
    });

    // Additional edge cases
    it('should format 59 seconds correctly', () => {
      expect(formatTime(59)).toBe('59s');
    });

    it('should format 61 seconds correctly', () => {
      expect(formatTime(61)).toBe('1m 01s');
    });

    it('should format 3599 seconds correctly', () => {
      expect(formatTime(3599)).toBe('59m 59s');
    });

    it('should format 3601 seconds correctly', () => {
      expect(formatTime(3601)).toBe('1h 00m 01s');
    });

    it('should format very large time values correctly', () => {
      expect(formatTime(366100)).toBe('101h 41m 40s'); // 101 hours 41 minutes 40 seconds
    });
  });
});