export default class MaterialNotFoundException extends Error {
  constructor(message: string = 'Material not found.') {
    super(message);
    this.name = 'MaterialNotFoundException';
  }
}
