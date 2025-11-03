# Device Management Testing Guide

## Overview

This document provides comprehensive testing instructions for the Stage 3 Device Management module of the Servixing Repair Shop Management System.

## Test Environment

- **Base URL**: http://localhost:3000
- **Test User Credentials**:
  - Admin: `admin@servixing.com` / `Admin@123456`
  - Regular User: `user@example.com` / `User@123456`

## Features Completed

### 1. Device API Routes ✅

- **GET `/api/devices`** - List devices with pagination, search, and filters
- **POST `/api/devices`** - Create a new device
- **GET `/api/devices/[id]`** - Get device details
- **PUT `/api/devices/[id]`** - Update device
- **DELETE `/api/devices/[id]`** - Delete device (with work order validation)
- **POST `/api/devices/upload`** - Upload device images to Cloudinary

### 2. Device Service Layer ✅

- Complete CRUD operations with Prisma
- Image management with Cloudinary integration
- Ownership validation
- Work order relationship checks before deletion

### 3. Device Registration UI ✅

- Multi-step form with validation
- Image upload with drag-and-drop
- Device type and brand selection
- Serial number and IMEI tracking
- Real-time validation with Zod

### 4. Device List Page ✅

- Grid view with device cards
- Search functionality
- Filter by device type and brand
- Pagination
- Image thumbnails
- Quick delete action

### 5. Device Detail Page ✅

- Image gallery with thumbnails
- Full device information display
- Edit mode with inline editing
- Add more images in edit mode
- Delete confirmation
- Work order history (future enhancement)

### 6. Image Upload Component ✅

- Drag-and-drop support
- Multi-file upload (max 10 images)
- File size validation (max 5MB per image)
- Image preview with thumbnails
- Remove individual images
- Progress indicators

## Test Scenarios

### Scenario 1: Register a New Device

**Objective**: Test complete device registration flow with image upload

**Steps**:

1. Navigate to `/dashboard/devices`
2. Click "Register Device" button
3. Fill in the form:
   - Device Type: Select "Smartphone"
   - Brand: Select "Apple"
   - Model: Enter "iPhone 15 Pro"
   - Color: Enter "Space Black"
   - Serial Number: Enter "F2LXXX123ABC"
   - IMEI: Enter "123456789012345"
   - Description: Enter device details
4. Upload 2-3 device images using drag-and-drop or file picker
5. Click "Register Device"

**Expected Results**:

- Form validates all required fields
- Images preview correctly before upload
- Images upload to Cloudinary successfully
- Device is created in the database
- User is redirected to device detail page
- All information displays correctly

**API Endpoints Tested**:

- `POST /api/devices/upload`
- `POST /api/devices`

---

### Scenario 2: Search and Filter Devices

**Objective**: Test search and filter functionality

**Steps**:

1. Navigate to `/dashboard/devices`
2. Test search:
   - Enter "iPhone" in search box
   - Verify results update in real-time
3. Test device type filter:
   - Select "Smartphone" from dropdown
   - Verify only smartphones display
4. Test brand filter:
   - Select "Apple" from dropdown
   - Verify only Apple devices display
5. Test combined filters:
   - Search "15", select "Smartphone", select "Apple"
   - Verify results are correctly filtered
6. Click "Clear all" to reset filters

**Expected Results**:

- Search works for brand and model fields
- Filters work independently and in combination
- Active filters display as badges
- "Clear all" resets all filters
- Pagination resets to page 1 on filter change

**API Endpoints Tested**:

- `GET /api/devices?search=...&deviceType=...&brand=...`

---

### Scenario 3: View Device Details

**Objective**: Test device detail page and image gallery

**Steps**:

1. Navigate to `/dashboard/devices`
2. Click "View" on any device card
3. Verify device detail page displays:
   - All device information
   - Image gallery with thumbnails
   - Navigation arrows between images
   - Image counter (1/3, 2/3, etc.)
4. Click thumbnail images to jump to specific image
5. Click arrow buttons to navigate through images

**Expected Results**:

- All device fields display correctly
- Images load from Cloudinary
- Gallery navigation works smoothly
- Thumbnails highlight current image
- Dates format correctly
- Missing fields show "Not specified"

**API Endpoints Tested**:

- `GET /api/devices/[id]`

---

### Scenario 4: Edit Device

**Objective**: Test device update functionality

**Steps**:

1. Navigate to device detail page
2. Click "Edit" button
3. Update the following fields:
   - Change model name
   - Update color
   - Add/modify description
   - Upload 1-2 additional images
4. Click "Save"

**Expected Results**:

- Form enters edit mode
- All fields become editable
- New images can be added
- Validation works on save
- New images upload to Cloudinary
- Existing images are preserved
- Device updates successfully
- Page exits edit mode and displays updated data

**API Endpoints Tested**:

- `POST /api/devices/upload`
- `PUT /api/devices/[id]`

---

### Scenario 5: Delete Device

**Objective**: Test device deletion with validation

**Steps**:

1. **Test 1: Delete device without work orders**
   - Navigate to device detail page for a device with no work orders
   - Click "Delete" button
   - Confirm deletion in dialog
2. **Test 2: Attempt to delete device with work orders**
   - Navigate to device detail page for a device with active work orders
   - Click "Delete" button
   - Confirm deletion in dialog

**Expected Results**:

**Test 1**:

- Confirmation dialog appears
- Device deletes successfully
- User redirects to device list
- Device no longer appears in list

**Test 2**:

- Confirmation dialog appears
- API returns error: "Cannot delete device with existing work orders"
- Error message displays to user
- Device remains in database

**API Endpoints Tested**:

- `DELETE /api/devices/[id]`

---

### Scenario 6: Image Upload Validation

**Objective**: Test image upload constraints and validation

**Steps**:

1. Navigate to device registration page
2. **Test file type validation**:
   - Attempt to upload a PDF file
   - Verify error message displays
3. **Test file size validation**:
   - Attempt to upload an image > 5MB
   - Verify error message displays
4. **Test max files limit**:
   - Attempt to upload 11 images
   - Verify error message displays
5. **Test remove image**:
   - Upload 3 images
   - Click X button on second image
   - Verify image is removed
   - Verify remaining images stay intact

**Expected Results**:

- Non-image files are rejected
- Large files (>5MB) are rejected
- More than 10 images are rejected
- Error messages are clear and helpful
- Remove functionality works correctly
- File counter updates accurately

---

### Scenario 7: Pagination

**Objective**: Test pagination with large datasets

**Steps**:

1. Ensure database has more than 10 devices (seed or create manually)
2. Navigate to `/dashboard/devices`
3. Verify first page shows 10 devices
4. Click "Next" button
5. Verify page 2 loads with next set of devices
6. Click "Previous" button
7. Verify page 1 reloads
8. Navigate to last page
9. Verify "Next" button is disabled

**Expected Results**:

- Pagination shows correct page numbers
- Each page shows 10 devices
- Previous/Next buttons enable/disable correctly
- URL updates with page number
- Filters persist across pages

**API Endpoints Tested**:

- `GET /api/devices?page=X&limit=10`

---

### Scenario 8: Authorization & Ownership

**Objective**: Test user can only manage their own devices

**Steps**:

1. Sign in as User A
2. Create a device
3. Sign out
4. Sign in as User B
5. Navigate to `/api/devices`
6. Verify User A's device does not appear in list
7. Attempt to access `/dashboard/devices/[User A's device ID]`

**Expected Results**:

- Users only see their own devices
- Attempting to access another user's device returns 404 or 403
- API enforces ownership validation
- Admin users can see all devices (if implemented)

---

## Edge Cases to Test

### 1. Empty States

- [ ] No devices registered
- [ ] No search results
- [ ] No images uploaded
- [ ] Empty description

### 2. Long Content

- [ ] Very long device model name
- [ ] Very long description (near 1000 character limit)
- [ ] Many images (10 images)

### 3. Special Characters

- [ ] Serial numbers with hyphens and slashes
- [ ] Model names with special characters
- [ ] Search with special characters

### 4. Network Issues

- [ ] Slow Cloudinary upload
- [ ] Failed API requests
- [ ] Timeout scenarios

### 5. Concurrent Operations

- [ ] Editing device in two tabs
- [ ] Deleting while editing
- [ ] Uploading same device twice

---

## Known Limitations

1. **Image Deletion**: Deleting a device does not remove images from Cloudinary (requires cleanup job)
2. **Work Order History**: Not yet displayed on device detail page (Stage 4 feature)
3. **Image Optimization**: Images are not automatically resized/compressed client-side
4. **Offline Support**: No offline caching or service worker
5. **Export**: No CSV/PDF export functionality yet

---

## Performance Benchmarks

- Device list page load: < 2 seconds
- Device detail page load: < 1 second
- Image upload (5 images): < 5 seconds (depends on internet speed)
- Search/filter response: < 500ms
- Device creation: < 3 seconds (including image upload)

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Form labels are properly associated
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Error messages are announced to screen readers
- [ ] Loading states have aria-live regions

---

## Browser Compatibility

Tested on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Next Steps (Stage 4)

After completing device management testing:

1. **Work Order Management**

   - Create work orders for devices
   - Display work order history on device detail page
   - Link devices to work orders

2. **Technician Assignment**

   - Assign technicians to work orders
   - Track work order status

3. **Parts & Inventory**
   - Link parts to work orders
   - Track part usage

---

## Reporting Issues

If you encounter any issues during testing:

1. Note the exact steps to reproduce
2. Include browser and OS information
3. Capture console errors (F12 → Console)
4. Take screenshots if applicable
5. Check network tab for failed requests
6. Document expected vs actual behavior

---

## Testing Completion Checklist

- [ ] All 8 scenarios tested and passing
- [ ] Edge cases verified
- [ ] Performance benchmarks met
- [ ] No console errors or warnings
- [ ] All API endpoints returning correct data
- [ ] Images uploading and displaying correctly
- [ ] Pagination working across all filters
- [ ] Authorization working correctly
- [ ] Mobile responsive design verified
- [ ] Accessibility requirements met

---

## Summary

Stage 3 Device Management is **COMPLETE** with the following deliverables:

✅ **8 Device Management Tasks**

1. Device API Routes (GET, POST, PUT, DELETE, Upload)
2. Device Service Layer with Cloudinary
3. Device Registration UI with multi-image upload
4. Device List Page with search/filter/pagination
5. Device Detail Page with image gallery
6. Reusable Image Upload Component
7. Zod Validation Schemas
8. Comprehensive Testing Documentation

**Ready to proceed to Stage 4: Work Order Management** 🚀
