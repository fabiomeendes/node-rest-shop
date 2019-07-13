/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const User = require('../models/user');

router.post('/signup', (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((existUser) => {
      if (existUser) {
        return res.status(409).json({
          message: 'Mail exists',
        });
      }
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hash,
        });
        user.save()
          .then(() => {
            res.status(201).json({
              message: 'Created user successfully',
            });
          })
          .catch((error) => {
            res.status(500).json({
              error,
            });
          });
      });
    });
});

router.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed!',
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Auth failed',
          });
        }
        if (result) {
          const token = jwt.sign({
            _id: user._id,
            email: user.email,
          }, process.env.JWT_KEY,
          {
            expiresIn: '1h',
          });
          return res.status(200).json({
            message: 'Auth successful',
            token,
          });
        }
        res.status(401).json({
          message: 'Auth failed!!',
        });
      });
    });
});

router.get('/', checkAuth, (req, res) => {
  User
    .find()
    .select('-__v')
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map(x => ({
          _id: x._id,
          email: x.email,
        })),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.delete('/:userId', (req, res) => {
  User.findByIdAndDelete({ _id: req.params.userId })
    .then(() => {
      res.status(200).json({
        message: 'User deleted successfully',
      });
    })
    .catch((error) => {
      res.status(500).json({
        error,
      });
    });
});


module.exports = router;
