import React, { useRef, useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import * as faceapi from 'face-api.js';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import Copyright from '../internals/components/Copyright';

import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function Absensi(props) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const videoStreamRef = useRef(null);

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [karyawanDescriptors, setKaryawanDescriptors] = useState([]);
    const [karyawanFotoMap, setKaryawanFotoMap] = useState({});
    const [status, setStatus] = useState('Memuat model dan data karyawan...');
    const [matchedFoto, setMatchedFoto] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [waktuSekarang, setWaktuSekarang] = useState(null);
    // Jam realtime
    const [currentTime, setCurrentTime] = useState(new Date());

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const fetchWaktuSekarang = async () => {
        try {
            const res = await axios.get('/api/pengaturan-waktu/now');
            setWaktuSekarang(res.data); // simpan data ke state
        } catch (err) {
            console.error('Gagal fetch waktu sekarang:', err);
            setWaktuSekarang(null);
        }
    };
    useEffect(() => {
        fetchWaktuSekarang();
        const intervalId = setInterval(fetchWaktuSekarang, 30000); // 30 detik

        return () => clearInterval(intervalId);
    }, []);
    // Update jam realtime tiap detik
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Load model face-api
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                setStatus('Model berhasil dimuat');
            } catch (err) {
                console.error('Gagal memuat model face-api:', err);
                setStatus('Gagal memuat model face-api');
            }
        };
        loadModels();
    }, []);

    // Load data karyawan + descriptor
    useEffect(() => {
        if (!modelsLoaded) return;

        const loadKaryawanDescriptors = async () => {
            try {
                const res = await axios.get('/api/karyawan');
                const labeledDescriptors = [];
                const fotoMap = {};

                for (const karyawan of res.data) {
                    const fotoUrl = karyawan.foto;
                    fotoMap[karyawan.id.toString()] = fotoUrl;

                    const img = await faceapi.fetchImage(fotoUrl);
                    const detection = await faceapi
                        .detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!detection) {
                        console.warn(`Wajah tidak terdeteksi pada karyawan ${karyawan.nama}`);
                        continue;
                    }

                    labeledDescriptors.push(
                        new faceapi.LabeledFaceDescriptors(karyawan.id.toString(), [detection.descriptor])
                    );
                }

                setKaryawanDescriptors(labeledDescriptors);
                setKaryawanFotoMap(fotoMap);
                setStatus('Model dan data karyawan siap');
                startVideo();
            } catch (error) {
                console.error('Error loading karyawan descriptors:', error);
                setStatus('Gagal memuat data karyawan');
            }
        };

        loadKaryawanDescriptors();

        // Cleanup video stream saat komponen unmount
        return () => {
            if (videoStreamRef.current) {
                videoStreamRef.current.getTracks().forEach(track => track.stop());
                videoStreamRef.current = null;
            }
        };
    }, [modelsLoaded]);

    // Start webcam video
    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoStreamRef.current = stream;
                }
            })
            .catch(err => {
                setStatus('Tidak dapat mengakses webcam');
                console.error(err);
            });
    };

    // Ambil foto frame dari video
    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video) return null;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL('image/jpeg');
    };

    // Face recognition loop
    useEffect(() => {
        if (!modelsLoaded || karyawanDescriptors.length === 0) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        const faceMatcher = new faceapi.FaceMatcher(karyawanDescriptors, 0.6);

        let isComponentMounted = true;

        const interval = setInterval(async () => {
            if (!isComponentMounted) return;
            if (video.paused || video.ended || isUploading) return;

            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let foundMatch = false;

            for (const detection of resizedDetections) {
                const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                const box = detection.detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
                drawBox.draw(canvas);

                if (bestMatch.label !== 'unknown') {
                    foundMatch = true;
                    setMatchedFoto(karyawanFotoMap[bestMatch.label]);

                    if (!isUploading) {
                        setIsUploading(true);
                        const fotoBase64 = capturePhoto();

                        try {
                            const response = await axios.post('/api/absensi/add', {
                                id_karyawan: bestMatch.label,
                                foto: fotoBase64,
                                id_waktu: waktuSekarang?.id
                            });

                            const msg = response.data.message || `Absensi tercatat untuk ID: ${bestMatch.label}`;
                            setStatus(msg);
                            showSnackbar(msg, 'success');
                        } catch (error) {
                            const errorMsg = error.response?.data?.message || 'Gagal mencatat absensi';
                            setStatus(errorMsg);
                            console.error(error);
                            showSnackbar(errorMsg, 'error');
                        }

                        setIsUploading(false);
                    }
                    break;
                }
            }

            if (!foundMatch) {
                setMatchedFoto(null);
                setStatus('Wajah tidak dikenali');
            }
        }, 3000);

        return () => {
            isComponentMounted = false;
            clearInterval(interval);
        };
    }, [modelsLoaded, karyawanDescriptors, karyawanFotoMap, isUploading]);

    // Format jam: HH:mm:ss
    const formatTime = (date) =>
        date.toLocaleString('id-ID', {
            weekday: 'long',       // Hari: Minggu, Senin, ...
            year: 'numeric',
            month: 'long',         // Bulan panjang: Januari, Februari, ...
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false          // Format 24 jam
        });

    // Snackbar handlers
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
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

                            <Typography component="h2" variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                                {/* Tampilkan nama waktu sekarang jika ada */}
                                {waktuSekarang ? waktuSekarang.nama : 'Memuat pengaturan waktu...'}
                            </Typography>
                            <Box display="flex" justifyContent="center" mb={2}>
                                <Typography variant="h6" fontFamily="monospace" fontWeight="bold" color="text.primary">
                                    {formatTime(currentTime)}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="flex-start" gap={2}>
                                {/* Video & Canvas */}
                                <Paper elevation={3} sx={{ position: 'relative', width: 720, height: 560 }}>
                                    <video
                                        ref={videoRef}
                                        width="590"
                                        height="560"
                                        autoPlay
                                        muted
                                        style={{ position: 'absolute', top: 0, left: 0 }}
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        width="720"
                                        height="560"
                                        style={{ position: 'absolute', top: 0, left: 0 }}
                                    />
                                </Paper>

                                {/* Foto Karyawan */}
                                <Paper
                                    elevation={3}
                                    sx={{
                                        width: 720,
                                        height: 560,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {matchedFoto ? (
                                        <Box
                                            component="img"
                                            src={matchedFoto}
                                            alt="Foto Karyawan"
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic" align="center">
                                            Tidak ada wajah terdeteksi
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>

                            <Typography sx={{ mt: 2, mb: 2, textAlign: 'center' }}>{status}</Typography>

                            <Copyright sx={{ my: 4 }} />
                        </Box>
                    </Stack>
                </Box>

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
