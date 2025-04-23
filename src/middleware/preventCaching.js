export const cacheControlMiddleware = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next(); // Call the next middleware or route handler
};
