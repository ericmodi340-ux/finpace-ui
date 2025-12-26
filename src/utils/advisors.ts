import { ClientManager } from '../@types/client';
import { getYear, isWithinInterval, subYears } from 'date-fns';
import { AdvisorManager } from '../@types/advisor';

// ----------------------------------------------------------------------

export function getAdvisorName(advisor?: AdvisorManager) {
  if (!advisor) return '';
  return advisor.name && advisor.name?.trim().length ? advisor.name : advisor.email || '';
}

export function calculateAdvisorData(
  advisorArray: AdvisorManager[],
  clientsArray: ClientManager[]
) {
  advisorArray = advisorArray.filter((advisor) => !advisor.isFirmAdmin);
  return advisorArray.map((advisor) => {
    let newAccounts = 0;
    let accountsLastYear = 0;
    let assets = 0;

    const year = getYear(new Date());
    const lastYear = getYear(subYears(new Date(), 1));

    // Filter current year clients
    const clients = clientsArray.filter((client) => {
      const addedThisYear = isWithinInterval(new Date(client.createdAt), {
        start: new Date(year, 0, 1),
        end: new Date(year, 12, 1),
      });

      if (client.advisorId === advisor.id && addedThisYear) return true;
      return false;
    });

    // Get portfolio value and count accounts
    clients.forEach((client) => {
      // If client has portfolio value add it to assets
      if (client.custom && client.custom.portfolioValue) {
        assets = client.custom.portfolioValue;
      }
      newAccounts++;
      if (client.includeSecondInvestor) newAccounts++;
    });

    // Filter last year clients
    const clientsLastYear = clientsArray.filter((client) => {
      const addedThisYear = isWithinInterval(new Date(client.createdAt), {
        start: new Date(lastYear, 0, 1),
        end: new Date(lastYear, 12, 1),
      });

      if (client.advisorId === advisor.id && addedThisYear) return true;
      return false;
    });

    // Portfolio and count accounts
    clientsLastYear.forEach((client) => {
      accountsLastYear++;
      if (client.includeSecondInvestor) accountsLastYear++;
    });

    const yoyGrowth = () => {
      const response = (newAccounts * 100) / accountsLastYear;
      // If value is NaN or is not finite return 0
      if (isNaN(response) || !isFinite(response)) return 0;
      return Math.round(response);
    };

    return {
      ...advisor,
      newAccounts: newAccounts,
      yoyGrowth: yoyGrowth(),
      assets: assets,
      accountsLastYear: accountsLastYear,
    };
  });
}
