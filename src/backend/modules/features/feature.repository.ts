import { Prisma, Feature } from "@prisma/client";
import { prisma } from "../../prisma/client";

export class FeatureRepository {
  /**
   * Creates a new feature.
   */
  async create(data: Prisma.FeatureUncheckedCreateInput): Promise<Feature> {
    return prisma.feature.create({
      data,
    });
  }

  /**
   * Finds a feature by ID, strictly scoped to the organization through the
   * full ownership chain: feature.product.competitor.orgId === orgId.
   */
  async findById(id: string, orgId: string): Promise<Feature | null> {
    return prisma.feature.findFirst({
      where: {
        id,
        product: {
          competitor: {
            orgId,
          },
        },
      },
    });
  }

  /**
   * Retrieves all features for a specific product.
   * Caller must have already verified that productId belongs to orgId.
   */
  async findByProduct(productId: string): Promise<Feature[]> {
    return prisma.feature.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Updates a feature, strictly scoped to the organization through the full
   * ownership chain. Performs an ownership check before mutating.
   */
  async update(id: string, orgId: string, data: Prisma.FeatureUpdateInput): Promise<Feature> {
    const existing = await this.findById(id, orgId);
    if (!existing) {
      throw new Error("Feature not found or access denied.");
    }
    return prisma.feature.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a feature, strictly scoped to the organization through the full
   * ownership chain. Performs an ownership check before deleting.
   */
  async delete(id: string, orgId: string): Promise<void> {
    const existing = await this.findById(id, orgId);
    if (!existing) {
      throw new Error("Feature not found or access denied.");
    }
    await prisma.feature.delete({
      where: { id },
    });
  }
}
