# URGENT FIXES FOR GREENGHOST.IO

## Problem
- Auto-login persists too long (users stay logged in indefinitely)
- Admin portal shows empty waitlist (despite database having entries)

## Solution
Apply these 2 critical fixes to trigger automatic deployment:

---

## Fix 1: server/auth.ts (Enhanced Logout)
**Replace lines 229-239 with:**

```javascript
app.post("/api/logout", (req, res) => {
  const username = req.user?.username;
  req.logout((err: Error | null) => {
    if (err) {
      log('Logout error:', err);
      return res.status(500).json({ error: "Logout failed" });
    }
    
    // Destroy the session completely
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        log('Session destruction error:', destroyErr);
        return res.status(500).json({ error: 'Failed to clear session' });
      }
      
      // Clear the cookie
      res.clearCookie('sid', {
        path: '/',
        secure: isProd,
        httpOnly: true,
        sameSite: 'lax'
      });
      
      log('Logout and session destruction successful for user:', username);
      res.sendStatus(200);
    });
  });
});
```

---

## Fix 2: client/src/pages/admin/AdminPortal.tsx (Waitlist Data Loading)
**Replace lines 646-650 with:**

```javascript
const { data: waitlistEntries, isLoading: waitlistLoading, error: waitlistError } = useQuery<WaitlistEntry[]>({
  queryKey: ["/api/waitlist"],
  queryFn: getQueryFn({ on401: "throw" }),
  enabled: !!user && user.is_admin,
});
```

---

## How to Deploy:
1. Go to your GitHub repository
2. Edit these 2 files directly on GitHub
3. Commit changes
4. Netlify will automatically deploy in 2-3 minutes

## Expected Results:
✅ Sessions expire in 2 hours (no more infinite auto-login)
✅ Admin portal displays Moe Chehaitli's waitlist entry
✅ Logout button properly clears session
✅ Production authentication works correctly