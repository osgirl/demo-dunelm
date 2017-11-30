const Prismic = require('prismic-javascript');
const { RichText, Link } = require('prismic-dom');
const app = require('./config');
const config = require('./prismic-configuration');
const PORT = app.get('port');
const Cookies = require('cookies');

app.listen(PORT, () => {
  console.log(`Go to browser: http://localhost:${PORT}`);
});

//Middleware catch all request, query Prismic API and configure everything for it
app.use((req, res, next) => {
  //init prismic context
  res.locals.ctx = {
    endpoint: config.apiEndpoint,
    linkResolver: config.linkResolver
  };
  //put RichText Helper from Prismic DOM to simplify convert RichText from json to html
  res.locals.RichText = RichText;
  //put Link helper from Prismic DOM to simplify getting url from link
  res.locals.Link = Link;

  Prismic.api(config.apiEndpoint, {
    accessToken: config.accessToken,
    req
  })
  .then((api) => {
    req.prismic = { api };
    //continue spreading request
    next();
  })
  .catch((error) => {
    //next with params handle error natively in express
    next(error.message);
  });
});


//preview
app.get('/preview', (req, res) => {
  const token = req.query.token;
  if (token) {
    req.prismic.api.previewSession(token, config.linkResolver, '/')
    .then((url) => {
      const cookies = new Cookies(req, res);
      cookies.set(Prismic.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
      res.redirect(302, url);
    }).catch((err) => {
      res.status(500).send(`Error 500 in preview: ${err.message}`);
    });
  } else {
    res.send(400, 'Missing token from querystring');
  }
});

// Index redirects to /home-and-funiture
app.get('/', (req, res, next) => {
  res.redirect('/home-and-furniture');
});

// Main category page
app.get('/home-and-furniture', (req, res, next) => {
  req.prismic.api.getByUID("category", "home-and-furniture",
    { 'fetchLinks' : ['category.main_image','category.name'] }
  )
  .then((document) => {
    if(!document) res.status(404).send('page not found');
    else res.render('category', { document });
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});

// Route for sub categories
app.get('/home-and-furniture/:uid', (req, res, next) => {
  const uid = req.params.uid;
  req.prismic.api.getByUID("category", uid,
    { 'fetchLinks' : ['category.main_image','category.name'] }
  )
  .then((document) => {
    if(!document) res.status(404).send('page not found');
    else res.render('category', { document });
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});

// Index redirects to /home-and-funiture
app.get('/{uid}', (req, res, next) => {
  res.redirect('/home-and-furniture');
});