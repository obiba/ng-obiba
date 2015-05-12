'use strict';

describe('httpErrorsInterceptor tests', function () {

  var $rootScope, $httpBackend, ServerErrorUtils;

  // executed before each "it" is run.
  beforeEach(function () {

    // load the module.
    module('obiba.rest');
    module('obiba.utils');

    inject(function (_$rootScope_, _$httpBackend_, _ServerErrorUtils_) {
      $rootScope = _$rootScope_;
//      spyOn($rootScope, '$broadcast').andCallThrough();
      spyOn($rootScope, '$broadcast');
      ServerErrorUtils = _ServerErrorUtils_;
      $httpBackend = _$httpBackend_;
      $httpBackend.when('GET', '/success').respond(200, 'success');
      $httpBackend.when('GET', '/error').respond(500, 'error');
    });

  });

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should do nothing on success',
    inject(function ($http, NOTIFICATION_EVENTS) {

      $http({method: 'GET', url: '/success'})
        .success(function () { expect(true).toBe(true); })
        .error(function () { expect(true).toBe(false); });

      expect($rootScope.$broadcast).not.toHaveBeenCalledWith(NOTIFICATION_EVENTS.showNotificationDialog);
    }));

//  it('should reject response and emit showNotificationDialog event on error without error handler',
//    inject(function ($http, NOTIFICATION_EVENTS) {
//
//      $http({method: 'GET', url: '/error'})
//        .success(function () { expect(true).toBe(false); })
//        .error(function () { expect(true).toBe(true); });
//      expect($rootScope.$broadcast).toHaveBeenCalledWith(NOTIFICATION_EVENTS.showNotificationDialog);
//    }));


//  it('should just reject response on error with error handler', function () {
//
//  });

});