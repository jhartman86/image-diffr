'use strict';

const path    = require('path');
const sinon   = require('sinon');
const nock    = require('nock');
const expect  = require('chai').expect;
const diff    = require('../lib');
const Jimp    = require('jimp');

/**
 * Things that are implicitly tested just because of how we use the
 * the diff module in these tests:
 *    - diff.exec() returns a promise instance
 */
describe('diff.exec', function () {
  const jupiter1    = path.resolve(__dirname, './fixtures/jupiter1.jpg');
  const jupiter2    = path.resolve(__dirname, './fixtures/jupiter2.jpg');
  const glasses1    = path.resolve(__dirname, './fixtures/glasses1.png');
  const glasses2    = path.resolve(__dirname, './fixtures/glasses2.png');
  const glassesDiff = path.resolve(__dirname, './fixtures/glassesDiff.png');
  const randomPng   = path.resolve(__dirname, './fixtures/random.png');
  this.timeout(5000);

  context('with invalid inputs', function () {
    it('should fail with invalid first image path', done => {
      diff
        .exec('./invalid/for/shizzle', jupiter2)
        .catch(err => {
          expect(err).to.be.an('Error');
          done();
        });
    });

    it('should fail with invalid second image path', done => {
      diff
        .exec(jupiter1, './invalid/for/shizzle')
        .catch(err => {
          expect(err).to.be.an('Error');
          done();
        });
    });

    it('should fail with different MIME types', done => {
      diff
        .exec(jupiter1, glasses1)
        .catch(err => {
          expect(err).to.be.an('Error');
          expect(err.message).to.include('MIME types must match');
          done();
        });
    });

    it('should fail with different dimensions', done => {
      diff
        .exec(glasses1, randomPng)
        .catch(err => {
          expect(err).to.be.an('Error');
          expect(err.message).to.include('widths must match');
          done();
        });
    });

    it('should resolve returned promise with Jimp.Image shape', done => {
      diff.exec(jupiter1, jupiter2).then(diff => {
        expect(diff).to.have.property('percent');
        expect(diff).to.have.property('image');
        expect(diff.image).to.have.property('bitmap');
        expect(diff.image.bitmap).to.have.property('data');
        expect(diff.image.bitmap).to.have.property('width');
        expect(diff.image.bitmap).to.have.property('height');
        done();
      }).catch(done);
    });
  });

  /**
   * Test comparing images on the file system.
   */
  context('when comparing images on file system', function () {
    it('should be equal (diff % = 0)', done => {
      diff.exec(jupiter1, jupiter1).then(diff => {
        expect(diff.percent).to.equal(0);
        done();
      }).catch(done);
    });

    it('should not be equal (diff % = 0.011445746527777778)', done => {
      diff.exec(jupiter1, jupiter2).then(diff => {
        expect(diff.percent).to.equal(0.011445746527777778);
        done();
      }).catch(done);
    });

    it('with threshold 0.25 should be (diff % = 0.008577256944444445)', done => { // eslint-disable-line
      diff.exec(jupiter1, jupiter2, {threshold:0.25}).then(diff => {
        expect(diff.percent).to.equal(0.008577256944444445);
        done();
      }).catch(done);
    });

    it('should generate consistent diff image', done => {
      diff.exec(glasses1, glasses2).then(diff => {
        Jimp.read(glassesDiff, (err, diffFixture) => {
          if (err) { return done(err); }
          expect(
            Buffer.compare(diff.image.bitmap.data, diffFixture.bitmap.data)
          ).to.equal(0);
          done();
        });
      }).catch(done);
    });
  });

  /**
   * Ensure when 'output' (a string) is passed to options that
   * it tries to write the diff file. This is the reason we export
   * the getDiffImage function, so we can stub it out here.
   */
  context('when writing diff file output', function () {
    const writes = [];
    let stub;

    before(() => {
      stub = sinon.stub(diff, 'getDiffImage').callsFake(() => {
        return {
          image: {
            write(path) {
              writes.push(path);
            }
          }
        };
      });
    });

    after(() => { stub.restore(); });

    it('should invoke .write() method on diff.image', done => {
      const output = './image-diff-test.png';
      diff
        .exec(glasses1, glasses2, {output})
        .then(() => {
          expect(stub.callCount).to.equal(1);
          expect(writes.length).to.equal(1);
          expect(writes[0]).to.equal(path.resolve(output));
          done();
        })
        .catch(done);
    });
  });

  /**
   * Test that we can compare images from:
   *   - network to network
   *   - network to local
   */
  context('when comparing images via network', function () {
    let scope;
    const mockDomain = 'http://image-diffr.com';

    function getUrl(resource) {
      return mockDomain + resource;
    }

    beforeEach(() => {
      if (scope && scope.cleanAll) { scope.cleanAll(); }
      scope = nock(mockDomain)
        .get('/glasses1.png').replyWithFile(200, glasses1)
        .get('/glasses2.png').replyWithFile(200, glasses2);
    });

    afterEach(() => {
      if (scope && scope.cleanAll) { scope.cleanAll(); }
    });

    it('should diff network result to network result', done => {
      diff.exec(getUrl('/glasses1.png'), getUrl('/glasses2.png')).then(diff => {
        expect(diff.percent).to.equal(0.1570587158203125);
        done();
      }).catch(done);
    });

    it('should diff network result to file system', done => {
      diff.exec(getUrl('/glasses1.png'), glasses1).then(diff => {
        expect(diff.percent).to.equal(0);
        done();
      }).catch(done);
    });
  });

});