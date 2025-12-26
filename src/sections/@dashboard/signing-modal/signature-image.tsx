import React, { useEffect, useState } from 'react';
import Image from 'components/Image';
import { Stack, Typography } from '@mui/material';

function stringToId(inputStr: string) {
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

const SignatureImage = ({ signature, hideId }: { signature: string; hideId?: boolean }) => {
  const [id, setId] = useState('');

  useEffect(() => {
    stringToId(signature).then(setId);
  }, [signature]);

  return (
    <Image
      src={signature}
      sx={{
        width: 1,
        height: 1,
        maxWidth: 200,
        maxHeight: 60,
        // objectFit: 'contain',
      }}
    />
  );
};

export default React.memo(SignatureImage);
