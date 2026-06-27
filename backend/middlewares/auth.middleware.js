/**
 * @file Middleware to extract user identity and role from headers.
 */
export const extractUser = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.headers['user-id'];
    const userRole = req.headers['x-user-role'] || req.headers['user-role'] || 'user';

    if (userId) {
        req.user = {
            id: userId,
            role: userRole
        };
    }
    next();
};
