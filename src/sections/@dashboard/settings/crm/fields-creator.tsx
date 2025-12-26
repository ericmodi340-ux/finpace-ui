import { Stack, Grid, Button, IconButton, Typography } from '@mui/material';
import { CustomField, Group } from '../../../../@types/custom-fields';
import { useBoolean } from 'hooks/useBoolean';
import { Dispatch, SetStateAction, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CustomFieldNewEditDrawer from './custom-field-new-edit-drawer';
import Iconify from 'components/Iconify';
import Label from 'components/Label';
import { startCase } from 'lodash';

export default function FieldsCreator({
  setGroups,
  selectedTab,
  setFields,
  selectedGroup,
  fields,
}: {
  setGroups: Dispatch<SetStateAction<Group[]>>;
  selectedTab: string;
  setFields: Dispatch<SetStateAction<Record<string, CustomField>>>;
  selectedGroup: Group | undefined;
  fields: Record<string, CustomField>;
}) {
  const addField = useBoolean();
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.index === source.index && destination.droppableId === source.droppableId)
      return;

    setGroups((prevGroups) => {
      const newGroups = [...prevGroups];
      const groupIndex = newGroups.findIndex((g) => g.name === selectedTab);
      if (groupIndex === -1) return prevGroups;

      const group = { ...newGroups[groupIndex] };
      const newFields = [...group.fields];
      const [movedField] = newFields.splice(source.index, 1);
      newFields.splice(destination.index, 0, movedField);

      newGroups[groupIndex] = { ...group, fields: newFields };
      return newGroups;
    });
  };

  const handleEditField = (fieldKey: string) => {
    setEditingFieldKey(fieldKey);
    addField.onTrue();
  };

  const handleCloseDrawer = () => {
    setEditingFieldKey(null);
    addField.onFalse();
  };

  const handleDeleteField = (fieldKey: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.name === selectedTab ? { ...g, fields: g.fields.filter((key) => key !== fieldKey) } : g
      )
    );
    setFields((prev) => {
      const updated = { ...prev };
      delete updated[fieldKey];
      return updated;
    });
  };

  const systemFields = ['id', 'createdAt', 'updatedAt'];

  return (
    <Stack>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={selectedTab}>
          {(provided) => (
            <Grid container spacing={2} p={3} ref={provided.innerRef} {...provided.droppableProps}>
              {selectedGroup?.fields.map((fieldKey, index) => {
                const field = fields[fieldKey];
                if (!field) return null;

                return (
                  <Draggable key={fieldKey} draggableId={fieldKey} index={index}>
                    {(provided) => (
                      <Grid
                        item
                        xs={12}
                        md={field.column || 12}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                      >
                        <Field
                          data={field}
                          dragHandleProps={provided.dragHandleProps}
                          handleEditField={handleEditField}
                          handleDeleteField={handleDeleteField}
                        />
                      </Grid>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      {addField.value && (
        <CustomFieldNewEditDrawer
          open={addField.value}
          onClose={handleCloseDrawer}
          onSave={(field) => {
            if (!editingFieldKey) {
              // New field
              if (fields[field.key] || systemFields.includes(field.key)) {
                alert('Field key already exists! Please use a different key.');
                return;
              }
            } else if (editingFieldKey !== field.key) {
              // Editing existing field with a changed key
              if (fields[field.key] || systemFields.includes(field.key)) {
                alert('Field key already exists! Please use a different key.');
                return;
              }
              setGroups((prev) =>
                prev.map((g) =>
                  g.name === selectedTab
                    ? { ...g, fields: g.fields.filter((k) => k !== editingFieldKey) }
                    : g
                )
              );
              setFields(({ [editingFieldKey]: removed, ...rest }) => rest);
            }

            setFields((prev) => ({ ...prev, [field.key]: field }));

            setGroups((prev) => {
              const group = prev.find((g) => g.name === selectedTab);
              if (group && !group.fields.includes(field.key)) {
                return prev.map((g) =>
                  g.name === selectedTab ? { ...g, fields: [...g.fields, field.key] } : g
                );
              }
              return prev;
            });

            handleCloseDrawer();
          }}
          fieldData={editingFieldKey ? fields[editingFieldKey] : undefined}
        />
      )}

      {selectedGroup?.name && !selectedGroup?.isNonEditable && (
        <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ my: 3, px: 3 }}>
          <Button
            startIcon={<Iconify icon="eva:plus-outline" />}
            variant="outlined"
            onClick={() => {
              setEditingFieldKey(null);
              addField.onTrue();
            }}
          >
            Add Field
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function Field({
  data,
  dragHandleProps,
  handleEditField,
  handleDeleteField,
}: {
  data: CustomField;
  dragHandleProps?: any;
  handleEditField: (fieldKey: string) => void;
  handleDeleteField: (fieldKey: string) => void;
}) {
  return (
    <Stack
      sx={{
        border: 1,
        borderColor: (theme) => theme.palette.divider,
        p: 1,
        width: '100%',
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" {...dragHandleProps}>
            <Iconify icon="mdi:drag" sx={{ color: 'text.secondary' }} />
          </IconButton>
          <Stack>
            <Typography variant="body1">{data.fieldName}</Typography>
            <Typography variant="caption">
              Field Type: <Label variant="ghost">{startCase(data.inputType)}</Label>
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={() => handleEditField(data.key)}>
            <Iconify icon="eva:edit-fill" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteField(data.key)}>
            <Iconify icon="eva:trash-2-outline" />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
