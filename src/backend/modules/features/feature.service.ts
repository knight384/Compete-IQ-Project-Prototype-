import { FeatureRepository } from "./feature.repository";
import { Prisma, Feature } from "@prisma/client";

export class FeatureService {
  private repository: FeatureRepository;

  constructor() {
    this.repository = new FeatureRepository();
  }

  /**
   * Creates a new feature for a product.
   * Caller must have already verified that productId belongs to auth.context.orgId.
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
   * Gets a feature by ID, tenant-scoped to orgId through feature.product.competitor.orgId.
   * Throws if the feature does not exist or belongs to a different organization.
   */
  async getFeature(id: string, orgId: string): Promise<Feature> {
    const feature = await this.repository.findById(id, orgId);
    if (!feature) {
      throw new Error("Feature not found or access denied.");
    }
    return feature;
  }

  /**
   * Lists features belonging to a product.
   * Caller must have already verified that productId belongs to auth.context.orgId.
   */
  async listFeaturesByProduct(productId: string): Promise<Feature[]> {
    if (!productId) {
      throw new Error("Product ID is required.");
    }
    return this.repository.findByProduct(productId);
  }

  /**
   * Updates an existing feature, tenant-scoped to orgId.
   * Throws if the feature does not exist or belongs to a different organization.
   */
  async updateFeature(id: string, orgId: string, data: Prisma.FeatureUpdateInput): Promise<Feature> {
    if (typeof data.status === 'string' && !['Available', 'Beta', 'Missing'].includes(data.status)) {
       throw new Error("Invalid feature status.");
    }

    return this.repository.update(id, orgId, data);
  }

  /**
   * Deletes a feature, tenant-scoped to orgId.
   * Throws if the feature does not exist or belongs to a different organization.
   */
  async deleteFeature(id: string, orgId: string): Promise<void> {
    return this.repository.delete(id, orgId);
  }
}
