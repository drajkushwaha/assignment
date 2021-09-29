var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mongoose = require("mongoose")
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const cors = require("cors");
const http = require("http")
require("dotenv").config()

var app = express();
app.use(cookieParser());

const dbURL= process.env.DB_URL
// view engine setup
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1);
const RedisStore = connectRedis(session)
//Configure redis client
const redisClient = redis.createClient({
    host: '127.o.0.1',
    port: 6379
})
redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});
//Configure session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge: 1000 * 60 * 10 // session max age in miliseconds
    }
}))

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

mongoose.connect(dbURL,
  {
    useNewUrlParser:true,
    useUnifiedTopology:true, 
  }).then(()=>{
    console.log('MongoDb Connected')
  }).catch((err)=>{
    console.log("Database not Connected")
    throw err;
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var port = process.env.PORT ||'8080';
var httpServer = http.createServer(app)

httpServer.listen(port,(err,resp)=>{
  if(err)throw err;
  console.log(`App started on ${port}`)
})

module.exports = app;


// class Users {
//   /**
//    This is our sign-up method, only admins should be able to reach this endpoint, after the user is created we will send an invite link to the user where they can complete their sign-up and change the password.
//    */
//   static async inviteUser(req, res) {
//     const { me } = req;
//     if (!me || !me.id) {
//       return res.status(UNAUTHORIZED.code).json(UNAUTHORIZED);
//     }

//     const { email, restaurantId, organizationId } = req.body;
//     const ERROR = missingRequired({ email, restaurantId });
//     if (ERROR) return res.status(ERROR.code).json(ERROR);

//     // Check if the user is admin, req.me is set in a middleware that is wrapped around all routes.
//     const permissions = await AuthService.authorize(me);
//     if (!permissions) {
//       return res.status(UNAUTHORIZED.code).json(UNAUTHORIZED);
//     }

//     // validate user input
//     const emailIsValid = validateEmail(email);
//     if (!emailIsValid) {
//       return res.status(EMAIL_INVALID.code).json(EMAIL_INVALID);
//     }

//     // check if e-mail exists
//     const emailExists = await UserService.findOne({ email });
//     if (emailExists) {
//       return res.status(EMAIL_EXISTS.code).json(EMAIL_EXISTS);
//     }

//     // hash and save password
//     const hashedPassword = bcrypt.hashSync('password', salt);
//     const user = await UserService.create({
//       email,
//       password: hashedPassword,
//       organization: organizationId,
//     });
//     const userId = user.id;

//     const verificationToken = await VerificationTokenService.create(
//       userId,
//       'email'
//     );

//     // Here we send an e-mail to the invited user, the link will take the user to a password form so they can change their password.
//     const link = `${process.env.CLIENT_URL}/sign-up/${verificationToken.token}`;
//     await MailService.inviteUserEmail(
//       link,
//       email,
//       inviter.firstname,
//       organization.name
//     );

//     res.json('User invited.');
//   }
//   catch(error) {
//     internalServerError(req, res, error);
//   }
// }

// module.exports = Users;

// const User = require('../models/user');
// const recipes = require('../models/Recipes');
// const _users = {};

// _users.signUp = async (req, res) => {
//   try {
//     let data = req.body;
//     // data.role = 1;
//     let result = await new User(data).save();
//     if (result) {
//       res.status(200).send({
//         success: true,
//         message: 'User Save',
//         data: result,
//       });
//     }
//   } catch (err) {
//     res.status(400).send({
//       success: false,
//       message: err,
//     });
//   }
// };

// _users.AdminsignUp = async (req, res) => {
//   try {
//     let data = req.body;
//     data.role = 1;
//     let adminResult = await User.create(data);
//     if (adminResult) {
//       res.status(200).send({
//         success: true,
//         message: 'Admin Save Successfully',
//         data: adminResult,
//       });
//     }
//   } catch (err) {
//     res.status(400).send({
//       success: false,
//       message: err,
//     });
//   }
// };

// _user.AccessData = async (req, res) => {
//   try {
//     let result = await User.findOne({ _id: req.body._id });
//     if ((result.access = true)) {
//       let receptData = await recipes.find();
//       if (receptData) {
//         res.status(200).send({
//           success: true,
//           message: 'Data found',
//           data: receptData,
//         });
//       } else {
//         res.status(404).send({
//           success: false,
//           message: 'Data not found',
//         });
//       }
//     } else {
//       res.status(401).send({
//         success: false,
//         message: 'You Don;t have access',
//       });
//     }
//   } catch (err) {
//     res.status(400).send({
//       success,
//     });
//   }
// };

// module.exports = _users;
