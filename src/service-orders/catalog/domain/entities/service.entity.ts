import DomainException from '@service-orders/catalog/domain/exceptions/domain.exception';

export type ServiceProps = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateServiceProps = Partial<
  Pick<ServiceProps, 'name' | 'description' | 'price'>
>;

export default class Service {
  private _id: string;
  private _name: string;
  private _description: string | null;
  private _price: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ServiceProps) {
    this._id = props.id;
    this._name = this.validateName(props.name);
    this._description = this.normalizeDescription(props.description);
    this._price = this.validatePrice(props.price);
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(props: UpdateServiceProps): void {
    if (props.name !== undefined) {
      this._name = this.validateName(props.name);
    }
    if (props.description !== undefined) {
      this._description = this.normalizeDescription(props.description);
    }
    if (props.price !== undefined) {
      this._price = this.validatePrice(props.price);
    }
    this._updatedAt = new Date();
  }

  private validateName(name: string): string {
    const normalized = name?.trim();
    if (!normalized) {
      throw new DomainException('Service name is required.');
    }
    return normalized;
  }

  private validatePrice(price: number): number {
    if (!Number.isFinite(price) || price < 0) {
      throw new DomainException(
        'Service price must be greater than or equal to 0.',
      );
    }
    return price;
  }

  private normalizeDescription(description?: string | null): string | null {
    if (description === undefined || description === null) {
      return null;
    }
    const normalized = description.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
