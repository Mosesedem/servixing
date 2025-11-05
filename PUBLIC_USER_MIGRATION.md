# Public User to Registered Account Migration

## Overview

This document explains how the system handles cases where users interact with the platform as "public/guest users" and later want to create a registered account with the same email.

## User Journey Scenarios

### Scenario 1: Public User Submits Repair Request

1. User visits the website without creating an account
2. Submits a repair request through the public form (`/api/public/repair-request`)
3. System creates a user record with:
   - Email (provided)
   - Name (provided)
   - Phone (provided)
   - **No password** (NULL)
   - Role: CUSTOMER

### Scenario 2: Public User Later Wants to Register

When a public user (email in system, but no password) tries to register:

#### ✅ What Happens Now (CORRECT BEHAVIOR)

1. User goes to signup page and enters their email
2. System detects email exists but has no password
3. **Account is UPGRADED** (not rejected):
   - Password is set
   - Email is verified
   - Name/phone/address are updated if provided
   - **All previous data is preserved** (work orders, tickets, devices)
4. User gets success message: "Your account has been successfully created! Your previous repair requests and data have been linked to this account."

#### ❌ Old Behavior (FIXED)

- System would throw error: "User with this email already exists"
- User couldn't register
- Data would remain orphaned

## Technical Implementation

### 1. Enhanced Registration Logic (`lib/services/auth.service.ts`)

```typescript
async register(data) {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      password: true,
      deletedAt: true,
      // ... other fields
    },
  });

  // Case 1: Soft-deleted user - restore and update
  if (existingUser && existingUser.deletedAt) {
    // Restore account with new password
    return await db.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        deletedAt: null,
        emailVerified: new Date(),
        // ... update other fields
      },
    });
  }

  // Case 2: Public user without password - upgrade account
  if (existingUser && !existingUser.password) {
    // Upgrade public user to registered account
    return await db.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
        // ... update other fields
      },
    });
  }

  // Case 3: Already has password - they're registered
  if (existingUser && existingUser.password) {
    throw new ConflictError(
      "An account with this email already exists. Please sign in instead."
    );
  }

  // Case 4: New user - create normally
  return await db.user.create({ /* ... */ });
}
```

### 2. Enhanced Sign-in Logic

When a public user tries to sign in:

```typescript
async verifyCredentials(email, password) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user || user.deletedAt) {
    throw new AuthenticationError("Invalid email or password");
  }

  if (!user.password) {
    throw new AuthenticationError(
      "No password set for this account. Please use 'Forgot Password' to set up your account, or register if you haven't already."
    );
  }

  // Verify password...
}
```

### 3. Password Reset for Account Claiming

Public users can also claim their account via "Forgot Password":

```typescript
async requestPasswordReset(email) {
  const user = await db.user.findUnique({
    where: { email },
    select: { password: true, /* ... */ },
  });

  // Flag if this is a public user claiming their account
  const isPublicUser = !user.password;

  return {
    token: pin,
    email: user.email,
    isPublicUser, // Can customize email message
  };
}
```

### 4. Account Status Check API

New endpoint: `POST /api/auth/check-email`

```typescript
// Request
{
  "email": "user@example.com"
}

// Response for public user
{
  "exists": true,
  "isRegistered": false,
  "needsPasswordSetup": true,
  "message": "This email has been used for service requests. You can claim this account by registering or using 'Forgot Password'."
}

// Response for registered user
{
  "exists": true,
  "isRegistered": true,
  "needsPasswordSetup": false,
  "message": "An account with this email already exists. Please sign in."
}

// Response for new email
{
  "exists": false,
  "isRegistered": false,
  "needsPasswordSetup": false,
  "message": "This email is available for registration."
}
```

## Data Preservation

When upgrading from public to registered user, **ALL** existing data is preserved:

✅ **Preserved Data:**

- Work Orders (with all history, status, payments)
- Support Tickets (with all messages and attachments)
- Devices (registered devices)
- Payments (transaction history)
- Notification Logs
- Audit Logs
- Addresses

The user ID remains the same, so all foreign key relationships are maintained.

## Benefits

### For Users

1. **Seamless Experience**: Can submit requests without registration
2. **No Data Loss**: All previous requests appear in their dashboard after registration
3. **Flexible Options**: Can register OR use "Forgot Password" to claim account
4. **Clear Messaging**: Informed about account status during registration

### For Business

1. **Lower Barrier to Entry**: Users can try service without commitment
2. **Data Continuity**: No orphaned records in database
3. **Better UX**: Smooth transition from guest to registered user
4. **Increased Conversions**: Users more likely to register after positive experience

## Security Considerations

### Email Verification

- Setting a password via registration marks email as verified
- Password reset flow also verifies email ownership

### Rate Limiting

- Registration endpoint is rate-limited
- Password reset is rate-limited
- Prevents abuse of account claiming

### Data Access

- Public users can only access their tickets via email links (if implemented)
- Full dashboard access requires password setup
- Admin can see all tickets regardless

## Frontend Integration

### Signup Form Enhancement

```typescript
// When user enters email, check status
const checkEmail = async (email: string) => {
  const response = await fetch("/api/auth/check-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (data.needsPasswordSetup) {
    // Show message: "We found your previous service requests.
    // Continue to claim your account and access your history!"
  } else if (data.isRegistered) {
    // Show message: "This email is already registered.
    // Please sign in instead."
  }
};
```

### Signin Form Enhancement

```typescript
// Catch the specific error for public users
try {
  await signIn("credentials", { email, password });
} catch (error) {
  if (error.message.includes("No password set")) {
    // Show: "This email was used for service requests but has no password.
    // Please register or use 'Forgot Password' to set up your account."
  }
}
```

## Testing Checklist

- [ ] Public user can submit repair request without password
- [ ] Public user can register with same email (account upgraded)
- [ ] Registered user cannot register again (proper error)
- [ ] Public user cannot sign in (helpful error message)
- [ ] Public user can use "Forgot Password" to set password
- [ ] All data preserved after upgrade (work orders, tickets, etc.)
- [ ] Email verification set after upgrade
- [ ] Soft-deleted user can be restored via registration
- [ ] Rate limiting works on registration
- [ ] Account status check returns correct information

## Database Schema Notes

The `User` model supports this flow because:

- `password` field is **nullable** (`String?`)
- `email` is **unique** (prevents duplicates)
- Proper foreign key relationships maintain data integrity
- Soft delete with `deletedAt` allows restoration

## Migration Path

If you have existing public users in the database:

1. **No migration needed** - logic handles existing users automatically
2. Users will naturally upgrade as they register
3. Can send email campaign encouraging registration
4. Can track conversion rate: public → registered users

## Support & Troubleshooting

### User says "Email already exists" but they never registered

- Check if they submitted a repair request without registration
- Advise them to use "Forgot Password" OR continue with registration
- Both paths will work - account will be claimed

### User has multiple accounts

- Should not happen due to email uniqueness constraint
- If reported, admin can manually merge data and soft-delete duplicate

### User wants to change email of public account

- Must wait until after claiming account
- Then can update email in profile settings
- Or admin can update before user claims
