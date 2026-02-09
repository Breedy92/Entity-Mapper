
import { MapData, SalesforcePayload, EntityType, RelationshipType, EntityNode, Relationship } from '../types';

/**
 * Transforms a Salesforce API response into Mapper Pro compatible data.
 */
export const transformSalesforceData = (sfData: SalesforcePayload): MapData => {
  const nodes: EntityNode[] = sfData.records.map((rec, idx) => ({
    id: rec.sfId, // Use SF ID as the primary key
    sfId: rec.sfId,
    name: rec.name,
    description: rec.summary,
    // Map SF RecordType to our EntityType
    type: Object.values(EntityType).find(t => t.toLowerCase() === rec.mappedType.toLowerCase()) || EntityType.COMPANY,
    // Automatic layout: Circular or Grid spread
    x: 400 + Math.cos(idx * 0.8) * 350,
    y: 400 + Math.sin(idx * 0.8) * 350,
    metadata: rec.attributes
  }));

  const edges: Relationship[] = sfData.relationships.map(rel => ({
    id: rel.sfId,
    sfId: rel.sfId,
    sourceId: rel.fromId,
    targetId: rel.toId,
    // Map SF Role picklist to our RelationshipType
    type: Object.values(RelationshipType).find(t => t.toLowerCase() === rel.role.toLowerCase()) || RelationshipType.SHAREHOLDER
  }));

  return { nodes, edges };
};

/**
 * Mock data simulating a response from a Salesforce Apex REST endpoint
 */
export const MOCK_SALESFORCE_RESPONSE: SalesforcePayload = {
  records: [
    { sfId: 'SF-ACC-001', name: 'Global Tech Holdings', category: 'Account', mappedType: 'Company', summary: 'Global parent entity registered in Delaware.' },
    { sfId: 'SF-CON-001', name: 'Sarah Jenkins', category: 'Contact', mappedType: 'Individual', summary: 'CFO & Majority Shareholder.' },
    { sfId: 'SF-ACC-002', name: 'Jenkins Family Trust', category: 'Account', mappedType: 'Trust', summary: 'Asset protection vehicle for the Jenkins family.' },
  ],
  relationships: [
    { sfId: 'SF-REL-001', fromId: 'SF-CON-001', toId: 'SF-ACC-001', role: 'Director of' },
    { sfId: 'SF-REL-002', fromId: 'SF-CON-001', toId: 'SF-ACC-001', role: 'Shareholder of' },
    { sfId: 'SF-REL-003', fromId: 'SF-ACC-001', toId: 'SF-ACC-002', role: 'Trustee of' },
  ]
};
