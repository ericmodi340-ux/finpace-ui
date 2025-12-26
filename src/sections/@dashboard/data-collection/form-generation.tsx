import { Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { UploadSingleFile } from 'components/upload';
import UploadBox from 'components/upload/UploadBox';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'routes/paths';
import { useRouter } from 'routes/use-router';

export function GenerateFormFromDescription() {
  const [currentText, setCurrentText] = useState('');

  const navigate = useNavigate();

  const onBack = () => {
    navigate(PATH_DASHBOARD.dataCollection.forms);
  };

  return (
    <Stack>
      <Typography variant="subtitle1">Describe your form</Typography>
      <TextField
        sx={{
          mt: 1,
        }}
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        fullWidth
        multiline
        rows={4}
        placeholder="A form to..."
      />
      <Typography
        sx={{
          mt: 2,
        }}
        variant="caption"
      >
        Or, try a sample:
      </Typography>
      <Stack
        sx={{
          mt: 1,
        }}
        flexWrap="wrap"
        direction="row"
        spacing={1}
      >
        <Chip
          onClick={() =>
            setCurrentText(
              'Create a professional and comprehensive Client Profile Form for financial advisors to collect detailed information about their clients'
            )
          }
          size="small"
          label="Know Your Customer"
        />
        <Chip
          onClick={() =>
            setCurrentText(
              'Design a Risk Tolerance Questionnaire for financial advisors to assess their clients risk appetite'
            )
          }
          size="small"
          label="Risk Tolerance Questionnaire"
        />
        <Chip
          onClick={() =>
            setCurrentText(
              'Develop a regulatory-compliant Know Your Customer (KYC) Form for financial advisors. The form should collect necessary details for identity verification and compliance with anti-money laundering regulations'
            )
          }
          size="small"
          label="Client Profile Form"
        />
      </Stack>
      <Stack
        sx={{
          mt: 3,
        }}
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="space-between"
      >
        <Button onClick={onBack} fullWidth variant="outlined">
          Go Back
        </Button>
        <Button
          LinkComponent={Link}
          href={PATH_DASHBOARD.dataCollection.formPreview('123')}
          fullWidth
          variant="contained"
        >
          Generate Form
        </Button>
      </Stack>
    </Stack>
  );
}

export function GenerateFormFromQuestions() {
  const [currentText, setCurrentText] = useState('');

  const navigate = useNavigate();

  const onBack = () => {
    navigate(PATH_DASHBOARD.dataCollection.forms);
  };

  return (
    <Stack>
      <Typography variant="subtitle1">Your form questions</Typography>
      <TextField
        sx={{
          mt: 1,
        }}
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        fullWidth
        multiline
        rows={4}
        placeholder={`Your email address
Your first name (optional)
        `}
      />
      <Typography
        sx={{
          mt: 2,
        }}
        variant="caption"
      >
        Or, try a sample like{' '}
        <Typography
          component="span"
          variant="caption"
          sx={{
            fontWeight: 'bold',
            color: (theme) => theme.palette.primary.main,
            cursor: 'pointer',
          }}
          onClick={() =>
            setCurrentText(`What is your full name?
What is your email address?
What is your phone number? (optional)
What is your company name?
What is your current address?
            `)
          }
        >
          Client Intake
        </Typography>{' '}
      </Typography>
      <Stack
        sx={{
          mt: 3,
        }}
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="space-between"
      >
        <Button onClick={onBack} fullWidth variant="outlined">
          Go Back
        </Button>
        <Button fullWidth disabled={!currentText} variant="contained">
          Generate Form
        </Button>
      </Stack>
    </Stack>
  );
}

export function GenerateFormFromPDF() {
  const navigate = useNavigate();

  const onBack = () => {
    navigate(PATH_DASHBOARD.dataCollection.forms);
  };

  return (
    <Stack>
      <Typography variant="subtitle1">Your form questions</Typography>
      <UploadSingleFile
        sx={{
          mt: 2,
        }}
        file={null}
        accept={{
          'application/pdf': ['.pdf'],
        }}
      />
      <Stack
        sx={{
          mt: 3,
        }}
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="space-between"
      >
        <Button onClick={onBack} fullWidth variant="outlined">
          Go Back
        </Button>
        <Button
          onClick={() => {
            navigate(PATH_DASHBOARD.dataCollection.formPreview('123'));
          }}
          fullWidth
          variant="contained"
        >
          Generate Form
        </Button>
      </Stack>
    </Stack>
  );
}
