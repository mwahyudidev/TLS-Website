// Stub for next/headers — returns a no-op cookies API for tests that don't
// rely on cookies (e.g. admin services called with explicit user context).
const store = new Map<string, string>();

export async function cookies() {
  return {
    get(name: string) {
      const v = store.get(name);
      return v ? { name, value: v } : undefined;
    },
    set(name: string, value: string) {
      store.set(name, value);
    },
    delete(name: string) {
      store.delete(name);
    },
  };
}
