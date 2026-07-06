import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiSliders, FiEye } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { searchOrders } from '../features/orders/orderSlice';
import DataTable from '../components/common/DataTable';
import { useNavigate } from 'react-router-dom';

const filters = [
  { id: 'all', label: 'All Fields' },
  { id: 'customer', label: 'Customer Name' },
  { id: 'product', label: 'Product Name' },
  { id: 'orderId', label: 'Order ID' },
  { id: 'date', label: 'Date Range' }
];

const formatSmallINR = (val) => {
  if (!val) return '₹0.00';
  return `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SearchPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, searchStatus, searchPagination } = useSelector((state) => state.orders);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const runSearch = useCallback((query, page = 1) => {
    if (!query) return;
    dispatch(searchOrders({
      q: query,
      filter: activeFilter,
      page,
      limit: 10,
      sort: '-date',
    }));
  }, [dispatch, activeFilter]);

  useEffect(() => {
    if (debouncedQuery) {
      runSearch(debouncedQuery, 1);
    }
  }, [debouncedQuery, runSearch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setDebouncedQuery(query);
      runSearch(query, 1);
    }
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    const query = debouncedQuery || searchQuery.trim();
    if (query) {
      dispatch(searchOrders({
        q: query,
        filter: filterId,
        page: 1,
        limit: 10,
        sort: '-date',
      }));
    }
  };

  const handlePageChange = useCallback((page) => {
    const query = debouncedQuery || searchQuery.trim();
    if (query) {
      dispatch(searchOrders({
        q: query,
        filter: activeFilter,
        page,
        limit: 10,
        sort: '-date',
      }));
    }
  }, [dispatch, debouncedQuery, searchQuery, activeFilter]);

  const columns = [
    {
      header: 'Order ID',
      accessor: 'OrderID',
      render: (row) => <span className="font-bold text-[13px] text-indigo-600 dark:text-indigo-400">{row.OrderID}</span>,
    },
    {
      header: 'Customer',
      accessor: 'CustomerName',
      render: (row) => <span className="text-sm font-medium text-slate-800 dark:text-slate-300">{row.CustomerName}</span>,
    },
    {
      header: 'Product',
      accessor: 'ProductName',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.ProductName}</span>,
    },
    {
      header: 'Amount',
      accessor: 'TotalAmount',
      render: (row) => (
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {formatSmallINR(row.TotalAmount?.$numberDecimal || row.TotalAmount)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'OrderStatus',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border"
          style={{
            background: row.OrderStatus === 'Delivered' ? 'rgba(16,185,129,0.08)' : row.OrderStatus === 'Shipped' ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)',
            color: row.OrderStatus === 'Delivered' ? '#10B981' : row.OrderStatus === 'Shipped' ? '#3B82F6' : '#F59E0B',
            borderColor: row.OrderStatus === 'Delivered' ? 'rgba(16,185,129,0.2)' : row.OrderStatus === 'Shipped' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor', boxShadow: `0 0 8px currentColor` }}></span>
          {row.OrderStatus}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'OrderDate',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(row.OrderDate)}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="flex items-center justify-center p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          <FiEye size={16} />
        </button>
      ),
    },
  ];

  const displayQuery = debouncedQuery || searchQuery.trim();
  const hasSearched = displayQuery.length > 0;

  return (
    <div className={`flex flex-col items-center min-h-[70vh] animate-fadeIn pb-20 ${hasSearched ? 'justify-start pt-10' : 'justify-center'}`}>
      <Helmet>
        <title>Advanced Search | OrderPulse</title>
      </Helmet>

      <div className="text-center mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600 mb-3">OrderPulse Intelligence</p>
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Advanced Search</h1>
      </div>

      <div className="w-full max-w-4xl px-4 mb-10">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-rose-400 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-rose-500/30 rounded-[2rem] p-2 shadow-2xl">
            <div className="pl-6 pr-4">
              <FiSearch className="text-rose-500" size={28} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all records..."
              className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 py-4 h-full w-full"
              autoFocus
            />
            <button type="submit" className="hidden sm:flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-lg shadow-rose-600/30 mr-1">
              Search
            </button>
            <button type="submit" className="sm:hidden flex items-center justify-center bg-rose-600 text-white w-14 h-14 rounded-full mr-1">
              <FiSearch size={24} />
            </button>
          </div>
        </form>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleFilterChange(filter.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                activeFilter === filter.id
                  ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-rose-500/20 text-slate-600 dark:text-rose-500/80 hover:border-rose-300 dark:hover:border-rose-500/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <button type="button" className="px-5 py-2.5 rounded-full text-sm font-bold transition-all border bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-rose-500/20 text-slate-600 dark:text-slate-400 hover:border-slate-300 flex items-center gap-2">
            <FiSliders size={14} />
            More Options
          </button>
        </div>
      </div>

      {hasSearched && (
        <div className="w-full px-4 animate-fadeIn">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Search Results for <span className="text-rose-600">"{displayQuery}"</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {searchStatus === 'loading' ? 'Searching...' : `Found ${searchPagination.totalDocs} results`}
            </p>
          </div>

          <DataTable
            columns={columns}
            data={searchResults}
            isLoading={searchStatus === 'loading'}
            pagination={searchPagination}
            onPageChange={handlePageChange}
            hideToolbar={true}
          />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
