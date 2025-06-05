import { Contract } from './types/ib';

export interface Position {
  account: string;
  contract: Contract;
  pos: number;
  avgCost: number;
}