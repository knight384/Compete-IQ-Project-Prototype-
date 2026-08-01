import { PrismaClient, Dataset, Prisma, DatasetStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class DatasetRepository {
  async create(data: Prisma.DatasetUncheckedCreateInput): Promise<Dataset> {
    return prisma.dataset.create({
      data,
    });
  }

  async findById(id: string, orgId: string): Promise<Dataset | null> {
    return prisma.dataset.findFirst({
      where: {
        id,
        orgId,
      },
    });
  }

  async findAllByOrganization(orgId: string): Promise<Dataset[]> {
    return prisma.dataset.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string, orgId: string): Promise<Dataset> {
    // Check existence and org isolation first
    const existing = await prisma.dataset.findFirst({
      where: { id, orgId },
    });
    if (!existing) {
      throw new Error('Dataset not found');
    }
    
    return prisma.dataset.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, orgId: string, status: DatasetStatus): Promise<Dataset> {
    const existing = await prisma.dataset.findFirst({
      where: { id, orgId },
    });
    if (!existing) {
      throw new Error('Dataset not found');
    }

    return prisma.dataset.update({
      where: { id },
      data: { status },
    });
  }
}

export const datasetRepository = new DatasetRepository();
