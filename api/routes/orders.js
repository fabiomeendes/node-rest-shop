/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

const localUrl = 'http://localhost:3000/orders/';

router.get('/', (req, res) => {
  Order
    .find()
    .select('-__v')
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(x => ({
          id: x._id,
          product: x.product,
          quantity: x.quantity,
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
});

router.post('/', (req, res) => {
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
          id: result._id,
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
});


router.get('/:orderId', (req, res) => {
  Order.findById(req.params.orderId)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found',
        });
      }
      res.status(200).json({
        order,
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
});

router.delete('/:orderId', (req, res) => {
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
});

module.exports = router;
