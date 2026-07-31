import { Prisma, Competitor } from "@prisma/client";
import { prisma } from "../../prisma/client";

export class CompetitorRepository {
  /**
   * Creates a new competitor.
   */
  async create(data: Prisma.CompetitorUncheckedCreateInput): Promise<Competitor> {
    return prisma.competitor.create({
      data,
    });
  }

  /**
   * Finds a competitor by ID, strictly scoped to an organization.
   */
  async findById(id: string, orgId: string): Promise<Competitor | null> {
    return prisma.competitor.findFirst({
      where: {
        id,
        orgId,
      },
    });
  }

  /**
   * Retrieves all competitors for an organization.
   */
  async findAllByOrganization(orgId: string): Promise<Competitor[]> {
    return prisma.competitor.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Updates a competitor, strictly scoped to an organization.
   */
  async update(id: string, orgId: string, data: Prisma.CompetitorUpdateInput): Promise<Competitor> {
    // We use findFirst + update or an updateMany approach. 
    // Prisma's update() requires a unique identifier, and compound unique (id, orgId) isn't defined, 
    // so we can use updateMany and then return the updated record, or just assume the service 
    // already verified existence/authorization and use a direct update, but the prompt says 
    // "Apply orgId filtering where appropriate".
    // We will do a two-step check or updateMany, but updateMany doesn't return the record.
    // Let's do a direct update with a where clause using id (since id is unique), but we should ensure the orgId matches.
    // We can rely on the service to have called findById(id, orgId) first to verify, OR we can use the Prisma extension or just do:
    
    // To strictly enforce orgId at the DB layer during update:
    const competitor = await prisma.competitor.findFirst({
      where: { id, orgId },
    });

    if (!competitor) {
      throw new Error("Competitor not found or access denied");
    }

    return prisma.competitor.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a competitor, strictly scoped to an organization.
   */
  async delete(id: string, orgId: string): Promise<void> {
    const competitor = await prisma.competitor.findFirst({
      where: { id, orgId },
    });

    if (!competitor) {
      throw new Error("Competitor not found or access denied");
    }

    await prisma.competitor.delete({
      where: { id },
    });
  }
}
