# Shiprocket Integration Fix - "Please add billing/shipping address first" Error

## The Problem

When attempting to create a shipment in Shiprocket, the API was returning the error:
```json
{
  "message": "Please add billing/shipping address first",
  "status_code": 400
}
```

## Root Causes

1. **Pickup Location Not Registered**: The `pickup_location` field in the API request must match an existing pickup location in your Shiprocket dashboard.

2. **Missing Required Fields**: Some required address fields were not being properly formatted or were missing.

3. **Invalid Phone Number Format**: Shiprocket requires a 10-digit phone number.

4. **Invalid Pincode Format**: Shiprocket requires a 6-digit pincode.

## The Fix

### 1. Updated `backend/config/shiprocket.js`

- Added comprehensive validation for shipping address fields
- Added phone number validation (must be 10 digits)
- Added pincode validation (must be 6 digits)
- Added debug logging for troubleshooting
- Added `verifyPickupLocation()` function to check if pickup location exists
- Added `getDefaultPickupLocation()` function to get the first available pickup location

### 2. Updated `backend/controllers/orderController.js`

- Added pickup location verification before creating shipment
- Falls back to default pickup location if configured location doesn't exist
- Better error messages for debugging

### 3. Updated `backend/controllers/shiprocketController.js`

- Added `testShiprocketConnection` endpoint to verify credentials and list pickup locations
- Better error handling for shipment creation

### 4. New Test Connection Endpoint

```
GET /api/shiprocket/test-connection
Authorization: Bearer <admin-token>
```

Returns:
- Connection status
- List of all pickup locations from Shiprocket
- Default pickup location name

## Setup Instructions

### Step 1: Create a Shiprocket API User

1. Log in to your Shiprocket account at https://app.shiprocket.in
2. Go to **Settings → API → Add New API User**
3. Enter a unique email address (different from your main login)
4. Select the API modules you need
5. Click "Create User"
6. The password will be sent to your registered email

### Step 2: Add a Pickup Location in Shiprocket

**IMPORTANT**: You MUST create at least one pickup location in Shiprocket before creating shipments.

1. Go to **Settings → Pickup Addresses**
2. Click "Add New Address"
3. Fill in all required fields:
   - **Pickup Location Name**: e.g., "Primary" (remember this name!)
   - Contact Name
   - Phone Number (10 digits)
   - Email
   - Address
   - City
   - State
   - Pincode (6 digits)
4. Save the address

### Step 3: Configure Environment Variables

Update your `.env` file:

```env
# Shiprocket credentials (from Step 1)
SHIPROCKET_EMAIL=your-api-user-email@example.com
SHIPROCKET_PASSWORD=your-api-user-password

# Pickup location name (must match exactly with Shiprocket dashboard)
SHIPROCKET_PICKUP_LOCATION=Primary

# Optional: Default pickup pincode for serviceability checks
PICKUP_PINCODE=110001
```

### Step 4: Test the Connection

1. Start your backend server
2. Call the test endpoint:

```bash
curl -X GET http://localhost:5000/api/shiprocket/test-connection \
  -H "Authorization: Bearer <your-admin-token>"
```

Expected response:
```json
{
  "success": true,
  "message": "Shiprocket connection successful",
  "pickupLocations": [
    {
      "name": "Primary",
      "address": "...",
      "city": "...",
      "state": "...",
      "pincode": "...",
      "phone": "...",
      "isDefault": true
    }
  ],
  "defaultPickupLocation": "Primary",
  "totalLocations": 1
}
```

### Step 5: Configure Pickup Address in Admin Dashboard

1. Go to Admin Dashboard → Settings
2. Scroll to "Shiprocket Pickup Address" section
3. Enter the pickup location name EXACTLY as it appears in Shiprocket
4. Fill in other details
5. Save

## Troubleshooting

### Error: "No pickup location found in Shiprocket"

**Solution**: Create a pickup location in Shiprocket dashboard first.

### Error: "Phone number must be 10 digits"

**Solution**: Ensure customer phone numbers are in 10-digit format (no country code).

### Error: "Pincode must be 6 digits"

**Solution**: Ensure pincodes are exactly 6 digits.

### Error: "Shiprocket credentials not configured"

**Solution**: Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in your .env file.

### Error: "Failed to authenticate with Shiprocket"

**Solution**: Verify your API user credentials are correct. Make sure you're using the API user email/password, not your main Shiprocket account.

## API Request Format

For reference, here's the correct format for the Shiprocket order creation API:

```json
{
  "order_id": "unique-order-id-12345",
  "order_date": "2024-01-15",
  "pickup_location": "Primary",
  
  "billing_customer_name": "John",
  "billing_last_name": "Doe",
  "billing_address": "123 Main Street",
  "billing_address_2": "Near Park",
  "billing_city": "Mumbai",
  "billing_pincode": "400001",
  "billing_state": "Maharashtra",
  "billing_country": "India",
  "billing_email": "john@example.com",
  "billing_phone": "9876543210",
  
  "shipping_is_billing": true,
  "shipping_customer_name": "John",
  "shipping_last_name": "Doe",
  "shipping_address": "123 Main Street",
  "shipping_address_2": "Near Park",
  "shipping_city": "Mumbai",
  "shipping_pincode": "400001",
  "shipping_state": "Maharashtra",
  "shipping_country": "India",
  "shipping_email": "john@example.com",
  "shipping_phone": "9876543210",
  
  "order_items": [
    {
      "name": "Product Name",
      "sku": "SKU123",
      "units": 1,
      "selling_price": 999.00,
      "discount": 0,
      "tax": 0,
      "hsn": ""
    }
  ],
  
  "payment_method": "Prepaid",
  "sub_total": 999.00,
  "shipping_charges": 0,
  "giftwrap_charges": 0,
  "transaction_charges": 0,
  "total_discount": 0,
  
  "length": 15,
  "breadth": 10,
  "height": 5,
  "weight": 0.5
}
```

## Key Requirements

1. **pickup_location**: Must be an existing location name from Shiprocket dashboard
2. **billing_phone** / **shipping_phone**: Must be 10 digits
3. **billing_pincode** / **shipping_pincode**: Must be 6 digits
4. **order_items**: Must have at least one item
5. **payment_method**: Either "COD" or "Prepaid"
