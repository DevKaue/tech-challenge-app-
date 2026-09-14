# CustomerManagementInterface

## Uso em Outro Módulo

### Opção 1: Use Case Puro ⭐

**Vantagem**: Use case sem dependência de NestJS - totalmente testável e desacoplado de tecnologia.

#### Use Case
```typescript
export class MinhaUseCase {
  constructor(private readonly customerManagement: CustomerManagementInterface) {}

  async execute(customerId: string) {
    const customer = await this.customerManagement.findCustomerById({ id: customerId });
    if (!customer) throw new CustomerNotFoundException();
    return customer;
  }
}
```

#### Module
```typescript
import { CustomerManagementModule } from '@/customer-management/infra/customer-management.module';
import CustomerManagementInterface from '@/common/contracts/customer-management.interface';

@Module({
  imports: [CustomerManagementModule],
  providers: [
    {
      provide: MinhaUseCase,
      useFactory: (cm: CustomerManagementInterface) => new MinhaUseCase(cm),
      inject: [CustomerManagementInterface],
    },
  ],
})
export class MeuModule {}
```

### Opção 2: ApplicationService com @Inject() - ACL

**Caso de uso**: Quando você já está na camada de infra e precisa injetar direto. ApplicationService atua como **ACL (Anti-Corruption Layer)** traduzindo dados entre contextos.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import CustomerManagementInterface from '@/common/contracts/customer-management.interface';

@Injectable()
export class CustomerDataACL {
  constructor(
    @Inject(CustomerManagementInterface)
    private readonly customerManagement: CustomerManagementInterface
  ) {}

  /**
   * ACL: Traduz CustomerDTO do customer-management 
   * para formato interno de service-orders
   */
  async obterClienteParaOrdenServico(customerId: string): Promise<ClienteServiceOrder> {
    const customer = await this.customerManagement.findCustomerById({ id: customerId });
    
    if (!customer) {
      throw new CustomerNotFoundException(`Customer ${customerId} not found`);
    }

    // Tradução: DTO externo → Modelo interno
    return {
      id: customer.id,
      nome: customer.name,
      email: customer.email,
      telefone: customer.phone,
    };
  }

  /**
   * ACL: Obtém veículo com proteção contra dados externos inconsistentes
   */
  async obterVeiculoParaOrdenServico(vehicleId: string): Promise<VeiculoServiceOrder> {
    const vehicle = await this.customerManagement.findVehicleById({ id: vehicleId });
    
    if (!vehicle) {
      throw new VehicleNotFoundException(`Vehicle ${vehicleId} not found`);
    }

    // Validações e transformações de contexto
    return {
      id: vehicle.id,
      placa: vehicle.licensePlate.toUpperCase(),
      marca: vehicle.brand,
      modelo: vehicle.model,
      ano: vehicle.year,
    };
  }
}
```

**Benefícios da ACL aqui**:
- Isolamento de mudanças do customer-management
- Tradução de DTOs para modelo interno
- Validações específicas do contexto
- Controle centralizado de acesso cruzado

**Nota**: Esta abordagem acopla a classe a `@Inject()` do NestJS, mas é apropriada para uma ACL. Prefira a **Opção 1** para lógica pura de negócio.

## Métodos

- `findCustomerById({ id: string }): Promise<CustomerDTO | null>`
- `findVehicleById({ id: string }): Promise<VehicleDTO | null>`

Retorna `null` se não encontrado, joga erro apenas em falhas de infraestrutura.
