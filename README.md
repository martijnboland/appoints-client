Appoints Client
===============

Appoints is an appointment scheduling sample application that hopefully provides a bit of guidance into the wild west that is called 'Modern Day Web Development'. 
It consists of a [Node.js REST API backend](https://github.com/martijnboland/appoints-api-node) and an AngularJS frontend app (this project). A live demo can be found at https://appoints-client.azurewebsites.net.

## Development

To start developing in the project run:

```bash
gulp serve
```

Then head to `http://localhost:3001` in your browser.

The `serve` tasks starts a static file server, which serves the AngularJS application, and a watch task which watches all files for changes and lints, builds and injects them into the index.html accordingly.

## Tests

To run tests run:

```bash
gulp test
```

**Or** first inject all test files into `karma.conf.js` with:

```bash
gulp karma-conf
```

Then you're able to run Karma directly. Example:

```bash
karma start --single-run
```

## Production ready build

To make the app ready for deploy to production run:

```bash
gulp dist
```

Now there's a `./dist` folder with all scripts and stylesheets concatenated and minified, also third party libraries installed with bower will be concatenated and minified into `vendors.min.js` and `vendors.min.css` respectively.
