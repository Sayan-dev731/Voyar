import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let authToken = null;
let tokenExpiry = null;

// Cache for pickup locations (refresh every 5 minutes)
let cachedPickupLocations = null;
let pickupLocationsCacheExpiry = null;

/**
 * Get Shiprocket authentication token
 * Token is cached and reused until expiry (usually 10 days)
 */
export const getShiprocketToken = async () => {
    // Check if Shiprocket credentials are configured
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
        throw new Error('Shiprocket credentials not configured. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment variables.');
    }

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
        throw new Error('Failed to authenticate with Shiprocket. Check your credentials.');
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
 * Get all pickup locations (with caching)
 */
export const getPickupLocations = async (forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && cachedPickupLocations && pickupLocationsCacheExpiry && new Date() < pickupLocationsCacheExpiry) {
        return cachedPickupLocations;
    }

    try {
        const result = await shiprocketRequest('GET', '/settings/company/pickup');
        cachedPickupLocations = result;
        pickupLocationsCacheExpiry = new Date(Date.now() + 5 * 60 * 1000); // Cache for 5 minutes
        return result;
    } catch (error) {
        console.error('Error fetching pickup locations:', error);
        // Return cached data if available, even if expired
        if (cachedPickupLocations) {
            return cachedPickupLocations;
        }
        throw error;
    }
};

/**
 * Verify pickup location exists in Shiprocket
 * Returns the exact pickup location name if found, null otherwise
 */
export const verifyPickupLocation = async (locationName) => {
    if (!locationName) return null;

    try {
        const result = await getPickupLocations();
        if (result.data?.shipping_address && result.data.shipping_address.length > 0) {
            // Case-insensitive search for pickup location
            const location = result.data.shipping_address.find(
                addr => addr.pickup_location?.toLowerCase() === locationName.toLowerCase()
            );
            return location ? location.pickup_location : null;
        }
        return null;
    } catch (error) {
        console.error('Error verifying pickup location:', error);
        return null;
    }
};

/**
 * Get the first available (default) pickup location from Shiprocket
 */
export const getDefaultPickupLocation = async () => {
    try {
        const result = await getPickupLocations();
        if (result.data?.shipping_address && result.data.shipping_address.length > 0) {
            return result.data.shipping_address[0].pickup_location;
        }
        return null;
    } catch (error) {
        console.error('Error getting default pickup location:', error);
        return null;
    }
};

/**
 * Get pickup location details by name
 */
