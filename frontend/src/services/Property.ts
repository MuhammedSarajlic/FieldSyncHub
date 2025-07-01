import { TAddProperty, TUpdateProperty } from '../types/Property';
import api from './api';

export async function CreateProperty(property: TAddProperty) {
  const response = await api.post('/property', property);
  return response;
}

export async function UpdateProperty(property: TUpdateProperty) {
  const response = await api.put('/property', property);
  return response;
}
