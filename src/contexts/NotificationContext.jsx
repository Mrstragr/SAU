import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuthStore();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (!socket || !user) return;

        // Join user-specific room
        if (user.role === 'student') {
            socket.emit('join_student', user.id);
        } else if (user.role === 'driver') {
            socket.emit('join_driver', user.id);
        }

        // Listen for trip requests (Driver)
        socket.on('trip_request', (trip) => {
            toast((t) => (
                <div className="flex items-start">
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">New Trip Request!</p>
                        <p className="mt-1 text-sm text-gray-500">
                            From: {trip.startLocation} <br />
                            To: {trip.endLocation}
                        </p>
                    </div>
                </div>
            ), { duration: 5000, icon: '🚖' });

            setNotifications(prev => [{
                id: Date.now(),
                type: 'trip_request',
                message: `New trip request from ${trip.startLocation}`,
                timestamp: new Date(),
                read: false
            }, ...prev]);
        });

        // Listen for status updates (Student)
        socket.on('trip_status_update', (data) => {
            toast.success(data.message, { duration: 4000 });

            setNotifications(prev => [{
                id: Date.now(),
                type: 'status_update',
                message: data.message,
                timestamp: new Date(),
                read: false
            }, ...prev]);
        });

        return () => {
            socket.off('trip_request');
            socket.off('trip_status_update');
        };
    }, [socket, user]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, markAsRead, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
