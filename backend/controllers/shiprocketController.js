import Order from '../models/Order.js';
import { SiteSettings } from '../models/Admin.js';
import {
    createShiprocketOrder,
    getCourierServiceability,
    assignCourier,
    schedulePickup,
    trackByAWB,
    cancelShipment,
    cancelShiprocketOrder,
    getPickupLocations,
    generateLabel,
    generateInvoice,
    mapShiprocketStatus,
    getStatusLabel,
    addPickupLocation,
    getShiprocketToken,
    verifyPickupLocation,
    getDefaultPickupLocation,
    getPickupLocationDetails,
    updateOrderPickupLocation
} from '../config/shiprocket.js';
import { sendOrderStatusEmail } from '../config/email.js';

/**
 * Test Shiprocket connection and credentials
 * Admin only
 */
export const testShiprocketConnection = async (req, res) => {
    try {
        // Try to get token to verify credentials
        await getShiprocketToken();

        // Get all pickup locations (force refresh)
        const pickupResult = await getPickupLocations(true);
        const pickupLocations = pickupResult.data?.shipping_address || [];

        // Get default pickup location name
        const defaultLocation = pickupLocations.length > 0 ? pickupLocations[0].pickup_location : null;

        res.json({
            success: true,
            message: 'Shiprocket connection successful',
            pickupLocations: pickupLocations.map(loc => ({
                name: loc.pickup_location,
                address: loc.address,
                city: loc.city,
                state: loc.state,
                pincode: loc.pin_code,
                phone: loc.phone,
                isDefault: loc.pickup_location === defaultLocation
            })),
            defaultPickupLocation: defaultLocation,
            totalLocations: pickupLocations.length
        });
    } catch (error) {
        console.error('Shiprocket connection test failed:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to connect to Shiprocket',
            error: error.message
        });
    }
};

/**
 * Sync pickup location - Get available pickup locations from Shiprocket
 * Admin only
 */
export const syncPickupLocations = async (req, res) => {
    try {
        // Force refresh pickup locations from Shiprocket
        const pickupResult = await getPickupLocations(true);
        const pickupLocations = pickupResult.data?.shipping_address || [];

        if (pickupLocations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No pickup locations found in Shiprocket. Please add a pickup location in your Shiprocket dashboard.',
                helpUrl: 'https://app.shiprocket.in/settings/pickup-addresses'
            });
        }

        // Get current settings
        const settings = await SiteSettings.findOne();

        res.json({
            success: true,
            message: `Found ${pickupLocations.length} pickup location(s)`,
            pickupLocations: pickupLocations.map(loc => ({
                name: loc.pickup_location,
                address: loc.address,
                address2: loc.address_2 || '',
                city: loc.city,
                state: loc.state,
                pincode: loc.pin_code,
                phone: loc.phone,
                email: loc.email || '',
                country: loc.country || 'India'
            })),
            currentSettingsLocation: settings?.pickupAddress?.pickupLocationName || null
        });
    } catch (error) {
        console.error('Sync pickup locations error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to sync pickup locations'
        });
    }
};

/**
 * Add new pickup location to Shiprocket
 * Admin only
 */
export const createPickupLocation = async (req, res) => {
    try {
        const { name, email, phone, address, address2, city, state, pincode, pickupLocationName } = req.body;

        // Validate required fields
        if (!name || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                message: 'Missing required fields: name, phone, address, city, state, pincode'
            });
        }

        const locationData = {
            pickupLocationName: pickupLocationName || name.replace(/\s+/g, '_'),
            name,
            email: email || '',
            phone,
            address,
            address2: address2 || '',
            city,
            state,
            pincode,
            country: 'India'
        };

        const result = await addPickupLocation(locationData);

        // Update site settings with the new pickup location
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({});
        }

        settings.pickupAddress = {
            pickupLocationName: locationData.pickupLocationName,
            name: locationData.name,
            email: locationData.email,
            phone: locationData.phone,
            address: locationData.address,
            address2: locationData.address2,
            city: locationData.city,
            state: locationData.state,
            pincode: locationData.pincode,
            country: 'India'
        };
        settings.pickupAddressConfigured = true;
        await settings.save();

        res.json({
            success: true,
            message: 'Pickup location added successfully',
            result,
            settings: settings.pickupAddress
        });
    } catch (error) {
        console.error('Create pickup location error:', error.message);
        const errorMsg = error.response?.data?.message || error.message;
        res.status(500).json({
            success: false,
            message: errorMsg || 'Failed to add pickup location'
        });
    }
};

