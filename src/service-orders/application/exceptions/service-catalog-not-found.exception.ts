export class ServiceCatalogNotFoundException extends Error {
  constructor(id: string) {
    super(`Service ${id} not found in catalog`);
    this.name = 'ServiceCatalogNotFoundException';
  }
}
