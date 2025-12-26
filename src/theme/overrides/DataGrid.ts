import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function DataGrid(theme: Theme) {
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid transparent`,
          '& .MuiTablePagination-root': {
            borderTop: 0,
          },
          '& .MuiDataGrid-main': {
            minHeight: theme.spacing(20),
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: theme.spacing(2),
            '& .MuiButton-root': {
              marginRight: theme.spacing(1.5),
              color: theme.palette.grey['600'],
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            },
          },
          '& .MuiDataGrid-cell, .MuiDataGrid-columnsContainer': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-columnSeparator': {
            color: theme.palette.divider,
            display: 'none',
          },
          '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
            padding: 0,
          },
          // START BITSY
          '& .MuiDataGrid-virtualScrollerContent': {
            height: 'auto !important',
          },
          '& .MuiDataGrid-virtualScrollerRenderZone': {
            position: 'relative',
          },
          '& .MuiDataGrid-row': {
            maxHeight: 'none !important',
            '&.Mui-selected': {
              backgroundColor: 'rgba(145, 158, 171, 0.16)',
            },
          },
          '& .MuiDataGrid-cell': {
            padding: '16px',
            maxHeight: 'none !important',
            borderBottom: 'none',
            '&:first-of-type': {
              paddingLeft: '24px',
            },
            '&:last-of-type': {
              paddingRight: '24px',
            },
            '&:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnHeaderCheckbox': {
            width: '64px !important',
            maxWidth: '64px !important',
          },
          '& .MuiDataGrid-cellCheckbox': {
            maxWidth: '64px !important',
            paddingRight: '0',
          },
          // Header row
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: 'none',
          },
          '& .MuiDataGrid-columnHeadersInner': {
            alignItems: 'stretch',
          },
          '& .MuiDataGrid-columnHeader': {
            color: theme.palette.grey['600'],
            backgroundColor: theme.palette.grey['200'],
            '&:first-of-type': {
              paddingLeft: '24px',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              boxShadow: 'inset 8px 0 0 #fff',
            },
            '&:last-of-type': {
              paddingRight: '24px',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              boxShadow: 'inset -8px 0 0 #fff',
            },
            '&:focus-within': {
              outline: 'none',
            },
          },
        },
      },
    },
    MuiGridMenu: {
      styleOverrides: {
        root: {
          '& .MuiDataGrid-gridMenuList': {
            boxShadow: theme.customShadows.z20,
            borderRadius: theme.shape.borderRadius,
          },
          '& .MuiMenuItem-root': {
            ...theme.typography.body2,
          },
        },
      },
    },
    MuiGridFilterForm: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1.5, 0),
          '& .MuiFormControl-root': {
            margin: theme.spacing(0, 0.5),
          },
          '& .MuiInput-root': {
            marginTop: theme.spacing(3),
            '&::before, &::after': {
              display: 'none',
            },
            '& .MuiNativeSelect-select, .MuiInput-input': {
              ...theme.typography.body2,
              padding: theme.spacing(0.75, 1),
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background.neutral,
            },
            '& .MuiSvgIcon-root': {
              right: 4,
            },
          },
        },
      },
    },
    MuiGridPanelFooter: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2),
          justifyContent: 'flex-end',
          '& .MuiButton-root': {
            '&:first-of-type': {
              marginRight: theme.spacing(1.5),
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            },
            '&:last-of-type': {
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          },
        },
      },
    },
  };
}
