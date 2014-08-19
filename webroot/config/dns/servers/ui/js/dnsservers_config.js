/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

dnsServersConfigObj = new dnsServersConfig();

function dnsServersConfig() {
    //Variable definitions

    //Text Box
    var txtDNSServerName, txtDomainName, txtTimeLive;

    //Dropdowns
    var ddDomain, ddProject, ddLoadBal;

    //combo Box
    var cmbDNSForward;

    //Multi Select Drop Down
    var msIPams;

    //Grids
    var gridDNSServer;

    //Buttons
    var btnCreateDNSServer, btnDeleteDNSServer,
        btnCreateDNSServerCancel, btnCreateDNSServerOK,
        btnCnfDelPopupOK, btnCnfDelPopupCancel;

    //Datasources
    var dsGridDNSServer;

    //Windows
    var windowCreateDNSServer, confirmDelete, confirmDeleterow;
    var mode="create";
    var disGlobal ="";
    virtualDNSs = [];
    var idCount = 0;
	var drAjaxcount = 0;
    var ajaxParam;
    activeDNSRootPath = '/config/dns/records/ui/', activeDNSHash = 'dnsrecords_dynamic_config';

    //Method definitions
    this.load                       = load;
    this.init                       = init;
    this.initComponents             = initComponents;
    this.initActions                = initActions;
    this.fetchData                  = fetchData;
    this.fetchDataForGridDNSServer  = fetchDataForGridDNSServer;
    this.populateDomains            = populateDomains;
    this.handleDomains              = handleDomains;
    this.populateProjects           = populateProjects;
    this.handleProjects             = handleProjects;
    this.closeCreateDNSServerWindow = closeCreateDNSServerWindow;
    this.DNSServerCreateWindow      = DNSServerCreateWindow;
    this.successHandlerForDNSServer = successHandlerForDNSServer;
    this.failureHandlerForDNSServer = failureHandlerForDNSServer;
    this.createDNSServerSuccessCb   = createDNSServerSuccessCb;
    this.createDNSServerFailureCb   = createDNSServerFailureCb;
    this.updateViewByHash           = updateViewByHash;
    this.destroy                    = destroy;   
}

