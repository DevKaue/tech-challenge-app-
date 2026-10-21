export class PartNotFoundException extends Error {
  constructor(id: string) {
    super(`Part ${id} not found`);
    this.name = 'PartNotFoundException';
  }
}
