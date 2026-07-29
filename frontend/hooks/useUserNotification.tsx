"use client";
import React from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook that shows a green success toast only for notifications that belong to the
 * currently logged‑in user. This prevents duplicate snackbars when the backend
 * creates notifications for multiple roles (customer, professional, admin).
 */
export function useUserNotification() {
  const { user } = useAuth(); // assumes session provides user._id

  const handle = (notif: {
    title: string;
    body: string;
    type: string;
    userId: string;
  }) => {
    // Guard: only show toast for the logged‑in user
    if (!user || notif.userId !== user._id.toString()) return;

    // Green success toast – used for the "Job started" notification
    toast.success(
      <div>
        <strong>{notif.title}</strong>
        <div>{notif.body}</div>
      </div>,
      {
        theme: 'colored',
        position: 'top-right',
        autoClose: 3000,
      }
    );
  };

  return { handle };
}
