import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface User {
  id: number;
  name: string;
  email?: string;
}

interface AssignAgentModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [originalAgents, setOriginalAgents] = useState<number[]>([]); // Original agents from DB
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]); // Currently selected users
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && ticket) {
      // Reset state when modal opens
      setSearchTerm('');
      setDropdownOpen(false);
      fetchUsers();
      // Get fresh agent data from the ticket
      const agents = ticket.agent || [];
      const agentIds = agents.map((a: User) => a.id);
      setOriginalAgents(agentIds); // Store original agents from DB
      setSelectedUsers(agentIds); // Initialize selected with current agents
    } else {
      // Clear state when modal closes
      setSelectedUsers([]);
      setOriginalAgents([]);
      setSearchTerm('');
      setDropdownOpen(false);
    }
  }, [isOpen, ticket]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/agent-users'); // Only get users with role_id=2
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching agent users:', error);
      toast.error('Failed to fetch agent users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleRemoveAgent = async (userId: number) => {
    // Remove from UI immediately
    setSelectedUsers(prev => prev.filter(id => id !== userId));
    
    // If this agent was in the original list (from DB), remove them
    if (originalAgents.includes(userId)) {
      setOriginalAgents(prev => prev.filter(id => id !== userId));
      try {
        await axios.delete(`/tickets/${ticket.id}/agents/${userId}`);
        const user = availableUsers.find(u => u.id === userId);
        toast.success(`${user?.name || 'Agent'} removed successfully`);
        onUpdate(); // Refresh ticket list immediately after removal
      } catch (error) {
        console.error('Error removing agent:', error);
        toast.error('Failed to remove agent');
        // Revert on error
        setSelectedUsers(prev => [...prev, userId]);
        setOriginalAgents(prev => [...prev, userId]);
      }
    }
  };

  const handleAssignAgents = async () => {
    // Find only NEW agents to add (not already in originalAgents)
    const agentsToAdd = selectedUsers.filter(id => !originalAgents.includes(id));

    if (agentsToAdd.length === 0) {
      toast.info('No new agents to add');
      handleClose();
      return;
    }

    setSaving(true);
    try {
      // Send the complete list including new agents
      await axios.put(`/tickets/${ticket.id}`, {
        issue: ticket.issue,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        customer_id: ticket.customer_id,
        assigned_users: selectedUsers
      });

      const addedNames = agentsToAdd
        .map(id => availableUsers.find(u => u.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      
      toast.success(`Added agents: ${addedNames}`);
      onUpdate(); // Refresh ticket list
      handleClose();
    } catch (error) {
      console.error('Error adding agents:', error);
      toast.error('Failed to add agents');
    } finally {
      setSaving(false);
    }
  };

  const getFilteredUsers = () => {
    return availableUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleClose = () => {
    // Clear state and close modal
    setSelectedUsers([]);
    setOriginalAgents([]);
    setSearchTerm('');
    setDropdownOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-visible">
        <div className="bg-gray-700 text-white px-6 py-4">
          <h2 className="text-lg font-semibold">Assign Agent</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Assigned To</h3>
            <div className="relative" ref={dropdownRef}>
              <div
                className="min-h-[40px] w-full rounded-md border border-gray-200 px-3 py-2 cursor-pointer bg-white hover:bg-gray-50"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {selectedUsers.length === 0 ? (
                      <span className="text-gray-500">Select agents...</span>
                    ) : (
                      selectedUsers.map(userId => {
                        const user = availableUsers.find(u => u.id === userId);
                        return user ? (
                          <Badge key={userId} variant="secondary" className="mr-1">
                            {user.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAgent(userId);
                              }}
                              className="ml-1 hover:text-red-600"
                              title="Remove agent"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              </div>

              {dropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg" style={{ zIndex: 9999 }}>
                  <div className="p-2">
                    <Input
                      placeholder="Search agents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                      </div>
                    ) : getFilteredUsers().length === 0 ? (
                      <div className="px-3 py-2 text-gray-500 text-sm">No agents found</div>
                    ) : (
                      getFilteredUsers().map((user) => (
                        <div
                          key={user.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectUser(user.id);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedUsers.includes(user.id) ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          <span>{user.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            variant="default"
            onClick={handleAssignAgents}
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {saving ? 'Saving...' : 'Assign Agents'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};