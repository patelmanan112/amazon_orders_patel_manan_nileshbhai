import Order from '../models/Order.js';

class TrendingService {
  /**
   * Fetch trending products (All time for demo data)
   */
  async getTrendingProducts(limit = 10) {
    const products = await Order.aggregate([
      {
        $match: {
          isArchived: { $ne: true },
          OrderStatus: { $nin: ['Cancelled', 'Returned'] },
        },
      },
      {
        $group: {
          _id: '$ProductID',
          productName: { $first: '$ProductName' },
          category: { $first: '$Category' },
          brand: { $first: '$Brand' },
          totalQuantitySold: { $sum: '$Quantity' },
          totalRevenue: { $sum: { $toDouble: '$TotalAmount' } },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantitySold: -1, totalRevenue: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: 1,
          category: 1,
          brand: 1,
          totalQuantitySold: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          ordersCount: 1,
          trendPeriod: 'all-time',
        },
      },
    ]);

    return { period: 'all-time', products };
  }

  /**
   * Fetch trending categories (All time for demo data)
   */
  async getTrendingCategories(limit = 10) {
    const categories = await Order.aggregate([
      {
        $match: {
          isArchived: { $ne: true },
          OrderStatus: { $nin: ['Cancelled', 'Returned'] },
        },
      },
      {
        $group: {
          _id: '$Category',
          totalRevenue: { $sum: { $toDouble: '$TotalAmount' } },
          totalQuantitySold: { $sum: '$Quantity' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1, ordersCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalQuantitySold: 1,
          ordersCount: 1,
          trendPeriod: 'all-time',
        },
      },
    ]);

    return { period: 'all-time', categories };
  }
}

export default new TrendingService();
