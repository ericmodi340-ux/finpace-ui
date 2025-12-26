import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { forwardRef, useEffect, useCallback, ReactNode } from 'react';
// @mui
import { Box, BoxProps } from '@mui/material';
// redux
import { useSelector } from 'redux/store';
// utils
import track from '../utils/analytics';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  children: ReactNode;
  title?: string;
}

const Page = forwardRef<HTMLDivElement, Props>(({ children, title = '', ...other }, ref) => {
  const { pathname } = useLocation();
  const { firm } = useSelector((state) => state.firm);

  const sendPageViewEvent = useCallback(() => {
    track.pageview({
      page_path: pathname,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sendPageViewEvent();
  }, [sendPageViewEvent]);

  return (
    <Box ref={ref} {...other}>
      <Helmet>
        <title>{`${title} | ${
          firm?.whiteLabel ? firm.customDomainTitle || firm.name : 'Finpace'
        }`}</title>
      </Helmet>
      {children}
    </Box>
  );
});

export default Page;
