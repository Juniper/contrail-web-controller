/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

virtualnetworkConfigObj = new VirtualNetworkConfig();

//Prepend the URL with vCenter in case of vCenter orchestration mode
function getConfigURL(url) {
    if(isVCenter()) {
        if(url.match(/(\/api\/tenants\/config\/virtual-network\/)|(\/api\/tenants\/config\/virtual-networks)/) != null)
        // if(["/api/tenants/config/virtual-network/",'/api/tenants/config/virtual-networks'].indexOf(url) > -1)
            return '/vcenter' + url;
    }
    return url;
}

function VirtualNetworkConfig() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject, ddFwdMode, ddAdminState;

    //Comboboxes

    //Grids
    var gridVN;

    //Buttons
    var btnCreateVN, btnDeleteVN,
        btnCreateVNCancel, btnCreateVNOK, btnRemovePopupOK, 
        btnRemovePopupCancel,btnCnfRemoveMainPopupOK,
        btnCnfRemoveMainPopupCancel;

    //Textboxes
    var txtVNName, txtVxLanId, txtDisName;

    //Multiselects
    var msNetworkPolicies, msPhysicalRouters;

    //Windows
    var windowCreateVN, confirmRemove, confirmMainRemove;

    var gridVNDetailTemplate;

    //Misc
    var mode = "";
    var vnAjaxcount = 0;
    var idCount = 0;
    var ajaxParam;
    var dynamicID;
    var selectedProuters;
    var vxlan_identifier_mode;

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
    this.handleGw = handleGw;
    this.handleDNS = handleDNS;
    this.getDNSStatus = getDNSStatus;
    this.getAllDNSServer = getAllDNSServer;
    this.dynamicID = dynamicID;
    this.vxlan_identifier_mode = vxlan_identifier_mode;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#vn-config-template").html());
    $(contentContainer).empty();
    $(contentContainer).html(configTemplate);
    var createVNTemplate = Handlebars.compile($("#create-vn-template").html());
    $('body').append(createVNTemplate);    
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
    dynamicID = 0;
    vxlan_identifier_mode = "automatic";
    $("#gridVN").contrailGrid({
        header : {
            title : {
                text : 'Networks',
            },
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
                minWidth : 120,
                sortable: true,
                formatter: function(r, c, v, cd, dc) {
                    if(dc.displayName !== dc.Network) {
                        return dc.Network + '*';
                    } else {
                        return dc.Network;
                    }
                }
            },
            {
                id: "IPBlocks",
                field: "IPBlocks",
                name: "Subnets",
                minWidth : 100,
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
                           ' more)</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                }
            },
            {
                id: "AttachedPolicies",
                field: "AttachedPolicies",
                name: "Attached Policies",
                minWidth : 200,
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
                           ' more)</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                }
            },
            {
                id: "Shared",
                field: "Shared",
                name: "Shared",
                minWidth : 60,
                sortable: true
            },
            {
                id: "adminState",
                field: "adminState",
                name: "Admin State",
                minWidth : 60,
                sortable: true
            }]
        },
        body : {
            options : {
                checkboxSelectable: {
                    enableRowCheckbox: function(dc) {
                         return (dc.enableControles == true);
                    },
                    onNothingChecked: function(e){
                        $('#btnDeleteVN').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteVN').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                /*actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showVNEditWindow('edit',rowIndex);
                        }
                    }
                ],*/
                actionCell: function(dc){
                    if(dc.enableControles == true){
                        return [{
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
                        }];
                    } else{
                         return [];
                    }
                },
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
    txtDisName = $("#txtDisName");
    txtVxLanId = $("#txtVxLanId");
    vnAjaxcount = 0;

    ddFwdMode = $("#ddFwdMode").contrailDropdown({
        data: [{id:"l2_l3", text:'L2 and L3'}, {id:"l2", text:'L2 Only'}, {id:"l3", text:'L3 Only'}]
    });

    ddAdminState = $("#ddAdminState").contrailDropdown({
        data: [{id:"true", text:'Up'}, {id:"false", text:'Down'}]
    });

    msNetworkPolicies = $("#msNetworkPolicies").contrailMultiselect({
        placeholder: "Select Policies...",
        dataTextField:"text",
        dataValueField:"value",
        dropdownCssClass: 'select2-medium-width'
    });
    
    msPhysicalRouters = $("#msPhysicalRouters").contrailMultiselect({
        placeholder: "Select Physical Routers...",
        dataTextField:"text",
        dataValueField:"value",
        dropdownCssClass: 'select2-medium-width'
    });

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
    windowCreateVN = $("#windowCreateVN");
    windowCreateVN.on("hide", closeCreateVNWindow);
    windowCreateVN.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function deleteVN(selected_rows) {
    var deleteAjaxs = [];
    if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        // selected_rows[0]['Network'] = 'vn2';
        cbParams.url = getConfigURL("/api/tenants/config/virtual-network/"); 
        cbParams.urlField = "NetworkUUID";
        cbParams.fetchDataFunction = "fetchDataForGridVN";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting networks - ";
        cbParams.errorField = "Network";
        if(isVCenter())
            cbParams.timeout = 120000;
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
                if(returnString != "") returnString += "&nbsp;&nbsp;";
                returnString += vnData.FloatingIPs[i] + " " + getAssignedProjectsForIpam(vnData.FloatingIPPools[i]) + "<br>";
            }
            if(returnString.trim() == "") returnString = "-";
        }
        return returnString;
    });
    Handlebars.registerHelper("showSubnet",function(allSubnets,options) {
        var returnHtml = '';
        for(k=0;k<allSubnets.length;k++){
            if(k%2 == 1){    
                returnHtml += '<div class="row-fluid bgCol">';
            } else {
                returnHtml += '<div class="row-fluid">';
            }
            returnHtml += '<div class="span5">' +allSubnets[k]["ipam"] +' </div>';
            returnHtml += '<div class="span4"><div class="span5">' +allSubnets[k]["CIDR"] +'</div>';
            returnHtml += '<div class="span4">' +allSubnets[k]["default_gateway"] +'</div>';
            returnHtml += '<div class="span3">' +allSubnets[k]["DNS"] +'</div></div>';
            returnHtml += '<div class="span3"><div class="span4">' +allSubnets[k]["DHCPEnabled"] +'</div>';
            returnHtml += '<div class="span8">' +allSubnets[k]["AllocationPool"] +'</div>';
            returnHtml += '</div></div>';
        }
        return returnHtml;
    });
    Handlebars.registerHelper("showStaticIPAddressing",function(staticIPAddressing,options) {
        var returnHtml = '';
        if(isVCenter()) {
            returnHtml += '<div class="row-fluid">';
            returnHtml += '<span class="span2"><label>Static IP Addressing</label></span>';
            returnHtml += '<span class="span10">: ' +  staticIPAddressing + '</span>';
            returnHtml += '</div>';
        }
        return returnHtml;
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
        if($(this).hasClass('disabled-link')) { 
            return;
        }     
        if (validate() !== true)
            return;
        if (txtVNName[0].disabled == true){
            mode = "edit";
        } else {
            txtVNName.val($("#txtDisName").val());
            mode = "add";
        }
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
        
        vnConfig["virtual-network"]["display_name"] = $("#txtDisName").val();

        vnConfig["virtual-network"]["id_perms"] = {};
        vnConfig["virtual-network"]["id_perms"]["enable"] = JSON.parse($("#ddAdminState").data("contrailDropdown").value());
        
        var policies = $("#msNetworkPolicies").data("contrailMultiselect").getSelectedData();
        if (policies && policies.length > 0) {
            var currentVn = jsonPath(configObj, "$.virtual-networks[?(@.fq_name[2]=='" + txtVNName.val().trim() + "')]");
            vnConfig["virtual-network"]["network_policy_refs"] = [];
            for (var i = 0; i < policies.length; i++) {
                vnConfig["virtual-network"]["network_policy_refs"][i] = {};
                vnConfig["virtual-network"]["network_policy_refs"][i]["attr"] = {};
                var tmpPolicy = (policies[i].value).split(":");
                var currentPolicy = null;
                if(tmpPolicy.length > 0){
                    currentPolicy = jsonPath(currentVn, "$..network_policy_refs[?(@.to[0]=='" + tmpPolicy[0] + "' && " +
                    "@.to[1]=='" + tmpPolicy[1] + "' && @.to[2]=='" + tmpPolicy[2] + "')]");
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"] = [];
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][0] = tmpPolicy[0];
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][1] = tmpPolicy[1];
                    vnConfig["virtual-network"]["network_policy_refs"][i]["to"][2] = tmpPolicy[2];
                }
                if(currentPolicy && currentPolicy.length > 0) {
                    currentPolicy = currentPolicy[0];
                    var currAttr = currentPolicy.attr;
                    vnConfig["virtual-network"]["network_policy_refs"][i]["attr"]["timer"] = currAttr.timer;
                }
            }
        }

        var allDNSServerArr = getAllDNSServer();
        var currentHostRout = [];
        var srTuples = $("#srTuples")[0].children;
        if (srTuples && srTuples.length > 0) {
            for (var j = 0; j < srTuples.length; j++) {
                var srTuple = $($(srTuples[j]).find("div")[0]).children();
                var currentHostRoutText = ($($(srTuple[0]).find("input")).val().trim());
                var currentNextHopText = null;
                if(($($(srTuple[1]).find("input")).val().trim()) != "")
                    currentNextHopText = ($($(srTuple[1]).find("input")).val().trim());
                currentHostRout.push({"prefix" : currentHostRoutText,"next_hop" : currentNextHopText, "next_hop_type" : null });
            }
        }
        var mgmtOptions = [];
        var ipamTuples = $("#ipamTuples")[0].children;
        if (ipamTuples && ipamTuples.length > 0) {
            var ipamList = [];            
            for (var i = 0; i < ipamTuples.length; i++) {
                var id = getID(String($("#ipamTuples").children()[i].id));
                var cidr = $("#ipamTuples_"+id+"_txtCIDR").val().trim();
                var subnetuuidval = $("#ipamTuples_"+id+"_hiddenSubnetUUID").val().trim();
                var currentIpam = $("#ipamTuples_"+id+"_ddSelIpam").data("contrailDropdown").value().trim();
                var allocPoolVal = $("#ipamTuples_"+id+"_txtAllocPool").val().trim();
                var enableDHCP = $("#ipamTuples_"+id+"_chkDHCP")[0].checked;
                var enableDNS = $("#ipamTuples_"+id+"_chkDNS")[0].checked;
                var currentGateway = $("#ipamTuples_"+id+"_txtGateway").val().trim();
                var allocation_pools = [];
                var addrFromStart = true;
                var finalHR = [];
                var finalSubnet = [];
                var DNSServer = formatAllDNSServer(allDNSServerArr, enableDNS);
                if( typeof  allocPoolVal !== null && allocPoolVal !== "") {
                    var tempAllocPools = allocPoolVal.split("\n");                    
                    for(var inc = 0; inc < tempAllocPools.length ; inc++){
                        var ips = tempAllocPools[inc].split("-");
                        if(ips.length == 2)
                            allocation_pools[inc] = {"start":ips[0].trim(),"end":ips[1].trim()};
                         else if(ips.length == 1)
                            allocation_pools[inc] = {"start":ips[0].trim(),"end":ips[0].trim()};
                    }
                }

                if(isIPv6(cidr)){
                    finalHR = [];
                    finalDNSServer = DNSServer;
                } else if(isIPv4(cidr)){
                    finalHR = [];
                    for(hrInc = 0;hrInc < currentHostRout.length; hrInc++){
                        if(isIPv4(currentHostRout[hrInc].next_hop)){
                            finalHR.push(currentHostRout[hrInc]);
                        }
                    }
                    finalDNSServer = [];
                    var IPv4DNSs = jsonPath(DNSServer, "$.[?(@.dhcp_option_name=='6')]");
                    if(IPv4DNSs !== false && IPv4DNSs.length === 1) {
                        IPv4DNSs = IPv4DNSs[0];
                        finalDNSServer.push(IPv4DNSs);
                    }
                }
                if(ipamList.lastIndexOf(currentIpam) === -1) {
                    mgmtOptions.splice(i, 0, {IPAM: currentIpam, CIDR:cidr, Gateway:currentGateway,EnableDHCP : enableDHCP,AllocPool:allocation_pools,addrStart : addrFromStart , hostRoute:finalHR,dNSServert:finalDNSServer, subnetuuid:subnetuuidval});
                    ipamList.splice(i, 0, currentIpam);
                } else {
                    var lastPos = ipamList.lastIndexOf(currentIpam);
                    mgmtOptions.splice(lastPos+1, 0, {IPAM: "", CIDR:cidr, Gateway:currentGateway,EnableDHCP : enableDHCP , AllocPool:allocation_pools,addrStart : addrFromStart ,hostRoute:finalHR,dNSServert:finalDNSServer, subnetuuid:subnetuuidval});
                    ipamList.splice(lastPos+1, 0, currentIpam);
                }
            }
        }

        if (mgmtOptions && mgmtOptions.length > 0) {
            vnConfig["virtual-network"]["network_ipam_refs"] = [];
            var ipamIndex = 0;
            for (var i = 0; i < mgmtOptions.length; i++) {
                var cidr = mgmtOptions[i].CIDR;
                var ipam = mgmtOptions[i].IPAM;
                var gateway = mgmtOptions[i].Gateway;
                var enable_dhcp = mgmtOptions[i].EnableDHCP;
                var addFromStart = mgmtOptions[i].addrStart;
                var hostRouteTemp = mgmtOptions[i].hostRoute;
                var allocation_pools = mgmtOptions[i].AllocPool;
                var dnsServer = mgmtOptions[i].dNSServert;
                var subnetuuid = mgmtOptions[i].subnetuuid;

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
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["subnet"]["ip_prefix"] = cidr.split("/")[0];
                    if (null !== cidr.split("/")[1] && "" !== cidr.split("/")[1].trim() && isNumber(parseInt(cidr.split("/")[1])))
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["subnet"]["ip_prefix_len"]
                                = parseInt(cidr.split("/")[1]);
                    else
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["subnet"]["ip_prefix_len"] = 32;

                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["enable_dhcp"] = enable_dhcp;
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["dhcp_option_list"] = {};
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["dhcp_option_list"]["dhcp_option"] = dnsServer;
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["allocation_pools"] = allocation_pools;
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["subnet_uuid"] = subnetuuid;
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["addr_from_start"] = addFromStart;
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["default_gateway"] = gateway;
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["host_routes"] = {};
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["host_routes"]["route"] = []
                    vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][0]["host_routes"]["route"] = hostRouteTemp;
                }

                for (var j = i + 1; typeof mgmtOptions[j] !== "undefined"; j++) {
                    var newIpam = mgmtOptions[j].IPAM;
                    var cidr = mgmtOptions[j].CIDR;
                    var gateway = mgmtOptions[j].Gateway;
                    var enable_dhcp = mgmtOptions[j].EnableDHCP;
                    var allocation_pools = mgmtOptions[j].AllocPool;
                    var addFromStart = mgmtOptions[j].addrStart;
                    var hostRouteTemp = mgmtOptions[j].hostRoute;
                    var dnsServer = mgmtOptions[j].dNSServert;
                    var subnetuuid = mgmtOptions[j].subnetuuid;

                    if (newIpam == "") {
                        i++;
                        var subnetLen = vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"].length;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen] = {};
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"] = {};
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix"] = cidr.split("/")[0];
                        if (null !== cidr.split("/")[1] && "" !== cidr.split("/")[1].trim() && isNumber(parseInt(cidr.split("/")[1])))
                            vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix_len"]
                                = parseInt(cidr.split("/")[1]);
                        else
                            vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix_len"] = 32;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["enable_dhcp"] = enable_dhcp;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["dhcp_option_list"] = {};
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["dhcp_option_list"]["dhcp_option"] = dnsServer;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["allocation_pools"] = allocation_pools;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["subnet_uuid"] = subnetuuid;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["addr_from_start"] = addFromStart;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["default_gateway"] = gateway;
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["host_routes"] = {};
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["host_routes"]["route"] = []
                        vnConfig["virtual-network"]["network_ipam_refs"][ipamIndex]["attr"]["ipam_subnets"][subnetLen]["host_routes"]["route"] = hostRouteTemp;
                    } else {
                        break;
                    }
                }
                ipamIndex++;
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
        if($("#router_external")[0].checked === true)
            vnConfig["virtual-network"]["router_external"] = true;
        else
            vnConfig["virtual-network"]["router_external"] = false;

        if($("#is_shared")[0].checked === true)
            vnConfig["virtual-network"]["is_shared"] = true;
        else
            vnConfig["virtual-network"]["is_shared"] = false;
        if(isVCenter()) {
            if($("#static_ip")[0].checked === true)
                vnConfig["virtual-network"]["static_ip"] = true;
            else
                vnConfig["virtual-network"]["static_ip"] = false;
        }

        if (floatingIpPools && floatingIpPools.length > 0) {            
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
                if (projects && projects.length > 0 && projects[0] != "ALL") {
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
        }
        var routeTargets = [];
        var rtTuples = $("#RTTuples")[0].children;
        if (rtTuples && rtTuples.length > 0) {
            for (var i = 0; i < rtTuples.length; i++) {
                var rtTuple = $($(rtTuples[i]).find("div")[0]).children();
                var rt =  $($(rtTuple[0]).find("input")).val().trim();
                var asn = parseInt($($(rtTuple[2]).find("input")).val().trim());
                routeTargets.push({RouteTarget:rt + ":" + asn});
            }
        }        
        vnConfig["virtual-network"]["route_target_list"] = {};
        if (routeTargets && routeTargets.length > 0) {
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
            if(null === vnConfig["virtual-network"]["virtual_network_properties"] ||
                typeof vnConfig["virtual-network"]["virtual_network_properties"] === "undefined")
            vnConfig["virtual-network"]["virtual_network_properties"] = {};

        if(typeof fwdMode !== "undefined" && "" !== fwdMode) {
            vnConfig["virtual-network"]["virtual_network_properties"]
                ["forwarding_mode"] = fwdMode;
        }

        if($("#allow_transit")[0].checked === true)
            vnConfig["virtual-network"]["virtual_network_properties"]["allow_transit"] = true;
        else
            vnConfig["virtual-network"]["virtual_network_properties"]["allow_transit"] = false;
        if($("#chk_flood_unknown_unicast")[0].checked === true)
            vnConfig["virtual-network"]["flood_unknown_unicast"] = true;
        else
            vnConfig["virtual-network"]["flood_unknown_unicast"] = false;
		
        //vnConfig["virtual-network"]["display_name"] = vnConfig["virtual-network"]["fq_name"][vnConfig["virtual-network"]["fq_name"].length-1];

        selectedProuters = $("#msPhysicalRouters").data('contrailMultiselect').value();
        vnConfig["virtual-network"]['physical-routers'] = [];
        vnConfig["virtual-network"]['physical-routers'] = selectedProuters;
        if (mode === "add") {
            if(isVCenter()) {
                vnConfig['pVlanId'] = $('#txtSVlanId').val();
            }
            var addTimeout = 30000;
            if(isVCenter())
                addTimeout = 120000;
            //Info:In case of vCenter, issue a request to create a port-group
            doAjaxCall(getConfigURL("/api/tenants/config/virtual-networks"), "POST", JSON.stringify(vnConfig),
                "createVNSuccessCb", "createVNFailureCb",null,null,addTimeout);
            //Info:Check if network got created in APIServer from vCenter
            /*function waitForVNCreation() {
                $.ajax({
                    url:"/api/tenants/config/virtual-networks",
                    type:'GET'
                }).done(function(vnList) {
                    if(jsonPath(vnList,"$.virtual-networks[?(@.fq_name[0] =='" +  currentVN + "']").length == 0)
                        setTimeout(waitForVNCreation,10000)
                    //Issue the call for pushing parameters to Api Server
                    //We shouldn't push subnet creation as subnets are create in vCenter

                });
            }();*/
        }
        else if (mode === "edit") {
            var vnUUID = jsonPath(configObj, "$.virtual-networks[?(@.fq_name[2]=='" + txtVNName.val() + "')]")[0].uuid;
            doAjaxCall("/api/tenants/config/virtual-network/" + vnUUID, "PUT", JSON.stringify(vnConfig),
                "createVNSuccessCb", "createVNFailureCb", null, null, 30000);
        }
        windowCreateVN.modal("hide");
    });
    
    $('input[name="extend_to_prouter"]').change(onExtendToProuterCheckboxChange);
}

