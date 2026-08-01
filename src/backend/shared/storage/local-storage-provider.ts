import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { StorageProvider } from './storage-provider';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir?: string) {
    // Default to a folder outside of 'src' to avoid next.js watching issues,
    // but within the project root for development convenience.
    // It should be ignored in .gitignore
    this.baseDir = baseDir || path.join(process.cwd(), '.uploads');
  }

  private async ensureBaseDir() {
    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true });
    }
  }

  async save(filename: string, buffer: Buffer, orgId: string): Promise<string> {
    await this.ensureBaseDir();
    
    // Generate a unique, safe storage key
    // We prefix with orgId to organize but keep it flat for now.
    // Hash the filename to avoid traversal and special characters.
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(filename).toLowerCase();
    const safeKey = `${orgId}_${uniqueId}${ext}`;
    
    const fullPath = path.resolve(this.baseDir, safeKey);
    const resolvedBase = path.resolve(this.baseDir);

    // Prevent path traversal using path.relative
    const relative = path.relative(resolvedBase, fullPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Invalid file path');
    }

    await fs.writeFile(fullPath, buffer);
    return safeKey;
  }

  async read(storageKey: string): Promise<Buffer> {
    const fullPath = path.resolve(this.baseDir, storageKey);
    const resolvedBase = path.resolve(this.baseDir);

    // Prevent path traversal
    const relative = path.relative(resolvedBase, fullPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Invalid storage key');
    }

    try {
      return await fs.readFile(fullPath);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
        throw new Error('File not found in storage');
      }
      throw error;
    }
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = path.resolve(this.baseDir, storageKey);
    const resolvedBase = path.resolve(this.baseDir);

    // Prevent path traversal
    const relative = path.relative(resolvedBase, fullPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Invalid storage key');
    }

    try {
      await fs.unlink(fullPath);
    } catch (error: unknown) {
      // Ignore if file doesn't exist
      if (error instanceof Error && 'code' in error && (error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
