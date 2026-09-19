import { Warehouse, VERIFICATION_STATUS } from '../models/Warehouse.js';
import { ApiError } from '../utils/apiError.js';

export const createWarehouseListing = async (managerId, data) => {
  const {
    title,
    description,
    latitude,
    longitude,
    address,
    totalCapacity,
    capacityUnit,
    pricePerUnitPerDay,
    minBookingDays,
    amenities,
    images,
  } = data;

  const warehouse = await Warehouse.create({
    managerId,
    title,
    description,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude], // Longitude first in GeoJSON
    },
    address,
    totalCapacity,
    capacityUnit,
    pricePerUnitPerDay,
    minBookingDays,
    amenities: amenities || [],
    images: images || [],
    verificationStatus: VERIFICATION_STATUS.PENDING,
    isActive: true,
  });

  return warehouse;
};

export const searchWarehouses = async (queryFilters) => {
  const {
    longitude,
    latitude,
    radiusKm = 50,
    city,
    minCapacity,
    maxPrice,
    capacityUnit,
    page = 1,
    limit = 20,
  } = queryFilters;

  const filter = {
    isActive: true,
    verificationStatus: VERIFICATION_STATUS.APPROVED,
  };

  // Geospatial proximity query
  if (longitude !== undefined && latitude !== undefined) {
    filter.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: radiusKm * 1000, // convert km to meters
      },
    };
  }

  // City search
  if (city) {
    filter['address.city'] = new RegExp(city, 'i');
  }

  // Capacity filter
  if (minCapacity) {
    filter.totalCapacity = { $gte: parseFloat(minCapacity) };
  }

  // Price filter
  if (maxPrice) {
    filter.pricePerUnitPerDay = { $lte: parseFloat(maxPrice) };
  }

  if (capacityUnit) {
    filter.capacityUnit = capacityUnit;
  }

  const skip = (page - 1) * limit;

  const [warehouses, total] = await Promise.all([
    Warehouse.find(filter).skip(skip).limit(limit).populate('managerId', 'name email phone'),
    Warehouse.countDocuments(filter),
  ]);

  return {
    warehouses,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getWarehouseById = async (id) => {
  const warehouse = await Warehouse.findById(id).populate('managerId', 'name email phone');
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse not found');
  }
  return warehouse;
};

export const getManagerWarehouses = async (managerId) => {
  return Warehouse.find({ managerId }).sort({ createdAt: -1 });
};
