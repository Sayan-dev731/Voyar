# Shiprocket Webhook Integration Guide

## Overview
This system receives real-time shipment tracking updates from Shiprocket via webhooks. When a tracking event occurs (pickup, in-transit, delivered, etc.), Shiprocket sends a POST request to your webhook endpoint with the latest tracking information.

## Setup Instructions

### Step 1: Configure Environment Variables
Add the following to your `.env` file in the backend directory:

```env
# Shiprocket Webhook Security Token (optional but recommended)
SHIPROCKET_WEBHOOK_TOKEN=your_secure_random_token_here

# Your public API URL (where Shiprocket will send webhooks)
API_URL=https://yourdomain.com
```

**Generate a secure token:**
```bash
# On Linux/Mac:
openssl rand -hex 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or simply use a long random string
```

### Step 2: Get Your Webhook URL
Once your backend is deployed, your webhook endpoint will be:
```
https://yourdomain.com/api/shipping-webhook/webhook
```

For local testing (using ngrok or similar):
```
https://your-ngrok-url.ngrok.io/api/shipping-webhook/webhook
```

### Step 3: Configure Webhook in Shiprocket Dashboard

1. **Log in to Shiprocket**
   - Visit: https://app.shiprocket.in/login
   
2. **Navigate to Webhooks Settings**
   - From the left sidebar: **Settings** → **API** → **Webhooks**
   
3. **Add Webhook Configuration**
   - **URL**: Enter your webhook endpoint (from Step 2)
   - **Security Token (x-api-key)**: Enter your `SHIPROCKET_WEBHOOK_TOKEN`
   - **Enable Toggle**: Turn ON the webhook
   
4. **Important Notes**
   - Do NOT use keywords like `shiprocket`, `kartrocket`, `sr`, or `kr` in your URL
   - Your webhook should return HTTP status code `200` for all requests
   - Content-Type should be `application/json`

### Step 4: Test Your Webhook

#### Option 1: Using Shiprocket's "Test Webhook" Button
After saving your webhook configuration, use the "Test Webhook" button in Shiprocket dashboard.

#### Option 2: Manual Testing with Sample Payload
Use Postman or curl to test your endpoint:

```bash
curl -X POST https://yourdomain.com/api/shipping-webhook/webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_webhook_token" \
  -d '{
    "awb": "TEST123456789",
    "courier_name": "Delhivery Surface",
    "current_status": "IN TRANSIT",
    "current_status_id": 20,
    "shipment_status": "IN TRANSIT",
    "shipment_status_id": 18,
    "current_timestamp": "10 01 2026 12:00:00",
    "order_id": "YOUR_ORDER_123",
    "sr_order_id": 12345678,
    "scans": [
      {
        "date": "2026-01-10 12:00:00",
        "status": "X-UCI",
        "activity": "Shipment picked up",
        "location": "Mumbai Hub",
        "sr-status": "42",
        "sr-status-label": "PICKED UP"
      }
    ]
  }'
```

### Step 5: Verify Webhook is Working

Check your backend logs for:
```
📦 Received Shiprocket webhook: {...}
✅ Found order: <order_id> for SR Order ID: <sr_order_id>
✅ Order <order_id> updated successfully with tracking data
```

Check your admin dashboard:
- Order status should update automatically
- Tracking timeline should show new events
- ETD (estimated delivery) should be visible

## Webhook Payload Structure

Shiprocket sends the following data:

```javascript
{
  "awb": "19041424751540",                    // AWB tracking number
  "courier_name": "Delhivery Surface",        // Courier company name
  "current_status": "IN TRANSIT",             // Current status text
  "current_status_id": 20,                    // Status ID
  "shipment_status": "IN TRANSIT",            // Shipment status
  "shipment_status_id": 18,                   // Shipment status ID
  "current_timestamp": "23 05 2023 11:43:52", // Latest update time
  "order_id": "1373900_150876814",            // Your order ID + SR order ID
  "sr_order_id": 348456385,                   // Shiprocket order ID
  "awb_assigned_date": "2023-05-19 11:59:16", // AWB assignment date
  "pickup_scheduled_date": "2023-05-19 11:59:17", // Pickup schedule
  "etd": "2023-05-23 15:40:19",              // Estimated delivery
  "scans": [                                  // Tracking scan history
    {
      "date": "2023-05-19 11:59:16",
      "status": "X-UCI",
      "activity": "Manifested - Manifest uploaded",
      "location": "Mumbai Hub (Maharashtra)",
      "sr-status": "5",
      "sr-status-label": "MANIFEST GENERATED"
    },
    // ... more scans
  ],
  "is_return": 0,                            // Is return shipment
  "channel_id": 3422553,                      // Channel ID
  "pod_status": "OTP Based Delivery",        // POD status
  "pod": "Not Available"                      // POD details
}
```

## Status Mapping

The webhook automatically maps Shiprocket statuses to your order system:

