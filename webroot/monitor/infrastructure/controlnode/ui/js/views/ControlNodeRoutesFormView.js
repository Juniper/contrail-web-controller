/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'contrail-list-model',
    'monitor/infrastructure/controlnode/ui/js/models/ControlNodeRoutesModel'
    //Remove all query references once it is moved to core
], function (_, Knockback, ContrailView, ContrailListModel, ControlNodeRoutesModel) {
    var routingInstancesDropdownList = [{text:'All',value:'All'}],
    backwardRouteStack = [], forwardRouteStack = [];
    var ControlNodeRoutesFormView = ContrailView.extend({
        render: function (options) {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                prefix = 'controlroutes',
                routesTmpl = contrail.getTemplate4Id(
                            ctwc.TMPL_FORM_RESULT),
                controlNodeRoutesModel = new ControlNodeRoutesModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                routesFormId = "#" + prefix + "-form";
            monitorInfraUtils.appendHostNameInWidgetTitleForUnderlayPage(viewConfig);
            self.model = controlNodeRoutesModel;
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
                        $("#run_query").on('click', function() {
                            self.renderQueryResult(viewConfig);
                        });
                    }
            );
            var transportCfg = {
                    url: contrail.format(monitorInfraConstants.monitorInfraUrls['CONTROLNODE_ROUTE_INST_LIST'], hostname, 40)
                };
            var routingInstanceDS = new ContrailDataView();
            getOutputByPagination(routingInstanceDS,{transportCfg:transportCfg,parseFn:parseRoutingInstanceResp});
            if (widgetConfig !== null) {
                self.renderView4Config($(self.$el).find(routesFormId),
                        self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function(viewConfig) {
            var self = this,
                prefix = 'controlroutes',
                hostname = viewConfig['hostname'],
                queryResultId = "#" + prefix + "-results",
                responseViewConfig = {
                    elementId: ctwl.CONTROLNODE_ROUTES_RESULT_VIEW,
                    view: "ControlRoutesResultView",
                    viewPathPrefix: ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                };

            //Making the Routes call here as the result also needs to be update
            //prefix value in this form
            var routesQueryString = self.model.getControlRoutesQueryString()
            var limit = parseInt(routesQueryString.limit) + 1;
            routesQueryString.limit = limit.toString();
            var routesRemoteConfig = {
                    url: monitorInfraConstants.
                        monitorInfraUrls['CONTROLNODE_ROUTES'] +
                        '?ip=' + hostname +
                        '&' + $.param(routesQueryString),
                    type: 'GET'
                };
            var listModelConfig = {
                    remote : {
                        ajaxConfig : routesRemoteConfig,
                        dataParser : function (response) {
                            var selValues = {};
                            backwardRoutes(response);
                            forwardRoutes(response);
                            var parsedData = monitorInfraParsers.
                                        parseRoutes(response,routesQueryString);
                            //TODO need to update the prefix autocomplete
                            var prefixArray = [];
                            $.each(parsedData,function(i,d){
                                prefixArray.push(d.dispPrefix);
                            });
                            $('#prefix').find('input').autocomplete( "option", "source" ,prefixArray);
                            parsedData.pop();
                            return parsedData;

                        }
                    },
                    cacheConfig : {
                       // ucid: ctwc.CACHE_CONFIGNODE
                    }
                };
            var backwardRoutes = function(model){
                var routingTable, showRoute, routingInstance, prefix,
                showRouteTable = model[0].ShowRouteResp.tables.list.ShowRouteTable;
                if(showRouteTable.constructor().length === undefined){
                    routingTable = showRouteTable.routing_table_name;
                    routingInstance =  showRouteTable.routing_instance;
                    showRoute = showRouteTable.routes.list.ShowRoute;
                }else{
                    routingTable = showRouteTable[0].routing_table_name;
                    routingInstance =  showRouteTable[0].routing_instance;
                    showRoute = showRouteTable[0].routes.list.ShowRoute
                }
                if(showRoute.constructor().length === undefined){
                    prefix = showRoute.prefix;
                }else{
                    prefix = showRoute[0].prefix;
                }
                backwardRouteStack.push({
                    limit: routesQueryString.limit,
                    startRoutingTable: routingTable,
                    startRoutingInstance: routingInstance,
                    startPrefix: prefix
                });
            };
            var forwardRoutes = function(model){
                var routingTable, showRoute, routingInstance, prefix,
                showRouteTable = model[0].ShowRouteResp.tables.list.ShowRouteTable;
                if(showRouteTable.constructor().length === undefined){
                    routingTable = showRouteTable.routing_table_name;
                    routingInstance =  showRouteTable.routing_instance;
                    showRoute = showRouteTable.routes.list.ShowRoute;
                }else{
                    routingTable = showRouteTable[showRouteTable.length - 1].routing_table_name;
                    routingInstance =  showRouteTable[showRouteTable.length - 1].routing_instance;
                    showRoute = showRouteTable[showRouteTable.length - 1].routes.list.ShowRoute;
                }
                if(showRoute.constructor().length === undefined){
                    prefix = showRoute.prefix;
                }else{
                    prefix = showRoute[showRoute.length - 1].prefix;
                }
                forwardRouteStack.push({
                    limit: routesQueryString.limit,
                    startRoutingTable: routingTable,
                    startRoutingInstance: routingInstance,
                    startPrefix: prefix
                });
            };
            var model = new ContrailListModel(listModelConfig);
            self.renderView4Config($(self.$el).find(queryResultId),
                    model, responseViewConfig,null,null,null,function() {
                        monitorInfraUtils.bindPaginationListeners({
                            gridSel: $('#' + ctwl.CONTROLNODE_ROUTES_RESULTS),
                            model: self.model,
                            obj:viewConfig,
                            parseFn: function(response) {
                                backwardRoutes(response);
                                forwardRoutes(response);
                                var parsedData = monitorInfraParsers.
                                parseRoutes(response, routesQueryString);
                                //check for last data in the grid
                                if(parsedData.length < routesQueryString.limit){
                                    if((parsedData.length + 1) != routesQueryString.limit){
                                        forwardRouteStack.pop();
                                    }
                                }
                                if(parsedData.length >= routesQueryString.limit){
                                    parsedData.pop();
                                }
                                return parsedData;
                            },
                            getUrlFn: function(step) {
                                var urlparm;
                                if(step === 'forward' && forwardRouteStack.length !== 0){
                                    urlParm = forwardRouteStack.pop();
                                    return monitorInfraConstants.
                                           monitorInfraUrls['CONTROLNODE_ROUTES'] +
                                           '?ip=' + hostname +
                                           '&' + $.param(urlParm);
                                }
                                if(step === 'backward' && backwardRouteStack.length !== 1){
                                    backwardRouteStack.splice(backwardRouteStack.length - 1, 1);
                                    urlParm = backwardRouteStack.pop();
                                    forwardRouteStack.pop();
                                    return monitorInfraConstants.
                                    monitorInfraUrls['CONTROLNODE_ROUTES'] +
                                    '?ip=' + hostname +
                                    '&' + $.param(urlParm);
                                 }
                             }
                        });
                    });
        },

        getViewConfig: function (options,viewConfig) {
            var self = this;
            var hostname = viewConfig['hostname'];
            var addressFamilyList = ["All","enet","ermvpn","evpn",
                                     "inet","inetvpn","inet6","l3vpn","rtarget"];
            var routeLimits = [10, 50, 100, 200];
            $.each(routeLimits,function(idx,obj){
                routeLimits[idx] = {'value':obj,'text':obj+' Routes'};
             });
            routeLimits = [{'text':'All','value':'All'}].concat(routeLimits);
            var protocols = ['All','XMPP','BGP','ServiceChain','Static'];
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'routing_instance',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'routing_instance',
                                        dataBindValue: 'routing_instance',
                                        class: "span6",
                                        elementConfig: {
                                            defaultValueId: 0,
                                            dropdownAutoWidth : false,
                                            dataTextField:'text',
                                            dataValueField:'value',
                                            data: routingInstancesDropdownList
                                        }
                                    }
                                },
                                {
                                    elementId: 'prefix',
                                    view: "FormAutoCompleteTextBoxView",
                                    viewConfig: {
                                        path: 'prefix',
                                        placeHolder:'Prefix',
                                        dataBindValue: 'prefix',
                                        class: "span2",
                                        elementConfig: {
                                            source : []
                                        }
                                    }
                                },
                                {
                                    elementId: 'routes_limit',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'routes_limit',
                                        label: 'Limit',
                                        dataBindValue: 'routes_limit',
                                        class: "span2",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            data: routeLimits
                                        }
                                    }
                                }
                            ]
                        },
                        /*{
                            columns: [
                                {
                                    elementId: 'peer_source',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'peer_source',
                                        dataBindValue: 'peer_source',
                                        class: "span2",
                                        elementConfig: {
                                            dataSource: {
                                                type: 'remote',
                                                 url: contrail.format(
                                                         monitorInfraConstants.
                                                          monitorInfraUrls['CONTROLNODE_PEER_LIST'],
                                                         hostname),
                                                 parse:function(response){
                                                   var ret = ['All']
                                                   if(!(response instanceof Array)){
                                                     response = [response];
                                                   }
                                                   ret = ['All'].concat(response);
                                                   return ret;
                                                 }
                                             }
                                        }
                                    }
                                },
                                {
                                    elementId: 'address_family',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'address_family',
                                        dataBindValue: 'address_family',
                                        class: "span2",
                                        elementConfig: {
                                            data: addressFamilyList
                                        }
                                    }
                                },
                                {
                                    elementId: 'protocol',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'protocol',
                                        dataBindValue: 'protocol',
                                        class: "span2",
                                        elementConfig: {
                                            data: protocols
                                        }
                                    }
                                }
                            ]
                        },*/
                        {
                            columns: [
                                {
                                    elementId: 'run_query',
                                    view: "FormButtonView",
                                    viewConfig: {
                                        label: "Search",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'reset_query',
                                    view: "FormButtonView",
                                    viewConfig: {
                                        label: "Reset",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            onClick: "reset"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });
    function parseRoutingInstanceResp (response){
        var ret = [];
        if(response != null && response['ShowRoutingInstanceSummaryResp'] != null &&
                response['ShowRoutingInstanceSummaryResp']['instances'] != null &&
                response['ShowRoutingInstanceSummaryResp']['instances']['list'] != null &&
                response['ShowRoutingInstanceSummaryResp']['instances']['list']['ShowRoutingInstance'] != null){
            var routingInstances = response['ShowRoutingInstanceSummaryResp']['instances']['list']['ShowRoutingInstance'];
            var routingInstancesLength = routingInstances.length;
            for(var i = 0; i < routingInstancesLength; i++) {
                routingInstancesDropdownList.push({text:routingInstances[i]['name'],value:routingInstances[i]['name']});
            }

        }
        var ddRoutingInstance = $( "#routing_instance_dropdown" ).data('contrailDropdown');
        if(ddRoutingInstance != null) {
            ddRoutingInstance.setData(routingInstancesDropdownList);
        }

        return ret;

    }
    return ControlNodeRoutesFormView;
});
