import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  DialogTitle,
  Stack,
  Typography,
  IconButton,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Iconify from 'components/Iconify';
import { useBoolean } from 'hooks/useBoolean';
import ConfirmDialog from 'components/ConfirmDialog';
import { Group } from '../../../../@types/custom-fields';

interface ManageGroupModalProps {
  open: boolean;
  handleClose: () => void;
  initialGroups: Group[];
  onSave: (groups: Group[]) => void;
}

function ManageGroupModal({ open, handleClose, initialGroups, onSave }: ManageGroupModalProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

  const confirmDelete = useBoolean();

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedGroups = Array.from(groups);
    const [removed] = reorderedGroups.splice(result.source.index, 1);
    reorderedGroups.splice(result.destination.index, 0, removed);
    setGroups(reorderedGroups);
  };

  const handleAddGroup = () => {
    setEditGroup({ name: '', fields: [], hideFromClient: false });
    setIsEditModalOpen(true);
  };

  const handleEditClick = (group: Group) => {
    setEditGroup(group);
    setIsEditModalOpen(true);
  };

  const handleHideToggle = (group: Group) => {
    setGroups((prevGroups) =>
      prevGroups.map((g) => (g === group ? { ...g, isHidden: !g.isHidden } : g))
    );
  };

  const handleSaveGroup = () => {
    if (editGroup) {
      // Check if group name already exists
      const nameAlreadyExists = groups.some(
        (g) => g.name.toLowerCase() === editGroup.name.toLowerCase() && g !== editGroup
      );
      if (nameAlreadyExists) {
        setError('Group name already exists');
        return; // Stop saving
      }
      setError('');
      setGroups((prevGroups) => {
        const existingGroupIndex = prevGroups.findIndex((g) => g.name === editGroup.name);
        if (existingGroupIndex !== -1) {
          // Update existing group
          const updatedGroups = [...prevGroups];
          updatedGroups[existingGroupIndex] = editGroup;
          return updatedGroups;
        } else {
          // Add new group
          return [...prevGroups, editGroup];
        }
      });
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteGroup = (groupName: string) => {
    setGroups((prevGroups) => prevGroups.filter((group) => group.name !== groupName));
  };

  const handleDeleteClick = (groupName: string) => {
    setDeleteTarget(groupName);
    confirmDelete.onTrue();
  };

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle>
          <Stack
            component="span"
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">Manage Groups</Typography>

            <Button
              size="small"
              startIcon={<Iconify icon="eva:plus-outline" />}
              variant="outlined"
              onClick={handleAddGroup}
            >
              Add Group
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack mt={3}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="groups">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {groups.map((group, index) => (
                      <Draggable key={group.name} draggableId={group.name} index={index}>
                        {(provided) => (
                          <Stack
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            direction="row"
                            sx={{
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 1,
                              px: 1,
                              mb: 1,
                              borderRadius: 1.5,
                              border: `dashed 1px`,
                              borderColor: 'divider',
                              backgroundColor: (theme) => theme.palette.background.paper,
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <IconButton {...provided.dragHandleProps}>
                                <Iconify icon="mdi:drag" />
                              </IconButton>
                              <Typography>{group.name}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton onClick={() => handleHideToggle(group)}>
                                <Iconify
                                  sx={{
                                    height: 20,
                                    width: 20,
                                  }}
                                  icon={group.isHidden ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                                />
                              </IconButton>
                              <IconButton
                                disabled={group.isNonEditable}
                                onClick={() => handleEditClick(group)}
                              >
                                <Iconify
                                  sx={{
                                    height: 20,
                                    width: 20,
                                  }}
                                  icon="mdi:edit-outline"
                                />
                              </IconButton>
                              <IconButton
                                disabled={group.isNonEditable}
                                onClick={() => handleDeleteClick(group.name)}
                              >
                                <Iconify
                                  sx={{
                                    height: 20,
                                    width: 20,
                                  }}
                                  icon="mdi:delete-outline"
                                />
                              </IconButton>
                            </Stack>
                          </Stack>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              onSave(groups);
              handleClose();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <DialogTitle>{editGroup ? 'Edit Group' : 'Add Group'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <TextField
              label="Group Name"
              value={editGroup?.name || ''}
              onChange={(e) =>
                setEditGroup((prev) => (prev ? { ...prev, name: e.target.value } : null))
              }
              error={Boolean(error)}
              helperText={error}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editGroup?.hideFromClient || false}
                  onChange={(e) =>
                    setEditGroup((prev) =>
                      prev ? { ...prev, hideFromClient: e.target.checked } : null
                    )
                  }
                />
              }
              label="Hide from Client"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveGroup}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        title="Delete Group"
        content="Are you sure you want to delete this group?"
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        action={
          <Button
            variant="contained"
            onClick={() => {
              confirmDelete.onFalse();
              if (deleteTarget) handleDeleteGroup(deleteTarget);
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

export default ManageGroupModal;