function load() {
    var hashParams = arguments[0].hashParams;
    if(hashParams.tab) {
        this.destroy();
        loadActiveDNSRecords();   
        return;         
    }
    var configTemplate = Handlebars.compile($("#DNSServer-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_dns_dnsservers';
    init();
}

function updateViewByHash(hashObj, lastHashObj) {
    this.load({hashParams : hashObj});
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForDNSServer");
}

function initComponents() {
    $("#gridDNSServer").contrailGrid({
        header : {
            title:{
                text : 'DNS Servers',
                //cssClass : 'blue',
                //icon : 'icon-list',
                //iconCssClass : 'blue'                
            },
            customControls: ['<a id="btnDeleteDNSServer" class="disabled-link" title="Delete DNS Server(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateDNSServer" title="Create DNS Server"><i class="icon-plus"></i></a>',
                '<div id="ddProjectSwitcher"/>',
                'Domain: <div id="ddDomainSwitcher" />']
        },  
        columnHeader : {
            columns : [
            {
                id : 'dnsserver_name',
                field : 'dnsserver_name',
                name : 'DNS Server',
                cssClass :'cell-hyperlink-blue',
                events : {
                    onClick : function(e, dc) {
                        layoutHandler.setURLHashParams({uuid : dc.uuid} ,{p : 'config_dns_dnsrecords' ,merge : false ,triggerHashChange : true});
                    }
                } 
            } ,
            {
                id : 'domain_name',
                field : 'domain_name',
                name : 'Domain Name'
            } ,
             {
                id : 'forward',
                field : 'forward',
                name : 'Forwarders'
            }]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteDNSServer').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteDNSServer').removeClass('disabled-link');
                    }
                },                
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            dnsServerEditWindow(rowIndex);
                        }
					},
                    {
                        title: 'Delete',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showDelWindow(rowIndex);
                        }
                    },
                    {
                        title: 'Active DNS Database',
                        onClick: function(rowIndex){
                            var selectedRow = $("#gridDNSServer").data("contrailGrid")._dataView.getItem(rowIndex);
                            $.bbq.pushState({ q: { tab : activeDNSHash, dns : selectedRow.dnsserver_name }});
                        }   
                    }                    
                ],
                detail : {
                    template : $("#gridDNSServerDetailTemplate").html()
                }    
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading DNS Servers..'
                },
                empty: {
                    text: 'No DNS Servers.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting DNS Servers.' 
                }
           }            
        }
    });

    gridDNSServer = $("#gridDNSServer").data("contrailGrid");

    txtDNSServerName         = $("#txtDNSServerName");
    txtDomainName            = $("#txtDomainName");
    cmbDNSForward            = $("#cmbDNSForward");
    txtTimeLive              = $("#txtTimeLive");
    btnCreateDNSServer       = $("#btnCreateDNSServer");
    btnDeleteDNSServer       = $("#btnDeleteDNSServer");
    btnCreateDNSServerCancel = $("#btnCreateDNSServerCancel");
    btnCreateDNSServerOK     = $("#btnCreateDNSServerOK");
    btnCnfDelPopupOK         = $("#btnCnfDelPopupOK");
    btnCnfDelPopupCancel     = $("#btnCnfDelPopupCancel");
    btnCnfDelRowPopupOK      = $("#btnCnfDelRowPopupOK");
    btnCnfDelRowPopupCancel  = $("#btnCnfDelRowPopupCancel");
    drAjaxcount = 0;
    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleProjects
    });
    $("#ddProjectSwitcher").data('contrailDropdown').hide();
    ddLoadBal = $("#ddLoadBal").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
    });
    msIPams = $("#msIPams").contrailMultiselect({
        dataTextField:"text",
        dataValueField:"value"
    });
    cmbDNSForward = $("#cmbDNSForward").contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
	    placeholder:"Enter Forwarder IP or Select a DNS Server"
    });
    var loadBalVal = [
        {text:"Random", value:"random"},
        {text:"Fixed", value:"fixed"},
        {text:"Round-Robin", value:"round-robin"}
    ];
    gridDNSServer.showGridMessage('loading');

    $("#ddLoadBal").data("contrailDropdown").setData(loadBalVal);
    $("#ddLoadBal").data("contrailDropdown").value(loadBalVal[0].value);
    $("#ddLoadBal").data("contrailDropdown").text(loadBalVal[0].text);
    
    windowCreateDNSServer = $("#windowCreateDNSServer");
    windowCreateDNSServer.modal({backdrop:'static', keyboard: false, show:false});

    confirmDelete = $("#confirmDelete");
    confirmDelete.modal({backdrop:'static', keyboard: false, show:false});

    confirmDeleterow = $("#confirmDeleterow");
    confirmDeleterow.modal({backdrop:'static', keyboard: false, show:false});
}

function loadActiveDNSRecords() {
    getScript(activeDNSRootPath + '/js/' + activeDNSHash + '.js', function() {
        $.ajax({
            type : "GET",
            url : activeDNSRootPath + '/views/' + activeDNSHash + '.view' + '?built_at=' + built_at,
            success : function(result) {
                $("body").append(result);
                pushBreadcrumb(['Active DNS Database']);    
                dnsRecordsDynamicConfigObj.load();   
            },
            cache:true
       });
    });    
}

function initGridDNSServerDetail(e) {
    var detailRow = e.detailRow;
}