function onExtendToProuterCheckboxChange(e){
    if($('#extend_to_prouter')[0].checked == true){
        $('#divPRouters').removeClass('hide').addClass('show');
    } else {
        $('#divPRouters').removeClass('show').addClass('hide');
        var msPhysicalRouters = $('#msPhysicalRouters').data('contrailMultiselect');
        msPhysicalRouters.value('');
    }
}

function createFipoolEntry(fipool, len) {
    dynamicID++;
    id =  dynamicID;
    var inputTxtPoolName = document.createElement("input");
    inputTxtPoolName.type = "text";
    inputTxtPoolName.className = "span12";
    inputTxtPoolName.setAttribute("placeholder", "Pool Name");
    inputTxtPoolName.setAttribute("id","fipTuples_"+id+"_txtFIPPoolName");
    var divPoolName = document.createElement("div");
    divPoolName.className = "span3";
    divPoolName.appendChild(inputTxtPoolName);

    var selectProjects = document.createElement("div");
    selectProjects.className = "span12";
    selectProjects.setAttribute("placeholder", "Select Projects");
    selectProjects.setAttribute("id","fipTuples_"+id+"_msProject");
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
    rootDiv.id = "fipTuples_"+id;
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
        if(fipool.FIPPoolName == "default" && projects.length == 0){
            $(selectProjects).data("contrailMultiselect").setData([{text:"ALL",value:"ALL"}]);
            $(selectProjects).data("contrailMultiselect").value(["ALL"]);
            $(selectProjects).attr("disabled", "disabled");
            $(inputTxtPoolName).attr("disabled", "disabled"); 
            $(divPullLeftMargin5Minus).html("");
        } else {
            $(selectProjects).data("contrailMultiselect").value(projects);
        }
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
function appendDNSServerEntry(who, defaultRow) {
    if(validateDNSServer() === false)
        return false;

    var DNSServerEntry = createDNSServerEntry(null, $("#DNSServerTuples").children().length);
    if (defaultRow) {
        $("#DNSServerTuples").prepend($(DNSServerEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(DNSServerEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateVN",DNSServerEntry,false);
}

function deleteDNSServerEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearDNSServerEntry() {
    var tuples = $("#DNSServerTuples").children();
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#DNSServerTuples").empty();
    }
}

function validateDNSServer(){
    var ipamTuples = $("#ipamTuples")[0].children;
    var len = $("#DNSServerTuples").children().length;
    if (ipamTuples.length <= 0 && len == 0) {
        showInfoWindow("Enter atleast one IPAM under Subnet", "Input required");
        return false;
    }

    if (ipamTuples && ipamTuples.length > 0) {
        var applyDNSList = [];
        for (var i = 0; i < ipamTuples.length; i++) {
            var id = getID(String($("#ipamTuples").children()[i].id));
            applyDNSList.push($("#ipamTuples_"+id+"_chkDNS")[0].checked);
        }
        applyDNSList = applyDNSList.unique();
        if(applyDNSList.length == 1 && applyDNSList[0] === false) {
            showInfoWindow("Enable DNS on atleast one subnet", "Invalid Input");
            return false;
        }
    }
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var DNSServer =
                $($($($("#DNSServerTuples").children()[i]).find(".span10")[0]).find("input")).val().trim();
            if (typeof DNSServer === "undefined" || DNSServer === "") {
                showInfoWindow("Enter DNS Server", "Input required");
                return false;
            } else if(!isValidIP(DNSServer.trim())){
                showInfoWindow("Enter a valid IP address", "Invalid input in DNS Server");
                return false;
            } else if(DNSServer.trim() === "0.0.0.0") {
                showInfoWindow("DNS Server can be set to 0.0.0.0 by unchecking DNS checkbox of respective subnet.", "Invalid input in Address Management");
                return false;
            }
        }
    }
    return true;
}

function createDNSServerEntry(DNSNameServer, len) {
    var inputTxtDNSServerName = document.createElement("input");
    inputTxtDNSServerName.type = "text";
    inputTxtDNSServerName.className = "span12";
    inputTxtDNSServerName.setAttribute("placeholder", "DNS Server");
    var divDNSServerName = document.createElement("div");
    divDNSServerName.className = "span10";
    divDNSServerName.appendChild(inputTxtDNSServerName);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendDNSServerEntry(this);");
    iBtnAddRule.setAttribute("title", "Add DNS Server below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteDNSServerEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete DNS Server");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5 span5";
    divRowFluidMargin5.appendChild(divDNSServerName);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.className = "span12 margin-0-0-5";
    rootDiv.appendChild(divRowFluidMargin5);

    if (null !== DNSNameServer && typeof DNSNameServer !== "undefined") {
        $(inputTxtDNSServerName).val(DNSNameServer);
        $(inputTxtDNSServerName).addClass("textBackground");
        $(inputTxtDNSServerName).attr("disabled", "disabled");
    }
    return rootDiv;
}

function getAllDNSServer(){
    var DNSServerTuples = $("#DNSServerTuples")[0].children;
    var allDNSServer = [];
    if (DNSServerTuples && DNSServerTuples.length > 0) {
        for (var i = 0; i < DNSServerTuples.length; i++) {
            var DNSServerTuple = $($(DNSServerTuples[i]).find("div")[0]).children();
            var srIpam = $(DNSServerTuple[0].children[0]).val();
            allDNSServer.push(srIpam);
        }
    }
    return allDNSServer;
}

function formatAllDNSServer(DNSServer, enableDNS){
    var returnDNSServer = [];
    if(enableDNS === false) {
        returnDNSServer.push({"dhcp_option_value":"0.0.0.0","dhcp_option_name": "6"});
    }
    if (DNSServer && DNSServer != "" && DNSServer.length > 0) {
        for (var i = 0; i < DNSServer.length; i++) {
            if(isIPv4(DNSServer[i])) {
                if(enableDNS === true) {
                    returnDNSServer.push({"dhcp_option_value":DNSServer[i],"dhcp_option_name": "6"});
                }
            }
            else if(isIPv6(DNSServer[i]))
                returnDNSServer.push({"dhcp_option_value":DNSServer[i],"dhcp_option_name": "v6-name-servers"});
        }
    }
    var IPv4DNSs = jsonPath(returnDNSServer, "$.[?(@.dhcp_option_name=='6')]");
    var spaceSeparatedIPv4DNSs = [];
    if(IPv4DNSs !== false && IPv4DNSs.length > 0) {
        for(var i=0; i<IPv4DNSs.length; i++) {
            spaceSeparatedIPv4DNSs.push(IPv4DNSs[i].dhcp_option_value);
        }
        if(spaceSeparatedIPv4DNSs.length > 0) {
            spaceSeparatedIPv4DNSs = spaceSeparatedIPv4DNSs.join(" ");
        }
    } else {
        spaceSeparatedIPv4DNSs = "";
    }

    var IPv6DNSs = jsonPath(returnDNSServer, "$.[?(@.dhcp_option_name=='v6-name-servers')]");
    var spaceSeparatedIPv6DNSs = [];
    if(IPv6DNSs !== false && IPv6DNSs.length > 0) {
        for(var i=0; i<IPv6DNSs.length; i++) {
            spaceSeparatedIPv6DNSs.push(IPv6DNSs[i].dhcp_option_value);
        }
        if(spaceSeparatedIPv6DNSs.length > 0) {
            spaceSeparatedIPv6DNSs = spaceSeparatedIPv6DNSs.join(" ");
        }
    } else {
        spaceSeparatedIPv6DNSs = "";
    }

    returnDNSServer = [];
    if(spaceSeparatedIPv4DNSs !== "")
        returnDNSServer.push({"dhcp_option_value":spaceSeparatedIPv4DNSs,"dhcp_option_name": "6"});
    if(spaceSeparatedIPv6DNSs !== "")
        returnDNSServer.push({"dhcp_option_value":spaceSeparatedIPv6DNSs,"dhcp_option_name": "v6-name-servers"});
    return returnDNSServer;
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

function createIPAMEntry(ipamBlock, id,element) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var networkIpams = jsonPath(configObj, "$.network-ipams[*].fq_name");
    var validIpams = [];
    for(var i=0; i<networkIpams.length; i++) {
        var ipam = networkIpams[i];
        if(ipam[0] === selectedDomain && ipam[1] === selectedProject) {
            validIpams[validIpams.length] = {text:ipam[2],value:selectedDomain+":"+selectedProject+":"+ipam[2]};
        }
        else {
            if(checkSystemProject(ipam[1]))
                continue;
            else
                validIpams[validIpams.length] = {text : ipam[2] + " (" + ipam[0] + ":" + ipam[1] +")" , value: ipam[0] + ":" + ipam[1] + ":" + ipam[2]};
        }
    }
    if(validIpams && validIpams.length <= 0) {
        showInfoWindow("No IPAMs available.", "Error");
        return false;
    }

    var selectIpams = document.createElement("div");
    selectIpams.className = "span12 contrailDropdown";
    selectIpams.setAttribute("placeholder", "Select IPAM");
    selectIpams.setAttribute("id",element+"_"+id+"_ddSelIpam");
    var divIpam = document.createElement("div");
    divIpam.className = "span3";
    divIpam.appendChild(selectIpams);
    
    var inputTxtIPBlock = document.createElement("input");
    inputTxtIPBlock.type = "text";
    inputTxtIPBlock.className = "span12";
    inputTxtIPBlock.setAttribute("placeholder", "CIDR");
    inputTxtIPBlock.setAttribute("onblur", "autoPopulateGW(this)");
    inputTxtIPBlock.setAttribute("id",element+"_"+id+"_txtCIDR");
    var divIPBlock = document.createElement("div");
    divIPBlock.className = "span2";
    divIPBlock.appendChild(inputTxtIPBlock);

    var newUUID = UUIDjs.create()
    var hiddenTxtsubnetUUID = document.createElement("input");
    hiddenTxtsubnetUUID.setAttribute("type","hidden");
    hiddenTxtsubnetUUID.setAttribute("id",element+"_"+id+"_hiddenSubnetUUID");
    hiddenTxtsubnetUUID.setAttribute("value",newUUID['hex']);
    var divsubnetuuid = document.createElement("div");
    divsubnetuuid.appendChild(hiddenTxtsubnetUUID);
    var inputTxtAlocPool = document.createElement("textarea");
    inputTxtAlocPool.type = "text";
    inputTxtAlocPool.className = "span12 textareaNoresize";
    inputTxtAlocPool.col = "span12";
    inputTxtAlocPool.setAttribute("placeholder", "<start ip> - <end-ip><enter> ...");
    inputTxtAlocPool.setAttribute("title", "xxx.xxx.xxx.xxx - xxx.xxx.xxx.xxx<enter> xxx.xxx.xxx.xxx - xxx.xxx.xxx.xxx<enter>...");
    inputTxtAlocPool.setAttribute("id",element+"_"+id+"_txtAllocPool");
    inputTxtAlocPool.setAttribute("onkeyup", "textAreaAdjust(this);");

    $(inputTxtAlocPool).keyup(function(e) {
        var id = getID(e.target.id);
        $(this).height(1);
        $(this).height(this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))-10);
    });

    var divAlocPool = document.createElement("div");
    divAlocPool.className = "span2";
    divAlocPool.appendChild(inputTxtAlocPool);
    var inputcboxDhcp = document.createElement("input");
    inputcboxDhcp.type = "checkbox";
    inputcboxDhcp.setAttribute("enabled", "enable");
    inputcboxDhcp.className = "ace-input";
    inputcboxDhcp.setAttribute("id",element+"_"+id+"_chkDHCP");
//    if($("#chk_headerDHCP")[0].checked === true){
        inputcboxDhcp.checked = true;    
//    } else {
//        inputcboxDhcp.checked = false;
//    }
    var spanInputcboxDhcp = document.createElement("span");
    spanInputcboxDhcp.className = "ace-lbl";
    spanInputcboxDhcp.innerHTML = "&nbsp;";
    
    var divDHCP = document.createElement("div");
    divDHCP.className = "span1";
    divDHCP.appendChild(inputcboxDhcp);
    divDHCP.appendChild(spanInputcboxDhcp);

    var chkGw = document.createElement("input");
    chkGw.type = "checkbox";
    chkGw.setAttribute("enabled", "enable");
    chkGw.className = "ace-input";
    chkGw.setAttribute("id",element+"_"+id+"_chkGw");
    chkGw.setAttribute("onchange", "handleGw(this)");
    chkGw.setAttribute("title", "Enable/Disable Gateway");
    chkGw.checked = true;
    var spanInputcboxGw = document.createElement("span");
    spanInputcboxGw.className = "ace-lbl";
    spanInputcboxGw.innerHTML = "&nbsp;";

    var inputTxtGateway = document.createElement("input");
    inputTxtGateway.type = "text";
    inputTxtGateway.className = "span9";
    inputTxtGateway.setAttribute("placeholder", "Gateway");
    inputTxtGateway.setAttribute("id",element+"_"+id+"_txtGateway");
    inputTxtGateway.setAttribute("title", "xxx.xxx.xxx.xxx");
    var divIPGateway = document.createElement("div");
    divIPGateway.className = "span2";
    divIPGateway.appendChild(chkGw);
    divIPGateway.appendChild(spanInputcboxGw);
    divIPGateway.appendChild(inputTxtGateway);    

    var chkDNS = document.createElement("input");
    chkDNS.type = "checkbox";
    chkDNS.setAttribute("enabled", "enable");
    chkDNS.className = "ace-input";
    chkDNS.setAttribute("id",element+"_"+id+"_chkDNS");
    chkDNS.setAttribute("title", "Enable/Disable DNS");
    chkDNS.setAttribute("onchange", "handleDNS(this)");
    chkDNS.checked = true;
    var spanInputcboxDNS = document.createElement("span");
    spanInputcboxDNS.className = "ace-lbl";
    spanInputcboxDNS.innerHTML = "&nbsp;";

    var divDNS = document.createElement("div");
    divDNS.className = "span1";
    divDNS.appendChild(chkDNS);
    divDNS.appendChild(spanInputcboxDNS);


    //Only one subnet can be specified in case of vCenter
    if(!isVCenter()) {
        var iBtnAddRule = document.createElement("i");
        iBtnAddRule.className = "icon-plus";
        iBtnAddRule.setAttribute("onclick", "appendIPAMEntry(this,false,'"+element+"');");
        iBtnAddRule.setAttribute("title", "Add IPAM below");

        var divPullLeftMargin5Plus = document.createElement("div");
        divPullLeftMargin5Plus.className = "pull-left margin-5";
        divPullLeftMargin5Plus.appendChild(iBtnAddRule);

        var iBtnDeleteRule = document.createElement("i");
        iBtnDeleteRule.className = "icon-minus";
        iBtnDeleteRule.setAttribute("id",element+"_"+id+"_minusButton");
        iBtnDeleteRule.setAttribute("onclick", "deleteIPAMEntry(this);");
        iBtnDeleteRule.setAttribute("title", "Delete IPAM");

        var divPullLeftMargin5Minus = document.createElement("div");
        divPullLeftMargin5Minus.className = "pull-left margin-5";
        divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);
    }

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divIpam);
    divRowFluidMargin5.appendChild(divIPBlock);
    divRowFluidMargin5.appendChild(divAlocPool);
    divRowFluidMargin5.appendChild(divIPGateway);
    divRowFluidMargin5.appendChild(divDNS);
    divRowFluidMargin5.appendChild(divDHCP);
    divRowFluidMargin5.appendChild(divsubnetuuid);
    
    if(!isVCenter()) {
        divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
        divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);
    }

    var rootDiv = document.createElement("div");
    rootDiv.id =  element+"_"+id;
    rootDiv.className = 'rule-item';
    rootDiv.appendChild(divRowFluidMargin5);

    $(selectIpams).contrailDropdown({
        dropdownCssClass: 'select2-medium-width',
        change:checkSREntry,
        dataTextField:"text",
        dataValueField:"value",
    });
    $(selectIpams).data("contrailDropdown").setData(validIpams);
    var ipamindex = 0;
    var defIPAM = 'default-network-ipam';
    if(isVCenter()) {
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        defIPAM = selectedProject + '-ipam';
    }
    for(var ind = 0 ;ind< validIpams.length ; ind++){
        if((validIpams[ind].value).split(":")[2] == defIPAM){
            ipamindex = ind;
            break;
        }
    }
    $(selectIpams).data("contrailDropdown").value(validIpams[ipamindex].value);
    if(isVCenter())
        $(selectIpams).data('contrailDropdown').enable(false);

    if (null !== ipamBlock && typeof ipamBlock !== "undefined") {
        $(inputTxtIPBlock).val(ipamBlock.IPBlock);
        $(inputTxtGateway).val(ipamBlock.Gateway);
        if(ipamBlock.Gateway === "0.0.0.0") {
            chkGw.checked = false;
        }
        else {
            chkGw.checked = true;
        }
        chkDNS.checked = getDNSStatus(ipamBlock);
        inputcboxDhcp.checked = ipamBlock.DHCPEnabled;
        $(inputTxtAlocPool).val(ipamBlock.AlocPool);
        $(hiddenTxtsubnetUUID).val(ipamBlock.subnetUUID);
        var temp_ipam = ipamBlock.IPAM.split(":")
        $(selectIpams).data("contrailDropdown").value((temp_ipam[0]+":"+temp_ipam[1]+":"+temp_ipam[2]));
        $(selectIpams).data("contrailDropdown").enable(false);
        $(inputcboxDhcp).attr("disabled", "disabled");
        $(chkGw).attr("disabled", "disabled");
        $(chkDNS).attr("disabled", "disabled");
        $(inputTxtIPBlock).attr("disabled", "disabled");
        $(inputTxtIPBlock).addClass("textBackground");
        $(inputTxtGateway).attr("disabled", "disabled");
        $(inputTxtGateway).addClass("textBackground");
        $(inputTxtAlocPool).attr("disabled", "disabled");

    }    
    return rootDiv;
}
function setDisplayName(){}
function textAreaAdjust(o) {
    o.style.height = "1px";
    o.style.height = (o.scrollHeight)+"px";
}
function appendIPAMEntry(who, defaultRow,element) {
    if(validateIPAMEntry() === false)
        return false;
    dynamicID++;
    var ipamEntry = createIPAMEntry(null, dynamicID,element);
    if (defaultRow) {
        $("#ipamTuples").prepend($(ipamEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(ipamEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateVN",ipamEntry,false);
}

function deleteIPAMEntry(who) {
    var elementId = who.id;
    var id = "";
    if(elementId != undefined && elementId != null){
        id = getID(elementId);
    }
    var howmany = 0;
    var ipamTuples = $("#ipamTuples")[0].children;
    if(ipamTuples.length <= 1){
        var srTuples = $("#srTuples")[0].children;
        var DNSTuples = $("#DNSServerTuples")[0].children;
        if ((srTuples && srTuples.length > 0 ) || (DNSTuples && DNSTuples.length > 0)) {
            showInfoWindow("Removing last subnet will remove all DNS Server and Host Route. <br>Do you want to continue?", "Conformation.","","remDNS_SR");
        } else {
            $("#ipamTuples").html("");
        }
    } else {
        var tempDiv = $("#ipamTuples_"+id)[0];
        $(tempDiv).remove();
        //$(tempDiv) = $();
    }
}
function remDNS_SR(){
    $("#infoWindow").modal('hide');
    $("#srTuples").html("");
    $("#DNSServerTuples").html("");
    $("#ipamTuples").html("");
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
            var id = getID(String($("#ipamTuples").children()[i].id));
            var ipblock = $("#ipamTuples_"+id+"_txtCIDR").val().trim();
            var gateway = $("#ipamTuples_"+id+"_txtGateway").val().trim();
            var allocPool = $("#ipamTuples_"+id+"_txtAllocPool").val().trim();
            var chkGw = $("#ipamTuples_"+id+"_chkGw")[0].checked;

            if ("" === ipblock.trim() || !isValidIP(ipblock.trim())) {
                showInfoWindow("Enter a valid CIDR", "Invalid input in CIDR");
                return false;
            }
            if(ipblock.split("/").length != 2) {
                showInfoWindow("Enter a valid CIDR in xxx.xxx.xxx.xxx/xx format", "Invalid input in CIDR");
                return false;
            }
            var subnetMask = parseInt(ipblock.split("/")[1]); 
            //Only for ipv4
            //if(isIPv4(ipblock) && subnetMask > 30) {
            //    showInfoWindow("Subnet mask can not be greater than 30", "Invalid input in Address Management");
            //    return false;
            //}

            if ("" === gateway || !isValidIP(gateway) || gateway.indexOf("/") !== -1)  {
                showInfoWindow("Enter a valid Gateway IP address in xxx.xxx.xxx.xxx format", "Invalid input in Address Management");
                return false;
            } else {
                if("0.0.0.0" === gateway && chkGw === true) {
                    showInfoWindow("Default Gateway can be set to 0.0.0.0 only by unchecking default gateway checkbox of respective subnet.", "Invalid input in Address Management");
                    return false;
                }
            }

            if(allocPool.trim() != null && allocPool.trim() !== ""){
                var tempAllocPools = allocPool.split("\n");
                for(var inc = 0; inc < tempAllocPools.length ; inc++){
                    var ips = tempAllocPools[inc].split("-");
                    if(ips.length != 2){
                        showInfoWindow("Enter a valid Allocation Pool range in xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx &lt;enter&gt; xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx... format", "Invalid input in Allocation Pool");
                        return false;
                    }
                    if (!isValidIP(ips[0].trim()) || !isValidIP(ips[1].trim())) {
                        showInfoWindow("Enter a valid Allocation Pool address xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx &lt;enter&gt; xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx &lt;enter&gt;... format. <br>eg : 192.168.1.20-192.168.1.40<br>192.168.1.50-192.168.1.70", "Invalid input in Allocation Pool");
                        return false;
                    }
                    if(!isIPBoundToRange(ipblock,ips[0].trim()) || !isIPBoundToRange(ipblock,ips[1].trim())){
                        showInfoWindow("Enter a valid Allocation Pool address in the CIDR range", "Invalid input in Allocation Pool");
                        return false;
                    }
                    if(gateway != ""){
                        var errorCode = isIPBoundToIPRange(ips[0].trim(), ips[1].trim(), gateway);
                        if(errorCode == 0){
                            showInfoWindow("Gateway should be outside Allocation Pool(s)", "Invalid Data");
                            return false;
                        }
                        if(errorCode == 1){
                            showInfoWindow("Enter a valid Allocation Pool address xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx &lt;enter&gt; xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx &lt;enter&gt;... format. <br>eg : 192.168.1.20-192.168.1.40<br>192.168.1.50-192.168.1.70", "Invalid input in Allocation Pool");
                            return false;
                        }
                    }
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

function createSREntry(staticRoute, len,id,element) {
    var nextHopSR = document.createElement("input");
    nextHopSR.type = "text";
    nextHopSR.className = "span12";
    nextHopSR.setAttribute("placeholder", "IP Address");
    nextHopSR.setAttribute("id",element+"_"+id+"_txtNextHop");
    var divIpam = document.createElement("div");
    divIpam.className = "span3";    
    divIpam.appendChild(nextHopSR);

    var inputTxtSR = document.createElement("input");
    inputTxtSR.type = "text";
    inputTxtSR.className = "span12";
    inputTxtSR.setAttribute("placeholder", "Route Prefix");
    nextHopSR.setAttribute("id",element+"_"+id+"_txtRoutPrefix");
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
    divRowFluidMargin5.appendChild(divSR);
    divRowFluidMargin5.appendChild(divIpam);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    //rootDiv.id = "rule_" + len;
    rootDiv.id = "rule_" + id;
    rootDiv.appendChild(divRowFluidMargin5);

    if (null !== staticRoute && typeof staticRoute !== "undefined") {
        $(inputTxtSR).val(staticRoute.prefix);
        $(nextHopSR).val(staticRoute.next_hop);
    }    
    return rootDiv; 
}

function validateSREntry() {
    var srTuples = $("#srTuples")[0].children;
    var len = srTuples.length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var srTuple = $($(srTuples[i]).find("div")[0]).children();
            var hostRoute = $($(srTuple[0]).find("input")).val().trim();
            if (typeof hostRoute === "undefined" || "" === hostRoute ||
                hostRoute.indexOf("/") === -1 || !validip(hostRoute)) {
                showInfoWindow("Enter a valid IP address for Rout Prefix in xxx.xxx.xxx.xxx/xx format", "Invalid input for Host Routes");
                return false;
            }
            srTuple = $($(srTuples[i]).find("div")[2]).children();
            if($(srTuple[0]).val() != undefined && $(srTuple[0]).val().trim() != ""){
                var nextHop = $(srTuple[0]).val().trim();
                if (typeof nextHop === "undefined" || "" === nextHop ||
                    nextHop.indexOf("/") >= 0 || !validip(nextHop)) {
                    showInfoWindow("Enter a valid IP address for Next Hop in xxx.xxx.xxx.xxx format", "Invalid input for Host Routes");
                    return false;
                }
            }
        }
    }
    return true;
}
function toggleFIP(){
    var checkedval = $("#router_external")[0].checked;
    if(checkedval == true){
        var fipPool = [];
        var fipTuples = $("#fipTuples")[0].children;
        if (fipTuples && fipTuples.length > 0) {
            for (var i = 0; i < fipTuples.length; i++) {
                var id = getID($("#fipTuples").children()[i].id);
                var poolName = $("#fipTuples_"+id+"_txtFIPPoolName").val();
                var projects = $("#fipTuples_"+id+"_msProject").data("contrailMultiselect").getSelectedData();
                if(poolName == "default" && projects != undefined && projects.length > 0 && projects[0].value == "ALL" ){
                    return;
                }
                
            }
        }
        fipPool.push({"FIPPoolName":"default", "FIPProjects":[]});
        var fipEntry = createFipoolEntry(fipPool[0], 0);
        $("#fipTuples").prepend($(fipEntry));
    } else {
        var fipTuples = $("#fipTuples")[0].children;
        if (fipTuples && fipTuples.length > 0) {
            for (var i = 0; i < fipTuples.length; i++) {
                var id = getID($("#fipTuples").children()[i].id);
                var poolName = $("#fipTuples_"+id+"_txtFIPPoolName").val();
                var projects = $("#fipTuples_"+id+"_msProject").data("contrailMultiselect").getSelectedData();
                if(poolName == "default" && projects != undefined && projects.length > 0 && projects[0].value == "ALL" ){
                    //$(fipTuples[i]).html("");
                    $(fipTuples[i]).remove();
                }
            }
        }
    }
}
function appendSREntry(who, defaultRow) {
    var ipamTuples = $("#ipamTuples")[0].children;
    if (ipamTuples.length <= 0) {
        showInfoWindow("Enter atleast one IPAM under Subnet", "Input required");
        return false;
    }
    if(validateSREntry() === false)
        return false;
    dynamicID++;
    var srEntry = createSREntry(null, $("#srTuples")[0].children,dynamicID,"srTuples");
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
        var sel_domain = getSelectedDomainProjectObjNew("ddDomainSwitcher", "contrailDropdown", 'domain');
        $("#ddDomainSwitcher").data("contrailDropdown").value(sel_domain);
        fetchProjects("populateProjects", "failureHandlerForGridVN");
    } else {
        $("#gridVN").data("contrailGrid")._dataView.setData([]);
        btnCreateVN.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');        
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridVN.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');        
    }    
}

function handleDomains(e) {
    //fetchDataForGridVN();
    //Get projects for the selected domain.
    var dName = e.added.text;
    setCookie("domain", dName);
    fetchProjects("populateProjects", "failureHandlerForGridVN");
}

function populateProjects(result) {
    if (result && result.projects && result.projects.length > 0) {
        //var projects = jsonPath(result, "$.projects[*].fq_name[1]");
        var projects = [];
        for (i = 0; i < result.projects.length; i++) {
            var project = result.projects[i];
            //if(!checkSystemProject(project.fq_name[1])) {
                tempProjectDetail = {text:project.fq_name[1], value:project.uuid};
                projects.push(tempProjectDetail);
            //}
        }

        $("#ddProjectSwitcher").contrailDropdown({
            dataTextField:"text",
            dataValueField:"value",
            change:handleProjects
        });
        btnCreateVN.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForGridVN();
    } else {
        $("#gridVN").data("contrailGrid")._dataView.setData([]);
        btnCreateVN.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridVN.showGridMessage("empty");
        emptyCookie('project');
    }
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridVN();
}

function autoPopulateGW(me) {
    var ip = $(me).val();
    var id = getID($(me)[0].id);
    if(ip.indexOf("/") !== -1 && !isNaN(ip.split("/")[1])) {
        if($("#ipamTuples_" + id +"_chkGw")[0].checked == true) {
        try {
            var default_gateway = genarateGateway(ip,"start");
            if(default_gateway != false){
                $("#ipamTuples_"+id+"_txtGateway").val(default_gateway);
            }

        } catch (e) {
            $("#ipamTuples_"+id+"_txtGateway").val("");
        }
        } else {
            $("#ipamTuples_"+id+"_txtGateway").val("0.0.0.0");
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
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/get-config-uuid-list?type=virtual-network&parentUUID="+$("#ddProjectSwitcher").data("contrailDropdown").value(),
        type:"GET"
    });
    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/global-vrouter-config",
        type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            var results = arguments;
            if(null != results[1] &&
               null != results[1][0] &&
            'global-vrouter-config' in results[1][0] &&
            'vxlan_network_identifier_mode' in results[1][0]['global-vrouter-config']) {
                vxlan_identifier_mode = results[1][0]['global-vrouter-config']['vxlan_network_identifier_mode'];
            }
            successHandlerForAllUUIDGet(results[0][0], ajaxParam);
        },
        function () {
            //If atleast one api fails
            var results = arguments;
            failureHandlerForAllUUIDGet(results);
        }
    );
    /*doAjaxCall("/api/admin/config/get-data?type=virtual-network&count=20&fqnUUID="+$("#ddProjectSwitcher").data("contrailDropdown").value(),
        "GET", null, "successHandlerForGridVNLoop", "failureHandlerForGridVN", null, ajaxParam);*/
}

function successHandlerForAllUUIDGet(allUUID, cbparam)
{
    if(cbparam != ajaxParam){
        return;
    }
    if(allUUID.length > 0) {
        var vnUUIDObj = {};
        var sendUUIDArr = [];
        vnUUIDObj.type = "virtual-network";
        sendUUIDArr = allUUID.slice(0, 50);
        vnUUIDObj.uuidList = sendUUIDArr;
        vnUUIDObj.fields = ["floating_ip_pools","physical_router_back_refs"];
        allUUID = allUUID.slice(50, allUUID.length);
        var param = {};
        param.cbparam = cbparam;
        param.allUUID = allUUID;
        doAjaxCall("/api/tenants/config/get-config-data-paged", "POST", JSON.stringify(vnUUIDObj),
            "successHandlerForGridVNLoop", "successHandlerForGridVNLoop", null, param);
	} else {
        doAjaxCall("/api/tenants/config/shared-virtual-networks/", 
            "GET", null, "successHandlerForAppendShared", "failureHandlerForAppendShared", null, cbparam, 300000);
	}
}

function failureHandlerForAllUUIDGet(result){
    $("#btnCreateVN").removeClass('disabled-link');
    gridVN.showGridMessage('errorGettingData');
}

function failureHandlerForAppendShared(result){
    $("#btnCreateVN").removeClass('disabled-link');
    gridVN.showGridMessage('errorGettingData');
}

function successHandlerForGridVNLoop(result, param){
    var allUUID = param.allUUID;
    var cbparam = param.cbparam;
    if(cbparam != ajaxParam){
        return;
    }
    if(allUUID.length > 0) {
        var vnUUIDObj = {};
        var sendUUIDArr = [];
        vnUUIDObj.type = "virtual-network";
        sendUUIDArr = allUUID.slice(0, 600);
        vnUUIDObj.uuidList = sendUUIDArr;
        vnUUIDObj.fields = ["floating_ip_pools", "physical_router_back_refs"];
        allUUID = allUUID.slice(600, allUUID.length);
        var param = {};
        param.cbparam = cbparam;
        param.allUUID = allUUID;
        doAjaxCall("/api/tenants/config/get-config-data-paged", "POST", JSON.stringify(vnUUIDObj),
            "successHandlerForGridVNLoop", "successHandlerForGridVNLoop", null, param);
    } else {
        doAjaxCall("/api/tenants/config/shared-virtual-networks/", 
            "GET", null, "successHandlerForAppendShared", "failureHandlerForAppendShared", null, cbparam, 300000);
    }
    successHandlerForGridVNRow(result);
    gridVN.showGridMessage('loading');
}

function successHandlerForAppendShared(result, param){
    if(param != ajaxParam){
        return;
    }
    var uniqueNetwork = [];
    var vnData = $("#gridVN").data("contrailGrid")._dataView.getItems();
    for(var i=0;i<result.length;i++){
        var unique = false;
        for(var j = 0;j<vnData.length;j++){
            if(vnData[j].NetworkUUID == result[i]["virtual-network"]["uuid"]){
                unique = true;
                break;
            }
        }
        if(unique == false){
            uniqueNetwork.push(result[i]);
        }
    }
    if(uniqueNetwork.length > 0){
        successHandlerForGridVNRow(uniqueNetwork);
    } else {
        if (vnData.length <= 0) {
            gridVN.showGridMessage("empty");
            return;
        }
    }
    gridVN.removeGridMessage();
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
    var vnData = $("#gridVN").data("contrailGrid")._dataView.getItems();
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var networks = jsonPath(result, "$..virtual-network");
    for (var i = 0; i < networks.length; i++) {
        configObj["virtual-networks"].push(networks[i]);
        var vn = networks[i];
        var vnName = jsonPath(vn, "$.fq_name[2]");
        var displayName = vn["display_name"];
        var sh = "Enabled";
        if(String(vn["is_shared"]) != "true") 
            sh = "Disabled";
        var Shared = sh;
        if (typeof vnName === "object" && vnName.length === 1){
            if(($("#ddProjectSwitcher").data("contrailDropdown").value() != vn.parent_uuid) &&  Shared == "Enabled") {
                vnName = vnName[0]+" ("+vn["fq_name"][0] +":"+ vn["fq_name"][1] +")";
            } else {
                vnName = vnName[0];
            }
        } else
            vnName = "";

        var at = jsonPath(vn, "$.virtual_network_properties.allow_transit");
        if (at !== false && typeof at !== "undefined" && at.length > 0 && at[0] != null && at[0] != undefined) {
            at = at[0];
        }
        if(String(at) === "true")
            at = "Enabled";
        else {
            at = "Disabled";
        }
        var AllowTransit = at;
        var staticIPAddressing = jsonPath(vn, "$.external_ipam");
        if (staticIPAddressing !== false && typeof staticIPAddressing !== "undefined" && staticIPAddressing.length > 0 && staticIPAddressing[0] != null && staticIPAddressing[0] != undefined) {
            staticIPAddressing = staticIPAddressing[0];
        }
        if(String(staticIPAddressing) == "true") {
            staticIPAddressing = "Enabled";
        } else {
            staticIPAddressing = "Disabled";
        }

        var uuid = jsonPath(vn, "$.uuid");
        if (typeof uuid === "object" && uuid.length === 1)
            uuid = uuid[0];
        var parent_uuid = jsonPath(vn, "$.parent_uuid");
        if (typeof parent_uuid === "object" && parent_uuid.length === 1)
            parent_uuid = parent_uuid[0];
        var reorder_policies;
        var reorder_policiesTxt = "";;
        var policies = jsonPath(vn, "$.network_policy_refs[*]");
        var reorder_policies_temp = reorderPolicies(policies)
        if (reorder_policies_temp === false) {
            reorder_policies = "";
        } else {
            if(reorder_policies_temp.length >= 1){
                reorder_policies = [];
                reorder_policiesTxt = "";
                for(var k=0; k<reorder_policies_temp.length; k++) {
                    var splitPolicy = reorder_policies_temp[k].split(":");
                    if(reorder_policiesTxt != "") reorder_policiesTxt += "&nbsp;&nbsp;";
                    if(selectedDomain == splitPolicy[0] && selectedProject == splitPolicy[1]) {
                        reorder_policies.push(splitPolicy[2]);
                        reorder_policiesTxt += splitPolicy[2]+ "<br>";
                    } else {
                        reorder_policies.push(splitPolicy[2] +" ("+splitPolicy[0] +":"+splitPolicy[1]+")");
                        reorder_policiesTxt += splitPolicy[2] +" ("+splitPolicy[0] +":"+splitPolicy[1]+")" + "<br>";
                    }
                }
            }
        }

        var subnets = jsonPath(vn, "$.network_ipam_refs[*].subnet.ipam_subnet");
        if (subnets === false) {
            subnets = "";
        } else {
            subnets = subnets.unique();
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
                        ipams[j] = ipams[j][2] + " (+"+ ipams[j][0] + ":" + ipams[j][1] + ")";
                    }
                }
            }
        }
        var hostRoutes = "";
        var ipamRefs = jsonPath(vn, "$.network_ipam_refs[*]");
        var allSubnets = [];
        var DNSServer = "";
        var allDNSServer = [];
        allDNSServer = createUniqueDNSServer(ipamRefs);
        if(allDNSServer.indexOf("0.0.0.0") !== -1) {
            allDNSServer.splice(allDNSServer.indexOf("0.0.0.0"), 1);
        }
        DNSServer =  allDNSServer.join("<br>&nbsp;&nbsp;");
        var hostRoutPrifix = "";
        var hostRoutPrifixArr = createUniqueHostRout(ipamRefs);
        for(var hrInc = 0;hrInc <hostRoutPrifixArr.length;hrInc++){
            if(hostRoutPrifix != "") hostRoutPrifix += "&nbsp;&nbsp;";
            if(hostRoutPrifixArr[hrInc]["next_hop"] != null && hostRoutPrifixArr[hrInc]["next_hop"] != ""){
                hostRoutPrifix += hostRoutPrifixArr[hrInc]["prefix"] + " " +hostRoutPrifixArr[hrInc]["next_hop"]+"<br>";
            } else {
                hostRoutPrifix += hostRoutPrifixArr[hrInc]["prefix"]+"<br>";
            }
        }
        for (var j = 0; j < ipamRefs.length; j++) {
            var ipam = jsonPath(ipamRefs[j], "$..subnet.ipam[*]");
            var cidr = vn["network_ipam_refs"][j]["subnet"]["ipam_subnet"];
            var default_gateway = vn["network_ipam_refs"][j]["subnet"]["default_gateway"];
            if(default_gateway === "0.0.0.0")
                default_gateway = "Disabled";
            //Need to do
            var alocPools = vn["network_ipam_refs"][j]["subnet"]["allocation_pools"];
            var dnsServerAddress = vn["network_ipam_refs"][j]["subnet"]["dns_server_address"];
            var DNSEnabled = getDNSStatus({
                "DHCPOptionsList"  : vn["network_ipam_refs"][j]["subnet"]["dhcp_option_list"],
                "DNSServerAddress" : vn["network_ipam_refs"][j]["subnet"]["dns_server_address"],
                "Gateway" : vn["network_ipam_refs"][j]["subnet"]["default_gateway"]
            });
            DNSEnabled = (DNSEnabled === true) ? "Enabled" : "Disabled";

            var AllocationPool = formatAlcPoolObj(alocPools);
            AllocationPool = AllocationPool.replace(/\n/g,"<br>");
            AllocationPool = AllocationPool.replace(/-/g," - ");
            AllocationPool = AllocationPool.replace(/  /g," ");
            var dhcpEnabled = vn["network_ipam_refs"][j]["subnet"]["enable_dhcp"];
            if(true == dhcpEnabled){
                dhcpEnabled = "Enabled";
            } else {
                dhcpEnabled = "Disabled";
            }
            if(selectedDomain === ipam[0] &&
                selectedProject === ipam[1]) {
                ipam = ipam[2];
            } else {
                ipam = ipam[2] + " (" + ipam[0] + ":" + ipam[1] +")";
            }
            allSubnets.push({"ipam":ipam , "CIDR" : cidr,"AllocationPool":AllocationPool,"DHCPEnabled": dhcpEnabled,"default_gateway":default_gateway,"hostroute": hostRoutPrifix,"DNSServer":DNSServer, "DNSServerAddress":dnsServerAddress, "DNS":DNSEnabled});
        }
        var gateways = jsonPath(vn, "$.network_ipam_refs[*].subnet.default_gateway");
        if (gateways === false) {
            gateways = "";
        }
        
        var fips = jsonPath(vn, "$.floating_ip_pools[*].to[3]");
        if (fips === false) {
            fips = "-";
        }
        var fipoolProjects = jsonPath(vn, "$.floating_ip_pools[*]");
        if (fipoolProjects === false) {
            fipoolProjects = "";
        }

        var routeTargets = jsonPath(vn, "$.route_target_list.route_target[*]");
        if (routeTargets === false) {
            routeTargets = "-";
        }
        var ext = "Disabled";
        if(vn["router_external"] != undefined && String(vn["router_external"]) == "true")
            ext = "Enabled";
        var External = ext;

        //Need to do
        var adminState = "-";
        if(String(vn["id_perms"]["enable"]).toLowerCase() === "true")
            adminState = "Up";
        else if(String(vn["id_perms"]["enable"]).toLowerCase() == "false")
            adminState = "Down";
        
        var fwdMode = jsonPath(vn, "$.virtual_network_properties.forwarding_mode");
        if (fwdMode !== false && typeof fwdMode !== "undefined" && fwdMode.length > 0 && fwdMode[0] != null && fwdMode[0] != undefined) {
            fwdMode = fwdMode[0];
            if(fwdMode === "l2_l3") {
                fwdMode = "L2 and L3";
            } else if(fwdMode === "l2") {
                fwdMode = "L2 Only";
            }else if(fwdMode === "l3") {
                fwdMode = "L3 Only";
            } else {
                fwdMode = "";
            }
        } else {
            fwdMode = "L2 and L3";
        }
        var vxlanid= "";
        if(vxlan_identifier_mode == "configured") {
            vxlanidval = jsonPath(vn, "$.virtual_network_properties.vxlan_network_identifier");
            if (vxlanidval !== false && typeof vxlanidval !== "undefined" && vxlanidval.length > 0 &&
                vxlanidval[0] != null) {
                vxlanid = vxlanidval[0] ;
            } else {
                vxlanid = "Unconfigured";
            }
        } else {
            var automaticVxlanID = vn["virtual_network_network_id"];
            vxlanid = "Automatic";
            if(automaticVxlanID != false && automaticVxlanID != null && automaticVxlanID != "undefined"){
                vxlanid += " ( " + automaticVxlanID + " )";
            }
        }
        var enableControles = true;
        if(($("#ddProjectSwitcher").data("contrailDropdown").value() != vn.parent_uuid) &&  Shared == "Enabled")
            enableControles = false;
            if(reorder_policiesTxt.trim() == "") reorder_policiesTxt = "-";
            if(String(vxlanid).trim() == "") vxlanid = "-";
            if(fwdMode.trim() == "") fwdMode = "-";
            if(DNSServer.trim() == "") DNSServer = "-";
            if(hostRoutPrifix.trim() == "") hostRoutPrifix = "-";
        var prouterBackRefs = vn['physical_router_back_refs'];
        var physical_routers = "-";
        var physical_router_names = '-';
        if(prouterBackRefs != null){
            physical_router_names = '';
            physical_routers = prouterBackRefs;
            for(var l=0; l < physical_routers.length; l++){
                var prname = physical_routers[l]['to'][1];
                
                if(l==0){
                    physical_router_names += prname;
                } else {
                    physical_router_names += ', ' + prname;
                }
            }
        }
        var flood_unknown_unicast = "Disabled";
        if(vn["flood_unknown_unicast"] != undefined) {
            if(String(vn["flood_unknown_unicast"]) == "true") {
                flood_unknown_unicast = "Enabled";
            }
        }
        //if(vn.fq_name[1] == selectedProject){
            vnData.push({
                "id": idCount++,
                "Network": vnName,
                "displayName": displayName,
                "AttachedPolicies": reorder_policies,
                "AttachedPoliciesTxt": reorder_policiesTxt,
                "IPBlocks": subnets,
                "HostRoutes": hostRoutPrifix,
                "Ipams": ipams,
                "FloatingIPs": fips,
                "allSubnets": allSubnets,
                "FloatingIPPools": fipoolProjects,
                "RouteTargets": routeTargets,
                "adminState": adminState,
                "Shared": Shared,
                "External": External,
                "DNSServer": DNSServer,
                "ForwardingMode": fwdMode,
                "VxLanId": vxlanid,
                "AllowTransit": AllowTransit,
                "flood_unknown_unicast": flood_unknown_unicast,
                "staticIPAddressing" : staticIPAddressing,
                "NetworkUUID": uuid,
                "parent_uuid": parent_uuid,
                "enableControles": enableControles,
                "physical_routers":physical_routers,
                "display_physical_routers":physical_router_names
            });
        //}
    }
    if(!vnData || vnData.length<=0)
        gridVN.showGridMessage('empty');
    $("#gridVN").data("contrailGrid")._dataView.setData(vnData);
}

