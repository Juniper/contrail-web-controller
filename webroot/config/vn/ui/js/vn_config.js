/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

virtualnetworkConfigObj = new VirtualNetworkConfig();

function VirtualNetworkConfig() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject, ddFwdMode;

    //Comboboxes

    //Grids
    var gridVN;

    //Buttons
    var btnCreateVN, btnDeleteVN,
        btnCreateVNCancel, btnCreateVNOK, btnRemovePopupOK, 
        btnRemovePopupCancel,btnCnfRemoveMainPopupOK, 
        btnCnfRemoveMainPopupCancel;

    //Textboxes
    var txtVNName, txtVxLanId;

    //Multiselects
    var msNetworkPolicies;

    //Windows
    var windowCreateVN, confirmRemove, confirmMainRemove;

    var gridVNDetailTemplate;

    //Misc
    var mode = "";
    var vnAjaxcount = 0;
    var idCount = 0;
    var ajaxParam;

    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForGridVN = fetchDataForGridVN;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.successHandlerForGridVNRow = successHandlerForGridVNRow;
    this.handleProjects = handleProjects;
    this.showVNEditWindow = showVNEditWindow;
    this.closeCreateVNWindow = closeCreateVNWindow;
    this.autoPopulateGW = autoPopulateGW;
    this.deleteVN = deleteVN;
    this.successHandlerForGridVN = successHandlerForGridVN;
    this.failureHandlerForGridVN = failureHandlerForGridVN;
    this.createVNSuccessCb = createVNSuccessCb;
    this.createVNFailureCb = createVNFailureCb;
    this.reorderPolicies = reorderPolicies;
    this.validateRTEntry = validateRTEntry;
    this.validateFipEntry = validateFipEntry;
    this.validate = validate;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#vn-config-template").html());
    $(contentContainer).empty();
    $(contentContainer).html(configTemplate);
    currTab = 'config_networking_vn';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridVN");
}

function initComponents() {
    $("#gridVN").contrailGrid({
        header : {
            title : {
                text : 'Virtual Networks',
                //cssClass : 'blue',
                //icon : 'icon-list',
                //iconCssClass : 'blue'
            },
            //defaultControls: {
            //    collapseable: false,
            //    exportable: false,
            //    refreshable: false,
            //    searchable: true
            //},
            customControls: ['<a id="btnDeleteVN" class="disabled-link" title="Delete Virtual Network(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateVN" onclick="showVNEditWindow(\'add\');return false;" title="Create Virtual Network"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
            columns : [
            {
                id: "Network",
                field: "Network",
                name: "Network",
                sortable: true
            },
            {
                id: "AttachedPolicies",
                field: "AttachedPolicies",
                name: "Attached Policies",
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.AttachedPolicies === "object") {
                       for(var i=0; i<dc.AttachedPolicies.length, i<2; i++) {
                           if(typeof dc.AttachedPolicies[i] !== "undefined") {
                               returnString += dc.AttachedPolicies[i] + "<br>";
                           }
                       }
                       if(dc.AttachedPolicies.length > 2) {
                           returnString += '<span class="moredataText">(' + 
                           (dc.AttachedPolicies.length-2) + 
                           ' more  )</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                }
            },
            {
                id: "IPBlocks",
                field: "IPBlocks",
                name: "IP Blocks",
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.IPBlocks === "object") {
                       for(var i=0; i<dc.IPBlocks.length, i<2; i++) {
                           if(typeof dc.IPBlocks[i] !== "undefined") {
                               returnString += dc.IPBlocks[i] + "<br>";
                           }
                       }
                       if(dc.IPBlocks.length > 2) {
                           returnString += '<span class="moredataText">(' + 
                           (dc.IPBlocks.length-2) + 
                           ' more  )</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                }
            }]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteVN').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteVN').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showVNEditWindow('edit',rowIndex);
                        }
                    },
                    {
                        title: 'Delete',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showRemoveWindow(rowIndex);
                        }
                    }
                ],
                detail: {
                    template: $("#gridVNDetailTemplate").html()
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Virtual Networks..',
                },
                empty: {
                    text: 'No Virtual Networks Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Virtual Networks.'
                }
            }
        }
    });

    gridVN = $("#gridVN").data('contrailGrid');
    
    btnCreateVN = $("#btnCreateVN");
    btnDeleteVN = $("#btnDeleteVN");
    btnCreateVNCancel = $("#btnCreateVNCancel");
    btnCreateVNOK = $("#btnCreateVNOK");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");

    txtVNName = $("#txtVNName");
    txtVxLanId = $("#txtVxLanId");
    vnAjaxcount = 0;
    
    ddFwdMode = $("#ddFwdMode").contrailDropdown({
        data: [{id:"l2_l3", text:'L2 and L3'}, {id:"l2", text:'L2 Only'}]
    });

    msNetworkPolicies = $("#msNetworkPolicies").contrailMultiselect({
        placeholder: "Select Policies...",
        dropdownCssClass: 'select2-medium-width'
    });;

    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });

    gridVN.showGridMessage('loading');
   
    $('body').append($("#windowCreateVN"));
    windowCreateVN = $("#windowCreateVN");
    windowCreateVN.on("hide", closeCreateVNWindow);
    windowCreateVN.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmMainRemove"));
    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmRemove"));
    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function deleteVN(selected_rows) {
    var deleteAjaxs = [];
    if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/virtual-network/"; 
        cbParams.urlField = "NetworkUUID";
        cbParams.fetchDataFunction = "fetchDataForGridVN";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting networks - ";
        cbParams.errorField = "Network";
        deleteObject(cbParams);
    }
}

