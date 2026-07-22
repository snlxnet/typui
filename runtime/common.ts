export type Location = {
  uri: string;
  range: Range;
};

export type Range = {
  start: Position;
  end: Position;
};

export type Position = {
  line: number;
  character: number;
};

export type Slice = [number, number];
