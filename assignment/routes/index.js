var express = require('express');
var router = express.Router();
const User = require('../app/user/Controller/UserController')
const auth = require('../app/middleware/auth')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post ('/signup', User.signup)
router.post('/signin',User.SignIn)

module.exports = router;
