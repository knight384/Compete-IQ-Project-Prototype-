import { ProductRepository } from "./product.repository";
import { Prisma, Product } from "@prisma/client";

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  /**
   * Creates a new product for a competitor.
   * Caller must have already verified that competitorId belongs to auth.context.orgId.
   */
  async createProduct(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    if (!data.competitorId) {
      throw new Error("Competitor ID is required to create a product.");
    }
    return this.repository.create(data);
  }

  /**
   * Gets a product by ID, tenant-scoped to orgId through product.competitor.orgId.
   * Returns null if the product does not exist or belongs to a different organization.
   */
  async getProduct(id: string, orgId: string): Promise<Product> {
    const product = await this.repository.findById(id, orgId);
    if (!product) {
      throw new Error("Product not found or access denied.");
    }
    return product;
  }

  /**
   * Lists products belonging to a competitor.
   * Caller must have already verified that competitorId belongs to auth.context.orgId.
   */
  async listProductsByCompetitor(competitorId: string): Promise<Product[]> {
    if (!competitorId) {
      throw new Error("Competitor ID is required.");
    }
    return this.repository.findByCompetitor(competitorId);
  }

  /**
   * Updates an existing product, tenant-scoped to orgId.
   * Throws if the product does not exist or belongs to a different organization.
   */
  async updateProduct(id: string, orgId: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.repository.update(id, orgId, data);
  }

  /**
   * Deletes a product, tenant-scoped to orgId.
   * Throws if the product does not exist or belongs to a different organization.
   */
  async deleteProduct(id: string, orgId: string): Promise<void> {
    return this.repository.delete(id, orgId);
  }
}
