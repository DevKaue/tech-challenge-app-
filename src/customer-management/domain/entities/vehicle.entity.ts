import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import Year from '@customer-management/domain/value-objects/year.vo';

export type VehicleProps = {
  id: string;
  licensePlate: LicensePlate;
  brand: string;
  model: string;
  year: Year;
  customerId: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export default class Vehicle {
  private _id: string;
  private _licensePlate: LicensePlate;
  private _brand: string;
  private _model: string;
  private _year: Year;
  private _customerId: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date;

  constructor({
    id,
    licensePlate,
    brand,
    model,
    year,
    customerId,
    createdAt,
    updatedAt,
    deletedAt,
  }: VehicleProps) {
    this._id = id;
    this._licensePlate = licensePlate;
    this._brand = brand;
    this._model = model;
    this._year = year;
    this._customerId = customerId;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
    this._deletedAt = deletedAt ?? undefined;
  }

  // Getters
  public get id(): string {
    return this._id;
  }

  public get licensePlate(): LicensePlate {
    return this._licensePlate;
  }

  public get brand(): string {
    return this._brand;
  }

  public get model(): string {
    return this._model;
  }

  public get year(): Year {
    return this._year;
  }

  public get customerId(): string {
    return this._customerId;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  // Methods
  public changeLicensePlate(newLicensePlate: LicensePlate): void {
    this._licensePlate = newLicensePlate;
    this._updatedAt = new Date();
  }

  public changeBrand(newBrand: string): void {
    this._brand = newBrand;
    this._updatedAt = new Date();
  }

  public changeModel(newModel: string): void {
    this._model = newModel;
    this._updatedAt = new Date();
  }

  public changeYear(newYear: Year): void {
    this._year = newYear;
    this._updatedAt = new Date();
  }

  public softDelete(): void {
    this._deletedAt = new Date();
  }
}
