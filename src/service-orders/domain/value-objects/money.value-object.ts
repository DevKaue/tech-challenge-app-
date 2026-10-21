export class Money {
  private constructor(private readonly _cents: number) {}

  static fromFloat(value: number): Money {
    if (value < 0) {
      throw new Error('Money value cannot be negative');
    }
    return new Money(Math.round(value * 100));
  }

  static fromCents(cents: number): Money {
    if (cents < 0) {
      throw new Error('Money value cannot be negative');
    }
    return new Money(cents);
  }

  get cents(): number {
    return this._cents;
  }

  get float(): number {
    return this._cents / 100;
  }

  multiply(quantity: number): Money {
    return new Money(this._cents * quantity);
  }

  add(other: Money): Money {
    return new Money(this._cents + other._cents);
  }
}