export const getPickupLocationDetails = async (locationName) => {
    try {
        const result = await getPickupLocations();
        if (result.data?.shipping_address && result.data.shipping_address.length > 0) {
            const location = result.data.shipping_address.find(
                addr => addr.pickup_location?.toLowerCase() === locationName?.toLowerCase()
            );
            if (location) {
                return {
                    name: location.pickup_location,
                    pincode: location.pin_code,
                    city: location.city,
                    state: location.state,
                    address: location.address,
                    phone: location.phone
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting pickup location details:', error);
        return null;
    }
};

/**
 * Create order in Shiprocket
 * @param {Object} order - The order object from database
 * @param {Object} pickupAddress - Optional pickup address configuration
 */
export const createShiprocketOrder = async (order, pickupAddress = null) => {
    // Validate required shipping address fields
    const shippingAddress = order.shippingAddress || {};

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street ||
        !shippingAddress.city || !shippingAddress.state ||
        !(shippingAddress.zipCode || shippingAddress.pincode)) {
        throw new Error('Invalid shipping address. Required: name, phone, street, city, state, pincode');
    }

    // Get billing/customer details
    const customerName = shippingAddress.name || order.customerName || '';
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Format phone number - must be 10 digits
    const rawPhone = shippingAddress.phone || order.customerPhone || '';
    const phone = rawPhone.replace(/[^0-9]/g, '').slice(-10);

    if (phone.length !== 10) {
        throw new Error('Phone number must be 10 digits');
    }

    // Get pincode - required field
    const pincode = (shippingAddress.zipCode || shippingAddress.pincode || '').toString().trim();
    if (!pincode || pincode.length !== 6) {
        throw new Error('Pincode must be 6 digits');
    }

    // Get pickup location - MUST exist in Shiprocket dashboard
    let pickupLocationName = pickupAddress?.pickupLocationName;

    // If no pickup location provided or invalid, get default from Shiprocket
    if (!pickupLocationName) {
        pickupLocationName = await getDefaultPickupLocation();
    } else {
        // Verify the provided location exists
        const verifiedName = await verifyPickupLocation(pickupLocationName);
        if (!verifiedName) {
            console.log(`Pickup location "${pickupLocationName}" not found, using default`);
            pickupLocationName = await getDefaultPickupLocation();
        } else {
            pickupLocationName = verifiedName; // Use exact name from Shiprocket
        }
    }

    if (!pickupLocationName) {
        throw new Error('No pickup location found in Shiprocket. Please add a pickup location in your Shiprocket dashboard first: https://app.shiprocket.in/settings/pickup-addresses');
    }

    // Get pickup location details for pincode
    const pickupDetails = await getPickupLocationDetails(pickupLocationName);
    const pickupPincode = pickupDetails?.pincode || pickupAddress?.pincode || process.env.PICKUP_PINCODE || '';

    // Generate unique order ID with timestamp to avoid duplicates
    const uniqueOrderId = `${order._id.toString()}-${Date.now()}`;

    // Calculate subtotal from items
    const calculatedSubtotal = order.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * (item.quantity || 1));
    }, 0);

    const orderData = {
        // Order identification
        order_id: uniqueOrderId,
        order_date: new Date(order.createdAt).toISOString().split('T')[0] + ' ' +
            new Date(order.createdAt).toISOString().split('T')[1].slice(0, 5),

        // Pickup location (MUST exist in Shiprocket dashboard)
        pickup_location: pickupLocationName,

        // Billing details (REQUIRED for Shiprocket)
        billing_customer_name: firstName,
        billing_last_name: lastName || '-',
        billing_address: shippingAddress.street.substring(0, 100) || 'Address',
        billing_address_2: (shippingAddress.landmark || '').substring(0, 100),
        billing_city: (shippingAddress.city || 'City').substring(0, 30),
        billing_pincode: parseInt(pincode),
        billing_state: shippingAddress.state || 'State',
        billing_country: shippingAddress.country || 'India',
        billing_email: order.customerEmail || 'customer@example.com',
        billing_phone: parseInt(phone),

        // Shipping is same as billing
        shipping_is_billing: true,

        // Order items (REQUIRED - at least one item)
        order_items: order.items.map((item, index) => ({
            name: (item.productName || `Product ${index + 1}`).substring(0, 100),
            sku: item.product?.toString() || `SKU-${Date.now()}-${index}`,
            units: parseInt(item.quantity) || 1,
            selling_price: parseFloat(item.price) || 0,
            discount: 0,
            tax: 0,
            hsn: ''
        })),

        // Payment details
        payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        sub_total: parseFloat(order.totalAmount) || calculatedSubtotal || 0,

        // Optional charges
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,

        // Package dimensions (default for eyewear)
        length: 15,
        breadth: 10,
        height: 5,
        weight: 0.5
    };

    console.log('Creating Shiprocket order:', {
        orderId: uniqueOrderId,
        pickupLocation: pickupLocationName,
        billingName: `${firstName} ${lastName}`,
        billingCity: orderData.billing_city,
        billingPincode: orderData.billing_pincode,
        itemsCount: orderData.order_items.length,
        paymentMethod: orderData.payment_method,
        subTotal: orderData.sub_total
    });

    try {
        const result = await shiprocketRequest('POST', '/orders/create/adhoc', orderData);
        console.log('Shiprocket order created:', result);
        return result;
    } catch (error) {
        console.error('Shiprocket create order error:', error.response?.data || error.message);

        // Provide specific error messages
        const errorMsg = error.response?.data?.message ||
            error.response?.data?.errors?.[0]?.message ||
            error.message;
        throw new Error(`Shiprocket: ${errorMsg}`);
    }
};

/**
 * Add a new pickup location in Shiprocket
 */
export const addPickupLocation = async (pickupAddress) => {
    const locationData = {
        pickup_location: pickupAddress.pickupLocationName || "Primary",
        name: pickupAddress.name,
        email: pickupAddress.email,
        phone: pickupAddress.phone.replace(/[^0-9]/g, '').slice(-10),
        address: pickupAddress.address,
        address_2: pickupAddress.address2 || "",
        city: pickupAddress.city,
        state: pickupAddress.state,
        country: pickupAddress.country || "India",
        pin_code: pickupAddress.pincode,
        lat: pickupAddress.lat || "",
        long: pickupAddress.long || ""
    };

    // Invalidate cache after adding new location
    cachedPickupLocations = null;
    pickupLocationsCacheExpiry = null;

    return await shiprocketRequest('POST', '/settings/company/addpickup', locationData);
};

/**
 * Update pickup location of created orders
 */
export const updateOrderPickupLocation = async (orderIds, pickupLocationName) => {
    return await shiprocketRequest('PATCH', '/orders/address/pickup', {
        order_id: Array.isArray(orderIds) ? orderIds : [orderIds],
        pickup_location: pickupLocationName
    });
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
    addPickupLocation,
    updateOrderPickupLocation,
    verifyPickupLocation,
    getDefaultPickupLocation,
    getPickupLocationDetails,
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
