import React, { useEffect } from 'react';

interface TicketData {
  id: number;
  tracking_number: string;
  issue: string;
  description?: string;
  due_date?: string;
  status?: string;
  status_id?: number;
  priority?: string;
  priority_id?: number;
}

interface TaskTicketInfoModalProps {
  open: boolean;
  onClose: () => void;
  ticketData: TicketData | null;
}

export function TaskTicketInfoModal({ open, onClose, ticketData }: TaskTicketInfoModalProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  // Don't render if no ticket data
  if (!open || !ticketData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ backgroundColor: '#b7b4b43d' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full z-50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4" style={{ backgroundColor: '#4a5565' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Ticket Details</h2>
              <p className="text-gray-200 text-sm mt-0.5">
                #{ticketData.tracking_number}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Issue */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue</label>
            <p className="mt-1 text-gray-900 font-medium">{ticketData.issue}</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <p className="mt-1 text-gray-700 leading-relaxed">
              {ticketData.description || 'No description available'}
            </p>
          </div>

          {/* Due Date & Status Row */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Due Date */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</label>
              <p className="mt-1 text-gray-900 text-sm">
                {formatDate(ticketData.due_date)}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
              <div className="mt-1">
                {ticketData.status ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                    {ticketData.status}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            style={{ width: '100px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
