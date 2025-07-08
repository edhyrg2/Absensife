import * as React from 'react';
import axios from '../utils/axiosInstance';

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import Copyright from '../internals/components/Copyright';
import { DataGrid } from '@mui/x-data-grid';

import {

    treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {

    ...treeViewCustomizations,
};

export default function Dashboard(props) {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const [searchText, setSearchText] = React.useState('');

    // Dialog states
    const [openDialog, setOpenDialog] = React.useState(false);
    const [editUserId, setEditUserId] = React.useState(null);
    const [formData, setFormData] = React.useState({ username: '', password: '' });

    // Delete confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [deleteUserId, setDeleteUserId] = React.useState(null);

    const [karyawanList, setKaryawanList] = React.useState([]);
    const [selectedKaryawan, setSelectedKaryawan] = React.useState(null);
    // Snackbar notification
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success',
    });



    // Load data user dari API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/user');
            setRows(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Gagal mengambil data user', 'error');
        } finally {
            setLoading(false);
        }
    };
    const fetchKaryawan = async () => {
        try {
            const res = await axios.get('/api/karyawan'); // Ganti dengan endpoint kamu
            setKaryawanList(res.data);
        } catch (error) {
            console.error('Error fetching karyawan:', error);
            showSnackbar('Gagal mengambil data karyawan', 'error');
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    // Handler input search
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    // Filter rows sesuai searchText di username
    const filteredRows = rows.filter((row) =>
        row.username.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditUserId(null);
        setFormData({ username: '', password: '', id_karyawan: null });
        setSelectedKaryawan(null);
        fetchKaryawan();
        setOpenDialog(true);
    };

    const [showPassword, setShowPassword] = React.useState(false);

    const handleOpenEdit = (id) => {
        const user = rows.find((r) => r.id === id);
        if (user) {
            setEditUserId(id);
            setFormData({
                username: user.username,
                password: user.password_teks || '',
                id_karyawan: user.id_karyawan || null
            });
            setSelectedKaryawan(
                karyawanList.find(k => k.id === user.id_karyawan) || null
            );
            setShowPassword(false);
            fetchKaryawan();
            setOpenDialog(true);
        }
    };

    const handleToggleShowPassword = () => {
        setShowPassword((show) => !show);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (!formData.username.trim()) {
                showSnackbar('Username tidak boleh kosong', 'warning');
                return;
            }
            if (!editUserId && !formData.password.trim()) {
                showSnackbar('Password tidak boleh kosong untuk user baru', 'warning');
                return;
            }

            if (editUserId) {
                // Update user
                await axios.put(`/api/user/${editUserId}`, formData);
                showSnackbar('User berhasil diperbarui', 'success');
            } else {
                // Tambah user
                await axios.post('/api/user', formData);
                showSnackbar('User berhasil ditambahkan', 'success');
            }
            fetchUsers();
            setOpenDialog(false);
        } catch (error) {
            console.error('Error saving user:', error);
            showSnackbar('Gagal menyimpan user', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteUserId(id);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteUserId(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/user/${deleteUserId}`);
            showSnackbar('User berhasil dihapus', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showSnackbar('Gagal menghapus user', 'error');
        } finally {
            setOpenDeleteDialog(false);
            setDeleteUserId(null);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const columns = [
        {
            field: 'nomor',
            headerName: 'No',
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                // Mendapatkan indeks baris relatif terhadap halaman saat ini
                const index = params.api.getRowIndexRelativeToVisibleRows(params.id);
                return index + 1;
            }
        },
        { field: 'nama_karyawan', headerName: 'Nama', flex: 1 },
        { field: 'username', headerName: 'Username', flex: 1 },
        {
            field: 'actions',
            headerName: 'Aksi',
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenEdit(params.row.id)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                <SideMenu />
                <AppNavbar />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars
                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                    })}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            alignItems: 'center',
                            mx: 3,
                            pb: 5,
                            mt: { xs: 8, md: 0 },
                        }}
                    >
                        <Header />
                        <Box sx={{ width: '100%' }}>

                            <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenAdd}>
                                Tambah Admin
                            </Button>

                            {/* Input search */}
                            <Box sx={{
                                mb: 2,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                flexWrap: 'wrap',
                                width: 300,
                                ml: 'auto',
                            }}>
                                <TextField
                                    label="Cari username"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={searchText}
                                    onChange={handleSearchChange}
                                />
                            </Box>

                            <Box container spacing={2} columns={12}>
                                <DataGrid
                                    checkboxSelection
                                    rows={filteredRows}
                                    columns={columns}
                                    loading={loading}
                                    getRowClassName={(params) =>
                                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                                    }
                                    initialState={{
                                        pagination: { paginationModel: { pageSize: 20 } },
                                    }}
                                    pageSizeOptions={[10, 20, 50]}
                                    disableColumnResize
                                    density="compact"
                                    autoHeight
                                    sx={{ width: '100%' }}
                                />
                            </Box>
                            <Copyright sx={{ my: 4 }} />
                        </Box>
                    </Stack>
                </Box>

                {/* Dialog tambah/edit user */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{editUserId ? 'Edit User' : 'Tambah User'}</DialogTitle>
                    <DialogContent>
                        <Autocomplete
                            options={karyawanList}
                            getOptionLabel={(option) => option.nama || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={selectedKaryawan}
                            onChange={(event, newValue) => {
                                setSelectedKaryawan(newValue);
                                setFormData(prev => ({
                                    ...prev,
                                    id_karyawan: newValue ? newValue.id : null
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Pilih Karyawan"
                                    margin="normal"
                                    fullWidth
                                />
                            )}
                        />
                        <TextField
                            margin="normal"
                            label="Username"
                            name="username"
                            fullWidth
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            fullWidth
                            value={formData.password}
                            onChange={handleChange}
                            helperText={editUserId ? 'Kosongkan jika tidak ingin mengubah password' : ''}
                        />
                        {editUserId && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <input
                                    type="checkbox"
                                    id="showPassword"
                                    checked={showPassword}
                                    onChange={handleToggleShowPassword}
                                    style={{ marginRight: 8 }}
                                />
                                <label htmlFor="showPassword" style={{ userSelect: 'none' }}>
                                    Tampilkan password
                                </label>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Batal</Button>
                        <Button onClick={handleSubmit} variant="contained">
                            Simpan
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog konfirmasi hapus */}
                <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    <DialogContent>
                        <Typography>Apakah Anda yakin ingin menghapus user ini?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog}>Batal</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                            Hapus
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                        elevation={6}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </AppTheme>
    );
}
