import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Alert,
  LinearProgress,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Iconify from 'components/Iconify';
import { useRouter } from 'routes/use-router';
import { PATH_DASHBOARD } from 'routes/paths';
// redux
import { createTemplate } from 'redux/slices/templates';
// utils
import { mapPages } from 'utils/templates';
// constants
import { initialFormFields } from 'constants/templates';
import { EnvelopeSigner } from '../../../@types/envelope';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  border: `1px solid ${theme.palette.grey[300]}`,
  transition: 'all 0.3s ease',
  height: '100%', // Make cards fill the grid item height
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.lighter,
  },
}));

// ----------------------------------------------------------------------

type TemplateCreateMethod = 'json' | 'ai' | 'scratch' | null;

interface TemplateCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TemplateCreateModal({ open, onClose }: TemplateCreateModalProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<TemplateCreateMethod>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setSelectedMethod(null);
    setUploadedFile(null);
    setJsonInput('');
    setError('');
    setIsLoading(false);
    onClose();
  }, [onClose]);

  const handleMethodSelect = useCallback((method: TemplateCreateMethod) => {
    setSelectedMethod(method);
    setError('');
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setUploadedFile(file);
      setError('');
    }
  }, []);

  const handleCreateTemplate = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      let templateData = null;
      let title = 'New Template';

      switch (selectedMethod) {
        case 'json':
          if (!jsonInput.trim()) {
            setError('Please provide JSON data');
            setIsLoading(false);
            return;
          }
          try {
            const jsonData = JSON.parse(jsonInput);
            title = jsonData.title || 'Template from JSON';
            // Convert SurveyJS JSON to template format if needed
            templateData = {
              title,
              dsFieldMapping: {},
              useForOutreachDate: false,
              useForOnboardingDate: false,
              fields: jsonData.pages
                ? [...mapPages(jsonData.pages)]
                : [...mapPages(initialFormFields)],
              signers: [
                { type: EnvelopeSigner.FIRST_INVESTOR, role: 'signer' as const },
                { type: EnvelopeSigner.SECOND_INVESTOR, role: 'cc' as const },
                { type: EnvelopeSigner.ADVISOR, role: 'cc' as const },
                { type: EnvelopeSigner.FIRM, role: 'cc' as const },
              ],
            };
          } catch (e) {
            setError('Invalid JSON format');
            setIsLoading(false);
            return;
          }
          break;

        case 'ai':
          if (!uploadedFile) {
            setError('Please upload a PDF file');
            setIsLoading(false);
            return;
          }

          title = `Template from ${uploadedFile.name.replace('.pdf', '')}`;

          // TODO: Implement PDF to JSON conversion API call
          // const formData = new FormData();
          // formData.append('pdf', uploadedFile);
          // const response = await API.post('your-pdf-conversion-endpoint', formData);
          // const convertedFields = response.data;

          // For now, create a template with default fields
          templateData = {
            title,
            dsFieldMapping: {},
            useForOutreachDate: false,
            useForOnboardingDate: false,
            fields: [...mapPages(initialFormFields)],
            signers: [
              { type: EnvelopeSigner.FIRST_INVESTOR, role: 'signer' as const },
              { type: EnvelopeSigner.SECOND_INVESTOR, role: 'cc' as const },
              { type: EnvelopeSigner.ADVISOR, role: 'cc' as const },
              { type: EnvelopeSigner.FIRM, role: 'cc' as const },
            ],
          };
          break;

        case 'scratch':
          title = 'Untitled ' + new Date().toLocaleString();
          templateData = {
            title,
            dsFieldMapping: {},
            useForOutreachDate: false,
            useForOnboardingDate: false,
            fields: [...mapPages(initialFormFields)],
            signers: [
              { type: EnvelopeSigner.FIRST_INVESTOR, role: 'signer' as const },
              { type: EnvelopeSigner.SECOND_INVESTOR, role: 'cc' as const },
              { type: EnvelopeSigner.ADVISOR, role: 'cc' as const },
              { type: EnvelopeSigner.FIRM, role: 'cc' as const },
            ],
          };
          break;

        default:
          setError('Please select a creation method');
          setIsLoading(false);
          return;
      }

      // Create the template using the existing Redux action
      const response = await createTemplate(templateData);

      if (response?.id) {
        // Navigate to the template edit page
        router.push(`${PATH_DASHBOARD.templates.root}/${response.id}`);
        handleClose();
      } else {
        setError('Failed to create template. Please try again.');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMethod, jsonInput, uploadedFile, router, handleClose]);

  const renderMethodSelection = () => (
    <Grid container spacing={3} sx={{ minHeight: 200, mt: 1 }}>
      <Grid item xs={12} md={4}>
        <StyledCard onClick={() => handleMethodSelect('json')}>
          <CardContent
            sx={{
              textAlign: 'center',
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              minHeight: 200,
            }}
          >
            <Box
              component="img"
              src="/icons/JSON Icon.svg"
              sx={{ width: 48, height: 48, mb: 2, mx: 'auto' }}
              alt="JSON Icon"
            />
            <Typography variant="h6" gutterBottom>
              Create from JSON
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Import an existing JSON schema to create your template
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledCard onClick={() => handleMethodSelect('ai')}>
          <CardContent
            sx={{
              textAlign: 'center',
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              minHeight: 200,
            }}
          >
            <Box
              component="img"
              src="/icons/AI Icon.svg"
              sx={{ width: 48, height: 48, mb: 2, mx: 'auto' }}
              alt="AI Icon"
            />
            <Typography variant="h6" gutterBottom>
              Create with AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload your PDF — Let AI convert it to an easy webform
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledCard onClick={() => handleMethodSelect('scratch')}>
          <CardContent
            sx={{
              textAlign: 'center',
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              minHeight: 200,
            }}
          >
            <Box
              component="img"
              src="/icons/From Scratch Icon.svg"
              sx={{ width: 48, height: 48, mb: 2, mx: 'auto' }}
              alt="From Scratch Icon"
            />
            <Typography variant="h6" gutterBottom>
              Create from Scratch
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start with nothing — build your form field by field
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );

  const renderJsonInput = () => (
    <Box
      sx={{
        px: 1,
      }}
    >
      <Typography
        sx={{
          ml: 5,
        }}
        variant="body2"
        gutterBottom
      >
        Paste your JSON schema below:
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={12}
        placeholder={`{
  "title": "My Form",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "text",
          "name": "firstName",
          "title": "First Name"
        }
      ]
    }
  ]
}`}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        sx={{ mt: 1 }}
      />
    </Box>
  );

  const renderPdfUpload = () => (
    <Box
      sx={{
        px: 1,
      }}
    >
      <Typography
        sx={{
          ml: 5,
        }}
        variant="body2"
        gutterBottom
      >
        Upload your PDF and let AI do the heavy lifting.
      </Typography>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id="pdf-upload"
      />
      <label htmlFor="pdf-upload">
        <UploadBox component="div" sx={{ mt: 2 }}>
          <Box
            component="img"
            src="/icons/Upload PDF Icon.svg"
            sx={{ width: 48, height: 48, mb: 2, mx: 'auto' }}
            alt="Upload PDF Icon"
          />
          <Typography variant="h6" gutterBottom>
            {uploadedFile ? uploadedFile.name : 'Click to upload PDF'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported format: PDF files only
          </Typography>
        </UploadBox>
      </label>
    </Box>
  );

  const renderScratchInfo = () => (
    <Box
      sx={{
        px: 1,
      }}
    >
      <Typography
        sx={{
          ml: 5,
        }}
        variant="body2"
        gutterBottom
      >
        Build whatever you can imagine with our easy-to-create webform engine.
      </Typography>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Box
          component="img"
          src="/icons/Ready Icon.svg"
          sx={{ width: 64, height: 64, mb: 2, mx: 'auto' }}
          alt="Ready Icon"
        />
        <Typography variant="h6" gutterBottom>
          Ready to Build from Scratch?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click '+ Create Template' below to get started on your webform
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {selectedMethod ? (
              <Box display="flex" alignItems="center">
                <IconButton onClick={() => setSelectedMethod(null)} sx={{ mr: 1 }}>
                  <Iconify icon="eva:arrow-back-fill" />
                </IconButton>
                Create New Template
              </Box>
            ) : (
              'Create New Template'
            )}
          </Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading && <LinearProgress sx={{ my: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {!selectedMethod && renderMethodSelection()}
        {selectedMethod === 'json' && renderJsonInput()}
        {selectedMethod === 'ai' && renderPdfUpload()}
        {selectedMethod === 'scratch' && renderScratchInfo()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        {selectedMethod && (
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={isLoading}
            startIcon={isLoading ? null : <Iconify icon="eva:plus-fill" />}
          >
            {isLoading ? 'Creating...' : 'Create Template'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
