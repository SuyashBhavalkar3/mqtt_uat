import { TSMData } from '../types/dashboard';

const API_URL = '/api/sheet-data';

export async function fetchDashboardData(): Promise<{ data: TSMData[]; pingTime: number }> {
  const response = await fetch(API_URL, {
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

    // Fallback to env images if profile_photo is null/empty
    if (!imageUrl) {
      // Find if any TSM key matches the employee's name
      const foundTsmKey = Object.keys(names).find(
        key => names[key].replace(/\s+/g, ' ').trim().toUpperCase() === tsm.toUpperCase()
      );
      if (foundTsmKey) {
        imageUrl = images[foundTsmKey] || '';
      }
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