function initActions() {
    btnCreateDNSServer.click(function (a) {
        DNSServerCreateWindow("create");
    });

    btnDeleteDNSServer.click(function (a) {	
        if(!$(this).hasClass('disabled-link')) {    
            confirmDelete.find('.modal-header-title').text("Confirm");
            confirmDelete.modal('show');
        }    
    });

    btnCreateDNSServerCancel.click(function (a) {
        windowCreateDNSServer.modal('hide');
    });

    btnCnfDelPopupCancel.click(function (a) {
        confirmDelete.modal('hide')
    });
    
     btnCnfDelRowPopupCancel.click(function (a) {
        confirmDeleterow.modal('hide')
    });

    btnCnfDelPopupOK.click(function (a) {
	    btnDeleteDNSServer.attr("disabled","disabled");	
        //Release functions
        confirmDelete.modal('hide');
        var deleteAjaxs = [];
        var selected_rows = $("#gridDNSServer").data("contrailGrid").getCheckedRows();
        deleteDNSServer(selected_rows);
    });

    btnCreateDNSServerOK.click(function (a) {
        var selectedDomainTxt = $("#ddDomainSwitcher").data("contrailDropdown").text();
        if(!isValidDomain(selectedDomainTxt)){
            gridDNSServer.showGridMessage("empty");
        	return;
        }
        var nameTxt = $(txtDNSServerName).val();
        var domainTxt = $(txtDomainName).val();
        var ttlTxt  =$(txtTimeLive).val();
        var ttlVal = 86400;
        var forwarderTxt = $("#cmbDNSForward").data("contrailCombobox").text();
        var recordResTxt = $("#ddLoadBal").data("contrailDropdown").value();
        var assocIpamsTxt = $("#msIPams").data("contrailMultiselect").text();
        var selIPAMs = $("#msIPams").data('contrailMultiselect').getSelectedData();
        var assocIpams = null;
        var dnsServerCfg = {};

        var validatReturn = validate();
        if (validatReturn != true) {
            return false;
        }
	    windowCreateDNSServer.modal('hide');

        dnsServerCfg["virtual-DNS"] = {};
        dnsServerCfg["virtual-DNS"]["parent_type"] = "domain";
        dnsServerCfg["virtual-DNS"]["fq_name"] = [];
        dnsServerCfg["virtual-DNS"]["fq_name"] = [selectedDomainTxt, nameTxt];
        dnsServerCfg["virtual-DNS"]["virtual_DNS_data"] = {};
        dnsServerCfg["virtual-DNS"]["virtual_DNS_data"]["dynamic_records_from_client"] = true;
        if (ttlTxt.length && parseInt(ttlTxt)) {
            ttlVal = parseInt(ttlTxt);
        }
        dnsServerCfg["virtual-DNS"]["virtual_DNS_data"]["default_ttl_seconds"] = ttlVal;
        dnsServerCfg["virtual-DNS"]["virtual_DNS_data"]["domain_name"] = domainTxt;
        dnsServerCfg["virtual-DNS"]["virtual_DNS_data"]["record_order"] = recordResTxt;
        if (forwarderTxt.length) {
            dnsServerCfg["virtual-DNS"]["virtual_DNS_data"]["next_virtual_DNS"] = forwarderTxt;
        }

        if (selIPAMs.length) {
            dnsServerCfg["virtual-DNS"]["network_ipam_back_refs"] = [];
            for (var i = 0; i < selIPAMs.length; i++) {
		var nq=selIPAMs[i].data;
                assocIpams = JSON.parse(nq);
                dnsServerCfg["virtual-DNS"]["network_ipam_back_refs"][i] =
                {'to':assocIpams.name, 'uuid':assocIpams.uuid};
            }
        }
        var url,type;
	    if(mode === "create"){
		    url="/api/tenants/config/virtual-DNSs";
		    type="POST";	
	    }
	    else if(mode ==="edit"){
		    url='/api/tenants/config/virtual-DNS/'+ gblSelRow["uuid"];
		    type="PUT";
	    }
        dnsServerCfg["virtual-DNS"]["display_name"] = dnsServerCfg["virtual-DNS"]["fq_name"][dnsServerCfg["virtual-DNS"]["fq_name"].length-1];
        doAjaxCall(url, type, JSON.stringify(dnsServerCfg),
            "createDNSServerSuccessCb", "createDNSServerFailureCb");
    });
}

function deleteDNSServer(selected_rows) {
    if(selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/virtual-DNS/"; 
        cbParams.urlField = "uuid";
        cbParams.fetchDataFunction = "createDNSServerSuccessCb";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting DNS Server - ";
        cbParams.errorField = "dnsserver_name";
        deleteObject(cbParams);
    }
}

function dnsServerEditWindow(i) {
	//Edit Code has to be done
	gblSelRow = $("#gridDNSServer").data("contrailGrid")._dataView.getItem(i);
	DNSServerCreateWindow("edit", gblSelRow["dnsserver_name"]);
}

