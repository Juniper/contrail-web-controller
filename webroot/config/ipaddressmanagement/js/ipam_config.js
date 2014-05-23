/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

IPAddressManagementObj = new IPAMObjConfig();
function IPAMObjConfig() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject, ddDnsVirtual;

    //TextBoxes
    var txtIPAMName, txtdnsTenant, txtDomainName, txtNTPServer;

    //Grids
    var gridipam, gridVnIpBlocks;

    //Buttons
    var btnCreateEditipam, btnDeleteIpam,
        btnCreateEditipamCancel, btnCreateEditipamOK,
        btnRemovePopupOK, btnRemovePopupCancel,
        btnCnfRemoveMainPopupOK, btnCnfRemoveMainPopupCancel,
        btnAddIPBlock, btnDeleteIPBlock;

    //Windows
    var windowCreateipam, confirmRemove, confirmMainRemove;

    var mode = "";
    var idCount = 0;
    var ipamAjaxcount = 0;
    var ajaxParam;

    //Method definitions
    this.load                       = load;
    this.init                       = init;
    this.initComponents             = initComponents;
    this.initActions                = initActions;
    this.fetchData                  = fetchData;
    this.fetchDataForGridIPAM       = fetchDataForGridIPAM;
    this.populateDomains            = populateDomains;
    this.handleDomains              = handleDomains;
    this.populateProjects           = populateProjects;
    this.handleProjects             = handleProjects;
    this.deleteIPAM                 = deleteIPAM;
    this.closeCreateIPAMWindow      = closeCreateIPAMWindow;
    this.autoPopulateGW             = autoPopulateGW;
    this.ipamCreateEditWindow       = ipamCreateEditWindow;
    this.successHandlerForGridIPAM  = successHandlerForGridIPAM;
    this.failureHandlerForGridIPAM  = failureHandlerForGridIPAM;
    this.createIPAMSuccessCb        = createIPAMSuccessCb;
    this.createIPAMFailureCb        = createIPAMFailureCb;
    this.destroy                    = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#ipam-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_networking_ipam';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridIPAM");
}

