import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  TextField,
  Grid,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Storage } from 'aws-amplify';
import ImageComp from 'components/Image';
// @ts-ignore
import SignatureCanvas from 'react-signature-canvas';

const base64Signa =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAAjW/WRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEHSURBVHgB7dixTQMwFEXRHybICkzACh4hGxEmYRSSScIGWYGPhGhIXkwBRXyO9Dq3V5ZdBQAA8H829Tvja9yPfXHVw+S50Tv1nnvbAr6N3rncHHDR582xK+CH0XsrWNStN8joHQsWNftIhyUJBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFgJpBtwaJuBXLoPRVw1ak3Crho9M69XcFiNpPnRu+19947hnP7gjsy+4t16D32XgoAAAD4Ex9www+opVvLDwAAAABJRU5ErkJggg==';

type SignatureSelectModalProps = {
  signer: any;
  setActiveSignature: (str: { signatureBase64: string; initialsBase64: string }) => void;
  onClose: () => void;
  open: boolean;
};

const SignatureSelectModal = ({
  signer,
  setActiveSignature,
  onClose,
  open,
}: SignatureSelectModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const [base64Signature, setBase64Signature] = useState('');
  const [base64Initials, setBase64Initials] = useState('');
  const [tab, setTab] = useState<'draw' | 'write'>('write');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const drawSignatureRef = useRef<any>(null);
  const drawInitialsRef = useRef<any>(null);

  const canvas = canvasRef.current;
  const canvas2 = canvasRef2.current;

  const generateSignature = (text: string, canvas: any) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '60px "Dancing Script"';
    const padding = 20;
    canvas.width = 300;
    canvas.height = 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px "Dancing Script"';
    ctx.fillStyle = 'black';
    ctx.fillText(text, padding, 65);
    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    if ((firstName || lastName) && canvas && canvas2) {
      setBase64Signature(generateSignature(`${firstName} ${lastName}`, canvas));
      setBase64Initials(
        generateSignature(
          `${firstName ? firstName[0] : ''} ${lastName ? lastName[0] : ''}`,
          canvas2
        )
      );
    }
  }, [canvas, canvas2, firstName, lastName]);

  const onSave = useCallback(async () => {
    try {
      let finalBase64Signature = base64Signature;
      let final64Initials = base64Initials;

      if (tab === 'draw') {
        const signatureCanvas = drawSignatureRef.current;
        const initialsCanvas = drawInitialsRef.current;
        if (!signatureCanvas || !initialsCanvas)
          return setError('Please draw your signature and initials');
        if (signatureCanvas.isEmpty() || initialsCanvas.isEmpty())
          return setError('Please draw your signature and initials');
        const signatureCanvasData = signatureCanvas.toDataURL('image/png');
        const initialsCanvasData = initialsCanvas.toDataURL('image/png');
        finalBase64Signature = signatureCanvasData;
        final64Initials = initialsCanvasData;
      }

      if (!finalBase64Signature || !final64Initials)
        return setError('Please draw your signature and initials');

      const finalSignature = await combineImages(
        base64Signa,
        finalBase64Signature,
        {
          x: 6,
          y: 3,
        },
        {
          height: 40,
          width: 180,
        }
      );

      const finalInitials = await combineImages(
        base64Signa,
        final64Initials,
        {
          x: 6,
          y: 3,
        },
        {
          height: 40,
          width: 180,
        }
      );

      setActiveSignature({
        signatureBase64: finalSignature,
        initialsBase64: finalInitials,
      });
      const content = {
        signature: finalSignature,
        initials: finalInitials,
        firstName,
        lastName,
      };
      setLoading(true);
      await Storage.put(`signatures/${signer?.email}`, JSON.stringify(content));
      setLoading(false);
      setError('');
      onClose();
    } catch (error) {
      console.log(error);
    }
  }, [
    base64Initials,
    base64Signature,
    firstName,
    lastName,
    onClose,
    setActiveSignature,
    signer?.email,
    tab,
  ]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>Adopt Signature</DialogTitle>
      <DialogContent>
        <Tabs sx={{ mt: 1 }} value={tab} onChange={(e, value) => setTab(value)} variant="fullWidth">
          <Tab value={'write'} label="Type Signature" />
          <Tab value={'draw'} label="Draw Signature" />
        </Tabs>
        {tab === 'write' && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  sx={{ width: '100%', mt: 2 }}
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  sx={{ width: '100%', mt: 2 }}
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
            </Grid>
            <Stack sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Signature Preview</Typography>
              <ImageComp
                sx={{
                  border: 1,
                  borderRadius: 2,
                  borderColor: 'divider',
                  height: 80,
                  zIndex: 1,
                }}
                width={1}
                src={base64Signature}
              />
            </Stack>
            <Stack sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Initials Preview</Typography>
              <ImageComp
                sx={{
                  border: 1,
                  borderRadius: 2,
                  borderColor: 'divider',
                  height: 80,
                  zIndex: 1,
                }}
                width={1}
                src={base64Initials}
              />
            </Stack>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <canvas ref={canvasRef2} style={{ display: 'none' }} />
          </>
        )}

        {tab === 'draw' && (
          <>
            <Stack sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Draw Signature</Typography>
              <Stack
                bgcolor={'background.paper'}
                sx={{
                  mt: 1,
                  border: 1,
                  borderRadius: 2,
                  borderColor: 'divider',
                  height: 80,
                  zIndex: 1,
                }}
              >
                <SignatureCanvas ref={drawSignatureRef} canvasProps={{ className: 'signPad' }} />
              </Stack>
            </Stack>
            <Stack sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Initials Preview</Typography>
              <Stack
                bgcolor={'background.paper'}
                sx={{
                  mt: 1,
                  border: 1,
                  borderRadius: 2,
                  borderColor: 'divider',
                  height: 80,
                  zIndex: 1,
                }}
              >
                <SignatureCanvas ref={drawInitialsRef} canvasProps={{ className: 'signPad' }} />
              </Stack>
            </Stack>
          </>
        )}

        {!!error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <LoadingButton
          variant="contained"
          loading={loading}
          onClick={onSave}
          sx={{ width: '100%', mt: 2 }}
        >
          Adopt Signature
        </LoadingButton>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(SignatureSelectModal);

async function combineImages(
  mainImageSrc: string,
  placeholderImageSrc: string,
  position: { x: number; y: number },
  size?: { width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Load main image
    const mainImage = new Image();
    const placeholderImage = new Image();

    mainImage.crossOrigin = 'anonymous';
    placeholderImage.crossOrigin = 'anonymous';

    // Assign onload before setting src for mainImage
    mainImage.onload = () => {
      // Set canvas dimensions to match the main image
      canvas.width = mainImage.width;
      canvas.height = mainImage.height;

      // Draw the main image onto the canvas
      ctx.drawImage(mainImage, 0, 0);

      // Assign onload before setting src for placeholderImage
      placeholderImage.onload = async () => {
        const { x, y } = position;

        // If size is provided, resize the placeholder image
        if (size) {
          const { width, height } = size;
          ctx.drawImage(placeholderImage, x, y, width, height);
        } else {
          // Draw placeholder image at its original size
          ctx.drawImage(placeholderImage, x, y);
        }

        const signatureId = await stringToId(placeholderImageSrc);

        // Add unique text below the placeholder image
        ctx.font = '10px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(signatureId, x + 14, y + (size ? size.height : placeholderImage.height) + 14);

        // Resolve with the combined image as a data URL
        resolve(canvas.toDataURL('image/png'));
      };
      placeholderImage.src = placeholderImageSrc;
    };
    mainImage.src = mainImageSrc;

    mainImage.onerror = (err) => {
      reject(err);
    };

    placeholderImage.onerror = (err) => {
      reject(err);
    };
  });
}

async function stringToId(inputStr: string) {
  // Step 1: Convert the input string to a Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(inputStr);

  // Step 2: Hash the data using SHA-256 via Web Crypto API
  return crypto.subtle.digest('SHA-256', data).then((hashBuffer) => {
    // Step 3: Convert the hash buffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Step 4: Format the first 16 characters of the hash as xxxx-xxxx-xxxx-xxxx
    const formattedId =
      hashHex.slice(0, 4) +
      '-' +
      hashHex.slice(4, 8) +
      '-' +
      hashHex.slice(8, 12) +
      '-' +
      hashHex.slice(12, 16);

    return formattedId;
  });
}
