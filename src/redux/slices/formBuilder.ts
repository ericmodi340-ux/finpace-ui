import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormField } from '../../@types/formBuilder';

interface FormBuilderState {
  numPages: number;
  selectedFieldId: string | null;
  draggedFieldId: string | null;
  scale: number;
  fields: Record<string, FormField>;
}

const initialState: FormBuilderState = {
  numPages: 0,
  selectedFieldId: null,
  draggedFieldId: null,
  scale: 1,
  fields: {},
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    setNumPages(state, action: PayloadAction<number>) {
      state.numPages = action.payload;
    },
    setSelectedField(state, action: PayloadAction<string | null>) {
      state.selectedFieldId = action.payload;
    },
    setDraggedFieldId(state, action: PayloadAction<string | null>) {
      state.draggedFieldId = action.payload;
    },
    setScale(state, action: PayloadAction<number>) {
      state.scale = action.payload;
    },
    setFields(state, action: PayloadAction<Record<string, FormField>>) {
      state.fields = action.payload;
    },
    addField(state, action: PayloadAction<FormField>) {
      const field = action.payload;
      state.fields[field.id] = field;
    },
    updateField(state, action: PayloadAction<FormField>) {
      const field = action.payload;
      state.fields[field.id] = field;

      // Update selectedFieldId if necessary
      if (state.selectedFieldId === field.id) {
        // state.selectedField = field;
      }
    },
    removeField(state, action: PayloadAction<string>) {
      const fieldId = action.payload;
      delete state.fields[fieldId];

      // Clear selectedFieldId if the removed field was selected
      if (state.selectedFieldId === fieldId) {
        state.selectedFieldId = null;
      }
    },
    resetValues(state) {
      state.numPages = 0;
      state.selectedFieldId = null;
      state.draggedFieldId = null;
      state.scale = 1;
      state.fields = {};
    },
  },
});

export const {
  setNumPages,
  setSelectedField,
  setDraggedFieldId,
  setScale,
  setFields,
  addField,
  updateField,
  removeField,
  resetValues,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;
