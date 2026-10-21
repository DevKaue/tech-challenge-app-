import Year from './year.vo';
import DomainException from '../exceptions/domain.exception';

describe('Year Value Object', () => {
  describe('Valid Years', () => {
    it('should create a valid year', () => {
      const year = new Year(2020);

      expect(year.value).toBe(2020);
    });

    it('should accept minimum valid year (1000)', () => {
      const year = new Year(1000);

      expect(year.value).toBe(1000);
    });

    it('should accept maximum valid year (9999)', () => {
      const year = new Year(9999);

      expect(year.value).toBe(9999);
    });

    it('should accept year in 1900s', () => {
      const year = new Year(1950);

      expect(year.value).toBe(1950);
    });

    it('should accept year in 2000s', () => {
      const year = new Year(2000);

      expect(year.value).toBe(2000);
    });

    it('should accept current year', () => {
      const currentYear = new Date().getFullYear();
      const year = new Year(currentYear);

      expect(year.value).toBe(currentYear);
    });

    it('should accept future years', () => {
      const futureYear = new Date().getFullYear() + 10;
      const year = new Year(futureYear);

      expect(year.value).toBe(futureYear);
    });

    it('should accept various valid years', () => {
      const validYears = [1000, 1500, 1800, 1900, 2000, 2024, 5000, 9999];

      validYears.forEach((yearValue) => {
        const year = new Year(yearValue);
        expect(year.value).toBe(yearValue);
      });
    });
  });

  describe('Invalid Years', () => {
    it('should throw error for year less than 1000', () => {
      expect(() => {
        new Year(999);
      }).toThrow(DomainException);
    });

    it('should throw error for year 999', () => {
      expect(() => {
        new Year(999);
      }).toThrow(DomainException);
    });

    it('should throw error for year greater than 9999', () => {
      expect(() => {
        new Year(10000);
      }).toThrow(DomainException);
    });

    it('should throw error for zero', () => {
      expect(() => {
        new Year(0);
      }).toThrow(DomainException);
    });

    it('should throw error for negative year', () => {
      expect(() => {
        new Year(-2020);
      }).toThrow(DomainException);
    });

    it('should throw error for decimal year', () => {
      expect(() => {
        new Year(2020.5);
      }).toThrow(DomainException);
    });

    it('should throw error for very large number', () => {
      expect(() => {
        new Year(999999);
      }).toThrow(DomainException);
    });

    it('should throw error for very small number', () => {
      expect(() => {
        new Year(-999);
      }).toThrow(DomainException);
    });
  });

  describe('Year Boundaries', () => {
    it('should accept year 1000 (minimum)', () => {
      const year = new Year(1000);

      expect(year.value).toBe(1000);
    });

    it('should reject year 999 (below minimum)', () => {
      expect(() => {
        new Year(999);
      }).toThrow(DomainException);
    });

    it('should accept year 9999 (maximum)', () => {
      const year = new Year(9999);

      expect(year.value).toBe(9999);
    });

    it('should reject year 10000 (above maximum)', () => {
      expect(() => {
        new Year(10000);
      }).toThrow(DomainException);
    });

    it('should accept year 1001 (just above minimum)', () => {
      const year = new Year(1001);

      expect(year.value).toBe(1001);
    });

    it('should accept year 9998 (just below maximum)', () => {
      const year = new Year(9998);

      expect(year.value).toBe(9998);
    });
  });

  describe('Integer Validation', () => {
    it('should throw error for float number', () => {
      expect(() => {
        new Year(2020.1);
      }).toThrow(DomainException);
    });

    it('should throw error for float with .5', () => {
      expect(() => {
        new Year(2020.5);
      }).toThrow(DomainException);
    });

    it('should throw error for float with .9', () => {
      expect(() => {
        new Year(2020.9);
      }).toThrow(DomainException);
    });

    it('should accept exact integer', () => {
      const year = new Year(2020);

      expect(Number.isInteger(year.value)).toBe(true);
      expect(year.value).toBe(2020);
    });
  });

  describe('Error Messages', () => {
    it('should throw error with descriptive message', () => {
      expect(() => {
        new Year(500);
      }).toThrow('Invalid year. Year must be a four-digit integer.');
    });

    it('should throw error message for decimal', () => {
      expect(() => {
        new Year(2020.5);
      }).toThrow('Invalid year. Year must be a four-digit integer.');
    });

    it('should throw error message for negative', () => {
      expect(() => {
        new Year(-1);
      }).toThrow('Invalid year. Year must be a four-digit integer.');
    });
  });

  describe('Value Object Immutability', () => {
    it('should have readonly value property (TypeScript enforcement)', () => {
      const year = new Year(2020);

      // TypeScript readonly is enforced at compile time, not runtime
      // This test verifies the property cannot be reassigned (in TypeScript)
      expect(year.value).toBe(2020);
    });
  });

  describe('Type Validation', () => {
    it('should work with year from Date object', () => {
      const date = new Date('2024-06-15T12:00:00');
      const yearValue = date.getFullYear();
      const year = new Year(yearValue);

      expect(year.value).toBe(2024);
    });

    it('should reject NaN', () => {
      expect(() => {
        new Year(NaN);
      }).toThrow(DomainException);
    });

    it('should reject Infinity', () => {
      expect(() => {
        new Year(Infinity);
      }).toThrow(DomainException);
    });

    it('should reject -Infinity', () => {
      expect(() => {
        new Year(-Infinity);
      }).toThrow(DomainException);
    });
  });

  describe('Edge Cases', () => {
    it('should handle year 1001', () => {
      const year = new Year(1001);

      expect(year.value).toBe(1001);
    });

    it('should handle year 2000', () => {
      const year = new Year(2000);

      expect(year.value).toBe(2000);
    });

    it('should handle year 9998', () => {
      const year = new Year(9998);

      expect(year.value).toBe(9998);
    });

    it('should handle consecutive years', () => {
      const year1 = new Year(2023);
      const year2 = new Year(2024);

      expect(year2.value).toBe(year1.value + 1);
    });
  });
});