/**
 * Select and save a pickup location from Shiprocket to settings
 * Admin only
 */
export const selectPickupLocation = async (req, res) => {
    try {
        const { pickupLocationName } = req.body;

        if (!pickupLocationName) {
            return res.status(400).json({ message: 'Pickup location name is required' });
        }

        // Verify the location exists in Shiprocket
        const verifiedName = await verifyPickupLocation(pickupLocationName);
        if (!verifiedName) {
            return res.status(404).json({
                message: `Pickup location "${pickupLocationName}" not found in Shiprocket`
            });
        }

        // Get full details of the location
        const locationDetails = await getPickupLocationDetails(verifiedName);

        // Update site settings
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({});
        }

        settings.pickupAddress = {
            pickupLocationName: verifiedName,
            name: locationDetails?.name || '',
            phone: locationDetails?.phone || '',
            address: locationDetails?.address || '',
            city: locationDetails?.city || '',
            state: locationDetails?.state || '',
            pincode: locationDetails?.pincode || '',
            country: 'India'
        };
        settings.pickupAddressConfigured = true;
        await settings.save();

        res.json({
            success: true,
            message: `Pickup location "${verifiedName}" selected successfully`,
            pickupAddress: settings.pickupAddress
        });
    } catch (error) {
        console.error('Select pickup location error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to select pickup location'
        });
    }
};

/**
 * Create shipment in Shiprocket for an order
 * Admin only
 */
export const createShipment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if shipment already exists
        if (order.shiprocket?.orderId) {
            return res.status(400).json({
                message: 'Shipment already created for this order',
                shiprocketOrderId: order.shiprocket.orderId
            });
        }

        // Validate shipping address
        if (!order.shippingAddress ||
            !order.shippingAddress.name ||
            !order.shippingAddress.phone ||
            !order.shippingAddress.street ||
            !order.shippingAddress.city ||
            !order.shippingAddress.state ||
            !(order.shippingAddress.zipCode || order.shippingAddress.pincode)) {
            return res.status(400).json({
                message: 'Please add shipping address first. Required: name, phone, street, city, state, and pincode.'
            });
        }

        // Only create shipment for confirmed/processing orders
        if (!['confirmed', 'processing'].includes(order.status)) {
            return res.status(400).json({
                message: 'Order must be confirmed or processing to create shipment'
            });
        }

        // Get pickup address from settings (optional - Shiprocket will use default if not found)
        const settings = await SiteSettings.findOne();
        const pickupAddress = settings?.pickupAddress;

        console.log(`Creating shipment for order ${order._id}`);

        // Create order in Shiprocket - pickup location will be auto-fetched if needed
        const result = await createShiprocketOrder(order, pickupAddress);

        if (result.order_id) {
            // Update order with Shiprocket details
            order.shiprocket = {
                orderId: result.order_id,
                shipmentId: result.shipment_id,
                shipmentStatus: 'created',
                lastTrackedAt: new Date()
            };
            order.status = 'processing';
            await order.save();

            res.json({
                message: 'Shipment created successfully',
                shiprocketOrderId: result.order_id,
                shipmentId: result.shipment_id,
                order
            });
        } else {
            throw new Error(result.message || 'Failed to create shipment');
        }
    } catch (error) {
        console.error('Create shipment error:', error.message);
        const errorMessage = error.message || 'Failed to create shipment';
        res.status(500).json({ message: errorMessage });
    }
};

/**
 * Get available couriers for an order
 * Admin only
 */
