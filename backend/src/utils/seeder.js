import { User, USER_ROLES } from '../models/User.js';
import { Warehouse, CAPACITY_UNITS, VERIFICATION_STATUS } from '../models/Warehouse.js';

export const seedInitialData = async () => {
  try {
    // Check if Indian warehouses already exist
    const indianWarehouses = await Warehouse.countDocuments({ 'address.country': 'India' });
    if (indianWarehouses > 0) return;

    // Remove legacy US demo warehouses if present
    await Warehouse.deleteMany({ 'address.country': 'US' });

    console.log('[Seeder] Populating Indian logistics hubs & verified facilities...');

    // 1. Create or retrieve sample manager
    let manager = await User.findOne({ email: 'manager@example.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Apex India Logistics Host',
        email: 'manager@example.com',
        password: 'password123',
        role: USER_ROLES.MANAGER,
        phone: '+91 98200 12345',
        isVerified: true,
      });
    }

    // 2. Create or retrieve sample customer
    let customer = await User.findOne({ email: 'customer@example.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Bharat Retail & FMCG Goods',
        email: 'customer@example.com',
        password: 'password123',
        role: USER_ROLES.CUSTOMER,
        phone: '+91 98110 54321',
        isVerified: true,
      });
    }

    // 3. Create or retrieve sample admin
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Super Administrator',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: USER_ROLES.ADMIN,
        phone: '+91 98000 00000',
        isVerified: true,
      });
    }

    // 3. Create prime Indian Logistics Hubs
    await Warehouse.create([
      {
        managerId: manager._id,
        title: 'Bhiwandi Grade-A Logistics Park (Mumbai MMR)',
        description: 'Prime industrial logistics facility situated along the Mumbai-Nashik corridor (NH-160). Features 36ft clear ceiling height, 16 dock doors with automated levelers, heavy-duty laser screed FM2 flooring (6 MT/sqm load), NFPA fire safety compliance, and 24/7 CCTV security. Ideal for e-commerce fulfillment and consumer durables.',
        location: {
          type: 'Point',
          coordinates: [73.0631, 19.2967], // Bhiwandi [lng, lat]
        },
        address: {
          street: 'Plot 45-B, Mumbai-Nashik Expressway, Mankoli Naka',
          city: 'Bhiwandi',
          state: 'Maharashtra',
          postalCode: '421302',
          country: 'India',
        },
        totalCapacity: 45000,
        capacityUnit: CAPACITY_UNITS.SQFT,
        currency: 'INR',
        pricePerUnitPerDay: 25.50,
        minBookingDays: 7,
        amenities: ['24/7 Security', 'Loading Docks', 'Forklift On-Site', 'Cross-Docking', 'Sprinkler System', 'CCTV 24/7', 'Heavy Floor Load'],
        images: [
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
        ],
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        isActive: true,
      },
      {
        managerId: manager._id,
        title: 'Delhi-NCR Mega Distribution Hub Bilaspur',
        description: 'State-of-the-art multi-temperature logistics center on the Delhi-Jaipur Highway (NH-48). Equipped with high-density racking, multi-temperature storage zones, wide truck aprons, 24 dock bays, and dedicated EV truck charging infrastructure.',
        location: {
          type: 'Point',
          coordinates: [76.8837, 28.3242], // Bilaspur, Gurugram [lng, lat]
        },
        address: {
          street: 'Khasra No. 112, Bilaspur-Tauru Road, NH-48',
          city: 'Gurugram',
          state: 'Haryana',
          postalCode: '122413',
          country: 'India',
        },
        totalCapacity: 60000,
        capacityUnit: CAPACITY_UNITS.SQFT,
        currency: 'INR',
        pricePerUnitPerDay: 28.00,
        minBookingDays: 5,
        amenities: ['Climate Controlled', 'Cold Storage', 'Forklift On-Site', 'CCTV 24/7', 'EV Truck Charging', 'Loading Docks'],
        images: [
          'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
        ],
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        isActive: true,
      },
      {
        managerId: manager._id,
        title: 'Hoskote Multi-Modal Industrial Depot (Bengaluru)',
        description: 'Strategic distribution warehouse on Old Madras Road connecting Chennai and Bengaluru industrial belts. Heavy floor load tolerance, container yard, drive-in bay doors, bonded customs section, and on-site office suites.',
        location: {
          type: 'Point',
          coordinates: [77.7981, 13.0712], // Hoskote, Bengaluru [lng, lat]
        },
        address: {
          street: 'SY No. 78, KIADB Industrial Area, Pillagumpa',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '562114',
          country: 'India',
        },
        totalCapacity: 35000,
        capacityUnit: CAPACITY_UNITS.SQFT,
        currency: 'INR',
        pricePerUnitPerDay: 32.00,
        minBookingDays: 3,
        amenities: ['Bonded Storage', 'Container Yard', '24/7 Access', 'Heavy Floor Load', 'Loading Docks', 'Forklift On-Site'],
        images: [
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
        ],
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        isActive: true,
      },
    ]);

    console.log('[Seeder] Indian logistics hubs initialized successfully with INR currency.');
  } catch (err) {
    console.warn(`[Seeder Warning] Indian warehouse seeding: ${err.message}`);
  }
};
