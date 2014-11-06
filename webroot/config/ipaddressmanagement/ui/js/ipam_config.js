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
    this.ipamCreateEditWindow       = ipamCreateEditWindow;
    this.successHandlerForGridIPAM  = successHandlerForGridIPAM;
    this.failureHandlerForGridIPAM  = failureHandlerForGridIPAM;
    this.createIPAMSuccessCb        = createIPAMSuccessCb;
    this.createIPAMFailureCb        = createIPAMFailureCb;
    this.getAllDNSServerIPs         = getAllDNSServerIPs;
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
    //Disable add in case of vCenter
    if(isVCenter())
        btnCreateEditipam.addClass('disabled-link');
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridIPAM");
}

function initComponents() {
    var actionCell = [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            ipamCreateEditWindow('edit',rowIndex);
                        }
                    }];
    if(!isVCenter()) {
        actionCell.push({
                        title: 'Delete',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showRemoveWindow(rowIndex);
                        }
                    });
    }
    $("#gridipam").contrailGrid({
        header : {
            title : {
                text : 'IP Address Management'
            },
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
                           ' more)</span><span class="moredata" style="display:none;"></span>';
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
                        if(!isVCenter())
                            $('#btnDeleteIpam').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: actionCell,
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

    windowCreateipam = $("#windowCreateipam");
    windowCreateipam.on("hide", closeCreateIPAMWindow);
    windowCreateipam.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

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
        if(verify === false) {
            return;
        }
        if(validateDNSServerIP() === false) {
           return;
        }
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
        var dns_domain = $(txtDomainName).val();
        var mode = "";

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
            if (dnsMethod == "tenant-dns-server") {
                var dnsIPs = getAllDNSServerIPs(); 
                ipam["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"]["tenant_dns_server_address"]["ip_address"] = dnsIPs;
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

            var vnBackRefs = jsonPath(configObj, "$.network-ipams[?(@.uuid=='" + $("#btnCreateEditipamOK").data().uuid + "')]");
            if(false !== vnBackRefs & null !== vnBackRefs[0]) {
                vnBackRefs = vnBackRefs[0].virtual_network_back_refs;
                ipam["network-ipam"]["virtual_network_refs"] = vnBackRefs;
            }

            if ($(txtIPAMName)[0].disabled == true)
                mode = "edit";
            else
                mode = "add";
            ipam["network-ipam"]["display_name"] = ipam["network-ipam"]["fq_name"][ipam["network-ipam"]["fq_name"].length-1];
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
    if(selectedDNSText === "Virtual DNS") {
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
        var sel_domain = getSelectedDomainProjectObjNew("ddDomainSwitcher", "contrailDropdown", 'domain');                
        $("#ddDomainSwitcher").data("contrailDropdown").value(sel_domain);
        fetchProjects("populateProjects", "failureHandlerForGridIPAM");
    } else {
        $("#gridipam").data("contrailGrid")._dataView.setData([]);
        btnCreateEditipam.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');        
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridipam.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');        
    }        
}    

function handleDomains(e) {
    //fetchDataForGridIPAM();
    var dName = e.added.text;
    setCookie("domain", dName);        
    fetchProjects("populateProjects", "failureHandlerForGridIPAM");
}

function populateProjects(result) {
    if (result && result.projects && result.projects.length > 0) {
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
        if(!isVCenter())
            btnCreateEditipam.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForGridIPAM();
    } else {
        $("#gridipam").data("contrailGrid")._dataView.setData([]);
        btnCreateEditipam.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridipam.showGridMessage("empty");
        emptyCookie('project');                        
    }
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
            "displayName":ipam.display_name,
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
    $('#btnCreateEditipamOK').data('uuid',"");
    $(txtIPAMName).val("");
    txtIPAMName[0].disabled = false;
    $(txtNTPServer).val("");
    $(txtDomainName).val("");
    clearDNSServerIPEntry();
}

/**
 * Populate edited IPAM's values in controls
 */
function populateIpamEditWindow(rowIndex) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();

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
        for(var i = 0; i < tenantDNSIp.length ; i++) {
            var DNSIPEntry = createDNSServerIPEntry(tenantDNSIp[i], i);
            $("#DNSServerIPTuples").append(DNSIPEntry);               
        }
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
        null !== getValueByJsonPath(selectedIpam,"network_ipam_mgmt;dhcp_option_list") &&
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

    txtNTPServer.val(ntpServer);
    txtDomainName.val(domainName);
    checkVirtualNetwork();
}

/**
 * IPAM Create window
 */
function ipamCreateEditWindow(mode,rowIndex) {
    //Looks when add is disabled,edit is also disabled
    if(!isVCenter()) {
        if($("#btnCreateEditipam").hasClass('disabled-link')) {
            return;
        }
    }
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown");
    var selectedDomainName =  $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProjectName = $("#ddProjectSwitcher").data("contrailDropdown").text();
    
    if(!isValidDomainAndProject(selectedDomainName, selectedProjectName)){
        gridipam.showGridMessage("errorGettingData");
        return;
    }
    
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        //url:"/api/tenants/config/virtual-DNSs/" + selectedDomain.value(),
        url:"/api/tenants/config/virtual-DNSs/",
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

function appendDNSServerIPEntry(who, defaultRow) {
    if(validateDNSServerIP() === false)
        return false;
    var DNSServerIPEntry = createDNSServerIPEntry(null, $("#DNSServerIPTuples").children().length);
    if (defaultRow) {
        $("#DNSServerIPTuples").prepend($(DNSServerIPEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(DNSServerIPEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateipam", DNSServerIPEntry, false);
}

function deleteDNSServerIPEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearDNSServerIPEntry() {
    var tuples = $("#DNSServerIPTuples").children();
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#DNSServerIPTuples").empty();
    }
}

function createDNSServerIPEntry(DNSServerIP, len) {
    var inputTxtDNSServerName = document.createElement("input");
    inputTxtDNSServerName.type = "text";
    inputTxtDNSServerName.className = "span12";
    inputTxtDNSServerName.setAttribute("placeholder", "DNS Server IP");
    var divDNSServerName = document.createElement("div");
    divDNSServerName.className = "span10";
    divDNSServerName.appendChild(inputTxtDNSServerName);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendDNSServerIPEntry(this);");
    iBtnAddRule.setAttribute("title", "Add DNS Server IP below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteDNSServerIPEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete DNS Server IP");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5 span10";
    divRowFluidMargin5.appendChild(divDNSServerName);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.className = "span12 margin-0-0-5";
    rootDiv.appendChild(divRowFluidMargin5);

    if (null !== DNSServerIP && typeof DNSServerIP !== "undefined") {
        $(inputTxtDNSServerName).val(DNSServerIP);
        $(inputTxtDNSServerName).addClass("textBackground");
    }
    return rootDiv;
}

function getAllDNSServerIPs(){
    var DNSServerIPTuples = $("#DNSServerIPTuples")[0].children;
    var allDNSServerIPs = [];
    if (DNSServerIPTuples && DNSServerIPTuples.length > 0) {
        for (var i = 0; i < DNSServerIPTuples.length; i++) {
            var DNSServerIPTuple = $($(DNSServerIPTuples[i]).find("div")[0]).children();
            var srIpam = $(DNSServerIPTuple[0].children[0]).val();
            allDNSServerIPs.push(srIpam);
        }
    }
    return allDNSServerIPs;
}

function validateDNSServerIP(){
    var len = $("#DNSServerIPTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var DNSServerIP =
                $($($($("#DNSServerIPTuples").children()[i]).find(".span10")[0]).find("input")).val().trim();
            if (typeof DNSServerIP === "undefined" || DNSServerIP === "") {
                showInfoWindow("Enter DNS Server IP", "Input required");
                return false;
            } else if(!validip(DNSServerIP.trim())){
                showInfoWindow("Enter valid Tenant DNS Server IP in xxx.xxx.xxx.xxx/xx format", "Invalid input in DNS Server IP");
                return false;
            }
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
