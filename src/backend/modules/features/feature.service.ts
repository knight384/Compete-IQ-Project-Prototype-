import { FeatureRepository } from "./feature.repository";
import { Prisma, Feature } from "@prisma/client";

export class FeatureService {
  private repository: FeatureRepository;

  constructor() {
    this.repository = new FeatureRepository();
  }

  /**
   * Creates a new feature for a product.
   */
  async createFeature(data: Prisma.FeatureUncheckedCreateInput): Promise<Feature> {
    if (!data.productId) {
      throw new Error("Product ID is required to create a feature.");
    }

    if (data.status && !['Available', 'Beta', 'Missing'].includes(data.status)) {
       // simple business logic validation for status
       throw new Error("Invalid feature status.");
    }

    return this.repository.create(data);
  }

  /**
   * Gets a feature by ID.
   */
  async getFeature(id: string): Promise<Feature> {
    const feature = await this.repository.findById(id);
    if (!feature) {
      throw new Error("Feature not found.");
    }
    return feature;
  }

  /**
   * Lists features belonging to a product.
   */
  async listFeaturesByProduct(productId: string): Promise<Feature[]> {
    if (!productId) {
      throw new Error("Product ID is required.");
    }
    return this.repository.findByProduct(productId);
  }

  /**
   * Updates an existing feature.
   */
  async updateFeature(id: string, data: Prisma.FeatureUpdateInput): Promise<Feature> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Feature not found.");
    }

    if (typeof data.status === 'string' && !['Available', 'Beta', 'Missing'].includes(data.status)) {
       throw new Error("Invalid feature status.");
    }

    return this.repository.update(id, data);
  }

  /**
   * Deletes a feature.
   */
  async deleteFeature(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Feature not found.");
    }

    await this.repository.delete(id);
  }
}
