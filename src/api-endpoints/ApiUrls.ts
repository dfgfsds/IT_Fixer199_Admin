const baseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.itfixer199.com";

const login = `${baseUrl}/api/login`;
const allUsers = `${baseUrl}/api/user/all`;
const allStols = `${baseUrl}/api/slot/all`;
const createUser = `${baseUrl}/api/user`;
const createSlot = `${baseUrl}/api/slot/create`;
const slot = `${baseUrl}/api/slot`;
const createZone = `${baseUrl}/api/zone/create`;
const zone = `${baseUrl}/api/zone`;
const allZone = `${baseUrl}/api/zone/all`;
// Hubs 
const allHubs = `${baseUrl}/api/hub/all`;
const createHub = `${baseUrl}/api/hub/create`;
const hub = `${baseUrl}/api/hub`;
// Hub Mapping
const hubMapping = `${baseUrl}/api/hub/mapping`;

// hubManagerMapping
const hubManagerMapping = `${baseUrl}/api/hub/manager-mapping`;

// Categories
const categories = `${baseUrl}/api/category`;
// Brands
const Brands = `${baseUrl}/api/brand`;
const allBrands = `${baseUrl}/api/brand/all`;
// Agents
const agents = `${baseUrl}/api/agents/`;
// Agent Product
const agentProductStock = `${baseUrl}/api/product-inventory/agent-stocks/`;
// Agent Tools Stocks
const agentToolsStock = `${baseUrl}/api/tools/agent-stocks`;
// Agent zones
const agentZones = `${baseUrl}/api/agent-zones/agent`;
const addAgentZone = `${baseUrl}/api/agent-zones/`;
// Agent Tracking
const agentTracking = `${baseUrl}/api/tracking/fetch/logs`;

// pricing
const pricingType = `${baseUrl}/api/pricing/types`;
const pricing = `${baseUrl}/api/pricing`;
const pricingBulk = `${baseUrl}/api/pricing/bulk`

// Services
const services = `${baseUrl}/api/services`;
const createService = `${baseUrl}/api/services/create/`;

// Orders
const orders = `${baseUrl}/api/order/orders/all/`;

// Products
const products = `${baseUrl}/api/product`;

// ProductInventoryMovements
const ProductInventoryMovements = `${baseUrl}/api/product-inventory/movements/role-based`;

// Attribute
const attribute = `${baseUrl}/api/attribute`;

// Tools
const tools = `${baseUrl}/api/tools`;

// allocations
const allocations = `${baseUrl}/api/allocations/`;

// Support Tickets
const supportTickets = `${baseUrl}/api/support-ticket/`;

// service-modification
const serviceModification = `${baseUrl}/service-modification`;
// Orders Service Modification
const serviceModificationOrders = `${baseUrl}/api/order/service-modifications`;

// RequestApprovalOtp
const requestApprovalOtp = `${baseUrl}/api/request/admin/refund/approve/request-otp`;
const approvalOtpVerify = `${baseUrl}/api/request/admin/refund/approve/verify`;
const adminRequestApproval = `${baseUrl}/api/request/admin/approve`;

// product-inventory
const productInventory = `${baseUrl}/api/product-inventory/inventory`;

// tools inventory movement
const toolsInventoryMovement = `${baseUrl}/api/tools/movement`;

// product inventory movement
const productInventoryMovement = `${baseUrl}/api/product-inventory/movement`;

// Attribute Fields
const attributeFields = `${baseUrl}/api/attribute/fields`;

// Requests
const Requests = `${baseUrl}/api/request`;

// Agent User
const agentUser = `${baseUrl}/api/user/agent/`;

// adminCancelOrder
const adminCancelOrder = `${baseUrl}/api/order/orders`;

// zoneByLocation
const zoneByLocation = `${baseUrl}/api/zone/by-location`;

// directSlotChange
const directSlotChange = `${baseUrl}/api/request/direct/slot-change/`;

