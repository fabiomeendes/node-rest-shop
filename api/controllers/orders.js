/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

const localUrl = 'http://localhost:3000/orders/';

exports.orders_get_all = (req, res) => {
  Order
    .find()
    .select('-__v')
    .populate('product', 'name')
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(x => ({
          _id: x._id,
          quantity: x.quantity,
          product: x.product,
          request: {
            type: 'GET',
            url: `${localUrl}${x._id}`,
          },
        })),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.orders_create_order = (req, res) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      res.status(201).json({
        message: 'Order created successfully',
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        request: {
          type: 'GET',
          url: `${localUrl}${result._id}`,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Product not found',
        error: err,
      });
    });
};

exports.orders_get_order = (req, res) => {
  Order.findById(req.params.orderId)
    .select('-__v')
    .populate('product', '-__v')
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found',
        });
      }
      return res.status(200).json({
        _id: order._id,
        quantity: order.quantity,
        product: order.product,
        productName: order.product.name, // test
        request: {
          type: 'GET',
          url: `${localUrl}`,
        },
      });
    })
    .catch((error) => {
      res.status(200).json({
        error,
      });
    });
};

exports.orders_delete_order = (req, res) => {
  Order.findByIdAndDelete(req.params.orderId)
    .exec()
    .then(() => {
      res.status(200).json({
        message: 'Order deleted successfully',
        request: {
          type: 'POST',
          url: `${localUrl}`,
          body: { productId: 'ID', quantity: 'Number' },
        },
      });
    })
    .catch((error) => {
      res.status(200).json({
        error,
      });
    });
};
