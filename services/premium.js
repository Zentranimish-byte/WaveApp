import Purchases from 'react-native-purchases';

const API_KEY = 'appl_test_VjKHMJzYigIxJkUhwPdJMRWXMrk';

export async function setupPurchases(userId) {
    try {
      await Purchases.configure({ apiKey: API_KEY });
      if (userId) await Purchases.logIn(userId);
    } catch (e) {
      console.log('RevenueCat setup skipped in Expo Go:', e.message);
    }
  }
export async function getCustomerInfo() {
  try {
    const info = await Purchases.getCustomerInfo();
    return info;
  } catch (e) {
    console.log('getCustomerInfo error:', e);
    return null;
  }
}

export async function isPremium() {
  try {
    const info = await Purchases.getCustomerInfo();
    return Object.keys(info.entitlements.active).length > 0;
  } catch (e) {
    return false;
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (e) {
    console.log('getOfferings error:', e);
    return null;
  }
}