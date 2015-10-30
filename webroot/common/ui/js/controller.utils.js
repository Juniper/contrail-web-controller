/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-list-model'
], function (_, ContrailListModel) {

    var CTUtils = function () {
        var self = this;
        var utilVariable = [];
        self.getInstanceDetailsTemplateConfig = function () {
            return {

                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        class: 'span6',
                                        rows: [
                                            {
                                                title: ctwl.TITLE_INSTANCE_DETAILS,
                                                templateGenerator: 'BlockListTemplateGenerator',
                                                templateGeneratorConfig: [
                                                    {
                                                        key: 'vm_name',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.uuid',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.vrouter',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.interface_list',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'length'
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        class: 'span6',
                                        rows: [
                                            {
                                                title: ctwl.TITLE_CPU_MEMORY_INFO,
                                                templateGenerator: 'BlockListTemplateGenerator',
                                                templateGeneratorConfig: [
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.cpu_info.cpu_one_min_avg',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'kilo-byte'
                                                        }
                                                    },
                                                    {
                                                        key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'kilo-byte'
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            
            }
        }

        //If there is discrepancy in data sent from multiple sources
        self.getDataBasedOnSource = function (data) {
            if ((data != null) && (data[0] instanceof Array)) {
                var idx = 0;
                //Loop through and pick the index for vrouteragent
                for (var i = 0; i < data.length; i++) {
                    if (data[i][1] != null) {
                        if (data[i][1].match('Compute:contrail-vrouter-agent')) {
                            idx = i;
                            break;
                        }
                    }
                }
                data = data[idx][0];
            }
            return data;
        };

        // This function formats the VN name by discarding the domain name and appending the project name in the braces
        // input: either array of networks or single network like [default-domain:demo:ipv6test2], default-domain:demo:ipv6test2
        // output:[ipv6test2 (demo)],ipv6test2 (demo).

        self.formatVNName = function (vnName) {
            var formattedValue;
            if (!$.isArray(vnName))
                vnName = [vnName];
            formattedValue = $.map(vnName, function (value, idx) {
                var fqNameArr = value.split(':');
                if (fqNameArr.length == 3)
                    return fqNameArr[2] + ' (' + fqNameArr[1] + ')';
                else
                    return value;
            });
            return formattedValue;
        };

        this.isServiceVN = function (vnFQN) {
            var fqnArray = vnFQN.split(":");

            if(ctwc.SERVICE_VN_EXCLUDE_LIST.indexOf(fqnArray[2]) != -1) {
                return true;
            }

            return false;
        };

        this.getDomainListModelConfig = function() {
            return {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_ALL_DOMAINS
                    },
                    dataParser: function(response) {
                        return  $.map(response.domains, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[0],
                                value: n.uuid
                            };
                        });
                    },
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                },
                cacheConfig : {
                    ucid: ctwc.UCID_BC_ALL_DOMAINS,
                    loadOnTimeout: false,
                    cacheTimeout: cowc.DOMAIN_CACHE_UPDATE_INTERVAL
                }
            }
        };

        this.getAllDomains = function() {
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_ALL_DOMAINS
                    },
                    dataParser: function(response) {
                        return  $.map(response.domains, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[0],
                                value: n.uuid
                            };
                        });
                    },
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                },
                cacheConfig : {
                    ucid: ctwc.UCID_BC_ALL_DOMAINS,
                    loadOnTimeout: false,
                    cacheTimeout: cowc.DOMAIN_CACHE_UPDATE_INTERVAL
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);

            return contrailListModel;
        };

        this.getProjectListModelConfig = function(domain) {
            return {
                remote: {
                    ajaxConfig: {
                        url: ctwc.getProjectsURL(domain)
                    },
                    dataParser: function(response) {
                        return  $.map(response.projects, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[1],
                                value: n.uuid
                            };
                        });
                    },
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                },
                cacheConfig : {
                    ucid: ctwc.get(ctwc.UCID_BC_DOMAIN_ALL_PROJECTS, domain),
                    loadOnTimeout: false,
                    cacheTimeout: cowc.PROJECT_CACHE_UPDATE_INTERVAL
                }
            };
        };

        this.getDNSListModelConfig = function(dns) {
            return {
                remote: {
                    ajaxConfig: {
                        url: '/api/tenants/config/list-virtual-DNSs/' + dns
                    },
                    dataParser: function(response) {
                        return  $.map(response, function (n, i) {
                            return {
                                fq_name: n.to.join(':'),
                                name: n.to[1],
                                value: n.uuid
                            };
                        });
                    },
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                }/*,
                cacheConfig : {
                    ucid: ctwc.get(ctwc.UCID_BC_DOMAIN_ALL_DNS, dns),
                    loadOnTimeout: false,
                    cacheTimeout: cowc.PROJECT_CACHE_UPDATE_INTERVAL
                }*/
            };
        };
        this.getProjects4Domain = function(domain) {
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.getProjectsURL(domain)
                    },
                    dataParser: function(response) {
                        return  $.map(response.projects, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[1],
                                value: n.uuid
                            };
                        });
                    },
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                },
                cacheConfig : {
                    ucid: ctwc.get(ctwc.UCID_BC_DOMAIN_ALL_PROJECTS, domain),
                    loadOnTimeout: false,
                    cacheTimeout: cowc.PROJECT_CACHE_UPDATE_INTERVAL
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);

            return contrailListModel;
        };

        this.getNetworkListModelConfig = function (projectFQN) {
            return {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_PROJECT_ALL_NETWORKS, projectFQN)
                    },
                    dataParser: ctwp.parseNetwork4Breadcrumb,
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                },
                cacheConfig : {
                    ucid: ctwc.get(ctwc.UCID_BC_PROJECT_ALL_NETWORKS, projectFQN),
                    loadOnTimeout: false,
                    cacheTimeout: cowc.NETWORK_CACHE_UPDATE_INTERVAL
                }
            };
        };

        this.getNetworks4Project = function(projectFQN) {
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_PROJECT_ALL_NETWORKS, projectFQN)
                    },
                    dataParser: ctwp.parseNetwork4Breadcrumb,
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                },
                cacheConfig : {
                    ucid: ctwc.get(ctwc.UCID_BC_PROJECT_ALL_NETWORKS, projectFQN),
                    loadOnTimeout: false,
                    cacheTimeout: cowc.NETWORK_CACHE_UPDATE_INTERVAL
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);

            return contrailListModel;
        };

        this.loadAlertsPopup = function(cfgObj) {
            var prefixId = 'dashboard-alerts';
            var cfgObj = ifNull(cfgObj,{});
            var modalTemplate =
                contrail.getTemplate4Id('core-modal-template');
            var modalId = 'dashboard-alerts-modal';
            var modalLayout = modalTemplate({prefixId: prefixId, modalId: modalId});
            var formId = prefixId + '_modal';
            cowu.createModal({
                'modalId': modalId,
                'className': 'modal-840',
                'title': 'Alerts',
                'body': modalLayout,
                'onCancel': function() {
                    $("#" + modalId).modal('hide');
                }
            });
            if(cfgObj.model == null) {
                require(['dashboard-alert-list-model','monitor-infra-parsers',
                    'monitor-infra-constants','monitor-infra-utils'],
                    function(AlertListModel,MonitorInfraParsers,MonitorInfraConstants,
                        MonitorInfraUtils) {
                        if(typeof(monitorInfraConstants) == 'undefined') {
                            monitorInfraConstants = new MonitorInfraConstants();
                        }
                        if(typeof(monitorInfraUtils) == 'undefined') {
                            monitorInfraUtils = new MonitorInfraUtils();
                        }
                        if(typeof(monitorInfraParsers) == 'undefined') {
                            monitorInfraParsers = new MonitorInfraParsers();
                        }
                        cfgObj.model = new AlertListModel();
                        require(['alert-grid-view'], function(AlertGridView) {
                            var alertGridView = new AlertGridView({
                                el:$("#" + modalId).find('#' + formId),
                                model:cfgObj.model
                            });
                            alertGridView.render();
                        });
                    });
            } else {
                require(['alert-grid-view'], function(AlertGridView) {
                    var alertGridView = new AlertGridView({
                        el:$("#" + modalId).find('#' + formId),
                        model:cfgObj.model
                    });
                    alertGridView.render();
                });
            }
        };

        this.deleteCGridData = function(data) {
            if ('cgrid' in data) {
                delete data['cgrid'];
            }
            if ('errors' in data) {
                delete data['errors'];
            }
            if ('locks' in data) {
                delete data['locks'];
            }
            if ('elementConfigMap' in data) {
                delete data['elementConfigMap'];
            }
            return data;
        };

        this.renderView = function (renderConfig, renderCallback) {
            var parentElement = renderConfig['parentElement'],
                viewName = renderConfig['viewName'],
                viewPathPrefix = contrail.checkIfExist(renderConfig['viewPathPrefix']) ? renderConfig['viewPathPrefix'] : '/',
                model = renderConfig['model'],
                viewAttributes = renderConfig['viewAttributes'],
                modelMap = renderConfig['modelMap'],
                rootView = renderConfig['rootView'],
                viewPath =  viewPathPrefix + viewName,
                onAllViewsRenderCompleteCB = renderConfig['onAllViewsRenderCompleteCB'],
                onAllRenderCompleteCB = renderConfig['onAllRenderCompleteCB'],
                lazyRenderingComplete  = renderConfig['lazyRenderingComplete'],
                elementView;

            require([viewPath], function(ElementView) {
                elementView = new ElementView({el: parentElement, model: model, attributes: viewAttributes, rootView: rootView, onAllViewsRenderCompleteCB: onAllViewsRenderCompleteCB, onAllRenderCompleteCB: onAllRenderCompleteCB});
                elementView.viewName = viewName;
                elementView.modelMap = modelMap;
                elementView.beginMyViewRendering();
                elementView.render();
                if(contrail.checkIfFunction(renderCallback)) {
                    renderCallback(elementView);
                }

                if(lazyRenderingComplete == null || !lazyRenderingComplete) {
                    elementView.endMyViewRendering();
                }
            });
        };

        this.getDetailTemplateConfigToDisplayRawJSON = function (){
            return {
                template:
                    cowu.generateDetailTemplateHTML(this.getDetailsTemplateWithRawJSON(),
                                                    cowc.APP_CONTRAIL_CONTROLLER)
            }
        };

        this.getDetailsTemplateWithRawJSON = function () {
            return{
                templateGenerator: 'ColumnSectionTemplateGenerator',
                advancedViewOptions :false,
                 templateGeneratorConfig: {
                     columns: [
                         {
                             rows: [
                                 {
                                     templateGenerator: 'BlockAdvancedOnlyTemplateGenerator',
                                     templateGeneratorData : 'raw_json'
                                 }
                             ]
                         }
                     ]
                 }
            }
        };
        this.setGlobalVariable = function(key, value) {
            utilVariable[key] = value;
        };
        this.getGlobalVariable = function(key) {
            return utilVariable[key];
        };
        this.getAllGlobalVariable = function() {
            return utilVariable;
        };
        // Accept fqname as array and
        // currentDomainProject as string format domain:project
        // if currentDomainProject is empty it will try taking utilVariable
        // Output will be in the format "element(domain:project)"
        this.formatCurrentFQName = function(fqname, currentDomainProject){
            var domain = "", project = "";
            if(currentDomainProject != null && currentDomainProject != ""){
                var domainProjectArr = currentDomainProject.split(":");
                if(domainProjectArr == 2) {
                    domain = domainProjectArr[0];
                    project = domainProjectArr[1];
                }
            } else if(utilVariable["domain"] != null &&
                      utilVariable["project"] != null){
                domain = utilVariable["domain"];
                project = utilVariable["project"];
            } else {
                return false;
            }
            if(fqname.length >= 3) {
                if(fqname[0] == domain.name && fqname[1] == project.name) {
                    return fqname[fqname.length-1];
                } else {
                    var element = fqname[fqname.length-1];
                    var parent = fqname.splice(0,fqname.length-1);
                    return element + " (" + parent.join(":") + ")";
                }
            }
        }
    };
    return CTUtils;
});