function showDelWindow(i){

	$.contrailBootstrapModal({
        id: 'confirmRemove',
        title: 'Remove',
        body: '<h6>Confirm DNS Server delete</h6>',
        footer: [{
           title: 'Cancel',
           onclick: 'close',
        },
        {
           id: 'btnRemovePopupOK',
           title: 'Confirm',
           onclick: function(){
               var selected_row = $("#gridDNSServer").data("contrailGrid")._dataView.getItem(i);
                deleteDNSServer([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
        }
        ]
    });

}

function validate(){
    if($(txtDNSServerName).val().trim() == ""){
        showInfoWindow("Enter a DNS Server Name", "Input required");
        return false;
    }
    if ($(txtDomainName).val().trim() == "") {
        showInfoWindow("Enter a Domain Name", "Input required");
        return false;
    }
   //time to live validations	
    var v=$("#txtTimeLive").val().trim();
   if(v !== ""){
	if(allowNumeric(v)){
		if(!validateTTLRange(parseInt(v))){
			showInfoWindow('Time To Live value should be in  "0 - 2147483647" range',"Input required");
			return false;
		}	
    	}
	else {
		showInfoWindow("Time To Live value should be  a number","Input required");
			return false;
	}
   }
		
   //dns forwarder validations
    var f=$("#cmbDNSForward").data("contrailCombobox").text();
   if(f != ""){	
    var isSel_fwd=false;
    for(var i=0;i<virtualDNSs.length;i++){
	var dns=virtualDNSs[i];
	if(dns.text === f)
		isSel_fwd=true
	   		 
    }
	if(!isSel_fwd){
		 if(!validateIPAddress(f)){
                        showInfoWindow("DNS Forwarder should be either valid IP address or chosen DNS Server ","Input required");
                        return false;
                }

	}
   }
    return true;
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
        $("#ddDomainSwitcher").data("contrailDropdown").value(sel_domain)
        fetchProjects("populateProjects", "failureHandlerForDNSServer");
		btnCreateDNSServer.attr("disabled",false);
    } else {
        $("#gridDNSServer").data("contrailGrid")._dataView.setData([]);
        btnCreateDNSServer.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');                
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridDNSServer.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');        
    }  
}    

function handleDomains(e) {
    var dName = e.added.text;
    setCookie("domain", dName);        
    fetchProjects("populateProjects", "failureHandlerForDNSServer");
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
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data('contrailDropdown').value(sel_project);
        $("#ddProjectSwitcher").data('contrailDropdown').hide();
    } else {
        //$("#gridDNSServer").data("contrailGrid")._dataView.setData([]);
        //btnCreateDNSServer.addClass('disabled-link');
        //gridDNSServer.showGridMessage("empty");
        emptyCookie('project');                
    } 
    fetchDataForGridDNSServer();    
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridDNSServer();
}

function fetchDataForGridDNSServer() { 
    var selectedDomainTxt = $("#ddDomainSwitcher").data("contrailDropdown").text(); 
    if(!isValidDomain(selectedDomainTxt)){ 
        gridDNSServer.showGridMessage('empty');
   	return;
    }
    $("#cb_gridDNSServer").attr("checked", false);
    $("#gridDNSServer").data("contrailGrid")._dataView.setData([]);
    gridDNSServer.showGridMessage('loading');
    idCount = 0;
	drAjaxcount++;
    ajaxParam = $("#ddDomainSwitcher").data('contrailDropdown').value() + "_" + drAjaxcount;
    doAjaxCall(
        "/api/admin/config/get-data?type=virtual-DNS&count=4&fqnUUID=" + $("#ddDomainSwitcher").data('contrailDropdown').value(), "GET",
        null, "successHandlerForDNSServer", "failureHandlerForDNSServerRow", null, ajaxParam
    );
}

function successHandlerForDNSServer(result,cbparam) {
    if(cbparam != ajaxParam){
	    return;
	}
    $(".headerRowCheckbox").attr("checked",false); 
    if(result.more == true || result.more == "true"){
        doAjaxCall("/api/admin/config/get-data?type=virtual-DNS&count=4&fqnUUID="+ 
            $("#ddDomainSwitcher").data('contrailDropdown').value() +"&lastKey="+result.lastKey, 
            "GET", null, "successHandlerForDNSServer", "failureHandlerForDNSServerRow", null, cbparam); 
    }
    successHandlerForDNSServerRow(result);
}

function failureHandlerForDNSServerRow(result) {
    gridDNSServer.showGridMessage('errorGettingData');	
}

function successHandlerForDNSServerRow(result) { 
    gridDNSServer.removeGridMessage();
    var DNSServerData = [];
    var dnsServers = jsonPath(result, "$..virtual-DNS");

    configObj["virtual-DNSs"] = [];

    for (var i = 0; i < dnsServers.length; i++) {
        var dnsServer = dnsServers[i];
        configObj["virtual-DNSs"][i] = dnsServers[i];

        var domainName = "-"
        var dnsData = null;
        var dns_ttl = 0;
        var rec_res_ord = "-";
        var forwarder = "-";
        var ipamTxt = "-";

        if ('virtual_DNS_data' in dnsServer) {
            dnsData = dnsServer['virtual_DNS_data'];
            if ('domain_name' in dnsData &&
                dnsData['domain_name'] != null &&
                dnsData['domain_name'].length) {
                domainName = dnsData['domain_name'];
            }
            if ('default_ttl_seconds' in dnsData &&
                dnsData['default_ttl_seconds'] != null) {
                dns_ttl = dnsData['default_ttl_seconds'];
            }
            if ('record_order' in dnsData &&
                dnsData['record_order'] != null) {
                rec_res_ord = dnsData['record_order'];
            }
            if ('next_virtual_DNS' in dnsData &&
                dnsData['next_virtual_DNS'] != null) {
                forwarder = dnsData['next_virtual_DNS'];
            }
        }

        if ('network_ipam_back_refs' in dnsServer &&
            dnsServer['network_ipam_back_refs'].length) {
            var ipam_ref = dnsServer['network_ipam_back_refs'];
            var ipam_ref_len = ipam_ref.length;
            ipamTxt = "";
            for (var j = 0; j < ipam_ref_len; j++) {
                ipamTxt += ipam_ref[j]['to'][1] + ":" +
                    ipam_ref[j]['to'][2];
                if (j < (ipam_ref_len - 1))
                    ipamTxt += ", ";
            }
        }

        DNSServerData.push({"Id":idCount++, "uuid":dnsServer.uuid,
            "dnsserver_name":dnsServer.name,
            "domain_name":domainName,
            "dns_ttl":dns_ttl,
            "record_resolution_order":rec_res_ord,
            "forward":forwarder,
            "Associated_IPAM":ipamTxt,
        });
    }
    $("#gridDNSServer").data("contrailGrid")._dataView.addData(DNSServerData);
    if(result.more == true || result.more == "true"){
	   gridDNSServer.showGridMessage('loading');
	} else {
       if(!dnsServers) {
           gridDNSServer.showGridMessage('empty'); 
       }    
    }
}

function failureHandlerForDNSServer(result, cbParam) {
    gridDNSServer.showGridMessage('errorGettingData');
}

function closeCreateDNSServerWindow() {
    //clearPopup();
}
function clearPopup() {
    //New values added
     txtDNSServerName[0].disabled=false;
     txtDomainName[0].disabled=false;	
    var msIpamsTemp = $("#msIPams").data("contrailMultiselect");
    msIpamsTemp.value("")
    var cmbDNSForwardTemp = $("#cmbDNSForward").data("contrailCombobox");
    cmbDNSForwardTemp.value("")
    $(txtDomainName).val("");
    $(txtTimeLive).val("");
    $(txtDNSServerName).val("");
    var ddLoadBalTemp  = $("#ddLoadBal").data("contrailDropdown");
    d = ddLoadBalTemp.getAllData()[0];
    ddLoadBalTemp.value(d.value);
    ddLoadBalTemp.text(d.text);
    mode = "create";
    virtualDNSs = [];
}


function DNSServerCreateWindow(m, selDNSName) {
    clearPopup();	
    mode = m;	 
    var selectedDomainTxt =  $("#ddDomainSwitcher").data("contrailDropdown").text();
    if(!isValidDomain(selectedDomainTxt)){
        gridDNSServer.showGridMessage("empty");
        return;
    }	    
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        //url:"/api/tenants/config/virtual-DNSs/" + $("#ddDomainSwitcher").data('contrailDropdown').value(),
        url:"/api/tenants/config/virtual-DNSs",
        type:"GET"
    });
    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/ipams",
        type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function () {
            var results = arguments;
            var vdns = results[0][0].virtual_DNSs; 
            var ipams = results[1][0]["network-ipams"];
            var netIpams = [];
            var tmpStr = "";
            for (var i = 0; i < ipams.length; i++) {
		var t=ipams[i].fq_name;
		var actVal=t[1]+":"+t[2];
                netIpams.push({text:actVal,value:actVal,data:JSON.stringify({name:t,
                    uuid:ipams[i].uuid})});
            }
            $("#msIPams").data("contrailMultiselect").setData(netIpams);
            var winTitle="Create DNS Server";
            if(mode =="edit"){
                winTitle="Edit DNS Server";
                for (var i = 0; i < vdns.length; i++) {
                    if(selDNSName !== String(vdns[i]["virtual-DNS"]["fq_name"][1])){
                        var tmpStr = String(vdns[i]["virtual-DNS"]["fq_name"][0]) + ":" +
                        String(vdns[i]["virtual-DNS"]["fq_name"][1]);
                        virtualDNSs.push({text:tmpStr, value:tmpStr});
                    }
                }
                $("#cmbDNSForward").data("contrailCombobox").setData(virtualDNSs);
                populateDNSServerEditWindow();
            } else {
                 for (var i = 0; i < vdns.length; i++) {
                        var tmpStr = String(vdns[i]["virtual-DNS"]["fq_name"][0]) + ":" +
                        String(vdns[i]["virtual-DNS"]["fq_name"][1]);
                        virtualDNSs.push({text:tmpStr, value:tmpStr});
                }
                $("#cmbDNSForward").data("contrailCombobox").setData(virtualDNSs);
            }

            windowCreateDNSServer.find('.modal-header-title').text(winTitle);
        }, 
        function () {
            //If atleast one api fails
            //var results = arguments;
        }
    );
    windowCreateDNSServer.modal('show');
    txtDNSServerName.focus();
}

