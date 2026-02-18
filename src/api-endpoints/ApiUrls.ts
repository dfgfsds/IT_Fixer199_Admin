const baseUrl =
  import.meta.env.VITE_API_BASE_URL ??
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

// pricing/types
const pricingType = `${baseUrl}/api/pricing/types`;
// Services
const services = `${baseUrl}/api/services`;
// Orders
const orders = `${baseUrl}/api/order/orders/all/`;

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
};
