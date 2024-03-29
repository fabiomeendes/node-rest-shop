/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const Product = require('../models/product');

const localUrl = 'http://localhost:3000/products/';

exports.products_get_all = (req, res) => {
  Product
    .find()
    .select('-__v') // or ('_id name price')
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map(x => ({
          _id: x._id,
          name: x.name,
          price: x.price,
          productImage: x.productImage,
          request: {
            type: 'GET',
            url: `${localUrl}${x._id}`,
          },
        })),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_create_product = (req, res) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Created product successfully',
        createdProduct: {
          _id: result._id,
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          request: {
            type: 'GET',
            url: `${localUrl}${result._id}`,
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_get_product = (req, res) => {
  Product
    .findById(req.params.productId)
    .select('-__v')
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          _id: doc._id,
          name: doc.name,
          price: doc.price,
          productImage: doc.productImage,
          seeTheImage: `http://localhost:3000/${doc.productImage}`,
          request: {
            type: 'GET',
            description: 'Get all products',
            url: `${localUrl}`,
          },
        });
      } else {
        res.status(404).json({
          message: 'No valid entry found for provided ID',
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_edit_product = (req, res) => {
  Product.update({ _id: req.params.productId }, req.body)
    .exec()
    .then(() => {
      res.status(200).json({
        message: 'Product updated successfully',
        request: {
          type: 'GET',
          url: `${localUrl}${req.params.productId}`,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_delete_product = (req, res) => {
  Product
    .findByIdAndDelete(req.params.productId)
    .exec()
    .then(() => {
      res.status(200).json({
        message: 'Product deleted successfully',
        request: {
          type: 'POST',
          url: `${localUrl}`,
          data: {
            name: 'String',
            price: 'Number',
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};
