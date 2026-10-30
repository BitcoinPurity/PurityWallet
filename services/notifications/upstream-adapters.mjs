export function boundCacheCursorRetention(Cache) {
  const originalHas = Cache.prototype.has;
  const hitCounts = new WeakMap();
  Cache.prototype.has = function (key) {
    const found = originalHas.call(this, key);
    if (found) {
      const hits = (hitCounts.get(this) ?? 0) + 1;
      if (hits === 1024) {
        // A dormant Map iterator retains obsolete hash tables during hit churn.
        this.evictionCursor = this.entries.keys();
        hitCounts.set(this, 0);
      } else {
        hitCounts.set(this, hits);
      }
    }
    return found;
  };
}

export function configureIosOnlySender(provider) {
  provider.getGoogleCredentials = async () => "";
  provider._pushToFcm = async () => {
    throw new Error("Android push delivery is disabled");
  };
}
