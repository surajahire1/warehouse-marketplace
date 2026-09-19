import { User, USER_ROLES } from '../models/User.js';
import { Warehouse, CAPACITY_UNITS, VERIFICATION_STATUS } from '../models/Warehouse.js';

export const seedInitialData = async () => {
  try {
    const warehouseCount = await Warehouse.countDocuments();
    if (warehouseCount > 0) return; // Data already exists

    console.log('[Seeder] Populating sample users and approved warehouses for local preview...');

    // 1. Create a sample manager
    let manager = await User.findOne({ email: 'manager@example.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Apex Logistics Host',
        email: 'manager@example.com',
        password: 'password123',
        role: USER_ROLES.MANAGER,
        phone: '+1 555-0199',
        isVerified: true,
      });
    }

    // 2. Create a sample customer
    let customer = await User.findOne({ email: 'customer@example.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Retail Goods Co.',
        email: 'customer@example.com',
        password: 'password123',
        role: USER_ROLES.CUSTOMER,
        phone: '+1 555-0144',
        isVerified: true,
      });
    }

    // 3. Create sample approved warehouses
    await Warehouse.create([
      {
        managerId: manager._id,
        title: 'Midwest Mega Hub Logistics Center',
        description: 'Class-A high-cube fulfillment center near major interstate interchange. Equipped with 24 dock doors, dedicated forklift fleet, 32ft clear ceiling heights, and 24/7 surveillance.',
        location: {
          type: 'Point',
          coordinates: [-87.6298, 41.8781], // Chicago, IL [lng, lat]
        },
        address: {
          street: '4200 S Pulaski Rd',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60632',
          country: 'US',
        },
        totalCapacity: 45000,
        capacityUnit: CAPACITY_UNITS.SQFT,
        pricePerUnitPerDay: 0.85,
        minBookingDays: 2,
        amenities: ['24/7 Security', 'Loading Docks', 'Forklift On-Site', 'Cross-Docking', 'Sprinkler System'],
        images: [
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
        ],
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        isActive: true,
      },
      {
        managerId: manager._id,
        title: 'DFW Metroplex Cold & Dry Depot',
        description: 'Modern multi-temperature industrial warehouse located minutes from DFW airport. Features temperature-controlled zones, high-density pallet racking, and security perimeter fencing.',
        location: {
          type: 'Point',
          coordinates: [-96.7970, 32.7767], // Dallas, TX [lng, lat]
        },
        address: {
          street: '1800 N Stemmons Fwy',
          city: 'Dallas',
          state: 'TX',
          postalCode: '75207',
          country: 'US',
        },
        totalCapacity: 20000,
        capacityUnit: CAPACITY_UNITS.SQFT,
        pricePerUnitPerDay: 1.15,
        minBookingDays: 3,
        amenities: ['Climate Controlled', 'Cold Storage', 'Forklift On-Site', 'CCTV 24/7', 'EV Truck Charging'],
        images: [
          'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
        ],
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        isActive: true,
      },
      {
        managerId: manager._id,
        title: 'Port Gateway Storage & Transload',
        description: 'Strategic distribution warehouse near maritime container terminal. Heavy floor load capacity, ramp drive-in doors, bonded warehouse area, and on-site container staging.',
        location: {
          type: 'Point',
          coordinates: [-74.1724, 40.7357], // Newark, NJ [lng, lat]
        },
        address: {
          street: '150 Doremus Ave',
          city: 'Newark',
          state: 'NJ',
          postalCode: '07105',
          country: 'US',
        },
        totalCapacity: 30000,
        capacityUnit: CAPACITY_UNITS.SQFT,
        pricePerUnitPerDay: 0.95,
        minBookingDays: 1,
        amenities: ['Bonded Storage', 'Container Yard', '24/7 Access', 'Heavy Floor Load', 'Rail Access'],
        images: [
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
        ],
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        isActive: true,
      },
    ]);

    console.log('[Seeder] Sample warehouses and demo accounts initialized successfully.');
    console.log('         Demo Customer: customer@example.com / password123');
    console.log('         Demo Host:     manager@example.com / password123');
  } catch (err) {
    console.warn(`[Seeder Warning] Seeding failed: ${err.message}`);
  }
};
