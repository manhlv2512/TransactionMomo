'use strict';

const multer = require('multer');
const Router = require('../libs/Router');
const {AUTH_TYPE, licenseDir, releasesDir, temporaryDir, roles} = require('../config');
let ctrlAuth, ctrlAccount, ctrlUser, ctrlUserDisabled;
if (AUTH_TYPE === "local") {
  ctrlAuth = require('../app/Controllers/AuthController');
  ctrlAccount = require('../app/Controllers/AccountController');
  ctrlUser = require('../app/Controllers/UserController');
  ctrlUserDisabled = require('../app/Controllers/UserDisabledController');
} else {
  ctrlAuth = require('../app/Controllers/GRPC/AuthController');
  ctrlAccount = require('../app/Controllers/GRPC/AccountController');
  ctrlUser = require('../app/Controllers/GRPC/UserController');
}
const ctrlProfile = require('../app/Controllers/ProfileController');
const ctrlArea = require('../app/Controllers/AreaController');
const ctrlCompany = require('../app/Controllers/CompanyController');
const ctrlOOHPosition = require('../app/Controllers/OOHPositionController');
// const ctrlTest = require('../app/Controllers/TestController');

// Middleware
const middleware = require('../app/Middleware');
const ExtendResponse = middleware.extendResponse;
// header validation
const header_validation = require('./header_validation');
// config upload folder
const upload = multer({dest: temporaryDir});
const uploadFirmware = multer({dest: releasesDir});
const uploadLicense = multer({dest: licenseDir});

/**
 * Application routes
 */
module.exports = (app) => {
  app.use(header_validation);
  app.use(ExtendResponse);
  let router = new Router();

  // TODO Routes not require authenticate
  router.group((router) => {
    // Routes authentication
    router.post('/api/register', ctrlAuth.register)
    router.post('/api/login', ctrlAuth.login)

    // API for guest
    router.group('/api/guest', (router) => {

    })

    // Routes test
    router.group('/api/test', (router) => {

    })
  })

  // TODO Required authentication
  router.group({prefix: '/api', middlewares: [middleware.auth]}, (router) => {

    // TODO Routes all roles
    router.get('/logout', ctrlAuth.logout);
    // Routes password
    router.post('/change-password', ctrlAuth.changePassword);
    // Routes profile
    router.get('/profile', ctrlProfile.getProfile);
    // Route areas
    router.get('/areas', ctrlArea.index);
    // Routes companies
    router.get('/companies', ctrlCompany.index)
    // Routes ooh-positions
    router.get('/ooh-positions', ctrlOOHPosition.index);

    // TODO Routes roles = [roles.root, roles.admin]
    router.group({middlewares: [middleware.role(roles.root, roles.admin)]}, (router) => {
      // Routes password
      // router.post('/reset-password', ctrlAuth.resetPassword);
      router.put('/reset-password/:userId', ctrlAuth.resetDefaultPassword);
      router.put('/lock-account/:userId', ctrlAuth.lockAccount);
      router.put('/unlock-account/:userId', ctrlAuth.unlockAccount);
    });

    // TODO Routes role = roles.root
    router.group({middlewares: [middleware.role(roles.root)]}, (router) => {
      // Routes accounts admin
      router.get('/accounts', ctrlAccount.index)
      router.post('/accounts', ctrlAccount.store)
      router.param('accountId', ctrlAccount.load)
      router.get('/accounts/:accountId', ctrlAccount.detail)
      router.put('/accounts/:accountId', ctrlAccount.update)
      router.delete('/accounts/:accountId', ctrlAccount.destroy)
      router.post('/accounts/deleteMulti', ctrlAccount.deleteMulti);
    });

    // TODO Routes role = roles.admin
    router.group({middlewares: [middleware.role(roles.admin)]}, (router) => {
      // Routes users
      router.get('/users', ctrlUser.index)
      router.get('/users/getRoles', ctrlUser.getRoles)
      router.post('/users', ctrlUser.store)
      router.param('userId', ctrlUser.load)
      router.get('/users/:userId', ctrlUser.detail)
      router.put('/users/:userId', ctrlUser.update)
      router.delete('/users/:userId', ctrlUser.destroy)
      router.post('/users/deleteMulti', ctrlUser.deleteMulti);
      // Routes users disable
      router.get('/users-disabled', ctrlUserDisabled.index);
      router.put('/users-disabled/:userId', ctrlUserDisabled.update);
      router.delete('/users-disabled/:userId', ctrlUserDisabled.destroy)
      // Route areas
      // router.get('/areas', ctrlArea.index);
      router.post('/areas', ctrlArea.store);
      router.param('areaId', ctrlArea.load);
      router.get('/areas/:areaId', ctrlArea.detail);
      router.put('/areas/:areaId', ctrlArea.update);
      router.delete('/areas/:areaId', ctrlArea.destroy);
      router.post('/areas/deleteMulti', ctrlArea.deleteMulti);

      // Routes companies
      // router.get('/companies', ctrlCompany.index)
      router.post('/companies', ctrlCompany.store)
      router.param('companyId', ctrlCompany.load)
      router.get('/companies/:companyId', ctrlCompany.detail)
      router.put('/companies/:companyId', ctrlCompany.update)
      router.delete('/companies/:companyId', ctrlCompany.destroy)
      router.post('/companies/deleteMulti', ctrlCompany.deleteMulti);

      // Routes ooh-positions
      // router.get('/ooh-positions', ctrlOOHPosition.index);
      router.post('/ooh-positions', ctrlOOHPosition.store);
      router.param('oohPositionId', ctrlOOHPosition.load);
      router.get('/ooh-positions/:oohPositionId', ctrlOOHPosition.detail);
      router.put('/ooh-positions/:oohPositionId', ctrlOOHPosition.update);
      router.delete('/ooh-positions/:oohPositionId', ctrlOOHPosition.destroy);
      router.post('/ooh-positions/deleteMulti', ctrlOOHPosition.deleteMulti);
    });
  });

  router = router.init();
  app.use(router)
};
