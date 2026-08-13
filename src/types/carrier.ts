// Types de transportadoras
export interface Carrier {
  id: string;
  code: string;
  name: string;
  cnpj?: string;
  logo_url?: string;
  api_url?: string;
  services: CarrierService[];
  active: boolean;
}

export interface CarrierService {
  code: string;
  name: string;
  delivery_time_min: number;
  delivery_time_max: number;
  weight_limit?: number;
}

export interface ShippingLabel {
  tracking_number: string;
  carrier: string;
  service: string;
  sender: Address;
  recipient: Address;
  packages: Package[];
  barcode: string;
  label_url?: string;
}

export interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface Package {
  weight: number;
  length: number;
  width: number;
  height: number;
  volume: number;
}

export interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
}
