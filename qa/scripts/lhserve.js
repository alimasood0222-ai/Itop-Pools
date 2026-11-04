const { serve, DIST, fs, path } = require('./lib');
(async () => {
  await serve(8090);
  const h = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').replace('</head>', '<style>.hs-shimmer{display:none!important}</style></head>');
  await serve(8091, { '/': h });
  console.log('serving');
})();