function initComponents() {
    $("#gridipam").contrailGrid({
        header : {
            title : {
                text : 'IP Address Management',
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
            customControls: [
                '<a id="btnDeleteIpam"class="disabled-link" title="Delete IPAM(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateEditipam" onclick="ipamCreateEditWindow(\'add\');return false;" title="Create IPAM"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
            columns : [
            {
                id: "ipam_name",
                field: "ipam_name",
                name: "IPAM",
                sortable: true
            },
            {
                id: "ip_blocks",
                field: "ip_blocks",
                name: "IP Blocks",
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.ip_blocks === "object") {
                       for(var i=0; i<dc.ip_blocks.length, i<2; i++) {
                           if(typeof dc.ip_blocks[i] !== "undefined") {
                               returnString += dc.ip_blocks[i] + "<br>";
                           }
                       }
                       if(dc.ip_blocks.length > 2) {
                           returnString += '<span class="moredataText">(' + 
                           (dc.ip_blocks.length-2) + 
                           ' more  )</span><span class="moredata" style="display:none;"></span>';
                       }
                    } else {
                        returnString += "-";
                    }
                    return returnString;
                }
            },
            {
                id: "dns",
                field: "dns",
                name: "DNS Server",
                sortable: true
            },
            {
                id: "ntp",
                field: "ntp",
                name: "NTP Server",
                sortable: true
            }]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteIpam').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteIpam').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            ipamCreateEditWindow('edit',rowIndex);
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
                    template: $("#gridIpamDetailTemplate").html()
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading IPAMs..',
                },
                empty: {
                    text: 'No IPAMs Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting IPAMs.'
                }
            }
        }
    });

    gridipam = $("#gridipam").data("contrailGrid");

    btnCreateEditipam           = $("#btnCreateEditipam");
    btnDeleteIpam               = $("#btnDeleteIpam");
    btnCreateEditipamCancel     = $("#btnCreateEditipamCancel");
    btnCreateEditipamOK         = $("#btnCreateEditipamOK");
    btnRemovePopupOK            = $("#btnRemovePopupOK");
    btnRemovePopupCancel        = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK     = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");
    txtIPAMName                 = $("#txtIPAMName");
    txtdnsTenant                = $("#txtdnsTenant");
    txtDomainName               = $("#txtDomainName");
    txtNTPServer                = $("#txtNTPServer");
    btnAddIPBlock               = $("#btnAddIPBlock");
    btnDeleteIPBlock            = $("#btnDeleteIPBlock");

    ipamAjaxcount = 0;
    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });
    gridipam.showGridMessage('loading');
    ddDnsVirtual = $("#ddDnsVirtual").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });
    $("#ddDNS").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:checkVirtualNetwork
    });

    var dnspool = [
        {text:"Default", value:"default-dns-server"},
        {text:"Virtual DNS", value:"virtual-dns-server"},
        {text:"Tenant", value:"tenant-dns-server"},
        {text:"None", value:"none"}
    ];
    $("#ddDNS").data("contrailDropdown").setData(dnspool);

    $('body').append($("#windowCreateipam"));
    windowCreateipam = $("#windowCreateipam");
    windowCreateipam.on("hide", closeCreateIPAMWindow);
    windowCreateipam.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmMainRemove"));
    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmRemove"));
    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function initActions() {
    btnDeleteIpam.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {        
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCreateEditipamCancel.click(function (a) {
        windowCreateipam.modal('hide');
    });

    btnRemovePopupCancel.click(function (a) {
        confirmRemove.modal('hide');
    });

    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide')
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        //Delete IPAM from top delete button
        var selected_rows = $("#gridipam").data("contrailGrid").getCheckedRows();
        deleteIPAM(selected_rows);
        confirmMainRemove.modal('hide');
    });

    btnCreateEditipamOK.click(function (a) {
        var verify = validate();
        if(verify === false)
            return;

        var selectedDomaindd = $("#ddDomainSwitcher").data("contrailDropdown");
        var selectedDomain = selectedDomaindd.text();
        var selectedProjectdd = $("#ddProjectSwitcher").data("contrailDropdown");
        var selectedProject = selectedProjectdd.text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)){
            gridipam.showGridMessage('errorGettingData');
            return;
        }
        var ipamName = $(txtIPAMName).val();
        var selectedvDNSdd = $("#ddDnsVirtual").data("contrailDropdown");
        var selectedvDNStxt = selectedvDNSdd.text();
        var selectedvDNSuid = selectedvDNSdd.value();
        var ntpIp = $(txtNTPServer).val();
        var dnsMethod = $("#ddDNS").data("contrailDropdown").value();
        var dnsIP = $(txtdnsTenant).val();
        var dns_domain = $(txtDomainName).val();
        var mode = "";

        //alert("DNS Method " + dnsMethod);
        var ipam = {};

        if (verify == true) {
            ipam["network-ipam"] = {};
            ipam["network-ipam"]["parent_type"] = "project";
            ipam["network-ipam"]["fq_name"] = [];
            ipam["network-ipam"]["fq_name"] = [selectedDomain, selectedProject, ipamName];
            ipam["network-ipam"]["network_ipam_mgmt"] = {};
            ipam["network-ipam"]["ipam_method"] = null;
            ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_method"] = dnsMethod;
            ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"] = {};
            ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"] = {};
            ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["virtual_dns_server_name"] = null;
            if (dnsMethod == "tenant-dns-server" || ntpIp.length || dns_domain.length) {
                ipam["network-ipam"]["network_ipam_mgmt"]["dhcp_option_list"] = {};
                ipam["network-ipam"]["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"] = [];
            }
            if (ntpIp.length) {
                ipam["network-ipam"]["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"].push(
                    {dhcp_option_name:"4", dhcp_option_value:ntpIp});
            }
            if (dns_domain.length) {
                ipam["network-ipam"]["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"].push(
                    {dhcp_option_name:"15", dhcp_option_value:dns_domain});
            }
            if (dnsMethod == "tenant-dns-server" && dnsIP.length) {
                //ipam["network-ipam"]["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"].push(
                //{dhcp_option_name : "6", dhcp_option_value: dnsIP});
                ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"]["ip_address"] = [];
                ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"]["ip_address"][0] = dnsIP;
                ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["virtual_dns_server_name"] = null;
            }

            ipam["network-ipam"]["virtual_DNS_refs"] = [];

            if (dnsMethod == "virtual-dns-server") {
                ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"] = {};
                ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["virtual_dns_server_name"] = selectedvDNStxt;
                ipam["network-ipam"]["virtual_DNS_refs"][0] = {};
                var dnsFaqName = [];
                dnsFaqName = selectedvDNStxt.split(':');
                ipam["network-ipam"]["virtual_DNS_refs"][0] = {to:dnsFaqName,
                    uuid:selectedvDNSuid};
            }

            var mgmtOptions = [];
            var vnTuples = $("#vnTuples")[0].children;
            if (vnTuples && vnTuples.length > 0) {
                var nwList = [];
                for (var i = 0; i < vnTuples.length; i++) {
                    var currentNw    = $($($($("#vnTuples").children()[i]).find(".span3")[0]).find("div.contrailDropdown")[1]).data("contrailDropdown").value().trim();
                    var currentIpBlock = $($($($("#vnTuples").children()[i]).find(".span3")[1]).find("input")[0]).val().trim();
                    var currentGateway = $($($($("#vnTuples").children()[i]).find(".span3")[2]).find("input")[0]).val().trim();
                    if(nwList.lastIndexOf(currentNw) === -1) {
                        mgmtOptions.splice(i, 0, {Network: currentNw, IPBlock:currentIpBlock, Gateway:currentGateway});
                        nwList.splice(i, 0, currentNw);
                    } else {
                        var lastPos = nwList.lastIndexOf(currentNw);
                        mgmtOptions.splice(lastPos+1, 0, {Network: "", IPBlock:currentIpBlock, Gateway:currentGateway});
                        nwList.splice(lastPos+1, 0, currentNw);
                    }
                }
            }

            if (mgmtOptions && mgmtOptions.length > 0) {
                ipam["network-ipam"]["virtual_network_refs"] = [];
                var nwIndex = 0;
                for (var i = 0; i < mgmtOptions.length; i++) {
                    var ipBlock = mgmtOptions[i].IPBlock;
                    var nw = mgmtOptions[i].Network;
                    var gateway = mgmtOptions[i].Gateway;
                    if (nw !== "") {
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex] = {};
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["to"] = [];
                        var nwUUID = "";
                        if(nw.indexOf(":") !== -1) {
                            nw = nw.split(":");
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["to"][0] = nw[0];
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["to"][1] = nw[1];
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["to"][2] = nw[2];
                            nwUUID = jsonPath(configObj, "$..virtual-networks[?(@.fq_name[0]=='" + nw[0] + 
                            "' && @.fq_name[1]=='" + nw[1] + "' && @.fq_name[2]=='" + nw[2] + "')]");
                            if(nwUUID !== false && null !== nwUUID[0]) {
                                nwUUID = nwUUID[0].uuid;
                            }
                            nw = nw.join(":");
                        } else {
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["to"][0] = selectedDomain;
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["to"][1] = selectedProject;
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["to"][2] = nw;
                            nwUUID = jsonPath(configObj, "$..virtual-networks[?(@.fq_name[0]=='" + selectedDomain + 
                            "' && @.fq_name[1]=='" + selectedProject + "' && @.fq_name[2]=='" + nw + "')]");
                            if(nwUUID !== false && null !== nwUUID[0]) {
                                nwUUID = nwUUID[0].uuid;
                            }
                        }
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["uuid"] = nwUUID;
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"] = {};
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"] = [];
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][0] = {};
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][0]["subnet"] = {};
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][0]["subnet"]["ip_prefix"] = ipBlock.split("/")[0];
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][0]["subnet"]["ip_prefix_len"] = parseInt(ipBlock.split("/")[1]);
                        ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][0]["default_gateway"] = gateway;
                    }

                    for (var j = i + 1; typeof mgmtOptions[j] !== "undefined"; j++) {
                        var newNetwork = mgmtOptions[j].Network;
                        var newIpBlock = mgmtOptions[j].IPBlock;
                        var gateway = mgmtOptions[j].Gateway;
                        if (newNetwork == "") {
                            i++;
                            var subnetLen = ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"].length;
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][subnetLen] = {};
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"] = {};
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix"] = newIpBlock.split("/")[0];
                            if (null !== newIpBlock.split("/")[1] && "" !== newIpBlock.split("/")[1].trim() && isNumber(parseInt(newIpBlock.split("/")[1])))
                                ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix_len"]
                                    = parseInt(newIpBlock.split("/")[1]);
                            else
                                ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][subnetLen]["subnet"]["ip_prefix_len"] = 32;
                            ipam["network-ipam"]["virtual_network_refs"][nwIndex]["attr"]["ipam_subnets"][subnetLen]["default_gateway"] = gateway;
                        } else {
                            break;
                        }
                    }
                    nwIndex++;
                }
            }

            if ($(txtIPAMName)[0].disabled == true)
                mode = "edit";
            else
                mode = "add";

            if (mode === "add") {
                doAjaxCall("/api/tenants/config/ipams", "POST", JSON.stringify(ipam),
                    "createIPAMSuccessCb", "createIPAMFailureCb");
            }
            else if (mode === "edit") {
                doAjaxCall("/api/tenants/config/ipam/" + $('#btnCreateEditipamOK').data('uuid'), "PUT", JSON.stringify(ipam),
                    "createIPAMSuccessCb", "createIPAMFailureCb");
            }
            windowCreateipam.modal('hide');
        }
    });
}

