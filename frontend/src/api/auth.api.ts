import api from './axios';
import type { AuthResponse } from '../types';


export const authApi = {
    register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
        api.post('/auth/register', data).then((r) => r.data),

    login: (data: { email: string; password: string }): Promise<AuthResponse> =>
        api.post('/auth/login', data).then((r) => r.data),
};
