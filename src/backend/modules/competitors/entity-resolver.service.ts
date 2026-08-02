import { CompetitorRepository } from './competitor.repository';
import { ProductRepository } from '../products/product.repository';
import { normalizeEntityName, normalizeDomain } from '../../shared/utils/normalize-entity';

export type MatchStrategy = 'EXACT_NAME' | 'EXACT_DOMAIN';
export type ResolutionStatus = 'RESOLVED' | 'UNRESOLVED' | 'AMBIGUOUS';

export interface ResolveCompetitorRequest {
  orgId: string;
  mention: string;
}

export interface CompetitorResolutionResult {
  status: ResolutionStatus;
  competitorId: string | null;
  matchStrategy: MatchStrategy | null;
  candidateCount: number;
}

export interface ResolveProductRequest {
  orgId: string;
  mention: string;
  competitorId?: string;
}

export interface ProductResolutionResult {
  status: ResolutionStatus;
  productId: string | null;
  competitorId: string | null;
  matchStrategy: MatchStrategy | null;
  candidateCount: number;
}

export class EntityResolverService {
  constructor(
    private competitorRepository: CompetitorRepository = new CompetitorRepository(),
    private productRepository: ProductRepository = new ProductRepository()
  ) {}

  /**
   * Resolves a competitor mention using deterministic two-pass resolution scoped strictly to orgId.
   * Pass 1: Exact normalized name match
   * Pass 2: Exact normalized domain match (only if Pass 1 returned 0 candidates)
   */
  async resolveCompetitor(request: ResolveCompetitorRequest): Promise<CompetitorResolutionResult> {
    const { orgId, mention } = request;

    if (!orgId || !orgId.trim() || !mention || !mention.trim()) {
      return {
        status: 'UNRESOLVED',
        competitorId: null,
        matchStrategy: null,
        candidateCount: 0,
      };
    }

    const normName = normalizeEntityName(mention);
    const normDomain = normalizeDomain(mention);

    if (!normName) {
      return {
        status: 'UNRESOLVED',
        competitorId: null,
        matchStrategy: null,
        candidateCount: 0,
      };
    }

    // Fetch all competitors belonging strictly to orgId
    const competitors = await this.competitorRepository.findAllByOrganization(orgId);

    // Pass 1: Name Resolution
    const nameMatches = competitors.filter(
      (c) => normalizeEntityName(c.name) === normName
    );

    if (nameMatches.length === 1) {
      return {
        status: 'RESOLVED',
        competitorId: nameMatches[0].id,
        matchStrategy: 'EXACT_NAME',
        candidateCount: 1,
      };
    }

    if (nameMatches.length >= 2) {
      return {
        status: 'AMBIGUOUS',
        competitorId: null,
        matchStrategy: null,
        candidateCount: nameMatches.length,
      };
    }

    // Pass 2: Domain Resolution (only if 0 name matches and domain is valid)
    if (normDomain !== '') {
      const domainMatches = competitors.filter(
        (c) => c.domain && normalizeDomain(c.domain) === normDomain
      );

      if (domainMatches.length === 1) {
        return {
          status: 'RESOLVED',
          competitorId: domainMatches[0].id,
          matchStrategy: 'EXACT_DOMAIN',
          candidateCount: 1,
        };
      }

      if (domainMatches.length >= 2) {
        return {
          status: 'AMBIGUOUS',
          competitorId: null,
          matchStrategy: null,
          candidateCount: domainMatches.length,
        };
      }
    }

    return {
      status: 'UNRESOLVED',
      competitorId: null,
      matchStrategy: null,
      candidateCount: 0,
    };
  }

  /**
   * Resolves a product mention scoped strictly to orgId (and optional competitorId context).
   */
  async resolveProduct(request: ResolveProductRequest): Promise<ProductResolutionResult> {
    const { orgId, mention, competitorId } = request;

    if (!orgId || !orgId.trim() || !mention || !mention.trim()) {
      return {
        status: 'UNRESOLVED',
        productId: null,
        competitorId: null,
        matchStrategy: null,
        candidateCount: 0,
      };
    }

    const normName = normalizeEntityName(mention);
    if (!normName) {
      return {
        status: 'UNRESOLVED',
        productId: null,
        competitorId: null,
        matchStrategy: null,
        candidateCount: 0,
      };
    }

    let candidateProducts: Array<{ id: string; name: string; competitorId: string }> = [];

    if (competitorId) {
      // Verify competitor belongs strictly to orgId
      const competitor = await this.competitorRepository.findById(competitorId, orgId);
      if (!competitor) {
        // Competitor does not exist or belongs to another org -> Fail closed
        return {
          status: 'UNRESOLVED',
          productId: null,
          competitorId: null,
          matchStrategy: null,
          candidateCount: 0,
        };
      }

      candidateProducts = await this.productRepository.findByCompetitor(competitorId);
    } else {
      // Query all products belonging to competitors owned by orgId
      candidateProducts = await this.productRepository.findAllByOrganization(orgId);
    }

    const productMatches = candidateProducts.filter(
      (p) => normalizeEntityName(p.name) === normName
    );

    if (productMatches.length === 1) {
      return {
        status: 'RESOLVED',
        productId: productMatches[0].id,
        competitorId: productMatches[0].competitorId,
        matchStrategy: 'EXACT_NAME',
        candidateCount: 1,
      };
    }

    if (productMatches.length >= 2) {
      return {
        status: 'AMBIGUOUS',
        productId: null,
        competitorId: null,
        matchStrategy: null,
        candidateCount: productMatches.length,
      };
    }

    return {
      status: 'UNRESOLVED',
      productId: null,
      competitorId: null,
      matchStrategy: null,
      candidateCount: 0,
    };
  }
}

export const entityResolverService = new EntityResolverService();
