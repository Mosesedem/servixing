# Warranty & Device Status Check Service Guide

## 🎯 Overview

The Warranty & Device Status Check service is a **paid premium service** that allows users to check:

- ✅ Warranty status for Apple and Dell devices
- ✅ Warranty expiry dates
- ✅ Device blacklist status (IMEI check)
- ✅ Real-time verification

**Service Fee:** ₦100 per check

---

## 🚀 How to Access the Service

### Option 1: From Services Page

1. Navigate to **Services** page: `https://yourdomain.com/services`
2. Scroll down to the "Specialized Services" section
3. Click on **"Warranty & Device Status Check"** card
4. Or click **"Check Device"** button directly

### Option 2: From Dashboard Devices

1. Login to your account
2. Go to **Dashboard** → **Devices**
3. Click the **"Check Warranty"** button at the top of the page
4. You'll be redirected to the warranty check service

### Option 3: Direct URL

Simply navigate to:

```
https://yourdomain.com/services/warranty-device-check
```

---

## 📋 How to Use the Service

### Step 1: Login Required

- You must be logged in to use this service
- If not logged in, you'll be redirected to the sign-in page

### Step 2: Fill Out the Form

The form requires the following information:

#### Required Fields:

- **Device Brand** (Dropdown)

  - Apple (for iPhones, iPads, Macs)
  - Dell (for laptops and desktops)

- **Serial Number** (Text Input)
  - Find it in device Settings or on the device label
  - Example for Apple: C02XXXXXXFVH5
  - Example for Dell: 1A2B3C4

#### Optional Field:

- **IMEI** (Text Input)
  - Required only for mobile devices to check blacklist status
  - Find it by dialing `*#06#` on your phone
  - Example: 123456789012345

### Step 3: Payment

1. Click **"Pay ₦100 & Check Device"** button
2. You'll be redirected to Paystack secure payment page
3. Complete the payment using:
   - Debit/Credit Card
   - Bank Transfer
   - USSD
   - Or any other Paystack-supported method

### Step 4: View Results

After successful payment, you'll be automatically redirected back with results showing:

#### Warranty Information:

- ✅ **Status:** Active, Expired, or Requires Verification
- 📅 **Expiry Date:** When warranty ends (if applicable)
- 🏢 **Provider:** Apple or Dell

#### Device Status (if IMEI provided):

- ✅ **Clean:** Device is not blacklisted
- ⚠️ **Blacklisted:** Device is reported stolen/lost

---

## 🎨 Page Design Features

The service page includes:

### Header Section

- Clear title and description
- Service fee prominently displayed
- Back navigation to Services page

### Information Cards

Two helpful cards explaining:

1. **What We Check**

   - Warranty status & expiry
   - Device blacklist status
   - IMEI validation
   - Coverage details

2. **Supported Brands**
   - Apple (iPhone, iPad, Mac)
   - Dell (Laptops, Desktops)
   - More brands coming soon

### Form Section

- Clean, user-friendly form
- Helpful placeholder text
- Field validation
- Clear error messages

### Trust Indicators

At the bottom:

- ✅ Secure Payment
- 🛡️ Real-time Results
- ℹ️ Instant Report

---

## 🔌 API Integration

The service uses real-time APIs:

### For Apple Devices:

- **WarrantyAPI.com** for warranty status
- Checks serial number against Apple database
- Returns warranty status and expiry date

### For Dell Devices:

- **Dell Support API** for warranty information
- Validates service tag (serial number)
- Returns warranty coverage details

### For Device Status:

- **GSMA IMEI API** for blacklist check
- Verifies if device is reported stolen
- Returns "clean" or "blacklisted" status

---

## 💳 Payment Flow

1. **Initialization:**

   - User submits form
   - System creates payment record
   - Paystack payment link generated

2. **Payment:**

   - User redirected to Paystack
   - Completes payment securely
   - Paystack processes transaction

3. **Verification:**

   - User redirected back to site
   - System verifies payment status
   - If successful, performs device check

4. **Results:**
   - Results displayed immediately
   - Stored in payment metadata
   - User can view anytime

---

## 🔐 Security Features

- ✅ **Authentication Required:** Must be logged in
- ✅ **Secure Payment:** Paystack PCI-compliant gateway
- ✅ **Data Privacy:** Information not shared with third parties
- ✅ **API Security:** Encrypted API calls
- ✅ **Session Protection:** CSRF protection enabled

---

## 📱 Mobile Responsive

The page is fully optimized for:

- 📱 Mobile phones (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)

---

## 🎯 Use Cases

### For Buyers:

- Verify warranty before purchasing a used device
- Check if device is blacklisted/stolen
- Confirm warranty coverage

### For Repair Shops:

- Quick warranty verification for customer devices
- Check if device qualifies for warranty repair
- Validate device authenticity

### For Personal Use:

- Check your own device warranty status
- Verify IMEI before selling
- Plan for warranty expiration

---

## ⚙️ Environment Setup

To enable the service, add these to your `.env` file:

```env
# Warranty Check APIs (Optional - service works without but with limited features)
WARRANTY_API_KEY=your_warranty_api_key_here
GSMA_API_KEY=your_gsma_api_key_here

# Apple Warranty API (Optional)
APPLE_API_KEY=your_apple_api_key_here
APPLE_API_SECRET=your_apple_api_secret_here

# Dell Warranty API (Optional)
DELL_API_KEY=your_dell_api_key_here
```

**Note:** Without API keys, the service will return "requires_verification" status, but the payment and form flow will still work.

---

## 🐛 Troubleshooting

### Payment Not Processing?

- Check your internet connection
- Ensure Paystack keys are correct in `.env`
- Verify account balance in Paystack dashboard

### Results Not Showing?

- Confirm payment was successful
- Check if serial number format is correct
- Verify API keys are configured

### "Requires Verification" Status?

- API keys may not be configured
- Invalid serial number format
- Device not in manufacturer database

---

## 📞 Support

For issues or questions:

- Visit: `/support`
- Create a ticket: `/support/create-ticket`
- Email: support@servixing.com

---

## 🔄 Future Enhancements

Coming soon:

- ✨ Samsung device support
- ✨ HP device support
- ✨ Lenovo device support
- ✨ Bulk checking (multiple devices)
- ✨ PDF report download
- ✨ Email results delivery

---

**Last Updated:** November 3, 2025
**Version:** 1.0.0
