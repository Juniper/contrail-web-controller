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
            '/api/tenants/config/projects': /\/api\/tenants\/config\/projects.*$/,
            '/api/tenant/networking/virtual-networks/details': /\/api\/tenant\/networking\/virtual-networks\/details\?.*$/,
            '/api/tenant/networking/stats': /\/api\/tenant\/networking\/stats.*$/,
            '/api/tenant/networking/virtual-machine-interfaces/summary': /\/api\/tenant\/networking\/virtual-machine-interfaces\/summary.*$/,
            '/api/admin/reports/query' : /\/api\/admin\/reports\/query.*$/,
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
        deleteSizeField: deleteSizeField
    };

});
