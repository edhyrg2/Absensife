import * as React from 'react';
import axios from '../utils/axiosInstance';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Snackbar, Alert, TextField, Typography, Stack, CssBaseline,
    Select, MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import Copyright from '../internals/components/Copyright';

export default function PengaturanWaktu() {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [editId, setEditId] = React.useState(null);
    const [formData, setFormData] = React.useState({
        nama: '',
        waktu_mulai: '',
        waktu_selesai: ''
    });
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/pengaturan-waktu');
            setRows(res.data);
        } catch (err) {
            showSnackbar('Gagal mengambil data', 'error');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { fetchData(); }, []);

    const handleOpenAdd = () => {
        setEditId(null);
        setFormData({
            nama: '',
            waktu_mulai: '',
            waktu_selesai: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (id) => {
        const data = rows.find(r => r.id === id);
        if (data) {
            setEditId(id);
            setFormData({
                nama: data.nama,
                waktu_mulai: data.waktu_mulai,
                waktu_selesai: data.waktu_selesai
            });
            setOpenDialog(true);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        const { nama, waktu_mulai, waktu_selesai } = formData;
        if (!nama || !waktu_mulai || !waktu_selesai) {
            showSnackbar('Semua field wajib diisi', 'warning');
            return;
        }

        try {
            if (editId) {
                await axios.put(`/api/pengaturan-waktu/${editId}`, {
                    waktu_mulai,
                    waktu_selesai
                });
                showSnackbar('Data berhasil diperbarui');
            } else {
                await axios.post('/api/pengaturan-waktu', {
                    nama,
                    waktu_mulai,
                    waktu_selesai
                });
                showSnackbar('Data berhasil ditambahkan');
            }
            fetchData();
            setOpenDialog(false);
        } catch (err) {
            showSnackbar('Gagal menyimpan data', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/pengaturan-waktu/${deleteId}`);
            showSnackbar('Data berhasil dihapus');
            fetchData();
        } catch (err) {
            showSnackbar('Gagal menghapus data', 'error');
        } finally {
            setOpenDeleteDialog(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        {
            field: 'nomor',
            headerName: 'No',
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const index = params.api.getRowIndexRelativeToVisibleRows(params.id);
                return index + 1;
            }
        },
        { field: 'nama', headerName: 'Nama Waktu', flex: 1 },
        { field: 'waktu_mulai', headerName: 'Jam Mulai', flex: 1 },
        { field: 'waktu_selesai', headerName: 'Jam Selesai', flex: 1 },
        {
            field: 'actions',
            headerName: 'Aksi',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton color="primary" onClick={() => handleOpenEdit(params.row.id)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(params.row.id)}><DeleteIcon /></IconButton>
                </>
            )
        }
    ];

    return (
        <AppTheme>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <SideMenu />
                <AppNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Header />
                    <Button variant="contained" onClick={handleOpenAdd}>Tambah Pengaturan</Button>
                    <Box sx={{ mt: 2 }}>
                        <DataGrid
                            rows={rows}
                            getRowId={(row) => row.id}
                            columns={columns}
                            autoHeight
                            loading={loading}
                            pageSizeOptions={[10, 20, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        />
                    </Box>
                    <Copyright />
                </Box>
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{editId ? 'Edit' : 'Tambah'} Pengaturan Waktu</DialogTitle>
                <DialogContent>
                    {!editId && (
                        <Select
                            name="nama"
                            fullWidth
                            displayEmpty
                            value={formData.nama}
                            onChange={handleChange}
                            variant="outlined"
                            renderValue={(selected) => selected || "Pilih Nama Waktu"}
                            sx={{ mt: 2, mb: 2 }}
                        >
                            <MenuItem value="" disabled>Pilih Nama Waktu</MenuItem>
                            <MenuItem value="Jam Masuk">Jam Masuk</MenuItem>
                            <MenuItem value="Jam Kerja">Jam Kerja</MenuItem>
                            <MenuItem value="Jam Istirahat">Jam Istirahat</MenuItem>
                            <MenuItem value="Jam Pulang">Jam Pulang</MenuItem>
                        </Select>
                    )}
                    <TextField
                        label="Jam Mulai"
                        name="waktu_mulai"
                        type="time"
                        fullWidth
                        margin="normal"
                        value={formData.waktu_mulai}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Jam Selesai"
                        name="waktu_selesai"
                        type="time"
                        fullWidth
                        margin="normal"
                        value={formData.waktu_selesai}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Batal</Button>
                    <Button variant="contained" onClick={handleSubmit}>Simpan</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Hapus Data</DialogTitle>
                <DialogContent>Apakah Anda yakin ingin menghapus data ini?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Batal</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Hapus</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </AppTheme>
    );
}
