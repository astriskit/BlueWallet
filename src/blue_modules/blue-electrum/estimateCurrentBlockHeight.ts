import { latestBlock } from './client';

export const estimateCurrentBlockheight = function (): number {
  if (latestBlock().height) {
    const timeDiff = Math.floor(+new Date() / 1000) - latestBlock().time;
    const extraBlocks = Math.floor(timeDiff / (9.93 * 60));
    return latestBlock().height + extraBlocks;
  }

  const baseTs = 1587570465609; // uS
  const baseHeight = 627179;
  return Math.floor(baseHeight + (+new Date() - baseTs) / 1000 / 60 / 9.93);
};