function createVNEntry(vnBlock, len) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var vns = jsonPath(configObj, "$.virtual-networks[*].fq_name");            
    var validVns = [];
    for(var i=0; i<vns.length; i++) {
        var vn = vns[i];
        if(vn[0] === selectedDomain && vn[1] === selectedProject) {
            validVns[validVns.length] = vn[2];
        }
        else {
            if(checkSystemProject(vn[1]))
                continue;
            else
                validVns[validVns.length] = vn[0] + ":" + vn[1] + ":" + vn[2];
        }
    }
    if(validVns && validVns.length <= 0) {
        showInfoWindow("No Virtual Networks available.", "Error");
        return false;
    }

    var selectVns = document.createElement("div");
    selectVns.className = "span12 contrailDropdown";
    selectVns.setAttribute("placeholder", "Select Virtual Network");
    var divVN = document.createElement("div");
    divVN.className = "span3";
    divVN.appendChild(selectVns);
    
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
    iBtnAddRule.setAttribute("onclick", "appendVNEntry(this);");
    iBtnAddRule.setAttribute("title", "Add Virtual Network below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteVNEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Virtual Network");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divVN);
    divRowFluidMargin5.appendChild(divIPBlock);
    divRowFluidMargin5.appendChild(divIPGateway);
    
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.className = 'rule-item';
    rootDiv.appendChild(divRowFluidMargin5);

    $(selectVns).contrailDropdown({
        dropdownCssClass: 'select2-medium-width'
    });
    $(selectVns).data("contrailDropdown").setData(validVns);
    $(selectVns).data("contrailDropdown").value(validVns[0]);

    if (null !== vnBlock && typeof vnBlock !== "undefined") {
        $(selectVns).data("contrailDropdown").value(vnBlock.Network);
        $(inputTxtIPBlock).val(vnBlock.IPBlock);
        $(inputTxtGateway).val(vnBlock.Gateway);
    }    
    return rootDiv;
}

