import API_BASE_URL from './api';
import { prefetchUrl } from './prefetch';

// Explore categories: page code + API path, so the Explore carousel and the
// category lists can load the next page before the click.
const CATEGORIES = {
  temples: { api: 'temples', list: () => import('../components/categories/Temples'), detail: () => import('../components/details/TempleDetail') },
  literature: { api: 'literature', list: () => import('../components/categories/Literature'), detail: () => import('../components/details/LiteratureDetail') },
  dance: { api: 'dance', list: () => import('../components/categories/Dance'), detail: () => import('../components/details/DanceDetail') },
  foods: { api: 'foods', list: () => import('../components/categories/Foods'), detail: () => import('../components/details/FoodDetail') },
  festivals: { api: 'festivals', list: () => import('../components/categories/Festivals'), detail: () => import('../components/details/FestivalDetail') },
  clothing: { api: 'clothing', list: () => import('../components/categories/Clothing'), detail: () => import('../components/details/ClothingDetail') },
  ancientscience: { api: 'ancientscience', list: () => import('../components/categories/AncientScience'), detail: () => import('../components/details/AncientScienceDetail') },
};

const ignore = () => {};

// Explore page: download every category page's code while idle.
export function preloadExploreCategoryPages() {
  if (navigator.connection?.saveData) return;
  Object.values(CATEGORIES).forEach((c) => c.list().catch(ignore));
}

// Category list page: download the detail page's code while idle.
export function preloadExploreDetailPage(path) {
  if (navigator.connection?.saveData) return;
  CATEGORIES[path]?.detail().catch(ignore);
}

// Hover / touch on a category card in the Explore carousel.
export function prefetchExploreCategory(path) {
  const c = CATEGORIES[path];
  if (!c) return;
  c.list().catch(ignore);
  prefetchUrl(`${API_BASE_URL}/api/${c.api}`);
}

// Hover / touch on an item card in a category list.
export function prefetchExploreItem(path, id) {
  const c = CATEGORIES[path];
  if (!c || !id) return;
  c.detail().catch(ignore);
  prefetchUrl(`${API_BASE_URL}/api/${c.api}/${id}`);
}
