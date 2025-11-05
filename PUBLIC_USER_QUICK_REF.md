# Quick Reference: Public User Account Management

## User States

| State           | Has Email | Has Password | Can Sign In | Can Register | Action                 |
| --------------- | --------- | ------------ | ----------- | ------------ | ---------------------- |
| **New User**    | ❌        | ❌           | ❌          | ✅           | Normal registration    |
| **Public User** | ✅        | ❌           | ❌          | ✅           | Upgrades to registered |
| **Registered**  | ✅        | ✅           | ✅          | ❌           | Show "already exists"  |
| **Deleted**     | ✅        | ✅           | ❌          | ✅           | Restores account       |

## Key API Endpoints

### Check Email Status

```bash
POST /api/auth/check-email
Body: { "email": "user@example.com" }

Response:
{
  "exists": true/false,
  "isRegistered": true/false,
  "needsPasswordSetup": true/false,
  "message": "..."
}
```

### Register (with auto-upgrade)

```bash
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "phone": "+234...",
  "address": "..."
}

Success Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "Your account has been successfully created! Your previous repair requests and data have been linked to this account."
  }
}
```

### Sign In (with helpful errors)

```bash
POST /api/auth/signin
Body: { "email": "user@example.com", "password": "..." }

Error (public user):
{
  "error": "No password set for this account. Please use 'Forgot Password' to set up your account, or register if you haven't already."
}
```

## Code Examples

### Frontend: Email Check on Signup

```typescript
const handleEmailBlur = async (email: string) => {
  const res = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (data.needsPasswordSetup) {
    setHelpText(
      "Great! We found your service requests. Set a password to access your account."
    );
  } else if (data.isRegistered) {
    setError("This email is registered. Please sign in.");
  }
};
```

### Backend: Check Account Status

```typescript
import { authService } from "@/lib/services";

const status = await authService.checkAccountStatus(email);

if (status.isPublicUser) {
  // Send special welcome email mentioning their previous requests
  console.log(`User has ${status.activityCount.workOrders} work orders`);
}
```

## Common Scenarios

### Scenario 1: Guest → Registered

```
User submits repair request (no password)
  ↓
User tries to register with same email
  ↓
✅ Account upgraded (password set, data preserved)
```

### Scenario 2: Registered → Try to Register Again

```
User has account with password
  ↓
User tries to register again
  ↓
❌ Error: "An account with this email already exists. Please sign in instead."
```

### Scenario 3: Public User → Try to Sign In

```
User has email but no password
  ↓
User tries to sign in
  ↓
❌ Error: "No password set. Please register or use Forgot Password."
```

### Scenario 4: Deleted → Restore

```
User account was soft-deleted
  ↓
User tries to register with same email
  ↓
✅ Account restored (deletedAt set to null, password updated)
```

## Database Queries

### Find Public Users

```typescript
const publicUsers = await prisma.user.findMany({
  where: {
    password: null,
    deletedAt: null,
  },
  include: {
    _count: {
      select: {
        workOrders: true,
        supportTickets: true,
      },
    },
  },
});
```

### Convert Public User to Registered

```typescript
const upgradedUser = await prisma.user.update({
  where: { email: "user@example.com" },
  data: {
    password: hashedPassword,
    emailVerified: new Date(),
  },
});
```

## Email Templates

### Registration Confirmation (Upgraded User)

```
Subject: Welcome to Servixing - Your Account is Ready!

Hi [Name],

Great news! Your account has been successfully created.

We noticed you previously used our service for repair requests.
All your previous requests and history have been linked to this account.

You now have access to:
✓ Your repair history and tracking
✓ Saved devices
✓ Payment records
✓ Support tickets

[Log in to your dashboard]

Thank you for choosing Servixing!
```

### Registration Confirmation (New User)

```
Subject: Welcome to Servixing!

Hi [Name],

Your account has been successfully created!

[Get started by booking your first repair]
```

## Testing Commands

```bash
# Test public user creation
curl -X POST http://localhost:3000/api/public/repair-request \
  -F "name=John Doe" \
  -F "email=test@example.com" \
  -F "phone=+2348012345678" \
  -F "deviceType=laptop" \
  -F "brand=Apple" \
  -F "issue=Screen broken"

# Test account upgrade
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Check email status
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Metrics to Track

- **Conversion Rate**: Public users → Registered accounts
- **Time to Convert**: Days between first request and registration
- **Abandoned Accounts**: Public users who never register
- **Data Linkage Success**: Preserved data after upgrade

## Troubleshooting

| Issue                               | Solution                                      |
| ----------------------------------- | --------------------------------------------- |
| User can't register                 | Check if email exists with password already   |
| Public user can't sign in           | They need to register or reset password first |
| Data not showing after registration | Check userId matches across tables            |
| Email "already exists" for new user | Possible rate limiting or validation issue    |
