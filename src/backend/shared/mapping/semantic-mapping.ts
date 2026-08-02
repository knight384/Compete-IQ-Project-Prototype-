export enum SemanticField {
  COMPETITOR_NAME = 'COMPETITOR_NAME',
  PRODUCT_NAME = 'PRODUCT_NAME',
  FEATURE_NAME = 'FEATURE_NAME',
  PRICE = 'PRICE',
  CURRENCY = 'CURRENCY',
  RATING = 'RATING',
  REVIEW_TEXT = 'REVIEW_TEXT',
  DATE = 'DATE',
  CATEGORY = 'CATEGORY',
  DESCRIPTION = 'DESCRIPTION',
  URL = 'URL',
  IGNORE = 'IGNORE',
}

export interface ColumnMapping {
  sourceColumn: string;
  semanticField: SemanticField;
}

export interface MappingSuggestion {
  sourceColumn: string;
  suggestedField: SemanticField | null;
  confidence: 'HIGH' | 'NONE';
}

export interface SemanticMappingDocument {
  version: number;
  columns: ColumnMapping[];
}

export function validateSemanticMappingDocument(doc: unknown): SemanticMappingDocument {
  if (!doc || typeof doc !== 'object') {
    throw new Error('Mapping document must be an object');
  }
  
  const d = doc as Record<string, unknown>;
  if (d.version !== 1) {
    throw new Error('Mapping document must have version 1');
  }
  
  if (!Array.isArray(d.columns)) {
    throw new Error('Mapping document must have a columns array');
  }

  for (const colObj of d.columns) {
    if (!colObj || typeof colObj !== 'object' || Array.isArray(colObj)) {
      throw new Error('Each column mapping must be an object');
    }
    const col = colObj as Record<string, unknown>;
    if (typeof col.sourceColumn !== 'string') {
      throw new Error('sourceColumn must be a string');
    }
    if (typeof col.semanticField !== 'string' || !Object.values(SemanticField).includes(col.semanticField as SemanticField)) {
      throw new Error(`Invalid semanticField: ${col.semanticField}`);
    }
  }

  return doc as SemanticMappingDocument;
}

export function suggestSemanticMappings(headers: string[]): MappingSuggestion[] {
  return headers.map(header => {
    const normalized = header.toLowerCase().trim().replace(/[\s-]/g, '_');
    let suggestedField: SemanticField | null = null;
    let confidence: 'HIGH' | 'NONE' = 'NONE';

    // COMPETITOR_NAME
    if (['competitor', 'competitor_name', 'vendor', 'vendor_name'].includes(normalized)) {
      suggestedField = SemanticField.COMPETITOR_NAME;
      confidence = 'HIGH';
    }
    // PRODUCT_NAME
    else if (['product', 'product_name', 'offering'].includes(normalized)) {
      suggestedField = SemanticField.PRODUCT_NAME;
      confidence = 'HIGH';
    }
    // FEATURE_NAME
    else if (['feature', 'feature_name', 'capability'].includes(normalized)) {
      suggestedField = SemanticField.FEATURE_NAME;
      confidence = 'HIGH';
    }
    // PRICE
    else if (['price', 'monthly_price', 'cost'].includes(normalized)) {
      suggestedField = SemanticField.PRICE;
      confidence = 'HIGH';
    }
    // CURRENCY
    else if (['currency'].includes(normalized)) {
      suggestedField = SemanticField.CURRENCY;
      confidence = 'HIGH';
    }
    // RATING
    else if (['rating', 'score', 'stars'].includes(normalized)) {
      suggestedField = SemanticField.RATING;
      confidence = 'HIGH';
    }
    // REVIEW_TEXT
    else if (['review', 'review_text', 'feedback', 'comment', 'comments'].includes(normalized)) {
      suggestedField = SemanticField.REVIEW_TEXT;
      confidence = 'HIGH';
    }
    // DATE
    else if (['date', 'date_posted', 'timestamp', 'created_at'].includes(normalized)) {
      suggestedField = SemanticField.DATE;
      confidence = 'HIGH';
    }
    // CATEGORY
    else if (['category', 'type', 'genre'].includes(normalized)) {
      suggestedField = SemanticField.CATEGORY;
      confidence = 'HIGH';
    }
    // DESCRIPTION
    else if (['description', 'desc', 'details'].includes(normalized)) {
      suggestedField = SemanticField.DESCRIPTION;
      confidence = 'HIGH';
    }
    // URL
    else if (['url', 'link', 'website'].includes(normalized)) {
      suggestedField = SemanticField.URL;
      confidence = 'HIGH';
    }

    return {
      sourceColumn: header,
      suggestedField,
      confidence
    };
  });
}
