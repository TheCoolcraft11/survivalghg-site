import type { Config } from './interfaces';
import type { Arguments } from 'yargs';
export declare function loadConfigFile(filepath?: string): Promise<Config>;
export declare function mergeCliConf(opts: Arguments, config: Config): Config;
