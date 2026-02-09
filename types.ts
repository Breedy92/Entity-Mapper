
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

export interface EntityNode {
  id: string;
  type: EntityType;
  name: string;
  description: string;
  x: number;
  y: number;
  metadata?: Record<string, any>;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label?: string;
  metadata?: {
    shares?: string;
    [key: string]: any;
  };
}

export interface MapData {
  nodes: EntityNode[];
  edges: Relationship[];
}
