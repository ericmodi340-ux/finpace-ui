import { useState, useCallback } from 'react';
import { formStatuses } from 'constants/forms';
import { FormManager } from '../@types/form';
import { UserRole } from '../@types/user';

// --------------------------------------------------------------------------------------------

// We can define this constant outside the hook because its value will never change.
const DEFAULT_CARDS_PER_PAGE = 5;

// This function filters forms that are awaiting advisor review.
function filterFormsAwaitingAdvisorReview(formsById: Record<string, FormManager>): FormManager[] {
  return Object.values(formsById).filter(
    (form) => form.status === formStatuses.SENT && form.currentReviewerRole !== UserRole.CLIENT
  );
}

// This function sorts forms by dateSent if available, otherwise by createdAt.
function sortFormsByDate(forms: FormManager[]): FormManager[] {
  return [...forms].sort((a, b) => {
    const dateA = (a.dateSent ?? a.createdAt) as string;
    const dateB = (b.dateSent ?? b.createdAt) as string;
    return dateB.localeCompare(dateA);
  });
}

function paginateForms(forms: FormManager[], page: number, cardsPerPage: number): FormManager[] {
  const indexOfLastRow = (page + 1) * cardsPerPage;
  const indexOfFirstRow = indexOfLastRow - cardsPerPage;

  return forms.slice(indexOfFirstRow, indexOfLastRow);
}

// --------------------------------------------------------------------------------------------

function useAdvisorTasks(
  formsById: Record<string, FormManager>,
  cardsPerPage?: number,
  clientId: string = ''
) {
  const [_cardsPerPage, setCardsPerPage] = useState(cardsPerPage || DEFAULT_CARDS_PER_PAGE);
  const [page, setPage] = useState(0);

  let formsAwaitingAdvisorReview = sortFormsByDate(filterFormsAwaitingAdvisorReview(formsById));
  // If clientId exists, filter forms based on clientId
  if (clientId) {
    formsAwaitingAdvisorReview = formsAwaitingAdvisorReview.filter(
      (form) => form.clientId === clientId
    );
  }

  const formsList = paginateForms(formsAwaitingAdvisorReview, page, _cardsPerPage);

  // We encapsulate the page change logic in a callback to avoid recreating the function on every render.
  const handlePageChange = useCallback((_: any, newPage: number) => {
    setPage(newPage);
  }, []);

  // We do the same for the change in the number of cards per page.
  const handleRowsPerPageChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setCardsPerPage(parseInt(value, 10));
      setPage(0);
    },
    []
  );

  return {
    formsList,
    formsAwaitingAdvisorReview,
    page,
    cardsPerPage: _cardsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
  };
}

export default useAdvisorTasks;
