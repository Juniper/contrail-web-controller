/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-utils',
    'contrail-list-model',
    'contrail-view-model'
], function (cotu, ContrailListModel, ContrailViewModel) {

    this.getRegExForUrl = function (url) {
        var regexUrlMap = {
            '/api/tenants/config/domains': /\/api\/tenants\/config\/domains.*$/,
            '/api/tenants/config/all-domains': /\/api\/tenants\/config\/all-domains.*$/,
            '/api/tenants/config/projects': /\/api\/tenants\/config\/projects.*$/,
            '/api/tenants/projects': /\/api\/tenants\/projects.*$/,
            '/api/tenants/config/all-projects': /\/api\/tenants\/config\/all-projects\?.*$/,
            '/api/tenant/networking/virtual-networks/details': /\/api\/tenant\/networking\/virtual-networks\/details\?.*$/,

            '/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend': /\/api\/tenant\/networking\/virtual-network\/summary\?.*$/,

            '/api/tenant/networking/virtual-machines/details': /\/api\/tenant\/networking\/virtual-machines\/details\?.*$/,
            '/api/tenant/networking/virtual-machine-interfaces/summary': /\/api\/tenant\/networking\/virtual-machine-interfaces\/summary\?.*$/,
            '/api/tenant/networking/virtual-machine-interfaces/summary': /\/api\/tenant\/networking\/virtual-machine-interfaces\/summary.*$/,
            '/api/tenant/networking/stats': /\/api\/tenant\/networking\/stats.*$/,
            '/api/qe/query': /\/api\/qe\/query.*$/,
            '/api/tenant/networking/network/stats/top' :  /\/api\/tenant\/networking\/network\/stats\/top.*$/,
            '/api/tenant/monitoring/project-connected-graph': /\/api\/tenant\/monitoring\/project-connected-graph.*$/,
            '/api/tenant/monitoring/project-config-graph': /\/api\/tenant\/monitoring\/project-config-graph.*$/,

            '/api/tenants/networks/default-domain:admin': /\/api\/tenants\/networks\/default-domain:admin.*$/,
            '/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend' : /\/api\/tenant\/networking\/flow-series\/vn\?.*$/,
            '/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend': /\/api\/tenant\/networking\/network\/stats\/top\?.*$/,
            '/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend': /\/api\/tenant\/monitoring\/network-connected-graph\?.*$/,
            '/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend': /\/api\/tenant\/monitoring\/network-config-graph\?.*$/,
            '/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn': /\/api\/tenant\/networking\/virtual-machines\/details\?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn.*$/,
            '/api/tenant/networking/virtual-machines/summary': /\/api\/tenant\/networking\/virtual-machines\/summary.*$/,
            "/api/tenant/networking/get-virtual-networks?count={0}&nextCount={1}&startAt={2}": /\/api\/tenant\/networking\/get-virtual-networks\?.*$/,
            "/api/tenant/networking/get-virtual-networks-list?startAt={0}": /\/api\/tenant\/networking\/get-virtual-networks-list\?.*$/,
            "/api/tenant/networking/get-instances?count={0}&nextCount={1}&startAt={2}": /\/api\/tenant\/networking\/get-instances\?.*$/,
            "/api/tenant/networking/get-instances-list?startAt={0}": /\/api\/tenant\/networking\/get-instances-list\?.*$/,
            '/api/tenant/networking/get-interfaces-list':  /\/api\/tenant\/networking\/get-interfaces-list\?.*$/,
            '/api/tenant/networking/get-interfaces?count={0}&nextCount={1}': /\/api\/tenant\/networking\/get-interfaces\?.*$/,
            '/api/tenants/config/get-config-details': /\/api\/tenants\/config\/get-config-details.*$/,
            '/api/tenants/config/virtual-routers-detail': /\/api\/tenants\/config\/virtual-routers-detail.*$/
        };

        return regexUrlMap [url];
    };

    this.commonGridDataGenerator = function (viewObj) {
        var viewConfig = cotu.getViewConfigObj(viewObj);
        var modelConfig = cotu.getGridDataSourceWithOnlyRemotes(viewConfig);
        var contrailListModel = new ContrailListModel(modelConfig);
        return contrailListModel;
    };

    this.deleteSizeField = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
        });
        return dataArr;
    };

    this.deleteFieldsForNetworkListViewScatterChart = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
            if (contrail.checkIfExist(data.color)) {
                delete data.color;
            }
        });
        return dataArr;
    };

    this.deleteFieldsForInstanceListViewScatterChart = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
            if (contrail.checkIfExist(data.color)) {
                delete data.color;
            }
        });
        return dataArr;
    };

    this.deleteFieldsForProjectListViewScatterChart = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
            if (contrail.checkIfExist(data.color)) {
                delete data.color;
            }
        });
        return dataArr;
    };

    this.commonDetailsDataGenerator = function (viewObj, defObj) {
        var viewConfig = cotu.getViewConfigObj(viewObj),
            modelMap = viewObj.modelMap,
            modelData = viewConfig.data,
            ajaxConfig = viewConfig.ajaxConfig,
            dataParser = viewConfig.dataParser,
            contrailViewModel;

        if (modelMap != null && modelMap[viewConfig.modelKey] != null) {
            contrailViewModel = modelMap[viewConfig.modelKey];
            defObj.resolve();
        } else {
            var modelRemoteDataConfig = {
                remote: {
                    ajaxConfig: ajaxConfig,
                    dataParser: dataParser
                }
            };
            contrailViewModel = new ContrailViewModel($.extend(true, {data: modelData}, modelRemoteDataConfig));
        }
        return contrailViewModel;
    }

    return {
        self: self,
        getRegExForUrl: getRegExForUrl,
        commonGridDataGenerator: commonGridDataGenerator,
        commonDetailsDataGenerator: commonDetailsDataGenerator,
        deleteSizeField: deleteSizeField,
        deleteFieldsForNetworkListViewScatterChart: deleteFieldsForNetworkListViewScatterChart,
        deleteFieldsForInstanceListViewScatterChart: deleteFieldsForInstanceListViewScatterChart,
        deleteFieldsForProjectListViewScatterChart: deleteFieldsForProjectListViewScatterChart
    };

});
