# RedRunner Canary

A minimal app to ensure RedRunner works correctly when installed via npm, as opposed to being a Lerna package in the same project.

The reason is that some bundlers (like Parcel) treat symlinks differently, and allow things to work when running as a Lerna package which do not.

### Running:

#### 1. install

First install the node modules:

```
npm i
```

#### 2. link

Link the packages as symlinks in node_modules:

```
./link.sh
```

Repeat this whenever you make changes to packages.

#### 3. run

Then run the webpack-dev-server:

```
npm run start
```

This will run at http://0.0.0.0:8080.