function populateDNSServerEditWindow(){
    var selectedRow  = gblSelRow;
    var rowId        = selectedRow["Id"];
    var SelectedDNS = configObj["virtual-DNSs"][rowId];
    var ipams = selectedRow.Associated_IPAM;
    txtDNSServerName.val(selectedRow.dnsserver_name);
    txtDNSServerName[0].disabled = true;
    txtDomainName.val(selectedRow.domain_name);
    txtDomainName[0].disabled=true;	
    txtTimeLive.val(selectedRow.dns_ttl);
    
    //dropdownlist.value($("#value").val());
    
    ddLoadBal = $("#ddLoadBal").data("contrailDropdown");
    ddLoadBal.value(selectedRow.record_resolution_order);
    
    cmbDNSForward = $("#cmbDNSForward").data("contrailCombobox");
    if(selectedRow.forward != "-")	
    	cmbDNSForward.text(selectedRow.forward);
    
    msIPams = $("#msIPams").data("contrailMultiselect");
    if(ipams !=''){
     var arry=ipams.split(',');	
     var ai=[];	
     for(var i=0;i<arry.length;i++){
		arry[i]=arry[i].trim();	
		ai.push(arry[i]);
	}	
     msIPams.value(ai);
   }
}

function createDNSServerSuccessCb() {
    closeCreateDNSServerWindow();
    fetchDataForGridDNSServer();
}

