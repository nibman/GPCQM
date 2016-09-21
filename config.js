module.exports = function() {
  var config = {};
  config.basePaths = {
    src: 'build/',
    dest: 'public/assets/',
    serverPath: 'localhost',
    port: '9000',
  };
  config.paths = {
    sass: {
      prefix: ['last 3 versions', 'Firefox ESR', 'Opera 12.1'],
      src: config.basePaths.src + ['assets/sass/**/*.scss'],
    },
    css: {
      dest: config.basePaths.src + ['css'],
      output: config.basePaths.dest + ['css'],
    },
    js: {
      src: config.basePaths.src + ['assets/javascripts/*.js'],
      dest: config.basePaths.dest + ['javascripts'],
    },
    fonts: {
      src: config.basePaths.src + 'assets/fonts/**/*.{ttf,woff,woff2,eof,svg,otf}',
      dest: config.basePaths.dest + 'fonts',
    },
    html: {
      dest: config.basePaths.src + 'html/',
      output: 'public/',
      pages: config.basePaths.src + 'pages/**/*.+(html|nunjucks)',
      templates: config.basePaths.src + 'templates',
      src: config.basePaths.src + 'html/**/*.html',
      nunjucks: config.basePaths.src + ['**/*.+(html|nunjucks)'],
    },
  };
   return config;
}