// request tracking
const requestTracking = `${baseUrl}/api/request/tracking`;

// Tracking Delivery Verify OTP
const deliveryVerifyOtp = `${baseUrl}/api/request/delivery/verify-otp`;
// /api/app-settings
const appSettings = `${baseUrl}/api/app-settings`;
// /api/tools/inventory/
const toolsInventory = `${baseUrl}/api/tools/inventory`;
// api/notifications
const notifications = `${baseUrl}/api/notifications`;

// refund/direct/request-otp
const refundOtpRequest = `${baseUrl}/api/request/admin/refund/direct/request-otp`;
const refundOtpVerify = `${baseUrl}/api/request/admin/refund/direct/verify`;

// Order Cancel
const orderCancel = `${baseUrl}/api/order/orders`;
// requestSlotChange
const requestSlotChange = `${baseUrl}/api/request/slot-change`;

// dashboardStatus
const dashboardStatus = `${baseUrl}/api/stats/dashboard`;

// stats/order-trend
const statsOrderTrend = `${baseUrl}/api/stats/order-trend`;

// stats/revenue-trend
const statsRevenueTrend = `${baseUrl}/api/stats/revenue-trend`;

// stats/sales-distribution-percentage
const statsSalesDistribution = `${baseUrl}/api/stats/sales-distribution-percentage`;

// stats/zone-wise-trend
const statsZoneWiseTrend = `${baseUrl}/api/stats/zone-wise-trend`;

// HubServiceRequest
const HubServiceRequest = `${baseUrl}/api/request/hub-service/`;

// orderModification
const orderModification = `${baseUrl}/api/order/order-item-modification/request/`;

// orderItemModifications
const orderItemModifications = `${baseUrl}/api/order/order-item-modifications/`;

// toolMovementDirect
const toolMovementDirect = `${baseUrl}/api/tools/movement/direct/`;

// productMovementDirect
const productMovementDirect = `${baseUrl}/api/product-inventory/movements/direct/`;

// UserAgent
const userAgent = `${baseUrl}/api/user/agent`;

// manualActivate
const manualActivate = `${baseUrl}/api/order/public/order`;

// agentPerformance
const agentPerformance=`${baseUrl}/api/stats/agent-performance`;

// loginLogs
const loginLogs = `${baseUrl}/api/user/login-logs/user/`;

// activeLogs
const activeLogs =`${baseUrl}/api/user/active-logs/user/`;

export default {
  login,
  allUsers,
  allStols,
  createUser,
  createSlot,
  slot,
  createZone,
  zone,
  allZone,
  allHubs,
  createHub,
  hub,
  hubMapping,
  categories,
  Brands,
  allBrands,
  agents,
  pricingType,
  services,
  orders,
  agentProductStock,
  createService,
  products,
  attribute,
  pricing,
  pricingBulk,
  tools,
  agentToolsStock,
  allocations,
  agentZones,
  addAgentZone,
  agentTracking,
  supportTickets,
  serviceModification,
  requestApprovalOtp,
  approvalOtpVerify,
  adminRequestApproval,
  productInventory,
  toolsInventoryMovement,
  productInventoryMovement,
  attributeFields,
  serviceModificationOrders,
  Requests,
  ProductInventoryMovements,
  agentUser,
  hubManagerMapping,
  adminCancelOrder,
  zoneByLocation,
  directSlotChange,
  requestTracking,
  deliveryVerifyOtp,
  appSettings,
  toolsInventory,
  notifications,
  refundOtpRequest,
  refundOtpVerify,
  orderCancel,
  requestSlotChange,
  dashboardStatus,
  statsOrderTrend,
  statsRevenueTrend,
  statsSalesDistribution,
  statsZoneWiseTrend,
  HubServiceRequest,
  orderModification,
  orderItemModifications,
  toolMovementDirect,
  productMovementDirect,
  userAgent,
  manualActivate,
  agentPerformance,
  loginLogs,
  activeLogs,
};


