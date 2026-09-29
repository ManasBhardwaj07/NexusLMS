module.exports = {
  forbidden: [
    {
      name: 'packages-cannot-import-web-or-api',
      severity: 'error',
      comment: 'Packages are shared and must not depend on the web or api applications.',
      from: { path: '^packages/' },
      to: { path: '^(web|api)/' }
    },
    {
      name: 'no-cross-module-imports-in-api',
      severity: 'error',
      comment: 'API modules must be strictly isolated and cannot import from sibling modules directly.',
      from: { path: '^api/src/modules/([^/]+)/' },
      to: { 
        path: '^api/src/modules/([^/]+)/',
        pathNot: '^api/src/modules/$1/'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    }
  }
};
