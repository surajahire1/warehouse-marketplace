import * as warehouseService from '../services/warehouse.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.createWarehouseListing(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, warehouse, 'Warehouse listing created successfully'));
  } catch (error) {
    next(error);
  }
};

export const searchWarehouses = async (req, res, next) => {
  try {
    const result = await warehouseService.searchWarehouses(req.query);
    res.status(200).json(new ApiResponse(200, result, 'Warehouses fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);
    res.status(200).json(new ApiResponse(200, warehouse, 'Warehouse details retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getMyWarehouses = async (req, res, next) => {
  try {
    const warehouses = await warehouseService.getManagerWarehouses(req.user._id);
    res.status(200).json(new ApiResponse(200, warehouses, 'Manager warehouses retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
