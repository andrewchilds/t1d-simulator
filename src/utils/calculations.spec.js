import assert from 'assert';
import { slowDownIAlreadyfHypo } from './calculations.js';
import { oneDecimal } from './numbers.js';

describe('slowDownIAlreadyfHypo', () => {
  it('should not dampen positive BG changes', () => {
    const result = slowDownIAlreadyfHypo(5, 40);
    assert.equal(result, 5);
  });

  it('should not dampen when BG is in safe range', () => {
    const result = slowDownIAlreadyfHypo(-5, 90);
    assert.equal(result, -5);
  });

  const tests = [
    { bgEffect: -10, currentBg: 55, expected: -10 },
    { bgEffect: -10, currentBg: 50, expected: -7.3 },
    { bgEffect: -10, currentBg: 45, expected: -5.1 },
    { bgEffect: -10, currentBg: 40, expected: -3.3 },
    { bgEffect: -10, currentBg: 35, expected: -1.8 },
    { bgEffect: -10, currentBg: 30, expected: -0.8 },
    { bgEffect: -10, currentBg: 25, expected: -0.2 },
    { bgEffect: -10, currentBg: 20, expected: 0 },
  ];

  tests.forEach(({ bgEffect, currentBg, expected }) => {
    it(`it should dampen ${bgEffect} to ${expected} when BG is ${currentBg}`, () => {
      const result = slowDownIAlreadyfHypo(bgEffect, currentBg);
      assert.equal(oneDecimal(result), expected);
    });
  });
});
