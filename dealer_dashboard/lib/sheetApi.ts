import { TSMData } from '../types/dashboard';

const API_URL = '/api/sheet-data';

// Static local profile images resolver matching employee names
function getTsmImage(name: string, apiPhoto?: string | null): string {
  const upper = name.toUpperCase();
  if (upper.includes('SAGAR')) return '/tsm_images/sagar_borse.jpeg';
  if (upper.includes('AKSHAY')) return '/tsm_images/akshay_gawali.jpeg';
  if (upper.includes('RAHUL')) return '/tsm_images/rahul_mairale.jpeg';
  if (upper.includes('AMIT')) return '/tsm_images/amit_shinde.jpeg';
  if (upper.includes('RAVINDRA')) return '/tsm_images/ravindra_jadhav.jpeg';
  if (upper.includes('UNMAPPED')) return '/tsm_images/6tsm.jpg';
  return apiPhoto || '';
}

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
    if (!emp || (!emp.employee_name && !emp.employee)) continue;

    // Clean up employee name spacing
    const rawName = emp.employee_name || emp.employee || 'Unmapped Orders';
    const tsm = rawName.replace(/\s+/g, ' ').trim();

    const orderAmount = parseFloat(String(emp.order_amount ?? 0));
    const orders = parseInt(String(emp.no_of_orders ?? emp.order_count ?? 0), 10);
    const receivedAmount = parseFloat(String(emp.receipt_amount ?? emp.received_amount ?? 0));

    const cleanOrderAmount = isNaN(orderAmount) ? 0 : orderAmount;
    const cleanOrders = isNaN(orders) ? 0 : orders;
    const cleanReceivedAmount = isNaN(receivedAmount) ? 0 : receivedAmount;

    const collectionEfficiency = cleanOrderAmount > 0 
      ? (cleanReceivedAmount / cleanOrderAmount) * 100 
      : 0;
    
    const gap = cleanOrderAmount - cleanReceivedAmount;

    // Resolve profile image URL using local static images first, fallback to API
    const imageUrl = getTsmImage(tsm, emp.profile_photo);

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
