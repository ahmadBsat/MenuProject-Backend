import rateLimit from "express-rate-limit";

export const rateLimiter = (requests: number, ms: number) => {
  return rateLimit({
    message: "Too many request please try again later",
    windowMs: 1 * 1000 * ms, // Time window in milliseconds
    max: requests, // Max number of requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: true, // Disable the `X-RateLimit-*` headers
  });
};
