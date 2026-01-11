import Order from '../models/Order.js';
import { sendOrderStatusEmail } from '../config/email.js';
import dotenv from 'dotenv';

dotenv.config();

// Status mapping from Shiprocket to our system
const statusMapping = {
    'NEW': 'new',
    'AWB ASSIGNED': 'awb_assigned',
    'LABEL GENERATED': 'label_generated',
    'PICKUP SCHEDULED': 'pickup_scheduled',
    'PICKUP QUEUED': 'pickup_queued',
    'PICKUP GENERATED': 'pickup_generated',
    'MANIFEST GENERATED': 'manifest_generated',
    'PICKED UP': 'picked_up',
    'SHIPPED': 'shipped',
    'IN TRANSIT': 'in_transit',
    'OUT FOR DELIVERY': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'RTO INITIATED': 'rto_initiated',
    'RTO IN TRANSIT': 'rto_in_transit',
    'RTO DELIVERED': 'rto_delivered',
    'CANCELLED': 'cancelled',
    'CANCELED': 'cancelled',  // Handle both spellings
    'UNDELIVERED': 'undelivered',
    'LOST': 'lost',
    'DAMAGED': 'damaged',
    'PENDING': 'pending',
    'PROCESSING': 'processing'
};

// Handle incoming webhook from Shiprocket
export const handleShipmentWebhook = async (req, res) => {
    try {
        // Verify security token if configured
        const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
        if (webhookToken) {
            const providedToken = req.headers['x-api-key'];
            if (!providedToken || providedToken !== webhookToken) {
                console.log('❌ Webhook authentication failed - Invalid or missing x-api-key');
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - Invalid security token'
                });
            }
        }

        const webhookData = req.body;

        console.log('📦 Received Shiprocket webhook:', JSON.stringify(webhookData, null, 2));

        // Extract key fields from webhook payload
        const {
            awb,
            courier_name,
            current_status,
            current_status_id,
            shipment_status,
            shipment_status_id,
            current_timestamp,
            order_id, // Channel order ID format: "YOUR_ORDER_ID-TIMESTAMP" or just "YOUR_ORDER_ID"
            sr_order_id, // Shiprocket order ID (numeric)
            awb_assigned_date,
            pickup_scheduled_date,
            etd, // Estimated delivery date
            scans,
            is_return,
            pod_status,
            pod
        } = webhookData;

        // sr_order_id is required, but awb can be empty for new orders
        if (!sr_order_id && !order_id) {
            console.log('❌ Missing required fields in webhook payload - need sr_order_id or order_id');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sr_order_id or order_id'
            });
        }

        // Extract MongoDB order ID from channel order_id (format: "mongoId-timestamp")
        let mongoOrderId = null;
        if (order_id) {
            // order_id might be "mongoId-timestamp" or just "mongoId"
            const parts = order_id.split('-');
            mongoOrderId = parts[0];
        }

        // Find order by Shiprocket order ID, AWB code, or extracted MongoDB ID
        let order = await Order.findOne({
            $or: [
                { 'shiprocket.orderId': sr_order_id },
                ...(awb ? [{ 'shiprocket.awbCode': awb }] : []),
                ...(mongoOrderId ? [{ _id: mongoOrderId }] : [])
            ]
        });

        if (!order) {
            console.log(`⚠️ Order not found for SR Order ID: ${sr_order_id}, AWB: ${awb || 'N/A'}, MongoDB ID: ${mongoOrderId || 'N/A'}`);
            // Still return 200 to acknowledge receipt
            return res.status(200).json({
                success: false,
                message: 'Order not found in system'
            });
        }

        console.log(`✅ Found order: ${order._id} for SR Order ID: ${sr_order_id}`);

        // Map Shiprocket status to our status (handle both shipment_status and current_status)
        const statusToMap = shipment_status || current_status || '';
        const mappedStatus = statusMapping[statusToMap.toUpperCase()] || statusMapping[statusToMap] || 'in_transit';

        // Update order shipment information
        order.shiprocket = order.shiprocket || {};
        order.shiprocket.orderId = sr_order_id || order.shiprocket.orderId;
        if (awb) order.shiprocket.awbCode = awb;
        if (courier_name) order.shiprocket.courierName = courier_name;
        order.shiprocket.shipmentStatus = mappedStatus;
        order.shiprocket.shipmentStatusId = shipment_status_id || current_status_id;
        order.shiprocket.lastWebhookUpdate = new Date();
        order.shiprocket.lastTrackedAt = new Date();

        // Update pickup scheduled date
        if (pickup_scheduled_date) {
            order.shiprocket.pickupScheduledDate = new Date(pickup_scheduled_date);
        }

        // Update estimated delivery date
        if (etd) {
            order.shiprocket.estimatedDeliveryDate = new Date(etd);
        }

        // Process tracking scans
        if (scans && Array.isArray(scans)) {
            // Clear existing tracking history to avoid duplicates
            order.shiprocket.trackingHistory = [];

            // Add all scans from webhook
            for (const scan of scans) {
                order.shiprocket.trackingHistory.push({
                    date: new Date(scan.date),
                    status: scan.status,
                    statusCode: scan.status,
                    activity: scan.activity,
                    location: scan.location,
                    srStatus: scan['sr-status'],
                    srStatusLabel: scan['sr-status-label']
                });
            }

            // Sort by date (newest first)
            order.shiprocket.trackingHistory.sort((a, b) => b.date - a.date);
        }

        // Update main order status based on shipment status
        const currentOrderStatus = order.status;

        // Update order status only if shipment has progressed
        if (mappedStatus === 'new' || mappedStatus === 'created') {
            // Order just created in Shiprocket - no order status change needed
            console.log(`   Shiprocket order created/new - keeping order status: ${currentOrderStatus}`);
        } else if (mappedStatus === 'awb_assigned' || mappedStatus === 'pickup_scheduled' || mappedStatus === 'pickup_queued') {
            // AWB assigned or pickup scheduled - order is being prepared
            if (['pending', 'confirmed'].includes(currentOrderStatus)) {
                order.status = 'processing';
            }
        } else if (mappedStatus === 'picked_up' || mappedStatus === 'manifest_generated') {
            // Package picked up from warehouse
            if (['pending', 'confirmed', 'processing'].includes(currentOrderStatus)) {
                order.status = 'shipped';
            }
        } else if (mappedStatus === 'shipped' || mappedStatus === 'in_transit') {
            if (currentOrderStatus !== 'delivered') {
                order.status = 'shipped';
            }
        } else if (mappedStatus === 'out_for_delivery') {
            if (currentOrderStatus !== 'delivered') {
                order.status = 'shipped'; // Keep as shipped until delivered
            }
        } else if (mappedStatus === 'delivered') {
            // Order delivered - automatically update status
            order.status = 'delivered';
            // Mark COD as paid on delivery
            if (order.paymentMethod === 'cod') {
                order.paymentStatus = 'paid';
            }
            console.log(`   🎉 Order ${order._id} marked as DELIVERED`);
        } else if (mappedStatus === 'rto_initiated' || mappedStatus === 'rto_in_transit') {
            // Return to origin initiated - keep current status but log
            console.log(`   ⚠️ RTO initiated for order ${order._id}`);
        } else if (mappedStatus === 'rto_delivered') {
            // Package returned to seller
            order.status = 'cancelled';
            order.adminNotes = (order.adminNotes || '') + `\nRTO delivered on ${new Date().toISOString()}`;
            console.log(`   📦 Order ${order._id} - RTO completed, marked as cancelled`);
        } else if (mappedStatus === 'cancelled') {
            // Shipment cancelled in Shiprocket
            // Only cancel if not already delivered
            if (currentOrderStatus !== 'delivered') {
                order.status = 'cancelled';
                order.adminNotes = (order.adminNotes || '') + `\nCancelled by Shiprocket on ${new Date().toISOString()}`;
            }
        } else if (mappedStatus === 'undelivered' || mappedStatus === 'lost' || mappedStatus === 'damaged') {
            // Delivery failed
            order.adminNotes = (order.adminNotes || '') + `\nDelivery issue: ${mappedStatus} on ${new Date().toISOString()}`;
            console.log(`   ❌ Order ${order._id} - Delivery issue: ${mappedStatus}`);
        }

        // Track if order status changed for email notification
        const statusChanged = currentOrderStatus !== order.status;
        const previousStatus = currentOrderStatus;

        // Save updated order
        await order.save();

        console.log(`✅ Order ${order._id} updated successfully with tracking data`);
        console.log(`   Status: ${order.status} | Shipment: ${mappedStatus}`);
        console.log(`   Courier: ${courier_name || 'N/A'} | AWB: ${awb || 'N/A'}`);
        console.log(`   Tracking scans: ${order.shiprocket?.trackingHistory?.length || 0}`);

        // Send email notification if order status changed
        if (statusChanged && order.customerEmail) {
            try {
                // Determine which email to send based on new status
                const emailKey = `order${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`;

                // Check if email was already sent for this status
                if (!order.emailsSent?.[emailKey]) {
                    await sendOrderStatusEmail(order.customerEmail, order.customerName, order, order.status);

                    // Update email sent tracking
                    order.emailsSent = order.emailsSent || {};
                    order.emailsSent[emailKey] = true;
                    await order.save();

                    console.log(`   📧 Status email (${order.status}) sent to ${order.customerEmail}`);
                }
            } catch (emailError) {
                console.error(`   ❌ Failed to send status email: ${emailError.message}`);
            }
        }

        // Return 200 success response as required by Shiprocket
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            orderId: order._id,
            shipmentStatus: mappedStatus
        });

    } catch (error) {
        console.error('❌ Error processing Shiprocket webhook:', error);

        // Still return 200 to prevent Shiprocket from retrying repeatedly
        res.status(200).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
};

// Get webhook configuration details for admin setup
export const getWebhookConfig = async (req, res) => {
    try {
        const webhookUrl = `${process.env.API_URL || 'http://localhost:5000'}/api/shipping-webhook/webhook`;
        const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN || 'NOT_CONFIGURED';

        res.json({
            success: true,
            config: {
                webhookUrl,
                webhookToken,
                securityTokenConfigured: !!process.env.SHIPROCKET_WEBHOOK_TOKEN,
                instructions: {
                    step1: 'Log in to your Shiprocket account',
                    step2: 'Go to Settings > API > Webhooks',
                    step3: `Add the webhook URL: ${webhookUrl}`,
                    step4: 'Enable the toggle',
                    step5: `Add the security token as x-api-key header: ${webhookToken}`,
                    step6: 'Save the configuration',
                    note: 'The webhook URL should return only code 200 in response'
                },
                documentationUrl: 'https://apidocs.shiprocket.in/#webhooks'
            }
        });
    } catch (error) {
        console.error('Error getting webhook config:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving webhook configuration'
        });
    }
};
