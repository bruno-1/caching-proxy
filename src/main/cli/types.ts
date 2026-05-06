type StartCommand = {
  type: 'start';
  port: number;
  origin: string;
};

type ClearCacheCommand = {
  type: 'clear-cache';
};

export type CliCommand = StartCommand | ClearCacheCommand;
