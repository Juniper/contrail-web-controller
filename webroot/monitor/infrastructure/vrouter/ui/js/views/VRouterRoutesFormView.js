/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'contrail-list-model',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterRoutesFormModel'
    //Remove all query references once it is moved to core
], function (_, Knockback, ContrailView, ContrailListModel, VRouterRoutesFormModel) {

    var VRouterRoutesFormView = ContrailView.extend({
        render: function (options) {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                prefix = ctwl.VROUTER_ROUTES_PREFIX;
                routesTmpl = contrail.getTemplate4Id(
                            ctwc.TMPL_FORM_RESULT),
                vRouterRoutesFormModel = new VRouterRoutesFormModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                routesFormId = "#" + prefix + "-form";

            self.model = vRouterRoutesFormModel;
            self.$el.append(routesTmpl({prefix: prefix}));

            self.renderView4Config($(self.$el).find(routesFormId),
                    self.model,
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
                        $("#vrouter_routes_radio").on('change', function() {
                            self.renderQueryResult(viewConfig);
                        });
                        var timer = null;
                        $('#vrf_name').on('change',function() {
                            //Hack to avoid triggering change twice
                            if(timer)
                                clearTimeout(timer);
                            timer = setTimeout(function() {
                                self.renderQueryResult(viewConfig);
                            },100);
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
                prefix = ctwl.VROUTER_ROUTES_PREFIX;
                hostname = viewConfig['hostname'],
                introspectPort = viewConfig['introspectPort'];
                queryResultId = "#" + prefix + "-results",

                responseViewConfig = {
                    elementId: ctwl.VROUTER_ROUTES_RESULTS_VIEW,
                    view: "VRouterRoutesGridView",
                    viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                            route_type : self.model.route_type()
                        })
                };

            var queryParams = self.model.getQueryParams();

            function getIndexForType(selectedVRF,type) {
                var parts = selectedVRF.split('&&');
                var index = '';
                $.each(parts,function(i,d){
                    if(d.indexOf(type) != -1){
                        index = d.split('=')[1];
                    }
                });
                return index;
            }

            function constructvRouterUnicastRouteURL(initialSelection) {
                var selectedVrf = self.model.vrf_name();
                var ucIndex = getIndexForType(selectedVrf,'ucast');
                var urlParams = {
                    ip : monitorInfraUtils.getIPOrHostName(viewConfig),
                    introspectPort : introspectPort,
                    vrfindex: ucIndex
                }
                return {
                    url: monitorInfraConstants.monitorInfraUrls['VROUTER_UNICAST_ROUTES'],
                    params:urlParams
                }
            }

            function constructvRouterL2RouteURL() {
                var selectedVrf = self.model.vrf_name();
                var l2index = getIndexForType(selectedVrf,'l2');
                var urlParams = {
                    ip : monitorInfraUtils.getIPOrHostName(viewConfig),
                    introspectPort : introspectPort,
                    vrfindex: l2index
                }
                return {
                    url: monitorInfraConstants.monitorInfraUrls['VROUTER_L2_ROUTES'],
                    params:urlParams
                }
            }

            function constructvRouterUnicast6RouteURL(initialSelection) {
                var selectedVrf = self.model.vrf_name();
                var ucIndex = getIndexForType(selectedVrf,'ucast6');
                var urlParams = {
                    ip : monitorInfraUtils.getIPOrHostName(viewConfig),
                    introspectPort : introspectPort,
                    vrfindex: ucIndex
                }
                return {
                    url: monitorInfraConstants.monitorInfraUrls['VROUTER_UCAST6_ROUTES'],
                    params:urlParams
                }
            }
            var constructURLMap = {
                l2: constructvRouterL2RouteURL,
                ucast: constructvRouterUnicastRouteURL,
                ucast6: constructvRouterUnicast6RouteURL
            };
            var urlObj  = constructURLMap[self.model.route_type()](viewConfig);
            var paginationInfo;
            function getPaginationInfo() {
                return paginationInfo;
            }
            var remoteConfig = {
                    url: urlObj['url'] + '?' + $.param(urlObj['params']),
                    type: 'GET'
                };
            var routeParseMap = {
                'ucast' : monitorInfraParsers.parseVRouterUnicastRoutesData,
                'ucast6' : monitorInfraParsers.parseVRouterIPv6RoutesData,
                'l2'    : monitorInfraParsers.parseVRouterL2RoutesData
            };

            var listModelConfig = {
                    remote : {
                        ajaxConfig : remoteConfig,
                        dataParser :  function(response) {
                            var routeType = self.model.route_type();
                            var retData = routeParseMap[routeType](response);
                            paginationInfo = retData['paginationInfo'];
                            monitorInfraUtils.updateGridTitleWithPagingInfo(
                                $('#' + ctwl.VROUTER_ROUTES_GRID_ID),paginationInfo);
                            return retData['data'];
                        }
                    },
                    cacheConfig : {
                       // ucid: ctwc.CACHE_CONFIGNODE
                    }
                };
            //Grid model
            var model = new ContrailListModel(listModelConfig);

            self.renderView4Config($(self.$el).find(queryResultId),
                    model, responseViewConfig,null,null,null,function() {
                        monitorInfraUtils.bindGridPrevNextListeners({
                            gridSel: $('#' + ctwl.VROUTER_ROUTES_GRID_ID),
                            model: self.model,
                            obj:viewConfig,
                            parseFn: function(data) {
                                var routeType = self.model.route_type();
                                var retData = routeParseMap[routeType](data);
                                paginationInfo = retData['paginationInfo'];
                                monitorInfraUtils.updateGridTitleWithPagingInfo(
                                    $('#' + ctwl.VROUTER_ROUTES_GRID_ID),paginationInfo);
                                return retData['data'];
                            },
                            getUrlFn: function() {
                                return constructURLMap[self.model.route_type()](viewConfig)
                            },
                            paginationInfoFn: getPaginationInfo
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
                                    elementId: 'vrf_name',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label: 'VRF',
                                        path: 'vrf_name',
                                        dataBindValue:'vrf_name',
                                        elementConfig: {
                                            defaultValueId: 0,
                                            dropdownAutoWidth : false,
                                            dataSource: {
                                                type:'remote',
                                                url: contrail.format(
                                                    monitorInfraConstants.monitorInfraUrls['VROUTER_VRF_LIST'],
                                                    monitorInfraUtils.getIPOrHostName(viewConfig),viewConfig['introspectPort']),
                                                async: true,
                                                dataType: 'xml',
                                               // dataTextField:'text',
                                               // dataValueField:'value',
                                                parse: function(response) {
                                                    if(response != null) {
                                                        var ret = [];
                                                        var vrfs = response.getElementsByTagName('VrfSandeshData');
                                                        $.each(vrfs,function(idx,vrfXmlObj){
                                                            var name = $(vrfXmlObj.getElementsByTagName('name')[0]).text();
                                                            var ucIndex = $(vrfXmlObj.getElementsByTagName('ucindex')[0]).text();
                                                            var l2Index = $(vrfXmlObj.getElementsByTagName('l2index')[0]).text();
                                                            var uc6Index = $(vrfXmlObj.getElementsByTagName('uc6index')[0]).text();
                                                            var value = "ucast=" + ucIndex + "&&l2=" + l2Index + "&&ucast6=" + uc6Index;
                                                            ret.push({text:name,id:value});
                                                        });
                                                        self.renderQueryResult(viewConfig);
                                                        return ret;
                                                    }
                                                }
                                            }
                                        },
                                        class: "col-xs-6"
                                    }
                                },{
                                    elementId: 'vrouter_routes_radio',
                                    view: "FormRadioButtonView",
                                    viewConfig: {
                                        class: 'col-xs-6',
                                        path:'route_type',
                                        dataBindValue:'route_type',
                                        elementConfig: {
                                            dataObj: [
                                            {'label': 'Unicast',
                                             'value': 'ucast'},
                                            {'label': 'L2',
                                             'value': 'l2'},
                                            {'label': 'Unicast 6',
                                             'value': 'ucast6'}
                                        ],
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                }],
                        }
                    ]
                }
            };
        }
    });
    return VRouterRoutesFormView;
});