function createDNSServerFailureCb() {
    closeCreateDNSServerWindow();
    fetchDataForGridDNSServer();
}

function ucfirst(str) {
    if (str == null)
        return "-";
    var firstLetter = str.slice(0, 1);
    return firstLetter.toUpperCase() + str.substring(1);
}

function destroy() {
    var ddDomain = $("#ddDomainSwitcher").data("contrailDropdown");
    if(isSet(ddDomain)) {
       ddDomain.destroy();
       ddDomain = $();
    }

    var ddProject = $("#ddProjectSwitcher").data("contrailDropdown");
    if(isSet(ddProject)) {
       ddProject.destroy();
       ddProject = $();
    }

    txtDNSServerName = $("#txtDNSServerName");
    if(isSet(txtDNSServerName)) {
       txtDNSServerName.remove();
       txtDNSServerName = $();
    }

    txtDomainName = $("#txtDomainName");
    if(isSet(txtDomainName)) {
       txtDomainName.remove();
       txtDomainName = $();
    }

    cmbDNSForward = $("#cmbDNSForward").data("contrailCombobox");
    if(isSet(cmbDNSForward)) {
       cmbDNSForward.destroy();
       cmbDNSForward = $();
    }

    txtTimeLive = $("#txtTimeLive");
    if(isSet(txtTimeLive)) {
       txtTimeLive.remove();
       txtTimeLive = $();
    }

    var ddLoadBal = $("#ddLoadBal").data("contrailDropdown");
    if(isSet(ddLoadBal)) {
       ddLoadBal.destroy();
       ddLoadBal = $();
    }

    msIPams = $("#msIPams").data("contrailMultiselect");
    if(isSet(msIPams)) {
       msIPams.destroy();
       msIPams = $();
    }

    btnCreateDNSServer = $("#btnCreateDNSServer");
    if(isSet(btnCreateDNSServer)) {
       btnCreateDNSServer.remove();
       btnCreateDNSServer = $();
    }

    btnDeleteDNSServer = $("#btnDeleteDNSServer");
    if(isSet(btnDeleteDNSServer)) {
       btnDeleteDNSServer.remove();
       btnDeleteDNSServer = $();
    }

    btnCreateDNSServerCancel = $("#btnCreateDNSServerCancel");
    if(isSet(btnCreateDNSServerCancel)) {
       btnCreateDNSServerCancel.remove();
       btnCreateDNSServerCancel = $();
    }

    btnCreateDNSServerOK = $("#btnCreateDNSServerOK");
    if(isSet(btnCreateDNSServerOK)) {
       btnCreateDNSServerOK.remove();
       btnCreateDNSServerOK = $();
    }

    btnCnfDelPopupOK = $("#btnCnfDelPopupOK");
    if(isSet(btnCnfDelPopupOK)) {
       btnCnfDelPopupOK.remove();
       btnCnfDelPopupOK = $();
    }

    btnCnfDelPopupCancel = $("#btnCnfDelPopupCancel");
    if(isSet(btnCnfDelPopupCancel)) {
       btnCnfDelPopupCancel.remove();
       btnCnfDelPopupCancel = $();
    }

    btnCnfDelRowPopupOK = $("#btnCnfDelRowPopupOK");
    if(isSet(btnCnfDelRowPopupOK)) {
       btnCnfDelRowPopupOK.remove();
       btnCnfDelRowPopupOK = $();
    }
    
    btnCnfDelRowPopupCancel = $("#btnCnfDelRowPopupCancel");
    if(isSet(btnCnfDelRowPopupCancel)) {
       btnCnfDelRowPopupCancel.remove();
       btnCnfDelRowPopupCancel = $();
    }

    confirmDelete = $("#confirmDelete");
    if(isSet(confirmDelete)) {
       confirmDelete.remove();
       confirmDelete = $();
    }
    
    confirmDeleterow = $("#confirmDeleterow");
    if(isSet(confirmDeleterow)) {
       confirmDeleterow.remove();
       confirmDeleterow = $();
    }

    windowCreateDNSServer = $("#windowCreateDNSServer");
    if(isSet(windowCreateDNSServer)) {
       windowCreateDNSServer.remove();
       windowCreateDNSServer = $();
    }

    gridDNSServer = $("#gridDNSServer");
    if(isSet(gridDNSServer)) {
       gridDNSServer.remove();
       gridDNSServer = $();
    }
    var gridDNSServerDetailTemplate = $("#gridDNSServerDetailTemplate");
    if(isSet(gridDNSServerDetailTemplate)) {
        gridDNSServerDetailTemplate.remove();
        gridDNSServerDetailTemplate = $();
    }
    var configTemplate = $("#DNSServer-config-template");
    if(isSet(configTemplate)) {
    	configTemplate.remove();
    	configTemplate = $();
     }
}
