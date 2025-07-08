// src/menuItems.js
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';

export const mainListItems = [
    { text: 'Home', icon: <HomeRoundedIcon />, path: '/' },
    { text: 'Absensi', icon: <AnalyticsRoundedIcon />, path: '/absensi' },
    { text: 'Karyawan', icon: <WorkRoundedIcon />, path: '/karyawan' },
    { text: 'Rekap', icon: <AssignmentRoundedIcon />, path: '/rekap' },
];

export const secondaryListItems = [
    { text: 'Admin', icon: <PeopleRoundedIcon />, path: '/admin' },
    { text: 'Pengaturan Waktu', icon: <SettingsRoundedIcon />, path: '/pengaturan-waktu' },
    { text: 'About', icon: <InfoRoundedIcon />, path: '/about' },
];
