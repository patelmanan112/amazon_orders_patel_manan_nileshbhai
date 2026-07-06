import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setGlobalLoading } from '../ui/uiSlice';
import { toast } from 'react-toastify';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== undefined)
  );

const SEARCH_ENDPOINTS = {
  all: '/orders/search',
  customer: '/orders/search/customer',
  product: '/orders/search/product',
  orderId: '/orders/search/tracking',
  date: '/orders/search/date',
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params, { dispatch, rejectWithValue }) => {
    dispatch(setGlobalLoading(true));
    try {
      const response = await api.get('/orders/paged', { params: cleanParams(params) });
      dispatch(setGlobalLoading(false));
      return response.data;
    } catch (error) {
      dispatch(setGlobalLoading(false));
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const searchOrders = createAsyncThunk(
  'orders/searchOrders',
  async ({ q, filter = 'all', page = 1, limit = 10, sort = '-date' }, { dispatch, rejectWithValue }) => {
    dispatch(setGlobalLoading(true));
    try {
      const endpoint = SEARCH_ENDPOINTS[filter] || SEARCH_ENDPOINTS.all;
      const response = await api.get(endpoint, {
        params: cleanParams({ q, page, limit, sort }),
      });
      dispatch(setGlobalLoading(false));
      return response.data;
    } catch (error) {
      dispatch(setGlobalLoading(false));
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchShipments = createAsyncThunk(
  'orders/fetchShipments',
  async (params, { dispatch, rejectWithValue }) => {
    dispatch(setGlobalLoading(true));
    try {
      const response = await api.get('/orders/paged', {
        params: cleanParams({
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          OrderStatus: params.OrderStatus,
        }),
      });
      dispatch(setGlobalLoading(false));
      return response.data;
    } catch (error) {
      dispatch(setGlobalLoading(false));
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shipments');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      toast.success('Order created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${orderId}`, updateData);
      toast.success('Order updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Order deleted successfully');
      return orderId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Load initial filters from sessionStorage
const loadFilters = () => {
  const saved = sessionStorage.getItem('orderFilters');
  return saved ? JSON.parse(saved) : { search: '', status: '', page: 1, limit: 10, sort: '-date' };
};

const initialState = {
  orders: [],
  pagination: {
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  },
  shipments: [],
  shipmentsPagination: {
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  },
  searchResults: [],
  searchPagination: {
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  },
  filters: loadFilters(),
  status: 'idle',
  shipmentsStatus: 'idle',
  searchStatus: 'idle',
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      sessionStorage.setItem('orderFilters', JSON.stringify(state.filters));
    },
    resetFilters: (state) => {
      state.filters = { search: '', status: '', page: 1, limit: 10, sort: '-date' };
      sessionStorage.setItem('orderFilters', JSON.stringify(state.filters));
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Depending on backend structure, data is either in action.payload.data (ApiResponse) or directly in payload.
        const responseData = action.payload.data || [];
        const responsePagination = action.payload.pagination || {};
        
        state.orders = responseData;
        state.pagination = {
          totalDocs: responsePagination.totalRecords || 0,
          totalPages: responsePagination.totalPages || 0,
          page: responsePagination.currentPage || 1,
          limit: responsePagination.limit || 10,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch shipments
      .addCase(fetchShipments.pending, (state) => {
        state.shipmentsStatus = 'loading';
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.shipmentsStatus = 'succeeded';
        const responseData = action.payload.data || [];
        const responsePagination = action.payload.pagination || {};

        state.shipments = responseData;
        state.shipmentsPagination = {
          totalDocs: responsePagination.totalRecords || 0,
          totalPages: responsePagination.totalPages || 0,
          page: responsePagination.currentPage || 1,
          limit: responsePagination.limit || 10,
        };
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.shipmentsStatus = 'failed';
        state.error = action.payload;
      })
      // Search
      .addCase(searchOrders.pending, (state) => {
        state.searchStatus = 'loading';
      })
      .addCase(searchOrders.fulfilled, (state, action) => {
        state.searchStatus = 'succeeded';
        const responseData = action.payload.data || [];
        const responsePagination = action.payload.pagination || {};

        state.searchResults = responseData;
        state.searchPagination = {
          totalDocs: responsePagination.totalRecords || 0,
          totalPages: responsePagination.totalPages || 0,
          page: responsePagination.currentPage || 1,
          limit: responsePagination.limit || 10,
        };
      })
      .addCase(searchOrders.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.error = action.payload;
      })
      // Create
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      // Update
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o._id !== action.payload);
      });
  },
});

export const { setFilters, resetFilters } = orderSlice.actions;

export default orderSlice.reducer;
