module.exports = {

  apiEndpoint: 'https://dunelm-demo.prismic.io/api/v2',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes
  linkResolver: function(doc, ctx) {
    if (doc.type == 'category') {
      if (doc.uid == 'home-and-furniture') {
        return '/home-and-furniture';
      } else {
        return '/home-and-furniture/' + doc.uid;
      }
    } 
    return '/';
  }
};
