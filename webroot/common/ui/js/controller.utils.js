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

        this.getGlobalSysConfigListModelConfig = function() {
            return {
                remote: {
                    ajaxConfig: {
                        url: '/api/tenants/config/list-global-system-config'
                    },
                    dataParser: function(response) {
                        return  $.map(response['global-system-configs'], function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[0],
                                value: n.uuid
                            };
                        });
                    },
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate =
                            contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig =
                                $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE,
                                         {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                },
                cacheConfig : {
                    ucid: ctwc.UCID_BC_ALL_GLOBAL_SYS_CONFIGS,
                    loadOnTimeout: false,
                    cacheTimeout: cowc.DOMAIN_CACHE_UPDATE_INTERVAL
                }
            }
        };

        this.getSASetListModelConfig = function() {
            return {
                remote: {
                    ajaxConfig: {
                        url: '/api/tenants/config/service-appliance-sets'
                    },
                    dataParser: function(response) {
                        return  $.map(response, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[1],
                                value: n.uuid
                            };
                        });
                    },
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate =
                            contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig =
                                $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE,
                                         {errorMessage: xhr.responseText});

                        $(contentContainer).html(dataErrorTemplate(dataErrorConfig));
                    }
                }/*,
                cacheConfig : {
                    ucid: ctwc.UCID_BC_ALL_SA_SETS,
                    loadOnTimeout: false,
                    cacheTimeout: cowc.DOMAIN_CACHE_UPDATE_INTERVAL
                }
                */
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

        this.getProjectListModelConfig = function(domainObj, dropdownOptions) {
            var modelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.getProjectsURL(domainObj,
                                                 dropdownOptions)
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
            };
            if ((null == dropdownOptions) ||
                (null == dropdownOptions['config']) ||
                (false == dropdownOptions['config'])) {
                modelConfig.cacheConfig = {
                    ucid: ctwc.get(ctwc.UCID_BC_DOMAIN_ALL_PROJECTS,
                                   domainObj.name),
                    loadOnTimeout: false,
                    cacheTimeout: cowc.PROJECT_CACHE_UPDATE_INTERVAL
                };
            }
            return modelConfig;
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
                        url: ctwc.getProjectsURL({name: domain})
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
                viewPathPrefix, viewPath,
                model = renderConfig['model'],
                viewAttributes = renderConfig['viewAttributes'],
                modelMap = renderConfig['modelMap'],
                rootView = renderConfig['rootView'],
                onAllViewsRenderCompleteCB = renderConfig['onAllViewsRenderCompleteCB'],
                onAllRenderCompleteCB = renderConfig['onAllRenderCompleteCB'],
                lazyRenderingComplete  = renderConfig['lazyRenderingComplete'],
                elementView;

            /**
             * if views are dynamically loaded using viewPathPrefix in a viewConfig, the path should prefix
             * with 'core-basedir' as depending on the env, the root dir from which the files are served changes.
             */
            if (contrail.checkIfExist(renderConfig['viewPathPrefix'])) {
                viewPathPrefix =  renderConfig['viewPathPrefix'];
                // If viewPathPrefix doesn't start with core-basedir or controller-basedir add controller-basedir
                if (!(viewPathPrefix.slice(0, 'core-basedir'.length) === 'core-basedir') &&
                    !(viewPathPrefix.slice(0, 'controller-basedir'.length) === 'controller-basedir')) {
                    viewPathPrefix =  'controller-basedir/' + viewPathPrefix;
                }
            } else {
                viewPathPrefix = './';
            }
            viewPath = viewPathPrefix + viewName;
            var checkRequirePath = viewPath.replace(/^core-basedir\//,'').replace(/^controller-basedir\//,'');
            var pathMapping = _.invert(require.s.contexts._.config.paths);
            pathMapping = {
                 'monitor/infrastructure/common/ui/js/views/VRouterScatterChartView' : 'vrouter-scatterchart-view'
            }
            // viewPath = ifNull(pathMapping[checkRequirePath],viewPath);
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
        this.formatCurrentFQName = function(argFqname, currentDomainProject){
            var domain = "", project = "";
            var fqname = _.clone(argFqname);
            if(currentDomainProject != null && currentDomainProject != ""){
                var domainProjectArr = currentDomainProject.split(":");
                if(domainProjectArr.length === 2) {
                    domain = domainProjectArr[0];
                    project = domainProjectArr[1];
                }
            } else if(utilVariable["domain"] != null &&
                      utilVariable["project"] != null){
                domain = utilVariable["domain"].name;
                project = utilVariable["project"].name;
            } else {
                return false;
            }
            if(fqname.length >= 3) {
                if(fqname[0] == domain && fqname[1] == project) {
                    return fqname[fqname.length-1];
                } else {
                    var element = fqname[fqname.length-1];
                    var parent = fqname.splice(0,fqname.length-1);
                    return element + " (" + parent.join(":") + ")";
                }
            }
        };

        this.onClickNetworkMonitorGrid = function (e, selRowDataItem) {
            if (!$(e.target).hasClass('cell-no-link')) {
                var name = $(e.target).attr('name'),
                    fqName, uuid, vmName;

                if ($.inArray(name, ['project']) > -1) {
                    fqName = selRowDataItem['name'];
                    ctwu.setProjectURLHashParams(null, fqName, true)

                } else if ($.inArray(name, ['network']) > -1) {
                    fqName = selRowDataItem['name'];
                    ctwu.setNetworkURLHashParams(null, fqName, true)
                } else if ($.inArray(name, ['vn']) > -1) {
                    fqName = selRowDataItem['vnFQN'];
                    ctwu.setNetworkURLHashParams(null, fqName, true)
                } else if ($.inArray(name, ['instance']) > -1) {
                    fqName = selRowDataItem['vnFQN'];
                    uuid = selRowDataItem['name'];
                    vmName = selRowDataItem['vmName'];
                    if (contrail.checkIfExist(fqName) && !ctwu.isServiceVN(fqName)) {
                        ctwu.setInstanceURLHashParams(null, fqName, uuid, vmName, true);
                    }
                } else if ($.inArray(name, ['vRouter']) > -1) {
                    var urlObj = layoutHandler.getURLHashObj();
                    if (urlObj['p'] == 'mon_infra_vrouter' &&
                        urlObj['q']['view'] == 'details') {
                        $("#" + ctwl.VROUTER_DETAILS_TABS_ID).tabs({active: 0});
                    } else {
                        var hashObj = {
                            type: 'vrouter',
                            view: 'details',
                            focusedElement: {
                                node: selRowDataItem['vRouter'],
                                tab: 'details'
                            }
                        };
                        layoutHandler.setURLHashParams(hashObj,
                            {
                                p: "mon_infra_vrouter",
                                merge: false,
                                triggerHashChange: true
                            }
                        );
                    }
                }
            }
        };

        this.setProjectURLHashParams = function(hashParams, projectFQN, triggerHashChange) {
            var hashObj = {
                type: "project",
                view: "details",
                focusedElement: {
                    fqName: projectFQN,
                    type: ctwc.GRAPH_ELEMENT_PROJECT
                }
            };

            if(contrail.checkIfKeyExistInObject(true, hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_projects", merge: false, triggerHashChange: triggerHashChange});

        };

        this.setProject4NetworkListURLHashParams = function(projectFQN) {
            var hashObj = {
                type: "network",
                view: "list"
            };

            if (projectFQN != null) {
                hashObj.project = projectFQN;
            }

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_networks", merge: false, triggerHashChange: false});
        };

        this.setNetworkURLHashParams = function(hashParams, networkFQN, triggerHashChange) {
            var hashObj = {
                type: "network",
                view: "details",
                focusedElement: {
                    fqName: networkFQN,
                    type: ctwc.GRAPH_ELEMENT_NETWORK
                }
            };

            if(contrail.checkIfKeyExistInObject(true, hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_networks", merge: false, triggerHashChange: triggerHashChange});

        };

        this.setNetwork4InstanceListURLHashParams = function(extendedHashObj) {
            var hashObj = $.extend(true, {
                    type: "instance",
                    view: "list"
                }, extendedHashObj);;

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_instances", merge: false, triggerHashChange: false});
        };

        this.setInstanceURLHashParams = function(hashParams, networkFQN, instanceUUID, vmName, triggerHashChange) {
            var hashObj = {
                type: "instance",
                view: "details",
                focusedElement: {
                    fqName: networkFQN,
                    type: ctwc.GRAPH_ELEMENT_INSTANCE,
                    uuid: instanceUUID,
                    vmName: vmName
                }
            };

            if(contrail.checkIfKeyExistInObject(true, hashParams, 'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {p: "mon_networking_instances", merge: false, triggerHashChange: triggerHashChange});
        };


        this.formatValues4TableColumn = function (valueArray) {
            var formattedStr = '',
            entriesToShow = 2;

            if (valueArray == null) {
                return formattedStr;
            }

            $.each(valueArray, function (idx, value) {
                if (idx == 0) {
                    formattedStr += value;
                } else if (idx < entriesToShow) {
                    formattedStr += '<br/>' + value;
                } else {
                    return;
                }
            });

            if (valueArray.length > 2) {
                formattedStr += '<br/>' + contrail.format('({0} more)', valueArray.length - entriesToShow);
            }

            return formattedStr;
        };

     // This function accepts array of ips, checks the type(IPv4/IPv6) and
        // returns the label value html content of the first two elements of the array and more tag.
        this.formatIPArray = function(ipArray) {
            var formattedStr = '', entriesToShow = 2;

            if (ipArray == null) {
                return formattedStr;
            }

            $.each(ipArray, function (idx, value) {
                var lbl = 'IPv4', isIpv6 = false;
                isIpv6 = isIPv6(value);
                if (idx == 0) {
                    formattedStr += getLabelValueForIP(value);
                } else if (idx < entriesToShow) {
                    formattedStr += "<br/>" + getLabelValueForIP(value);
                }
                else
                    return;
            });

            if (ipArray.length > 2) {
                formattedStr += '<br/>' + contrail.format('({0} more)', ipArray.length - entriesToShow);
            }

            return contrail.format(formattedStr);
        };

        /** 
         * As "Alerts" link in header can be clicked from any page,it need to know the list 
         * of nodeListModels to loop through to generate alerts. 
         * Return the require Aliases/URLs of all listModels for which alerts need to be processed
         */
        this.getNodeListModelsForAlerts = function(defObj) {
            return ['monitor-infra-analyticsnode-model','monitor-infra-databasenode-model',
                'monitor-infra-confignode-model','monitor-infra-controlnode-model',
                'monitor-infra-vrouter-model'];
        };

        /**
         * If a resource's display_name is not set then use name
         */
        this.getDisplayNameOrName = function (cfgModel) {
            var displayName = getValueByJsonPath(cfgModel, 'display_name', "");
            var name = getValueByJsonPath(cfgModel, 'name', "");

            if (displayName.length) {
                return displayName;
            } else {
                return name;
            }
        };

        /**
         * Set a resource's name from display_name
         */
        this.setNameFromDisplayName = function (cfgModel) {
            var displayName = getValueByJsonPath(cfgModel, 'display_name', "");
            var name = getValueByJsonPath(cfgModel, 'name', "");
            if (name == '') {
                cfgModel['name'] = displayName;
            }
        };
        /**
         * Set a resource's display_name from name
         */
        this.setDisplayNameFromName = function (cfgModel) {
            var displayName = getValueByJsonPath(cfgModel, 'display_name', "");
            var name = getValueByJsonPath(cfgModel, 'name', "");
            if ('' == displayName) {
                cfgModel['display_name'] = name;
            }
        };

        /**
         * Used to Clean traces of DOM when navigate away from the page
         */
        this.destroyDOMResources = function(prefixId) {
            $("#configure-" + prefixId).remove();
        };

        /**
         * Used to remove any error message for an element specified by path
         */
        this.removeAttrErrorMsg = function(model, path) {
            if ((null == model) || (null == path)) {
                return;
            }
            var attr = cowu.getAttributeFromPath(path);
            var errors = model.get(cowc.KEY_MODEL_ERRORS);
            var attrErrorObj = {};
            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = null;
            errors.set(attrErrorObj);
        };
    };
    return CTUtils;
});
