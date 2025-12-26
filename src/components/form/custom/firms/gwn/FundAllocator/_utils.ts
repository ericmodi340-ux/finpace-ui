// @types
import { IndividualAllocationMap, PlatformAllocationMap } from './_@types';
// constants
import { HUTTO_DEAN, KMC_PLATINUM, PLATFORMS } from './_constants';
import { ClientManager } from '../../../../../../@types/client';
import { map } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------------------------

export const getTemplateModel = (templateTitle: string = '') => {
  if (templateTitle.includes('MAP')) {
    return 'mapShortKit';
  } else if (templateTitle.includes('Custodial Advantage')) {
    return 'custodialAdvantage';
  } else if (templateTitle.includes('KMC Platinum')) {
    return 'platinum';
  } else if (templateTitle.includes('KMC MBD')) {
    return 'mbd';
  } else {
    return 'mapShortKit';
  }
};

export const getPlatforms = (templateTitle: string = '') => {
  if (templateTitle.includes('MAP')) {
    return PLATFORMS;
  } else if (templateTitle.includes('KMC Platinum')) {
    return KMC_PLATINUM;
  } else {
    return [];
  }
};

export function createInitialFields(allocatedFunds: any, templateTitle: string) {
  const initialFields: PlatformAllocationMap = {};

  [...getPlatforms(templateTitle), HUTTO_DEAN].forEach((platform) => {
    initialFields[platform.name] = {};

    platform?.models?.forEach((model) => {
      initialFields[platform.name][model.name!] = {
        id: model.id!,
        name: model.name!,
        percentage: allocatedFunds?.[platform.name]?.[model.name!]?.percentage || 0,
        type: platform.type || '',
        tier: platform.tier,
      };
    });
  });

  initialFields['Individual Fund Allocation'] =
    allocatedFunds?.['Individual Fund Allocation'] || {};

  return initialFields;
}

export const calculateAllocation = (platformAllocationMap: PlatformAllocationMap) => {
  let sum = 0;

  for (const entry of Object.values(platformAllocationMap)) {
    for (const model of Object.values(entry)) {
      sum += model.percentage;
    }
  }

  const totalAllocated = sum;

  return { totalAllocated };
};

export const getInitialAllocationMap = (
  currentClient: ClientManager,
  templateId: string,
  templateTitle: string
) => {
  const allocatedFunds = currentClient?.custom?.gwn_funds_allocated?.[templateId];
  return createInitialFields(allocatedFunds, templateTitle);
};

export const initializeRows = (
  individualTotal: number,
  platformAllocationMap: PlatformAllocationMap
): {
  rowId: string;
  id: string;
  name: string;
  percentage: number;
  type: string;
}[] => {
  if (individualTotal > 0) {
    const individualObject = platformAllocationMap[
      'Individual Fund Allocation'
    ] as unknown as Record<string, IndividualAllocationMap>;

    return map(individualObject, (value) => ({
      rowId: uuidv4(),
      id: value.id,
      name: value.name,
      percentage: value.percentage,
      type: value.type,
    }));
  } else {
    return [
      {
        rowId: uuidv4(),
        id: '',
        name: '',
        percentage: 0,
        type: 'fund',
      },
    ];
  }
};
