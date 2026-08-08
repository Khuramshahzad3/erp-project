import mongoose from 'mongoose';
import SalesOrder from '../../models/SalesOrder';
import Product from '../../models/Product';
import Customer from '../../models/Customer';
import AuditLog from '../../models/AuditLog';

export class OrdersService {
  static async getOrders(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customer?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || '';
    const status = query.status || '';
    const customerId = query.customer || '';
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (customerId) {
      filter.customer = customerId;
    }

    
    if (search) {
      if (search.startsWith('SO-')) {
        filter.orderNumber = { $regex: search, $options: 'i' };
      } else {
        
        const matchingCustomers = await Customer.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id');
        const customerIds = matchingCustomers.map((c) => c._id);
        filter.customer = { $in: customerIds };
      }
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const total = await SalesOrder.countDocuments(filter);
    const orders = await SalesOrder.find(filter)
      .populate('customer', 'name email company')
      .populate('createdBy', 'name role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getOrderById(id: string) {
    const order = await SalesOrder.findById(id)
      .populate('customer')
      .populate('items.product')
      .populate('createdBy', 'name email role')
      .lean();

    if (!order) {
      throw { statusCode: 404, name: 'NOT_FOUND', message: 'Order not found' };
    }
    return order;
  }

  static async createOrder(data: any, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { customer: customerId, items, discount, notes } = data;

      
      const customer = await Customer.findById(customerId).session(session);
      if (!customer || customer.status !== 'Active') {
        throw { statusCode: 400, name: 'BAD_REQUEST', message: 'Active customer is required' };
      }

      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product).session(session);
        if (!product || product.status !== 'Active') {
          throw {
            statusCode: 400,
            name: 'BAD_REQUEST',
            message: `Product with ID ${item.product} is inactive or not found`,
          };
        }

        
        if (product.stock < item.quantity) {
          throw {
            statusCode: 400,
            name: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for Product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          };
        }

        const totalItemPrice = item.quantity * product.price;
        subtotal += totalItemPrice;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          unitPrice: product.price,
          total: totalItemPrice,
        });
      }

      
      const taxRate = 0.1; 
      const tax = Math.round(subtotal * taxRate * 100) / 100;
      const total = Math.max(0, subtotal + tax - discount);

      
      const count = await SalesOrder.countDocuments().session(session);
      const orderNumber = `SO-${1001 + count}`;

      const order = new SalesOrder({
        orderNumber,
        customer: customerId,
        items: orderItems,
        subtotal,
        tax,
        discount,
        total,
        status: 'Pending',
        notes,
        createdBy: userId,
      });

      await order.save({ session });

      await AuditLog.create(
        [
          {
            user: userId,
            action: 'Order Created',
            entity: 'SalesOrder',
            entityId: order._id.toString(),
            description: `Created Sales Order ${orderNumber} for customer ${customer.name}`,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async updateOrderStatus(id: string, newStatus: string, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await SalesOrder.findById(id).session(session);
      if (!order) {
        throw { statusCode: 404, name: 'NOT_FOUND', message: 'Order not found' };
      }

      const oldStatus = order.status;
      if (oldStatus === newStatus) {
        await session.commitTransaction();
        session.endSession();
        return order;
      }

      
      const allowedTransitions: Record<string, string[]> = {
        Pending: ['Confirmed', 'Cancelled'],
        Confirmed: ['Processing', 'Cancelled'],
        Processing: ['Shipped', 'Cancelled'],
        Shipped: ['Delivered', 'Cancelled'],
        Delivered: [], 
        Cancelled: [], 
      };

      if (!allowedTransitions[oldStatus].includes(newStatus)) {
        throw {
          statusCode: 400,
          name: 'INVALID_TRANSITION',
          message: `Cannot transition status from ${oldStatus} to ${newStatus}`,
        };
      }

      
      
      if (newStatus === 'Confirmed') {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);
          if (!product) {
            throw {
              statusCode: 400,
              name: 'BAD_REQUEST',
              message: `Product was not found`,
            };
          }
          if (product.stock < item.quantity) {
            throw {
              statusCode: 400,
              name: 'INSUFFICIENT_STOCK',
              message: `Insufficient stock for product ${product.name} to confirm order. Available: ${product.stock}, Required: ${item.quantity}`,
            };
          }
          product.stock -= item.quantity;
          await product.save({ session });
        }
      }

      
      const activeStates = ['Confirmed', 'Processing', 'Shipped'];
      if (newStatus === 'Cancelled' && activeStates.includes(oldStatus)) {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);
          if (product) {
            product.stock += item.quantity;
            await product.save({ session });
          }
        }
      }

      order.status = newStatus as any;
      await order.save({ session });

      await AuditLog.create(
        [
          {
            user: userId,
            action: 'Order Status Updated',
            entity: 'SalesOrder',
            entityId: order._id.toString(),
            description: `Updated status of Order ${order.orderNumber} from ${oldStatus} to ${newStatus}`,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
export default OrdersService;
