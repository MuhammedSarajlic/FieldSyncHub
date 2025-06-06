import { TAddProperty } from '../types/Property';
import api from './api';

export async function CreateProperty(property: TAddProperty) {
  const response = await api.post('/property', property);
  return response;
}