function appendVNEntry(who, defaultRow) {
    if($("#btnCommonAddVN").hasClass("disabled-link")) {
        return;
    }
    if(validateVNEntry() === false)
        return false;

    var vnEntry = createVNEntry(null, $("#vnTuples").children().length);
    if (defaultRow) {
        $("#vnTuples").prepend($(vnEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(vnEntry, parentEl.nextSibling);
    }
}

function deleteVNEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearVNEntries() {
    var tuples = $("#vnTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#vnTuples").empty();
    }
}

function validateVNEntry() {
    var len = $("#vnTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var ipblock = $($($($("#vnTuples").children()[i]).find(".span3")[1]).find("input")[0]).val().trim();
            var gateway = $($($($("#vnTuples").children()[i]).find(".span3")[2]).find("input")[0]).val().trim();
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

function autoPopulateGW(me) {
    var ip = $(me).val();
    if(ip.indexOf("/") !== -1) {
        try {
            var ip_arrs = ip_range(ip, []);
            var default_gw = ip_arrs[ip_arrs.length - 1];
            $(me).parent().next().find("input").val(default_gw);
        } catch (e) {
            $(me).parent().next().find("input").val("");
        }
    }
}

function deleteIPAM(selected_rows){
     var deleteAjaxs = [];
     if(selected_rows && selected_rows.length > 0) {
         var cbParams = {};
         cbParams.selected_rows = selected_rows;
         cbParams.url = "/api/tenants/config/ipam/"; 
         cbParams.urlField = "uuid";
         cbParams.fetchDataFunction = "createIPAMSuccessCb";
         cbParams.errorTitle = "Error";
         cbParams.errorShortMessage = "Error in deleting IPAM - ";
         cbParams.errorField = "ipam_name";
         deleteObject(cbParams);
     }
}

function validate() {
    var temp = $(txtIPAMName).val().trim();
    if (typeof temp === "undefined" || temp === "") {
        showInfoWindow("Enter a valid Name", "Input required");
        return false;
    }

    var selectedDNS = $("#ddDNS").data("contrailDropdown");
    var selectedDNSText = selectedDNS.text();
    if (selectedDNSText === "Tenant") {
        temp = $(txtdnsTenant).val().trim();
        if (temp == "" || !validip(temp.trim())) {
            showInfoWindow("Enter valid Tenant DNS Server IP.", "Input required");
            return false;
        }
    } else if(selectedDNSText === "Virtual DNS") {
        var selectedDNSVirtual = $("#ddDnsVirtual").data("contrailDropdown");
        if(null === selectedDNSVirtual.text() || 
            typeof selectedDNSVirtual.text() === "undefined" ||
            selectedDNSVirtual.text().trim() == "") {
            showInfoWindow("Enter valid Virtual DNS.", "Input required");
            return false;
        }
    }
    temp = $(txtNTPServer).val().trim();
    if (temp != "") {
        if (!validip(temp.trim())) {
            showInfoWindow("Enter valid NTP Server IP.", "Input required");
            return false;
        }
    }
    if(validateVNEntry() === false)
        return false;    
    return true;
}

function checkVirtualNetwork() {

    var selectedDNS = $("#ddDNS").data("contrailDropdown");
    var selectedDNSText = selectedDNS.text();


    document.getElementById("dnsvirtualBlock").style.display = "none";
    document.getElementById("dnsTenantBlock").style.display = "none";
    document.getElementById("dnsDomainName").style.display = "block";

    if (selectedDNSText == "Virtual DNS") {
        document.getElementById("dnsvirtualBlock").style.display = "block";
        document.getElementById("dnsDomainName").style.display = "none";
    }
    if (selectedDNSText == "Tenant") {
        document.getElementById("dnsTenantBlock").style.display = "block";
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
    fetchProjects("populateProjects", "failureHandlerForGridIPAM");
}    

function handleDomains() {
    fetchDataForGridIPAM();
}

function populateProjects(result) {
    if (result && result.projects && result.projects.length > 0) {
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
        btnCreateEditipam.attr("disabled",false);
    }
    fetchDataForGridIPAM();
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridIPAM();
}

function fetchDataForGridIPAM() {
    var selectedDomaindd = $("#ddDomainSwitcher").data("contrailDropdown");
    var selectedDomain = selectedDomaindd.text();
    var selectedProjectdd = $("#ddProjectSwitcher").data("contrailDropdown");
    var selectedProject = selectedProjectdd.text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)){
        gridipam.showGridMessage('errorGettingData');
        return;
    }
    $("#gridipam").data("contrailGrid")._dataView.setData([]);
    configObj["network-ipams"] = [];
    gridipam.showGridMessage('loading');
    idCount = 0;
    ipamAjaxcount++;
    var proid = selectedProjectdd.value();
    ajaxParam = proid +"_"+ ipamAjaxcount;
    doAjaxCall("/api/admin/config/get-data?type=network-ipam&count=4&fqnUUID="+proid, 
        "GET", null, "successHandlerForGridIPAM", "failureHandlerForGridIPAM", null, ajaxParam);
}

function successHandlerForGridIPAM(result,cbparam) {
    if(cbparam != ajaxParam){
        return;
    }
    if(result.more == true || result.more == "true"){
        doAjaxCall("/api/admin/config/get-data?type=network-ipam&count=4&&fqnUUID="+ 
            $(ddProject).val() +"&lastKey="+result.lastKey, 
            "GET", null, "successHandlerForGridIPAM", "failureHandlerForGridIPAM", null, cbparam); 
    }
    successHandlerForGridIPAMRow(result);
}

function failureHandlerForGridIPAM(result) {
    $("#btnCreateEditipam").addClass('disabled-link');
    gridipam.showGridMessage("errorGettingData");
}
function showRemoveWindow(rowIndex) {
    $.contrailBootstrapModal({
           id: 'confirmRemove',
           title: 'Remove',
           body: '<h6>Confirm IPAM delete</h6>',
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
               var selected_row = $("#gridipam").data("contrailGrid")._dataView.getItem(rowNum);
                   deleteIPAM([selected_row]);
                   $('#confirmRemove').modal('hide');
               },
               className: 'btn-primary'
           }
           ]
       });
}

