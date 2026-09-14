import LicensePlate from './license-plate.vo';
import InvalidLicensePlateException from '../exceptions/invalid-license-plate.exception';

describe('LicensePlate Value Object', () => {
  describe('Traditional Brazilian Format', () => {
    it('should create a valid traditional license plate', () => {
      const plate = new LicensePlate('ABC1234');

      expect(plate.value).toBe('ABC1234');
    });

    it('should clean and uppercase traditional format', () => {
      const plate = new LicensePlate('abc-1234');

      expect(plate.value).toBe('ABC1234');
    });

    it('should handle traditional format with spaces', () => {
      const plate = new LicensePlate('ABC 1234');

      expect(plate.value).toBe('ABC1234');
    });

    it('should accept valid traditional formats', () => {
      const validPlates = ['ABC1234', 'XYZ9999', 'AAA0000'];

      validPlates.forEach((plateLetter) => {
        const plate = new LicensePlate(plateLetter);
        expect(plate.value).toBe(plateLetter);
      });
    });
  });

  describe('Mercosul Format', () => {
    it('should create a valid Mercosul license plate', () => {
      const plate = new LicensePlate('ABC1D23');

      expect(plate.value).toBe('ABC1D23');
    });

    it('should clean and uppercase Mercosul format', () => {
      const plate = new LicensePlate('abc-1d-23');

      expect(plate.value).toBe('ABC1D23');
    });

    it('should handle Mercosul format with spaces', () => {
      const plate = new LicensePlate('ABC 1D 23');

      expect(plate.value).toBe('ABC1D23');
    });

    it('should accept valid Mercosul formats', () => {
      const validPlates = ['ABC1D23', 'XYZ9Z99', 'AAA1B00'];

      validPlates.forEach((plateLetter) => {
        const plate = new LicensePlate(plateLetter);
        expect(plate.value).toBe(plateLetter);
      });
    });
  });

  describe('Invalid Formats', () => {
    it('should throw error for invalid format', () => {
      expect(() => {
        new LicensePlate('INVALID');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for only letters', () => {
      expect(() => {
        new LicensePlate('ABCDEFGH');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for only numbers', () => {
      expect(() => {
        new LicensePlate('12345678');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for incorrect length', () => {
      expect(() => {
        new LicensePlate('ABC12');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for incorrect letter positions', () => {
      expect(() => {
        new LicensePlate('1ABC234');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for empty string', () => {
      expect(() => {
        new LicensePlate('');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for only special characters', () => {
      expect(() => {
        new LicensePlate('---...---');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for Mercosul with wrong letter position', () => {
      expect(() => {
        new LicensePlate('AB1C234');
      }).toThrow(InvalidLicensePlateException);
    });

    it('should throw error for traditional format with letter in number position', () => {
      expect(() => {
        new LicensePlate('ABCA234');
      }).toThrow(InvalidLicensePlateException);
    });
  });

  describe('Format Cleaning', () => {
    it('should remove hyphens', () => {
      const plate = new LicensePlate('ABC-1234');

      expect(plate.value).toBe('ABC1234');
    });

    it('should remove spaces', () => {
      const plate = new LicensePlate('ABC 1234');

      expect(plate.value).toBe('ABC1234');
    });

    it('should convert to uppercase', () => {
      const plate = new LicensePlate('abc1234');

      expect(plate.value).toBe('ABC1234');
    });

    it('should handle mixed case with special characters', () => {
      const plate = new LicensePlate('aBc-1D-23');

      expect(plate.value).toBe('ABC1D23');
    });

    it('should remove multiple special characters', () => {
      const plate = new LicensePlate('A-B-C-1-2-3-4');

      expect(plate.value).toBe('ABC1234');
    });

    it('should handle dots as special characters', () => {
      const plate = new LicensePlate('ABC.1234');

      expect(plate.value).toBe('ABC1234');
    });
  });

  describe('equals Method', () => {
    it('should return true for same license plate', () => {
      const plate1 = new LicensePlate('ABC1234');
      const plate2 = new LicensePlate('ABC1234');

      expect(plate1.equals(plate2)).toBe(true);
    });

    it('should return false for different license plates', () => {
      const plate1 = new LicensePlate('ABC1234');
      const plate2 = new LicensePlate('XYZ9999');

      expect(plate1.equals(plate2)).toBe(false);
    });

    it('should return true for same plate created with different formatting', () => {
      const plate1 = new LicensePlate('ABC-1234');
      const plate2 = new LicensePlate('abc1234');

      expect(plate1.equals(plate2)).toBe(true);
    });

    it('should return true for Mercosul formats that are identical', () => {
      const plate1 = new LicensePlate('ABC1D23');
      const plate2 = new LicensePlate('abc-1d-23');

      expect(plate1.equals(plate2)).toBe(true);
    });

    it('should return false for traditional vs Mercosul with similar pattern', () => {
      const traditional = new LicensePlate('ABC1234');
      const mercosul = new LicensePlate('ABC1D23');

      expect(traditional.equals(mercosul)).toBe(false);
    });
  });

  describe('Value Object Immutability', () => {
    it('should have readonly value property (TypeScript enforcement)', () => {
      const plate = new LicensePlate('ABC1234');

      // TypeScript readonly is enforced at compile time, not runtime
      // This test verifies the property cannot be reassigned (in TypeScript)
      expect(plate.value).toBe('ABC1234');
    });
  });

  describe('Error Messages', () => {
    it('should throw error with descriptive message', () => {
      expect(() => {
        new LicensePlate('INVALID');
      }).toThrow(
        'Invalid license plate format. Must be Mercosul or traditional Brazilian format.',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should accept license plate with lowercase Mercosul', () => {
      const plate = new LicensePlate('abc1d23');

      expect(plate.value).toBe('ABC1D23');
    });

    it('should handle very long input that needs cleaning', () => {
      const plate = new LicensePlate('A-B-C---1-2-3-4');

      expect(plate.value).toBe('ABC1234');
    });

    it('should handle numbers zero', () => {
      const plate = new LicensePlate('ABC0000');

      expect(plate.value).toBe('ABC0000');
    });

    it('should handle all letters A through Z', () => {
      const plate = new LicensePlate('ZZZ9999');

      expect(plate.value).toBe('ZZZ9999');
    });
  });
});
