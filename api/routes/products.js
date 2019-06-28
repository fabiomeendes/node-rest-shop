const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/products');

router.get('/', (req, res, next) => {
  Product
    .find()
    .exec()
    .then(docs => {
      res.status(200).json(docs);
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
        message: 'Handling POST requests to /products',
        createdProduct: result,
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
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
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
  Product.update({ _id: req.params.productId }, { $set: req.body })
    .exec()
    .then(result => {
      res.status(200).json(result);
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
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;