| Shiprocket Status | System Status | Order Status |
|------------------|---------------|--------------|
| MANIFEST GENERATED | manifest_generated | confirmed |
| PICKED UP | picked_up | processing |
| SHIPPED | shipped | shipped |
| IN TRANSIT | in_transit | shipped |
| OUT FOR DELIVERY | out_for_delivery | shipped |
| DELIVERED | delivered | delivered |
| RTO INITIATED | rto_initiated | cancelled |
| RTO DELIVERED | rto_delivered | cancelled |
| UNDELIVERED | undelivered | cancelled |

## Security Considerations

### 1. Security Token (x-api-key)
- Always use a strong, random token
- Keep it secret (add to .env, never commit)
- Rotate periodically for enhanced security

### 2. Webhook Verification
The controller verifies:
- `x-api-key` header matches your configured token
- Required fields are present in payload
- Order exists in your database

### 3. Error Handling
- Always returns HTTP 200 to prevent retry storms
- Logs all errors for debugging
- Gracefully handles missing orders

## Troubleshooting

### Webhook Not Receiving Data
1. **Check URL is publicly accessible**
   - Test with: `curl https://yourdomain.com/api/shipping-webhook/webhook`
   - Should return 401 (if security token is configured) or 400 (missing data)

2. **Verify Shiprocket Configuration**
   - URL is correct (no typos)
   - Toggle is enabled
   - Security token matches your .env

3. **Check Backend Logs**
   - Look for incoming webhook requests
   - Check for authentication errors
   - Verify order matching logic

### Orders Not Updating
1. **Check Order Has Shiprocket Data**
   - Order must have `shiprocket.orderId` or `shiprocket.awbCode`
   - These are set when creating shipment via Shiprocket API

2. **Verify Status Mapping**
   - Check if Shiprocket status is in mapping table
   - Unknown statuses default to 'in_transit'

3. **Database Connection**
   - Ensure MongoDB is connected
   - Check for save errors in logs

### Security Token Issues
1. **401 Unauthorized Errors**
   - Token mismatch between .env and Shiprocket config
   - Check for extra spaces or special characters
   - Verify header is `x-api-key` (not `X-API-Key`)

2. **Missing Token**
   - If `SHIPROCKET_WEBHOOK_TOKEN` not set, verification is skipped
   - This is insecure but useful for testing

## API Endpoints

### 1. Webhook Endpoint (POST)
```
POST /api/shipping-webhook/webhook
```
- **Purpose**: Receives tracking updates from Shiprocket
- **Authentication**: x-api-key header (optional)
- **Request Body**: Shiprocket webhook payload
- **Response**: 200 OK (always)

### 2. Webhook Config Endpoint (GET)
```
GET /api/shipping-webhook/webhook-config
```
- **Purpose**: Get webhook setup information for admin
- **Authentication**: None (can add admin auth if needed)
- **Response**:
```json
{
  "success": true,
  "config": {
    "webhookUrl": "https://yourdomain.com/api/shipping-webhook/webhook",
    "webhookToken": "your_token_here",
    "securityTokenConfigured": true,
    "instructions": { ... },
    "documentationUrl": "https://apidocs.shiprocket.in/#webhooks"
  }
}
```

## Monitoring & Maintenance

### Log Messages to Watch For

**Success:**
```
📦 Received Shiprocket webhook
✅ Found order: <id> for SR Order ID: <sr_id>
✅ Order <id> updated successfully with tracking data
   Status: shipped | Shipment: in_transit
   Courier: Delhivery Surface | AWB: 1234567890
   Tracking scans: 8
```

**Warnings:**
```
⚠️ Order not found for SR Order ID: <sr_id> or AWB: <awb>
```

**Errors:**
```
❌ Webhook authentication failed - Invalid or missing x-api-key
❌ Missing required fields in webhook payload
❌ Error processing Shiprocket webhook: <error>
```

### Best Practices

1. **Monitor Logs Regularly**
   - Set up log aggregation (e.g., Logtail, Datadog)
   - Alert on authentication failures
   - Track webhook success rate

2. **Backup Strategy**
   - Webhook data is stored in MongoDB
   - Regular database backups recommended
   - Consider keeping webhook payloads for audit

3. **Testing**
   - Test webhook after any backend changes
   - Use staging environment first
   - Verify all status transitions work correctly

4. **Performance**
   - Webhooks should process quickly (< 1 second)
   - Consider queue for heavy processing
   - Monitor response times

## Support

For issues related to:

**Webhook Integration**
- Check this guide first
- Review backend logs
- Test with sample payload

**Shiprocket API/Webhook**
- Email: integration@shiprocket.com
- Documentation: https://apidocs.shiprocket.in/
- Support: support@shiprocket.com

**Your Application**
- Check backend logs in `backend/` directory
- Review order data in MongoDB
- Test webhook endpoint manually

## Additional Resources

- [Shiprocket API Documentation](https://apidocs.shiprocket.in/)
- [Shiprocket Webhook Docs](https://apidocs.shiprocket.in/#webhooks)
- [Shiprocket Dashboard](https://app.shiprocket.in/)
- [Terms of Service](https://www.shiprocket.in/terms-conditions/)
