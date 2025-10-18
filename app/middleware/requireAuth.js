// Middleware to protect routes: redirects to /login if not authenticated

export function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        if ("/logout" === req.path) {
            return next(); // allow logout
        }
        // If user is authenticated but has no callsign, redirect to /who-are-you
        if (req.user && !req.user.callsign && req.path !== '/who-are-you') {
            return res.redirect('/who-are-you');
        }
        // If user has callsign but not approved, redirect to /wait-for-approve
        if (req.user && req.user.callsign && req.user.approved === false && req.path !== '/wait-for-approve') {
            return res.redirect('/wait-for-approve');
        }
        // If user is banned, redirect to /banned
        if (req.user && req.user.banned === true && req.path !== '/banned') {
            return res.redirect('/banned');
        }
        return next();
    } else {
        const openPaths = ['/login', '/login/federated/google', '/oauth2/redirect/google'];
        if (openPaths.includes(req.path)) {
            return next();
        }
    }
    return res.redirect('/login');
}