function failureHandlerForGridIPAMRow(result) {
    gridipam.showGridMessage("errorGettingData");
}

function successHandlerForGridIPAMRow(result) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var ipamData = $("#gridipam").data("contrailGrid")._dataView.getItems();
    var ipams = jsonPath(result, "$..network-ipam");
    for (var i = 0; i < ipams.length; i++) {
        var ipam = ipams[i];
        configObj["network-ipams"].push(ipams[i]);

        var ip_blocks_obj = [];
        var vn_ref_len = 0;
        if ("virtual_network_back_refs" in ipam) {
            vn_ref_len = ipam["virtual_network_back_refs"].length
        }
        for (var j = 0; j < vn_ref_len; j++) {
            var ip_block_len = 0;
            var vn_ref = ipam.virtual_network_back_refs[j];
            if ("attr" in vn_ref && "ipam_subnets" in vn_ref["attr"]) {
                ip_block_len = vn_ref["attr"]["ipam_subnets"].length
            }
            for (var k = 0; k < ip_block_len; k++) {
                var ip_block = "";
                var ip_block_ref = vn_ref["attr"]["ipam_subnets"][k];
                if(selectedDomain === vn_ref["to"][0] && selectedProject === vn_ref["to"][1]) {
                    ip_block = vn_ref["to"][2] + " - " +
                    ip_block_ref["subnet"]["ip_prefix"] + "/" +
                    ip_block_ref["subnet"]["ip_prefix_len"];
                } else {
                    ip_block = vn_ref["to"][0] + ":" + vn_ref["to"][1] + ":" + vn_ref["to"][2] + " - " +
                    ip_block_ref["subnet"]["ip_prefix"] + "/" +
                    ip_block_ref["subnet"]["ip_prefix_len"];
                }
                if(null !== ip_block_ref["default_gateway"] &&
                    typeof ip_block_ref["default_gateway"] !== "undefined" &&
                    "" !== ip_block_ref["default_gateway"].trim())
                    ip_block += "(" + ip_block_ref["default_gateway"] + ") ";
                ip_blocks_obj.push(ip_block);
            }
        }
        var dnsServer = "";
        var ntpServer = "";
        var domainName = "";
        var dhcp_opt_len = 0;
        var dhcp_opt_ref = [];

        if ("network_ipam_mgmt" in ipam &&
            "dhcp_option_list" in ipam["network_ipam_mgmt"] &&
            ipam["network_ipam_mgmt"]["dhcp_option_list"] &&
            "dhcp_option" in ipam["network_ipam_mgmt"]["dhcp_option_list"]) {
            dhcp_opt_len = ipam["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"].length;
        }
        for (var j = 0; j < dhcp_opt_len; j++) {
            dhcp_opt_ref = ipam["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"][j];
            if (parseInt(dhcp_opt_ref.dhcp_option_name) == 15 && !(domainName.length)) {
                domainName += " " + dhcp_opt_ref.dhcp_option_value;
            }
            if (parseInt(dhcp_opt_ref.dhcp_option_name) == 4 && !(ntpServer.length)) {
                ntpServer += " " + dhcp_opt_ref.dhcp_option_value;
            }
            if (parseInt(dhcp_opt_ref.dhcp_option_name) == 6 && !(dnsServer.length)) {
                dnsServer = "Tenant Managed DNS: " + dhcp_opt_ref.dhcp_option_value;
            }
        }
        try {
            if ("network_ipam_mgmt" in ipam &&
                "ipam_dns_server" in ipam["network_ipam_mgmt"]) {

                if ((ipam["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"] != null) &&
                    "ip_address" in ipam["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"] &&
                    (ipam["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"]["ip_address"].length))
                    dnsServer += " Tenant Managed DNS: " +
                        ipam["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"]["ip_address"];
                if ((ipam["network_ipam_mgmt"]["ipam_dns_server"]["virtual_dns_server_name"] != null) &&
                    (ipam["network_ipam_mgmt"]["ipam_dns_server"]["virtual_dns_server_name"].length))
                    dnsServer += " Virtual DNS: " +
                        ipam["network_ipam_mgmt"]["ipam_dns_server"]["virtual_dns_server_name"];
            }
        } catch (e) {
        }

        if ("network_ipam_mgmt" in ipam &&
            "ipam_dns_method" in ipam["network_ipam_mgmt"] &&
            ipam["network_ipam_mgmt"]["ipam_dns_method"] == "none") {
            if(dnsServer != "") dnsServer += ", ";
            dnsServer += "DNS Mode : None";
        }

        if (!domainName.length) domainName = "-";
        if (!ntpServer.length)   ntpServer = "-";
        if (!dnsServer.length)   dnsServer = "-";

        ipamData.push({"id":idCount++, "ipam_name":ipam.fq_name[2],
            "uuid":ipam.uuid, "ip_blocks": ip_blocks_obj,
            "dns":dnsServer, "ntp":ntpServer,
            "domain_Name":domainName});
    }
    if(result.more == true || result.more == "true"){
        gridipam.showGridMessage("loading");
    } else {
        if(!ipamData || ipamData.length<=0)
            gridipam.showGridMessage('empty');
    }
    $("#gridipam").data("contrailGrid")._dataView.setData(ipamData);
}

