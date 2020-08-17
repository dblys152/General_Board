const express = require('express');
const router = express.Router();

const file = require('./file.js');
const posts = require('./posts.js');
const users = require('./users.js');

//-----add-----

router.use('/', posts);
router.use('/users', users);
router.use('/file', file);
//-----add-----

module.exports = router;