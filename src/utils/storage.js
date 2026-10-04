const GARAGE_STORAGE_KEY = 'car_configurator_saved_garage_v1';

export function getGarageCars() {
  try {
    const raw = localStorage.getItem(GARAGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading garage from localStorage:', e);
    return [];
  }
}

export function saveCarToGarage(carConfig) {
  try {
    const cars = getGarageCars();
    const newEntry = {
      ...carConfig,
      id: 'car_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      savedAt: new Date().toISOString()
    };
    cars.unshift(newEntry);
    localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(cars));
    return newEntry;
  } catch (e) {
    console.error('Error saving car to localStorage:', e);
    return null;
  }
}

export function deleteCarFromGarage(carId) {
  try {
    const cars = getGarageCars();
    const updated = cars.filter(c => c.id !== carId);
    localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting car from garage:', e);
    return [];
  }
}
