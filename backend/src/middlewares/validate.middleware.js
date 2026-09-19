import { ApiError } from '../utils/apiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return next(new ApiError(400, 'Validation Error', errorMessages));
    }

    // Attach validated values
    if (parsed.data.body) req.body = parsed.data.body;
    if (parsed.data.query) req.query = parsed.data.query;
    if (parsed.data.params) req.params = parsed.data.params;

    next();
  } catch (err) {
    next(err);
  }
};
