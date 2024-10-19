import type { GCStatistics } from 'gc-stats';
export declare const gcMetrics: ({ gctype, diff, pause }: GCStatistics) => void;
