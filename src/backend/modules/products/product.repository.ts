import { Prisma, Product } from "@prisma/client";
import { prisma } from "../../prisma/client";

export class ProductRepository {
  /**
   * Creates a new product.
   */
  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
    });
  }

  /**
   * Finds a product by ID.
   */
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Retrieves all products for a specific competitor.
   */
  async findByCompetitor(competitorId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        competitorId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Updates a product.
   */
  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a product.
   */
  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }
}
