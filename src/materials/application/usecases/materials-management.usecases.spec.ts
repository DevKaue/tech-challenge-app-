import AddMaterialStockUseCase from '@materials/application/usecases/add-material-stock.usecase';
import CreateMaterialUseCase from '@materials/application/usecases/create-material.usecase';
import DeleteMaterialUseCase from '@materials/application/usecases/delete-material.usecase';
import FindMaterialByIdUseCase from '@materials/application/usecases/find-material-by-id.usecase';
import ListMaterialsUseCase from '@materials/application/usecases/list-materials.usecase';
import UpdateMaterialUseCase from '@materials/application/usecases/update-material.usecase';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import Material from '@materials/domain/entities/material.entity';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';
import MaterialFactory from '@materials/domain/factories/material.factory';

class InMemoryMaterialRepository implements MaterialRepositoryInterface {
  private readonly materials = new Map<string, Material>();

  async create(material: Material): Promise<void> {
    this.materials.set(material.id, material);
  }

  async findAll(): Promise<Material[]> {
    return Array.from(this.materials.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  async findById(id: string): Promise<Material | null> {
    return this.materials.get(id) ?? null;
  }

  async update(material: Material): Promise<void> {
    this.materials.set(material.id, material);
  }

  async delete(id: string): Promise<void> {
    this.materials.delete(id);
  }

  async decrementStock(materialId: string, quantity: number): Promise<void> {
    const material = await this.findById(materialId);

    if (material) {
      material.decrementStock(quantity);
      await this.update(material);
    }
  }
}

describe('Materials management use cases', () => {
  let repository: InMemoryMaterialRepository;
  let createMaterialUseCase: CreateMaterialUseCase;
  let listMaterialsUseCase: ListMaterialsUseCase;
  let findMaterialByIdUseCase: FindMaterialByIdUseCase;
  let updateMaterialUseCase: UpdateMaterialUseCase;
  let addMaterialStockUseCase: AddMaterialStockUseCase;
  let deleteMaterialUseCase: DeleteMaterialUseCase;

  beforeEach(() => {
    repository = new InMemoryMaterialRepository();
    createMaterialUseCase = new CreateMaterialUseCase(repository);
    listMaterialsUseCase = new ListMaterialsUseCase(repository);
    findMaterialByIdUseCase = new FindMaterialByIdUseCase(repository);
    updateMaterialUseCase = new UpdateMaterialUseCase(repository);
    addMaterialStockUseCase = new AddMaterialStockUseCase(repository);
    deleteMaterialUseCase = new DeleteMaterialUseCase(repository);
  });

  it('should create a material with default stock quantity', async () => {
    const output = await createMaterialUseCase.execute({
      name: 'Filtro de oleo',
      price: 45.9,
    });

    expect(output.material).toEqual(
      expect.objectContaining({
        name: 'Filtro de oleo',
        price: 45.9,
        stockQuantity: 0,
      }),
    );
  });

  it('should list materials sorted by repository order', async () => {
    await repository.create(
      MaterialFactory.create({ name: 'Pastilha de freio', price: 180 }),
    );
    await repository.create(
      MaterialFactory.create({ name: 'Filtro de oleo', price: 45 }),
    );

    const output = await listMaterialsUseCase.execute();

    expect(output.materials.map((material) => material.name)).toEqual([
      'Filtro de oleo',
      'Pastilha de freio',
    ]);
  });

  it('should update material data', async () => {
    const created = MaterialFactory.create({
      name: 'Filtro',
      price: 35,
      stockQuantity: 2,
    });
    await repository.create(created);

    const output = await updateMaterialUseCase.execute({
      id: created.id,
      name: 'Filtro de oleo',
      price: 45,
      stockQuantity: 4,
    });

    expect(output.material).toEqual(
      expect.objectContaining({
        id: created.id,
        name: 'Filtro de oleo',
        price: 45,
        stockQuantity: 4,
      }),
    );
  });

  it('should add stock to an existing material', async () => {
    const material = MaterialFactory.create({
      name: 'Vela de ignicao',
      price: 25,
      stockQuantity: 3,
    });
    await repository.create(material);

    const output = await addMaterialStockUseCase.execute({
      id: material.id,
      quantity: 7,
    });

    expect(output.material.stockQuantity).toBe(10);
  });

  it('should allow fractional stock for supplies', async () => {
    const material = MaterialFactory.create({
      name: 'Oleo 5W30',
      price: 45,
      type: MaterialType.SUPPLY,
      stockQuantity: 10,
      stockUnit: StockUnit.LITER,
    });
    await repository.create(material);

    const output = await addMaterialStockUseCase.execute({
      id: material.id,
      quantity: 2.5,
    });

    expect(output.material).toEqual(
      expect.objectContaining({
        type: MaterialType.SUPPLY,
        stockQuantity: 12.5,
        stockUnit: StockUnit.LITER,
      }),
    );
  });

  it('should reject fractional stock for parts', async () => {
    const material = MaterialFactory.create({
      name: 'Filtro de oleo',
      price: 45,
      stockQuantity: 2,
    });
    await repository.create(material);

    await expect(
      addMaterialStockUseCase.execute({
        id: material.id,
        quantity: 0.5,
      }),
    ).rejects.toThrow('Part stock movement must be an integer.');
  });

  it('should return the removed material when deleting', async () => {
    const material = MaterialFactory.create({
      name: 'Correia dentada',
      price: 120,
      stockQuantity: 1,
    });
    await repository.create(material);

    const output = await deleteMaterialUseCase.execute({ id: material.id });

    expect(output.material.id).toBe(material.id);
    await expect(
      findMaterialByIdUseCase.execute({ id: material.id }),
    ).rejects.toThrow(MaterialNotFoundException);
  });

  it('should throw when material is not found', async () => {
    await expect(
      findMaterialByIdUseCase.execute({ id: 'missing-material' }),
    ).rejects.toThrow(MaterialNotFoundException);
  });
});
