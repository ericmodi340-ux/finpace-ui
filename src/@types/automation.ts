import { IntegrationOwner, IntegrationServiceId } from './integration';
import { Node } from 'reactflow';

export type AutomationConfig = {
  [key: string]: any;
  status?: AutomationStatus;
  startedAt: Date | string;
};

export type AutomationState = {
  isLoading: boolean;
  error: Error | string | null;
  automations: AutomationConfig[];
  scheduledJobs: any[];
};

export type NewAutomationConfig = {
  [key: string]: any;
  type: string;
  subtype: 'integration' | 'csv';
  integration?: IntegrationServiceId;
  integrationOwner?: IntegrationOwner;
  csvPath?: string;
  disclosures?: string[];
  forms?: string[];
  advisorId?: string;
  frequency?: number;
};

export enum AutomationStatus {
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SUBMITTED = 'submitted',
}

type CardNodeDataType = {
  title: string;
  icon: string;
  iconColor: string;
  subTitle: string;
  value?: any | null;
};

export type CardNodeType = Node & {
  data: CardNodeDataType;
};
