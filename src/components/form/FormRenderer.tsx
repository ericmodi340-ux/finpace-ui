import {
  useEffect,
  useState,
  Fragment,
  useMemo,
  useCallback,
  memo,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import Form from './Form';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Stepper,
  Step,
  StepButton,
  DialogActions,
  Typography,
  ClickAwayListener,
 Container , Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../Iconify';
import { IconButtonAnimate } from '../animate';
// hooks
import useResponsive from '../../hooks/useResponsive';
import { TemplateField } from '../../@types/template';
import { FormSubmission } from '../../@types/form';
import ConfirmDialog from 'components/ConfirmDialog';
import { useBoolean } from 'hooks/useBoolean';
import useUser from 'hooks/useUser';
import { UserRole } from '../../@types/user';

const BitsyFormRenderer = ({
  templateName,
  templateId,
  components = [],
  submission,
  onNextPage,
  onSubmit,
  options,
  isComplete,
  isLibraryTemplate: isPreview,
  initialCompletedPages,
  handleSave,
  setUserCompletedForms,
}: {
  templateName: string;
  templateId: string;
  components: TemplateField[];
  submission: Record<string, any>;
  onNextPage: (key: string, submission: FormSubmission, next: () => void) => void;
  onSubmit: (currentPageKey: string, submission: FormSubmission, next: () => void) => void;
  options: {
    readOnly?: boolean;
    isPublic?: boolean;
  };
  isComplete: boolean;
  isLibraryTemplate: boolean;
  initialCompletedPages: Record<string, boolean>;
  handleSave: (obj: { submission: FormSubmission; pageId: string; skip: boolean }) => void;
  setUserCompletedForms: Dispatch<SetStateAction<Record<string, boolean>>>;
}) => {
  const theme = useTheme();

  const isDesktop = useResponsive('up', 'lg');
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>(initialCompletedPages || {});
  const [filteredPages, setFilteredPages] = useState<any[]>([]);
  const [readOnlyPages, setReadOnlyPages] = useState([]);
  const [openStepperNav, setOpenStepperNav] = useState(false);

  useEffect(() => {
    setCompleted(initialCompletedPages || {});
  }, [initialCompletedPages]);

  useEffect(() => {
    if (isDesktop && !openStepperNav) {
      setOpenStepperNav(true);
    }
  }, [isDesktop, setOpenStepperNav, openStepperNav]);
  // Bad practice, but it works
  // Formio don't allow to change the button label
  // This is a workaround to change the button label
  // Formio renders after component is mount!! hence the timeout
  useEffect(() => {
    function handleClick() {
      const timeoutId = setTimeout(() => {
        const buttons = document.querySelectorAll('.open-modal-button');
        buttons.forEach((button) => {
          button.textContent = 'More info';
        });
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [activePageIdx]);

  const handleToggleNav = useCallback(() => {
    setOpenStepperNav(!openStepperNav);
  }, [openStepperNav]);

  const prepComponents = useMemo(
    () => (components: any) => {
      if (!components) {
        return [];
      }

      return components.map((component: any) => ({
        ...component,
        dataGridLabel: true,
        components: prepComponents(component.components),
      }));
    },
    []
  );

  const prepPages = useMemo(
    () =>
      (
        pages: TemplateField[]
      ): {
        [key: string]: any;
      } =>
        pages.map((page, index) => ({
          ...page,
          originalIndex: index,
          components: [
            ...prepComponents(page.components),
            // !isComplete &&
            //   options?.readOnly !== true && {
            //     type: 'button',
            //     label: 'Continue',
            //     key: 'submit',
            //     disableOnInvalid: false,
            //     input: true,
            //   },
          ],
        })),
    [prepComponents]
  );

  // Pages of the template
  let pages = prepPages(JSON.parse(JSON.stringify(components)));

  // Pages that require a condition to be shown
  const conditionalPages = pages?.filter((page: any) =>
    page?.conditional?.when ? page.conditional.when : page
  );

  // Conditional pages keys
  const conditionalKeys = useMemo(
    () =>
      new Set(
        conditionalPages.map((page: any) => {
          const path = page?.conditional?.when;

          // Get last key of conditional prop when it's nested inside Data Grid or some other data component
          if (path) return path.split('.').at(-1);

          // If no path, return empty array
          return [];
        })
      ),
    [conditionalPages]
  );

  // Filtered pages
  useEffect(() => {
    const initialConditionalValues: TemplateField[] = [];

    if (submission) {
      for (const [key, value] of Object.entries(submission)) {
        // If current key is a conditional key, store it on initialConditionalValues
        if (conditionalKeys.has(key)) initialConditionalValues.push({ key, value });
      }
    }

    const filteredPages = pages.filter((page: any) => {
      const pageCondition = page.conditional?.when;

      const initialPageCondition = initialConditionalValues.find(
        (initialValue) => initialValue.key === pageCondition
      );

      // Return pages whose condition is true
      if (
        initialPageCondition &&
        pageCondition === initialPageCondition.key &&
        initialPageCondition.value === true
      )
        return true;

      // Return pages that don't need condition
      return pageCondition === null;
    });

    // sort pages by original index
    filteredPages.sort((a: any, b: any) => a?.originalIndex - b?.originalIndex);
    setFilteredPages(filteredPages);
  }, [submission]);

  const totalPages = filteredPages?.length;

  const completedPages = Object.keys(completed).length;

  const isLastPage = activePageIdx === totalPages - 1;

  const isLastIncompletePage =
    completedPages >= totalPages - 1 && !completed[filteredPages[activePageIdx]?.key];

  const allPagesCompleted = completedPages === totalPages;

  const handleNext = useCallback(() => {
    let newActivePageIdx;

    if (isLastPage && !allPagesCompleted) {
      // It's the last page, but not all pages have been completed,
      // find the first page that has been completed
      newActivePageIdx = filteredPages.findIndex((page) => !(page.key in completed));
    } else {
      // It's not the last page, but not all pages have been completed,
      // find the next page in order that has not been completed
      const pagesWithOidx = filteredPages.map((page, i) => ({ ...page, oidx: i }));

      // split the array into two parts based on the current page index
      const nextPages = pagesWithOidx.slice(activePageIdx);
      const prevPages = pagesWithOidx.slice(0, activePageIdx);

      if (nextPages.length) {
        newActivePageIdx = nextPages.find((page) => !(page.key in completed))?.oidx;
      }

      if (newActivePageIdx === undefined || !newActivePageIdx) {
        newActivePageIdx = prevPages.find((page) => !(page.key in completed))?.oidx;
      }

      // Default to the next page increase,
      // we should really never get here if the above is working correctly
      if (newActivePageIdx === undefined || !newActivePageIdx) {
        newActivePageIdx = activePageIdx + 1;
      }
    }
    setActivePageIdx(newActivePageIdx);
  }, [activePageIdx, allPagesCompleted, completed, filteredPages, isLastPage]);

  const handleBack = () => {
    setActivePageIdx((prevActivePageIdx) => prevActivePageIdx - 1);
  };

  const handlePageChange = useCallback(
    (page: any) => {
      if (!isDesktop) setOpenStepperNav(false);
      setActivePageIdx(page);
    },
    [isDesktop]
  );

  // The submit callback
  const next = useCallback(() => {
    const newCompleted = completed;
    newCompleted[filteredPages[activePageIdx]?.key] = true;
    setCompleted(newCompleted);
    handleNext();
  }, [activePageIdx, completed, filteredPages, handleNext]);

  const getConditionalPages = useCallback(
    (keyFieldModified: string, value: boolean) => {
      if (conditionalKeys.has(keyFieldModified)) {
        // Get current pages keys

        setFilteredPages((prevFilteredPages) => {
          const pagesKeys = prevFilteredPages.map((page) => page.key);

          // Get conditional pages that rely on the field being modified
          const newPages = conditionalPages?.filter(
            (page: any) => page.conditional.when === keyFieldModified
          );

          const newPagesKeys = newPages.map((page: any) => page.key);

          // If field value is true add new pages
          if (value === true) {
            // Check if conditional pages are already added to lateral navbar

            const pagesAlreadyAdded = newPagesKeys.every((id: string) => pagesKeys.includes(id));

            // If conditional pages aren't being shown, add them
            if (!pagesAlreadyAdded) {
              // Add new pages
              const newFilteredPages = [...prevFilteredPages];
              newFilteredPages.splice(activePageIdx + 1, 0, ...newPages);
              // sort pages by original index
              newFilteredPages.sort((a, b) => a.originalIndex - b.originalIndex);
              return newFilteredPages;
              // setRerenderPage(true);
            }

            // If field value is false, remove conditional pages
          } else if (value === false) {
            // Filter pages that has the conditional key
            const newPages = prevFilteredPages.filter((page) => !newPagesKeys.includes(page.key));
            const newCompleted = { ...completed };
            newPagesKeys.forEach((key: string) => {
              delete newCompleted[key];
            });
            delete newCompleted[prevFilteredPages[activePageIdx]?.key];
            setCompleted(newCompleted);

            // If current pages is greater than new pages,
            // Change state and set it as newPages
            // if (filteredPages.length > newPages.length) {
            // setFilteredPages([...newPages]);
            return newPages;
            // setRerenderPage(true);
            // }
          }
          return prevFilteredPages;
        });
      }
    },
    [activePageIdx, completed, conditionalKeys, conditionalPages]
  );

  const handleClickAway = useCallback(() => {
    if (!isDesktop) {
      setOpenStepperNav(false);
    }
  }, [isDesktop]);

  const changeBooleanValues = (object: any) =>
    Object.keys(object).reduce((updatedObject, key) => {
      const value = object[key];
      const updatedValue = typeof value === 'boolean' ? (value === false ? 'No' : 'Yes') : value;
      // @ts-ignore
      updatedObject[key] = updatedValue;
      return updatedObject;
    }, {});

  const changeComponentType = useCallback(
    (components: any) => {
      components.forEach((item: any) => {
        if (item.type === 'select') {
          item.type = 'input';
          if (submission) {
            const formattedSubmissions = changeBooleanValues(submission);
            // @ts-ignore
            item.defaultValue = formattedSubmissions[item.key];
            if (typeof submission[item.key] === 'boolean') {
              item.key = null;
            }
          }
        }
        if (item?.components?.length && item.type !== 'select') {
          changeComponentType(item.components);
        }
        if (item?.rows?.length) {
          item.rows.forEach((row: any[]) => {
            row.forEach((rowItem) => {
              changeComponentType(rowItem.components);
            });
          });
        }
        if (item?.columns?.length) {
          item.columns.forEach((column: any) => {
            changeComponentType(column.components);
          });
        }
      });
    },
    [submission]
  );

  const handleFormattedReadOnlyPages = useCallback(
    (pages: any) => {
      pages.forEach((item: any) => {
        changeComponentType(item.components);
      });

      return pages;
    },
    [changeComponentType]
  );

  useEffect(() => {
    if (options?.readOnly && !!filteredPages.length) {
      setReadOnlyPages(handleFormattedReadOnlyPages(filteredPages));
    }
  }, [filteredPages, handleFormattedReadOnlyPages, options?.readOnly, submission, components]);

  return (
    <div className="formrenderer">
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: openStepperNav ? '`1px' : '50%',
            margin: '10px',
            padding: openStepperNav ? '15px 15px 15px 15px' : '5px',
            paddingTop: openStepperNav ? { xs: '15px', md: '90px' } : '5px',
            height: openStepperNav ? '100%' : '50px',
            left: 0,
            position: 'fixed',
            top: openStepperNav ? 0 : 80,
            transition: '0.15s',
            overflowX: 'hidden',
            overflowY: openStepperNav && !isDesktop ? 'scroll' : 'auto',
            width: openStepperNav ? '230px' : '50px',
            zIndex: 3000,
            '& .MuiStepConnector-root': {
              display: 'none',
            },
            '& .MuiStepLabel-label': {
              fontWeight: 600,
              marginLeft: '6px',
            },
            '& .MuiStepLabel-root': {
              padding: '5px',
            },
          }}
        >
          {!isDesktop && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: openStepperNav ? '50px' : '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <IconButtonAnimate
                onClick={handleToggleNav}
                sx={{
                  width: '40px',
                  height: '40px',
                  color: 'primary',
                }}
              >
                <Iconify icon="eva:menu-2-fill" />
              </IconButtonAnimate>
            </Box>
          )}

          {openStepperNav && (
            <>
              <Typography
                sx={{
                  pt: 2,
                  pb: 1,
                }}
                textAlign="start"
                variant="subtitle1"
              >
                {templateName}
              </Typography>
              <Stepper
                className="stepper-nav"
                nonLinear
                activeStep={activePageIdx}
                orientation="vertical"
              >
                {filteredPages.map((page, idx) => (
                  <Step
                    key={`${page.key}__${idx}`}
                    completed={completed[page.key] && activePageIdx !== idx}
                    sx={{
                      '& .MuiStepIcon-text': { display: 'none' },
                      '& .MuiSvgIcon-root': {
                        width: '0.6em',
                        height: '0.6em',
                        color: theme.palette.error.main,
                        '&.Mui-active': { color: theme.palette.primary.main },
                        '&.Mui-completed': { color: theme.palette.success.main },
                      },
                    }}
                  >
                    <StepButton
                      color="inherit"
                      onClick={() => handlePageChange(idx)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      <Typography variant="inherit" noWrap sx={{ width: '160px' }}>
                        {page.title || page.label || `Page ${idx + 1}`}
                      </Typography>
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </>
          )}
        </Box>
      </ClickAwayListener>
      {(options?.readOnly ? readOnlyPages : filteredPages).map((page, idx) => {
        if (idx !== activePageIdx) {
          return <Fragment key={idx} />;
        } else {
          return (
            <FormRendered
              templateId={templateId}
              key={page.key}
              page={page}
              idx={idx}
              handleBack={handleBack}
              getConditionalPages={getConditionalPages}
              next={next}
              isPreview={isPreview}
              isComplete={isComplete}
              onSubmit={onSubmit}
              onNextPage={onNextPage}
              submission={submission}
              options={options}
              handleSave={handleSave}
              setUserCompletedForms={setUserCompletedForms}
              isLastIncompletePage={isLastIncompletePage}
            />
          );
        }
      })}
    </div>
  );
};

export default memo(BitsyFormRenderer);

function FormRendered({
  templateId,
  page,
  idx,
  isLastIncompletePage,
  onSubmit,
  onNextPage,
  submission,
  isPreview,
  isComplete,
  getConditionalPages,
  next,
  handleBack,
  options,
  handleSave,
  setUserCompletedForms,
}: {
  templateId: string;
  page: any;
  idx: number;
  isLastIncompletePage: boolean;
  onSubmit: (currentPageKey: string, submission: FormSubmission, next: () => void) => void;
  onNextPage: (currentPageKey: string, submission: FormSubmission, next: () => void) => void;
  submission: Record<string, any>;
  isPreview: boolean;
  isComplete: boolean;
  getConditionalPages: (keyFieldModified: string, value: boolean) => void;
  next: () => void;
  handleBack: () => void;
  options?: {
    readOnly?: boolean;
    isPublic?: boolean;
  };
  handleSave: (obj: { submission: FormSubmission; pageId: string; skip: boolean }) => void;
  setUserCompletedForms: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const [formI, setFormI] = useState(null);
  const [subm, setSubm] = useState<FormSubmission | undefined>(submission);

  const { authUser } = useUser();

  const openConfirmSkip = useBoolean();

  const [isSkiping, setisSkipping] = useState(false);
  const isLastIncompletePageRef = useRef(isLastIncompletePage);

  useEffect(() => {
    isLastIncompletePageRef.current = isLastIncompletePage;
  }, [isLastIncompletePage]);

  const onChangeHandler = useCallback(
    async (subm: FormSubmission, { changed }: { changed: any }) => {
      if (changed) {
        const {
          component: { key: keyFieldModified },
          value,
        } = changed;

        setSubm(subm.data);

        getConditionalPages(keyFieldModified, value);
      }
    },
    [getConditionalPages]
  );

  const onSave = useCallback(
    (newSubmission: FormSubmission, allPagesCompleted: boolean) => {
      if (allPagesCompleted) {
        setUserCompletedForms((pre) => ({ ...pre, [templateId]: true }));
        onSubmit(page.key, newSubmission?.data, next);
      } else {
        onNextPage(page.key, newSubmission?.data, next);
      }
    },
    [next, onNextPage, onSubmit, page.key, setUserCompletedForms, templateId]
  );

  return (
    <>
      <ConfirmDialog
        open={openConfirmSkip.value}
        onClose={() => {
          setisSkipping(false);
          openConfirmSkip.onFalse();
        }}
        title="Skip Form"
        content="Are you sure you want to skip completing this form now? Even if you skip, you’ll still be able to send it to the client for review."
        action={
          <LoadingButton
            variant="contained"
            disabled={isSkiping}
            loadingIndicator="Loading..."
            onClick={() => {
              setisSkipping(true);
              handleSave({
                // @ts-ignore
                submission: formI?.submission?.data,
                pageId: page.key,
                skip: true,
              });
            }}
          >
            Skip Form
          </LoadingButton>
        }
      />

      <MContainer>
        <Form
          form={{
            components: page.components,
          }}
          // Fix race condition with choicesjs
          formReady={(formInstance: any) => {
            setFormI(formInstance);
          }}
          options={{
            ...options,
          }}
          // @ts-ignore
          onSubmitError={() => {
            document.querySelector('.stepper-heading')?.scrollIntoView();
          }}
          submission={{
            data: subm || submission,
          }}
          onChange={onChangeHandler}
          onSubmit={(prop: any) => onSave(prop, isLastIncompletePageRef.current)}
        />
        <DialogActions
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginX: 'auto',
            padding: '0px 0px !important',
          }}
        >
          {idx !== 0 && !isPreview && !isComplete && (
            <LoadingButton
              variant="outlined"
              size="large"
              loadingIndicator="Loading..."
              sx={{ flex: 1 }}
              onClick={() => {
                handleBack();
              }}
            >
              Go back
            </LoadingButton>
          )}
          {!isPreview && !isComplete && !options?.readOnly && !options?.isPublic && (
            <LoadingButton
              variant="outlined"
              size="large"
              loadingIndicator="Loading..."
              sx={{ flex: 1 }}
              onClick={async () => {
                handleSave({
                  // @ts-ignore
                  submission: formI?.submission?.data,
                  pageId: page.key,
                  skip: false,
                });
              }}
            >
              Save Draft
            </LoadingButton>
          )}
          {!isComplete && options?.readOnly !== true && (
            <LoadingButton
              variant="contained"
              size="large"
              loadingIndicator="Loading..."
              sx={{ flex: 1 }}
              onClick={async () => {
                // @ts-ignore
                formI?.submit();
              }}
            >
              Continue
            </LoadingButton>
          )}
        </DialogActions>
        {!options?.readOnly ? (
          <LoadingButton
            sx={{
              mt: 3,
            }}
            onClick={() => {
              if (authUser && authUser?.role !== UserRole.CLIENT) {
                openConfirmSkip.onTrue();
                return;
              }

              handleSave({
                // @ts-ignore
                submission: formI?.submission?.data,
                pageId: page.key,
                skip: true,
              });
            }}
          >
            Skip Form and Continue
          </LoadingButton>
        ) : (
          <></>
        )}
      </MContainer>
    </>
  );
}

const MContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      flex: 1,
      width: '100%',
      margin: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
      mx: 'auto',
      my: {
        xs: 'auto',
        md: 10,
      },
      minHeight: '210px',
    }}
    className="form-renderer-tab"
  >
    <Container maxWidth="md">
      <Card
        sx={{
          px: 5,
          pb: 5,
          pt: 2,
        }}
      >
        {children}
      </Card>
    </Container>
  </Box>
);