function initActions() {
     Handlebars.registerHelper("IpamList", function(vnData, options){
        if(typeof vnData === 'object' && vnData.IPBlocks && vnData.IPBlocks.length > 0) {
            var returnString = "";
            for(var i=0; i<vnData.IPBlocks.length; i++) {
                returnString += vnData.Ipams[i] + " " + vnData.IPBlocks[i] + " " + vnData.Gateways[i] + "<br>";
            }
        }
        return returnString;
    });

    Handlebars.registerHelper("RTList", function(vnData, options){
        if(typeof vnData === 'object' && vnData.RouteTargets && vnData.RouteTargets.length > 0) {
            var returnString = "";
            for(var i=0; i<vnData.RouteTargets.length; i++) {
                returnString += removeRTString(vnData.RouteTargets[i]) + ((i!==(vnData.RouteTargets.length-1)) ? ", " : "");
            }
        }
        return returnString;
    });

    Handlebars.registerHelper("FipList", function(vnData, options){
        if(typeof vnData === 'object' && vnData.FloatingIPs && vnData.FloatingIPs.length > 0) {
            var returnString = "";
            for(var i=0; i<vnData.FloatingIPs.length; i++) {
                returnString += vnData.FloatingIPs[i] + " " + getAssignedProjectsForIpam(vnData.FloatingIPPools[i]) + "<br>";
            }
        }
        return returnString;
    });

    btnDeleteVN.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide');
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        var selected_rows = $("#gridVN").data("contrailGrid").getCheckedRows();
        deleteVN(selected_rows);
        confirmMainRemove.modal('hide');
    });
    

    btnCreateVNCancel.click(function (a) {
        windowCreateVN.hide();
    });

    btnCreateVNOK.click(function (a) {
        if (validate() !== true)
            return;

        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
            gridVN.showGridMessage('errorGettingData');
            return;
        }
            
        var vnConfig = {};
        vnConfig["virtual-network"] = {};
        vnConfig["virtual-network"]["parent_type"] = "project";

        vnConfig["virtual-network"]["fq_name"] = [];
        vnConfig["virtual-network"]["fq_name"][0] = selectedDomain;
        vnConfig["virtual-network"]["fq_name"][1] = selectedProject;
        vnConfig["virtual-network"]["fq_name"][2] = txtVNName.val();

        
        var policies = $($("#msNetworkPolicies").parent().children()[0]).find("li.select2-search-choice").find("div");
        if (policies && policies.length > 0) {
            var currentVn = 
                jsonPath(configObj, "$.virtual-networks[?(@.fq_name[2]=='" + txtVNName.val().trim() + "')]");
            vnConfig["virtual-network"]["network_policy_refs"] = [];
            for (var i = 0; i < policies.length; i++) {
                policies[i] = policies[i].innerHTML;
                vnConfig["virtual-network"]["network_policy_refs"][i] = {};
                vnConfig["virtual-network"]["network_policy_refs"][i]["attr"] = {};
                var currentPolicy = null;
                if(policies[i].indexOf(":") !== -1) {
                    var tmpPolicy = policies[i].split(":");
                    currentPolicy = 
                    jsonPath(currentVn, "$..network_policy_refs[?(@.to[0]=='" + tmpPolicy[0] + "' && " +
                    "@.to[1]=='" + tmpPolicy[1] + "' && @.to[2]=='" + tmpPolicy[2] + "')]");
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"] = [];
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][0] = tmpPolicy[0];
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][1] = tmpPolicy[1];
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][2] = tmpPolicy[2];
                } else {
                    currentPolicy = 
                    jsonPath(currentVn, "$..network_policy_refs[?(@.to[0]=='" + selectedDomain + "' && " +
                    "@.to[1]=='" + selectedProject + "' && @.to[2]=='" + policies[i] + "')]");
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"] = [];
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][0] = selectedDomain;
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][1] = selectedProject;
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][2] = policies[i];
                }
                if(currentPolicy && currentPolicy.length > 0) {
                    currentPolicy = currentPolicy[0];
                    var currAttr = currentPolicy.attr;
                    vnConfig["virtual-network"]["network_policy_refs"][i]["attr"]["timer"] = currAttr.timer;
                }
            }
        }

        var mgmtOptions = [];
        var ipamTuples = $("#ipamTuples")[0].children;
        if (ipamTuples && ipamTuples.length > 0) {
            var ipamList = [];            
            for (var i = 0; i < ipamTuples.length; i++) {
                var currentIpam    = $($($($("#ipamTuples").children()[i]).find(".span3")[0]).find("div.contrailDropdown")[1]).data("contrailDropdown").value().trim();
                var currentIpBlock = $($($($("#ipamTuples").children()[i]).find(".span3")[1]).find("input")[0]).val().trim();
                var currentGateway = $($($($("#ipamTuples").children()[i]).find(".span3")[2]).find("input")[0]).val().trim();
                if(ipamList.lastIndexOf(currentIpam) === -1) {
                    mgmtOptions.splice(i, 0, {IPAM: currentIpam, IPBlock:currentIpBlock, Gateway:currentGateway});
                    ipamList.splice(i, 0, currentIpam);
                } else {
                    var lastPos = ipamList.lastIndexOf(currentIpam);
                    mgmtOptions.splice(lastPos+1, 0, {IPAM: "", IPBlock:currentIpBlock, Gateway:currentGateway});
                    ipamList.splice(lastPos+1, 0, currentIpam);
                }
            }
        }

        if (mgmtOptions && mgmtOptions.length > 0) {
            vnConfig["virtual-network"]["network_ipam_refs"] = [];
            var ipamIndex = 0;
            for (var i = 0; i < mgmtOptions.length; i++) {
                var ipBlock = mgmtOptions[i].IPBlock;
                var ipam = mgmtOptions[i].IPAM;
                var gateway = mgmtOptions[i].Gateway;
                if (ipam !== "") {
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex] = {};
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["to"] = [];
                    if(ipam.indexOf(":") !== -1) {
                        ipam = ipam.split(":");
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["to"][0] = ipam[0];
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["to"][1] = ipam[1];
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["to"][2] = ipam[2];
                    } else {
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["to"][0] = selectedDomain;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["to"][1] = selectedProject;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["to"][2] = ipam;
                    }
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"] = {};
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"] = [];
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0] = {};
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["subnet"] = {};
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["subnet"]["ip_prefix"] = ipBlock.split("/")[0];
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["subnet"]["ip_prefix_len"] = parseInt(ipBlock.split("/")[1]);
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["default_gateway"] = gateway;
                }

                for (var j = i + 1; typeof mgmtOptions[j] !== "undefined"; j++) {
                    var newIpam = mgmtOptions[j].IPAM;
                    var newIpBlock = mgmtOptions[j].IPBlock;
                    var gateway = mgmtOptions[j].Gateway;
                    if (newIpam == "") {
                        i++;
                        var subnetLen = vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"].length;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen] = {};
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"] = {};
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix"] = newIpBlock.split("/")[0];
                        if (null !== newIpBlock.split("/")[1] && "" !== newIpBlock.split("/")[1].trim() && isNumber(parseInt(newIpBlock.split("/")[1])))
                            vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix_len"]
                                = parseInt(newIpBlock.split("/")[1]);
                        else
                            vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix_len"] = 32;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["default_gateway"] = gateway;
                    } else {
                        break;
                    }
                }
                ipamIndex++;
            }
        }
        
        if(null !== vnConfig["virtual-network"]["network_ipam_refs"] && 
            typeof vnConfig["virtual-network"]["network_ipam_refs"] !== "undefined" &&
            vnConfig["virtual-network"]["network_ipam_refs"].length > 0) {
            for(var i=0; i<vnConfig["virtual-network"]["network_ipam_refs"].length; i++) {
                var vnIpamRef = vnConfig["virtual-network"]["network_ipam_refs"][i];
                var vnIpamFqn = vnIpamRef.to[0] + ":" + vnIpamRef.to[1] + ":" + vnIpamRef.to[2]; 
                var srTuples = $("#srTuples")[0].children;
                if (srTuples && srTuples.length > 0) {
                    for (var j = 0; j < srTuples.length; j++) {
                        var srTuple = $($(srTuples[j]).find("div")[0]).children();
                        var srIpam =$($(srTuple[0]).find("div.contrailDropdown")[1]).data("contrailDropdown").text();
                        if(srIpam.indexOf(":") === -1) {
                            srIpam = selectedDomain + ":" + selectedProject + ":" + srIpam;
                        }
                        if(srIpam === vnIpamFqn) {
                            if(typeof vnIpamRef["attr"]["host_routes"] === "undefined") {
                                vnIpamRef["attr"]["host_routes"] = {};
                                vnIpamRef["attr"]["host_routes"]["route"] = [];
                            }

                            vnIpamRef["attr"]["host_routes"]["route"]
                            [vnIpamRef["attr"]["host_routes"]["route"].length] =
                            {
                                "prefix" : $($(srTuple[1]).find("input")).val().trim(),
                                "next_hop" : null,
                                "next_hop_type" : null 
                            }
                        }
                    }
                }   
            }
        }

        var floatingIpPools = [];
        var fipTuples = $("#fipTuples")[0].children;
        if (fipTuples && fipTuples.length > 0) {
            for (var i = 0; i < fipTuples.length; i++) {
                var fipTuple = $($(fipTuples[i]).find("div")[0]).children();
                var poolName = $($(fipTuple[0]).find("input")).val();
                var projects=[];
                var lis = $(fipTuple[1]).find("li.select2-search-choice");
                if(lis && lis.length > 0) {
                    for(var j=0; j<lis.length; j++) {
                        var p = $(lis[j]).find("div")[0].innerHTML
                        projects.push(p);
                    }
                }
                floatingIpPools.push({FIPPoolName:poolName, FIPProjects:projects});
            }
        }

        if (floatingIpPools && floatingIpPools.length > 0) {
            vnConfig["virtual-network"]["router_external"] = true;
            vnConfig["virtual-network"]["floating_ip_pools"] = [];
            for (var i = 0; i < floatingIpPools.length; i++) {
                var fipPoolName = floatingIpPools[i].FIPPoolName;
                vnConfig["virtual-network"]["floating_ip_pools"][i] = {};
                vnConfig["virtual-network"]["floating_ip_pools"][i]["to"] = [];
                vnConfig["virtual-network"]["floating_ip_pools"][i]["to"][0] = selectedDomain;
                vnConfig["virtual-network"]["floating_ip_pools"][i]["to"][1] = selectedProject;
                vnConfig["virtual-network"]["floating_ip_pools"][i]["to"][2] = txtVNName.val();
                vnConfig["virtual-network"]["floating_ip_pools"][i]["to"][3] = fipPoolName;

                var projects = floatingIpPools[i].FIPProjects;
                if (projects && projects.length > 0) {
                    vnConfig["virtual-network"]["floating_ip_pools"][i]["projects"] = [];
                    for (var j = 0; j < projects.length; j++) {
                        vnConfig["virtual-network"]["floating_ip_pools"][i]["projects"][j] = {};
                        vnConfig["virtual-network"]["floating_ip_pools"][i]["projects"][j]["to"] = [];
                        vnConfig["virtual-network"]["floating_ip_pools"][i]["projects"][j]["to"][0] = selectedDomain;
                        vnConfig["virtual-network"]["floating_ip_pools"][i]["projects"][j]["to"][1] = projects[j];
                        var projectUUId = jsonPath(configObj, "$.projects[?(@.fq_name[1]=='" + projects[j] + "')]")[0].uuid;
                        vnConfig["virtual-network"]["floating_ip_pools"][i]["projects"][j]["uuid"] = projectUUId;
                    }
                }
            }
        } else {
            vnConfig["virtual-network"]["router_external"] = false;
        }

        var routeTargets = [];
        var rtTuples = $("#RTTuples")[0].children;
        if (rtTuples && rtTuples.length > 0) {
            for (var i = 0; i < rtTuples.length; i++) {
                var rtTuple = $($(rtTuples[i]).find("div")[0]).children();
                var rt = $($(rtTuple[0]).find("input")).val();
                var asn = $($(rtTuple[2]).find("input")).val();
                routeTargets.push({RouteTarget:rt + ":" + asn});
            }
        }        
        if (routeTargets && routeTargets.length > 0) {
            vnConfig["virtual-network"]["route_target_list"] = {};
            vnConfig["virtual-network"]["route_target_list"]["route_target"] = [];
            for (var i = 0; i < routeTargets.length; i++) {
                var routeTarget = routeTargets[i].RouteTarget;
                routeTarget = "target:" + routeTarget;
                vnConfig["virtual-network"]["route_target_list"]["route_target"][i] = routeTarget;
            }
        }
        
        var fwdMode = $("#ddFwdMode").val();
        var gvrConfig = configObj["global-vrouter-config"];
        if(null !== gvrConfig && typeof gvrConfig !== "undefined" &&
            null !== gvrConfig["vxlan_network_identifier_mode"] &&
            typeof gvrConfig["vxlan_network_identifier_mode"] !== "undefined" &&
            "configured" === gvrConfig["vxlan_network_identifier_mode"]) {        
            var vxLanId = parseInt($(txtVxLanId).val().trim());
            vnConfig["virtual-network"]["virtual_network_properties"] = {};
            vnConfig["virtual-network"]["virtual_network_properties"]
                ["vxlan_network_identifier"] = vxLanId;
        }
        if(typeof fwdMode !== "undefined" && "" !== fwdMode) {
            if(null === vnConfig["virtual-network"]["virtual_network_properties"] ||
                typeof vnConfig["virtual-network"]["virtual_network_properties"] === "undefined")
            vnConfig["virtual-network"]["virtual_network_properties"] = {};
            vnConfig["virtual-network"]["virtual_network_properties"]
                ["forwarding_mode"] = fwdMode;
        }

        if (txtVNName[0].disabled == true)
            mode = "edit";
        else
            mode = "add";

        console.log(JSON.stringify(vnConfig))
        if (mode === "add") {
            doAjaxCall("/api/tenants/config/virtual-networks", "POST", JSON.stringify(vnConfig),
                "createVNSuccessCb", "createVNFailureCb");
        }
        else if (mode === "edit") {
            var vnUUID = jsonPath(configObj, "$.virtual-networks[?(@.fq_name[2]=='" + txtVNName.val() + "')]")[0].uuid;
            doAjaxCall("/api/tenants/config/virtual-network/" + vnUUID, "PUT", JSON.stringify(vnConfig),
                "createVNSuccessCb", "createVNFailureCb", null, null, 120000);
        }
        windowCreateVN.modal("hide");
    });
}