export const getAvailableCouriers = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Default pickup pincode (should be configured in Shiprocket)
        const pickupPincode = process.env.PICKUP_PINCODE || '110001';
        const deliveryPincode = order.shippingAddress.zipCode;
        const isCOD = order.paymentMethod === 'cod';

        const couriers = await getCourierServiceability(
            pickupPincode,
            deliveryPincode,
            0.5, // Default weight for eyewear
            isCOD
        );

        res.json({
            couriers: couriers.data?.available_courier_companies || [],
            recommended: couriers.data?.recommended_courier_company_id
        });
    } catch (error) {
        console.error('Get couriers error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to get available couriers'
        });
    }
};

/**
 * Assign courier and generate AWB
 * Admin only
 */
export const assignCourierToOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { courierId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.shiprocket?.shipmentId) {
            return res.status(400).json({
                message: 'Please create shipment first before assigning courier'
            });
        }

        if (order.shiprocket?.awbCode) {
            return res.status(400).json({
                message: 'Courier already assigned',
                awbCode: order.shiprocket.awbCode
            });
        }

        const result = await assignCourier(order.shiprocket.shipmentId, courierId);

        if (result.response?.data?.awb_code) {
            order.shiprocket.awbCode = result.response.data.awb_code;
            order.shiprocket.courierCompanyId = result.response.data.courier_company_id;
            order.shiprocket.courierName = result.response.data.courier_name;
            order.shiprocket.shipmentStatus = 'awb_assigned';
            order.shiprocket.lastTrackedAt = new Date();
            await order.save();

            res.json({
                message: 'Courier assigned successfully',
                awbCode: result.response.data.awb_code,
                courierName: result.response.data.courier_name,
                order
            });
        } else {
            throw new Error(result.message || 'Failed to assign courier');
        }
    } catch (error) {
        console.error('Assign courier error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to assign courier'
        });
    }
};

/**
 * Schedule pickup for an order
 * Admin only
 */
export const scheduleOrderPickup = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.shiprocket?.shipmentId) {
            return res.status(400).json({
                message: 'Please create shipment first'
            });
        }

        const result = await schedulePickup(order.shiprocket.shipmentId);

        if (result.pickup_status) {
            order.shiprocket.pickupScheduledDate = new Date();
            order.shiprocket.pickupTokenNumber = result.pickup_token_number;
            order.shiprocket.shipmentStatus = 'pickup_scheduled';
            order.shiprocket.lastTrackedAt = new Date();
            await order.save();

            res.json({
                message: 'Pickup scheduled successfully',
                pickupTokenNumber: result.pickup_token_number,
                order
            });
        } else {
            throw new Error(result.message || 'Failed to schedule pickup');
        }
    } catch (error) {
        console.error('Schedule pickup error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to schedule pickup'
        });
    }
};

/**
 * Get shipment tracking details
 * Available to both users and admins
 */
export const getTrackingDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order (if not admin)
        if (req.user && !req.isAdmin && order.userId?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        // If no AWB code, return current stored data
        if (!order.shiprocket?.awbCode) {
            return res.json({
                tracking: null,
                message: 'Shipment not yet dispatched',
                shiprocket: order.shiprocket
            });
        }

        // Get live tracking from Shiprocket
        const trackingData = await trackByAWB(order.shiprocket.awbCode);

        if (trackingData.tracking_data) {
            const tracking = trackingData.tracking_data;

            // Update order with latest tracking info
            order.shiprocket.shipmentStatus = mapShiprocketStatusLabel(tracking.shipment_status);
            order.shiprocket.shipmentStatusId = tracking.shipment_status_id;
            order.shiprocket.estimatedDeliveryDate = tracking.etd ? new Date(tracking.etd) : null;
            order.shiprocket.lastTrackedAt = new Date();

            // Update tracking history
            if (tracking.shipment_track_activities) {
                order.shiprocket.trackingHistory = tracking.shipment_track_activities.map(activity => ({
                    date: new Date(activity.date),
                    status: activity['sr-status-label'],
                    statusCode: activity['sr-status'],
                    activity: activity.activity,
                    location: activity.location
                }));
            }

            // Update main order status based on shipment status
            const newStatus = mapShiprocketStatus(tracking.shipment_status_id);
            if (newStatus !== order.status && ['shipped', 'delivered'].includes(newStatus)) {
                order.status = newStatus;

                // Send status update email
                try {
                    await sendOrderStatusEmail(order.customerEmail, order.customerName, order, newStatus);
                } catch (emailError) {
                    console.error('Failed to send status email:', emailError);
                }
            }

            await order.save();

            res.json({
                tracking: {
                    awbCode: order.shiprocket.awbCode,
                    courierName: order.shiprocket.courierName,
                    currentStatus: tracking.shipment_status,
                    currentStatusId: tracking.shipment_status_id,
                    estimatedDelivery: tracking.etd,
                    pickupDate: tracking.pickup_date,
                    deliveredDate: tracking.delivered_date,
                    activities: tracking.shipment_track_activities || [],
                    trackUrl: tracking.track_url
                },
                shiprocket: order.shiprocket,
                order: {
                    _id: order._id,
                    status: order.status,
                    customerName: order.customerName
                }
            });
        } else {
            res.json({
                tracking: null,
                message: 'Tracking information not available yet',
                shiprocket: order.shiprocket
            });
        }
    } catch (error) {
        console.error('Get tracking error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to get tracking details'
        });
    }
};

