export const WORK_ORDER_STORAGE_KEY = 'blue-chalk-work-orders';

export const getWorkOrder = (work) => work.order ?? work.sortOrder ?? work.orderNumber ?? '';

export const getStoredWorkOrders = () => {
  try {
    const storedOrders = JSON.parse(localStorage.getItem(WORK_ORDER_STORAGE_KEY) || '{}');
    if (!storedOrders || typeof storedOrders !== 'object' || Array.isArray(storedOrders)) {
      return {};
    }

    const hasCategoryOrders = Object.values(storedOrders).some(
      (orders) => orders && typeof orders === 'object' && !Array.isArray(orders)
    );
    return hasCategoryOrders || Object.keys(storedOrders).length === 0
      ? storedOrders
      : { All: storedOrders };
  } catch (error) {
    console.error('Error reading saved work orders:', error);
    return {};
  }
};

export const getWorkOrderForCategory = (work, category, storedOrders) => (
  storedOrders[category]?.[work._id] ?? getWorkOrder(work)
);
