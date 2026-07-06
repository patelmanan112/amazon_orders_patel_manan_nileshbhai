import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

/**
 * Search Service
 * Handles all search operations for orders
 */
class SearchService {
  /**
   * Helper to execute paginated query
   */
  async _executePaginatedSearch(filter, query) {
    const { page = 1, limit = 10, sort = '-createdAt' } = query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      lean: true,
    };
    
    // Ensure we don't return archived orders
    filter.isArchived = { $ne: true };

    const result = await Order.paginate(filter, options);
    return {
      success: true,
      data: result.docs,
      pagination: {
        totalRecords: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    };
  }

  /**
   * General keyword search
   */
  async searchOrders(keyword, query) {
    if (!keyword) return this._executePaginatedSearch({}, query);
    
    const filter = {
      $or: [
        { OrderID: { $regex: keyword, $options: 'i' } },
        { CustomerName: { $regex: keyword, $options: 'i' } },
        { ProductName: { $regex: keyword, $options: 'i' } },
        { Category: { $regex: keyword, $options: 'i' } },
        { Brand: { $regex: keyword, $options: 'i' } },
        { City: { $regex: keyword, $options: 'i' } },
        { State: { $regex: keyword, $options: 'i' } },
        { OrderStatus: { $regex: keyword, $options: 'i' } },
        { PaymentMethod: { $regex: keyword, $options: 'i' } },
      ],
    };
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by customer name
   */
  async searchByCustomer(customerName, query) {
    const filter = customerName ? { CustomerName: { $regex: customerName, $options: 'i' } } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by product name
   */
  async searchByProduct(productName, query) {
    const filter = productName ? { ProductName: { $regex: productName, $options: 'i' } } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by category
   */
  async searchByCategory(category, query) {
    const filter = category ? { Category: { $regex: category, $options: 'i' } } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by brand
   */
  async searchByBrand(brand, query) {
    const filter = brand ? { Brand: { $regex: brand, $options: 'i' } } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by status
   */
  async searchByStatus(status, query) {
    const filter = status ? { OrderStatus: { $regex: status, $options: 'i' } } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by payment method
   */
  async searchByPayment(payment, query) {
    const filter = payment ? { PaymentMethod: { $regex: payment, $options: 'i' } } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by location (City, State, Country)
   */
  async searchByLocation(location, query) {
    const filter = location ? {
      $or: [
        { City: { $regex: location, $options: 'i' } },
        { State: { $regex: location, $options: 'i' } },
        { Country: { $regex: location, $options: 'i' } },
      ]
    } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by date
   */
  async searchByDate(dateStr, query) {
    if (!dateStr) return this._executePaginatedSearch({}, query);
    
    // Assuming dateStr could be YYYY-MM or YYYY-MM-DD
    const startDate = new Date(dateStr);
    let endDate = new Date(dateStr);
    
    if (dateStr.length === 7) {
      // YYYY-MM format, get whole month
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      // Single day
      endDate.setDate(endDate.getDate() + 1);
    }

    if (isNaN(startDate.getTime())) {
      throw new ApiError(400, 'Invalid date format. Use YYYY-MM or YYYY-MM-DD');
    }

    const filter = {
      OrderDate: {
        $gte: startDate,
        $lt: endDate
      }
    };
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Search by tracking ID (using OrderID)
   */
  async searchByTracking(trackingId, query) {
    const filter = trackingId ? { OrderID: { $regex: trackingId, $options: 'i' } } : {};
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Fuzzy search support
   * Since MongoDB native fuzzy search requires Atlas Search, 
   * we use a regex fallback with word boundary tolerance for basic implementation
   */
  async searchFuzzy(term, query) {
    if (!term) return this._executePaginatedSearch({}, query);
    
    // Creating a very simple fuzzy regex pattern (e.g., h.*e.*a.*d.*f.*o.*n.*e)
    const fuzzyTerm = term.split('').join('.*');
    const filter = {
      $or: [
        { ProductName: { $regex: fuzzyTerm, $options: 'i' } },
        { CustomerName: { $regex: fuzzyTerm, $options: 'i' } },
        { Category: { $regex: fuzzyTerm, $options: 'i' } },
        { Brand: { $regex: fuzzyTerm, $options: 'i' } },
      ],
    };
    return this._executePaginatedSearch(filter, query);
  }

  /**
   * Autocomplete suggestions
   */
  async getAutocomplete(term) {
    if (!term) return { success: true, data: [] };
    
    // Return distinct product names matching the term
    const products = await Order.find({
      ProductName: { $regex: term, $options: 'i' },
      isArchived: { $ne: true }
    })
    .select('ProductName Category')
    .limit(10)
    .lean();

    // Deduplicate logic
    const uniqueProducts = Array.from(new Set(products.map(p => p.ProductName)))
      .map(name => {
        return products.find(p => p.ProductName === name);
      });

    return { success: true, data: uniqueProducts };
  }

  /**
   * Highlight matching text
   * Appends a highlighted version of the field to the results
   */
  async searchHighlight(term, query) {
    const result = await this.searchOrders(term, query);
    if (!term) return result;
    
    // Simple post-processing to highlight text (e.g. wrapping in <mark>)
    const regex = new RegExp(`(${term})`, 'gi');
    
    result.data = result.data.map(order => {
      const highlightedOrder = { ...order };
      if (order.ProductName && order.ProductName.match(regex)) {
        highlightedOrder._highlightedProductName = order.ProductName.replace(regex, '<mark>$1</mark>');
      }
      if (order.CustomerName && order.CustomerName.match(regex)) {
        highlightedOrder._highlightedCustomerName = order.CustomerName.replace(regex, '<mark>$1</mark>');
      }
      return highlightedOrder;
    });

    return result;
  }

  /**
   * Fetch recent searches (Mocked for now since no SearchHistory schema)
   */
  async getRecentSearches() {
    // In a real app, you would query a SearchHistory model for the logged-in user
    return {
      success: true,
      data: [
        { term: 'laptop', timestamp: new Date() },
        { term: 'iphone 15', timestamp: new Date(Date.now() - 3600000) },
        { term: 'samsung tv', timestamp: new Date(Date.now() - 7200000) },
      ]
    };
  }

  /**
   * Fetch popular searches (Mocked for now)
   */
  async getPopularSearches() {
    return {
      success: true,
      data: [
        { term: 'headphones', count: 1542 },
        { term: 'laptop', count: 1230 },
        { term: 'smart watch', count: 980 },
        { term: 'shoes', count: 850 },
        { term: 'iphone', count: 760 },
      ]
    };
  }
}

export default new SearchService();
