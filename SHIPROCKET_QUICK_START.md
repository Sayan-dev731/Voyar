# 🚀 Shiprocket Webhook - Quick Start

## ✅ Status: READY

All code implemented. Just need configuration!

---

## ⚡ 3-Step Setup (10 minutes)

### 1️⃣ Add to `.env` (backend/)
```env
SHIPROCKET_WEBHOOK_TOKEN=paste_secure_random_token_here
```

Generate token:
```bash
# Mac/Linux:
openssl rand -hex 32

# Windows:
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
```

### 2️⃣ Get Your URL
**Production**: `https://yourdomain.com/api/shipping-webhook/webhook`  
**Local Test**: Use ngrok → `https://abc123.ngrok-free.app/api/shipping-webhook/webhook`

### 3️⃣ Configure Shiprocket
1. Login: https://app.shiprocket.in/login
2. Go to: **Settings → API → Webhooks**
3. Add:
   - URL: (from step 2)
   - Token: (from step 1)
   - Toggle: ON
4. Test & Save

---

## 🎯 What It Does

✅ Receives tracking updates automatically  
✅ Updates order status (shipped, delivered, etc.)  
✅ Stores complete tracking timeline  
✅ Displays in admin dashboard beautifully  

---

## 🔍 Verify It Works

### Backend Logs:
```
📦 Received Shiprocket webhook
✅ Order updated successfully
   AWB: 1234567890
   Tracking scans: 5
```

### Admin Dashboard:
Open any order → See "Shipment Tracking" section with:
- AWB number
- Current status
- Courier name
- Full timeline with locations

---

## 📚 Full Docs

- **Setup Guide**: `backend/WEBHOOK_SETUP_GUIDE.md`
- **Implementation**: `backend/SHIPROCKET_WEBHOOK_IMPLEMENTATION.md`
- **Summary**: `SHIPROCKET_WEBHOOK_SUMMARY.md`

---

## 🆘 Quick Troubleshooting

**Webhook not working?**
1. Check URL is public (test with curl)
2. Verify token matches in Shiprocket & .env
3. Look for errors in backend logs

**Orders not updating?**
1. Order must have `shiprocket.orderId` or `awbCode`
2. These are set when creating shipment
3. Check database for order data

---

## 📞 Support

**Shiprocket API**: integration@shiprocket.com  
**Docs**: https://apidocs.shiprocket.in/#webhooks

---

**Implementation**: ✅ Done  
**Your Action**: ⏰ Configure Shiprocket (10 min)

🎉 That's it! Real-time tracking will work automatically after setup.
