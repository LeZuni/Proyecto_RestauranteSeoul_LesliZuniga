const StorageHelper = {
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],

  save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
};
