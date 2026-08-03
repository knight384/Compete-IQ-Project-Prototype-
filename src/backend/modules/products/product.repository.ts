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
   * Finds a product by ID, strictly scoped to the organization through the
   * Competitor relationship: product.competitor.orgId === orgId.
   */
  async findById(id: string, orgId: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        id,
        competitor: {
          orgId,
        },
      },
    });
  }

  /**
   * Retrieves all products for a specific competitor.
   * Caller must have already verified that competitorId belongs to orgId.
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
   * Retrieves all products for an organization by traversing the Product -> Competitor relationship.
   */
  async findAllByOrganization(orgId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        competitor: {
          orgId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Updates a product, strictly scoped to the organization through the Competitor relationship.
   * Performs an ownership check before mutating.
   */
  async update(id: string, orgId: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    const existing = await this.findById(id, orgId);
    if (!existing) {
      throw new Error("Product not found or access denied.");
    }
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a product, strictly scoped to the organization through the Competitor relationship.
   * Performs an ownership check before deleting.
   */
  async delete(id: string, orgId: string): Promise<void> {
    const existing = await this.findById(id, orgId);
    if (!existing) {
      throw new Error("Product not found or access denied.");
    }
    await prisma.product.delete({
      where: { id },
    });
  }
}
