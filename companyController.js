'use strict';
app.controller('companyController', ['$scope', 'companyService', 'vehicleService', 'localStorageService', '$rootScope', 'imageService',
	function ($scope, companyService, vehicleService, localStorageService, $rootScope, imageService) {
		var authData = localStorageService.get('authorizationData');
		var appName = authData.appName;
		var authCookie = localStorageService.cookie;
		var chkState = "";
		var btnNew = false;
		$scope.companySets = [];
		$scope.companySet = {};
		$scope.active = true;

		$scope.newCompany = function () {
			btnNew = true;
			$scope.emailunique = 0;
			$scope.emailvalid = 0;
			$scope.namerequried = 0;
			$scope.addressRequried = 0;
			$scope.phrequried = 0;
			$scope.nofvehicleRequiried = 0;
			$scope.companySet = {};
			$scope.companySet.show = true;
			$scope.companySet.IsActive = true;
			$scope.companySet.CompanyID = 0;
			$scope.imgSrc = "img/0.jpg";
			$scope.IsActive = 0;
			$rootScope.imagereset('chooseimg');
		}

		function init() {
			companyService.GetCompany(0, $scope.active).then(function (result) {
				for (var i = 0; i < result.length; i++) {
					if (result[i].IsActive == 1) { result[i].IsActive = true; }
					else if (result[i].IsActive == 0) { result[i].IsActive = false; }
				}
				$scope.companySets = result;
			});
			$scope.newCompany();
			btnNew = false;
		};

		init();

		$scope.getCompany = function () {
			init();
		}

		$scope.selectedCompany = function (companySet, companyID) {
			$rootScope.imagereset('chooseimg');

			angular.forEach($scope.companySets, function (companySet) {
				companySet.selected = false;
				companySet.editing = false;
			});
			companySet.selected = true;
			companyService.GetCompany(companyID, $scope.active).then(function (result) {
				$scope.companySet = result[0];

				if ($scope.companySet.IsActive == 1)
					$scope.companySet.IsActive = true;
				else
					$scope.companySet.IsActive = false;

				$scope.emailunique = 0;
				$scope.emailvalid = 0;
				$scope.namerequried = 0;
				$scope.licenserequried = 0;
				$scope.nrcrequried = 0;
				$scope.addressRequried = 0;
				$scope.phrequried = 0;
				$scope.companySet.show = true;
				if ($scope.companySet.LogoPath != null) {
					var subfiletype = $scope.companySet.LogoPath.indexOf(".");
					var Ext = $scope.companySet.LogoPath.substring(subfiletype);
					Ext = Ext.replace(".", "");
					companyService.GetImagePath($scope.companySet.CompanyID, Ext).then(function (imgEmp) {
						$scope.imgSrc = imgEmp;
					});
				}
				else
					$scope.imgSrc = "img/0.jpg";
			});
		}

		$scope.deleteConfirm = function () {
			$rootScope.items = ['Delete Confirmation', "Are you sure delete?", [{ "name": "OK", "action": "deleteCompany()" }, { "name": "Cancel", "action": "close()" }]];
			$rootScope.messagePopup();
		}

		$rootScope.deleteCompany = function () {
			$rootScope.modalInstance.close();
			companyService.DeleteCompany($scope.companySet.CompanyID).then(function (result) {
				if (result) {
					$rootScope.items = ['' + appName + ' - Company Setup ', "Delete Successfully.", false];
				} else {
					$rootScope.items = ['' + appName + ' - Company Setup ', "Selected Company can't delete because it is already used in Other.", false];
				}
				$rootScope.messagePopup();
				init();
			});
		}
		$scope.saveCompany = function () {
			companyService.checkDuplicate($scope.companySet).then(function (result) {
				var dupName = result[0].Name;
				var dupEmail = result[0].Email;

				if (dupName == "1") {
					$scope.chkunique = 1;
				}
				if (dupEmail == "1") {
					$scope.emailunique = 1;
				}

				if (dupName == "0" && dupEmail == "0") {
					$rootScope.items = ['' + appName + ' - Company Setup ', ($scope.companySet.CompanyID === 0 ? "Save Successfully." : "Update Successfully."), false];
					companyService.SaveCompany($scope.companySet).then(function (result) {
						if (result > 0) {
							$scope.companySet.CompanyID = result;
							if ($rootScope.filevalue != null && $rootScope.cropper.croppedImage != null) {
								$scope.uploading = true;
								$scope.subfiletype = $rootScope.filevalue.name.lastIndexOf(".");
								var Ext = $rootScope.filevalue.name.substring($scope.subfiletype)
								Ext = Ext.replace(".", "");

								var file = $rootScope.base64ToBlob($rootScope.cropper.croppedImage.replace('data:image/png;base64,', ''), 'image/jpeg');
								imageService.uploadFile(file, $scope.companySet.CompanyID, "uploadCompanyPhoto", Ext).then(
									function (response) {
										$scope.uploading = false;

										if ($scope.companySet.CompanyID > 0) {
											companyService.SaveImagePath($scope.companySet.CompanyID, Ext).then(function () {
												$rootScope.messagePopup();
												init();
											});
										}
									}
								);
							}
							else {
								$rootScope.messagePopup();
								init();
							}
						} else {
							$rootScope.items = ['' + appName + ' - Company Setup ', "Save Unsuccessfully", false];
							$rootScope.messagePopup();
							init();
						}
					});
				}
			});
		}
	}]);