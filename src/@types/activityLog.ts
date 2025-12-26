export type ActivityLogConfig = {
  [key: string]: any;
  advisorId: string;
  description: string;
  details: {
    field: string;
    new: string;
    old: string;
  }[];
  firmId: string;
  id: string;
  type: string;
};

export type ActivityLogState = {
  isLoading: boolean;
  error: Error | string | null;
  advisorActivityLogs: ActivityLogConfig[];
  firmActivityLogs: ActivityLogConfig[];
  activityLog: ActivityLogConfig | null;
};
