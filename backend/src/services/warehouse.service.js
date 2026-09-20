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
    currency = 'INR',
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
    currency,
    pricePerUnitPerDay,
    minBookingDays,
    amenities: amenities || [],
    images: images || [],
    verificationStatus: VERIFICATION_STATUS.PENDING,
    isActive: true,
  });

  return warehouse;
};

const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const searchWarehouses = async (queryFilters) => {
  const {
    longitude,
    latitude,
    radiusKm,
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

  const hasCoordinates =
    longitude !== undefined &&
    latitude !== undefined &&
    !isNaN(parseFloat(longitude)) &&
    !isNaN(parseFloat(latitude));

  // Geospatial proximity query
  if (hasCoordinates) {
    const maxDist = radiusKm ? parseFloat(radiusKm) * 1000 : 500 * 1000; // default 500km radius
    filter.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: maxDist,
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

  // Prepare count filter (countDocuments requires $geoWithin instead of $nearSphere)
  const countFilter = { ...filter };
  if (hasCoordinates) {
    const radiusInRadians = (radiusKm ? parseFloat(radiusKm) : 500) / 6371; // Earth radius in km
    countFilter.location = {
      $geoWithin: {
        $centerSphere: [
          [parseFloat(longitude), parseFloat(latitude)],
          radiusInRadians,
        ],
      },
    };
  }

  const skip = (page - 1) * limit;

  const [warehouses, total] = await Promise.all([
    Warehouse.find(filter).skip(skip).limit(limit).populate('managerId', 'name email phone'),
    Warehouse.countDocuments(countFilter),
  ]);

  const userLat = hasCoordinates ? parseFloat(latitude) : null;
  const userLng = hasCoordinates ? parseFloat(longitude) : null;

  const enrichedWarehouses = warehouses.map((w) => {
    const doc = w.toObject();
    if (userLat !== null && userLng !== null && doc.location?.coordinates?.length === 2) {
      const wLng = doc.location.coordinates[0];
      const wLat = doc.location.coordinates[1];
      doc.distanceKm = calculateHaversineKm(userLat, userLng, wLat, wLng);
    }
    return doc;
  });

  return {
    warehouses: enrichedWarehouses,
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

export const updateWarehouseListing = async (warehouseId, managerId, userRole, updateData) => {
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse not found');
  }

  // Authorization check: Only the manager who owns the warehouse or an admin can edit it
  if (userRole !== 'ADMIN' && warehouse.managerId.toString() !== managerId.toString()) {
    throw new ApiError(403, 'You are not authorized to edit this warehouse listing');
  }

  if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
    warehouse.location = {
      type: 'Point',
      coordinates: [updateData.longitude, updateData.latitude],
    };
  }

  const allowedFields = [
    'title',
    'description',
    'address',
    'totalCapacity',
    'capacityUnit',
    'currency',
    'pricePerUnitPerDay',
    'minBookingDays',
    'amenities',
    'images',
    'isActive',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      warehouse[field] = updateData[field];
    }
  });

  await warehouse.save();
  return warehouse;
};
