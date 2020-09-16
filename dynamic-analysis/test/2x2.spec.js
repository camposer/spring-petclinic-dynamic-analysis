const assert = require('assert');

// TODO: Include more tests, specially for complex functions
describe('2x2', function () {
  describe('#getHighHitsHighMillis()', function () {
    it('returns empty list when there is no match for the given regex ', async function () {
      const matrix = getMatrix([
        'void com.should.be.ignored.RepositoryX.method(param1,param2) executed in 50ms',
        'void com.should.be.ignored.RepositoryX.method(param1,param2) executed in 50ms',
        'void com.should.be.ignored.RepositoryX.method(param1,param2) executed in 50ms',
      ]);

      const expected = [];
      const actual = await matrix.getHighHitsHighMillis('', 'org');
      assert.deepEqual(actual, expected);
    });

    it('returns empty list when there is no match for hits and millis', async function () {
      const matrix = getMatrix([
        'void org.should.be.considered.RepositoryOne.method(param1,param2) executed in 3ms',
        'void org.should.be.considered.RepositoryTwo.method(param1,param2) executed in 1ms',
        'void org.should.be.considered.RepositoryTwo.method(param1,param2) executed in 1ms',
        'void com.should.be.ignored.RepositoryX.method(param1,param2) executed in 50ms'
      ]);

      const expected = [];
      const actual = await matrix.getHighHitsHighMillis('', 'org');
      assert.deepEqual(actual, expected);
    });

    it('returns matches list with one match when there is a match for hits and millis', async function () {
      const matrix = getMatrix([
        'List org.should.be.considered.RepositoryOne.method(param1,param2) executed in 1ms',
        'List org.should.be.considered.RepositoryTwo.method(param1,param2) executed in 3ms',
        'List org.should.be.considered.RepositoryTwo.method(param1,param2) executed in 3ms',
        'List com.should.be.ignored.RepositoryX.method(param1,param2) executed in 50ms'
      ]);

      const expected = [
        {
          hits: 2,
          key: 'org.should.be.considered.RepositoryTwo.method(param1,param2)',
          millis: 3,
          rankHits: 1,
          rankMillis: 1,
        }
      ];
      const actual = await matrix.getHighHitsHighMillis('', 'org');
      assert.deepEqual(actual, expected);
    });

    it('returns matches list when there is a match for hits and millis (multiple)', async function () {
      const matrix = getMatrix([
        'void org.should.be.considered.RepositoryOne.method(param1) executed in 3ms',
        'List org.should.be.considered.RepositoryTwo.method(param1) executed in 4ms',
        'List org.should.be.considered.RepositoryTwo.method(param1) executed in 5ms',
        'Integer org.should.be.considered.RepositoryThree.method(param1) executed in 6ms',
        'Integer org.should.be.considered.RepositoryThree.method(param1) executed in 7ms',
        'Integer org.should.be.considered.RepositoryThree.method(param1) executed in 8ms',
        'void org.should.be.considered.RepositoryFour.method(param1) executed in 5ms',
        'void org.should.be.considered.RepositoryFour.method(param1) executed in 5ms',
        'void org.should.be.considered.RepositoryFour.method(param1) executed in 5ms',
        'void org.should.be.considered.RepositoryFour.method(param1) executed in 5ms',
        'List com.should.be.ignored.RepositoryX.method(param1) executed in 50ms',
        'void net.should.be.ignored.RepositoryY.method(param1) executed in 60ms'
      ]);

      const expected = [
        {
          hits: 4,
          key: 'org.should.be.considered.RepositoryFour.method(param1)',
          millis: 5,
          rankHits: 1,
          rankMillis: 2,
        },
        {
          hits: 3,
          key: 'org.should.be.considered.RepositoryThree.method(param1)',
          millis: 7,
          rankHits: 2,
          rankMillis: 1,
        }
      ];
      const actual = await matrix.getHighHitsHighMillis('', 'org');
      assert.deepEqual(actual, expected);
    });
  });
});

function getMatrix(lines) {
  const matrix = require('../2x2.js');
  matrix.setFs({
    createReadStream: function () {
      return {};
    }
  });
  matrix.setReadline({
    createInterface: function () {
      return lines;
    }
  });
  return matrix;
}
