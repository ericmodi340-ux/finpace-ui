import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import Image from 'components/Image';
import Iconify from 'components/Iconify';
import Carousel, { useCarousel, CarouselArrows } from 'components/carousel';
import { Card, Dialog, DialogContent } from '@mui/material';
import { useState } from 'react';

// ----------------------------------------------------------------------

type ItemProps = {
  id: string;
  name: string;
  duration: string;
  coverUrl: string;
  videoUrl: string;
};

interface Props extends BoxProps {
  title?: string;
  subheader?: string;
  list: ItemProps[];
}

export default function GettingStartedVideos({ title, subheader, list, sx, ...other }: Props) {
  const theme = useTheme();

  const [openDialog, setOpenDialog] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const handleOpenDialog = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const carousel = useCarousel({
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: theme.breakpoints.values.md,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });

  return (
    <Box sx={{ pt: 2, pb: 3, ...sx }} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={<CarouselArrows onNext={carousel.onNext} onPrev={carousel.onPrev} />}
        sx={{
          p: 0,
          mb: 2,
        }}
      />

      <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
        {list.map((item) => (
          <BookingItem key={item.id} item={item} onOpenDialog={handleOpenDialog} />
        ))}
      </Carousel>
      <VideoDialog open={openDialog} onClose={handleCloseDialog} videoUrl={currentVideoUrl} />
    </Box>
  );
}

// ----------------------------------------------------------------------

type BookingItemProps = {
  item: ItemProps;
  onOpenDialog: (videoUrl: string) => void;
};

function BookingItem({ item, onOpenDialog }: BookingItemProps) {
  const { name, duration, coverUrl, videoUrl } = item;

  const handleClick = () => {
    onOpenDialog(videoUrl);
  };

  return (
    <Card
      sx={{
        mr: 3,
        borderRadius: 2,
        position: 'relative',
        boxShadow: 'none',
      }}
      onClick={handleClick}
    >
      <Box sx={{ p: 1, position: 'relative' }}>
        <Image alt={coverUrl} src={coverUrl} ratio="16/9" sx={{ borderRadius: 1.5 }} />
      </Box>
      <Stack
        spacing={2}
        sx={{
          px: 2,
          pb: 2,
          pt: 1,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 70,
        }}
      >
        <Stack justifyContent="space-between" direction="row" alignItems="flex-start" spacing={2}>
          <ListItemText
            primary={name}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
            primaryTypographyProps={{
              variant: 'subtitle1',
              sx: {
                ':hover': {
                  textDecoration: 'underline',
                  cursor: 'pointer',
                },
              },
            }}
          />
          <Stack flexShrink={0} direction="row" alignItems="center">
            <Iconify width={16} icon="solar:calendar-date-bold" sx={{ mr: 0.5, flexShrink: 0 }} />
            {duration}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type VideoDialogProps = {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
};

function VideoDialog({ open, onClose, videoUrl }: VideoDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <iframe
          width="100%"
          height="515"
          src={videoUrl}
          title="YouTube video player"
          // @ts-ignore
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        />
      </DialogContent>
    </Dialog>
  );
}
