export default abstract class UnitOfWorkServiceInterface {
  abstract runInTransaction<T>(work: () => Promise<T>): Promise<T>;
  abstract get client(): any;
}
