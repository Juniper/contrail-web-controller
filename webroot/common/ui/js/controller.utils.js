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
        var fqnToDisplayNameMap = {project: {}, domain: {}};
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
                                        class: 'col-xs-6',
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
                                        class: 'col-xs-6',
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

        self.getRBACPermissionExpandDetails = function(keyClass) {
            return {
                title: "Permissions",
                templateGenerator: 'BlockListTemplateGenerator',
                templateGeneratorConfig: [
                    {
                        label: 'Owner',
                        key: 'perms2.owner',
                        keyClass: keyClass,
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        label: 'Owner Permissions',
                        key: 'perms2.owner_access',
                        keyClass: keyClass,
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'permissionFormatter',
                        }
                    },
                    {
                        label: 'Global Permissions',
                        key: 'perms2.global_access',
                        keyClass: keyClass,
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'permissionFormatter',
                        }
                    },
                    {
                        label: 'Shared List',
                        key: 'perms2.share',
                        keyClass: keyClass,
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'sharedPermissionFormatter'
                        }
                    }
                ]
            }
        };

        self.getTagsExpandDetails = function() {
            var tagsList = [
            {
                keyClass:'col-xs-3',
                valueClass:'col-xs-9',
                key: 'tag_refs',
                name:"tag_refs",
                label:"Associated Tags",
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig:{
                    formatter: "tagsFormatter"
                }
            }]
            return tagsList;
        };
        self.getTagsApplicationDetails = function() {
            var tagsList = [
            {
                keyClass:'col-xs-3',
                valueClass:'col-xs-9',
                key: 'tag_refs',
                name:"tag_refs",
                label:"Application Tags",
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig:{
                    formatter: "tagsFormatter"
                }
            }]
            return tagsList;
        };
        self.tagsPortGridFormatter = function(d, c, v, cd, dc) {
            var tags = "";
            var formattedtags = "";
            var tags_ref = getValueByJsonPath(dc, "tag_refs", "");
            if(tags_ref != ""){
                var tags_ref_length = tags_ref.length;
                for(var i = 0; i < tags_ref_length; i++) {
                    var tags_ref_to = getValueByJsonPath(tags_ref[i], "to", "");
                    if(tags_ref_to.length === 3){
                        var reverseTagsData = tags_ref_to.reverse();
                        reverseTagsData = reverseTagsData[0];
                        var tagsDataString = reverseTagsData.toString();
                    }
                    else if(tags_ref_to.length === 1){
                        tagsDataString = tags_ref_to;
                    }
                    tags += tagsDataString;
                    if(tags != "") {
                        tags += "<br> ";
                    }
                }
                var tags_length = (tags.match(/<br>/g) || []).length;
                if(tags_length < 3){
                    tags = tags;
                }
                else {
                    var set_tags_length = tags_length-2;
                    var delimiter = '<br>';
                    var start = tags_length - 2;
                    tags = tags.split(delimiter).slice(start);
                    var result = tags.join(delimiter);
                    tags = result+"   ("+set_tags_length+" more)";
                }
            }
           if(dc['name'] === ctwc.GLOBAL_APPLICATION_POLICY_SET
               && dc['is_global'] === true){
                    tags = "application=*";
            }
            return tags ? tags : '-';
        };
        self.getPermissionsValidation = function() {
            return {
                key: 'share_list',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'rbacPermsShareValidations'
            }
        };

        self.bindPermissionsValidation = function(editView) {
            kbValidation.bind(editView,
                    {collection: editView.model.model().attributes.share_list});
        };

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

        self.formatVNName = function (vnName, projectFQN) {
            var formattedValue;
            if (!$.isArray(vnName))
                vnName = [vnName];
            formattedValue = $.map(vnName, function (value, idx) {
                var fqNameArr = value.split(':');
                if (null != projectFQN) {
                    var projectFQNArr = projectFQN.split(":");
                    if ((projectFQNArr[0] === fqNameArr[0]) &&
                        (projectFQNArr[1] === fqNameArr[1])) {
                        return projectFQNArr[2];
                    }
                }
                if (fqNameArr.length == 3)
                    return fqNameArr[2] + ' (' + fqNameArr[1] + ')';
                else
                    return value;
            });
            return formattedValue;
        };
        self.getRegionList = function(){
            var regionList = getValueByJsonPath(globalObj, "webServerInfo;regionList", []);
                regionList = _.without(regionList, cowc.GLOBAL_CONTROLLER_ALL_REGIONS);
            return regionList;
        };
        this.securityLoggingObjectFormatter = function(response, mode) {
            var sloList, sloDataSrc = [], returnString = '', fqList = [];
            if(mode != undefined){
                sloList = getValueByJsonPath(response, 'security_logging_object_refs', []);
                if(mode === 'edit'){
                    if(sloList.length > 0){
                        for(var i = 0; i < sloList.length; i++){
                            var to = sloList[i].to;
                            sloDataSrc.push(to.join(':'));
                        }
                        return sloDataSrc;
                    }else{
                       return sloList;
                    }
                }else{
                    if(sloList.length > 0){
                        for(var j = 0; j < sloList.length; j++){
                           var to = sloList[j].to;
                           var name = to[to.length - 1];
                           fqList.push(name);
                        }
                        for(var k = 0; k < fqList.length; k++){
                            returnString += fqList[k] + "<br>";
                        }
                        return returnString;
                    }else{
                        return '-';
                    }
                }
            }else{
                sloList = getValueByJsonPath(response,
                        '0;security-logging-objects', [], false);
                _.each(sloList, function(sloConfig) {
                    if("security-logging-object" in sloConfig) {
                        var sloObj = sloConfig["security-logging-object"];
                        var fqName = sloObj.fq_name;
                        sloDataSrc.push({id: fqName.join(':'), text: fqName[fqName.length - 1]});
                    }
                });
                return sloDataSrc;
            }
        };
        this.setSloToModel = function(attr) {
            var refObj = attr.security_logging_object_refs,
                sloList = [];
            if(refObj !== ''){
                var sloObj = refObj.split(';');
                for(var i = 0; i < sloObj.length; i++){
                    var obj = {};
                    obj.to = sloObj[i].split(':');
                    sloList.push(obj);
                }
                return sloList;
            }else{
                return [];
            }
        };
        this.getLocationGrid = function(e, obj, objProp, id){
            var rowCount = $('#'+id).data("contrailGrid").selectedRow, reqUrl, headerContent,
            thClass = 'col-xs-2 region-th-border', tdClass = 'col-xs-2 region-td-border';
            var row = e.currentTarget.firstChild.nextElementSibling.getAttribute('data-cgrid').split('_')[1];
            var rowIndex = parseInt(row);
            var index = rowCount + rowIndex;
            var rowIndex = 'div[data-cgrid*="id_'+index+'"]';
            var content = $($(e.currentTarget).children(rowIndex)[1]).find('.detail-section-content')[0];
            if($(content).find('.region-location-based-grid').length !== 0){
                content.lastChild.remove();
            }
            if(objProp.name === 'servers'){
                reqUrl = ctwc.GOHAN_URL + objProp.name +'/'+ obj.id +'/'+ objProp.urlKey + ctwc.GOHAN_PARAM;
            }else{
                reqUrl = ctwc.GOHAN_PRE_URL + objProp.name +'/'+ obj.id +'/'+ objProp.urlKey + ctwc.GOHAN_PARAM;
            }
            var ajaxConfig = {
                    url: reqUrl,
                    type:'GET',
                    async: false
                };
            contrail.ajaxHandler(ajaxConfig, null, function(model){
                var arr = model[Object.keys(model)[0]];
                var region = $('<div></div>').addClass('region-location-based-grid');
                var header = $('<h6></h6>').text(objProp.header);
                region.append(header);
                var table = $('<table></table>').addClass('region-details-table');
                var thead = $('<thead></thead>');
                var tbody = $('<tbody></tbody>');
                var tr = $('<tr></tr>');
                if(objProp.name === 'networks'){
                    headerContent = ctwc.NETWORK_LOCATION_GRID_HEADER;
                }else if(objProp.name === 'servers'){
                    headerContent = ctwc.SERVER_LOCATION_GRID_HEADER;
                    thClass = 'col-xs-1 region-th-border';
                    tdClass = 'col-xs-1 region-td-border';
                }else{
                    headerContent = ctwc.LOCATION_GRID_HEADER;
                }
                for(var k = 0; k < headerContent.length; k++){
                    var node = $('<th></th>').addClass(thClass).text(headerContent[k]);
                    tr.append(node);
                }
                thead.append(tr);
                table.append(thead);
                for(var i = 0; i < arr.length; i++){
                  var tbodyTr = $('<tr></tr>');
                  var locationNode = $('<td></td>').addClass(tdClass).text(arr[i].location.name);
                  tbodyTr.append(locationNode);
                  var statusNode = $('<td></td>').addClass(tdClass).text(arr[i].status);
                  tbodyTr.append(statusNode);
                  var nameNode = $('<td></td>').addClass(tdClass).text(arr[i].name);
                  tbodyTr.append(nameNode);
                  var descriptionNode = $('<td></td>').addClass(tdClass).text(arr[i].description);
                  tbodyTr.append(descriptionNode);
                  if(objProp.name === 'networks'){
                      var cidrNode = $('<td></td>').addClass(tdClass).text(arr[i].cidr);
                      tbodyTr.append(cidrNode);
                  }
                  if(objProp.name === 'servers'){
                      var instanceId = $('<td></td>').addClass(tdClass).text(arr[i].instance_id);
                      tbodyTr.append(instanceId);
                      var console = $('<td></td>').addClass(tdClass).text(arr[i].console_url);
                      tbodyTr.append(console);
                  }
                  var taskStatusNode = $('<td></td>').addClass(tdClass).text(arr[i].task_status);
                  tbodyTr.append(taskStatusNode);
                  tbody.append(tbodyTr);
                }
                table.append(tbody);
                region.append(table);
                $(content).append(region);
            },function(error){
                contrail.showErrorMsg(error.responseText);
            });
        };

        this.isServiceVN = function (vnFQN) {
            var fqnArray = [];
            if(vnFQN){
                fqnArray = vnFQN.split(":");

                if(ctwc.SERVICE_VN_EXCLUDE_LIST.indexOf(fqnArray[2]) != -1) {
                    return true;
                }
            }
            return false;
        };
        this.getDomainListModelConfig = function() {
            var firstRegion = this.getRegionList()[0];
            var currentCookie =  contrail.getCookie('region');
            var url;
            var responseDomains;
            if(currentCookie === cowc.GLOBAL_CONTROLLER_ALL_REGIONS){
                url = ctwc.URL_ALL_DOMAINS+'?reqRegion='+firstRegion
            }
            else{
                url = ctwc.URL_ALL_DOMAINS;
            }
            return {
                remote: {
                    ajaxConfig: {
                        url: url
                    },
                    dataParser: function(response) {
                        if(currentCookie === "All Regions"){
                            responseDomains = response.data.domains;
                        }
                        else{
                            responseDomains = response.domains;
                        }
                        return  $.map(responseDomains, function (n, i) {
                            var domainName = getValueByJsonPath(n,
                                                                "fq_name;0");
                            var displayName = getValueByJsonPath(n,
                                                                 "display_name",
                                                                 domainName);
                            fqnToDisplayNameMap.domain[domainName] =
                                displayName;
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[0],
                                display_name: displayName,
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
                                display_name: n.fq_name[0],
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
                                display_name: n.fq_name[1],
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
            var firstRegion = this.getRegionList()[0];
            var currentCookie =  contrail.getCookie('region');
            var responseDomains;
            var url;
            if(currentCookie === cowc.GLOBAL_CONTROLLER_ALL_REGIONS){
                url = ctwc.URL_ALL_DOMAINS+'?reqRegion='+firstRegion
            }
            else{
                url = ctwc.URL_ALL_DOMAINS;
            }
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: url
                    },
                    dataParser: function(response) {
                        if(currentCookie === "All Regions"){
                            responseDomains = response.data.domains;
                        }
                        else{
                            responseDomains = response.domains;
                        }
                        return  $.map(responseDomains, function (n, i) {
                            var domainName = getValueByJsonPath(n,
                                                                "fq_name;0");
                            var displayName = getValueByJsonPath(n,
                                                                 "display_name",
                                                                 domainName);
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[0],
                                display_name: displayName,
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
            var firstRegion = this.getRegionList()[0];
            var currentCookie =  contrail.getCookie('region');
            var responseProjects;
            var url;
            if(currentCookie === cowc.GLOBAL_CONTROLLER_ALL_REGIONS){
                url = ctwc.URL_ALL_PROJECTS +
                "?domainId=" + domainObj.value+'&reqRegion='+firstRegion
            }
            else{
                url = ctwc.URL_ALL_PROJECTS +
                "?domainId=" + domainObj.value;
            }
            var modelConfig = {
                remote: {
                    ajaxConfig: {
                        url: url
                    },
                    dataParser: function(response) {
                        var result = [];
                        if(currentCookie === "All Regions"){
                            responseProjects = response.data.projects;
                        }
                        else{
                            responseProjects = response.projects;
                        }
                        _.each(responseProjects, function (n, i) {
                            var projectName = getValueByJsonPath(n,
                                                                 "fq_name;1");
                            var displayName = getValueByJsonPath(n,
                                                                 "display_name",
                                                                 projectName);
                            var errorStr = getValueByJsonPath(n, "error_string",
                                                              null);
                            if(!dropdownOptions.includeDefaultProject &&
                                projectName === ctwc.DEFAULT_PROJECT) {
                                return true;
                            }
                            fqnToDisplayNameMap.project[projectName] =
                                displayName;
                            var projObj = {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[1],
                                display_name: displayName,
                                value: n.uuid
                            };
                            if (null != errorStr) {
                                projObj.error_string = errorStr;
                            }
                            result.push(projObj);
                        });
                        return result;
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
                        url: '/api/tenants/config/list-virtual-DNSs'
                    },
                    dataParser: function(response) {
                        return  $.map(response, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[1],
                                display_name: n.fq_name[1],
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
                            var projName = getValueByJsonPath(n,
                                                              "fq_name;1");
                            var displayName = getValueByJsonPath(n,
                                                                 "display_name",
                                                                 projName);
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[1],
                                display_name: displayName,
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

        this.getFQNByDomainProjectDisplayName = function(fqName) {
            if (null == fqName) {
                return fqName;
            }
            /* In Project drop down breadcrumb, we have
             * display_name, but API Server/OpServer we have
             * fq_name, so set the drop down with corresponding
             * display_name
             */
            var fqnArr = fqName.split(":");
            if (fqnArr.length > 2) {
                var domain = fqnToDisplayNameMap.domain[fqnArr[0]];
                var project = fqnToDisplayNameMap.project[fqnArr[1]];
                fqnArr[0] = (null != domain) ? domain : fqnArr[0];
                fqnArr[1] = (null != project) ? project : fqnArr[1];
            }
            return fqnArr.join(":");
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
                    fqName = self.getFQNByDomainProjectDisplayName(fqName);
                    ctwu.setNetworkURLHashParams(null, fqName, true)
                } else if ($.inArray(name, ['vn']) > -1) {
                    fqName = selRowDataItem['vnFQN'];
                    fqName = self.getFQNByDomainProjectDisplayName(fqName);
                    ctwu.setNetworkURLHashParams(null, fqName, true)
                } else if ($.inArray(name, ['instance']) > -1) {
                    fqName = selRowDataItem['vnFQN'];
                    fqName = self.getFQNByDomainProjectDisplayName(fqName);
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
        /**
         * Generates a UUID.
         * @returns {string}
         */
        this.generateRequestUUID = function() {
            var s = [], itoh = '0123456789ABCDEF';
            for (var i = 0; i < 36; i++) {
                s[i] = Math.floor(Math.random() * 0x10);
            }
            s[14] = 4;
            s[19] = (s[19] & 0x3) | 0x8;
            for (var i = 0; i < 36; i++) {
                s[i] = itoh[s[i]];
            }
            s[8] = s[13] = s[18] = s[23] = s[s.length] = '-';
            s[s.length] = (new Date()).getTime();
            return s.join('');
        };

        /**
         * Used to get current domain project from stored cookie
         */
        this.getCurrentDomainProject = function() {
            var domainName = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectName = contrail.getCookie(cowc.COOKIE_PROJECT);
            return domainName + ":" + projectName;
        };
    };

    this.permissionFormatter =  function(v, dc) {
        var retStr = "";
        switch (Number(v)) {
            case 1:
                retStr = "Refer";
                break;
            case 2:
                retStr = "Write";
                break;
            case 3:
                retStr = "Write, Refer";
                break;
            case 4:
                retStr = "Read";
                break;
            case 5:
                retStr = "Read, Refer";
                break;
            case 6:
                retStr = "Read, Write";
                break;
            case 7:
                retStr = "Read, Write, Refer";
                break;
            default:
                retStr = "-";
                break;
        };
        return retStr;
    };

    this.tagsFormatter = function(v,dc) {
        var tagsBinding = "";
        var tagsData ="";
        var data = getValueByJsonPath(dc,
                "tag_refs",
                []);
        tagsBinding = "<table width='100%'><thead></thead><tbody>";
        var data_length = data.length;
        var tagsData ="";
        var projectData = [];
        for(var i = 0; i < data_length;i++) {
            tagsData = data[i].to;
            tagsBinding += "<tr><td>";
            if(tagsData.length === 1){
                tagsBinding += data[i].to;
            }
            else if(tagsData.length === 3){
                tagsBinding += tagsData[2];
            }

            tagsBinding += "</td></tr>";
        }
        tagsBinding += "</tbody></table>";
        return tagsBinding;
    };
    this.sharedPermissionFormatter = function(v, dc) {
        var formattedSharedPerms = "", sharedPermsStr = "",
            sharedPerms =  getValueByJsonPath(dc, "perms2;share", []),
            i, sharedPermsCnt = sharedPerms.length;
        if(sharedPermsCnt) {
            for(i = 0; i < sharedPermsCnt; i++) {
                if(sharedPerms[i]) {
                    sharedPermsStr += "<tr style='vertical-align:top'><td>";
                    sharedPermsStr += sharedPerms[i].tenant + "</td><td>";
                    sharedPermsStr +=
                        permissionFormatter(sharedPerms[i].tenant_access) +
                        "</td><td>";
                    sharedPermsStr += "</tr>";
                }
            }
            if(sharedPermsStr) {
                formattedSharedPerms =
                    "<table class='sharedlist_permission' style='width:100%'><thead><tr>" +
                    "<th style='width:70%'>Project</th>" +
                    "<th style='width:30%'>Permissions</th>" +
                    "</tr></thead><tbody>";
                formattedSharedPerms += sharedPermsStr;
                formattedSharedPerms += "</tbody></table>";
            }
        } else {
            formattedSharedPerms = "-";
        }
        return formattedSharedPerms;
    };
    return CTUtils;
});