/**
 * Map Shiprocket status label to internal status
 */
const mapShiprocketStatusLabel = (statusLabel) => {
    const statusLower = statusLabel?.toLowerCase() || '';

    if (statusLower.includes('delivered')) return 'delivered';
    if (statusLower.includes('out for delivery')) return 'out_for_delivery';
    if (statusLower.includes('in transit')) return 'in_transit';
    if (statusLower.includes('shipped')) return 'shipped';
    if (statusLower.includes('picked')) return 'picked_up';
    if (statusLower.includes('manifest')) return 'manifest_generated';
    if (statusLower.includes('pickup scheduled')) return 'pickup_scheduled';
    if (statusLower.includes('label')) return 'label_generated';
    if (statusLower.includes('awb')) return 'awb_assigned';
    if (statusLower.includes('rto')) return 'rto_initiated';
    if (statusLower.includes('cancel')) return 'cancelled';
    if (statusLower.includes('lost')) return 'lost';
    if (statusLower.includes('damage')) return 'damaged';
    if (statusLower.includes('undeliver')) return 'undelivered';

    return 'shipped';
};

/**
 * Generate shipping label
 * Admin only
 */
export const generateShippingLabel = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.shiprocket?.shipmentId) {
            return res.status(400).json({ message: 'Shipment not created yet' });
        }

        const result = await generateLabel(order.shiprocket.shipmentId);

        if (result.label_url) {
            order.shiprocket.labelUrl = result.label_url;
            order.shiprocket.shipmentStatus = 'label_generated';
            await order.save();

            res.json({
                message: 'Label generated successfully',
                labelUrl: result.label_url
            });
        } else {
            throw new Error('Failed to generate label');
        }
    } catch (error) {
        console.error('Generate label error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to generate label'
        });
    }
};

/**
 * Generate invoice
 * Admin only
 */
export const generateOrderInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.shiprocket?.orderId) {
            return res.status(400).json({ message: 'Shiprocket order not created yet' });
        }

        const result = await generateInvoice(order.shiprocket.orderId);

        if (result.invoice_url) {
            order.shiprocket.invoiceUrl = result.invoice_url;
            await order.save();

            res.json({
                message: 'Invoice generated successfully',
                invoiceUrl: result.invoice_url
            });
        } else {
            throw new Error('Failed to generate invoice');
        }
    } catch (error) {
        console.error('Generate invoice error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to generate invoice'
        });
    }
};

/**
 * Cancel shipment
 * Admin only
 */
export const cancelOrderShipment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.shiprocket?.awbCode) {
            return res.status(400).json({ message: 'No shipment to cancel' });
        }

        // Can only cancel before delivery
        if (order.shiprocket.shipmentStatus === 'delivered') {
            return res.status(400).json({ message: 'Cannot cancel delivered shipment' });
        }

        const result = await cancelShipment(order.shiprocket.awbCode);

        order.shiprocket.shipmentStatus = 'cancelled';
        order.shiprocket.lastTrackedAt = new Date();
        await order.save();

        res.json({
            message: 'Shipment cancelled successfully',
            result
        });
    } catch (error) {
        console.error('Cancel shipment error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to cancel shipment'
        });
    }
};

