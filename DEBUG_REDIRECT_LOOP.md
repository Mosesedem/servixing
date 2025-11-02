# Debug Guide: Redirect Loop on Dashboard

## What I've Added

I've added detailed console logging throughout the authentication flow to help identify the cause of the `ERR_TOO_MANY_REDIRECTS` error on `http://localhost:3000/dashboard`.

## Files Modified with Logging

### 1. `/lib/auth.ts` - NextAuth Configuration

- **Startup logging**: Checks if NEXTAUTH_SECRET and other env variables are properly set
- **Credentials authorize**: Logs user lookup, password validation
- **JWT callback**: Logs when JWT tokens are created/updated
- **Session callback**: Logs when sessions are created

### 2. `/middleware.ts` - Route Protection

- Logs every request that goes through middleware
- Shows which paths are being accessed
- Shows if token exists and user details
- Logs redirects when authentication fails

### 3. `/app/dashboard/layout.tsx` - Dashboard Layout

- Logs session check at layout level
- Shows if session exists before rendering dashboard

### 4. `/app/dashboard/page.tsx` - Dashboard Page

- Logs session check at page level
- Shows user details if authenticated

### 5. `/app/auth/signin/page.tsx` - Sign In Page

- Logs form submissions
- Shows sign-in results and errors
- Logs Google OAuth attempts

## How to Debug

### Step 1: Clear Your Browser Cache & Cookies

```bash
# In Chrome/Edge
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

# Or manually
1. Settings → Privacy → Clear browsing data
2. Select "Cookies" and "Cached images and files"
3. Clear data
```

### Step 2: Check the Console Logs

1. **Start your development server**:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Open your browser console** (F12 → Console tab)

3. **Also check your terminal** where the dev server is running

4. **Try to access the dashboard**: `http://localhost:3000/dashboard`

### Step 3: Analyze the Log Sequence

You should see logs in this order for a **SUCCESSFUL** flow:

```
=== AUTH CONFIG INITIALIZATION ===
NEXTAUTH_SECRET exists: true
...

=== MIDDLEWARE START ===
Path: /dashboard
Protected route - checking authentication
Token result: { hasToken: true, tokenId: 'xxx', ... }
Authentication successful - allowing access
=== MIDDLEWARE END - Allowing request ===

=== DASHBOARD LAYOUT START ===
Layout: Fetching session...
Layout: Session result: { hasSession: true, user: { email: '...', name: '...' } }
Layout: Session valid - rendering layout

=== DASHBOARD PAGE LOAD START ===
Fetching session...
Session result: { hasSession: true, user: { id: '...', email: '...', ... } }
Session valid - rendering dashboard
```

### Step 4: Common Issues to Look For

#### Issue 1: Missing NEXTAUTH_SECRET

**Look for**:

```
NEXTAUTH_SECRET exists: false
```

**Fix**: Add to `.env.local`:

```bash
NEXTAUTH_SECRET="your-secret-key-here"
```

#### Issue 2: Token Not Found in Middleware

**Look for**:

```
Token result: { hasToken: false }
No token - redirecting to: /auth/signin
```

**Then immediately followed by the same logs again = LOOP!**

**This means**: User is not authenticated, or session is not being saved properly.

#### Issue 3: Session Not Found in Layout/Page

**Look for**:

```
Layout: No session found - redirecting to /auth/signin
```

**Followed by middleware redirecting back**

#### Issue 4: Multiple Rapid Middleware Calls

**Look for**: The same middleware logs repeating rapidly (10+ times)
**This indicates**: A redirect loop is happening

### Step 5: Verify Environment Variables

Check your `.env.local` file has:

```bash
NEXTAUTH_SECRET="a-random-32-character-string-minimum"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="your-database-url"
```

Generate a new NEXTAUTH_SECRET if needed:

```bash
openssl rand -base64 32
```

### Step 6: Test Authentication

1. **Try logging in**: Go to `http://localhost:3000/auth/signin`
2. **Watch the console logs**:

   ```
   === SIGNIN FORM SUBMIT ===
   Email: your@email.com
   Calling signIn with credentials...

   === CREDENTIALS AUTHORIZE ===
   Credentials received: { email: 'your@email.com', hasPassword: true }
   User lookup result: { found: true, userId: 'xxx', hasPassword: true }
   Password validation: true
   Authorization successful for user: xxx

   === JWT CALLBACK ===
   Has user: true
   User data: { id: 'xxx', email: 'your@email.com', role: 'USER' }

   === SESSION CALLBACK ===
   Token data: { id: 'xxx', role: 'USER', email: 'your@email.com' }
   Session after processing: { hasUser: true, userId: 'xxx', ... }

   SignIn result: { ok: true, error: null, status: 200 }
   SignIn successful - redirecting to /dashboard
   ```

## Expected Log Pattern for Redirect Loop

If you have a redirect loop, you'll see:

```
=== MIDDLEWARE START ===
Path: /dashboard
Token result: { hasToken: false }
No token - redirecting to: /auth/signin

=== MIDDLEWARE START ===
Path: /auth/signin
Is public path: true
Public path - allowing access

[Browser somehow redirects back to /dashboard]

=== MIDDLEWARE START ===
Path: /dashboard
Token result: { hasToken: false }
No token - redirecting to: /auth/signin

[REPEAT 10+ times = ERR_TOO_MANY_REDIRECTS]
```

## Next Steps

1. **Capture the logs** from both browser console and terminal
2. **Look for patterns** matching the issues above
3. **Share the logs** if you need help - they will show exactly where the flow breaks
4. **Check for stale cookies**: Sometimes old session cookies cause issues

## Questions to Answer from Logs

1. ✅ Is `NEXTAUTH_SECRET` properly set?
2. ✅ Is the user authenticated (does token exist in middleware)?
3. ✅ Is the session being created properly?
4. ✅ Where does the redirect loop start?
5. ✅ Is there a mismatch between middleware auth and session auth?

## Cleanup

Once you've fixed the issue, you can remove the console.log statements to clean up your logs.
