import { z } from 'zod';

export const shipmentAddressSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  street: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório').max(2),
  zipCode: z.string().min(8, 'CEP inválido').max(9),
  country: z.string().default('BR'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
});

export const shipmentFormSchema = z.object({
  orderId: z.string().min(1, 'Pedido é obrigatório'),
  orderNumber: z.string().min(1, 'Número do pedido é obrigatório'),
  packingId: z.string().optional(),
  carrierId: z.string().min(1, 'Transportadora é obrigatória'),
  carrierName: z.string().optional(),
  serviceType: z.string().min(1, 'Tipo de serviço é obrigatório'),
  shippingAddress: shipmentAddressSchema,
  billingAddress: shipmentAddressSchema.optional(),
  packages: z.array(z.object({
    packageNumber: z.string(),
    weight: z.number().min(0),
    trackingNumber: z.string().optional(),
  })).min(1),
  totalWeight: z.number().min(0),
  shippingCost: z.number().min(0).optional(),
  insuranceValue: z.number().min(0).optional(),
  declaredValue: z.number().min(0).optional(),
  specialInstructions: z.string().optional(),
  scheduledDate: z.string().optional(),
  status: z.enum(['pending', 'label_created', 'picked_up', 'in_transit', 'delivered', 'returned']).default('pending'),
});

export type ShipmentAddress = z.infer<typeof shipmentAddressSchema>;
export type ShipmentFormData = z.infer<typeof shipmentFormSchema>;
