export interface StorageProvider {
  /**
   * Saves a file to storage and returns the generated storage key.
   */
  save(filename: string, buffer: Buffer, orgId: string): Promise<string>;

  /**
   * Deletes a file from storage using its storage key.
   */
  delete(storageKey: string): Promise<void>;
}
