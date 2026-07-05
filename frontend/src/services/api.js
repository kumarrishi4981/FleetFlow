const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ───── Dashboard ─────
export function fetchDashboard() {
  return request('/api/dashboard');
}

// ───── Vehicles ─────
export function fetchVehicles() {
  return request('/api/vehicles');
}

export function fetchVehicle(id) {
  return request(`/api/vehicles/${id}`);
}

export function updateVehicleLocation(id, lat, lng) {
  return request(`/api/vehicles/${id}/location`, {
    method: 'PUT',
    body: JSON.stringify({ lat, lng }),
  });
}

export function createVehicle(data) {
  return request('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ───── Orders ─────
export function fetchOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.vehicleId) query.append('vehicleId', params.vehicleId);
  const qs = query.toString();
  return request(`/api/orders${qs ? `?${qs}` : ''}`);
}

export function createOrder(data) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateOrderStatus(id, status) {
  return request(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function assignOrder(id, vehicleId) {
  return request(`/api/orders/${id}/assign/${vehicleId}`, {
    method: 'PUT',
  });
}

// ───── Routes ─────
export function fetchRoutes() {
  return request('/api/routes');
}

export function optimizeRoute(data) {
  return request('/api/routes/optimize', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ───── Dispatch ─────
export function autoDispatch() {
  return request('/api/dispatch/auto', {
    method: 'POST',
  });
}

export function fetchDispatchLogs(params = {}) {
  const query = new URLSearchParams();
  if (params.vehicleId) query.append('vehicleId', params.vehicleId);
  const qs = query.toString();
  return request(`/api/dispatch/logs${qs ? `?${qs}` : ''}`);
}
