'use strict';

describe('StringUtils tests', function () {

  var stringUtils;

  // excuted before each "it" is run.
  beforeEach(function () {

    // load the module.
    module('obiba.utils');

    // inject your service for testing.
    inject(function (StringUtils) {
      stringUtils = StringUtils;
    });
  });

  // check to see if it has the expected function
  it('should have a capitaliseFirstLetter function', function () {
    expect(angular.isFunction(stringUtils.capitaliseFirstLetter)).toBe(true);
  });

  it('should capitalise first letter', function () {
    expect(stringUtils.capitaliseFirstLetter('bar')).toBe('Bar');
    expect(stringUtils.capitaliseFirstLetter('BAR')).toBe('BAR');
    expect(stringUtils.capitaliseFirstLetter()).toBe(null);
    expect(stringUtils.capitaliseFirstLetter('')).toBe(null);
  });
});