function closeCreateIPAMWindow() {
    clearCreateEdit();
    mode = "";
}

function clearCreateEdit() {
    var ddDNSPtr = $("#ddDNS").data("contrailDropdown");
    var ddDNSVirtualP = $("#ddDnsVirtual").data("contrailDropdown");
    var dnsMethod = "default-dns-server";
    ddDNSPtr.value(dnsMethod);
    ddDNSVirtualP.value(ddDNSVirtualP.getAllData()[0]);

    clearVNEntries();
    $(txtIPAMName).val("");
    txtIPAMName[0].disabled = false;
    $(txtNTPServer).val("");
    $(txtdnsTenant).val("");
    $(txtDomainName).val("");
}

/**
 * Populate edited IPAM's values in controls
 */
function populateIpamEditWindow(rowIndex) {
    var selectedRow = $("#gridipam").data("contrailGrid")._dataView.getItem(rowIndex);
    var rowId = selectedRow["id"];
    var selectedIpam = configObj["network-ipams"][rowId];

    txtIPAMName.val(selectedRow.ipam_name);
    txtIPAMName[0].disabled = true;
    var ddDNSPtr = $("#ddDNS").data("contrailDropdown");
    var ddDNSVirtualP = $("#ddDnsVirtual").data("contrailDropdown");
    var dnsMethod = "none";

    if ("network_ipam_mgmt" in selectedIpam &&
        "ipam_dns_method" in selectedIpam["network_ipam_mgmt"] &&
        selectedIpam["network_ipam_mgmt"]["ipam_dns_method"] != null) {
        dnsMethod = selectedIpam["network_ipam_mgmt"]["ipam_dns_method"];

    }
    ddDNSPtr.value(dnsMethod);

    if (dnsMethod == "tenant-dns-server") {
        var tenantDnsIP = "";
        tenantDNSIp = selectedIpam["network_ipam_mgmt"]["ipam_dns_server"]
            ["tenant_dns_server_address"]["ip_address"];
        txtdnsTenant.val(tenantDNSIp);
    }
    if (dnsMethod == "virtual-dns-server") {
        var virtualDnsP = "";
        virtualDnsP = selectedIpam["network_ipam_mgmt"]["ipam_dns_server"]
            ["virtual_dns_server_name"];
        ddDNSVirtualP.text(virtualDnsP);
        /*ddDNSVirtualP.select(function (dataItem) {
            return dataItem.text == virtualDnsP;
        });*/
    }

    var dhcp_opt_len = 0;
    var dhcp_opt_ref = [];
    var domainName = "";
    var ntpServer = "";

    if(null !== selectedIpam && null !== selectedIpam["network_ipam_mgmt"] &&
        null !== selectedIpam["network_ipam_mgmt"]["dhcp_option_list"] &&
        typeof selectedIpam !== "undefined" && 
        typeof selectedIpam["network_ipam_mgmt"] !== "undefined" &&
        typeof selectedIpam["network_ipam_mgmt"]["dhcp_option_list"] !== "undefined") {
    if ("network_ipam_mgmt" in selectedIpam &&
        "dhcp_option_list" in selectedIpam["network_ipam_mgmt"] &&
        "dhcp_option" in selectedIpam["network_ipam_mgmt"]["dhcp_option_list"]) {
        dhcp_opt_len = selectedIpam["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"].length;
    }
    }
    for (var j = 0; j < dhcp_opt_len; j++) {
        dhcp_opt_ref = selectedIpam["network_ipam_mgmt"]["dhcp_option_list"]["dhcp_option"][j];
        if (parseInt(dhcp_opt_ref.dhcp_option_name) == 15 && !(domainName.length)) {
            domainName = dhcp_opt_ref.dhcp_option_value;
        }
        if (parseInt(dhcp_opt_ref.dhcp_option_name) == 4 && !(ntpServer.length)) {
            ntpServer = dhcp_opt_ref.dhcp_option_value;
        }
    }

    var nwNames = jsonPath(selectedIpam, "$.virtual_network_back_refs[*].to[2]");
    
    if (nwNames && nwNames.length > 0) {
        var nws = [];
        for (var i = 0; i < nwNames.length; i++) {
            var vn = jsonPath(selectedIpam, "$.virtual_network_back_refs[?(@.to[2]=='" + nwNames[i] + "')]")[0];
            var ipBlocks = jsonPath(vn, "$.attr.ipam_subnets[*]");
            for(var j=0; j<ipBlocks.length; j++) {
                //if(j==0)
                    nws.push({"IPBlock":ipBlocks[j]["subnet"]["ip_prefix"] + "/" + ipBlocks[j]["subnet"]["ip_prefix_len"], "Network":nwNames[i], "Gateway":ipBlocks[j]["default_gateway"]});
                //else
                    //nws.push({"IPBlock":ipBlocks[j]["subnet"]["ip_prefix"] + "/" + ipBlocks[j]["subnet"]["ip_prefix_len"], "Network":"",         "Gateway":ipBlocks[j]["default_gateway"]});
            }
        }
        for(var k=0; k<nws.length; k++) {
            var vnEntry = createVNEntry(nws[k], $("#vnTuples").children().length);
            $("#vnTuples").append($(vnEntry));
        }
    }

    txtNTPServer.val(ntpServer);
    txtDomainName.val(domainName);
    checkVirtualNetwork();
}

