import Order from '../models/Order.js';
import { resolveSortParam } from '../utils/sortMapper.js';

/**
 * Pagination Service
 * Handles dedicated paginated listing endpoints for orders
 */
class PaginationService {
  buildPaginationMeta(result) {
    return {
      totalRecords: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  buildFilterFromQuery(query = {}) {
    const filter = {};
    const orderStatus = query.OrderStatus || query.status;

    if (orderStatus) {
      filter.OrderStatus = orderStatus;
    }

    if (query.search) {
      filter.$or = [
        { CustomerName: { $regex: query.search, $options: 'i' } },
        { ProductName: { $regex: query.search, $options: 'i' } },
        { OrderID: { $regex: query.search, $options: 'i' } },
        { Brand: { $regex: query.search, $options: 'i' } },
        { Category: { $regex: query.search, $options: 'i' } },
        { City: { $regex: query.search, $options: 'i' } },
        { State: { $regex: query.search, $options: 'i' } },
        { OrderStatus: { $regex: query.search, $options: 'i' } },
        { PaymentMethod: { $regex: query.search, $options: 'i' } },
      ];
    }

    return filter;
  }

  async paginateOrders(filter, query, defaults = {}) {
    const page = parseInt(query.page ?? defaults.page ?? 1, 10);
    const limit = parseInt(query.limit ?? defaults.limit ?? 10, 10);
    const sort = resolveSortParam(query.sort ?? defaults.sort ?? '-createdAt');

    const mongoFilter = { ...filter, isArchived: { $ne: true } };

    const result = await Order.paginate(mongoFilter, {
      page,
      limit,
      sort,
      lean: true,
    });

    return {
      success: true,
      data: result.docs,
      pagination: this.buildPaginationMeta(result),
    };
  }

  /**
   * Explicit paged listing — GET /api/v1/orders/paged?page=1&limit=50
   */
  async getPagedListing(query) {
    return this.paginateOrders(this.buildFilterFromQuery(query), query, { page: 1, limit: 50 });
  }

  /**
   * Infinite scroll — GET /api/v1/orders/infinite?page=1
   */
  async getInfiniteScroll(query) {
    const result = await this.paginateOrders(this.buildFilterFromQuery(query), query, {
      page: 1,
      limit: 20,
    });

    return {
      ...result,
      pagination: {
        ...result.pagination,
        hasMore: result.pagination.hasNextPage,
        nextPage: result.pagination.hasNextPage
          ? result.pagination.currentPage + 1
          : null,
      },
    };
  }

  /**
   * Recent orders — GET /api/v1/orders/recent?page=1&limit=5
   */
  async getRecentOrders(query) {
    return this.paginateOrders({}, query, {
      page: 1,
      limit: 5,
      sort: '-OrderDate',
    });
  }

  /**
   * Cancelled orders — GET /api/v1/orders/cancelled?page=1&limit=10
   */
  async getCancelledOrders(query) {
    return this.paginateOrders({ OrderStatus: 'Cancelled' }, query, {
      page: 1,
      limit: 10,
    });
  }

  /**
   * Refunded orders (Returned status) — GET /api/v1/orders/refunded?page=1&limit=10
   */
  async getRefundedOrders(query) {
    return this.paginateOrders({ OrderStatus: 'Returned' }, query, {
      page: 1,
      limit: 10,
    });
  }

  /**
   * Customer orders — GET /api/v1/orders/customer/:customerId?page=1&limit=10
   */
  async getOrdersByCustomer(customerId, query) {
    return this.paginateOrders({ CustomerID: customerId }, query, {
      page: 1,
      limit: 10,
    });
  }

  /**
   * Product orders — GET /api/v1/orders/product/:productId?page=1&limit=10
   */
  async getOrdersByProduct(productId, query) {
    return this.paginateOrders({ ProductID: productId }, query, {
      page: 1,
      limit: 10,
    });
  }
}

export default new PaginationService();
