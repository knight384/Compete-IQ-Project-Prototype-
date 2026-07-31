import { ProductRepository } from "./product.repository";
import { Prisma, Product } from "@prisma/client";

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  /**
   * Creates a new product for a competitor.
   */
  async createProduct(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    if (!data.competitorId) {
      throw new Error("Competitor ID is required to create a product.");
    }
    
    // We assume the caller (Route Handler) has verified the user belongs to the org that owns this competitorId.
    // In a more robust setup, the Service would verify the competitor belongs to the user's org.
    return this.repository.create(data);
  }

  /**
   * Gets a product by ID.
   */
  async getProduct(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error("Product not found.");
    }
    return product;
  }

  /**
   * Lists products belonging to a competitor.
   */
  async listProductsByCompetitor(competitorId: string): Promise<Product[]> {
    if (!competitorId) {
      throw new Error("Competitor ID is required.");
    }
    return this.repository.findByCompetitor(competitorId);
  }

  /**
   * Updates an existing product.
   */
  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Product not found.");
    }
    
    return this.repository.update(id, data);
  }

  /**
   * Deletes a product.
   */
  async deleteProduct(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Product not found.");
    }

    await this.repository.delete(id);
  }
}
