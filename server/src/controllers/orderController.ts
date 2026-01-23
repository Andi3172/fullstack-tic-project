import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { orderSchema, OrderItem } from '../models/orderModel';
import { Product } from '../models/productModel';
import PDFDocument from 'pdfkit';

export const createOrder = async (req: Request, res: Response) => {
  try {
    // 1. User from Auth Middleware (attached to res.locals.user)
    const user = res.locals.user;
    if (!user) {
      if (!res.headersSent) return res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // 2. Validate Items Structure
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      if (!res.headersSent) return res.status(400).json({ message: `Validation Error: ${error.details[0].message}` });
      return;
    }

    const requestedItems: OrderItem[] = value.items;
    
    // Safety check for empty or invalid array
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
        if (!res.headersSent) return res.status(400).json({ message: 'No items provided' });
        return;
    }

    const finalItems: OrderItem[] = [];
    let calculatedTotal = 0;

    // 3. Secure Price Check
    // Iterate serially to check prices against DB
    // We use a regular for..of loop to support await ensuring we can stop execution on error
    for (const item of requestedItems) {
      const productRef = db.collection('products').doc(item.productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        // Stop EVERYTHING if a product is not found
        if (!res.headersSent) return res.status(404).json({ message: `Product not found: ${item.name}` });
        return;
      }

      const productData = productSnap.data() as Product;
      
      // Use real price from DB
      const realPrice = productData.price || 0;

      // Update item with real price to prevent client tampering
      finalItems.push({
        ...item,
        price: realPrice,
        image: productData.image || item.image // Ensure valid image
      });

      calculatedTotal += realPrice * item.quantity;
    }

    // 4. Create Order (Only if loop completed successfully)
    const newOrder = {
      userId: user.uid,
      items: finalItems,
      total: calculatedTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const orderRef = await db.collection('orders').add(newOrder);

    // 5. Send Success Response (Once)
    if (!res.headersSent) {
        res.status(201).json({
          success: true,
          orderId: orderRef.id,
          total: calculatedTotal
        });
    }

  } catch (error) {
    console.error('Error creating order:', error);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    if (!user) {
      if (!res.headersSent) return res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const snapshot = await db.collection('orders')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (!res.headersSent) {
         res.status(200).json(orders);
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    await db.collection('orders').doc(id).update({ status });
    res.status(200).json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = res.locals.user;

        const orderDoc = await db.collection('orders').doc(id).get();
        if (!orderDoc.exists) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderData = orderDoc.data();
        
        // Auth check: User must own order OR be admin
        if (!orderData || (orderData.userId !== user.uid && user.email !== 'admin@tic.com')) {
             return res.status(403).json({ message: 'Unauthorized access to invoice' });
        }

        // Set Headers for PDF Download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);

        const doc = new PDFDocument();
        doc.pipe(res);

        // Header
        doc.fontSize(25).text('INVOICE', 100, 50);
        doc.fontSize(12).text(`Date: ${new Date(orderData.createdAt).toLocaleDateString()}`, 100, 80);
        doc.text(`Order ID: ${id}`, 100, 100);
        doc.text(`User ID: ${orderData.userId}`, 100, 120);

        // Items
        doc.moveDown();
        doc.text('Items:', 100, 150);
        let y = 170;
        
        if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items.forEach((item: any) => {
                doc.text(`${item.name} - Qty: ${item.quantity} x $${item.price} = $${item.quantity * item.price}`, 100, y);
                y += 20;
            });
        }

        doc.fontSize(16).text(`Grand Total: $${orderData.total}`, 100, y + 20);
        
        doc.end();

    } catch (error) {
        console.error("Error generating invoice:", error);
        if (!res.headersSent) res.status(500).json({ message: 'Error generating invoice' });
    }
};
