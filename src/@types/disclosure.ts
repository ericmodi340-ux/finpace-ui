// ----------------------------------------------------------------------

export enum DisclosureType {
  FIRM = 'firm',
  ADVISOR = 'advisor',
}

export type DisclosureManager = {
  key: string;
  lastModified?: Date;
  size?: number;
};

export type DisclosuresState = {
  isLoading: boolean;
  error: Error | string | null;
  [DisclosureType.FIRM]: DisclosureManager[];
  [DisclosureType.ADVISOR]: DisclosureManager[];
};
