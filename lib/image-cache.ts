const MAX_IMAGE_CACHE_SIZE = 200;
const loadedImages = new Set<string>();

function addToImageCache(url: string): void {
  // LRU-style cache eviction using Set as ordered collection
  if (loadedImages.size >= MAX_IMAGE_CACHE_SIZE) {
    const firstItem = loadedImages.values().next().value;
    if (firstItem) {
      loadedImages.delete(firstItem);
    }
  }
  loadedImages.add(url);
}

export function isImageLoaded(url: string): boolean {
  return loadedImages.has(url);
}

export function markImageAsLoaded(url: string): void {
  addToImageCache(url);
}
