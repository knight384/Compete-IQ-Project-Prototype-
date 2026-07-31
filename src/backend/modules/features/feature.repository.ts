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
   * Finds a feature by ID.
   */
  async findById(id: string): Promise<Feature | null> {
    return prisma.feature.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Retrieves all features for a specific product.
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
   * Updates a feature.
   */
  async update(id: string, data: Prisma.FeatureUpdateInput): Promise<Feature> {
    return prisma.feature.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a feature.
   */
  async delete(id: string): Promise<void> {
    await prisma.feature.delete({
      where: { id },
    });
  }
}
