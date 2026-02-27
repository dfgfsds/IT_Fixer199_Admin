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

// Attribute
const attribute = `${baseUrl}/api/attribute`;

// Tools
const tools = `${baseUrl}/api/tools`;

// allocations
const allocations = `${baseUrl}/api/allocations/`;

// Support Tickets
const supportTickets = `${baseUrl}/api/support-ticket/`;


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
};
