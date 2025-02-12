import assert from 'assert';
import { roundToBasalPrecision } from './numbers.js';

describe('numbers', () => {
  describe('roundToBasalPrecision', () => {
    it('rounds down to the closest 0.05', () => {
      assert.equal(roundToBasalPrecision(1.075), 1.05);
      assert.equal(roundToBasalPrecision(0.7625000000000001), 0.75);
    });
  });
});
