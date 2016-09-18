'use strict';

angular.module('processAdminApp')
  .factory('factoryCommon', function ($http, $q, constants, messageHandler) {

    var factory = {};

    factory.post = function( data, url ) {
      var deferred = $q.defer();
      url = constants.API_ENDPOINT + url ;

      $http.post( url, data )
        .success(function(data, status, headers, config) {
          messageHandler.showSuccess('Action succesful!');
          deferred.resolve(data);
        }).error(function(response){
          factory.showError('Error in action ');
          deferred.reject(response);
        });
      return deferred.promise;
    };

    factory.save = function( data, url ) {
      var deferred = $q.defer();
      url = constants.API_ENDPOINT + url ;

      $http.post( url, data )
        .success(function(data, status, headers, config) {
          messageHandler.showSuccess('Item saved succesful ');
          deferred.resolve(data);
        }).error(function(response){
          factory.showError('Error saving item... ');
          deferred.reject(response);
        });
      return deferred.promise;
    }

    factory.get = function(url) {
      var deferred = $q.defer();
      url = constants.API_ENDPOINT + url ;

      $http.get( url )
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        }).error(function(response){
          factory.showError('Error getting data ');
          deferred.reject(response);
        });
      return deferred.promise;
    };

    factory.put = function ( data, url ) {
      var deferred = $q.defer();
      url = constants.API_ENDPOINT + url ;

      $http.put(url, data)
        .success(function(data, status, headers, config) {
          messageHandler.showSuccess('Item updated ');
          deferred.resolve(data);

        }).error(function(error){
        factory.showError('Error udating item... ');
          deferred.reject(error);
        });

      return deferred.promise;
    };

    factory.delete = function ( url ) {
      var deferred = $q.defer();
      url = constants.API_ENDPOINT + url ;

      $http.delete(url)
        .success(function(data, status, headers, config) {
          messageHandler.showSuccess('Item deleted');
          deferred.resolve(data);
        }).error(function(error){
        factory.showError('"Error deleting... ' + error.message);
          deferred.reject(error);
        });

      return deferred.promise;
    };

    return factory;

  });
