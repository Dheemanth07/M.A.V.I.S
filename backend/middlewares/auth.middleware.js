/**
 * @file Middleware to extract user identity and role from headers and enforce RBAC permissions.
 */

export const extractUser = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.headers['user-id'];
    const userRole = req.headers['x-user-role'] || req.headers['user-role'] || 'user';

    if (userId) {
        req.user = {
            id: userId,
            role: userRole
        };
    } else {
        req.user = {
            id: 'guest',
            role: userRole
        };
    }
    next();
};

/**
 * Restricts route access to specified allowed roles.
 *
 * @param  {...string} allowedRoles - Roles allowed to access the route.
 * @returns {import("express").RequestHandler} Express middleware handler.
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const role = req.user?.role || req.headers['x-user-role'] || req.headers['user-role'] || 'user';
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                status: 'fail',
                message: `Access denied. Administrative privilege (${allowedRoles.join(' or ')}) required for this operation.`
            });
        }
        next();
    };
};
