import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User, USER_ROLES } from '../models/User.js';
import { Warehouse, CAPACITY_UNITS, VERIFICATION_STATUS } from '../models/Warehouse.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { Review } from '../models/Review.js';

const panIndiaWarehouses = [
  {
    title: 'Bhiwandi Grade-A Mega Logistics Park (Mumbai MMR)',
    description: 'Premier 36ft clear height fulfillment depot on the Mumbai-Nashik corridor (NH-160). Built with FM2 laser screed flooring, 20 automatic dock levelers, NFPA sprinkler compliance, and direct connectivity to JNPT Port and Mumbai consumption centres.',
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
    totalCapacity: 85000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 26.00,
    minBookingDays: 7,
    amenities: ['24/7 Security', 'Loading Docks', 'Forklift On-Site', 'Cross-Docking', 'Sprinkler System', 'CCTV 24/7', 'Heavy Floor Load'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Chakan Auto & Industrial Logistics Terminal (Pune)',
    description: 'High-spec industrial warehouse in Chakan Phase-2 MIDC belt catering to automotive OEMs and heavy engineering spares. Equipped with 10-ton overhead EOT cranes, heavy floor load capacity of 8 MT/sqm, and 24/7 security.',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.7606], // Chakan, Pune [lng, lat]
    },
    address: {
      street: 'Plot C-14, Chakan MIDC Industrial Area Phase 2, Talegaon Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '410501',
      country: 'India',
    },
    totalCapacity: 65000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 24.50,
    minBookingDays: 5,
    amenities: ['Overhead Crane', 'Heavy Floor Load', 'Loading Docks', 'Forklift On-Site', 'CCTV 24/7', '24/7 Access'],
    images: [
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Delhi-NCR Mega Distribution Hub Bilaspur (Gurugram)',
    description: 'Flagship multi-temperature logistics center on the Delhi-Jaipur Expressway (NH-48). High-density selective pallet racking, multi-temp cold rooms, 28 hydraulic dock bays, and dedicated fast EV truck charging stations.',
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
    totalCapacity: 95000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 29.00,
    minBookingDays: 5,
    amenities: ['Climate Controlled', 'Cold Storage', 'Forklift On-Site', 'CCTV 24/7', 'EV Truck Charging', 'Loading Docks'],
    images: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Nelamangala Tech & Retail Logistics Center (Bengaluru)',
    description: 'Modern warehousing park located at the junction of NH-48 and NH-75 in Nelamangala. Ideally positioned for quick distribution into Bengaluru city, Mysuru, and Tumakuru. Includes mezzanine storage and automated sorters.',
    location: {
      type: 'Point',
      coordinates: [77.3910, 13.0970], // Nelamangala, Bengaluru [lng, lat]
    },
    address: {
      street: 'Survey No. 42/1, Tumkur Road, Nelamangala Town',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '562123',
      country: 'India',
    },
    totalCapacity: 70000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 31.00,
    minBookingDays: 4,
    amenities: ['24/7 Security', 'Dock Levelers', 'Forklift On-Site', 'Cross-Docking', 'Fire Hydrant & Sprinklers', 'CCTV 24/7'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
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
    totalCapacity: 50000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 30.50,
    minBookingDays: 3,
    amenities: ['Bonded Storage', 'Container Yard', '24/7 Access', 'Heavy Floor Load', 'Loading Docks', 'Forklift On-Site'],
    images: [
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Chennai Port & Auto Corridor Hub (Sriperumbudur)',
    description: 'Grade-A logistics facility on the Chennai-Bengaluru Industrial Corridor (CBIC). Minutes away from Hyundai, Foxconn, and Saint-Gobain plants. Designed for bonded export packaging, container staging, and automotive kitting.',
    location: {
      type: 'Point',
      coordinates: [79.9422, 12.9675], // Sriperumbudur, Tamil Nadu [lng, lat]
    },
    address: {
      street: 'SIPCOT Industrial Park Phase 2, Mambakkam',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '602105',
      country: 'India',
    },
    totalCapacity: 80000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 27.00,
    minBookingDays: 7,
    amenities: ['Container Yard', '24/7 Security', 'Loading Docks', 'Forklift On-Site', 'Customs Bonded Area', 'Sprinklers'],
    images: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Ahmedabad Western Freight Logistics Depot (Changodar)',
    description: 'Sprawling logistics hub positioned on the Ahmedabad-Rajkot Highway with direct access to Mundra & Kandla ports. Features dust-proof industrial flooring, solar-powered rooftop, wide 45m turning radius for multi-axle trailers.',
    location: {
      type: 'Point',
      coordinates: [72.4346, 22.9238], // Changodar, Ahmedabad [lng, lat]
    },
    address: {
      street: 'Sarkhej-Bavla National Highway 8A, Changodar Industrial Estate',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '382213',
      country: 'India',
    },
    totalCapacity: 60000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 23.00,
    minBookingDays: 5,
    amenities: ['Solar Powered', 'Wide Truck Apron', 'Loading Docks', 'Forklift On-Site', 'CCTV 24/7', 'Weighbridge On-Site'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Hyderabad Aerotropolis Temperature-Controlled Hub (Shamshabad)',
    description: 'State-of-the-art cold chain and pharma logistics center adjacent to Rajiv Gandhi International Airport. World-class temperature monitoring (2°C to 8°C and 15°C to 25°C), GDP pharma certified with redundant backup power.',
    location: {
      type: 'Point',
      coordinates: [78.4344, 17.2403], // Shamshabad, Hyderabad [lng, lat]
    },
    address: {
      street: 'GMR Aerospace & Logistics Park, RGIA Cargo Satellite Road',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500108',
      country: 'India',
    },
    totalCapacity: 40000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 35.00,
    minBookingDays: 3,
    amenities: ['Pharma Certified', 'Cold Storage', 'Multi-Temperature Zones', 'Backup Power Generators', '24/7 Temperature Logging'],
    images: [
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Kolkata Eastern Rail-Road Freight Terminal (Dankuni)',
    description: 'The premier transshipment hub for Eastern and North-Eastern India. Situated at the terminus of the Eastern Dedicated Freight Corridor (EDFC) with rail siding connectivity, heavy gantry systems, and bulk commodity handling.',
    location: {
      type: 'Point',
      coordinates: [88.2933, 22.6844], // Dankuni, Kolkata [lng, lat]
    },
    address: {
      street: 'Delhi Road, Dankuni Industrial Complex, Hooghly District',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '712311',
      country: 'India',
    },
    totalCapacity: 75000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 22.50,
    minBookingDays: 7,
    amenities: ['Rail Siding Access', 'Gantry Cranes', 'Bulk Goods Area', 'Heavy Floor Load', 'Loading Docks', '24/7 Security'],
    images: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Greater Noida Integrated Multi-Modal Logistics Center',
    description: 'Modern Class-A facility situated in the Ecotech industrial cluster near Yamuna Expressway. Fast accessibility to the upcoming Jewar International Airport and Eastern Peripheral Expressway for bypass transit.',
    location: {
      type: 'Point',
      coordinates: [77.5040, 28.4744], // Greater Noida [lng, lat]
    },
    address: {
      street: 'Plot 7, Ecotech-XI Industrial Park, Yamuna Expressway Corridor',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      postalCode: '201306',
      country: 'India',
    },
    totalCapacity: 90000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 27.50,
    minBookingDays: 5,
    amenities: ['24/7 Security', 'Hydraulic Docks', 'Forklift On-Site', 'FM2 Laser Screed Floor', 'Sprinkler System', 'EV Charging'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Jaipur Smart Freight Logistics Center (Bagru NH-48)',
    description: 'High-efficiency regional distribution depot along the DMIC expressway. Tailored for handicraft exports, textile storage, and consumer retail fulfillment across Rajasthan, Haryana, and Gujarat.',
    location: {
      type: 'Point',
      coordinates: [75.5456, 26.8122], // Bagru, Jaipur [lng, lat]
    },
    address: {
      street: 'RIICO Industrial Area Phase 1, Bagru, Ajmer Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '303007',
      country: 'India',
    },
    totalCapacity: 55000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 21.00,
    minBookingDays: 5,
    amenities: ['Textile Storage', 'Wide Yard Space', '24/7 Access', 'Loading Docks', 'CCTV 24/7', 'Fire Safety Compliant'],
    images: [
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Central India Distribution Terminal (Indore Pithampur)',
    description: 'Central India transshipment hub at Pithampur Special Economic Zone (SEZ). Strategically serves Madhya Pradesh, Maharashtra, and Chhattisgarh with cross-docking infrastructure and multi-tier pallet racking.',
    location: {
      type: 'Point',
      coordinates: [75.6881, 22.6144], // Pithampur, Indore [lng, lat]
    },
    address: {
      street: 'Sector 3, Pithampur Industrial Area, Dhar District',
      city: 'Indore',
      state: 'Madhya Pradesh',
      postalCode: '454775',
      country: 'India',
    },
    totalCapacity: 60000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 22.00,
    minBookingDays: 4,
    amenities: ['Cross-Docking', 'Multi-Tier Racking', 'Forklift On-Site', 'Heavy Floor Load', '24/7 Security'],
    images: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Cochin Seaport Multi-Modal Logistics Center (Kalamassery)',
    description: 'Maritime and container logistics park connecting to the International Container Transshipment Terminal (ICTT) at Vallarpadam. High humidity control, bonded warehousing, and seafood cold-storage sections.',
    location: {
      type: 'Point',
      coordinates: [76.3264, 10.0537], // Kalamassery, Kochi [lng, lat]
    },
    address: {
      street: 'KINFRA Hi-Tech Park Road, HMT Colony, Kalamassery',
      city: 'Kochi',
      state: 'Kerala',
      postalCode: '683503',
      country: 'India',
    },
    totalCapacity: 45000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 29.50,
    minBookingDays: 3,
    amenities: ['Port Proximity', 'Cold Storage', 'Dehumidified Storage', 'Container Yard', '24/7 Security'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Ludhiana Dry Port & Textile Logistics Depot (Sahnewal)',
    description: 'Northern India agricultural and textile warehousing giant situated next to Sahnewal Dry Port. Specializes in yarn, apparel pallets, auto parts, and seasonal grain storage with moisture protection.',
    location: {
      type: 'Point',
      coordinates: [75.9863, 30.8447], // Sahnewal, Ludhiana [lng, lat]
    },
    address: {
      street: 'GT Road, Near Sahnewal Dry Port, Ludhiana',
      city: 'Ludhiana',
      state: 'Punjab',
      postalCode: '141120',
      country: 'India',
    },
    totalCapacity: 80000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 23.50,
    minBookingDays: 7,
    amenities: ['Dry Port Access', 'Moisture Control', 'Weighbridge On-Site', 'Loading Docks', 'CCTV 24/7'],
    images: [
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Vizag Port Marine & Industrial Logistics Park (Gajuwaka)',
    description: 'Deepwater port logistics station serving the Visakhapatnam Port and Gangavaram Port corridors. Ideal for heavy metals, petrochemical barrels, and international shipping container de-stuffing.',
    location: {
      type: 'Point',
      coordinates: [83.2185, 17.6868], // Gajuwaka, Visakhapatnam [lng, lat]
    },
    address: {
      street: 'Plot 28, Auto Nagar Industrial Area, Gajuwaka',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      postalCode: '530026',
      country: 'India',
    },
    totalCapacity: 65000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 25.00,
    minBookingDays: 5,
    amenities: ['Port Access', 'Heavy Material Storage', 'Container Yard', '24/7 Access', 'Forklift On-Site'],
    images: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Bhubaneswar Coastal Freight Park (Khordha)',
    description: 'East coast distribution terminal positioned on NH-16 connecting Kolkata and Chennai. Caters to FMCG, electronics, and construction supplies for Odisha and neighbouring eastern markets.',
    location: {
      type: 'Point',
      coordinates: [85.6267, 20.1788], // Khordha, Bhubaneswar [lng, lat]
    },
    address: {
      street: 'IDCO Industrial Estate, Khordha, NH-16',
      city: 'Bhubaneswar',
      state: 'Odisha',
      postalCode: '752055',
      country: 'India',
    },
    totalCapacity: 50000,
    capacityUnit: CAPACITY_UNITS.SQFT,
    currency: 'INR',
    pricePerUnitPerDay: 21.50,
    minBookingDays: 4,
    amenities: ['Highway Access', 'Cross-Docking', 'Loading Docks', 'Forklift On-Site', 'CCTV 24/7', '24/7 Security'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

async function runSeed() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed Script] Connected to MongoDB');

    // Find the manager user (prefer palmbee@gmail.com, fallback to manager@example.com)
    let manager = await User.findOne({ email: 'palmbee@gmail.com' });
    if (!manager) {
      manager = await User.findOne({ role: USER_ROLES.MANAGER });
    }

    if (!manager) {
      console.error('No manager user found in database!');
      process.exit(1);
    }

    console.log(`[Seed Script] Assigning all warehouses to Host/Manager: ${manager.name} (${manager.email})`);

    // Remove existing demo warehouses to prevent duplicates and re-populate cleanly
    const deletedCount = await Warehouse.deleteMany({});
    console.log(`[Seed Script] Cleared ${deletedCount.deletedCount} old warehouses.`);

    // Insert all Pan-India warehouses under this single manager
    const warehousesToInsert = panIndiaWarehouses.map((wh) => ({
      ...wh,
      managerId: manager._id,
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      isActive: true,
      averageRating: 0,
      reviewCount: 0,
    }));

    const inserted = await Warehouse.insertMany(warehousesToInsert);
    console.log(`[Seed Script] Successfully seeded ${inserted.length} Pan-India warehouses across 14 states!`);

    // Find or prepare customer accounts
    let customer1 = await User.findOne({ email: 'suraj@gmail.com' });
    let customer2 = await User.findOne({ email: 'customer@example.com' });

    if (!customer2 && !customer1) {
      customer2 = await User.create({
        name: 'OmniRetail Shippers Ltd',
        email: 'customer@example.com',
        password: 'password123',
        role: USER_ROLES.CUSTOMER,
        phone: '+91 98201 12345',
      });
    }

    const primaryCustomer = customer1 || customer2;
    const secondaryCustomer = customer2 || customer1;

    // Sample commercial reviews data
    const sampleReviewsData = [
      {
        overallRating: 5,
        dockSpeedRating: 5,
        securityRating: 5,
        cleanlinessRating: 5,
        hostResponsivenessRating: 5,
        facilityTypeUsed: 'High-Bay Pallet Racking',
        comment: 'Outstanding FM2 laser-screed flooring and super fast 20-minute turnaround for our 40-ft container trailers. 24/7 security gate and weighbridge are very professional.',
      },
      {
        overallRating: 5,
        dockSpeedRating: 4,
        securityRating: 5,
        cleanlinessRating: 5,
        hostResponsivenessRating: 5,
        facilityTypeUsed: 'Industrial Engineering Spares',
        comment: 'Excellent 36ft clear height and overhead crane availability. The host manager was extremely responsive during off-hours check-in.',
      },
      {
        overallRating: 4,
        dockSpeedRating: 4,
        securityRating: 5,
        cleanlinessRating: 4,
        hostResponsivenessRating: 5,
        facilityTypeUsed: 'FMCG Distribution Staging',
        comment: 'Very reliable facility with NFPA sprinkler compliance and high-density racking. Good wide aprons for easy truck turning.',
      },
      {
        overallRating: 5,
        dockSpeedRating: 5,
        securityRating: 5,
        cleanlinessRating: 5,
        hostResponsivenessRating: 4,
        facilityTypeUsed: 'Multi-Temp Cold Logistics',
        comment: 'Temperature integrity was maintained throughout our pharmaceutical staging. Backup generators kicked in seamlessly during grid fluctuation.',
      },
    ];

    // Seed verified bookings and reviews for top warehouses
    console.log('[Seed Script] Seeding verified bookings & commercial ratings...');
    for (let i = 0; i < inserted.length; i++) {
      const wh = inserted[i];
      const numReviews = i < 6 ? 3 : (i % 2 === 0 ? 2 : 1);
      let ratingSum = 0;

      for (let r = 0; r < numReviews; r++) {
        const reviewTemplate = sampleReviewsData[(i + r) % sampleReviewsData.length];
        const reviewer = r % 2 === 0 ? primaryCustomer : secondaryCustomer;

        const bookingStartDate = new Date(Date.now() - (30 + r * 10) * 24 * 60 * 60 * 1000);
        const bookingEndDate = new Date(bookingStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);

        const booking = await Booking.create({
          warehouseId: wh._id,
          customerId: reviewer._id,
          startDate: bookingStartDate,
          endDate: bookingEndDate,
          quantityBooked: 2500,
          currency: wh.currency || 'INR',
          totalAmount: 2500 * (wh.pricePerUnitPerDay || 25) * 14,
          status: BOOKING_STATUS.CONFIRMED,
          paymentStatus: 'DISBURSED',
          paymentId: `pay_seed_${wh._id.toString().substring(0, 6)}_${r}`,
        });

        await Review.create({
          warehouseId: wh._id,
          customerId: reviewer._id,
          bookingId: booking._id,
          overallRating: reviewTemplate.overallRating,
          dockSpeedRating: reviewTemplate.dockSpeedRating,
          securityRating: reviewTemplate.securityRating,
          cleanlinessRating: reviewTemplate.cleanlinessRating,
          hostResponsivenessRating: reviewTemplate.hostResponsivenessRating,
          facilityTypeUsed: reviewTemplate.facilityTypeUsed,
          comment: reviewTemplate.comment,
          verifiedBooking: true,
          createdAt: new Date(bookingEndDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        });

        ratingSum += reviewTemplate.overallRating;
      }

      const avg = Math.round((ratingSum / numReviews) * 10) / 10;
      await Warehouse.findByIdAndUpdate(wh._id, {
        averageRating: avg,
        reviewCount: numReviews,
      });

      console.log(`  ✓ ${wh.title}: ⭐ ${avg} (${numReviews} reviews)`);
    }

    // Also create 1 unreviewed active confirmed booking for primaryCustomer (Suraj Ahire) so they can test reviewing right away!
    if (inserted.length > 0) {
      const testWh = inserted[0];
      const activeStart = new Date();
      const activeEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      await Booking.create({
        warehouseId: testWh._id,
        customerId: primaryCustomer._id,
        startDate: activeStart,
        endDate: activeEnd,
        quantityBooked: 3000,
        currency: testWh.currency || 'INR',
        totalAmount: 3000 * testWh.pricePerUnitPerDay * 10,
        status: BOOKING_STATUS.CONFIRMED,
        paymentStatus: 'HELD_IN_ESCROW',
        paymentId: `pay_ready_to_review_${Date.now()}`,
      });
      console.log(`  ⚡ Created ready-to-review confirmed booking for ${primaryCustomer.name} on ${testWh.title}`);
    }

    await mongoose.disconnect();
    console.log('[Seed Script] All Pan-India Warehouses & Verified Reviews Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Script Error]', err);
    process.exit(1);
  }
}

runSeed();
