import Customer from '../../models/Customer';
import Product from '../../models/Product';
import SalesOrder from '../../models/SalesOrder';

export class DashboardService {
  static async getStats() {
    const totalCustomers = await Customer.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await SalesOrder.countDocuments({});

    // Calculate Total Revenue
    const revenueAggregation = await SalesOrder.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    const pendingOrders = await SalesOrder.countDocuments({ status: 'Pending' });

    // Low stock count: stock <= lowStockThreshold
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      status: 'Active',
    });

    return {
      totalCustomers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders,
      lowStockProducts,
    };
  }

  static async getSalesOverview() {
    // Return sales over time (last 30 days grouped by date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await SalesOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orderCount: 1,
        },
      },
    ]);

    return sales;
  }

  static async getTopProducts() {
    // Best-selling products (grouped by product ID and sum of quantity)
    const topProducts = await SalesOrder.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          quantitySold: { $sum: '$items.quantity' },
          revenueGenerated: { $sum: '$items.total' },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$productDetails.name',
          sku: '$productDetails.sku',
          quantitySold: 1,
          revenueGenerated: { $round: ['$revenueGenerated', 2] },
        },
      },
    ]);

    return topProducts;
  }
}
export default DashboardService;
