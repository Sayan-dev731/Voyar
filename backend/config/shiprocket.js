import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let authToken = null;
let tokenExpiry = null;

/**
 * Get Shiprocket authentication token
 * Token is cached and reused until expiry (usually 10 days)
 */
export const getShiprocketToken = async () => {
    // Check if we have a valid cached token
    if (authToken && tokenExpiry && new Date() < tokenExpiry) {
        return authToken;
    }

    try {
        const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        });

        authToken = response.data.token;
        // Token is valid for 10 days, but we'll refresh after 9 days
        tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);

        console.log('Shiprocket authentication successful');
        return authToken;
    } catch (error) {
        console.error('Shiprocket authentication failed:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Shiprocket');
    }
};

/**
 * Make authenticated request to Shiprocket API
 */
export const shiprocketRequest = async (method, endpoint, data = null) => {
    const token = await getShiprocketToken();

    try {
        const config = {
            method,
            url: `${SHIPROCKET_BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('Shiprocket API error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Create order in Shiprocket
 */
export const createShiprocketOrder = async (order) => {
    const orderData = {
        order_id: order._id.toString(),
        order_date: new Date(order.createdAt).toISOString().split('T')[0],
        pickup_location: "Primary", // Default pickup location name in Shiprocket
        channel_id: "", // Optional: channel ID if configured
        comment: order.notes || "",
        billing_customer_name: order.shippingAddress.name.split(' ')[0],
        billing_last_name: order.shippingAddress.name.split(' ').slice(1).join(' ') || "",
        billing_address: order.shippingAddress.street,
        billing_address_2: "",
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.zipCode,
        billing_state: order.shippingAddress.state,
        billing_country: order.shippingAddress.country || "India",
        billing_email: order.customerEmail,
        billing_phone: order.shippingAddress.phone || order.customerPhone,
        shipping_is_billing: true,
        shipping_customer_name: order.shippingAddress.name.split(' ')[0],
        shipping_last_name: order.shippingAddress.name.split(' ').slice(1).join(' ') || "",
        shipping_address: order.shippingAddress.street,
        shipping_address_2: "",
        shipping_city: order.shippingAddress.city,
        shipping_pincode: order.shippingAddress.zipCode,
        shipping_country: order.shippingAddress.country || "India",
        shipping_state: order.shippingAddress.state,
        shipping_email: order.customerEmail,
        shipping_phone: order.shippingAddress.phone || order.customerPhone,
        order_items: order.items.map(item => ({
            name: item.productName,
            sku: item.product.toString(),
            units: item.quantity,
            selling_price: item.price,
            discount: 0,
            tax: 0,
            hsn: ""
        })),
        payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: order.totalAmount,
        length: 10, // Default package dimensions in cm
        breadth: 10,
        height: 5,
        weight: 0.5 // Default weight in kg (eyewear)
    };

    return await shiprocketRequest('POST', '/orders/create/adhoc', orderData);
};

/**
 * Get available courier services for an order
 */
export const getCourierServiceability = async (pickupPincode, deliveryPincode, weight = 0.5, cod = false) => {
    const params = new URLSearchParams({
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight: weight,
        cod: cod ? 1 : 0
    });

    return await shiprocketRequest('GET', `/courier/serviceability/?${params}`);
};

/**
 * Assign courier and generate AWB
 */
export const assignCourier = async (shipmentId, courierId) => {
    return await shiprocketRequest('POST', '/courier/assign/awb', {
        shipment_id: shipmentId,
        courier_id: courierId
    });
};

/**
 * Generate pickup request
 */
export const schedulePickup = async (shipmentId) => {
    return await shiprocketRequest('POST', '/courier/generate/pickup', {
        shipment_id: [shipmentId]
    });
};

/**
 * Track shipment by AWB number
 */
export const trackByAWB = async (awbCode) => {
    return await shiprocketRequest('GET', `/courier/track/awb/${awbCode}`);
};

/**
 * Track shipment by Shiprocket order ID
 */
export const trackByShiprocketOrderId = async (shiprocketOrderId) => {
    return await shiprocketRequest('GET', `/courier/track?order_id=${shiprocketOrderId}`);
};

/**
 * Track shipment by channel order ID (your order ID)
 */
export const trackByOrderId = async (orderId) => {
    return await shiprocketRequest('GET', `/courier/track?channel_order_id=${orderId}`);
};

/**
 * Get shipment details
 */
export const getShipmentDetails = async (shipmentId) => {
    return await shiprocketRequest('GET', `/shipments/${shipmentId}`);
};

/**
 * Cancel shipment
 */
export const cancelShipment = async (awbCodes) => {
    return await shiprocketRequest('POST', '/orders/cancel/shipment/awbs', {
        awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes]
    });
};

/**
 * Cancel order in Shiprocket
 */
export const cancelShiprocketOrder = async (orderIds) => {
    return await shiprocketRequest('POST', '/orders/cancel', {
        ids: Array.isArray(orderIds) ? orderIds : [orderIds]
    });
};

/**
 * Get all pickup locations
 */
export const getPickupLocations = async () => {
    return await shiprocketRequest('GET', '/settings/company/pickup');
};

/**
 * Generate shipping label
 */
export const generateLabel = async (shipmentId) => {
    return await shiprocketRequest('POST', '/courier/generate/label', {
        shipment_id: [shipmentId]
    });
};

/**
 * Generate invoice
 */
export const generateInvoice = async (orderIds) => {
    return await shiprocketRequest('POST', '/orders/print/invoice', {
        ids: Array.isArray(orderIds) ? orderIds : [orderIds]
    });
};

/**
 * Generate manifest
 */
export const generateManifest = async (shipmentIds) => {
    return await shiprocketRequest('POST', '/manifests/generate', {
        shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
    });
};

/**
 * Map Shiprocket status to internal status
 */
export const mapShiprocketStatus = (statusId) => {
    const statusMap = {
        1: 'pending',      // AWB Assigned
        2: 'pending',      // Label Generated
        3: 'pending',      // Pickup Scheduled
        4: 'pending',      // Pickup Queued
        5: 'processing',   // Manifest Generated
        6: 'shipped',      // Shipped
        7: 'delivered',    // Delivered
        8: 'cancelled',    // Cancelled
        9: 'shipped',      // RTO Initiated
        10: 'shipped',     // RTO Delivered
        11: 'shipped',     // Pending
        12: 'shipped',     // Lost
        13: 'shipped',     // Pickup Error
        14: 'shipped',     // RTO Acknowledged
        15: 'shipped',     // Out for Pickup
        16: 'shipped',     // In Transit
        17: 'shipped',     // Out for Delivery
        18: 'shipped',     // In Transit
        19: 'shipped',     // RTO In Transit
        20: 'shipped',     // RTO Out for Delivery
        21: 'delivered',   // Undelivered
        22: 'shipped',     // Delayed
        23: 'shipped',     // Partial Delivered
        24: 'shipped',     // Destroyed
        25: 'shipped',     // Damaged
        26: 'shipped',     // Fulfilled
        38: 'shipped',     // Reached Destination Hub
        39: 'shipped',     // Misrouted
        40: 'shipped',     // RTO NDR
        41: 'shipped',     // RTO OFD
        42: 'processing',  // Picked Up
        43: 'shipped',     // Self Fulfilled
        44: 'shipped',     // DISPOSED OFF
        45: 'cancelled',   // CANCELLED BEFORE DISPATCHED
        46: 'shipped',     // RTO IN INTRANSIT
        47: 'shipped',     // QC Failed
        48: 'shipped',     // Reached Warehouse
        49: 'shipped',     // Custom Cleared
        50: 'shipped',     // In Flight
        51: 'shipped',     // Handed Over to Courier
        52: 'shipped',     // Shipment Booked
        53: 'shipped',     // In Transit Overseas
        54: 'shipped',     // Connection Aligned
        55: 'shipped',     // Reached Destination Country
        56: 'shipped',     // Payment Received Confirmation Awaited
        57: 'shipped',     // Contact Customer Care
        58: 'shipped',     // Shipment held
        59: 'shipped',     // Reached OPS Tagged Location
    };

    return statusMap[statusId] || 'shipped';
};

/**
 * Get readable status label
 */
export const getStatusLabel = (statusId) => {
    const statusLabels = {
        1: 'AWB Assigned',
        2: 'Label Generated',
        3: 'Pickup Scheduled',
        4: 'Pickup Queued',
        5: 'Manifest Generated',
        6: 'Shipped',
        7: 'Delivered',
        8: 'Cancelled',
        9: 'RTO Initiated',
        10: 'RTO Delivered',
        11: 'Pending',
        12: 'Lost',
        13: 'Pickup Error',
        14: 'RTO Acknowledged',
        15: 'Out for Pickup',
        16: 'In Transit',
        17: 'Out for Delivery',
        18: 'In Transit',
        19: 'RTO In Transit',
        20: 'RTO Out for Delivery',
        21: 'Undelivered',
        22: 'Delayed',
        23: 'Partial Delivered',
        24: 'Destroyed',
        25: 'Damaged',
        26: 'Fulfilled',
        38: 'Reached Destination Hub',
        39: 'Misrouted',
        40: 'RTO NDR',
        41: 'RTO OFD',
        42: 'Picked Up',
        43: 'Self Fulfilled',
        44: 'Disposed Off',
        45: 'Cancelled Before Dispatch',
        46: 'RTO In Transit',
        47: 'QC Failed',
        48: 'Reached Warehouse',
        49: 'Custom Cleared',
        50: 'In Flight',
        51: 'Handed Over to Courier',
        52: 'Shipment Booked',
        53: 'In Transit Overseas',
        54: 'Connection Aligned',
        55: 'Reached Destination Country',
        56: 'Payment Confirmation Awaited',
        57: 'Contact Customer Care',
        58: 'Shipment Held',
        59: 'Reached OPS Location',
    };

    return statusLabels[statusId] || 'Processing';
};

export default {
    getShiprocketToken,
    shiprocketRequest,
    createShiprocketOrder,
    getCourierServiceability,
    assignCourier,
    schedulePickup,
    trackByAWB,
    trackByShiprocketOrderId,
    trackByOrderId,
    getShipmentDetails,
    cancelShipment,
    cancelShiprocketOrder,
    getPickupLocations,
    generateLabel,
    generateInvoice,
    generateManifest,
    mapShiprocketStatus,
    getStatusLabel
};
