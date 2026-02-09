
export enum EntityType {
  INDIVIDUAL = 'Individual',
  COMPANY = 'Company',
  TRUST = 'Trust',
  SMSF = 'SMSF',
  PARTNERSHIP = 'Partnership'
}

export enum RelationshipType {
  APPOINTER = 'Appointer of',
  BENEFICIARY = 'Beneficiary of',
  PARTNER = 'Partner of',
  SETTLOR = 'Settlor of',
  SHAREHOLDER = 'Shareholder of',
  TRUSTEE = 'Trustee of',
  DIRECTOR = 'Director of',
  SECRETARY = 'Secretary of',
  MEMBER = 'Member of'
}

// Fix: Added optional sfId for Salesforce integration
export interface EntityNode {
  id: string;
  sfId?: string;
  type: EntityType;
  name: string;
  description: string;
  x: number;
  y: number;
  metadata?: Record<string, any>;
}

// Fix: Added optional sfId for Salesforce integration
export interface Relationship {
  id: string;
  sfId?: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label?: string;
}

export interface MapData {
  nodes: EntityNode[];
  edges: Relationship[];
}

/**
 * Fix: Added Salesforce-specific types to support the salesforceAdapter
 */
export interface SalesforceRecord {
  sfId: string;
  name: string;
  category: string;
  mappedType: string;
  summary: string;
  attributes?: Record<string, any>;
}

/**
 * Fix: Added Salesforce-specific types to support the salesforceAdapter
 */
export interface SalesforceRelationship {
  sfId: string;
  fromId: string;
  toId: string;
  role: string;
}

/**
 * Fix: Added Salesforce-specific types to support the salesforceAdapter
 */
export interface SalesforcePayload {
  records: SalesforceRecord[];
  relationships: SalesforceRelationship[];
}
