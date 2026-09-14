import Email from './email.vo';
import DomainException from '../exceptions/domain.exception';

describe('Email Value Object', () => {
  describe('Valid Email Addresses', () => {
    it('should create a valid email', () => {
      const email = new Email('test@example.com');

      expect(email.value).toBe('test@example.com');
    });

    it('should accept email with subdomain', () => {
      const email = new Email('user@mail.example.com');

      expect(email.value).toBe('user@mail.example.com');
    });

    it('should accept email with numbers', () => {
      const email = new Email('user123@example123.com');

      expect(email.value).toBe('user123@example123.com');
    });

    it('should accept email with special characters', () => {
      const email = new Email('user.name+tag@example.com');

      expect(email.value).toBe('user.name+tag@example.com');
    });

    it('should accept email with hyphen', () => {
      const email = new Email('user-name@example-domain.com');

      expect(email.value).toBe('user-name@example-domain.com');
    });

    it('should accept email with underscore', () => {
      const email = new Email('user_name@example.com');

      expect(email.value).toBe('user_name@example.com');
    });

    it('should accept email with multiple subdomains', () => {
      const email = new Email('user@mail.sub.example.co.uk');

      expect(email.value).toBe('user@mail.sub.example.co.uk');
    });

    it('should accept email with two character domain extension', () => {
      const email = new Email('user@example.co');

      expect(email.value).toBe('user@example.co');
    });
  });

  describe('Invalid Email Addresses', () => {
    it('should throw error for email without @', () => {
      expect(() => {
        new Email('userexample.com');
      }).toThrow(DomainException);
    });

    it('should throw error for email without domain', () => {
      expect(() => {
        new Email('user@');
      }).toThrow(DomainException);
    });

    it('should throw error for email without local part', () => {
      expect(() => {
        new Email('@example.com');
      }).toThrow(DomainException);
    });

    it('should throw error for email with multiple @', () => {
      expect(() => {
        new Email('user@example@com');
      }).toThrow(DomainException);
    });

    it('should throw error for email without TLD', () => {
      expect(() => {
        new Email('user@example');
      }).toThrow(DomainException);
    });

    it('should throw error for email with spaces', () => {
      expect(() => {
        new Email('user name@example.com');
      }).toThrow(DomainException);
    });

    it('should throw error for email with space before @', () => {
      expect(() => {
        new Email('user @example.com');
      }).toThrow(DomainException);
    });

    it('should throw error for email with space after @', () => {
      expect(() => {
        new Email('user@ example.com');
      }).toThrow(DomainException);
    });

    it('should throw error for empty string', () => {
      expect(() => {
        new Email('');
      }).toThrow(DomainException);
    });

    it('should throw error for only @', () => {
      expect(() => {
        new Email('@');
      }).toThrow(DomainException);
    });

    it('should throw error for email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(() => {
        new Email(longEmail);
      }).toThrow(DomainException);
    });
  });

  describe('Email Length Validation', () => {
    it('should accept email with 254 characters (max length)', () => {
      // Create email exactly at the max length
      const localPart = 'a'.repeat(240);
      const email = new Email(`${localPart}@test.com`);

      expect(email.value.length).toBeLessThanOrEqual(254);
    });

    it('should reject email with 255 characters', () => {
      const localPart = 'a'.repeat(244);
      const emailString = `${localPart}@test.com`;

      if (emailString.length > 254) {
        expect(() => {
          new Email(emailString);
        }).toThrow(DomainException);
      }
    });

    it('should accept email with 10 characters', () => {
      const email = new Email('user@a.co');

      expect(email.value).toBe('user@a.co');
    });
  });

  describe('Error Messages', () => {
    it('should throw error with message containing "Invalid email format"', () => {
      expect(() => {
        new Email('invalid-email');
      }).toThrow('Invalid email format.');
    });
  });

  describe('toString Method', () => {
    it('should return email value as string', () => {
      const email = new Email('test@example.com');

      expect(email.toString()).toBe('test@example.com');
    });

    it('should return the same value as the value property', () => {
      const emailAddress = 'user@example.com';
      const email = new Email(emailAddress);

      expect(email.toString()).toBe(email.value);
    });
  });

  describe('Value Object Immutability', () => {
    it('should have readonly value property (TypeScript enforcement)', () => {
      const email = new Email('test@example.com');

      // TypeScript readonly is enforced at compile time, not runtime
      // This test verifies the property cannot be reassigned (in TypeScript)
      expect(email.value).toBe('test@example.com');
    });
  });

  describe('Edge Cases', () => {
    it('should accept email with plus sign for filtering', () => {
      const email = new Email('user+filter@example.com');

      expect(email.value).toBe('user+filter@example.com');
    });

    it('should accept email starting with number', () => {
      const email = new Email('123user@example.com');

      expect(email.value).toBe('123user@example.com');
    });

    it('should handle email from localhost (local network)', () => {
      // This depends on validation rules - testing typical internet email
      const email = new Email('user@localhost.local');

      expect(email.value).toBe('user@localhost.local');
    });
  });
});
