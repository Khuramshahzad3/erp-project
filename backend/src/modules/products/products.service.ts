import Product from '../../models/Product';
import SalesOrder from '../../models/SalesOrder';
import AuditLog from '../../models/AuditLog';

export class ProductsService {
  static async getProducts(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || '';
    const category = query.category || '';
    const status = query.status || '';
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await Product.findById(id).lean();
    if (!product) {
      throw { statusCode: 404, name: 'NOT_FOUND', message: 'Product not found' };
    }
    return product;
  }

  static async createProduct(data: any, userId: string) {
    // Check SKU uniqueness
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      throw { statusCode: 409, name: 'CONFLICT', message: `Product SKU '${data.sku}' already exists` };
    }

    const product = await Product.create(data);

    await AuditLog.create({
      user: userId,
      action: 'Product Created',
      entity: 'Product',
      entityId: product._id.toString(),
      description: `Created product ${product.name} (SKU: ${product.sku})`,
    });

    return product;
  }

  static async updateProduct(id: string, data: any, userId: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw { statusCode: 404, name: 'NOT_FOUND', message: 'Product not found' };
    }

    if (data.sku && data.sku !== product.sku) {
      const existing = await Product.findOne({ sku: data.sku });
      if (existing) {
        throw { statusCode: 409, name: 'CONFLICT', message: `Product SKU '${data.sku}' already exists` };
      }
    }

    Object.assign(product, data);
    await product.save();

    await AuditLog.create({
      user: userId,
      action: 'Product Updated',
      entity: 'Product',
      entityId: product._id.toString(),
      description: `Updated product details or stock for SKU ${product.sku}`,
      metadata: data,
    });

    return product;
  }

  static async deleteProduct(id: string, userId: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw { statusCode: 404, name: 'NOT_FOUND', message: 'Product not found' };
    }

    // Check if used in orders
    const ordersCount = await SalesOrder.countDocuments({ 'items.product': id });
    if (ordersCount > 0) {
      throw { statusCode: 400, name: 'BAD_REQUEST', message: 'Cannot delete product referenced in existing orders' };
    }

    await Product.deleteOne({ _id: id });

    await AuditLog.create({
      user: userId,
      action: 'Product Deleted',
      entity: 'Product',
      entityId: id,
      description: `Deleted product ${product.name} (SKU: ${product.sku})`,
    });

    return { id };
  }
}
export default ProductsService;
