export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN';
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    category: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface SearchFilters {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}
