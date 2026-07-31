import { CompetitorRepository } from "./competitor.repository";
import { Prisma, Competitor } from "@prisma/client";

export class CompetitorService {
  private repository: CompetitorRepository;

  constructor() {
    this.repository = new CompetitorRepository();
  }

  /**
   * Creates a new competitor ensuring domain uniqueness logic if needed.
   */
  async createCompetitor(data: Prisma.CompetitorUncheckedCreateInput): Promise<Competitor> {
    // Business rule: ensure status is valid, or normalize domain.
    if (data.domain) {
      data.domain = data.domain.toLowerCase().trim();
    }
    
    // We can add logic to prevent duplicate competitor domains per org here in the future
    return this.repository.create(data);
  }

  /**
   * Gets a competitor by ID strictly isolated by organization.
   */
  async getCompetitorById(id: string, orgId: string): Promise<Competitor> {
    const competitor = await this.repository.findById(id, orgId);
    if (!competitor) {
      throw new Error("Competitor not found or access denied.");
    }
    return competitor;
  }

  /**
   * Lists all competitors for a given organization.
   */
  async listCompetitorsByOrganization(orgId: string): Promise<Competitor[]> {
    if (!orgId) {
      throw new Error("Organization ID is required.");
    }
    return this.repository.findAllByOrganization(orgId);
  }

  /**
   * Updates an existing competitor.
   */
  async updateCompetitor(id: string, orgId: string, data: Prisma.CompetitorUpdateInput): Promise<Competitor> {
    // Service validates existence/ownership via repository
    const existing = await this.repository.findById(id, orgId);
    if (!existing) {
      throw new Error("Competitor not found or access denied.");
    }

    if (typeof data.domain === 'string') {
      data.domain = data.domain.toLowerCase().trim();
    }

    return this.repository.update(id, orgId, data);
  }

  /**
   * Deletes a competitor.
   */
  async deleteCompetitor(id: string, orgId: string): Promise<void> {
    const existing = await this.repository.findById(id, orgId);
    if (!existing) {
      throw new Error("Competitor not found or access denied.");
    }

    await this.repository.delete(id, orgId);
  }
}
