/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'contrail-list-model',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterFlowsFormModel'
    //Remove all query references once it is moved to core
], function (_, Knockback, ContrailView, ContrailListModel, VRouterFlowsFormModel) {

    var VRouterFlowsFormView = ContrailView.extend({
        lastFlowReq : false,
        render: function (options) {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                prefix = ctwl.VROUTER_FLOWS_PREFIX;
                routesTmpl = contrail.getTemplate4Id(
                            ctwc.TMPL_FORM_RESULT),
                vRouterFlowsFormModel = new VRouterFlowsFormModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                routesFormId = "#" + prefix + "-form";

            self.model = vRouterFlowsFormModel;
            self.$el.append(routesTmpl({prefix: prefix}));

            self.renderView4Config($(self.$el).find(routesFormId),
                    this.model,
                    self.getViewConfig(options,viewConfig),
                    null,
                    null,
                    null,
                    function () {
                        self.model.showErrorAttr(prefix + '-container',
                                false);
                        Knockback.applyBindings(self.model,
                                document.getElementById(prefix + '-container'));
                        kbValidation.bind(self);
                        self.renderQueryResult(viewConfig);
                        $("#vrouter_flows_query").on('click', function() {
                            self.renderQueryResult(viewConfig);
                        });
                    }
            );

            if (widgetConfig !== null) {
                self.renderView4Config($(self.$el).find(routesFormId),
                        self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function(viewConfig) {
            var self = this,
                prefix = ctwl.VROUTER_FLOWS_PREFIX;
                hostname = viewConfig['hostname'],
                introspectPort = viewConfig['introspectPort'];
                queryResultId = "#" + prefix + "-results",
                flowKeyStack = [], aclIterKeyStack = [],
                isAclPrevFirstTimeClicked = true, isAllPrevFirstTimeClicked = true,
                responseViewConfig = {
                    elementId: ctwl.VROUTER_FLOWS_RESULTS_VIEW,
                    view: "VRouterFlowsGridView",
                    viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                };

            var queryParams = self.model.getQueryParams();
            function constructvRouterFlowsUrl(viewConfig) {
                var url = monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'];
                var urlParams = $.extend({
                        ip: monitorInfraUtils.getIPOrHostName(viewConfig),
                        introspectPort: introspectPort
                    },queryParams);
                return {
                    url: url,
                    params:urlParams
                }
            }
            var urlObj  = constructvRouterFlowsUrl(viewConfig);
            // var paginationInfo;
            // function getPaginationInfo() {
            //     return paginationInfo;
            // }
            var remoteConfig = {
                    url: urlObj['url'] + '?' + $.param(urlObj['params']),
                    type: 'GET'
                };
            var listModelConfig = {
                    remote : {
                        ajaxConfig : remoteConfig,
                        dataParser :  function(response) {
                            var retData = monitorInfraParsers.parseVRouterFlowsData(response);
                            return retData['data'];
                        }
                    },
                    cacheConfig : {
                       // ucid: ctwc.CACHE_CONFIGNODE
                    }
                };
            var model = new ContrailListModel(listModelConfig);
            model.onDataUpdate.subscribe(function() {

            });

            function onSelectAcl(acluuid) {
                var flowGrid = $('#' + ctwl.VROUTER_FLOWS_GRID_ID).data('contrailGrid');
                var newAjaxConfig = "";
                self.lastFlowReq = false;
                flowKeyStack = [];
                aclIterKeyStack = [];
                if (acluuid != 'All') {
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                                    '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig)
                                    + '&aclUUID=' + acluuid + '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                } else {
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                                '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig) +
                                '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                }
                // flowGrid.setRemoteAjaxConfig(newAjaxConfig);
                // reloadGrid(flowGrid);
                $.ajax(newAjaxConfig).done(function(response) {
                    var retData = monitorInfraParsers.parseVRouterFlowsData(response,acluuid);
                    self.lastFlowReq = retData.lastFlowReq;
                    if(flowGrid._dataView != null)
                        flowGrid._dataView.setData(retData['data']);
                        flowGrid.refreshView();
                });
            }

            function onNextClick() {
                var flowGrid = $('#' + ctwl.VROUTER_FLOWS_GRID_ID).data('contrailGrid');
                var acluuid = self.model.acl_uuid();
                var newAjaxConfig = "";
                if(self.lastFlowReq) {
                    return;
                }
                isAllPrevFirstTimeClicked = true;
                isAclPrevFirstTimeClicked = true;
                if(acluuid == 'All' && flowKeyStack.length > 0 &&
                    flowKeyStack[flowKeyStack.length - 1] != null){
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                                    '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig)
                                    + '&flowKey=' + flowKeyStack[flowKeyStack.length - 1] +
                                    '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                }
                else if (acluuid != 'All' && aclIterKeyStack.length > 0 &&
                    aclIterKeyStack[aclIterKeyStack.length -1] != null){
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                                '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig)
                                + '&iterKey=' + aclIterKeyStack[aclIterKeyStack.length -1] +
                                '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                } else if (acluuid == "All"){
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                            '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig) +
                            '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                }
                // flowGrid.setRemoteAjaxConfig(newAjaxConfig);
                // reloadGrid(flowGrid);
                $.ajax(newAjaxConfig).done(function(response) {
                    var retData = monitorInfraParsers.parseVRouterFlowsData(response,acluuid);
                    self.lastFlowReq = retData['lastFlowReq'];
                    if(flowGrid._dataView != null)
                        flowGrid._dataView.setData(retData['data']);
                        flowGrid.refreshView();
                });
            }

            function onPrevClick() {
                var flowGrid = $('#' + ctwl.VROUTER_FLOWS_GRID_ID).data('contrailGrid');
                var acluuid = self.model.acl_uuid();
                var newAjaxConfig = "";
                if(isAllPrevFirstTimeClicked) {
                    //we need to do this because when we click the prev for the
                    //first time the stack would contain the next uuid as well.
                    //We need to pop out the uuids 3 times to get the prev uuid.
                    //flowKeyStack.pop();
                    isAllPrevFirstTimeClicked = false;
                }
                flowKeyStack.pop();//need to pop twice to get the prev last flowkey
                if(isAclPrevFirstTimeClicked) {
                    aclIterKeyStack.pop();
                    isAclPrevFirstTimeClicked = false;
                }
                aclIterKeyStack.pop();
                if(acluuid == 'All' && flowKeyStack.length > 0) {
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                                '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig)
                                + '&flowKey=' + flowKeyStack.pop()
                                + '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                } else if (acluuid == 'All' && flowKeyStack.length < 1){
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                            '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig)
                            + '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                } else if(acluuid != 'All' && aclIterKeyStack.length > 0) {
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                            '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig)
                            + '&iterKey=' + aclIterKeyStack.pop()
                            + '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                } else if(acluuid != 'All' && aclIterKeyStack.length < 1) {
                    newAjaxConfig = {
                            url: monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'] +
                                '?ip=' + monitorInfraUtils.getIPOrHostName(viewConfig)
                                + '&aclUUID=' + acluuid
                                + '&introspectPort=' + viewConfig['introspectPort'],
                            type:'Get'
                        };
                }
                // flowGrid.setRemoteAjaxConfig(newAjaxConfig);
                // reloadGrid(flowGrid);
                $.ajax(newAjaxConfig).done(function(response) {
                    var retData = monitorInfraParsers.parseVRouterFlowsData(response,acluuid);
                    self.lastFlowReq = retData.lastFlowReq;
                    if(flowGrid._dataView != null)
                        flowGrid._dataView.setData(retData['data'],acluuid);
                        flowGrid.refreshView();
                });
            }

            self.renderView4Config($(self.$el).find(queryResultId),
                    model, responseViewConfig,null,null,null,function() {
                        var gridSel = $('#' + ctwl.VROUTER_FLOWS_GRID_ID);
                        self.model.__kb.view_model.model().on('change:acl_uuid',
                            function(model,text) {
                                // onSelectAcl(model.attributes.acl_uuid);
                                onSelectAcl(model.get('acl_uuid'));
                            });
                        gridSel.find('i.fa-forward').parent().click(function() {
                            onNextClick();
                        });
                        gridSel.find('i.fa-backward').parent().click(function() {
                            onPrevClick();
                        });
                    });
        },

        getViewConfig: function (options,viewConfig) {
            var self = this;
            var hostname = viewConfig['hostname'];
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'acl_uuid',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label: 'ACL UUID',
                                        path: 'acl_uuid',
                                        dataBindValue: 'acl_uuid',
                                        class: "col-xs-6",
                                        elementConfig: {
                                            defaultValueId: 0,
                                            dataSource: {
                                                type: 'remote',
                                                url: monitorInfraConstants.monitorInfraUrls['VROUTER_ACL']
                                                    + '?' + $.param({
                                                        ip: monitorInfraUtils.getIPOrHostName(viewConfig),
                                                        introspectPort: viewConfig['introspectPort']
                                                    }),
                                                parse:function(response){
                                                    var retArr = [{text:'All',value:'All'}];
                                                    response = jsonPath(response,'$..AclSandeshData')[0];
                                                    var uuidArr = [];
                                                    if(response != null){
                                                        if(!(response instanceof Array)){
                                                            response = [response];
                                                        }
                                                        for (var i = 0; i < response.length; i++) {
                                                            uuidArr.push(response[i].uuid);
                                                        }
                                                    }
                                                    $.each(uuidArr, function (key, value) {
                                                        retArr.push({text:value, value:value});
                                                    });
                                                    return retArr;
                                                }
                                            },
                                            dataValueField:'value',
                                            dataTextField:'text',
                                        }
                                    }
                                }],
                        }]
                }
            };
        }
    });

    return VRouterFlowsFormView;
});