function createFipoolEntry(fipool, len) {
    var inputTxtPoolName = document.createElement("input");
    inputTxtPoolName.type = "text";
    inputTxtPoolName.className = "span12";
    inputTxtPoolName.setAttribute("placeholder", "Pool Name");
    var divPoolName = document.createElement("div");
    divPoolName.className = "span3";
    divPoolName.appendChild(inputTxtPoolName);

    var selectProjects = document.createElement("div");
    selectProjects.className = "span12";
    selectProjects.setAttribute("placeholder", "Select Projects");
    var divProjects = document.createElement("div");
    divProjects.className = "span3";
    divProjects.appendChild(selectProjects);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendFipEntry(this);");
    iBtnAddRule.setAttribute("title", "Add FIP Pool below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteFipEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete FIP Pool");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divPoolName);
    divRowFluidMargin5.appendChild(divProjects);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.appendChild(divRowFluidMargin5);

    $(selectProjects).contrailMultiselect({
        dataTextField:"text",
        dataValueField:"value"
    });
    $(selectProjects).data("contrailMultiselect").setData($("#ddProjectSwitcher").data("contrailDropdown").getAllData());
    if (null !== fipool && typeof fipool !== "undefined") {
        var poolname = fipool.FIPPoolName;
        var projects = fipool.FIPProjects;
        $(inputTxtPoolName).val(poolname);
        $(selectProjects).data("contrailMultiselect").value(projects);
    }    
    return rootDiv;
}

function validateFipEntry() {
    var len = $("#fipTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var poolName =
                $($($($("#fipTuples").children()[i]).find(".span3")[0]).find("input")).val().trim();
            if (typeof poolName === "undefined" || poolName === "") {
                showInfoWindow("Enter Pool name", "Input required");
                return false;
            }
        }
    }
    return true;
}

