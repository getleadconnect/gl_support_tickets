import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  currentAgents: number[];
  onAgentsUpdated: () => void;
}

export function AssignUsersModal({ isOpen, onClose, ticketId, currentAgents, onAgentsUpdated }: AssignUsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/agent-users');
      const allUsers = response.data || [];
      setUsers(allUsers);
      
      // Set currently assigned users
      const assignedUsers = allUsers.filter((user: User) => currentAgents.includes(user.id));
      setSelectedUsers(assignedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selectedIds = selectedUsers.map(u => u.id);
      
      // Remove agents that were deselected
      const agentsToRemove = currentAgents.filter(id => !selectedIds.includes(id));
      for (const agentId of agentsToRemove) {
        try {
          await axios.delete(`/tickets/${ticketId}/agents/${agentId}`);
        } catch (err) {
          console.error(`Error removing agent ${agentId}:`, err);
        }
      }

      // Add new agents
      const agentsToAdd = selectedIds.filter(id => !currentAgents.includes(id));
      for (const agentId of agentsToAdd) {
        try {
          await axios.post(`/tickets/${ticketId}/agents`, { agent_id: agentId });
        } catch (err) {
          console.error(`Error adding agent ${agentId}:`, err);
        }
      }

      toast.success('Agents updated successfully');
      onAgentsUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating agents:', error);
      toast.error('Failed to update agents');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#cdcccc61' }}>
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="bg-gray-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-semibold">Assign Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            
            <div className="relative" ref={dropdownRef}>
              <div 
                className="min-h-[42px] w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer flex items-center justify-between"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="flex flex-wrap gap-2 flex-1">
                  {selectedUsers.length === 0 ? (
                    <span className="text-gray-400">Select agents...</span>
                  ) : (
                    selectedUsers.map(user => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded"
                      >
                        {user.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUser(user.id);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {isLoading ? (
                    <div className="px-3 py-2 text-gray-500">Loading...</div>
                  ) : users.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">No agents available</div>
                  ) : (
                    users.map(user => {
                      const isSelected = selectedUsers.some(u => u.id === user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleUser(user)}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                            {isSelected && (
                              <span className="text-blue-600">✓</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isSubmitting ? 'Updating...' : 'Assign Agents'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}