/**
 * IPAM Create window
 */
function ipamCreateEditWindow(mode,rowIndex) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown");
    var selectedDomainName =  $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProjectName = $("#ddProjectSwitcher").data("contrailDropdown").text();
    
    if(!isValidDomainAndProject(selectedDomainName, selectedProjectName)){
        gridipam.showGridMessage("errorGettingData");
        return;
    }
    
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/virtual-DNSs/" + selectedDomain.value(),
        type:"GET"
    });
    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/virtual-networks/",
        type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function () {
            var results = arguments;
            var vns = jsonPath(results[1][0], "$.virtual-networks[*].fq_name");
            var vnUUIDs = jsonPath(results[1][0], "$.virtual-networks[*].uuid");
            var vnData = [];
            configObj["virtual-networks"] = [];
            for(var i=0; i<vns.length; i++) {
                configObj["virtual-networks"].push(results[1][0]["virtual-networks"][i]);
                if(selectedDomainName === vns[i][0] && selectedProjectName === vns[i][1]) {
                    vnData.push({text: vns[i][2], value: vnUUIDs[i]});  
                } else {
                    if(checkSystemProject(vns[i][1]))
                        continue;
                    else
                        vnData.push({text: vns[i][0] + ":" + vns[i][1] + ":" + vns[i][2], value: vnUUIDs[i]});
                }
            }
            if(vnData.length == 0) {
                $("#btnCommonAddVN").addClass("disabled-link");
            } else {
                $("#btnCommonAddVN").removeClass("disabled-link");
            }         
            var vdns = results[0][0].virtual_DNSs;
            var virtualDNSs = [];
            var tmpStr = "";
            for (var i = 0; i < vdns.length; i++) {
                tmpStr = String(vdns[i]["virtual-DNS"]["fq_name"][0]) + ":" +
                    String(vdns[i]["virtual-DNS"]["fq_name"][1]);

                virtualDNSs.push({text:tmpStr, value:vdns[i]["virtual-DNS"]["uuid"]});
            }
            $("#ddDnsVirtual").data("contrailDropdown").setData(virtualDNSs);
            if(virtualDNSs.length > 0) {
                $("#ddDnsVirtual").data("contrailDropdown").text(virtualDNSs[0].text);
            }
            $("#ddDNS").data("contrailDropdown").value($("#ddDNS").data("contrailDropdown").getAllData()[0].value);
            if (mode == "edit") {
                windowCreateipam.find('.modal-header-title').text("Edit IP Address Management");
                var selectedRow = $("#gridipam").data("contrailGrid")._dataView.getItem(rowIndex);
                if(null === selectedRow || typeof selectedRow === "undefined" || {} === selectedRow ||
                    [] === selectedRow || "" === selectedRow) {
                    return false;
                }
                $('#btnCreateEditipamOK').data('uuid',selectedRow.uuid);
                populateIpamEditWindow(rowIndex);
            } else if (mode == "add") {
                checkVirtualNetwork();
                windowCreateipam.find('.modal-header-title').text("Add IP Address Management")
                $(txtIPAMName).focus();
            }
        },
        function () {
            //If atleast one api fails
            //var results = arguments;
        }
    );

    windowCreateipam.modal("show");
}

