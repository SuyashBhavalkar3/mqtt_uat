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

  if (!Array.isArray(rawData)) {
    throw new Error('API response is not a valid JSON array');
  }

  if (rawData.length <= 1) {
    return { data: [], pingTime };
  }

  const header = rawData[0];
  if (!Array.isArray(header)) {
    throw new Error('First row of API response is not a valid header array');
  }

  const tsmIndex = header.findIndex(h => typeof h === 'string' && h.trim().toUpperCase() === 'TSM');
  const orderAmountIndex = header.findIndex(h => typeof h === 'string' && h.trim().toUpperCase() === 'ORDER AMOUNT');
  const ordersIndex = header.findIndex(h => typeof h === 'string' && h.trim().toUpperCase() === 'ORDERS');
  const receivedAmountIndex = header.findIndex(h => typeof h === 'string' && h.trim().toUpperCase() === 'RECEIVED AMOUNT');

  const idxTsm = tsmIndex !== -1 ? tsmIndex : 0;
  const idxOrderAmount = orderAmountIndex !== -1 ? orderAmountIndex : 1;
  const idxOrders = ordersIndex !== -1 ? ordersIndex : 2;
  const idxReceivedAmount = receivedAmountIndex !== -1 ? receivedAmountIndex : 3;

  const parsedData: TSMData[] = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!Array.isArray(row) || row.length === 0) continue;

    const tsmVal = row[idxTsm];
    if (tsmVal === undefined || tsmVal === null) continue;
    const rawTsm = String(tsmVal).trim();
    if (!rawTsm) continue;

    // Resolve name from env if available (case-insensitive lookup, fallback to sheet value)
    const tsm = names[rawTsm.toUpperCase()] || rawTsm;

    const orderAmount = parseFloat(String(row[idxOrderAmount] ?? 0));
    const orders = parseInt(String(row[idxOrders] ?? 0), 10);
    const receivedAmount = parseFloat(String(row[idxReceivedAmount] ?? 0));

    const cleanOrderAmount = isNaN(orderAmount) ? 0 : orderAmount;
    const cleanOrders = isNaN(orders) ? 0 : orders;
    const cleanReceivedAmount = isNaN(receivedAmount) ? 0 : receivedAmount;

    const collectionEfficiency = cleanOrderAmount > 0 
      ? (cleanReceivedAmount / cleanOrderAmount) * 100 
      : 0;
    
    const gap = cleanOrderAmount - cleanReceivedAmount;
    
    // Resolve image URL (check mapped name first, then fallback to original sheet TSM key)
    const imageUrl = images[rawTsm.toUpperCase()] || images[tsm.toUpperCase()] || '';

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
