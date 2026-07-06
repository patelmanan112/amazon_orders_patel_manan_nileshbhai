import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiPlus, FiDownload, FiSliders, FiSearch } from 'react-icons/fi';
import { fetchOrders, setFilters, deleteOrder } from '../../features/orders/orderSlice';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import OrderForm from './OrderForm';

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, pagination, filters, status } = useSelector((state) => state.orders);
  const [deleteId, setDeleteId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders({
      page: filters.page,
      limit: filters.limit,
      search: filters.search || undefined,
      OrderStatus: filters.status || undefined,
      sort: filters.sort,
    }));
  }, [dispatch, filters]);

  const handlePageChange = useCallback((p) => dispatch(setFilters({ page: p })), [dispatch]);

  const handleSearch = useCallback((term) => {
    dispatch(setFilters({ search: term, page: 1 }));
  }, [dispatch]);

  const handleSort = useCallback((sort) => dispatch(setFilters({ sort, page: 1 })), [dispatch]);

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteOrder(deleteId));
      setDeleteId(null);
    }
  };

  const formatSmallINR = (val) => {
    if (!val) return '₹0.00';
    return `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
          onClick={() => { setEditingOrder(row); setIsFormOpen(true); }}
          className="flex items-center justify-center p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          <FiEye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out' }} className="pb-10">
      <Helmet>
        <title>All Orders | OrderPulse</title>
      </Helmet>

      {/* Top Header / Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Orders</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 lg:w-64 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search orders..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-indigo-500/20 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>
          
          <select
            value={filters.sort || '-date'}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-indigo-500/20 rounded-xl text-sm font-bold text-slate-700 dark:text-indigo-400 focus:outline-none focus:border-indigo-500/60"
          >
            <option value="-date">Newest First</option>
            <option value="date">Oldest First</option>
            <option value="-amount">Highest Amount</option>
            <option value="amount">Lowest Amount</option>
            <option value="status">Status</option>
            <option value="customer">Customer</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-indigo-500/20 rounded-xl text-sm font-bold text-slate-700 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-indigo-500/10 transition-colors shadow-sm">
            <FiSliders size={14} />
            Filters
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-indigo-500/20 rounded-xl text-sm font-bold text-slate-700 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-indigo-500/10 transition-colors shadow-sm hidden sm:flex">
            <FiDownload size={14} />
            Export
          </button>
          
          <button
            onClick={() => { setEditingOrder(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-transparent rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <FiPlus size={16} />
            New Order
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={status === 'loading'}
        pagination={pagination}
        onPageChange={handlePageChange}
        hideToolbar={true} // I'll add this prop to hide the internal toolbar of DataTable
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message="This action cannot be undone. The order will be permanently removed."
        confirmText="Delete"
        isDestructive
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingOrder ? 'Edit Order' : 'New Order'}
        size="lg"
      >
        <OrderForm initialData={editingOrder} onClose={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
};

export default OrdersList;
