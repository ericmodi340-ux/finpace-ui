// ----------------------------------------------------------------------

export type Platform = {
  name: string;
  logo: string;
  type?: string;
  tier?: number;
  models: Partial<Model>[];
};

export type IndividualAllocationMap = {
  id: string;
  open: boolean;
  name: string;
  inputValue: string;
  percentage: number;
  value: string;
  label: string;
  type: string;
};

export type IndividualRowType = {
  rowId?: string;
  id: string;
  fullName?: string;
  label?: string;
  name: string;
  percentage: number;
  type: string;
  value?: string;
};

export type PlatformAllocationMap = {
  [key: string]: {
    [key: string]: Model;
  };
};

// Model represents a single fund model.
// For example:
// {
//   percentage: 20,
//   id: "model1",
//   name: "Model One"
// }
export interface Model {
  percentage: number;
  id: string;
  name: string;
  type: string;
  tier?: number;
}

// ModelSummary is a record where the key is the model's name and the value is a Model object.
// For example:
// {
//   "Model One": {
//     percentage: 20,
//     id: "model1",
//     name: "Model One"
//   },
//   "Model Two": {
//     percentage: 30,
//     id: "model2",
//     name: "Model Two"
//   }
// }
export type ModelSummary = Record<string, Model>;

// SummaryAllocation is a record where the key is the platform's name and the value is a ModelSummary object.// For example:
// {
//   "Platform One": {
//     "Model One": {
//       percentage: 20,
//       id: "model1",
//       name: "Model One"
//     },
//     "Model Two": {
//       percentage: 30,
//       id: "model2",
//       name: "Model Two"
//     }
//   },
//   "Platform Two": {
//     "Model Three": {
//       percentage: 25,
//       id: "model3",
//       name: "Model Three"
//     }
//   }
// }
export type SummaryAllocation = Record<string, ModelSummary>;
