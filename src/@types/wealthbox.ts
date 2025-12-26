export type WealthboxContact = {
  [key: string]: any;
  id: number;
  name: string;
  image: string;
  email_addresses: Array<{ id: string; address: string; principal: boolean; kind: string }>;
};
