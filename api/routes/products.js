const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/products');
const localUrl = 'http://localhost:3000/products/'

router.get('/', (req, res, next) => {
  Product
    .find()
    .select('-__v') // or ('_id name price')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(x => {
          return {
            id: x._id,
            name: x.name,
            price: x.price,
            request: {
              type: 'GET',
              url: `${localUrl}${x._id}`,
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
  })
  product
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Created product successfully',
        createdProduct: {
          id: result._id,
          name: result.name,
          price: result.price,
          request: {
            type: 'GET',
            url: `${localUrl}${result._id}`,
          }
        },
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err,
      })
    });
});

router.get('/:productId', (req, res, next) => { 
  Product
    .findById(req.params.productId)
    .select('-__v')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          id: doc._id,
          name: doc.name,
          price: doc.price,
          request: {
            type: 'GET',
            description: 'Get all products',
            url: `${localUrl}`,
          }
        });
      } else {
        res.status(404).json({
          message: 'No valid entry found for provided ID',
        });
      }      
    })
    .catch(err => {
      res.status(500).json({ 
        error: err,
      });
    });
});

router.patch('/:productId', (req, res, next) => {
  Product.update({ _id: req.params.productId }, req.body)
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Product updated',
        request: {
          type: 'GET',
          url: `${localUrl}${req.params.productId}`
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });    
});

router.delete('/:productId', (req, res, next) => {
  Product
    .findByIdAndDelete(req.params.productId)
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Product deleted',
        request: {
          type: 'POST',
          url: `${localUrl}`,
          data: {
            name: 'String',
            price: 'Number',
          }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;