import { TSMData } from '../types/dashboard';

const API_URL = '/api/sheet-data';

// Static local profile images map matching employee names case-insensitively
const TSM_IMAGES_MAP: Record<string, string> = {
  'SAGAR RAJENDRA BORASE': '/tsm_images/sagar_borse.jpeg',
  'AKSHAY RAMCHANDRA GAWALI': '/tsm_images/akshay_gawali.jpeg',
  'RAHUL ASHOK MAIRALE': '/tsm_images/rahul_mairale.jpeg',
  'AMIT RAJABHAU SHINDE': '/tsm_images/amit_shinde.jpeg',
  'RAVINDRA ASHOKRAO JADHAV': '/tsm_images/ravindra_jadhav.jpeg'
};

export async function fetchDashboardData(): Promise<{ data: TSMData[]; pingTime: number }> {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const localISODate = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
  const url = `${API_URL}?from_date=${localISODate}&to_date=${localISODate}`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();
  const rawData = json.data;
  const pingTime = json.pingTime ? parseFloat(json.pingTime) : 2.5;

  // Validate backend API response structure
  if (!rawData || !rawData.message || !rawData.message.data || !Array.isArray(rawData.message.data.employees)) {
    return { data: [], pingTime };
  }

  const employees = rawData.message.data.employees;
  const parsedData: TSMData[] = [];

  for (const emp of employees) {
    if (!emp || !emp.employee_name) continue;

    // Clean up employee name spacing
    const tsm = emp.employee_name.replace(/\s+/g, ' ').trim();

    const orderAmount = parseFloat(String(emp.order_amount ?? 0));
    const orders = parseInt(String(emp.order_count ?? 0), 10);
    const receivedAmount = parseFloat(String(emp.received_amount ?? 0));

    const cleanOrderAmount = isNaN(orderAmount) ? 0 : orderAmount;
    const cleanOrders = isNaN(orders) ? 0 : orders;
    const cleanReceivedAmount = isNaN(receivedAmount) ? 0 : receivedAmount;

    const collectionEfficiency = cleanOrderAmount > 0 
      ? (cleanReceivedAmount / cleanOrderAmount) * 100 
      : 0;
    
    const gap = cleanOrderAmount - cleanReceivedAmount;

    // Resolve profile image URL: use API photo first, fallback to static local map if empty
    const imageUrl = emp.profile_photo || TSM_IMAGES_MAP[tsm.toUpperCase()] || '';

    parsedData.push({
      tsm,
      orderAmount: cleanOrderAmount,
      orders: cleanOrders,
      receivedAmount: cleanReceivedAmount,
      collectionEfficiency,
      gap,
      imageUrl,
    });
  }

  return { data: parsedData, pingTime };
}
