import { TSMData } from '../types/dashboard';

const API_URL = '/api/sheet-data';

export async function fetchDashboardData(): Promise<{ data: TSMData[]; pingTime: number }> {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const localISODate = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
  const url = `${API_URL}?from_date=${localISODate}&to_date=${localISODate}`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  const pingTimeHeader = response.headers.get('x-ping-time');
  const pingTime = pingTimeHeader ? parseFloat(pingTimeHeader) : 2.5;

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();
  const rawData = json.data;
  const images = json.images || {};
  const names = json.names || {};

  // Validate backend API response structure
  if (!rawData || !rawData.message || !rawData.message.data || !Array.isArray(rawData.message.data.employees)) {
    throw new Error('API response is missing message.data.employees array');
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

    // Resolve profile image URL
    let imageUrl = '';
    if (emp.profile_photo) {
      imageUrl = emp.profile_photo.startsWith('http')
        ? emp.profile_photo
        : `https://uatpreprod.gbru.in${emp.profile_photo}`;
    }



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
