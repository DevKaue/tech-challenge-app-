import DomainException from '@materials/domain/exceptions/domain.exception';
import InsufficientMaterialStockException from '@materials/domain/exceptions/insufficient-material-stock.exception';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export type MaterialProps = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  type?: MaterialType | `${MaterialType}`;
  stockQuantity?: number;
  stockUnit?: StockUnit | `${StockUnit}`;
  expiresAt?: Date | string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateMaterialProps = Partial<
  Pick<
    MaterialProps,
    | 'name'
    | 'description'
    | 'price'
    | 'type'
    | 'stockQuantity'
    | 'stockUnit'
    | 'expiresAt'
  >
>;

export default class Material {
  private _id: string;
  private _name: string;
  private _description: string | null;
  private _price: number;
  private _type: MaterialType;
  private _stockQuantity: number;
  private _stockUnit: StockUnit;
  private _expiresAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: MaterialProps) {
    this._id = props.id;
    this._name = this.validateName(props.name);
    this._description = this.normalizeDescription(props.description);
    this._price = this.validatePrice(props.price);
    this._type = this.validateType(props.type ?? MaterialType.PART);
    this._stockUnit = this.validateStockUnit(props.stockUnit ?? StockUnit.UNIT);
    this._stockQuantity = this.validateStockQuantity(props.stockQuantity ?? 0);
    this._expiresAt = this.normalizeExpiresAt(props.expiresAt);
    this.validateTypeAndUnit();
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get price(): number {
    return this._price;
  }

  public get type(): MaterialType {
    return this._type;
  }

  public get stockQuantity(): number {
    return this._stockQuantity;
  }

  public get stockUnit(): StockUnit {
    return this._stockUnit;
  }

  public get expiresAt(): Date | null {
    return this._expiresAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public update(props: UpdateMaterialProps): void {
    if (props.name !== undefined) {
      this._name = this.validateName(props.name);
    }

    if (props.description !== undefined) {
      this._description = this.normalizeDescription(props.description);
    }

    if (props.price !== undefined) {
      this._price = this.validatePrice(props.price);
    }

    if (props.type !== undefined) {
      this._type = this.validateType(props.type);
    }

    if (props.stockUnit !== undefined) {
      this._stockUnit = this.validateStockUnit(props.stockUnit);
    }

    if (props.stockQuantity !== undefined) {
      this._stockQuantity = this.validateStockQuantity(props.stockQuantity);
    }

    if (props.expiresAt !== undefined) {
      this._expiresAt = this.normalizeExpiresAt(props.expiresAt);
    }

    this.validateTypeAndUnit();
    this.touch();
  }

  public addStock(quantity: number): void {
    this.validateMovementQuantity(quantity);
    this._stockQuantity += quantity;
    this.touch();
  }

  public decrementStock(quantity: number): void {
    this.validateMovementQuantity(quantity);

    if (this._stockQuantity < quantity) {
      throw new InsufficientMaterialStockException(
        this._name,
        this._stockQuantity,
      );
    }

    this._stockQuantity -= quantity;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  private validateName(name: string): string {
    const normalizedName = name?.trim();

    if (!normalizedName) {
      throw new DomainException('Material name is required.');
    }

    return normalizedName;
  }

  private normalizeDescription(description?: string | null): string | null {
    if (description === undefined || description === null) {
      return null;
    }

    const normalizedDescription = description.trim();
    return normalizedDescription.length > 0 ? normalizedDescription : null;
  }

  private validatePrice(price: number): number {
    if (!Number.isFinite(price) || price < 0) {
      throw new DomainException(
        'Material price must be greater than or equal to 0.',
      );
    }

    return price;
  }

  private validateType(type: MaterialType | `${MaterialType}`): MaterialType {
    if (!Object.values(MaterialType).includes(type as MaterialType)) {
      throw new DomainException('Invalid material type.');
    }

    return type as MaterialType;
  }

  private validateStockUnit(unit: StockUnit | `${StockUnit}`): StockUnit {
    if (!Object.values(StockUnit).includes(unit as StockUnit)) {
      throw new DomainException('Invalid material stock unit.');
    }

    return unit as StockUnit;
  }

  private validateStockQuantity(stockQuantity: number): number {
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      throw new DomainException(
        'Material stock quantity must be greater than or equal to 0.',
      );
    }

    if (this._type === MaterialType.PART && !Number.isInteger(stockQuantity)) {
      throw new DomainException('Part stock quantity must be an integer.');
    }

    return stockQuantity;
  }

  private validateMovementQuantity(quantity: number): void {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new DomainException(
        'Stock movement quantity must be greater than 0.',
      );
    }

    if (this._type === MaterialType.PART && !Number.isInteger(quantity)) {
      throw new DomainException('Part stock movement must be an integer.');
    }
  }

  private normalizeExpiresAt(expiresAt?: Date | string | null): Date | null {
    if (!expiresAt) {
      return null;
    }

    const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);

    if (Number.isNaN(date.getTime())) {
      throw new DomainException('Invalid material expiration date.');
    }

    return date;
  }

  private validateTypeAndUnit(): void {
    if (
      this._type === MaterialType.PART &&
      this._stockUnit !== StockUnit.UNIT
    ) {
      throw new DomainException('Parts must use UNIT as stock unit.');
    }

    if (
      this._type === MaterialType.PART &&
      !Number.isInteger(this._stockQuantity)
    ) {
      throw new DomainException('Part stock quantity must be an integer.');
    }
  }
}
