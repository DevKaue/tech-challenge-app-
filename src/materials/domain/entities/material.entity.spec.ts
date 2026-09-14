import Material from '@materials/domain/entities/material.entity';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';
import DomainException from '@materials/domain/exceptions/domain.exception';
import InsufficientMaterialStockException from '@materials/domain/exceptions/insufficient-material-stock.exception';

const buildPart = (
  overrides: Partial<ConstructorParameters<typeof Material>[0]> = {},
) =>
  new Material({
    id: 'mat-1',
    name: 'Oil Filter',
    price: 50,
    type: MaterialType.PART,
    stockUnit: StockUnit.UNIT,
    stockQuantity: 10,
    ...overrides,
  });

const buildSupply = (
  overrides: Partial<ConstructorParameters<typeof Material>[0]> = {},
) =>
  new Material({
    id: 'mat-2',
    name: 'Engine Oil',
    price: 30,
    type: MaterialType.SUPPLY,
    stockUnit: StockUnit.LITER,
    stockQuantity: 5.5,
    ...overrides,
  });

describe('Material entity', () => {
  it('builds a valid PART and exposes getters', () => {
    const material = buildPart({ description: '  filter  ' });
    expect(material.id).toBe('mat-1');
    expect(material.name).toBe('Oil Filter');
    expect(material.description).toBe('filter');
    expect(material.price).toBe(50);
    expect(material.type).toBe(MaterialType.PART);
    expect(material.stockUnit).toBe(StockUnit.UNIT);
    expect(material.stockQuantity).toBe(10);
    expect(material.expiresAt).toBeNull();
    expect(material.createdAt).toBeInstanceOf(Date);
    expect(material.updatedAt).toBeInstanceOf(Date);
  });

  it('builds a SUPPLY with fractional quantity and expiration date', () => {
    const material = buildSupply({ expiresAt: '2030-01-01' });
    expect(material.stockQuantity).toBe(5.5);
    expect(material.expiresAt).toBeInstanceOf(Date);
  });

  it('defaults description to null when empty', () => {
    expect(buildPart({ description: '   ' }).description).toBeNull();
    expect(buildPart({ description: null }).description).toBeNull();
  });

  it('rejects empty name', () => {
    expect(() => buildPart({ name: '   ' })).toThrow(DomainException);
  });

  it('rejects negative or non-finite price', () => {
    expect(() => buildPart({ price: -1 })).toThrow(DomainException);
    expect(() => buildPart({ price: Number.NaN })).toThrow(DomainException);
  });

  it('rejects invalid type and stock unit', () => {
    expect(() => buildPart({ type: 'INVALID' as MaterialType })).toThrow(
      DomainException,
    );
    expect(() => buildSupply({ stockUnit: 'INVALID' as StockUnit })).toThrow(
      DomainException,
    );
  });

  it('rejects negative stock quantity', () => {
    expect(() => buildPart({ stockQuantity: -5 })).toThrow(DomainException);
  });

  it('rejects fractional stock for PART', () => {
    expect(() => buildPart({ stockQuantity: 2.5 })).toThrow(DomainException);
  });

  it('rejects PART with non-UNIT stock unit', () => {
    expect(() =>
      buildPart({ stockUnit: StockUnit.LITER, stockQuantity: 1 }),
    ).toThrow(DomainException);
  });

  it('rejects invalid expiration date', () => {
    expect(() => buildSupply({ expiresAt: 'not-a-date' })).toThrow(
      DomainException,
    );
  });

  it('updates fields', () => {
    const material = buildPart();
    material.update({
      name: 'New Name',
      description: 'desc',
      price: 99,
      stockQuantity: 20,
    });
    expect(material.name).toBe('New Name');
    expect(material.description).toBe('desc');
    expect(material.price).toBe(99);
    expect(material.stockQuantity).toBe(20);
  });

  it('converts a part into a supply via update', () => {
    const material = buildPart();
    material.update({ type: MaterialType.SUPPLY, stockUnit: StockUnit.LITER });
    expect(material.type).toBe(MaterialType.SUPPLY);
    expect(material.stockUnit).toBe(StockUnit.LITER);
  });

  it('adds stock', () => {
    const material = buildPart({ stockQuantity: 5 });
    material.addStock(3);
    expect(material.stockQuantity).toBe(8);
  });

  it('rejects movement quantity <= 0', () => {
    expect(() => buildPart().addStock(0)).toThrow(DomainException);
  });

  it('rejects fractional movement for PART', () => {
    expect(() => buildPart().addStock(1.5)).toThrow(DomainException);
  });

  it('decrements stock', () => {
    const material = buildPart({ stockQuantity: 5 });
    material.decrementStock(2);
    expect(material.stockQuantity).toBe(3);
  });

  it('throws when decrementing more than available', () => {
    const material = buildPart({ stockQuantity: 1 });
    expect(() => material.decrementStock(5)).toThrow(
      InsufficientMaterialStockException,
    );
  });
});