/**
 * Get pickup locations
 * Admin only
 */
export const getPickupAddresses = async (req, res) => {
    try {
        const locations = await getPickupLocations();
        res.json(locations);
    } catch (error) {
        console.error('Get pickup locations error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.response?.data?.message || 'Failed to get pickup locations'
        });
    }
};

/**
 * Webhook handler for Shiprocket tracking updates
 * Public endpoint (secured by token)
 */
export const handleWebhook = async (req, res) => {
    try {
        // Verify webhook token if configured
        const webhookToken = req.headers['x-api-key'];
        if (process.env.SHIPROCKET_WEBHOOK_TOKEN && webhookToken !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const webhookData = req.body;
        console.log('Shiprocket webhook received:', JSON.stringify(webhookData, null, 2));

        // Find order by AWB or order ID
        let order = null;
        if (webhookData.awb) {
            order = await Order.findOne({ 'shiprocket.awbCode': webhookData.awb });
        }
        if (!order && webhookData.order_id) {
            // Try by channel order ID (our order ID)
            const orderIdParts = webhookData.order_id.split('_');
            const ourOrderId = orderIdParts[0];
            order = await Order.findById(ourOrderId);
        }

        if (!order) {
            console.log('Order not found for webhook:', webhookData.order_id || webhookData.awb);
            return res.status(200).json({ message: 'Order not found but acknowledged' });
        }

        // Update order with webhook data
        order.shiprocket.shipmentStatus = mapShiprocketStatusLabel(webhookData.current_status);
        order.shiprocket.shipmentStatusId = webhookData.current_status_id;
        order.shiprocket.courierName = webhookData.courier_name || order.shiprocket.courierName;
        order.shiprocket.estimatedDeliveryDate = webhookData.etd ? new Date(webhookData.etd) : order.shiprocket.estimatedDeliveryDate;
        order.shiprocket.lastWebhookUpdate = new Date();
        order.shiprocket.lastTrackedAt = new Date();

        // Update tracking history from scans
        if (webhookData.scans && webhookData.scans.length > 0) {
            order.shiprocket.trackingHistory = webhookData.scans.map(scan => ({
                date: new Date(scan.date),
                status: scan['sr-status-label'],
                statusCode: scan['sr-status'],
                activity: scan.activity,
                location: scan.location
            }));
        }

        // Update main order status
        const newStatus = mapShiprocketStatus(webhookData.current_status_id);
        if (newStatus !== order.status) {
            const previousStatus = order.status;
            order.status = newStatus;

            // Send email notification for significant status changes
            if (['shipped', 'delivered', 'cancelled'].includes(newStatus) && previousStatus !== newStatus) {
                try {
                    await sendOrderStatusEmail(order.customerEmail, order.customerName, order, newStatus);
                } catch (emailError) {
                    console.error('Failed to send webhook status email:', emailError);
                }
            }
        }

        await order.save();

        // Always return 200 to acknowledge receipt
        res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to prevent retries
        res.status(200).json({ message: 'Webhook acknowledged with error' });
    }
};

/**
 * Quick ship - Create shipment, assign courier, and schedule pickup in one call
 * Admin only
 */
export const quickShip = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { courierId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate shipping address
        if (!order.shippingAddress ||
            !order.shippingAddress.name ||
            !order.shippingAddress.phone ||
            !order.shippingAddress.street ||
            !order.shippingAddress.city ||
            !order.shippingAddress.state ||
            !(order.shippingAddress.zipCode || order.shippingAddress.pincode)) {
            return res.status(400).json({
                message: 'Please add shipping address first. Required: name, phone, street, city, state, and pincode.'
            });
        }

        // Allow pending, confirmed, or processing orders to be shipped
        if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
            return res.status(400).json({
                message: 'Order must be pending, confirmed, or processing to ship. Current status: ' + order.status
            });
        }

        // Get pickup address from settings (optional)
        const settings = await SiteSettings.findOne();
        const pickupAddress = settings?.pickupAddress;

        const steps = [];

        // Step 1: Create shipment if not exists
        if (!order.shiprocket?.orderId) {
            const createResult = await createShiprocketOrder(order, pickupAddress);
            if (createResult.order_id) {
                order.shiprocket = {
                    orderId: createResult.order_id,
                    shipmentId: createResult.shipment_id,
                    // Map Shiprocket status to our enum - 'NEW' becomes 'new'
                    shipmentStatus: createResult.status === 'NEW' ? 'new' : 'created',
                    lastTrackedAt: new Date()
                };
                steps.push({ step: 'create', success: true, orderId: createResult.order_id, shipmentId: createResult.shipment_id });
            } else {
                throw new Error('Failed to create shipment');
            }
        }

        // Step 2: Get pickup location details for pincode
        let pickupPincode = pickupAddress?.pincode;
        if (!pickupPincode) {
            const defaultLocation = await getDefaultPickupLocation();
            if (defaultLocation) {
                const locationDetails = await getPickupLocationDetails(defaultLocation);
                pickupPincode = locationDetails?.pincode || process.env.PICKUP_PINCODE || '110001';
            }
        }

        // Step 3: Get recommended courier if not provided
        let selectedCourierId = courierId;
        let selectedCourierName = null;

        if (!selectedCourierId) {
            const deliveryPincode = order.shippingAddress.zipCode || order.shippingAddress.pincode;
            console.log(`Getting couriers for pickup: ${pickupPincode}, delivery: ${deliveryPincode}`);

            const couriers = await getCourierServiceability(
                pickupPincode,
                deliveryPincode,
                0.5,
                order.paymentMethod === 'cod'
            );

            console.log(`Courier serviceability:`, JSON.stringify({
                available: couriers.data?.available_courier_companies?.length || 0,
                recommended: couriers.data?.recommended_courier_company_id
            }));

            if (couriers.data?.recommended_courier_company_id) {
                selectedCourierId = couriers.data.recommended_courier_company_id;
                const courier = couriers.data.available_courier_companies?.find(
                    c => c.courier_company_id === selectedCourierId
                );
                selectedCourierName = courier?.courier_name;
            } else if (couriers.data?.available_courier_companies?.length > 0) {
                // Select cheapest courier
                const sortedCouriers = couriers.data.available_courier_companies.sort(
                    (a, b) => a.rate - b.rate
                );
                selectedCourierId = sortedCouriers[0].courier_company_id;
                selectedCourierName = sortedCouriers[0].courier_name;
            }

            if (!selectedCourierId) {
                steps.push({ step: 'get_couriers', success: false, error: 'No couriers available for this route' });
            } else {
                console.log(`Selected courier: ${selectedCourierName} (ID: ${selectedCourierId})`);
            }
        }

        // Step 4: Assign courier if not already assigned
        if (!order.shiprocket.awbCode && selectedCourierId) {
            try {
                const assignResult = await assignCourier(order.shiprocket.shipmentId, selectedCourierId);
                console.log(`Assign courier result:`, JSON.stringify(assignResult));

                // Handle different response structures from Shiprocket
                const awbCode = assignResult.response?.data?.awb_code ||
                    assignResult.awb_code ||
                    assignResult.data?.awb_code;
                const courierName = assignResult.response?.data?.courier_name ||
                    assignResult.courier_name ||
                    selectedCourierName;
                const courierCompanyId = assignResult.response?.data?.courier_company_id ||
                    assignResult.courier_company_id ||
                    selectedCourierId;

                if (awbCode) {
                    order.shiprocket.awbCode = awbCode;
                    order.shiprocket.courierCompanyId = courierCompanyId;
                    order.shiprocket.courierName = courierName;
                    order.shiprocket.shipmentStatus = 'awb_assigned';
                    steps.push({
                        step: 'assign_courier',
                        success: true,
                        awbCode: awbCode,
                        courierName: courierName
                    });
                } else {
                    console.error('No AWB code in assign response:', assignResult);
                    steps.push({
                        step: 'assign_courier',
                        success: false,
                        error: 'No AWB code returned',
                        response: assignResult
                    });
                }
            } catch (assignError) {
                console.error('Courier assignment failed:', assignError.message);
                steps.push({ step: 'assign_courier', success: false, error: assignError.message });
            }
        } else if (!selectedCourierId) {
            steps.push({ step: 'assign_courier', success: false, error: 'No courier selected' });
        }

        // Step 5: Schedule pickup
        if (order.shiprocket.shipmentId && order.shiprocket.awbCode && !order.shiprocket.pickupScheduledDate) {
            try {
                const pickupResult = await schedulePickup(order.shiprocket.shipmentId);
                console.log(`Pickup result:`, JSON.stringify(pickupResult));
                if (pickupResult.pickup_status || pickupResult.status) {
                    order.shiprocket.pickupScheduledDate = new Date();
                    order.shiprocket.pickupTokenNumber = pickupResult.pickup_token_number || pickupResult.token;
                    order.shiprocket.shipmentStatus = 'pickup_scheduled';
                    steps.push({
                        step: 'schedule_pickup',
                        success: true,
                        pickupToken: pickupResult.pickup_token_number || pickupResult.token
                    });
                }
            } catch (pickupError) {
                console.error('Pickup scheduling failed:', pickupError.message);
                steps.push({ step: 'schedule_pickup', success: false, error: pickupError.message });
            }
        }

        // Update order status to shipped
        order.status = 'shipped';
        order.shiprocket.lastTrackedAt = new Date();
        await order.save();

        // Send shipping notification
        try {
            await sendOrderStatusEmail(order.customerEmail, order.customerName, order, 'shipped');
        } catch (emailError) {
            console.error('Failed to send shipping email:', emailError);
        }

        res.json({
            message: 'Order shipped successfully',
            steps,
            order,
            shiprocket: order.shiprocket
        });
    } catch (error) {
        console.error('Quick ship error:', error.message);
        const errorMessage = error.message || 'Failed to ship order';
        res.status(500).json({ message: errorMessage });
    }
};

