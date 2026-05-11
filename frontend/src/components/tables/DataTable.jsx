import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown,
  ChevronUp,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react';
import { 
  GlassCard, 
  SaaSButton, 
  TooltipWrapper,
  LoadingSkeleton
} from '../ui';

const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  searchable = true,
  filterable = true,
  exportable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  className = '',
  onRowClick,
  onSelectionChange,
  onExport,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const newSelection = new Set(paginatedData.map(item => item.id));
      setSelectedRows(newSelection);
      onSelectionChange?.(Array.from(newSelection));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  const handleExport = () => {
    const exportData = selectedRows.size > 0 
      ? data.filter(item => selectedRows.has(item.id))
      : processedData;
    onExport?.(exportData);
  };

  const getUniqueValues = (key) => {
    return [...new Set(data.map(item => item[key]))].filter(Boolean);
  };

  const renderCell = (item, column) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }

    switch (column.type) {
      case 'avatar':
        return (
          <div className="flex items-center gap-3">
            <img
              src={value || '/api/placeholder/32/32'}
              alt={item.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
          </div>
        );
      
      case 'badge':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.badgeClass?.(value) || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
            {value}
          </span>
        );
      
      case 'currency':
        return (
          <span className="font-medium text-gray-900 dark:text-white">
            ${value?.toLocaleString()}
          </span>
        );
      
      case 'date':
        return (
          <span className="text-gray-600 dark:text-gray-400">
            {new Date(value).toLocaleDateString()}
          </span>
        );
      
      default:
        return <span className="text-gray-900 dark:text-white">{value}</span>;
    }
  };

  if (loading) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <LoadingSkeleton.Table rows={5} columns={columns.length} />
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Table
              </h3>
              {selectedRows.size > 0 && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedRows.size} selected
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                {filterable && (
                  <TooltipWrapper content="Filters">
                    <SaaSButton
                      variant={showFilters ? 'primary' : 'outline'}
                      size="sm"
                      icon={Filter}
                      onClick={() => setShowFilters(!showFilters)}
                    />
                  </TooltipWrapper>
                )}
                
                {exportable && (
                  <TooltipWrapper content="Export">
                    <SaaSButton
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={handleExport}
                    />
                  </TooltipWrapper>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && filterable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {columns.filter(col => col.filterable).map(column => (
                  <div key={column.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {column.label}
                    </label>
                    <select
                      value={filters[column.key] || ''}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          [column.key]: e.target.value || undefined
                        }));
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All</option>
                      {getUniqueValues(column.key).map(value => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {column.sortable !== false ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {column.label}
                        {sortConfig.key === column.key && (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
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
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
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
        {pagination && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, processedData.length)} of{' '}
                {processedData.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <SaaSButton
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </SaaSButton>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
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

export default DataTable;