function createIPAMSuccessCb() {
    gridipam.showGridMessage('loading');
    windowCreateipam.modal("hide");
    fetchDataForGridIPAM();
}

function createIPAMFailureCb(result) {
    gridipam.showGridMessage('loading');
    windowCreateipam.modal("hide");
    fetchDataForGridIPAM();
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

    ddNetworks = $("#ddFwdMode").data("contrailDropdown");
    if(isSet(ddNetworks)) {
        ddNetworks.destroy();
        ddNetworks = $();
    }

    gridipam = $("#gridipam").data("contrailGrid");
    if(isSet(gridipam)) {
        gridipam.destroy();
        $("#gridipam").empty();
        gridipam = $();
    }

    ddDNS = $("#ddDNS").data("contrailDropdown");
    if(isSet(ddDNS)) {
        ddDNS.destroy();
        ddDNS = $();
    }
    
    ddDnsVirtual = $("#ddDnsVirtual").data("contrailDropdown");
    if(isSet(ddDnsVirtual)) {
        ddDnsVirtual.destroy();
        ddDnsVirtual = $();
    }

    windowCreateipam = $("#windowCreateipam");
    if(isSet(windowCreateipam)) {
        windowCreateipam.remove();
        windowCreateipam = $();
    }

    btnCreateEditipam = $("#btnCreateEditipam");
    if(isSet(btnCreateEditipam)) {
        btnCreateEditipam.remove();
        btnCreateEditipam = $();
    }

    btnDeleteIpam = $("#btnDeleteIpam");
    if(isSet(btnDeleteIpam)) {
        btnDeleteIpam.remove();
        btnDeleteIpam = $();
    }

    btnCreateEditipamCancel = $("#btnCreateEditipamCancel");
    if(isSet(btnCreateEditipamCancel)) {
        btnCreateEditipamCancel.remove();
        btnCreateEditipamCancel = $();
    }

    btnCreateEditipamOK = $("#btnCreateEditipamOK");
    if(isSet(btnCreateEditipamOK)) {
        btnCreateEditipamOK.remove();
        btnCreateEditipamOK = $();
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

    btnAddIPBlock = $("#btnAddIPBlock");
    if(isSet(btnAddIPBlock)) {
        btnAddIPBlock.remove();
        btnAddIPBlock = $();
    }

    btnDeleteIPBlock = $("#btnDeleteIPBlock");
    if(isSet(btnDeleteIPBlock)) {
        btnDeleteIPBlock.remove();
        btnDeleteIPBlock = $();
    }
    
    txtIPAMName = $("#txtIPAMName");
    if(isSet(txtIPAMName)) {
        txtIPAMName.remove();
        txtIPAMName = $();
    }

    txtdnsTenant = $("#txtdnsTenant");
    if(isSet(txtdnsTenant)) {
        txtdnsTenant.remove();
        txtdnsTenant = $();
    }

    txtDomainName = $("#txtDomainName");
    if(isSet(txtDomainName)) {
        txtDomainName.remove();
        txtDomainName = $();
    }

    txtNTPServer = $("#txtNTPServer");
    if(isSet(txtNTPServer)) {
        txtNTPServer.remove();
        txtNTPServer = $();
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
    
    var gridIpamDetailTemplate = $("#gridIpamDetailTemplate");
    if(isSet(gridIpamDetailTemplate)) {
        gridIpamDetailTemplate.remove();
        gridIpamDetailTemplate = $();
    }
    
    var ipamConfigTemplate = $("#ipam-config-template");
    if(isSet(ipamConfigTemplate)) {
        ipamConfigTemplate.remove();
        ipamConfigTemplate = $();
    }
}
