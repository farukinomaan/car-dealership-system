import api from './axios';
import type { Vehicle, SearchFilters } from '../types';

export const vehiclesApi = {
    getAll: (): Promise<Vehicle[]> =>
        api.get('/vehicles').then((r) => r.data),

    search: (filters: SearchFilters): Promise<Vehicle[]> =>
        api.get('/vehicles/search', { params: filters }).then((r) => r.data),

    create: (data: Partial<Vehicle>): Promise<Vehicle> =>
        api.post('/vehicles', data).then((r) => r.data),

    update: (id: string, data: Partial<Vehicle>): Promise<Vehicle> =>
        api.put(`/vehicles/${id}`, data).then((r) => r.data),

    delete: (id: string): Promise<void> =>
        api.delete(`/vehicles/${id}`).then((r) => r.data),

    reserve: (id: string) =>
        api.post(`/vehicles/${id}/reserve`).then((r) => r.data),

    release: (id: string) =>
        api.post(`/vehicles/${id}/release`).then((r) => r.data),

    purchase: (id: string, quantity: number = 1) =>
        api.post(`/vehicles/${id}/purchase`, { quantity }).then((r) => r.data),

    restock: (id: string, quantity: number) =>
        api.post(`/vehicles/${id}/restock`, { quantity }).then((r) => r.data),
};
