const express = require('express');
require('dotenv').config();
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const controller = require('./controllers/controller');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure views for rendering pages
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Allow app to parse form inputs
app.use(express.urlencoded({ extended: true }));

// Set up express session and use Prisma for store
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, // 2 minutes in ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// Set up prisma client
const prisma = new PrismaClient();

// Set up passport local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
    } catch (err) {
      done(err);
    }

    if (!user) {
      return done(null, false, { message: "User doesn't exist." });
    }

    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(password, user.hash);
    } catch (err) {
      done(err);
    }

    if (!passwordMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
  })
);

app.use(passport.session());

// Add functions for serializing and deserializing users
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware for protecting routes from logged out users
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Load the locals with user
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', isLoggedIn, controller.indexGet);
app.get('/register', controller.registerGet);
app.post('/register', controller.registerPost);
app.get('/login', controller.loginGet);
app.post('/login', controller.loginPost);
app.get('/logout', isLoggedIn, controller.logout);

// Error catching middleware
app.use((err, req, res, next) => {
  res.status(500).render('error', { message: err.message });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }

  console.log('App listening to requests on port ' + PORT + '.');
});
