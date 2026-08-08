import mongoose from 'mongoose';
import { env } from './config/env';
import { User } from './models/User';
import { Customer } from './models/Customer';
import { Product } from './models/Product';
import { SalesOrder } from './models/SalesOrder';
import { AuditLog } from './models/AuditLog';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting DB Seeding...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await SalesOrder.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('🧹 Cleaned existing database collections');

    
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@erp.com',
        password: 'admin123', 
        role: 'Admin',
        isActive: true,
      },
      {
        name: 'Sales Manager',
        email: 'manager@erp.com',
        password: 'manager123',
        role: 'Sales Manager',
        isActive: true,
      },
      {
        name: 'Sales Representative',
        email: 'rep@erp.com',
        password: 'rep123',
        role: 'Sales Representative',
        isActive: true,
      },
    ] as any[]);
    console.log(`✅ Seeded ${users.length} users`);

    const admin = users[0];
    const manager = users[1];
    const rep = users[2];

    
    const customersData = [
      { name: 'Alice Smith', email: 'alice@smithcorp.com', phone: '555-0101', company: 'Smith Corp', address: '123 Pine St', city: 'New York', country: 'USA', status: 'Active' },
      { name: 'Bob Johnson', email: 'bob@globex.com', phone: '555-0102', company: 'Globex Industries', address: '456 Elm St', city: 'Los Angeles', country: 'USA', status: 'Active' },
      { name: 'Charlie Brown', email: 'charlie@acme.com', phone: '555-0103', company: 'Acme Corp', address: '789 Oak Ave', city: 'Chicago', country: 'USA', status: 'Active' },
      { name: 'Diana Prince', email: 'diana@themyscira.com', phone: '555-0104', company: 'Wayne Ent.', address: '100 Bat Cave Rd', city: 'Gotham', country: 'USA', status: 'Active' },
      { name: 'Ethan Hunt', email: 'ethan@imf.org', phone: '555-0105', company: 'IMF Security', address: '777 Secret Dr', city: 'Washington', country: 'USA', status: 'Inactive' },
      { name: 'Fiona Gallagher', email: 'fiona@gallagher.com', phone: '555-0106', company: 'South Side Pub', address: '2119 North St', city: 'Chicago', country: 'USA', status: 'Active' },
      { name: 'George Costanza', email: 'george@vandelay.com', phone: '555-0107', company: 'Vandelay Industries', address: '555 Latex Way', city: 'New York', country: 'USA', status: 'Active' },
      { name: 'Hal Jordan', email: 'hal@ferrisair.com', phone: '555-0108', company: 'Ferris Aircraft', address: '98 Coast Highway', city: 'Coast City', country: 'USA', status: 'Active' },
      { name: 'Ivy Pepper', email: 'ivy@greenhouse.org', phone: '555-0109', company: 'Gotham Botanical', address: '12 Greenhouse Ln', city: 'Gotham', country: 'USA', status: 'Active' },
      { name: 'Jack Sparrow', email: 'jack@blackpearl.com', phone: '555-0110', company: 'Caribbean Shipping', address: 'Pier 13', city: 'Port Royal', country: 'Jamaica', status: 'Active' },
    ];
    const customers = await Customer.create(customersData as any[]);
    console.log(`✅ Seeded ${customers.length} customers`);

    
    const productsData = [
      { name: 'ThinkPad X1 Carbon', sku: 'LAP-TPX1', description: 'Premium business laptop with carbon fiber chassis', category: 'Laptops', price: 1499, stock: 25, lowStockThreshold: 5, status: 'Active' },
      { name: 'MacBook Pro 16"', sku: 'LAP-MBP16', description: 'Apple M3 Max chip with 32GB unified memory', category: 'Laptops', price: 2499, stock: 12, lowStockThreshold: 3, status: 'Active' },
      { name: 'Dell UltraSharp 32"', sku: 'MON-DELL32', description: '4K IPS professional monitor', category: 'Monitors', price: 699, stock: 8, lowStockThreshold: 4, status: 'Active' },
      { name: 'Keychron Q1 Max', sku: 'KEY-KCQ1M', description: 'Wireless mechanical keyboard', category: 'Keyboards', price: 189, stock: 40, lowStockThreshold: 10, status: 'Active' },
      { name: 'Logitech MX Master 3S', sku: 'MOU-MXM3S', description: 'Ergonomic office mouse', category: 'Mice', price: 99, stock: 3, lowStockThreshold: 5, status: 'Active' }, 
      { name: 'Cisco Catalyst Switch', sku: 'NET-CISCO24', description: '24-port Gigabit Ethernet switch', category: 'Networking', price: 499, stock: 15, lowStockThreshold: 2, status: 'Active' },
      { name: 'Ubiquiti UniFi AP', sku: 'NET-UBAP', description: 'Enterprise wireless access point', category: 'Networking', price: 179, stock: 30, lowStockThreshold: 5, status: 'Active' },
      { name: 'Synology NAS 4-Bay', sku: 'STG-SYNAS4', description: 'Network attached storage server', category: 'Storage', price: 549, stock: 2, lowStockThreshold: 3, status: 'Active' }, 
      { name: 'Samsung T7 Shield 2TB', sku: 'STG-SSD2TB', description: 'Rugged portable SSD drive', category: 'Storage', price: 159, stock: 50, lowStockThreshold: 8, status: 'Active' },
      { name: 'Epson EcoTank Pro', sku: 'PRN-EPSON', description: 'All-in-one cartridge-free ink printer', category: 'Printers', price: 399, stock: 6, lowStockThreshold: 2, status: 'Active' },
      { name: 'Sony WH-1000XM5', sku: 'AUD-SONY5', description: 'Wireless noise-canceling headphones', category: 'Audio', price: 399, stock: 18, lowStockThreshold: 4, status: 'Active' },
      { name: 'Blue Yeti USB Microphone', sku: 'AUD-YETI', description: 'Multi-pattern USB mic for recording', category: 'Audio', price: 129, stock: 22, lowStockThreshold: 5, status: 'Active' },
      { name: 'Elgato Stream Deck MK.2', sku: 'ACC-SDECK', description: '15 customizable LCD keys controller', category: 'Accessories', price: 149, stock: 14, lowStockThreshold: 3, status: 'Active' },
      { name: 'Anker USB-C Hub 8-in-1', sku: 'ACC-ANKER8', description: 'Multi-port adapter with Power Delivery', category: 'Accessories', price: 49, stock: 120, lowStockThreshold: 15, status: 'Active' },
      { name: 'Ergonomic Desk Chair', sku: 'FUR-CHAIR', description: 'Mesh high-back chair with lumbar support', category: 'Furniture', price: 299, stock: 10, lowStockThreshold: 2, status: 'Active' },
    ];
    const products = await Product.create(productsData as any[]);
    console.log(`✅ Seeded ${products.length} products`);

    
    const getRandomProduct = () => products[Math.floor(Math.random() * products.length)] as any;
    const getRandomCustomer = () => customers[Math.floor(Math.random() * customers.length)] as any;
    const getRandomUser = () => users[Math.floor(Math.random() * users.length)] as any;

    
    const ordersData: any[] = [];
    const orderStatuses: ('Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled')[] = [
      'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered',
      'Shipped', 'Shipped', 'Shipped',
      'Processing', 'Processing',
      'Confirmed', 'Confirmed',
      'Pending', 'Pending',
      'Cancelled', 'Cancelled'
    ];

    for (let i = 1; i <= 20; i++) {
      const orderNumber = `SO-${1000 + i}`;
      const customer = getRandomCustomer();
      const creator = getRandomUser();
      const status = orderStatuses[i % orderStatuses.length];

      
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      const selectedProductIds = new Set();
      
      let subtotal = 0;
      for (let j = 0; j < itemCount; j++) {
        let product = getRandomProduct();
        while (selectedProductIds.has(product._id.toString())) {
          product = getRandomProduct();
        }
        selectedProductIds.add(product._id.toString());
        
        const qty = Math.floor(Math.random() * 3) + 1;
        const total = qty * product.price;
        subtotal += total;

        orderItems.push({
          product: product._id,
          quantity: qty,
          unitPrice: product.price,
          total,
        });

        
        if (status !== 'Pending' && status !== 'Cancelled') {
          product.stock = Math.max(0, product.stock - qty);
          await product.save();
        }
      }

      const taxRate = 0.1; 
      const tax = Math.round(subtotal * taxRate * 100) / 100;
      const discount = i % 5 === 0 ? 20 : 0; 
      const finalTotal = subtotal + tax - discount;

      ordersData.push({
        orderNumber,
        customer: customer._id,
        items: orderItems,
        subtotal,
        tax,
        discount,
        total: finalTotal,
        status,
        createdBy: creator._id,
        notes: `Order created by seed script. Status: ${status}`,
        createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000), 
      });
    }

    const orders = await SalesOrder.create(ordersData as any[]);
    console.log(`✅ Seeded ${orders.length} sales orders`);

    
    const auditLogsData = [
      { user: admin._id, action: 'User Creation', entity: 'User', description: 'Seeded system administrator, manager and rep accounts', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { user: manager._id, action: 'Product Import', entity: 'Product', description: 'Imported initial products list into inventory catalog', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { user: rep._id, action: 'Customer Creation', entity: 'Customer', description: 'Registered Alice Smith from Smith Corp', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { user: rep._id, action: 'Order Creation', entity: 'SalesOrder', description: `Created order ${orders[0].orderNumber} for ${customers[0].name}`, entityId: orders[0]._id.toString(), timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { user: manager._id, action: 'Order Status Update', entity: 'SalesOrder', description: `Confirmed order ${orders[0].orderNumber}`, entityId: orders[0]._id.toString(), timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ];
    await AuditLog.create(auditLogsData as any[]);
    console.log(`✅ Seeded audit logs`);

    console.log('🎉 DB Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
