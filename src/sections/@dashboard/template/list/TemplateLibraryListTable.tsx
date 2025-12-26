import React, { useEffect, useState } from 'react';
// @mui
import { Box, DialogContent, DialogTitle, IconButton, Link } from '@mui/material';
import { GridRenderCellParams, GridFilterItem } from '@mui/x-data-grid';
// routes
// redux
import { dispatch, useSelector } from 'redux/store';
//hooks
import useFullTemplate from 'hooks/useFullTemplate';
// components
import DataListTable from 'components/DataListTable';
import Iconify from 'components/Iconify';
import { DialogAnimate } from 'components/animate';
import BitsyFormRenderer from 'components/form/FormRenderer';
// sections
import ActionCell from './cells/ActionCell';
// utils
import arrayFromObj from 'utils/arrayFromObj';
import { getTemplates as getLibraryTemplates } from 'redux/slices/templates';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type Props = {
  filterBy?: GridFilterItem[];
  hideColumns?: string[];
};

export default function TemplateLibraryListTable({ filterBy = [], hideColumns = [] }: Props) {
  const templatesLibrary = useSelector((state) => state.libraryTemplates);
  const templatesArray = arrayFromObj(templatesLibrary.byId, templatesLibrary.allIds);
  const [templateId, setTemplateId] = useState<string | undefined>('');
  const [isOpenShowPreview, setIsOpenShowPreview] = useState<boolean>(false);
  const handleClosePreview = () => {
    setTemplateId(undefined);
    setIsOpenShowPreview(false);
  };
  const { template: currentTemplate } = useFullTemplate(templateId, true);

  useEffect(() => {
    dispatch(getLibraryTemplates());
  }, []);

  const handleTitleClick = (id: any) => {
    setTemplateId(id);
    setIsOpenShowPreview(true);
  };

  const TABLE_COLUMNS = [
    {
      field: 'name',
      headerName: 'Name',
      hideable: false,
      flex: 0.4,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          color="inherit"
          variant="subtitle2"
          onClick={() => handleTitleClick(params.row.id)}
          component="button"
          noWrap
        >
          {params.row.title}
        </Link>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
    },
    {
      field: 'added',
      headerName: 'Action',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => <ActionCell id={params.row.id} />,
    },
  ];

  return (
    <>
      <DataListTable
        data={templatesArray.map((template) => ({ ...template, name: template.title }))}
        columns={TABLE_COLUMNS}
        filterBy={[...filterBy]}
        hideColumns={[...hideColumns, 'status']}
        searchPlaceholder={`Search templates...`}
        loading={templatesLibrary.isLoading}
      />
      {isOpenShowPreview && (
        <DialogAnimate
          fullScreen
          sx={{ p: 0, pt: 3, maxWidth: 'lg', width: '100%', height: '100%' }}
          open={isOpenShowPreview}
          onClose={handleClosePreview}
        >
          <DialogTitle
            sx={{ pt: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            Preview {currentTemplate?.title || 'template'}
            <IconButton onClick={handleClosePreview}>
              <Iconify icon={'ic:round-close'} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            <Box
              sx={{ p: 3, maxWidth: 720, mx: 'auto', position: 'relative', minWidth: '453.61px' }}
            >
              <BitsyFormRenderer
                components={[...(currentTemplate?.fields ? currentTemplate?.fields : [])]}
                onSubmit={() => {}}
                options={{
                  readOnly: true,
                }}
                isLibraryTemplate={true}
              />
            </Box>
          </DialogContent>
        </DialogAnimate>
      )}
    </>
  );
}