function appendFipEntry(who, defaultRow) {
    if(validateFipEntry() === false)
        return false;

    var fipEntry = createFipoolEntry(null, $("#fipTuples").children().length);
    if (defaultRow) {
        $("#fipTuples").prepend($(fipEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(fipEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateVN",fipEntry,false);
}

function deleteFipEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearFipEntries() {
    var tuples = $("#fipTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#fipTuples").empty();
    }
}

function createIPAMEntry(ipamBlock, len) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var networkIpams = jsonPath(configObj, "$.network-ipams[*].fq_name");            
    var validIpams = [];
    for(var i=0; i<networkIpams.length; i++) {
        var ipam = networkIpams[i];
        if(ipam[0] === selectedDomain && ipam[1] === selectedProject) {
            validIpams[validIpams.length] = ipam[2];
        }
        else {
            if(checkSystemProject(ipam[1]))
                continue;
            else
                validIpams[validIpams.length] = ipam[0] + ":" + ipam[1] + ":" + ipam[2];
        }
    }
    if(validIpams && validIpams.length <= 0) {
        showInfoWindow("No IPAMs available.", "Error");
        return false;
    }

    var selectIpams = document.createElement("div");
    selectIpams.className = "span12 contrailDropdown";
    selectIpams.setAttribute("placeholder", "Select IPAM");
    var divIpam = document.createElement("div");
    divIpam.className = "span3";
    divIpam.appendChild(selectIpams);
    
    var inputTxtIPBlock = document.createElement("input");
    inputTxtIPBlock.type = "text";
    inputTxtIPBlock.className = "span12";
    inputTxtIPBlock.setAttribute("placeholder", "IP Block");
    inputTxtIPBlock.setAttribute("onblur", "autoPopulateGW(this)");
    var divIPBlock = document.createElement("div");
    divIPBlock.className = "span3";
    divIPBlock.appendChild(inputTxtIPBlock);

    var inputTxtGateway = document.createElement("input");
    inputTxtGateway.type = "text";
    inputTxtGateway.className = "span12";
    inputTxtGateway.setAttribute("placeholder", "Gateway");
    var divIPGateway = document.createElement("div");
    divIPGateway.className = "span3";
    divIPGateway.appendChild(inputTxtGateway);    

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendIPAMEntry(this);");
    iBtnAddRule.setAttribute("title", "Add IPAM below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteIPAMEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete IPAM");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divIpam);
    divRowFluidMargin5.appendChild(divIPBlock);
    divRowFluidMargin5.appendChild(divIPGateway);
    
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.className = 'rule-item';
    rootDiv.appendChild(divRowFluidMargin5);

    $(selectIpams).contrailDropdown({
        dropdownCssClass: 'select2-medium-width',
        change:checkSREntry
    });
    $(selectIpams).data("contrailDropdown").setData(validIpams);
    $(selectIpams).data("contrailDropdown").value(validIpams[0]);

    if (null !== ipamBlock && typeof ipamBlock !== "undefined") {
        $(selectIpams).data("contrailDropdown").value(ipamBlock.IPAM);
        $(inputTxtIPBlock).val(ipamBlock.IPBlock);
        $(inputTxtGateway).val(ipamBlock.Gateway);
    }    
    return rootDiv;
}

function appendIPAMEntry(who, defaultRow) {
    if(validateIPAMEntry() === false)
        return false;

    var ipamEntry = createIPAMEntry(null, $("#ipamTuples").children().length);
    if (defaultRow) {
        $("#ipamTuples").prepend($(ipamEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(ipamEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateVN",ipamEntry,false);

    var ipamTuples = $("#ipamTuples")[0].children;
    var existingIpams = [];
    if (ipamTuples && ipamTuples.length > 0) {
        for (var i = 0; i < ipamTuples.length; i++) {
            var ipamTuple = $($(ipamTuples[i]).find("div")[0]).children();
            var ipam = $(ipamTuple[0].children[1]).data("contrailDropdown").value();
            existingIpams.push(ipam);
        }
    }

    existingIpams = existingIpams.unique();
    var srTuples = $("#srTuples")[0].children;
    if (srTuples && srTuples.length > 0) {
        for (var i = 0; i < srTuples.length; i++) {
            var srTuple = $($(srTuples[i]).find("div")[0]).children();
            var srIpam = $(srTuple[0].children[1]).data("contrailDropdown")
            var existingValue = srIpam.value();
            srIpam.setData(existingIpams);
            srIpam.value(existingValue);
        }
    }
}

function deleteIPAMEntry(who) {
    var deletingIpamEntry = $($($(who).parent().parent().find("div.span3")[0]).find("div.contrailDropdown")[1]).data("contrailDropdown").value().trim();
    var howmany = 0;
    var srTuples = $("#srTuples")[0].children;
    if (srTuples && srTuples.length > 0) {
        for (var i = 0; i < srTuples.length; i++) {
            var srTuple = $($(srTuples[i]).find("div")[0]).children();
            var srIpam = $(srTuple[0].children[1]).data("contrailDropdown")
            var existingValue = srIpam.value().trim();
            if(existingValue === deletingIpamEntry) {
                var ipamTuples = $("#ipamTuples")[0].children;
                if (ipamTuples && ipamTuples.length > 0) {
                    for (var i = 0; i < ipamTuples.length; i++) {
                        var ipamTuple = $($(ipamTuples[i]).find("div")[0]).children();
                        var ipam = $(ipamTuple[0].children[1]).data("contrailDropdown").value().trim();
                        if(ipam === existingValue) {
                            howmany++;
                        }
                    }
                }
                if(howmany >= 1) {
                    showInfoWindow("Remove all the Host Route(s) with ipam '" + 
                        existingValue + "' before deleting this IPAM entry.", "Error");
                    return false;
                }
            }
        }
    }    
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearIPAMEntries() {
    var tuples = $("#ipamTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#ipamTuples").empty();
    }
}

function validateIPAMEntry() {
    var len = $("#ipamTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var ipblock = $($($($("#ipamTuples").children()[i]).find(".span3")[1]).find("input")[0]).val().trim();
            var gateway = $($($($("#ipamTuples").children()[i]).find(".span3")[2]).find("input")[0]).val().trim();
            if ("" === ipblock.trim() || !validip(ipblock.trim())) {
                showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx/xx format", "Invalid input in Address Management");
                return false;
            }
            if(ipblock.split("/").length != 2) {
                showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx/xx format", "Invalid input in Address Management");
                return false;
            }
            var subnetMask = parseInt(ipblock.split("/")[1]); 
            if(subnetMask > 30) {
                showInfoWindow("Subnet mask can not be greater than 30", "Invalid input in Address Management");
                return false;
            }

            if (validip(gateway.trim())) {
                if(gateway.split("/").length >= 2) {
                    showInfoWindow("Enter a valid Gateway IP address in xxx.xxx.xxx.xxx format", "Invalid input in Address Management");
                    return false;
                }
            } else {
                if("" !== gateway.trim()) {
                    showInfoWindow("Enter a valid Gateway IP address in xxx.xxx.xxx.xxx format", "Invalid input in Address Management");
                    return false;
                }
            }
        }
    }
    return true;
}

function checkSREntry(what) {
    var removedIpamEntry = what.removed.text;
    var srTuples = $("#srTuples")[0].children;
    if (srTuples && srTuples.length > 0) {
        for (var i = 0; i < srTuples.length; i++) {
            var srTuple = $($(srTuples[i]).find("div")[0]).children();
            var srIpam = $(srTuple[0].children[1]).data("contrailDropdown")
            var existingIpamInHostRoute = srIpam.value().trim();
            if(existingIpamInHostRoute === removedIpamEntry) {
                showInfoWindow("Remove all the Host Route(s) with ipam '" + 
                    existingIpamInHostRoute + "' before changing this IPAM entry.", "Error");
                $(what.currentTarget).data("contrailDropdown").value(removedIpamEntry);
                return false;
            }
        }
    }
}

function createRTEntry(routeTarget, len) {
    var inputTxtRT = document.createElement("input");
    inputTxtRT.type = "text";
    inputTxtRT.className = "span12";
    inputTxtRT.setAttribute("placeholder", "1-65534");
    var divRT = document.createElement("div");
    divRT.className = "span3";
    divRT.appendChild(inputTxtRT);

    var labelColon = document.createElement("span");
    labelColon.innerHTML = ":";
    var divColon = document.createElement("div");
    divColon.className = "span1";
    divColon.appendChild(labelColon);

    var inputTxtASN = document.createElement("input");
    inputTxtASN.type = "text";
    inputTxtASN.className = "span12";
    inputTxtASN.setAttribute("placeholder", "1-4294967295");
    var divASN = document.createElement("div");
    divASN.className = "span3";
    divASN.appendChild(inputTxtASN);

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendRTEntry(this);");
    iBtnAddRule.setAttribute("title", "Add Route Target below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteRTEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Route Target");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divRT);
    divRowFluidMargin5.appendChild(divColon);
    divRowFluidMargin5.appendChild(divASN);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.appendChild(divRowFluidMargin5);
    if (null !== routeTarget && typeof routeTarget !== "undefined") {
        var rt = routeTarget.RouteTarget.split(":");
        var rtNum = rt[0];
        var asn = rt[1];
        $(inputTxtRT).val(rtNum);
        $(inputTxtASN).val(asn);
    }    

    return rootDiv;
}

function validateRTEntry() {
    var len = $("#RTTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var asn =
                $($($($("#RTTuples").children()[i]).find(".span3")).find("input")[0]).val().trim();
            var rt =
                $($($($("#RTTuples").children()[i]).find(".span3")).find("input")[1]).val().trim();

            if (typeof asn === "undefined" || asn === "") {
                showInfoWindow("Enter ASN between 1 to 65534", "Input required");
                return false;
            } else if (isNumber(asn) && asn.indexOf(".") === -1) {
                asn = parseInt(asn);
                if (asn < 1 || asn > 65534) {
                    showInfoWindow("Enter ASN between 1 to 65534", "Input required");
                    return false;
                }
            } else if (isString(asn)) {
                if(!validip(asn)) {
                    showInfoWindow("Invalid IP for ASN.", "Input required");
                    return false;
                } else {
                    if(asn.indexOf("/") !== -1) {
                        showInfoWindow("Enter IP for ASN in xxx.xxx.xxx.xxx format.", "Input required");
                        return false;
                    }                   
                }
            }
            if (typeof rt === "undefined" || rt === "" || !isNumber(rt)) {
                showInfoWindow("Enter value between 1 to 4294967295", "Input required");
                return false;
            } else if (isNumber(rt)) {
                rt = parseInt(rt);
                if(isString(asn) && asn.indexOf("/") === -1 && validip(asn)) {
                    if (rt < 1 || rt > 65535) {
                        showInfoWindow("Enter value between 1 to 65535", "Input required");
                        return false;
                    }
                } else if(isNumber(asn) && (asn+"").indexOf(".") === -1) {
                    if (rt < 1 || rt > 4294967295) {
                        showInfoWindow("Enter value between 1 to 4294967295", "Input required");
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
function appendRTEntry(who, defaultRow) {
    if(validateRTEntry() === false)
        return false;
    var rtEntry = createRTEntry(null, $("#RTTuples").children().length);
    if (defaultRow) {
        $("#RTTuples").prepend($(rtEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(rtEntry, parentEl.nextSibling);
    }
    //if($(rootDiv)[0].getBoundingClientRect().height >= Math.abs(
    scrollUp("#windowCreateVN",rtEntry,false);
}

function deleteRTEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearRTEntries() {
    var tuples = $("#RTTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#RTTuples").empty();
    }
}

function createSREntry(staticRoute, len) {
    var selectIpamsSR = document.createElement("div");
    selectIpamsSR.className = "span12 contrailDropdown";
    selectIpamsSR.setAttribute("placeholder", "Select IPAM");
    var divIpam = document.createElement("div");
    divIpam.className = "span3";
    divIpam.appendChild(selectIpamsSR);
    
    var inputTxtSR = document.createElement("input");
    inputTxtSR.type = "text";
    inputTxtSR.className = "span12";
    inputTxtSR.setAttribute("placeholder", "Route Prefix");
    var divSR = document.createElement("div");
    divSR.className = "span3";
    divSR.appendChild(inputTxtSR);

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendSREntry(this);");
    iBtnAddRule.setAttribute("title", "Add Host Route below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteSREntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Host Route");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divIpam);
    divRowFluidMargin5.appendChild(divSR);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.appendChild(divRowFluidMargin5);
    
    var existingIpams = [];
    var ipamTuples = $("#ipamTuples")[0].children;
    if (ipamTuples && ipamTuples.length > 0) {
        for (var i = 0; i < ipamTuples.length; i++) {
            var ipamTuple = $($(ipamTuples[i]).find("div")[0]).children();
            var ipam = $(ipamTuple[0].children[1]).data("contrailDropdown").value();
            existingIpams.push(ipam);
        }
    }

    existingIpams = existingIpams.unique();
    if(existingIpams.indexOf("") !== -1) {
        existingIpams.splice(existingIpams.indexOf(""), 1);
    }

    $(selectIpamsSR).contrailDropdown();
    $(selectIpamsSR).data("contrailDropdown").setData(existingIpams);
    $(selectIpamsSR).data("contrailDropdown").value(existingIpams[0]);

    if (null !== staticRoute && typeof staticRoute !== "undefined") {
        $(selectIpamsSR).data("contrailDropdown").value(staticRoute.ipam);
        $(inputTxtSR).val(staticRoute.hostroute)
    }    
    return rootDiv; 
}

function validateSREntry() {
    var srTuples = $("#srTuples")[0].children;
    var len = srTuples.length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var srTuple = $($(srTuples[i]).find("div")[0]).children();
            var hostRoute = $($(srTuple[1]).find("input")).val().trim();
            if (typeof hostRoute === "undefined" || "" === hostRoute ||
                hostRoute.indexOf("/") === -1 || !validip(hostRoute)) {
                showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx/xx format", "Invalid input for Host Routes");
                return false;
            }
        }
    }
    return true;
}

function appendSREntry(who, defaultRow) {
    var ipamTuples = $("#ipamTuples")[0].children;
    if (ipamTuples.length <= 0) {
        showInfoWindow("Enter atleast one IPAM under Address Management", "Input required");
        return false;
    }
    if(validateSREntry() === false)
        return false;

    var srEntry = createSREntry(null, $("#srTuples")[0].children);
    if (defaultRow) {
        $("#srTuples").prepend($(srEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(srEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateVN",srEntry,false);
}

function deleteSREntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearSREntries() {
    var tuples = $("#srTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#srTuples").empty();
    }
}

function populateDomains(result) {
    if (result && result.domains && result.domains.length > 0) {
        var domains = [];
        for (i = 0; i < result.domains.length; i++) {
            var domain = result.domains[i];
            tmpDomain = {text:domain.fq_name[0], value:domain.uuid};
            domains.push(tmpDomain);
        }
        $("#ddDomainSwitcher").data("contrailDropdown").setData(domains);
        $("#ddDomainSwitcher").data("contrailDropdown").value(domains[0].value);
    }
    fetchProjects("populateProjects", "failureHandlerForGridVN");
}

function handleDomains() {
    //fetchDataForGridVN();
    //Get projects for the selected domain.
    fetchProjects("populateProjects", "failureHandlerForGridVN");
}

function populateProjects(result) {
    if (result && result.projects && result.projects.length > 0) {
        //var projects = jsonPath(result, "$.projects[*].fq_name[1]");
        var projects = [];
        for (i = 0; i < result.projects.length; i++) {
            var project = result.projects[i];
            tempProjectDetail = {text:project.fq_name[1], value:project.uuid};
            projects.push(tempProjectDetail);
        }
        
        $("#ddProjectSwitcher").contrailDropdown({
            dataTextField:"text",
            dataValueField:"value",
            change:handleProjects
        });
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        $("#ddProjectSwitcher").data("contrailDropdown").value(projects[0].value);
        var sel_project = getSelectedProjectObjNew("ddProjectSwitcher", "contrailDropdown");
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        setCookie("project", $("#ddProjectSwitcher").data("contrailDropdown").text());
    }
    fetchDataForGridVN();
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridVN();
}

function autoPopulateGW(me) {
    var ip = $(me).val();
    if(ip.indexOf("/") !== -1 && !isNaN(ip.split("/")[1])) {
        try {
            var ip_arrs = ip_range(ip, []);
            var default_gw = ip_arrs[ip_arrs.length - 1];
            $(me).parent().next().find("input").val(default_gw);
        } catch (e) {
            $(me).parent().next().find("input").val("");
        }
    }
}

function fetchDataForGridVN() {
    $("#cb_gridVN").attr("checked", false);
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridVN.showGridMessage('errorGettingData');
        return;
    }
    $("#gridVN").data("contrailGrid")._dataView.setData([]);
    configObj["virtual-networks"] = [];
    gridVN.showGridMessage('loading');
    idCount = 0;
    vnAjaxcount = vnAjaxcount+1;
    ajaxParam = $("#ddProjectSwitcher").data("contrailDropdown").value()+"_"+vnAjaxcount;
    doAjaxCall("/api/admin/config/get-data?type=virtual-network&count=4&fqnUUID="+$("#ddProjectSwitcher").data("contrailDropdown").value(),
        "GET", null, "successHandlerForGridVNLoop", "failureHandlerForGridVN", null, ajaxParam);
}

function successHandlerForGridVNLoop(result,cbparam){
    if(cbparam != ajaxParam){
        return;
    }
    if(result.more == true || result.more == "true"){
        
        doAjaxCall("/api/admin/config/get-data?type=virtual-network&count=4&fqnUUID="+ 
            $("#ddProjectSwitcher").data("contrailDropdown").value() +"&lastKey="+result.lastKey, 
            "GET", null, "successHandlerForGridVNLoop", "failureHandlerForGridVN", null, cbparam); 
    }
    successHandlerForGridVNRow(result);
}

function successHandlerForGridVN(result) {
    var uuids = jsonPath(result, "$..uuid");
    var getAjaxs = [];
    for (var i = 0; i < uuids.length; i++) {
        getAjaxs[i] = $.ajax({
            url:"/api/tenants/config/virtual-network/" + uuids[i],
            type:"GET"
        });
    }
    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            var results = arguments;
            successHandlerForGridVNRow(results);
        },
        function () {
            //If atleast one api fails
            var results = arguments;
            failureHandlerForGridVNRow(results);
        });
}

function failureHandlerForGridVN(result) {
    $("#btnCreateVN").addClass('disabled-link');
    gridVN.showGridMessage('errorGettingData');
}

function showRemoveWindow(rowIndex) {
    $.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Virtual Network delete</h6>',
       footer: [{
           title: 'Cancel',
           onclick: 'close',
       },
       {
           id: 'btnRemovePopupOK',
           title: 'Confirm',
           rowIdentifier: rowIndex,
           onclick: function(){
               var rowNum = this.rowIdentifier;
               var selected_row = $("#gridVN").data("contrailGrid")._dataView.getItem(rowNum);
               deleteVN([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
 }

function successHandlerForGridVNRow(result) {
    gridVN.removeGridMessage();
    var vnData = $("#gridVN").data("contrailGrid")._dataView.getItems();
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var networks = jsonPath(result, "$..virtual-network");
    for (var i = 0; i < networks.length; i++) {
        configObj["virtual-networks"].push(networks[i]);
        var vn = networks[i];
        var vnName = jsonPath(vn, "$.fq_name[2]");

        if (typeof vnName === "object" && vnName.length === 1)
            vnName = vnName[0];
        else
            vnName = "";

        var uuid = jsonPath(vn, "$.uuid");
        if (typeof uuid === "object" && uuid.length === 1)
            uuid = uuid[0];

        var policies = jsonPath(vn, "$.network_policy_refs[*]");
        var reorder_policies = reorderPolicies(policies)
        if (reorder_policies === false) {
            reorder_policies = "";
        }

        var subnets = jsonPath(vn, "$.network_ipam_refs[*].subnet.ipam_subnet");
        if (subnets === false) {
            subnets = "";
        }

        var ipams = jsonPath(vn, "$.network_ipam_refs[*].subnet.ipam");
        if (ipams === false) {
            ipams = "";
        } else {
            if(ipams && ipams.length > 0) {
                for(var j=0; j<ipams.length; j++) {
                    if(ipams[j][0] === selectedDomain && ipams[j][1] === selectedProject) {
                        ipams[j] = ipams[j][2];
                    } else {
                        ipams[j] = ipams[j][0] + ":" + ipams[j][1] + ":" + ipams[j][2];
                    }
                }
            }
        }
        var hostRoutes = [];
        var ipamRefs = jsonPath(vn, "$.network_ipam_refs[*]");
        
        for (var j = 0; j < ipamRefs.length; j++) {
            var host_routes = jsonPath(ipamRefs[j], "$..host_routes.route[*].prefix");
            var ipam = jsonPath(ipamRefs[j], "$..subnet.ipam[*]");
            if(selectedDomain === ipam[0] &&
                selectedProject === ipam[1]) {
                ipam = ipam[2];
            } else {
                ipam = ipam.join(":");
            }
            if(false !== host_routes) {
                if(host_routes.length > 0) {
                    host_routes = host_routes.join(", ");
                }
                hostRoutes.push({"ipam":ipam, "hostroute" : host_routes});
            }
        }
        var gateways = jsonPath(vn, "$.network_ipam_refs[*].subnet.default_gateway");
        if (gateways === false) {
            gateways = "";
        }
        
        var fips = jsonPath(vn, "$.floating_ip_pools[*].to[3]");
        if (fips === false) {
            fips = "";
        }
        var fipoolProjects = jsonPath(vn, "$.floating_ip_pools[*]");
        if (fipoolProjects === false) {
            fipoolProjects = "";
        }

        var routeTargets = jsonPath(vn, "$.route_target_list.route_target[*]");
        if (routeTargets === false) {
            routeTargets = "";
        }
        
        var fwdMode = jsonPath(vn, "$.virtual_network_properties.forwarding_mode");
        if (fwdMode !== false && typeof fwdMode !== "undefined" && fwdMode.length > 0) {
            fwdMode = fwdMode[0];
            if(fwdMode === "l2_l3" || fwdMode === null) {
                fwdMode = "L2 and L3";
            } else if(fwdMode === "l2") {
                fwdMode = "L2 Only";
            }
        } else {
            fwdMode = "";
        }
        
        var vxlanid = jsonPath(vn, "$.virtual_network_properties.vxlan_network_identifier");
        if (vxlanid !== false && typeof vxlanid !== "undefined" && vxlanid.length > 0) {
            vxlanid = vxlanid[0];
            if(null === vxlanid) {
                vxlanid = "Automatic";
            } 
        } else {
            vxlanid = "Automatic";
        }
        if(vn.fq_name[1] == selectedProject){
            vnData.push({"id":idCount++, "Network":vnName, "AttachedPolicies":reorder_policies, "IPBlocks":subnets, "HostRoutes":hostRoutes, "Ipams":ipams, "Gateways": gateways, "FloatingIPs":fips, "FloatingIPPools":fipoolProjects, "RouteTargets":routeTargets, "ForwardingMode" : fwdMode, "VxLanId": vxlanid, NetworkUUID:uuid});
        }
    }
    if(result.more == true || result.more == "true"){
        gridVN.showGridMessage('loading');
    } else {
        if(!vnData || vnData.length<=0)
            gridVN.showGridMessage('empty');
    }
    $("#gridVN").data("contrailGrid")._dataView.setData(vnData);
}

function reorderPolicies(policies){
    
    if(policies === false){
        return false;
    }
    if(policies.length === 0) {
        return [];
    }
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var reordered = [];
    if(policies.length === 1) {
        if(selectedDomain === policies[0].to[0] && selectedProject === policies[0].to[1]) {
            reordered.push(policies[0].to[2]);  
        } else {
            reordered.push(policies[0].to.join(":"));
        }
        return reordered;
    }
    for(var j=0; j<policies.length-1; j++) {
        for(var i=j; i<policies.length; i++) {
            if(isNumber(policies[i].attr.sequence.major) && isNumber(policies[j].attr.sequence.major) ){
                if(Number(JSON.stringify(policies[j].attr.sequence.major)) >  Number(JSON.stringify(policies[i].attr.sequence.major)) ){
                    var pol = policies[j];
                    policies[j] = policies[i];
                    policies[i] = pol;
                }
            }
        }
    }
    for(var k=0; k<policies.length; k++) {
        if(selectedDomain === policies[k].to[0] && selectedProject === policies[k].to[1]) {
            reordered.push(policies[k].to[2]);  
        } else {
            reordered.push(policies[k].to.join(":"));
        }        
    }
    return reordered;
}

function failureHandlerForGridVNRow(result, cbParam) {
    gridVN.showGridMessage('errorGettingData');
}

function initGridVNDetail(e) {
    var detailRow = e.detailRow;
}

function closeCreateVNWindow() {
    clearValuesFromDomElements();
}

function clearValuesFromDomElements() {
    mode = "";
    txtVNName.val("");
    txtVxLanId.val("");
    txtVNName[0].disabled = false;
    $("#ddFwdMode").data("contrailDropdown").value("l2_l3");
    msNetworkPolicies.data("contrailMultiselect").value("");

    clearFipEntries();
    clearRTEntries();
    clearSREntries();
    clearIPAMEntries();
}

function setVxLanIdAuto() {
    $(txtVxLanId).val("");
    $(txtVxLanId)[0].setAttribute("placeholder", "Automatic");
    $(txtVxLanId)[0].disabled = 'disabled';
}

function compare(a,b) {
    if (a.IPAM < b.IPAM)
        return -1;
    if (a.IPAM > b.IPAM)
        return 1;
    return 0;
}

function showVNEditWindow(mode, rowIndex) {
    if($("#btnCreateVN").hasClass('disabled-link')) {
        return;
    }
    $("#widgetFip").addClass("collapsed");
    $("#widgetRT").addClass("collapsed");
    $("#widgetStaticRoutes").addClass("collapsed");
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        return;
    }

    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/policys",
        type:"GET"
    });

    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/ipams",
        type:"GET"
    });

    getAjaxs[2] = $.ajax({
        url:"/api/tenants/config/global-vrouter-config",
        type:"GET"
    });
    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            clearValuesFromDomElements();
            var results = arguments;
            var networkPolicies = jsonPath(results[0][0], "$.network-policys[*]");
            var nps = [];
            configObj["network-policys"] = [];
            var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
            var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
            if (null !== networkPolicies && typeof networkPolicies === "object" && networkPolicies.length > 0) {
                for (var i = 0; i < networkPolicies.length; i++) {
                    configObj["network-policys"][i] = {};
                    configObj["network-policys"][i] = networkPolicies[i];
                    var domain = networkPolicies[i]["fq_name"][0];
                    var project = networkPolicies[i]["fq_name"][1];
                    if(domain === selectedDomain && project === selectedProject) {
                        nps[nps.length] = networkPolicies[i]["fq_name"][2];
                    } else {
                        nps[nps.length] = networkPolicies[i]["fq_name"].join(":");
                    }
                }
            }
            msNetworkPolicies.data("contrailMultiselect").setData(nps);
            
            var nwIpams = jsonPath(results[1][0], "$.network-ipams[*]");
            if (null !== nwIpams && typeof nwIpams === "object" && nwIpams.length > 0) {
                configObj["network-ipams"] = [];
                for (var i = 0; i < nwIpams.length; i++) {
                    configObj["network-ipams"][i] = {};
                    configObj["network-ipams"][i] = nwIpams[i];
                }
            }

            var gvrConfig = jsonPath(results[2][0], "$.global-vrouter-config");
            if(null !== gvrConfig && typeof gvrConfig !== "undefined" &&
                gvrConfig.length > 0) {
                gvrConfig = gvrConfig[0];
                configObj["global-vrouter-config"] = {};
                configObj["global-vrouter-config"] = gvrConfig;
                if(null !== gvrConfig["vxlan_network_identifier_mode"] && 
                    typeof gvrConfig["vxlan_network_identifier_mode"] !== "undefined") {
                    if("automatic" === gvrConfig["vxlan_network_identifier_mode"]) {
                        setVxLanIdAuto();
                    }
                } else {
                    //Set default 'automatic' for VxLANIdentifierMode
                    setVxLanIdAuto();
                }
            } else {
                setVxLanIdAuto();
            }
            var validIpams = [];
            var networkIpams = jsonPath(results[1][0], "$.network-ipams[*].fq_name");
            for(var i=0; i<networkIpams.length; i++) {
                var ipam = networkIpams[i];
                if(ipam[0] === selectedDomain && ipam[1] === selectedProject) {
                    validIpams[validIpams.length] = ipam[2];
                }
                else {
                    if(checkSystemProject(ipam[1]))
                        continue;
                    else
                        validIpams[validIpams.length] = ipam[0] + ":" + ipam[1] + ":" + ipam[2];
                }
            }
            if (mode === "add") {
                windowCreateVN.find('h6.modal-header-title').text('Create Network');
                $(txtVNName).focus();
            } else if (mode === "edit") {
                var selectedRow = $("#gridVN").data("contrailGrid")._dataView.getItem(rowIndex);
                if(null === selectedRow || typeof selectedRow === "undefined" || {} === selectedRow ||
                    [] === selectedRow || "" === selectedRow) {
                    return false;
                }
                txtVNName.val(selectedRow.Network);
                txtVNName[0].disabled = true;
                windowCreateVN.find('h6.modal-header-title').text('Edit Network ' + selectedRow.Network);
                var rowId = selectedRow["id"];
                var selectedVN = configObj["virtual-networks"][rowId];

                var policies = jsonPath(selectedVN, "$.network_policy_refs[*]");
                var reordered_policies = reorderPolicies(policies);
                if (reordered_policies && reordered_policies.length > 0)
                    msNetworkPolicies.data("contrailMultiselect").value(reordered_policies);
                else
                    msNetworkPolicies.data("contrailMultiselect").value("");

                var ipams = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.ipam");
                var ipBlocks = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.ipam_subnet");
                var gateways = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.default_gateway");
                if (ipams && ipams.length > 0) {
                    var existing = [];
                    for (var i = 0; i < ipams.length; i++) {
                        var ipblock = ipBlocks[i];
                        var ipam = ipams[i];
                        var gateway = gateways[i];
                        if(selectedDomain === ipam[0] && selectedProject === ipam[1])
                            existing.push({"IPBlock":ipblock, "IPAM":ipam[2], "Gateway":gateway});
                        else 
                            existing.push({"IPBlock":ipblock, "IPAM":ipam.join(":"), "Gateway":gateway});
                    }
                    for(var k=0; k<existing.length; k++) {
                        var ipamEntry = createIPAMEntry(existing[k], $("#ipamTuples").children().length);
                        $("#ipamTuples").append($(ipamEntry));
                    }
                }

                //Host Routes
                var ipamRefs = jsonPath(selectedVN, "$.network_ipam_refs[*]");
                for (var j = 0; j < ipamRefs.length; j++) {
                    var host_routes = jsonPath(ipamRefs[j], "$..host_routes.route[*]");
                    var ipam = jsonPath(ipamRefs[j], "$..subnet.ipam[*]");
                    if(selectedDomain === ipam[0] &&
                        selectedProject === ipam[1]) {
                        ipam = ipam[2];
                    } else
                        ipam = ipam.join(":");
                    if(false !== host_routes) {
                        for(var k=0; k<host_routes.length; k++) {
                            var srEntry = createSREntry({"ipam":ipam, "hostroute" : host_routes[k].prefix}, 
                                    $("#srTuples").children().length);
                            $("#srTuples").append($(srEntry));
                        }
                    }
                }

                var poolNames = [];
                var floatingIPPools = jsonPath(selectedVN, "$.floating_ip_pools[*]");
                if (floatingIPPools && floatingIPPools.length > 0) {
                    var fipPools = [];
                    for (var i = 0; i < floatingIPPools.length; i++) {
                        var fipPool = floatingIPPools[i];
                        poolNames[i] = jsonPath(fipPool, "$.to[3]")[0];
                        var projects = jsonPath(fipPool, "$.projects[*].uuid");
                        if (null === projects || typeof projects === "undefined" 
                            || projects == false) {
                            projects = [];
                        }
                        fipPools.push({"FIPPoolName":poolNames[i], "FIPProjects":projects});
                    }
                }
                if(fipPools && fipPools.length > 0) {
                    for(var i=0; i<fipPools.length; i++) {
                        var fipPool = fipPools[i];
                        var fipEntry = createFipoolEntry(fipPool, i);
                        $("#fipTuples").append(fipEntry);
                    }
                }
                
                var routeTargets = jsonPath(selectedVN, "$.route_target_list.route_target[*]");
                if (routeTargets && routeTargets.length > 0) {
                    var rts = [];
                    for (var i = 0; i < routeTargets.length; i++) {
                        routeTargets[i] = routeTargets[i].split("target:")[1];
                        rts.push({"RouteTarget":routeTargets[i]});
                    }
                    if(rts && rts.length > 0) {
                        for(var i=0; i<rts.length; i++) {
                            var rt = rts[i];
                            var rtEntry = createRTEntry(rt, i);
                            $("#RTTuples").append(rtEntry);
                        }
                    }
                }
                if(null !== selectedVN["virtual_network_properties"] &&
                    typeof selectedVN["virtual_network_properties"] !== "undefined") {
                    var vnProps = selectedVN["virtual_network_properties"];
                    if(null !== vnProps["vxlan_network_identifier"] &&
                        typeof vnProps["vxlan_network_identifier"] && 
                        !isNaN(vnProps["vxlan_network_identifier"])) {
                        $(txtVxLanId).val(vnProps["vxlan_network_identifier"]); 
                    }
                    if(null !== vnProps["forwarding_mode"] &&
                        typeof vnProps["forwarding_mode"] && 
                        "" !== vnProps["forwarding_mode"].trim()) {
                        $("#ddFwdMode").data("contrailDropdown").value(vnProps["forwarding_mode"]);
                    }
                }
            }
        },
        function () {
            //If atleast one api fails
            var results = arguments;

        });
    windowCreateVN.modal("show");
    windowCreateVN.find('.modal-body').scrollTop(0);
}

function createVNSuccessCb() {
    gridVN.showGridMessage('loading');    
    fetchDataForGridVN();
}

function createVNFailureCb() {
    gridVN.showGridMessage('loading');
    fetchDataForGridVN();
}

function getAssignedProjectsForIpam(fips) {
    var aps = jsonPath(fips, "$.projects[*].to");
    var ap = [];
    if (isSet(aps) && aps !== false) {
        for (var i = 0; i < aps.length; i++) {
            ap[i] = aps[i][0] + ":" + aps[i][1];
        }
    }
    if(ap.length > 0) {
        return "(" + ap.toString() + ")";   
    }
    return "";
}

function validate() {
    var vnName = txtVNName.val().trim();
    if (typeof vnName === "undefined" || vnName === "") {
        showInfoWindow("Enter a valid network name", "Input required");
        return false;
    }
    if(validateRTEntry() === false || 
        validateFipEntry() === false ||
        validateSREntry() === false ||
        validateIPAMEntry() === false)
        return false;

    var vxlan = txtVxLanId.val().trim();
    var gvrConfig = configObj["global-vrouter-config"];
    if(null !== gvrConfig && typeof gvrConfig !== "undefined" &&
        null !== gvrConfig["vxlan_network_identifier_mode"] &&
        typeof gvrConfig["vxlan_network_identifier_mode"] !== "undefined" &&
        "configured" === gvrConfig["vxlan_network_identifier_mode"]) {
        if (null === vxlan || typeof vxlan === "undefined" ||
            vxlan === "" || isNaN(vxlan) || parseInt(vxlan) < 0 || 
            parseInt(vxlan) > 1048575) {
            showInfoWindow("Enter VxLAN identifier between 0 to 1048575 under Advanced Options.", "Input required");
            return false;
        }
    }
    return true;
}

function destroy() {
    ddDomain = $("#ddDomainSwitcher").data("contrailDropdown");
    if(isSet(ddDomain)) {
        ddDomain.destroy();
        ddDomain = $();
    }

    ddProject = $("#ddProjectSwitcher").data("contrailDropdown");
    if(isSet(ddProject)) {
        ddProject.destroy();
        ddProject = $();
    }

    ddFwdMode = $("#ddFwdMode").data("contrailDropdown");
    if(isSet(ddFwdMode)) {
        ddFwdMode.destroy();
        ddFwdMode = $();
    }
    
    msNetworkPolicies = $("#msNetworkPolicies").data("contrailMultiselect");
    if(isSet(msNetworkPolicies)) {
        msNetworkPolicies.destroy();
        msNetworkPolicies = $();
    }

    gridVN = $("#gridVN").data("contrailGrid");
    if(isSet(gridVN)) {
        gridVN.destroy();
        $("#gridVN").empty();
        gridVN = $();
    }

    var btnCommonAddIpam = $("#btnCommonAddIpam");
    if(isSet()) {
        btnCommonAddIpam.remove();
        btnCommonAddIpam = $();
    }

    btnCreateVN = $("#btnCreateVN");
    if(isSet(btnCreateVN)) {
        btnCreateVN.remove();
        btnCreateVN = $();
    }

    btnDeleteVN = $("#btnDeleteVN");
    if(isSet(btnDeleteVN)) {
        btnDeleteVN.remove();
        btnDeleteVN = $();
    }

    btnCreateVNCancel = $("#btnCreateVNCancel");
    if(isSet(btnCreateVNCancel)) {
        btnCreateVNCancel.remove();
        btnCreateVNCancel = $();
    }

    btnCreateVNOK = $("#btnCreateVNOK");
    if(isSet(btnCreateVNOK)) {
        btnCreateVNOK.remove();
        btnCreateVNOK = $();
    }

    btnRemovePopupOK = $("#btnRemovePopupOK");
    if(isSet(btnRemovePopupOK)) {
        btnRemovePopupOK.remove();
        btnRemovePopupOK = $();
    }

    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    if(isSet(btnRemovePopupCancel)) {
        btnRemovePopupCancel.remove();
        btnRemovePopupCancel = $();
    }

    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    if(isSet(btnCnfRemoveMainPopupOK)) {
        btnCnfRemoveMainPopupOK.remove();
        btnCnfRemoveMainPopupOK = $();
    }

    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");
    if(isSet(btnCnfRemoveMainPopupCancel)) {
        btnCnfRemoveMainPopupCancel.remove();
        btnCnfRemoveMainPopupCancel = $();
    }

    txtVNName = $("#txtVNName");    
    if(isSet(txtVNName)) {
        txtVNName.remove();
        txtVNName = $();
    }

    txtVxLanId = $("#txtVxLanId");
    if(isSet(txtVxLanId)) {
        txtVxLanId.remove();
        txtVxLanId = $();
    }

    windowCreateVN = $("#windowCreateVN");
    if(isSet(windowCreateVN)) {
        windowCreateVN.remove();
        windowCreateVN = $();
    }

    confirmRemove = $("#confirmRemove");
    if(isSet(confirmRemove)) {
        confirmRemove.remove();
        confirmRemove = $();
    }

    confirmMainRemove = $("#confirmMainRemove");
    if(isSet(confirmMainRemove)) {
        confirmMainRemove.remove();
        confirmMainRemove = $();
    }

    gridVNDetailTemplate = $("#gridVNDetailTemplate");
    if(isSet(gridVNDetailTemplate)) {
        gridVNDetailTemplate.remove();
        gridVNDetailTemplate = $();
    }

    var vnConfigTemplate = $("#vn-config-template");
    if(isSet(vnConfigTemplate)) {
        vnConfigTemplate.remove();
        vnConfigTemplate = $();
    }
}
