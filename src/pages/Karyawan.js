import * as React from 'react';
import axios from '../utils/axiosInstance';

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogContent from '@mui/material/DialogContent';
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

    // Modal foto
    const [openModal, setOpenModal] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState(null);

    const [openDialog, setOpenDialog] = React.useState(false);
    const [editUserId, setEditUserId] = React.useState(null);
    const [formData, setFormData] = React.useState({ nip: '', jabatan: '', tim: '', jabatan: '', foto: '' });

    // Delete confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [deleteUserId, setDeleteUserId] = React.useState(null);

    // Snackbar notification
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const fetchKaryawan = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/karyawan');
            setRows(res.data);
        } catch (error) {
            console.error('Error fetching karyawan:', error);
            showSnackbar('Gagal mengambil data karyawan', 'error');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchKaryawan();
    }, []);
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Klik foto untuk buka modal preview
    const handleFotoClick = (row) => {
        setSelectedRow(row);
        setOpenModal(true);
    };
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, foto: file }));
            setPreviewFoto(URL.createObjectURL(file)); // string URL
        }
    };


    const [previewFoto, setPreviewFoto] = React.useState([]);

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRow(null);
    };
    const handleOpenAdd = () => {
        setEditUserId(null);
        setFormData({
            nip: '',
            nama: '',
            tim: '',
            jabatan: '',
            foto: '',
        });
        setOpenDialog(true);
    };

    // Tombol Edit
    const handleEdit = (row) => {
        setEditUserId(row.id);
        setFormData({
            nip: row.nip || '',
            nama: row.nama || '',
            tim: row.tim || '',
            jabatan: row.jabatan || '',
            foto: row.foto || '',
        });
        setOpenDialog(true);
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
            await axios.delete(`/api/karyawan/${deleteUserId.id}`);
            showSnackbar('User berhasil dihapus', 'success');
            fetchKaryawan();
        } catch (error) {
            console.error('Error deleting user:', error);
            showSnackbar('Gagal menghapus user', 'error');
        } finally {
            setOpenDeleteDialog(false);
            setDeleteUserId(null);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Submit tambah atau edit data karyawan
    const handleSubmit = async () => {
        if (!formData.nip.trim() || !formData.nama.trim()) {
            showSnackbar('NIP dan Nama harus diisi', 'warning');
            return;
        }
        try {
            // Buat FormData baru
            const data = new FormData();
            data.append('nip', formData.nip);
            data.append('nama', formData.nama);
            data.append('tim', formData.tim);
            data.append('jabatan', formData.jabatan);

            // Jika formData.foto adalah File (hasil upload), append ke FormData
            if (formData.foto && formData.foto instanceof File) {
                data.append('foto', formData.foto);
            }

            if (editUserId) {
                // Update karyawan dengan FormData, jangan set Content-Type manual
                await axios.put(`/api/karyawan/${editUserId}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                showSnackbar('Data karyawan berhasil diperbarui', 'success');
            } else {
                // Tambah karyawan baru dengan FormData
                await axios.post('/api/karyawan', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                showSnackbar('Data karyawan berhasil ditambahkan', 'success');
            }
            fetchKaryawan();
            setOpenDialog(false);
        } catch (error) {
            console.error('Error menyimpan data:', error);
            showSnackbar('Gagal menyimpan data karyawan', 'error');
        }
    };


    // Filter data sesuai search
    const filteredRows = rows.filter((row) =>
        row.nama.toLowerCase().includes(searchText.toLowerCase())
    );

    // Kolom DataGrid
    const columns = [
        {
            field: 'nomor',
            headerName: 'No',
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
            },
        },
        { field: 'nip', headerName: 'NIP', width: 150 },
        { field: 'nama', headerName: 'Nama', flex: 1 },
        { field: 'tim', headerName: 'Tim', width: 150 },
        { field: 'jabatan', headerName: 'Jabatan', width: 150 },
        {
            field: 'foto',
            headerName: 'Foto',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <img
                    src={params.value}
                    alt={params.row.nama}
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                    }}
                    onClick={() => handleFotoClick(params.row)}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                    }}
                />
            ),
        },
        {
            field: 'aksi',
            headerName: 'Aksi',
            width: 160,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(params.row)}
                        aria-label="edit"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(params.row)}
                        aria-label="delete"
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
                                Tambah Karyawan
                            </Button>
                            <Box
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    flexWrap: 'wrap',
                                    width: 300,
                                    ml: 'auto',
                                }}
                            >
                                <TextField
                                    label="Cari nama"
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
                                        params.indexRelativeToCurrentPage % 2 === 0
                                            ? 'even'
                                            : 'odd'
                                    }
                                    initialState={{
                                        pagination: { paginationModel: { pageSize: 20 } },
                                    }}
                                    pageSizeOptions={[10, 20, 50]}
                                    disableColumnResize
                                    density="compact"
                                    autoHeight
                                    sx={{ width: '100%' }}
                                    getRowId={(row) => row.id} // pastikan id unik tersedia di data
                                />
                            </Box>
                            <Copyright sx={{ my: 4 }} />
                        </Box>
                    </Stack>
                </Box>
            </Box>

            {/* Modal preview foto */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedRow?.nama}</DialogTitle>
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={selectedRow?.foto || '/default-avatar.png'}
                        alt={selectedRow?.nama}
                        style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                        }}
                    />
                </Box>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Tutup</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{editUserId ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        label="NIP"
                        name="nip"
                        fullWidth
                        value={formData.nip}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        label="Nama"
                        name="nama"
                        fullWidth
                        value={formData.nama}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        label="Tim"
                        name="tim"
                        fullWidth
                        value={formData.tim}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        label="Jabatan"
                        name="jabatan"
                        fullWidth
                        value={formData.jabatan}
                        onChange={handleChange}
                    />

                    <Box mt={2}>
                        <Button variant="outlined" component="label" fullWidth>
                            {formData.foto ? 'Ganti Foto' : 'Upload Foto'}
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFotoChange}
                            />
                        </Button>

                        {/* Preview Foto */}
                        {previewFoto && (
                            <Box mt={2} textAlign="center">
                                <Typography variant="body2">Preview Foto:</Typography>
                                <img
                                    src={previewFoto}
                                    alt="Preview Foto"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: 8, borderRadius: 8 }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Batal</Button>
                    <Button onClick={handleSubmit} variant="contained">Simpan</Button>
                </DialogActions>
            </Dialog>



            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogContent>
                    <Typography>Apakah Anda yakin ingin menghapus Karyawan ini?</Typography>
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
        </AppTheme>
    );
}
