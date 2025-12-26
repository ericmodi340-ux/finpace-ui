import { TemplateManager, FormBuilderFieldsMapping } from '../@types/template';

// ----------------------------------------------------------------------

export function getTemplateName(template?: TemplateManager) {
  if (!template) return '';
  return template.title || '';
}

export function mapPages(formPages: any) {
  let pages: FormBuilderFieldsMapping[] = [] as FormBuilderFieldsMapping[];
  pages = formPages.map((item: any) => {
    const page: FormBuilderFieldsMapping = { ...item };
    return page;
  });
  return pages;
}
