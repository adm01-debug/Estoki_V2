import { describe, it, expect } from 'vitest';
import { parseNFXML, extractNFData } from './parseNFXML';

describe('parseNFXML', () => {
  describe('parseNFXML', () => {
    it('should parse valid XML', () => {
      const xml = '<nfe><infNFe><ide><nNF>123</nNF></ide></infNFe></nfe>';
      const result = parseNFXML(xml);
      expect(result).toBeDefined();
    });
  });
});
