import rateLimit from "express-rate-limit";

// Default rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Custom rate limiter for specific routes
interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const customApiLimiter = (options: RateLimitOptions) =>
  rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // default 15 minutes
    max: options.max || 100, // default 100 requests per windowMs
    message:
      options.message ||
      "Too many requests from this IP, please try again later",
  });
