import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dealership.com' },
        update: {},
        create: {
            email: 'admin@dealership.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: Role.ADMIN,
        },
    });

    // 2. Create Regular Customer
    const customerPassword = await bcrypt.hash('user123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'customer@dealership.com' },
        update: {},
        create: {
            email: 'customer@dealership.com',
            password: customerPassword,
            firstName: 'John',
            lastName: 'Doe',
            role: Role.USER,
        },
    });

    // 3. Create Demo Inventory
    const vehicles = [
        {
            make: 'Tesla',
            model: 'Model S Plaid',
            year: 2024,
            category: 'Sedan',
            price: 89990.00,
            quantity: 3,
            imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
            description: 'Tri-Motor all-wheel drive, 1020 hp, 0-60 in 1.99s.',
        },
        {
            make: 'Porsche',
            model: '911 GT3',
            year: 2024,
            category: 'Coupe',
            price: 182900.00,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
            description: 'Naturally aspirated 4.0-liter flat-six engine with 502 hp.',
        },
        {
            make: 'Toyota',
            model: 'RAV4 Hybrid',
            year: 2023,
            category: 'SUV',
            price: 34500.00,
            quantity: 8,
            imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
            description: 'Reliable all-wheel drive SUV with 40 MPG combined efficiency.',
        },
        {
            make: 'Ford',
            model: 'F-150 Lightning',
            year: 2024,
            category: 'Truck',
            price: 59900.00,
            quantity: 0, // Tested out of stock state!
            imageUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
            description: 'All-electric pickup truck with Mega Power Frunk and Pro Power Onboard.',
        },
        {
            make: 'BMW',
            model: 'M4 Competition',
            year: 2024,
            category: 'Coupe',
            price: 84300.00,
            quantity: 2,
            imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
            description: '503 hp twin-turbo inline-six with track-tuned handling.',
        },
    ];

    for (const v of vehicles) {
        await prisma.vehicle.create({ data: v });
    }

    console.log('✅ Seed completed successfully:');
    console.log('   Admin:    admin@dealership.com / admin123');
    console.log('   Customer: customer@dealership.com / user123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
