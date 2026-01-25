# 🚨 REQUIRED: Configure Razorpay Webhook URL

Your webhook code is ready, but **you must configure the webhook URL in Razorpay Dashboard** for automatic status updates.

## Current Issue
- Website shows "Completed" incorrectly because webhooks aren't being received
- The database only updates when webhooks arrive from Razorpay
- Without webhooks, status changes won't be reflected automatically

---

## Step 1: Start ngrok (For Development)

```powershell
# Terminal 1 - Run your backend
cd backend
npm start

# Terminal 2 - Run ngrok
ngrok http 5000
```

ngrok will give you a URL like: `https://abc123.ngrok-free.app`

---

## Step 2: Configure Webhook in Razorpay Dashboard

1. Go to **https://dashboard.razorpay.com**
2. Navigate to: **Account & Settings** → **Webhooks**
3. Click **"+ Add New Webhook"**
4. Fill in:

| Field | Value |
|-------|-------|
| **Webhook URL** | `https://YOUR-NGROK-URL.ngrok-free.app/api/payment/webhook` |
| **Secret** | Create a strong secret (e.g., `rzp_webhook_secret_yourcompany_2024`) |
| **Alert Email** | Your email for failure notifications |
| **Active Events** | Select ALL of these: |

### Required Events to Select:
- ✅ `payment.authorized`
- ✅ `payment.captured`
- ✅ `payment.failed`
- ✅ `refund.created`
- ✅ `refund.processed`
- ✅ `refund.failed`
- ✅ `refund.speed_changed`

5. Click **"Create Webhook"**

---

## Step 3: Update Your .env File

After creating the webhook in Razorpay, copy the webhook secret and update your `.env`:

```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
```

**Important:** The `RAZORPAY_WEBHOOK_SECRET` must match EXACTLY what you set in Razorpay Dashboard.

---

## Step 4: Restart Backend

```powershell
# Stop the backend (Ctrl+C) and restart
cd backend
npm start
```

---

## Step 5: Test the Webhook

1. Create a test order and make a payment
2. Initiate a refund from Razorpay Dashboard
3. Watch your backend console for webhook logs:
   ```
   [Webhook] Processing event: refund.created
   [Webhook] Refund created: rfnd_xxxxx
   [Webhook] Processing event: refund.processed
   [Webhook] Refund processed: rfnd_xxxxx
   ```

---

## For Production

Replace ngrok URL with your production URL:

```
https://api.yourdomain.com/api/payment/webhook
```

---

## Troubleshooting

### No webhook logs appearing?
- Check ngrok is running and connected
- Verify webhook URL in Razorpay Dashboard matches your ngrok URL
- Check if webhook is marked as "Active" in Razorpay

### Signature verification failing?
- Ensure `RAZORPAY_WEBHOOK_SECRET` in `.env` matches exactly
- Restart backend after changing `.env`

### Check webhook delivery in Razorpay:
1. Go to Razorpay Dashboard → Webhooks
2. Click on your webhook
3. See "Recent Deliveries" tab
4. Check for failed deliveries and error messages
