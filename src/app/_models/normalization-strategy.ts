export enum NormalizationStrategy {
  HARDWARE = 0,
  BLOW = 1,
  EXHALE = 2
}

export interface NormalizationOption {
  strategy: NormalizationStrategy;
  name: string;
}
