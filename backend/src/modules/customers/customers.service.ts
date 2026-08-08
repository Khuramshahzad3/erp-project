import Customer from '../../models/Customer';
import SalesOrder from '../../models/SalesOrder';
import AuditLog from '../../models/AuditLog';

export class CustomersService {
  static async getCustomers(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || '';
    const status = query.status || '';
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Enrich customers with aggregate orders count
    const enrichedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await SalesOrder.countDocuments({ customer: customer._id });
        return {
          ...customer,
          orderCount,
        };
      })
    );

    return {
      customers: enrichedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      throw { statusCode: 404, name: 'NOT_FOUND', message: 'Customer not found' };
    }

    // Get order summary statistics for details page
    const orders = await SalesOrder.find({ customer: id }).sort({ createdAt: -1 }).lean();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((acc, order) => {
      if (order.status !== 'Cancelled') {
        return acc + order.total;
      }
      return acc;
    }, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastOrderDate = orders[0]?.createdAt || null;

    return {
      customer,
      stats: {
        totalOrders,
        totalSpent: Math.round(totalSpent * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        lastOrderDate,
      },
      orders,
    };
  }

  static async createCustomer(data: any, userId: string) {
    // Check if email already exists
    const existing = await Customer.findOne({ email: data.email });
    if (existing) {
      throw { statusCode: 409, name: 'CONFLICT', message: 'Customer email already exists' };
    }

    const customer = await Customer.create(data);

    await AuditLog.create({
      user: userId,
      action: 'Customer Created',
      entity: 'Customer',
      entityId: customer._id.toString(),
      description: `Created customer ${customer.name} (${customer.company})`,
    });

    return customer;
  }

  static async updateCustomer(id: string, data: any, userId: string) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw { statusCode: 404, name: 'NOT_FOUND', message: 'Customer not found' };
    }

    if (data.email && data.email !== customer.email) {
      const existing = await Customer.findOne({ email: data.email });
      if (existing) {
        throw { statusCode: 409, name: 'CONFLICT', message: 'Customer email already exists' };
      }
    }

    Object.assign(customer, data);
    await customer.save();

    await AuditLog.create({
      user: userId,
      action: 'Customer Updated',
      entity: 'Customer',
      entityId: customer._id.toString(),
      description: `Updated customer details for ${customer.name}`,
      metadata: data,
    });

    return customer;
  }

  static async deleteCustomer(id: string, userId: string) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw { statusCode: 404, name: 'NOT_FOUND', message: 'Customer not found' };
    }

    // Check if customer has orders
    const ordersCount = await SalesOrder.countDocuments({ customer: id });
    if (ordersCount > 0) {
      throw { statusCode: 400, name: 'BAD_REQUEST', message: 'Cannot delete customer with existing orders' };
    }

    await Customer.deleteOne({ _id: id });

    await AuditLog.create({
      user: userId,
      action: 'Customer Deleted',
      entity: 'Customer',
      entityId: id,
      description: `Deleted customer ${customer.name} (${customer.company})`,
    });

    return { id };
  }
}
export default CustomersService;
