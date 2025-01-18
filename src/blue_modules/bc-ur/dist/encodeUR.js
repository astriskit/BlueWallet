'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.encodeUR = void 0;
const miniCbor_1 = require('./miniCbor');
const bc_bech32_1 = require('bc-bech32');
const utils_1 = require('./utils');
const composeUR = function (payload, type) {
  if (type === void 0) {
    type = 'bytes';
  }
  return 'ur:' + type + '/' + payload;
};
const composeDigest = function (payload, digest) {
  return digest + '/' + payload;
};
const composeSequencing = function (payload, index, total) {
  return index + 1 + 'of' + total + '/' + payload;
};
const composeHeadersToFragments = function (fragments, digest, type) {
  if (type === void 0) {
    type = 'bytes';
  }
  if (fragments.length === 1) {
    return [composeUR(fragments[0])];
  } else {
    return fragments.map(function (f, index) {
      return utils_1.compose3(
        function (payload) {
          return composeUR(payload, type);
        },
        function (payload) {
          return composeSequencing(payload, index, fragments.length);
        },
        function (payload) {
          return composeDigest(payload, digest);
        },
      )(f);
    });
  }
};
exports.encodeUR = function (payload, fragmentCapacity) {
  if (fragmentCapacity === void 0) {
    fragmentCapacity = 200;
  }
  const cborPayload = miniCbor_1.encodeSimpleCBOR(payload);
  const bc32Payload = bc_bech32_1.encodeBc32Data(cborPayload);
  const digest = utils_1.sha256Hash(Buffer.from(cborPayload, 'hex')).toString('hex');
  const bc32Digest = bc_bech32_1.encodeBc32Data(digest);
  const fragments = bc32Payload.match(new RegExp('.{1,' + fragmentCapacity + '}', 'g'));
  return composeHeadersToFragments(fragments, bc32Digest, 'bytes');
};
// # sourceMappingURL=encodeUR.js.map
