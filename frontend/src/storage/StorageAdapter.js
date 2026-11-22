/**
 * StorageAdapter Interface Definition.
 * Defines the contract for persistence to allow future cloud/database adapters
 * without modifying UI or business logic.
 */

export class StorageAdapter {
  getItem(key) {
    throw new Error("Method not implemented.");
  }
  setItem(key, value) {
    throw new Error("Method not implemented.");
  }
  removeItem(key) {
    throw new Error("Method not implemented.");
  }
  clear() {
    throw new Error("Method not implemented.");
  }
}
