// NavbarBreadcrumbs.jsx
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from 'react-router-dom';
import { mainListItems, secondaryListItems } from './MenuItems';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  // Gabungkan semua item menu
  const allMenuItems = [...mainListItems, ...secondaryListItems];

  // Cari item yang sesuai dengan path sekarang
  const currentMenu = allMenuItems.find((item) => item.path === location.pathname);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography component="h2" variant="h6">

        {currentMenu ? currentMenu.text : 'Dashboard'}
      </Typography>

      {/* <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
        Home
      </Typography> */}
    </StyledBreadcrumbs>
  );
}
