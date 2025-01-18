'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.extractSingleWorkload = exports.decodeUR = void 0;
const utils_1 = require('./utils');
const miniCbor_1 = require('./miniCbor');
const bc_bech32_1 = require('bc-bech32');
const checkAndGetSequence = function (sequence) {
  const pieces = sequence.toUpperCase().split('OF');
  if (pieces.length !== 2) throw new Error('invalid sequence: ' + sequence);
  const index = pieces[0];
  const total = pieces[1];
  return [+index, +total];
};
const checkDigest = function (digest, payload) {
  if (bc_bech32_1.decodeBc32Data(digest) !== utils_1.sha256Hash(Buffer.from(bc_bech32_1.decodeBc32Data(payload), 'hex')).toString('hex')) {
    throw new Error('invalid digest: \n digest:' + digest + ' \n payload:' + payload);
  }
};
const checkURHeader = function (UR, type) {
  if (type === void 0) {
    type = 'bytes';
  }
  if (UR.toUpperCase() !== ('ur:' + type).toUpperCase()) throw new Error('invalid UR header: ' + UR);
};
const dealWithSingleWorkload = function (workload, type) {
  if (type === void 0) {
    type = 'bytes';
  }
  const pieces = workload.split('/');
  switch (pieces.length) {
    case 2: {
      // UR:Type/[Fragment]
      checkURHeader(pieces[0], type);
      return pieces[1];
    }
    case 3: {
      // UR:Type/[Digest]/[Fragment] when Sequencing is omitted, Digest MAY be omitted;
      // should check digest
      checkURHeader(pieces[0], type);
      var digest = pieces[1];
      var fragment = pieces[2];
      checkDigest(digest, fragment);
      return fragment;
    }
    case 4: {
      // UR:Type/[Sequencing]/[Digest]/[Fragment]
      // should check sequencing and digest
      checkURHeader(pieces[0], type);
      checkAndGetSequence(pieces[1]);
      var digest = pieces[2];
      var fragment = pieces[3];
      checkDigest(digest, fragment);
      return fragment;
    }
    default:
      throw new Error('invalid workload pieces length: expect 2 / 3 / 4 bug got ' + pieces.length);
  }
};
const dealWithMultipleWorkloads = function (workloads, type) {
  if (type === void 0) {
    type = 'bytes';
  }
  const length = workloads.length;
  const fragments = new Array(length).fill('');
  let digest = '';
  workloads.forEach(function (workload) {
    const pieces = workload.split('/');
    checkURHeader(pieces[0], type);
    const _a = checkAndGetSequence(pieces[1]);
    const index = _a[0];
    const total = _a[1];
    if (total !== length) throw new Error('invalid workload: ' + workload + ', total ' + total + ' not equal workloads length ' + length);
    if (digest && digest !== pieces[2])
      throw new Error('invalid workload: ' + workload + ', checksum changed ' + digest + ', ' + pieces[2]);
    digest = pieces[2];
    if (fragments[index - 1]) throw new Error('invalid workload: ' + workload + ', index ' + index + ' has already been set');
    fragments[index - 1] = pieces[3];
  });
  const payload = fragments.join('');
  checkDigest(digest, payload);
  return payload;
};
const getBC32Payload = function (workloads, type) {
  if (type === void 0) {
    type = 'bytes';
  }
  try {
    const length_1 = workloads.length;
    if (length_1 === 1) {
      return dealWithSingleWorkload(workloads[0], type);
    } else {
      return dealWithMultipleWorkloads(workloads, type);
    }
  } catch (e) {
    throw new Error('invalid workloads: ' + workloads + '\n ' + e);
  }
};
exports.decodeUR = function (workloads, type) {
  if (type === void 0) {
    type = 'bytes';
  }
  const bc32Payload = getBC32Payload(workloads, type);
  const cborPayload = bc_bech32_1.decodeBc32Data(bc32Payload);
  return miniCbor_1.decodeSimpleCBOR(cborPayload);
};
exports.extractSingleWorkload = function (workload) {
  const pieces = workload.toUpperCase().split('/');
  switch (pieces.length) {
    case 2: // UR:Type/[Fragment]
    case 3: {
      // UR:Type/[Digest]/[Fragment] when Sequencing is omitted, Digest MAY be omitted;
      return [1, 1];
    }
    case 4: {
      // UR:Type/[Sequencing]/[Digest]/[Fragment]
      return checkAndGetSequence(pieces[1]);
    }
    default:
      throw new Error('invalid workload pieces length: expect 2 / 3 / 4 bug got ' + pieces.length);
  }
};
// # sourceMappingURL=decodeUR.js.map
