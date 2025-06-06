///const BASE = 'https://waiver-templates-strength-console.trycloudflare.com';
// config.js
//python -m http.server 8000

const BASE = localStorage.getItem('API_BASE_URL') || 'http://localhost:8000' || 'https://classification-pump-dui-definition.trycloudflare.com';

const API_CONFIG = {
  ItemKinds: `${BASE}/ItemKinds`,
  ItemList: `${BASE}/ItemList`,
  MakeTraderieUrl: `${BASE}/MakeTraderieUrl`,
  selectCategories: `${BASE}/selectCategories`
};