function createUniqueHostRout(ipamRefs){
    var hostRoutPrifixArr = [];
    if(ipamRefs != false && ipamRefs != ""){
        for (var j = 0; j < ipamRefs.length; j++) {
            if(ipamRefs[j]["subnet"]["host_routes"] != "" && ipamRefs[j]["subnet"]["host_routes"]["route"].length > 0){
                var tempRouter = ipamRefs[j]["subnet"]["host_routes"]["route"];
                for(var inc = 0;inc < tempRouter.length ;inc++){
                    var unique = false;
                    for(var uni = 0;uni < hostRoutPrifixArr.length ;uni++){
                        if(hostRoutPrifixArr[uni]["prefix"] == tempRouter[inc]["prefix"] && hostRoutPrifixArr[uni]["next_hop"] == tempRouter[inc]["next_hop"]){
                            unique = true;
                            break;
                        }
                    }
                    if(unique == false) {
                        hostRoutPrifixArr.push(tempRouter[inc]);
                    }
                }
            }
        }
    }
    return hostRoutPrifixArr;
}
function createUniqueDNSServer(ipamRefs){
    var allDNSServer = [];
    if(ipamRefs != false && ipamRefs != ""){
        for (var j = 0; j < ipamRefs.length; j++) {
            if(ipamRefs[j]["subnet"]["dhcp_option_list"] != ""){
                var DNSServertemp = ipamRefs[j]["subnet"]["dhcp_option_list"]["dhcp_option"];
                if(DNSServertemp.length > 0) {
                    for(var inc = 0 ; inc < DNSServertemp.length ; inc++){
                        if(DNSServertemp[inc]["dhcp_option_name"] == "6") {
                            var spaceSeparatedDNSs = DNSServertemp[inc]["dhcp_option_value"];
                            var DNSs = spaceSeparatedDNSs.split(" ");
                            if(DNSs.indexOf("0.0.0.0") === -1) {
                                for(var dnsCount = 0; dnsCount < DNSs.length; dnsCount++) {
                                    allDNSServer.push(DNSs[dnsCount]);
                                }
                            }
                        }
                        if(DNSServertemp[inc]["dhcp_option_name"] == "v6-name-servers") {
                            var spaceSeparatedDNSs = DNSServertemp[inc]["dhcp_option_value"];
                            var DNSs = spaceSeparatedDNSs.split(" ");
                            for(var dnsCount = 0; dnsCount < DNSs.length; dnsCount++) {
                                allDNSServer.push(DNSs[dnsCount]);
                            }
                        }
                    }
                }
            }
        }
    }
    if(allDNSServer.length > 1)
        allDNSServer = allDNSServer.unique();
    return allDNSServer;
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
//        if(selectedDomain === policies[0].to[0] && selectedProject === policies[0].to[1]) {
//            reordered.push(policies[0].to[2]);  
//        } else {
            reordered.push(policies[0].to.join(":"));
//        }
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
//        if(selectedDomain === policies[k].to[0] && selectedProject === policies[k].to[1]) {
//            reordered.push(policies[k].to[2]);  
//        } else {
            reordered.push(policies[k].to.join(":"));
//        }        
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
    txtDisName.val("");
    $("#ddFwdMode").data("contrailDropdown").value("l2_l3");
    $("#ddFwdMode").data("contrailDropdown").enable(false);
    $("#divFwdMode").removeClass("hide");
    $("#ddAdminState").data("contrailDropdown").value("true");
    $("#router_external")[0].checked = false;
    $("#is_shared")[0].checked = false;
    $("#allow_transit")[0].checked = false;
    $('#static_ip').attr('disabled',false);
    $('#static_ip')[0].checked = false;
    $('#static_ip').parents('.control-group').hide();
    msNetworkPolicies.data("contrailMultiselect").value("");
    msPhysicalRouters.data("contrailMultiselect").value("");
    $('#txtPVlanId').parents('.control-group').hide();
    $('#txtPVlanId').val('');
    $('#txtSVlanId').parents('.control-group').hide();
    $('#txtSVlanId').val('');
    $('#extend_to_prouter')[0].checked = false;
    $('#divPRouters').removeClass('show').addClass('hide');
    clearFipEntries();
    clearRTEntries();
    clearSREntries();
    clearIPAMEntries();
    clearDNSServerEntry();
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

    selectedProuters = [];
    $("#widgetFip").addClass("collapsed");
    $("#widgetRT").addClass("collapsed");
    $("#widgetStaticRoutes").addClass("collapsed");
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(mode == "edit"){
        var selectedRow = $("#gridVN").data("contrailGrid")._dataView.getItem(rowIndex);
        var projectuuid = $("#ddProjectSwitcher").data("contrailDropdown").value()
        if(selectedRow.parent_uuid != projectuuid){
            showInfoWindow(selectedRow.Network + " cannot be edited.", "Not Editable");
            return false;
        }
    }
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
    getAjaxs[3] = $.ajax({
        url:"/api/admin/webconfig/network/L2_enable",
        type:"GET"
    });
    getAjaxs[4] = $.ajax({
        url:"/api/tenants/config/physical-routers-list",
        type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            clearValuesFromDomElements();
            if(isVCenter()) {
                $('#static_ip').parents('.control-group').show();
                if(mode == 'add') {
                    $('#txtPVlanId').parents('.control-group').show();
                    $('#txtSVlanId').parents('.control-group').show();
                } else {
                    $('#static_ip').attr('disabled',true);
                    $('#txtPVlanId').parents('.control-group').hide();
                    $('#txtSVlanId').parents('.control-group').hide();
                }
            }
            var results = arguments;
            var networkPolicies = jsonPath(results[0][0], "$.network-policys[*]");
            //var l2Mode = results[3][0].L2_enable;
            var proutersResult = results[4][0];
            /*if(l2Mode == false){
                $("#ddFwdMode").data("contrailDropdown").enable(false);
                $("#ddFwdMode").data("contrailDropdown").value("l2_l3");
                $("#divFwdMode").addClass("hide");
            } else {*/
            $("#ddFwdMode").data("contrailDropdown").value("l2_l3");
            $("#ddFwdMode").data("contrailDropdown").enable(true);
               //$("#divFwdMode").removeClass("hide");
            // }
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
                        nps[nps.length] = {text:networkPolicies[i]["fq_name"][2],value:networkPolicies[i]["fq_name"].join(":")};
                    } else {
                         //var localText = networkPolicies[i]["fq_name"][2]+'('+networkPolicies[i]["fq_name"][0]+':'+networkPolicies[i]["fq_name"][0];
                        nps[nps.length] = {text:networkPolicies[i]["fq_name"][2]+" ("+networkPolicies[i]["fq_name"][0]+":"+networkPolicies[i]["fq_name"][1]+") " ,value:networkPolicies[i]["fq_name"].join(":")};
                        //nps[nps.length] = {text:localText,value:networkPolicies[i]["fq_name"].join(":")};
                        //nps[nps.length] = {text:networkPolicies[i]["fq_name"].join(":"),value:networkPolicies[i]["fq_name"].join(":")};

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
            
            if(proutersResult == null || (proutersResult != null && proutersResult['physical-routers'] == null) ){
                return;
            }
            var prouters = proutersResult['physical-routers'];
            var data = [];
            if(prouters.length > 0) {
                for(var i = 0; i < prouters.length; i++){
                    data.push({text:prouters[i]['fq_name'][1], value:prouters[i]['uuid']});
                }
            }
            var msPhysicalRouters = $('#msPhysicalRouters').data('contrailMultiselect');
            msPhysicalRouters.setData(data);
            
            if (mode === "add") {
                windowCreateVN.find('h6.modal-header-title').text('Create Network');
                $(txtVNName).focus();
                //Add one subnet row
                if(isVCenter()) {
                    $('#btnCommonAddIpam').trigger('click');
                    $('#btnCommonAddIpam').hide();
                }
                $("#chk_flood_unknown_unicast")[0].checked = false;
            } else if (mode === "edit") {
                if(isVCenter()) {
                    $('#btnCommonAddIpam').hide();
                }
                var selectedRow = $("#gridVN").data("contrailGrid")._dataView.getItem(rowIndex);
                if(null === selectedRow || typeof selectedRow === "undefined" || {} === selectedRow ||
                    [] === selectedRow || "" === selectedRow) {
                    return false;
                }
                txtVNName.val(selectedRow.Network);
                txtVNName[0].disabled = true;
                txtDisName.val(selectedRow.displayName);
                windowCreateVN.find('h6.modal-header-title').text('Edit Network ' + selectedRow.displayName);
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
                //Need to do
                var alocPools = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.allocation_pools");
                var DHCPEnabled = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.enable_dhcp");;
                var dnsServerAddresses = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.dns_server_address");
                var dhcpOptionsList = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.dhcp_option_list");
                var subnetUUIDList = jsonPath(selectedVN, "$.network_ipam_refs[*].subnet.subnet_uuid");
                if (ipams && ipams.length > 0) {
                    var existing = [];
                    for (var i = 0; i < ipams.length; i++) {
                        var ipblock = ipBlocks[i];
                        var ipam = ipams[i];
                        var gateway = gateways[i];
                        var subnetUUID = subnetUUIDList[i];
                        var AlocPool="";
                        if(typeof alocPools[i] != null && typeof alocPools[i] != undefined && typeof alocPools[i] != "")
                            AlocPool = formatAlcPoolObj(alocPools[i]); 
                        if(dnsServerAddresses[i] === false) {
                            dnsServerAddresses[i] = "";
                        }
                        if(dhcpOptionsList[i] === false || (typeof dhcpOptionsList === "object" && dhcpOptionsList.length === 0)) {
                            dhcpOptionsList[i] = [];
                        }
                        existing.push({"IPBlock":ipblock, "IPAM":ipam.join(":"), "Gateway":gateway,"DHCPEnabled":DHCPEnabled[i],"AlocPool":AlocPool, "DNSServerAddress":dnsServerAddresses[i], "DHCPOptionsList" : dhcpOptionsList[i], "subnetUUID":subnetUUID});
                    }
                    for(var k=0; k<existing.length; k++) {
                        dynamicID++;
                        var ipamEntry = createIPAMEntry(existing[k], dynamicID,"ipamTuples");
                        $("#ipamTuples").append($(ipamEntry));
                        textAreaAdjust($("#ipamTuples_"+dynamicID+"_txtAllocPool")[0]);
                    }
                }

                var ipamRefs = jsonPath(selectedVN, "$.network_ipam_refs[*]");
                //Host Routes
                var hostRoutPrifixArr = createUniqueHostRout(ipamRefs);
                for(var hrInc = 0;hrInc <hostRoutPrifixArr.length;hrInc++){
                    dynamicID++;
                    var srEntry = createSREntry(hostRoutPrifixArr[hrInc],$("#srTuples").children().length,dynamicID,"srTuples");
                    $("#srTuples").append($(srEntry));
                }

                /*for (var j = 0; j < ipamRefs.length; j++) {
                    var host_routes = jsonPath(ipamRefs[j], "$..host_routes.route[*]");
                    if(false !== host_routes) {
                        for(var k=0; k<host_routes.length; k++) {
                            var srEntry = createSREntry({"hostroute" : host_routes[k].prefix,"nextHop" : host_routes[k].next_hop}, 
                                     $("#srTuples").children().length);
                            $("#srTuples").append($(srEntry));
                        }
                    }
                }*/

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
                var DNSServer = createUniqueDNSServer(ipamRefs);
                if (DNSServer && DNSServer.length > 0) {
                    for(var i=0; i<DNSServer.length; i++) {
                        //todo
                        if(DNSServer[i].trim() !== "0.0.0.0"){
                            var DNSEntry = createDNSServerEntry(DNSServer[i], i);
                            $("#DNSServerTuples").append(DNSEntry);
                        }
                    }
                }
                //place to add edid of AdminState, Extend/Shared,DNS Server
                var AdminState = selectedVN["id_perms"]["enable"];
                var isShared = selectedVN["is_shared"];
                var isflood_unknown_unicast = false;
                if(selectedVN["flood_unknown_unicast"] != null && selectedVN["flood_unknown_unicast"] != undefined) {
                    isflood_unknown_unicast = selectedVN["flood_unknown_unicast"];
                }
                var isExternal = selectedVN["router_external"];
                $("#ddAdminState").data("contrailDropdown").value(String(AdminState));
                $("#is_shared")[0].checked = isShared;
                $("#router_external")[0].checked = isExternal;
                $("#chk_flood_unknown_unicast")[0].checked = isflood_unknown_unicast;

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
                    if(null !== vnProps["allow_transit"] && 
                        "" !==  vnProps["allow_transit"]) {
                        if(String(vnProps["allow_transit"]) === "true")
                            $("#allow_transit")[0].checked = true;
                        else
                            $("#allow_transit")[0].checked = false;
                    }
                }
                if(isVCenter()) {
                    if(selectedVN['external_ipam'] != null) {
                        if(String(selectedVN['external_ipam']) == "true")
                            $('#static_ip')[0].checked = true;
                        else
                            $('#static_ip')[0].checked = false;
                    }
                }
                var prouters = selectedRow.physical_routers;
                var prouterUuids = [];
                if(prouters != '-'){
                    $.each(prouters,function(i,d){
                        prouterUuids.push(d['uuid']);
                    });
                }
                var msPhysicalRouters = $('#msPhysicalRouters').data('contrailMultiselect');
                if(prouterUuids.length > 0){
                    $('#extend_to_prouter')[0].checked = true; 
                    onExtendToProuterCheckboxChange();
                    msPhysicalRouters.value(prouterUuids);
                } else {
                    msPhysicalRouters.value('none');
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

function createVNSuccessCb(result) {
    gridVN.showGridMessage('loading');   
    fetchDataForGridVN();
}

function createVNFailureCb(result) {
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
        return " (" + ap.toString() + " )";   
    }
    return "";
}

function validate() {
    /*var vnName = txtVNName.val().trim();
    if (typeof vnName === "undefined" || vnName === "") {
        showInfoWindow("Enter a valid network name", "Input required");
        return false;
    }*/
    var vnDisName = txtDisName.val().trim();
    var pVlanId; 
    if($('#txtPVlanId').is(':visible')) {
        pVlanId = $('#txtPVlanId').val().trim();
        if (typeof pVlanId === "undefined" || pVlanId === "" || !isNumber(pVlanId)) {
            showInfoWindow("Enter a valid Primary VLAN", "Input required");
            return false;
        }
    }
    if($('#txtSVlanId').is(':visible')) {
        sVlanId = $('#txtSVlanId').val().trim();
        if (typeof sVlanId === "undefined" || sVlanId === "" || !isNumber(sVlanId)) {
            showInfoWindow("Enter a valid Secondary VLAN", "Input required");
            return false;
        }
    }
    if (typeof vnDisName === "undefined" || vnDisName === "") {
        showInfoWindow("Enter a valid display network name", "Input required");
        return false;
    }
    if(validateRTEntry() === false || 
        validateFipEntry() === false ||
        validateSREntry() === false ||
        validateIPAMEntry() === false)
        return false;
    var len = $("#DNSServerTuples").children().length;
    if(len > 0 && validateDNSServer() === false)
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
function getDNSStatus(ipamBlock) {
    var dns_server_address = ipamBlock.DNSServerAddress;
    var dhcp_option_list = ipamBlock.DHCPOptionsList;
    var gw = ipamBlock.Gateway;
    var valid_dns_server_address = true;
    var valid_dhcp_option_list_dns = true;

    if(null !== dhcp_option_list && false !== dhcp_option_list && dhcp_option_list.hasOwnProperty('dhcp_option') &&
        dhcp_option_list.dhcp_option.length > 0) {
        var only_dns_under_this_dhcp_option = jsonPath(dhcp_option_list, "$.[?(@.dhcp_option_name=='6')]");
        var dnses = [];
        if(false !== only_dns_under_this_dhcp_option && only_dns_under_this_dhcp_option.length > 0) {
            for(var i=0; i<only_dns_under_this_dhcp_option.length; i++){
                var splitted_dns = only_dns_under_this_dhcp_option[i]['dhcp_option_value'].split(" ");
                for(var j=0; j<splitted_dns.length; j++)
                    dnses.push(splitted_dns[j]);
            }
            dnses = dnses.unique();
            if(dnses.indexOf("0.0.0.0") !== -1)
                valid_dhcp_option_list_dns = false;
        }

    }
    if((dns_server_address == "" || dns_server_address == "0.0.0.0") && gw == "0.0.0.0")
        valid_dns_server_address = false;

    /*if(null !== dns_server_address && false !== dns_server_address && "" !== dns_server_address.trim() &&
        typeof dns_server_address === "string" && "0.0.0.0" !== dns_server_address.trim()) {
        valid_dns_server_address = true;
    }*/
    //todo
    //return valid_dns_server_address | valid_dhcp_option_list_dns;
    return valid_dhcp_option_list_dns;
}

function handleDNS(me) {
    var DNSServerTuples = $("#DNSServerTuples")[0].children;
    var ipamTuples = $("#ipamTuples")[0].children;
    if (DNSServerTuples && DNSServerTuples.length > 0) {
        if (ipamTuples && ipamTuples.length > 0) {
            var applyDNSList = [];
            for (var i = 0; i < ipamTuples.length; i++) {
                var ipam_id = getID(String($("#ipamTuples").children()[i].id));
                applyDNSList.push($("#ipamTuples_"+ipam_id+"_chkDNS")[0].checked);
            }
            applyDNSList = applyDNSList.unique();
            if(applyDNSList.length == 1 && applyDNSList[0] === false) {
                $(me)[0].checked = true;
                showInfoWindow("Remove all DNS Servers under 'Advanced Options' before disabling DNS.", "Invalid Input");
                return false;
            }
        }

    }
}

function handleGw(me) {
    var id = getID(String($(me)[0].id));
    if($(me)[0].checked == true) {
        $("#ipamTuples_" + id + "_txtGateway")[0].disabled = false;
        //$("#ipamTuples_" + id + "_txtGateway").attr("placeholder", "Gateway");
        $("#ipamTuples_" + id + "_txtCIDR").trigger('onblur');
    } else {
        $("#ipamTuples_" + id + "_txtGateway").val("0.0.0.0");
        $("#ipamTuples_" + id + "_txtGateway")[0].disabled = true;
        //$("#ipamTuples_" + id + "_txtGateway").attr("placeholder", "0.0.0.0");
    }
}
function formatAlcPoolObj(alocPools){
    var AllocationPool = "";
    if(alocPools != undefined && alocPools != null && alocPools != ""){
        for(var inc = 0 ; inc < alocPools.length ; inc++){
            if(AllocationPool != "") 
                AllocationPool += "\n";
            if(alocPools[inc]["start"] === alocPools[inc]["end"])
                AllocationPool += alocPools[inc]["start"];
            else
                AllocationPool += alocPools[inc]["start"]+" - "+alocPools[inc]["end"];
        }
    }
    if (AllocationPool == "") AllocationPool = " ";
    return AllocationPool;
}

function getID(divid){
    if(divid === undefined){
         return -1;
    }
    var split = divid.split("_");
    if(split.length > 1){
        return(split[1])
    } else {
        return -1;
    }
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
    ddAdminState = $("#ddAdminState").data("contrailDropdown");
    if(isSet(ddAdminState)) {
        ddAdminState.destroy();
        ddAdminState = $();
    }
    
    msNetworkPolicies = $("#msNetworkPolicies").data("contrailMultiselect");
    if(isSet(msNetworkPolicies)) {
        msNetworkPolicies.destroy();
        msNetworkPolicies = $();
    }
    
    msPhysicalRouters = $("#msPhysicalRouters").data("contrailMultiselect");
    if(isSet(msPhysicalRouters)) {
        msPhysicalRouters.destroy();
        msPhysicalRouters = $();
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

    txtDisName = $("#txtDisName");    
    if(isSet(txtDisName)) {
        txtDisName.remove();
        txtDisName = $();
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
