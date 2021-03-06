const assert = require('assert');
const twoByTwo = require('../2x2.js');

// TODO: Add/improve tests
describe('2x2', function () {
  describe('#getMatrix()', function () {
    it('returns empty matrix when there is no match for the given regex ', async function () {
      const logLines = [
        'void com.should.be.ignored.X.method(param1,param2) executed in 50ms',
        'void com.should.be.ignored.X.method(param1,param2) executed in 50ms',
        'void com.should.be.ignored.X.method(param1,param2) executed in 50ms',
      ];

      const expected = {
        centroid: {},
        q1: [],
        q2: [],
        q3: [],
        q4: []
      };;
      const actual = await twoByTwo.getMatrix(logLines, 'org');
      assert.deepEqual(actual, expected);
    });

    it('returns matrix with components in q2 and q3', async function () {
      const logLines = [
        'void org.should.be.considered.One.method(param1,param2) executed in 3ms',
        'void org.should.be.considered.Two.method(param1,param2) executed in 1ms',
        'void org.should.be.considered.Two.method(param1,param2) executed in 1ms',
        'void com.should.be.ignored.X.method(param1,param2) executed in 50ms'
      ];

      const expected = {
        centroid: {
          hitsRank: 1,
          millisRank: 1
        },
        q1: [],
        q2: [
          {
            hits: 2,
            hitsRank: 1,
            key: 'org.should.be.considered.Two.method(param1,param2)',
            millis: 1,
            millisRank: 2,
            quadrant: 'q2'
          }
        ],
        q3: [],
        q4: [
          {
            hits: 1,
            hitsRank: 2,
            key: 'org.should.be.considered.One.method(param1,param2)',
            millis: 3,
            millisRank: 1,
            quadrant: 'q4'
          }
        ]
      };
      const actual = await twoByTwo.getMatrix(logLines, 'org');
      assert.deepEqual(actual, expected);
    });

    it('returns matrix with components in q1 and q3', async function () {
      const logLines = [
        'List org.should.be.considered.One.method(param1,param2) executed in 1ms',
        'List org.should.be.considered.Two.method(param1,param2) executed in 3ms',
        'List org.should.be.considered.Two.method(param1,param2) executed in 3ms',
        'Integer org.should.be.considered.Three.method(param1) executed in 6ms',
        'Integer org.should.be.considered.Three.method(param1) executed in 7ms',
        'Integer org.should.be.considered.Three.method(param1) executed in 8ms',
        'List com.should.be.ignored.X.method(param1,param2) executed in 50ms'
      ];

      const expected = {
        centroid: {
          hitsRank: 2,
          millisRank: 2
        },
        q1: [
          {
            hits: 3,
            hitsRank: 1,
            key: 'org.should.be.considered.Three.method(param1)',
            millis: 7,
            millisRank: 1,
            quadrant: 'q1'
          },
          {
            hits: 2,
            hitsRank: 2,
            key: 'org.should.be.considered.Two.method(param1,param2)',
            millis: 3,
            millisRank: 2,
            quadrant: 'q1'
          }
        ],
        q2: [],
        q3: [
          {
            hits: 1,
            hitsRank: 3,
            key: 'org.should.be.considered.One.method(param1,param2)',
            millis: 1,
            millisRank: 3,
            quadrant: 'q3',
          }
        ],
        q4: []
      };
      const actual = await twoByTwo.getMatrix(logLines, 'org');
      assert.deepEqual(actual, expected);
    });

    it('returns matrix with components in q1, q2, q3 and q4', async function () {
      const logLines = [
        'void org.should.be.considered.One.method(param1) executed in 3ms',
        'List org.should.be.considered.Two.method(param1) executed in 4ms',
        'List org.should.be.considered.Two.method(param1) executed in 5ms',
        'Integer org.should.be.considered.Three.method(param1) executed in 2ms',
        'Integer org.should.be.considered.Three.method(param1) executed in 1ms',
        'Integer org.should.be.considered.Three.method(param1) executed in 2ms',
        'void org.should.be.considered.Four.method(param1) executed in 5ms',
        'void org.should.be.considered.Four.method(param1) executed in 5ms',
        'void org.should.be.considered.Four.method(param1) executed in 5ms',
        'void org.should.be.considered.Four.method(param1) executed in 5ms',
        'List com.should.be.ignored.X.method(param1) executed in 50ms',
        'void net.should.be.ignored.Y.method(param1) executed in 60ms'
      ];

      const expected = {
        centroid: {
          hitsRank: 2,
          millisRank: 2
        },
        q1: [
          {
            key: 'org.should.be.considered.Four.method(param1)',
            hits: 4,
            millis: 5,
            hitsRank: 1,
            millisRank: 1,
            quadrant: 'q1'
          }
        ],
        q2: [
          {
            key: 'org.should.be.considered.Three.method(param1)',
            hits: 3,
            millis: 1.6666666666666667,
            hitsRank: 2,
            millisRank: 4,
            quadrant: 'q2'
          }
        ],
        q3: [
          {
            key: 'org.should.be.considered.One.method(param1)',
            hits: 1,
            millis: 3,
            hitsRank: 4,
            millisRank: 3,
            quadrant: 'q3'
          }
        ],
        q4: [
          {
            key: 'org.should.be.considered.Two.method(param1)',
            hits: 2,
            millis: 4.5,
            hitsRank: 3,
            millisRank: 2,
            quadrant: 'q4'
          }
        ]
      };
      const actual = await twoByTwo.getMatrix(logLines, 'org');
      assert.deepEqual(actual, expected);
    });

    it('returns matrix with components in q1 - all with same ranking for hits and millis', async function () {
      const logLines = [
        'void org.should.be.considered.One.method(param1,param2) executed in 3ms',
        'void org.should.be.considered.One.method(param1,param2) executed in 3ms',
        'void org.should.be.considered.Two.method(param1,param2) executed in 3ms',
        'void org.should.be.considered.Two.method(param1,param2) executed in 3ms'
      ];

      const expected = {
        centroid: {
          hitsRank: 1,
          millisRank: 1
        },
        q1: [
          {
            hits: 2,
            hitsRank: 1,
            key: 'org.should.be.considered.One.method(param1,param2)',
            millis: 3,
            millisRank: 1,
            quadrant: 'q1'
          },
          {
            hits: 2,
            hitsRank: 1,
            key: 'org.should.be.considered.Two.method(param1,param2)',
            millis: 3,
            millisRank: 1,
            quadrant: 'q1'
          }
        ],
        q2: [],
        q3: [],
        q4: []
      };
      const actual = await twoByTwo.getMatrix(logLines, 'org');
      assert.deepEqual(actual, expected);
    });
  });
});
