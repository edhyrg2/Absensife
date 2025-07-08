import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function ProtectedRoute({ children }) {
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsValid(false);
            return;
        }

        axios.get('http://localhost:3001/api/user/verify-token', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => setIsValid(true))
            .catch(() => {
                localStorage.removeItem('token');
                setIsValid(false);
            });
    }, []);

    if (isValid === null) return <div>Loading...</div>;
    if (isValid === false) return <Navigate to="/" replace />;
    return children;
}
