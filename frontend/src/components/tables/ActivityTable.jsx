import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { 
  GlassCard, 
  SaaSButton, 
  TooltipWrapper,
  LoadingSkeleton
} from '../ui';

const ActivityTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  searchable = true,
  paginated = true,
  pageSize = 10,
  className = '',
  onRowClick,
  onEdit,
  onDelete,
  onView,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  // Default columns if not provided
  const defaultColumns = [
    { key: 'student', label: 'Student', sortable: true },
    { key: 'activity', label: 'Activity', sortable: true },
    { key: 'course', label: 'Course', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  const tableColumns = columns.length > 0 ? columns : defaultColumns;

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filterStatus, sortField, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: TrendingUp },
      in_progress: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock },
      pending: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      failed: { bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: TrendingUp }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const renderCell = (item, column) => {
    const value = item[column.key];
    
    switch (column.key) {
      case 'student':
        return (
          <div className="flex items-center gap-3">
            <img
              src={item.avatar || '/api/placeholder/32/32'}
              alt={value}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.email}</p>
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-gray-900 dark:text-white">{value}</span>
          </div>
        );
      
      case 'time':
        return (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{value}</span>
          </div>
        );
      
      case 'status':
        return getStatusBadge(value);
      
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            {onView && (
              <TooltipWrapper content="View Details">
                <SaaSButton
                  variant="ghost"
                  size="sm"
                  icon={Eye}
                  onClick={() => onView(item)}
                />
              </TooltipWrapper>
            )}
            {onEdit && (
              <TooltipWrapper content="Edit">
                <SaaSButton
                  variant="ghost"
                  size="sm"
                  icon={Edit}
                  onClick={() => onEdit(item)}
                />
              </TooltipWrapper>
            )}
            {onDelete && (
              <TooltipWrapper content="Delete">
                <SaaSButton
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => onDelete(item)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                />
              </TooltipWrapper>
            )}
          </div>
        );
      
      default:
        return <span className="text-gray-900 dark:text-white">{value}</span>;
    }
  };

  if (loading) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <LoadingSkeleton.Table rows={5} columns={tableColumns.length} />
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <GlassCard className="overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {tableColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {column.label}
                        {sortField === column.key && (
                          <span className="text-blue-500">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((item, index) => (
                <motion.tr
                  key={item.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {tableColumns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {renderCell(item, column)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginated && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredData.length)} of{' '}
                {filteredData.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <SaaSButton
                  variant="outline"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </SaaSButton>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <SaaSButton
                  variant="outline"
                  size="sm"
                  icon={ChevronRight}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </SaaSButton>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default ActivityTable;
