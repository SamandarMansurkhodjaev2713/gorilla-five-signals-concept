export interface FlavorTrajectory {
  readonly copyXPercent: number;
  readonly copyY: number;
  readonly productRotate: number;
  readonly productScale: number;
  readonly productX: number;
  readonly productY: number;
  readonly shardRotation: number;
}

export const FLAVOR_DEPARTURE_SPEC = Object.freeze({
  copyTravelRatio: -0.45,
  materialScale: 1.04,
  productRotationRatio: -0.45,
  productTravelXRatio: -0.28,
  productTravelYRatio: -0.18,
});

export const FLAVOR_TIMELINE_POSITION = Object.freeze({
  copy: 0.12,
  material: 0,
  product: 0,
  shard: 0.08,
  word: 0.16,
});

export const DEFAULT_FLAVOR_TRAJECTORY: FlavorTrajectory = {
  copyXPercent: 14,
  copyY: 24,
  productRotate: -11,
  productScale: 0.78,
  productX: -120,
  productY: 72,
  shardRotation: -18,
};

export const FLAVOR_TRAJECTORIES: Readonly<Record<string, FlavorTrajectory>> = {
  original: DEFAULT_FLAVOR_TRAJECTORY,
  zero: {
    copyXPercent: 0,
    copyY: -28,
    productRotate: 0,
    productScale: 0.86,
    productX: 0,
    productY: -112,
    shardRotation: 0,
  },
  extra: {
    copyXPercent: -16,
    copyY: 18,
    productRotate: 10,
    productScale: 0.72,
    productX: 136,
    productY: 38,
    shardRotation: 24,
  },
  "mango-coconut": {
    copyXPercent: 12,
    copyY: -18,
    productRotate: -8,
    productScale: 0.82,
    productX: -96,
    productY: -64,
    shardRotation: -28,
  },
  "lychee-pear": {
    copyXPercent: -12,
    copyY: 28,
    productRotate: 13,
    productScale: 0.8,
    productX: 112,
    productY: 78,
    shardRotation: 32,
  },
};
