export interface StorageProvider {
  /**
   * Saves a file to storage and returns the generated storage key.
   */
  save(filename: string, buffer: Buffer, orgId: string): Promise<string>;

  /**
   * Reads a file from storage and returns its buffer.
   */
  read(storageKey: string): Promise<Buffer>;

  /**
   * Deletes a file from storage using its storage key.
   */
  delete(storageKey: string): Promise<void>;
}
