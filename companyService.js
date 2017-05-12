'use strict'
app.service('companyService', ['$http', 'SERVICE_PATH','$rootScope', function ($http, SERVICE_PATH,$rootScope) {
	var serviceCompanyBase = SERVICE_PATH.Root + 'company/';
	
	this.GetCompany = function (CompanyID, active) {
		var obj_company = { CompanyID: CompanyID, Active: active };
		return $http.post(serviceCompanyBase + 'GetCompany', $rootScope.ObjecttoParams(obj_company)).then(function (results) {
			return results.data.data;
		});
	}

	this.GetCompanyComboData = function(){
		return $http.get(serviceCompanyBase + 'GetCompanyComboData').then(
		function (results) {
			return results.data;
		});
	}

	this.checkDuplicate = function (companySet) {
		var obj_company = { objCompanyInfo: JSON.stringify(companySet) };
		return $http.post(serviceCompanyBase + 'checkDuplicate', $rootScope.ObjecttoParams(obj_company)).then(function (results) {
			return results.data.data;
		});
	}

	this.SaveCompany = function (companySet) {
		var obj_company = { objCompanyInfo: JSON.stringify(companySet) };
		return $http.post(serviceCompanyBase + 'AddCompany', $rootScope.ObjecttoParams(obj_company)).then(function (results) {
			return results.data.data;
		});
	}

	this.DeleteCompany = function (CompanyID) {
		//var obj_company = { CompanyID : CompanyID };
		return $http.delete(serviceCompanyBase + 'DeleteCompanySetup/' + CompanyID).then(function (results) {
			return results.data.data;
		});
	}

	this.SaveImagePath = function (FileName, FileExt) {
		var CompanySet = { "ID": FileName, "FileExt": FileExt };
		var obj_company = { objCompanyInfo: JSON.stringify(CompanySet) };
		return $http.post(serviceCompanyBase + 'SaveImagePath', $rootScope.ObjecttoParams(obj_company)).then(function (results) {
			return results.data.data;
		});
	}

	this.GetImagePath = function (CompanyID, FileExt) {
		var params = parseInt(CompanyID) + '/' + FileExt;
		var encryptdata = $rootScope.EncodeStringToBase64(params);

		return $http.get(SERVICE_PATH.File + 'Download/GetCompanyPhoto/' + encryptdata).then(
			function (results) {
				return results.data;
			}, function (error) {
				return error;
			});
	}
}]);