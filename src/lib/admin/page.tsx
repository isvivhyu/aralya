"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SchoolService } from '@/lib/schoolService';
import { School } from '@/lib/supabase';

export default function AdminPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchool, setNewSchool] = useState<Partial<School>>({});

  // Load schools on component mount
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const data = await SchoolService.getAllSchools();
      setSchools(data);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  // Editing flow is not implemented yet

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this school?')) {
      try {
        await SchoolService.deleteSchool(id);
        await loadSchools();
      } catch (error) {
        console.error('Error deleting school:', error);
      }
    }
  };

  const handleAdd = async () => {
    try {
      await SchoolService.addSchool(newSchool as Omit<School, 'id' | 'created_at' | 'updated_at'>);
      await loadSchools();
      setShowAddForm(false);
      setNewSchool({});
    } catch (error) {
      console.error('Error adding school:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#774BE5] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">School Management</h1>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-[#774BE5] text-white px-4 py-2 rounded-lg hover:bg-[#6B3FD6] transition-colors"
              >
                Add New School
              </button>
            </div>

            {/* Add School Form */}
            {showAddForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Add New School</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={newSchool.school_name || ''}
                      onChange={(e) => setNewSchool({...newSchool, school_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#774BE5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newSchool.city || ''}
                      onChange={(e) => setNewSchool({...newSchool, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#774BE5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Tuition
                    </label>
                    <input
                      type="text"
                      value={newSchool.min_tuition || ''}
                      onChange={(e) => setNewSchool({...newSchool, min_tuition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#774BE5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tuition
                    </label>
                    <input
                      type="text"
                      value={newSchool.max_tuition || ''}
                      onChange={(e) => setNewSchool({...newSchool, max_tuition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#774BE5]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAdd}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewSchool({});
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Schools List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tuition Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curriculum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schools.map((school) => (
                    <tr key={school.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              className="h-10 w-10 rounded-full object-contain"
                              src={school.logo_banner}
                              alt={school.school_name}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {school.school_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.min_tuition} - {school.max_tuition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.curriculum_tags}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(school.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
