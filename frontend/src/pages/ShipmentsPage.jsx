import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiTruck, FiMapPin, FiPackage, FiCheckCircle, FiEye } from 'react-icons/fi';
import { fetchShipments } from '../features/orders/orderSlice';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import OrderForm from './Orders/OrderForm';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ShipmentsPage = () => {
  const dispatch = useDispatch();
  const { shipments, shipmentsPagination, shipmentsStatus } = useSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState('Pending');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchShipments({
      page: 1,
      limit: 10,
      OrderStatus: activeTab,
      sort: '-date',
    }));
  }, [dispatch, activeTab]);

  const handlePageChange = useCallback((page) => {
    dispatch(fetchShipments({
      page,
      limit: 10,
      OrderStatus: activeTab,
      sort: '-date',
    }));
  }, [dispatch, activeTab]);

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
      header: 'Destination',
      accessor: 'Destination',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <FiMapPin className="text-rose-500" />
          <span>{row.City}, {row.State}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'OrderStatus',
      render: (row) => {
        const isDelivered = row.OrderStatus === 'Delivered';
        const isShipped = row.OrderStatus === 'Shipped';
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border"
            style={{
              background: isDelivered ? 'rgba(16,185,129,0.08)' : isShipped ? 'rgba(99,102,241,0.08)' : 'rgba(245,158,11,0.08)',
              color: isDelivered ? '#10B981' : isShipped ? '#6366F1' : '#F59E0B',
              borderColor: isDelivered ? 'rgba(16,185,129,0.2)' : isShipped ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor', boxShadow: `0 0 8px currentColor` }}></span>
            {row.OrderStatus}
          </span>
        );
      },
    },
    {
      header: 'Order Date',
      accessor: 'OrderDate',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(row.OrderDate)}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => { setSelectedOrder(row); setIsFormOpen(true); }}
          className="flex items-center justify-center p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          <FiEye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <Helmet>
        <title>Shipments | OrderPulse</title>
      </Helmet>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1">Logistics & Tracking</p>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          Shipments
          <FiTruck className="text-indigo-500" size={32} />
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Track and manage outgoing packages and deliveries.</p>
      </div>

      <div className="card-panel">
        <div className="p-4 border-b border-slate-200 dark:border-indigo-500/10 flex gap-4">
          <button
            onClick={() => setActiveTab('Pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            <FiPackage /> Pending Fulfillment
          </button>
          <button
            onClick={() => setActiveTab('Shipped')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Shipped' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            <FiTruck /> In Transit
          </button>
          <button
            onClick={() => setActiveTab('Delivered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            <FiCheckCircle /> Delivered
          </button>
        </div>
        
        <div className="p-4">
          <DataTable
            columns={columns}
            data={shipments}
            isLoading={shipmentsStatus === 'loading'}
            pagination={shipmentsPagination}
            onPageChange={handlePageChange}
            hideToolbar={true}
          />
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedOrder ? 'View Shipment Details' : 'New Order'}
        size="lg"
      >
        <OrderForm initialData={selectedOrder} onClose={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
};

export default ShipmentsPage;
