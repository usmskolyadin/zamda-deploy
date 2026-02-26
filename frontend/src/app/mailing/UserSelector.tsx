"use client"

import { useState, useEffect } from "react";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { FaSearch, FaCheckCircle, FaRegCircle } from "react-icons/fa";

interface User {
  id: string;
  email: string;
  profile?: {
    first_name?: string;
    last_name?: string;
  };
}

interface UserSelectorProps {
  selectedUsers: string[];
  onSelectionChange: (users: string[]) => void;
}

export default function UserSelector({ selectedUsers, onSelectionChange }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiFetchAuth("/api/users/");
        setUsers(response.results || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onSelectionChange(newSelection);
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredUsers.map(u => u.id));
    }
    setSelectAll(!selectAll);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-3xl overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:border-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            {selectAll ? <FaCheckCircle className="text-black" /> : <FaRegCircle />}
            <span>Select All ({filteredUsers.length})</span>
          </button>
          {selectedUsers.length > 0 && (
            <span className="ml-auto text-sm text-gray-500">
              {selectedUsers.length} selected
            </span>
          )}
        </div>

        {filteredUsers.map(user => (
          <div
            key={user.id}
            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
            onClick={() => toggleUser(user.id)}
          >
            {selectedUsers.includes(user.id) ? (
              <FaCheckCircle className="text-black flex-shrink-0" />
            ) : (
              <FaRegCircle className="text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user.profile?.first_name && user.profile?.last_name
                  ? `${user.profile.first_name} ${user.profile.last_name}`
                  : "No name"}
              </p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found matching your search
          </div>
        )}
      </div>
    </div>
  );
}