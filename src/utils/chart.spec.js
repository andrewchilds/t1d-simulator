import assert from 'assert';
import { scaleLinear } from './chart.js';

describe('chart.js', () => {
  describe('scaleLinear', () => {

    it('scales a number using an input and output scale', () => {
      assert.equal(scaleLinear(100, [0, 200], [200, 0]), 100);
      assert.equal(scaleLinear(100, [0, 200], [0, 200]), 100);

      assert.equal(scaleLinear(25, [0, 100], [200, 0]), 150);
      assert.equal(scaleLinear(25, [0, 100], [0, 200]), 50);

      assert.equal(scaleLinear(0, [0, 200], [0, 100]), 0);
      assert.equal(scaleLinear(100, [0, 100], [0, 999]), 999);
      assert.equal(scaleLinear(100, [0, 100], [500, 999]), 999);
      assert.equal(scaleLinear(50, [0, 100], [0, 100]), 50);

      assert.equal(scaleLinear(-50, [-100, 100], [0, 400]), 100);
      assert.equal(scaleLinear(-50, [-100, 100], [400, 0]), 300);

      assert.equal(scaleLinear(-10, [-100, 100], [-50, 50]), -5);
      assert.equal(scaleLinear(-10, [-100, 100], [50, -50]), 5);
    });
  });
});