/**
 * Bulk tracking update - Updates tracking for all shipped orders
 * Admin only, should be called via cron job
 */
export const bulkTrackingUpdate = async (req, res) => {
    try {
        // Find all orders with AWB codes that are not delivered/cancelled
        const orders = await Order.find({
            'shiprocket.awbCode': { $exists: true, $ne: null },
            status: { $nin: ['delivered', 'cancelled'] }
        });

        const results = {
            total: orders.length,
            updated: 0,
            errors: []
        };

        for (const order of orders) {
            try {
                const trackingData = await trackByAWB(order.shiprocket.awbCode);

                if (trackingData.tracking_data) {
                    const tracking = trackingData.tracking_data;

                    order.shiprocket.shipmentStatus = mapShiprocketStatusLabel(tracking.shipment_status);
                    order.shiprocket.shipmentStatusId = tracking.shipment_status_id;
                    order.shiprocket.estimatedDeliveryDate = tracking.etd ? new Date(tracking.etd) : null;
                    order.shiprocket.lastTrackedAt = new Date();

                    if (tracking.shipment_track_activities) {
                        order.shiprocket.trackingHistory = tracking.shipment_track_activities.map(activity => ({
                            date: new Date(activity.date),
                            status: activity['sr-status-label'],
                            statusCode: activity['sr-status'],
                            activity: activity.activity,
                            location: activity.location
                        }));
                    }

                    const newStatus = mapShiprocketStatus(tracking.shipment_status_id);
                    if (newStatus !== order.status) {
                        order.status = newStatus;
                    }

                    await order.save();
                    results.updated++;
                }
            } catch (orderError) {
                results.errors.push({
                    orderId: order._id,
                    error: orderError.message
                });
            }

            // Rate limiting - wait between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.json(results);
    } catch (error) {
        console.error('Bulk tracking update error:', error);
        res.status(500).json({ message: 'Failed to update tracking' });
    }
};

export default {
    testShiprocketConnection,
    syncPickupLocations,
    createPickupLocation,
    selectPickupLocation,
    createShipment,
    getAvailableCouriers,
    assignCourierToOrder,
    scheduleOrderPickup,
    getTrackingDetails,
    generateShippingLabel,
    generateOrderInvoice,
    cancelOrderShipment,
    getPickupAddresses,
    handleWebhook,
    quickShip,
    bulkTrackingUpdate
};
