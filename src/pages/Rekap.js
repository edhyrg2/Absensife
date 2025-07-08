import * as React from 'react';
import axios from '../utils/axiosInstance';
import { DataGrid } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import Copyright from '../internals/components/Copyright';

import {

    treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {

    ...treeViewCustomizations,
};

export default function RekapAbsensi(props) {
    const [rekap, setRekap] = React.useState([]);
    const [filteredRekap, setFilteredRekap] = React.useState([]);
    const [dateRange, setDateRange] = React.useState([null, null]);
    const [loading, setLoading] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [modalFoto, setModalFoto] = React.useState(null);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [editData, setEditData] = React.useState(null); // data asli dari response
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [karyawanList, setKaryawanList] = React.useState([]);
    const [selectedKaryawan, setSelectedKaryawan] = React.useState(null);
    const [dialogMode, setDialogMode] = React.useState('add');
    const [formData, setFormData] = React.useState({
        id_karyawan: '',
        tanggal: '',
        waktu_mulai: '',
        waktu_selesai: '',
        note: '',
    });
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const [startDate, endDate] = dateRange;

    const fetchRekap = async () => {
        setLoading(true);
        try {
            const params = {};
            if (startDate) params.start = startDate.toISOString().split('T')[0];
            if (endDate) params.end = endDate.toISOString().split('T')[0];

            const res = await axios.get('/api/absensi/rekap', { params });
            setRekap(res.data);
            setFilteredRekap(res.data);
            showSnackbar('Data rekap absensi berhasil dimuat', 'success');
        } catch (error) {
            console.error('Gagal mengambil data rekap:', error);
            setRekap([]);
            setFilteredRekap([]);
            showSnackbar('Gagal mengambil data rekap', 'error');
        }
        setLoading(false);
    };
    React.useEffect(() => {
        const fetchKaryawan = async () => {
            try {
                const res = await axios.get('/api/karyawan');
                // Asumsikan data karyawan ada di res.data, dan bentuknya array
                setKaryawanList(res.data);
            } catch (error) {
                console.error('Gagal fetch data karyawan:', error);
            }
        };

        fetchKaryawan();
    }, []);

    const handleSave = async () => {
        const requiredFields = {
            id_karyawan: formData.id_karyawan,
            tanggal: formData.tanggal,
            waktu_mulai: formData.waktu_mulai,
            waktu_selesai: formData.waktu_selesai,
            note: formData.note,
        };

        const emptyFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value || value.toString().trim() === '')
            .map(([key]) => key);

        if (emptyFields.length > 0) {
            showSnackbar(`Kolom berikut belum diisi: ${emptyFields.join(', ')}`, 'warning');
            return;
        }

        try {
            const payload = {
                id_karyawan: formData.id_karyawan,
                tanggal: formData.tanggal,
                waktu_masuk: formData.waktu_mulai,
                waktu_keluar: formData.waktu_selesai,
                note: formData.note,
            };

            if (dialogMode === 'add') {
                await axios.post('/api/absensi', payload);
                showSnackbar('Absen berhasil ditambahkan');
            } else {
                // edit mode, gunakan PUT/PATCH dengan id
                await axios.put(`/api/absensi/${formData.id}`, payload);
                showSnackbar('Absen berhasil diperbarui');
            }

            setAddDialogOpen(false);
            fetchRekap();
        } catch (error) {
            console.error('Gagal menyimpan absen:', error);
            showSnackbar('Gagal menyimpan absen', 'error');
        }
    };

    const formatDatetimeLocal = (datetime) => {
        if (!datetime) return '';
        const d = new Date(datetime);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    const formatTime = (datetime) => {
        if (!datetime) return '';
        const [hh, mm] = datetime.split(':');
        return `${hh}:${mm}`;
    };

    React.useEffect(() => {
        fetchRekap();
    }, [startDate, endDate]);

    React.useEffect(() => {
        if (searchText === '') {
            setFilteredRekap(rekap);
        } else {
            const lowercasedFilter = searchText.toLowerCase();
            const filteredData = rekap.filter(item => {
                return (
                    item.nama?.toLowerCase().includes(lowercasedFilter) ||
                    item.tim?.toLowerCase().includes(lowercasedFilter)
                );
            });
            setFilteredRekap(filteredData);
        }
    }, [searchText, rekap]);
    React.useEffect(() => {
        if (editDialogOpen && editData) {
            setFormData((prev) => ({
                ...prev,
                waktu_mulai: formatTime(editData.waktu_masuk),
                waktu_selesai: formatTime(editData.waktu_keluar),
            }));
        }
    }, [editDialogOpen, editData]);
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const columns = [
        {
            field: 'nomor',
            headerName: 'No',
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                // Mendapatkan indeks baris relatif terhadap halaman saat ini
                const index = params.api.getRowIndexRelativeToVisibleRows(params.id);
                return index + 1;
            }
        },
        { field: 'nama', headerName: 'Nama', flex: 2 },
        { field: 'tim', headerName: 'Tim', flex: 1 },
        { field: 'tanggal', headerName: 'Tanggal', flex: 1 },
        { field: 'waktu_masuk', headerName: 'Waktu Masuk', flex: 1 },
        { field: 'waktu_keluar', headerName: 'Waktu Pulang', flex: 1 },

        {
            field: 'foto_masuk',
            headerName: 'Foto Masuk',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <img
                    src={`http://localhost:3001/${params.row.foto_masuk}`}
                    alt="Foto Masuk"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => setModalFoto(`http://localhost:3001/${params.row.foto_masuk}`)}
                />
            ),
        },
        {
            field: 'foto_keluar',
            headerName: 'Foto Pulang',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <img
                    src={`http://localhost:3001/${params.row.foto_keluar}`}
                    alt="Foto Keluar"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => setModalFoto(`http://localhost:3001/${params.row.foto_keluar}`)}
                />
            ),
        },
        { field: 'note', headerName: 'Note', flex: 1 },
        {
            field: 'actions',
            headerName: 'Aksi',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleEditClick(params.row)}
                >
                    <EditIcon />
                </IconButton>
            ),
        },
    ];

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };
    const handleAddClick = () => {
        setDialogMode('add');
        setSelectedKaryawan(null);
        setFormData({
            id_karyawan: '',
            tanggal: '',
            waktu_mulai: '',
            waktu_selesai: '',
            note: '',
        });
        setAddDialogOpen(true);
    };

    // Saat membuka dialog edit
    const handleEditClick = (row) => {
        setDialogMode('edit');
        setSelectedKaryawan(karyawanList.find(k => k.id === row.id_karyawan) || null);
        setFormData({
            id_karyawan: row.id_karyawan,
            tanggal: row.tanggal,
            waktu_mulai: formatTime(row.waktu_masuk),
            waktu_selesai: formatTime(row.waktu_keluar),
            note: row.note || '',
            id: row.id, // Simpan id record yang diedit
        });
        setAddDialogOpen(true);
    };

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
                    <Stack spacing={2} sx={{ mx: 3, pb: 5 }}>
                        <Header />
                        <Box sx={{ width: '100%' }}>
                            <Button variant="contained" onClick={handleAddClick} sx={{ mb: 2 }} >Tambah Absen</Button>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems="center">
                                <DatePicker
                                    selectsRange
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={(update) => setDateRange(update)}
                                    isClearable
                                    placeholderText="Pilih rentang tanggal"
                                    dateFormat="yyyy-MM-dd"
                                    customInput={
                                        <TextField
                                            label="Rentang Tanggal"
                                            size="small"
                                            sx={{ minWidth: 220 }}
                                        />
                                    }
                                />
                                <TextField
                                    label="Cari nama atau tim"
                                    size="small"
                                    value={searchText}
                                    onChange={handleSearchChange}
                                    sx={{ flexGrow: 1, minWidth: 200 }}
                                />
                            </Stack>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                                    <CircularProgress color="primary" />
                                </Box>
                            ) : (
                                <div style={{ height: 400, width: '100%' }}>
                                    <DataGrid
                                        rows={filteredRekap}
                                        columns={columns}
                                        getRowId={(row) => row.id}
                                        initialState={{
                                            pagination: { paginationModel: { pageSize: 10 } },
                                        }}
                                        pageSizeOptions={[10, 25, 50]}
                                        disableRowSelectionOnClick
                                        autoHeight
                                    />
                                </div>
                            )}
                        </Box>
                        <Copyright sx={{ my: 4 }} />
                    </Stack>
                </Box>

                {/* Modal Foto */}
                <Dialog
                    open={Boolean(modalFoto)}
                    onClose={() => setModalFoto(null)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1, pt: 1 }}>
                            <IconButton onClick={() => setModalFoto(null)} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <img
                            src={modalFoto}
                            alt="Foto Besar"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 6 }}
                        />
                    </DialogContent>
                </Dialog>
                <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{dialogMode === 'add' ? 'Tambah Absen' : 'Edit Absen'}</DialogTitle>
                    <DialogContent>
                        <Autocomplete
                            options={karyawanList}
                            getOptionLabel={(option) => option.nama || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={selectedKaryawan}
                            onChange={(event, newValue) => {
                                setSelectedKaryawan(newValue);
                                setFormData(prev => ({ ...prev, id_karyawan: newValue ? newValue.id : '' }));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Karyawan" margin="normal" fullWidth />
                            )}
                        />
                        <TextField
                            margin="normal"
                            label="Tanggal"
                            type="date"
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            margin="normal"
                            label="Waktu Mulai"
                            type="time"
                            name="waktu_mulai"
                            value={formData.waktu_mulai}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            margin="normal"
                            label="Waktu Selesai"
                            type="time"
                            name="waktu_selesai"
                            value={formData.waktu_selesai}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            margin="normal"
                            label="Note"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            rows={3}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddDialogOpen(false)}>Batal</Button>
                        <Button variant="contained" onClick={handleSave}>
                            Simpan
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