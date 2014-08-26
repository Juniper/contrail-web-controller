/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

ServicesInstancesObj = new ServicesInstances();

function ServicesInstances() {
    //Variable definitions

    //Text Box
    var txtsvcInstanceName, txtMaximumInstances,txt_ln_dis;

    //Dropdowns
    var ddDomain, ddProject, ddsvcTemplate,ddZone,ddZoneHost;

    //Grids
    var gridsvcInstances;

    //check box
    //var chkAutoScaling;

    //Buttons
    var btnCreatesvcInstances, btnDeletesvcInstances,
        btnCreatesvcInstencesCancel, btnCreatesvcInstencesOK,
        btnCnfDelSInstPopupOK, btnCnfDelSInstPopupCancel;

    //Datasources
    //var dsGridSTemp;

    //Windows
    var windowCreateSvcInstances, confirmDelete, consoleWindow;
    
    //Timers
    var svcInstanceTimer;
    
    var serviceTemplteType;
    var InstanceDOMOrder;
    var templateImages;
    var dynamicID;
    var networks = [];
    var allZoneList = [];

    //timer level
    var TimerLevel,TimerArray;

    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForGridsvcInstances = fetchDataForGridsvcInstances;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.handleProjects = handleProjects;
    this.closeCreatesvcInstancesWindow = closeCreatesvcInstancesWindow;
    this.svcInstancesCreateWindow = svcInstancesCreateWindow;
    this.showViewConsoleWindow = showViewConsoleWindow;
    this.successHandlerForGridsvcInstance = successHandlerForGridsvcInstance;
    this.failureHandlerForGridsTemp = failureHandlerForGridsTemp;
    this.createSInstanceSuccessCb = createSInstanceSuccessCb;
    this.createSInstanceFailureCb = createSInstanceFailureCb;
    this.getPowerState = getPowerState;
    this.refreshSvcInstances = refreshSvcInstances;
    this.reloadSvcInstancePage = reloadSvcInstancePage;
    this.successTemplateDetail = successTemplateDetail;
    this.getServiceMode = getServiceMode;
    this.getTemplateOrder = getTemplateOrder;
    this.checkServiceImage = checkServiceImage;
    this.getTemplateDetail = getTemplateDetail;
    this.destroy = destroy;
    this.dynamicID = dynamicID;
}
/* istanbul ignore next */
function load() {
    var configTemplate = Handlebars.compile($("#svcInstances-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_sc_svcInstances';
    init();
}
/* istanbul ignore next */
function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
    initWidgetBoxes();
}
/* istanbul ignore next */
function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridsTemp");
}
/* istanbul ignore next */
function initComponents() {

    $("#gridsvcInstances").contrailGrid({
        header : {
            title : {
                text : 'Service Instances',
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
            customControls: ['<a id="btnDeletesvcInstances" class="disabled-link" title="Delete Service Instances"><i class="icon-trash"></i></a>',
                '<a id="btnCreatesvcInstances" class="disabled-link" onclick="svcInstancesCreateWindow(\'add\');return false;" title="Create Service Instances"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
        columns:[
            {
                id:"Service_Instance",
                field:"Service_Instance",
                name:"Service Instance",
                minWidth : 120,
                sortable: true
            },
            {
                id:"Service_Template",
                field:"Service_Template",
                name:"Service Template",
                minWidth : 145,
                sortable: true
            },
            {
                id:"vmStatus",
                field:"vmStatus",
                name:"Status",
                minWidth : 70,
                formatter: function(r, c, v, cd, dc) {
                    if(dc.vmStatusData == "Spawning"){
                        dc.vmStatus = ('<img src="/img/loading.gif">&nbsp;&nbsp;' + dc.vmStatusData);
                    } if(dc.vmStatusData == "Inactive"){ 
                        dc.vmStatus = ('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' + dc.vmStatusData);
                    } if(dc.vmStatusData == "Partially Active"){
                        dc.vmStatus =  ('<img src="/img/loading.gif">&nbsp;&nbsp;' + dc.vmStatusData);
                    } if(dc.vmStatusData == "Active"){
                        dc.vmStatus =  ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' + dc.vmStatusData);
                    } if(dc.vmStatusData == "update"){
                        dc.vmStatus =  ('Updating.');
                    } if(dc.vmStatusData == "Error"){
                        dc.vmStatus =  ('Request Failed.');
                    }
                    return (dc.vmStatus);
                }
            },
            {
                id:"Number_of_instances",
                field:"Number_of_instances",
                name:"Number of instances",
                minWidth : 120,
                sortable: true
            },
            {
                id:"All_Network",
                field:"All_Network",
                name:"Networks",
               /* to do formatter: function(r, c, v, cd, dc) {
                    for(var i=0;i < dc.All_Network.length;i++){
                        if(i >0) {
                         if((i) % 3 == 0) { <br>
                         }
                         }
                         All_Network[i];
                        }
                    }
                }*/                
/* To do        template:'# for(var i=0;i<All_Network.length;i++){ #'+
                         '#     if(i >0) { #,'+
                         '#         if((i) % 3 == 0) { #<br>'+
                         '#         } #'+
                         '#     } #'+
                         '#:         All_Network[i] #'+
                         '# } #',*/
                sortable: true,
                minWidth : 400
            },
        ]
        },
        body : {
            options : {
                autoHeight : true,
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeletesvcInstances').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeletesvcInstances').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            svcInstancesCreateWindow('edit',rowIndex);
                        }
                    }
                ],
                detail: {
                    template: $("#gridsTempDetailSVCInstences").html(),
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Service Instances..'
                },
                empty: {
                    text: 'No Service Instances Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Service Instances.'
                },
                updating: {
                    text: "Updating Service Instances table"
                }

            }
        }
    });

    txtsvcInstanceName = $("#txtsvcInstanceName");
    txtMaximumInstances = $("#txtMaximumInstances");
    txt_ln_dis = $("#txt_ln_dis");
    btnCreatesvcInstances = $("#btnCreatesvcInstances");
    btnDeletesvcInstances = $("#btnDeletesvcInstances");
    btnCreatesvcInstencesCancel = $("#btnCreatesvcInstencesCancel");
    btnCreatesvcInstencesOK = $("#btnCreatesvcInstencesOK");
    btnCnfDelSInstPopupOK = $("#btnCnfDelSInstPopupOK");
    btnCnfDelSInstPopupCancel = $("#btnCnfDelSInstPopupCancel");
    svcInstanceTimer = null;
    TimerLevel = 0;
    TimerArray = [20000,35000,45000,55000,65000];
    serviceTemplteType = [];
    InstanceDOMOrder = [["left","lNetDiv","leftRouter"],["right","rNetDiv","rightRouter"],["management","mNetDiv","managementRouter"]];
    templateImages = [];
    dynamicID = 0;

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
    ddsvcTemplate = $("#ddsvcTemplate").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:svcTemplateChange
    });
    ddZone = $("#ddZone").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:zoneChange
    });
    ddZoneHost = $("#ddZoneHost").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });

    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    gridsvcInstances.showGridMessage('loading');

    confirmDelete = $("#confirmDelete");
    confirmDelete.modal({backdrop:'static', keyboard: false, show:false});
    
    consoleWindow = $("#consoleWindow");
    consoleWindow.modal({backdrop:'static', keyboard: false, show:false});

    windowCreateSvcInstances = $("#windowCreateSvcInstances");
    windowCreateSvcInstances.on('hide', closeCreatesvcInstancesWindow);
    windowCreateSvcInstances.modal({backdrop:'static', keyboard: false, show:false});
}

function reloadSvcInstancePage(reload) {
    if($("#windowCreateSvcInstances").css('display') != 'block' && 
       $("#confirmDelete").css('display') != 'block') {
        if (svcInstanceTimer != null) {
            window.clearInterval(svcInstanceTimer);
            svcInstanceTimer = null;
            if (reload == true) {
                fetchDataForGridsvcInstances();
            }
        }
    }
}

function refreshSvcInstances(reload) {
    if(reload == true){
        if(svcInstanceTimer == null){
            if(TimerLevel < TimerArray.length){
                svcInstanceTimer = window.setInterval("reloadSvcInstancePage(true)", TimerArray[TimerLevel]);
                TimerLevel += 1;
            } else {
                window.clearInterval(svcInstanceTimer);
                svcInstanceTimer = null;
            }
        }
    } else {
        if(svcInstanceTimer != null){
            window.clearInterval(svcInstanceTimer);
            svcInstanceTimer = null;
        }
    }
}
/* istanbul ignore next */
function initActions() {
    btnCreatesvcInstances.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {     
            svcInstancesCreateWindow("add");
        }    
    });

    btnDeletesvcInstances.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmDelete.find('.modal-header-title').text("Confirm");
            confirmDelete.modal('show');
        }
    });

    btnCreatesvcInstencesCancel.click(function (a) {
        windowCreateSvcInstances.modal('hide');
    });

    btnCnfDelSInstPopupCancel.click(function (a) {
        confirmDelete.modal('hide')
    });

    btnCnfDelSInstPopupOK.click(function (a) {
        //Release functions
        $('#btnDeletesvcInstances').addClass('disabled-link');
        //btnDeletesvcInstances.attr("disabled","disabled");
        var selected_rows = $("#gridsvcInstances").data("contrailGrid").getCheckedRows();
        var deleteAjaxs = [];
        if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
            cbParams.selected_rows = selected_rows;
            cbParams.url = "/api/tenants/config/service-instance/"; 
            cbParams.urlField = "uuid";
            cbParams.fetchDataFunction = "createSInstanceSuccessCb";
            cbParams.errorTitle = "Error";
               cbParams.errorShortMessage = "Error in deleting Service Instance - ";
            cbParams.errorField = "Service_Instance";
            deleteObject(cbParams);
        }
        confirmDelete.modal('hide');
    });

    btnCreatesvcInstencesOK.click(function (a) {
        if (validate() == true) {
            var serviceInstance = {};
            var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
            var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
            if(!isValidDomainAndProject(selectedDomain, selectedProject)){
                gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
                gridsvcInstances.showGridMessage('errorGettingData');
                return;
            }
            var templateProps = JSON.parse($("#ddsvcTemplate").data("contrailDropdown").value());
            var instName = $(txtsvcInstanceName).val();
            var maxInstances = 1;
            var maxInstancesTxt = $(txtMaximumInstances).val();
            var autoScale = false;

            serviceInstance["service-instance"] = {};
            serviceInstance["service-instance"]["parent_type"] = "project";
            serviceInstance["service-instance"]["fq_name"] = [];
            serviceInstance["service-instance"]["fq_name"] = [selectedDomain,
                selectedProject,
                $(txtsvcInstanceName).val()];

            serviceInstance["service-instance"]["service_template_refs"] = [];
            serviceInstance["service-instance"]["service_template_refs"][0] = {};
            serviceInstance["service-instance"]["service_template_refs"][0]["to"] = [];
            serviceInstance["service-instance"]["service_template_refs"][0]["to"] =
                templateProps["fq_name"];

            serviceInstance["service-instance"]["service_instance_properties"] = {};
            var tmplSvcScaling = templateProps["service_template_properties"]["service_scaling"];
            if (maxInstancesTxt != "")
                maxInstances = parseInt(maxInstancesTxt);

            serviceInstance["service-instance"]["service_instance_properties"]["scale_out"] = {};
            serviceInstance["service-instance"]["service_instance_properties"]["scale_out"]["max_instances"] = maxInstances;
            
            var avaiZone;
            if($("#ddZoneHost").data("contrailDropdown").value() == "ANY") {
                if($("#ddZone").data("contrailDropdown").value() == "ANY") {
                    avaiZone = "";
                } else {
                    avaiZone = $("#ddZone").data("contrailDropdown").value();
                }
            } else {
                avaiZone = $("#ddZone").data("contrailDropdown").value()+":"+$("#ddZoneHost").data("contrailDropdown").value();
            }
			if(avaiZone != ""){
                serviceInstance["service-instance"]["service_instance_properties"]["availability_zone"] = avaiZone;
            }

            serviceInstance["service-instance"]["service_instance_properties"]["interface_list"] = [];
            var allInterfaceDiv = "#interface";
            for(var i=0; i<$("#instanceDiv").children().length; i++) {
                var divid = String($("#instanceDiv").children()[i].id);
                var id = getID(divid);
                console.log();
                var networkType = $(allInterfaceDiv+"_"+id+"_typeName").attr('placeholder');;
                var ddNetworkTxt = $(allInterfaceDiv+"_"+id+"_ddnetwork").data("contrailDropdown").value();
                if(ddNetworkTxt == "Auto Configured") {
                    ddNetworkTxt = "";
                }
                switch(networkType){
                    case "Left" :{
                        serviceInstance["service-instance"]["service_instance_properties"]["left_virtual_network"] = ddNetworkTxt;
                        break;
                    }
                    case "Right" :{
                        serviceInstance["service-instance"]["service_instance_properties"]["right_virtual_network"] = ddNetworkTxt;
                        break;
                    }
                    case "Management" :{
                        serviceInstance["service-instance"]["service_instance_properties"]["management_virtual_network"] = ddNetworkTxt;
                        break;
                    }
                }
                serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i] = {};
                serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i]["virtual_network"] = ddNetworkTxt;
                if($(allInterfaceDiv+"_"+id+"_srTuple").children().length >= 1){
                    serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i]["static_routes"] = {};
                    serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"] = [];
                    for(var l = 0;l< $(allInterfaceDiv+"_"+id+"_srTuple").children().length;l++){
                        var divid = String($(allInterfaceDiv+"_"+id+"_srTuple").children()[l].id);
                        var innerId = getID(divid);
                        var prefix = $(allInterfaceDiv+"_"+id+"_srTuple_"+innerId+"_txtPrefix").val();
                        serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l] = {};
                        serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l]["prefix"] = prefix;
                        serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l]["next_hop"] = null;
                        serviceInstance["service-instance"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l]["next_hop_type"] = null;
                    }
                }
            }
            serviceInstance["service-instance"]["display_name"] = serviceInstance["service-instance"]["fq_name"][serviceInstance["service-instance"]["fq_name"].length-1];
            if(txtsvcInstanceName.attr("disabled") === "disabled"){
                doAjaxCall("/api/tenants/config/service-instances/" + $('#btnCreatesvcInstencesOK').data('uuid'), "PUT", JSON.stringify(serviceInstance), "createSInstanceSuccessCb", "createSInstanceFailureCb");
            } else {
                doAjaxCall("/api/tenants/config/service-instances", "POST", JSON.stringify(serviceInstance), "createSInstanceSuccessCb", "createSInstanceFailureCb");
            }
            TimerLevel = 0;
            windowCreateSvcInstances.modal('hide');
        }
    });
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
        fetchProjects("populateProjects", "failureHandlerForGridsTemp");
    } else {
        $("#gridsvcInstances").data("contrailGrid")._dataView.setData([]);
        btnCreatesvcInstances.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');        
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridsvcInstances.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');        
    }
}
/* istanbul ignore next */
function handleDomains(e) {
    //fetchDataForGridsvcInstances();
    var dName = e.added.text;
    setCookie("domain", dName);          
    fetchProjects("populateProjects", "failureHandlerForGridsTemp");
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
        btnCreatesvcInstances.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForGridsvcInstances();
    } else {
        $("#gridsvcInstances").data("contrailGrid")._dataView.setData([]);
        btnCreatesvcInstances.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridsvcInstances.showGridMessage("empty");
        emptyCookie('project');                
    }
}

/* istanbul ignore next */
function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridsvcInstances();
}

function fetchDataForGridsvcInstances() {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").value();
    var selectedDomainText = $("#ddDomainSwitcher").data("contrailDropdown").text();
    if(!isValidDomain(selectedDomainText)){
        gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
        gridsvcInstances.showGridMessage('errorGettingData');
        return;
    }
    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    gridsvcInstances.showGridMessage('loading');
    doAjaxCall("/api/tenants/config/service-instance-templates/" + selectedDomain, "GET", null, "successTemplateDetail", "failureTemplateDetail", null, null);
    
}

function successTemplateDetail(result) {
    serviceTemplteType = result.service_templates;
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").value();
    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    gridsvcInstances.showGridMessage('loading');
    doAjaxCall("/api/tenants/config/list-service-instances/" + selectedProject,
            "GET", null, "successHandlerForGridsvcInstance",
            "failureHandlerForGridsTemp", null, null, 905000);

}

function failureTemplateDetail(result) {

}

function successHandlerForGridsvcInstance(result) {
    $("#gridsvcInstances").data("contrailGrid")._dataView.setData([]);
    if(result && result.length > 0){
    doAjaxCall("/api/tenants/config/service-instances-status/" + $("#ddProjectSwitcher").data("contrailDropdown").value(), 
               "POST", JSON.stringify(result), "successHandlerForGridStatusUpdate",
               "failureHandlerForGridsStatusUpdate", null, null, 905000);
    } else {
        gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
        gridsvcInstances.showGridMessage('empty');        
    }
    successHandlerForGridsvcInstanceRow(result);
}

function successHandlerForGridStatusUpdate(result) {
    var svcInstancesConfig = result;
    var reload = false;
    var svcDS = $("#gridsvcInstances").data("contrailGrid")._dataView.getItems();
    for(var i=0; i < svcDS.length ;i++){
        if("ConfigData" in svcInstancesConfig[i] && svcDS[i].uuid == svcInstancesConfig[i].ConfigData["service-instance"].uuid){
            var vmStatusData  = svcInstancesConfig[i]["vmStatus"];
            var vmStatus  = svcInstancesConfig[i]["vmStatus"];
            var VMDetails = svcInstancesConfig[i]["VMDetails"];
            if(vmStatusData != "Inactive" && vmStatusData != "Active"){
                reload = true;
            }
            updateStatus(svcDS[i],vmStatusData,vmStatus,VMDetails);            
        } else {
            for(var j=0;j<svcInstancesConfig.length;j++){
                if("ConfigData" in svcInstancesConfig[i] && svcDS[i].uuid === svcInstancesConfig[j].ConfigData["service-instance"].uuid){
                    var vmStatus  = svcInstancesConfig[j]["vmStatus"];
                    var vmStatusData  = svcInstancesConfig[j]["vmStatus"];
                    var VMDetails = svcInstancesConfig[j]["VMDetails"];
                    updateStatus(svcDS[i],vmStatusData,vmStatus,VMDetails);
                    if(vmStatusData != "Inactive" && vmStatusData != "Active"){
                        reload = true;
                    }
                    break;
                }
            }
        }
    }
    $("#gridsvcInstances").data("contrailGrid")._dataView.updateData(svcDS);
    refreshSvcInstances(reload);
}

function updateStatus(svcDS,vmStatusData,vmStatus,VMDetails){
            var InstDetailArr = [];
            var vmDetailsLength = 0;
            if (VMDetails != null)
               vmDetailsLength = VMDetails.length;
            for(var l=0 ; l < vmDetailsLength; l++){
                if(VMDetails[l]['server']['id'] != undefined && VMDetails[l]['server']['id'] != null){
                    var InstDetail = [];
                    var address = "";
                    InstDetail[0] = VMDetails[l]['server']['id'];
                    InstDetail[1] = VMDetails[l]['server']['name'];
                    InstDetail[2] = VMDetails[l]['server']['status'];
                    InstDetail[3] = getPowerState(VMDetails[l]['server']['OS-EXT-STS:power_state']);
                
                    for (var vmVNs in VMDetails[l]['server']['addresses']) {
                        address += vmVNs.toString();
                        if (VMDetails[l]['server']['addresses'][vmVNs].length) {
                            address += ':';
                            address += ('addr' in VMDetails[l]['server']['addresses'][vmVNs][0])?
                                   VMDetails[l]['server']['addresses'][vmVNs][0]['addr']: '-';
                        } else {
                            address += "~~"
                        }
                        address += ' ';
                    }
                    InstDetail[4] = address;
                    InstDetailArr.push(InstDetail);
                }
            }    
            svcDS.vmStatus = vmStatus;
            svcDS.vmStatusData = vmStatusData;
            svcDS.InstDetailArr = InstDetailArr;

}

function failureHandlerForGridsStatusUpdate(result) {
    var svcDS = $("#gridsvcInstances").data("contrailGrid")._dataView.getItems();
    for(var i=0; i < svcDS.length ;i++){
        svcDS[i].vmStatus  = "Error";
        svcDS[i].vmStatusData = "Error";
        svcDS[i].InstDetailArr = "Error";
    }
    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    gridsvcInstances.showGridMessage('errorGettingData');
}

function failureHandlerForGridsTempRow(result) {
    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    gridsvcInstances.showGridMessage('errorGettingData');
}

function showViewConsoleWindow(vnUUID, name) {
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var url = "/api/tenants/config/service-instance-vm?project_id=" + selectedProject + "&vm_id=" + vnUUID;
    doAjaxCall(url, "GET", null, "LaunchSvcInstcb", "failureLaunchSvcInstcb", false, {"sameWindow": true, "title": "VNC Console: " + name});
}
function LaunchSvcInstcb(result, cbParams){
    var href = jsonPath(result, "$.console.url")[0];
    window.open(href);
}
function failureLaunchSvcInstcb(result, cbParams){
    failureLaunchVNCcb(result, cbParams);
}

function getServiceMode(templateName){
    for(var i = 0; i < serviceTemplteType.length; i++){
        if(templateName == (serviceTemplteType[i]["service-template"].name)){
            return(serviceTemplteType[i]["service-template"]["service_template_properties"]["service_mode"]);
        }
    }
    return ("Unknown");  
}
function getTemplateOrder(templateName){
    for(var i = 0; i < serviceTemplteType.length; i++){
        if(templateName == (serviceTemplteType[i]["service-template"].name)){
            if("ordered_interfaces" in serviceTemplteType[i]["service-template"]["service_template_properties"] 
               && (serviceTemplteType[i]["service-template"]["service_template_properties"]["ordered_interfaces"] != null 
               && serviceTemplteType[i]["service-template"]["service_template_properties"]["ordered_interfaces"] != undefined 
               && serviceTemplteType[i]["service-template"]["service_template_properties"]["ordered_interfaces"] != "false" 
               && serviceTemplteType[i]["service-template"]["service_template_properties"]["ordered_interfaces"] != false)){
                return(serviceTemplteType[i]["service-template"]["service_template_properties"]["interface_type"]);
            } else {
                var svcTmplIntf = reorderInterface(serviceTemplteType[i]["service-template"]);
                return(svcTmplIntf.service_template_properties.interface_type);                
             }
        }
    }
    return []; 
    
}
function getTemplateDetail(templateName){
    for(var i = 0; i < serviceTemplteType.length; i++){
        if(templateName == (serviceTemplteType[i]["service-template"].name)){
            return(serviceTemplteType[i]["service-template"]);
        }
    }
    return []; 
    
}
function checkServiceImage(servicetemplateImage){
    var imageAvailable = false;
    for(var inc =0 ;inc< templateImages.length;inc++){
        if(servicetemplateImage == templateImages[inc]){
            imageAvailable = true;
            break;
        }
    }
    if(imageAvailable == false){
        showInfoWindow(servicetemplateImage+" image is missing.", "Image missing");
        return false;
    }
    return true;
}
function reorderDomInterface(templateOrder){
    for(var i=0;i<templateOrder.length-1;i++){
        if(templateOrder[i].service_interface_type != InstanceDOMOrder[i][0]){
            for(var j = i+1; j<InstanceDOMOrder.length; j++){
                if(templateOrder[i].service_interface_type === InstanceDOMOrder[j][0]){
                    swapElements(document.getElementById(InstanceDOMOrder[j][1]),document.getElementById(InstanceDOMOrder[i][1]));
                    var temp = InstanceDOMOrder[j];
                    InstanceDOMOrder[j] = InstanceDOMOrder[i];
                    InstanceDOMOrder[i] = temp;
                    break;
                }
            }
        }
    }
    var count=0;
    for(var j=0;j<$("#instanceDiv").children().length;j++){
        var tempElement = $("#instanceDiv").children()[j];
        if(!$(tempElement).hasClass('hide')){
            count = count + 1;
            $(tempElement).find("#interfaceID").text("Interface"+(count)+" ");
        }
    }
}
function swapElements(obj1, obj2) {
    var temp = document.createElement("div");
    obj1.parentNode.insertBefore(temp, obj1);
    obj2.parentNode.insertBefore(obj1, obj2);
    temp.parentNode.insertBefore(obj2, temp);
    temp.parentNode.removeChild(temp);
}

function appendStaticRouteEntry(who, defaultRow,element,containerInst,data) {
var elementID = "#"+element;
dynamicID += 1;
    if(data === undefined || data === null){
        data = "";
    }
    var sIEntry = createStaticRouteEntry(data, dynamicID,element,containerInst);
    if (defaultRow) {
        $("#"+element).prepend($(sIEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(sIEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateSvcInstances",sIEntry,false);
}
function createStaticRouteEntry(data, id,element,containerInst) {

    var inputTxtPrefix = document.createElement("input");
    inputTxtPrefix.type = "text";
    inputTxtPrefix.className = "span12";
    if(data != ""){
        inputTxtPrefix.setAttribute("value", data);
    } else {
        inputTxtPrefix.setAttribute("placeholder", "xxx.xxx.xxx.xxx");
    }
    inputTxtPrefix.setAttribute("id",element+"_"+id+"_txtPrefix");
    var divPrefix = document.createElement("div");
    divPrefix.className = "span5";
    divPrefix.appendChild(inputTxtPrefix);

    var netHopDiv = document.createElement("div");
    netHopDiv.className = "span12";
    var divNetwork = document.createElement("div");
    divNetwork.className = "span5";
    divNetwork.appendChild(netHopDiv);
    netHopDiv.innerHTML = containerInst;

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendStaticRouteEntry(this,false,'"+element+"','"+containerInst+"');");
    iBtnAddRule.setAttribute("title", "Add static route below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteStaticRouteEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete static route");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divPrefix);
    divRowFluidMargin5.appendChild(divNetwork);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "si_" + id;
    rootDiv.appendChild(divRowFluidMargin5);

    return rootDiv; 
    
}
function deleteStaticRouteEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}
function successHandlerForGridsvcInstanceRow(result) {
    var svcInstancesData = [];
    var svcInstancesConfig = result;
    configObj["service_instances"] = [];
    var idCount = 0;
    for(var j=0;j < svcInstancesConfig.length;j++) {
        var svcInstances = svcInstancesConfig[j]['service-instance'];
        var svcInstance  = svcInstances, vmUUIds = [];
        configObj["service_instances"][idCount] = svcInstance;

        var svc_tmpl_name = "";
        var left = "";
        var right = "";
        var mgmt = "";
        var leftStaticRout = [];
        var rightStaticRout = [];
        var mgmtStaticRout = [];
        var all_network = [];
        var network = "";
        var inst_name_order = [];
        var svcScalingStr="";
        var ServiceProperties = {};
        var svc_flavor = "-";
        var svc_ordered_interfaces = false;
        var svc_image = "-";
        var availability_zone = "";

        var svc_tmpl_name_text = svcInstance.service_template_refs[0].to[1];
        svc_tmpl_name =  svc_tmpl_name_text + " (" + ucfirst(getServiceMode(svc_tmpl_name_text)) + ")";
        var templateOrder = getTemplateOrder(svc_tmpl_name_text);
        var templateDetail = getTemplateDetail(svc_tmpl_name_text); 
        
        if ('service_instance_properties' in svcInstance &&
            'scale_out' in svcInstance['service_instance_properties']) {
            var svcScaling = svcInstance['service_instance_properties']['scale_out'];
            svcScalingStr = svcScaling.max_instances + " Instances";
        }
        network = "";
        ServiceProperties = svcInstance['service_instance_properties'];
        if('service_instance_properties' in svcInstance &&
           'interface_list' in svcInstance['service_instance_properties'] && 
           svcInstance['service_instance_properties']['interface_list'] != {} &&
           svcInstance['service_instance_properties']['interface_list'] != null ){
            var InterfaceList = svcInstance['service_instance_properties']['interface_list'];
            for (var inc=0; inc < templateOrder.length; inc++){
                var interfaceTemp = svcInstance['service_instance_properties']['interface_list'][i];
                
            }        
        }
        var statRoutes = [];
        all_network = [];
        availability_zone = svcInstance['service_instance_properties']['availability_zone'];
        if(availability_zone == "" || availability_zone == null){
            availability_zone = "ANY:ANY";
        }
        if("ordered_interfaces" in templateDetail["service_template_properties"] 
           && (templateDetail["service_template_properties"]["ordered_interfaces"] != null 
           && templateDetail["service_template_properties"]["ordered_interfaces"] != undefined 
           && templateDetail["service_template_properties"]["ordered_interfaces"] != "false" 
           && templateDetail["service_template_properties"]["ordered_interfaces"] != false)){
            svc_image = templateDetail["service_template_properties"]["image_name"];
            svc_ordered_interfaces = templateDetail["service_template_properties"]["ordered_interfaces"];
            svc_flavor = templateDetail["service_template_properties"]["flavor"]
            for(var tinc = 0;tinc < templateOrder.length;tinc++){
                //if(network != "") network += ", ";
                network = ucfirst(templateOrder[tinc].service_interface_type) + " Network : ";
                var virNetwork = null;
                if("interface_list" in svcInstance['service_instance_properties'] &&
                    svcInstance['service_instance_properties']["interface_list"].length > 0 &&
                   "virtual_network" in  svcInstance['service_instance_properties']["interface_list"][tinc] &&
                   svcInstance['service_instance_properties']["interface_list"][tinc]["virtual_network"] != null &&
                   svcInstance['service_instance_properties']["interface_list"][tinc]["virtual_network"] != undefined){
                    virNetwork = svcInstance['service_instance_properties']["interface_list"][tinc]["virtual_network"];
                }
                if(templateOrder[tinc].static_route_enable === true){
                    var len = statRoutes.length;
                    statRoutes[len] = {};
                    statRoutes[len]["name"] = templateOrder[tinc].service_interface_type;
                    var sr = svcInstance['service_instance_properties']["interface_list"][tinc]["static_routes"];
                    if(null !== sr && typeof sr !== "undefined" && null !== sr["route"] &&
                        typeof sr["route"] !== "undefined" && sr["route"].length > 0) {
                        statRoutes[len]["prefix"] = sr["route"];
                    }
                }
                if(virNetwork === null){
                    network += "-";
                } else {
                if(virNetwork == ""){
                    network += "Automatic";
                } else {
                    var virNetworkArr = virNetwork.split(":");
                    if(virNetworkArr.length > 1){
                        if(virNetworkArr[1] != $("#ddProjectSwitcher").data("contrailDropdown").text()){
                             network += virNetworkArr[2]+"("+virNetworkArr[0]+":"+virNetworkArr[1]+")";
                        } else {
                            network += virNetworkArr[2];
                        }
                    } else {
                        network += virNetworkArr[0];
                    }
                }
                }
                all_network.push(network);
            }
            //network +=".";
        } else {
            for(i=0;i<templateOrder.length;i++){
            network = "";
                switch(templateOrder[i].service_interface_type){
                    case "left":{
                        if ('service_instance_properties' in svcInstance &&
                           'left_virtual_network' in svcInstance['service_instance_properties'] &&
                            svcInstance['service_instance_properties']['left_virtual_network'] != null) {
                            left = svcInstance['service_instance_properties']['left_virtual_network'];
                            //if(network != "") network += ", ";
                            if(left || left.length){
                                var li = left.split(":");
                                if(li.length > 1) {
                                    network += "Left Network : "+li[2];
                                    inst_name_order.push(["left",li[2]]);
                                } else {
                                    network += "Left Network : "+li[0];
                                    inst_name_order.push(["left",li[0]]);
                                }
                            } else {
                                inst_name_order.push(["left",""]);
                                network += "Left Network : Automatic";
                            }
                        }
                        break;
                    }
                    case "right":{
                        if ('service_instance_properties' in svcInstance &&
                            'right_virtual_network' in svcInstance['service_instance_properties'] &&
                            svcInstance['service_instance_properties']['right_virtual_network'] != null) {
                            right = svcInstance['service_instance_properties']['right_virtual_network'];
                            //if(network != "") network += ", ";
                            if(right || right.length){
                                var ri = right.split(":");
                                if(ri.length > 1){
                                    network += "Right Network : "+ri[2];
                                    inst_name_order.push(["right",ri[2]]);
                                } else {
                                    network += "Right Network : "+ri[0];
                                    inst_name_order.push(["right",ri[0]]);
                                }
                            } else {
                                inst_name_order.push(["right",""]);
                                network += "Right Network : Automatic";
                            }
                        }
                        break;
                    }
                    case "management":{
                        if ('service_instance_properties' in svcInstance &&
                            'management_virtual_network' in svcInstance['service_instance_properties'] &&
                            svcInstance['service_instance_properties']['management_virtual_network'] != null) {
                            mgmt = svcInstance['service_instance_properties']['management_virtual_network'];
                            //if(network != "")network += ",";
                            if(mgmt || mgmt.length){
                                var mi = mgmt.split(":");
                                if(mi.length > 1){
                                    network += "Management Network : "+mi[2];
                                    inst_name_order.push(["management",mi[2]]);
                                } else {
                                    network += "Management Network : "+mi[0];
                                    inst_name_order.push(["management",mi[0]]);
                                }
                            } else {
                                inst_name_order.push(["management",""]);
                                network += "Management Network : Automatic";
                            }
                        }
                        break;
                    }
                }//end of switch
                all_network.push(network);
            }//End of for
        }

        var vmBackRefs = svcInstances['virtual_machine_back_refs'];
        if (vmBackRefs != null && vmBackRefs.length != 0) {
            for (var k = 0; k < vmBackRefs.length; k++) {
                vmUUIds.push(vmBackRefs[k]["uuid"]);
            }
        }
        svcInstancesData.push({"Id":idCount++, "uuid":svcInstance.uuid,
            "Service_Instance":svcInstance.name,
            "Service_Instance_DN":svcInstance.display_name,
            "Service_Template":svc_tmpl_name,
            "Service_Template_Name":svc_tmpl_name_text,
            "Number_of_instances":svcScalingStr,
            "Instance_Image":svc_image,
            "flavor":svc_flavor,
            "order":svc_ordered_interfaces,
            "All_Network":all_network,
            "availability_zone":availability_zone,
//            "vmStatus":vmStatus,
            "vmStatus":"update",
            "vmStatusData":"update",
//            "InstDetailArr":InstDetailArr,
            "InstDetailArr":null,
            "StaticRoutes":statRoutes,
            "VMUUIDS":vmUUIds,
            "ServiceProperties":ServiceProperties
        });
    }
    $("#gridsvcInstances").data("contrailGrid")._dataView.setData(svcInstancesData);
}

function getPowerState(val){
    var powerString="";
    switch(val){
        case 0 :
        case 0x00 :
        {
            powerString = "NOSTATE";
            break;
        }
        case 1:
        case 0x01:
        {
            powerString = "RUNNING";
            break;
        }
        case 3:
        case 0x03:
        {
            powerString = "PAUSED";
            break;
        }
        case 4:
        case 0x04:
        {
            powerString = "SHUTDOWN";
            break;
        }
        case 6:
        case 0x06:
        {
            powerString = "CRASHED";
            break;
        }
        case 7:
        case 0x07:
        {
            powerString = "SUSPENDED";
            break;
        }
    }
    return(powerString);
}


function failureHandlerForGridsTemp(result, cbParam) {
    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    gridsvcInstances.showGridMessage('errorGettingData');
}
function validate() {
    if ($(txtsvcInstanceName).val().trim() == "") {
        showInfoWindow("Enter a valid Service Instance name.", "Input required");
        return false;
    }
    var s= String($(txtsvcInstanceName).val().trim());
    for (i = 0; i < s.length; i++){
        if (s.charAt(i) == "_") {
            showInfoWindow("Underscore not allowed in Service Instance Name.", "Input required");
            return false;
        }
    }
    var templateProps = JSON.parse($("#ddsvcTemplate").data("contrailDropdown").value());
    if(!checkServiceImage(templateProps.service_template_properties.image_name)){
        return false;
    }
    if (isNaN($(txtMaximumInstances).val())) {
        showInfoWindow("Maximum Instances should be between 1 - 64.", "Input required");
        return false;
    } else {
        var maxInst = parseInt($(txtMaximumInstances).val());
        if (maxInst < 1 || maxInst > 64) {
            showInfoWindow("Maximum Instances should be between 1 - 64.", "Input required");
            return false;
        }
    }
    var allInterfaceDiv = "#interface";
    for(var i=0; i<$("#instanceDiv").children().length; i++) {
        var divid = String($("#instanceDiv").children()[i].id);
        var id = getID(divid);
        if($(allInterfaceDiv+"_"+id+"_srTuple").children().length >= 1){
            for(var l = 0;l< $(allInterfaceDiv+"_"+id+"_srTuple").children().length;l++){
                var divid = String($(allInterfaceDiv+"_"+id+"_srTuple").children()[l].id);
                var innerId = getID(divid);
                var prefix = $(allInterfaceDiv+"_"+id+"_srTuple_"+innerId+"_txtPrefix").val();
                var prefixArr = prefix.split("/");
                if(prefixArr.length != 2){
                    showInfoWindow("Enter a valid prefix in xxx.xxx.xxx.xxx/xx format.", "Invalid input");
                    return false;
                }
                if(!validip(prefix)){
                    showInfoWindow("Enter a valid prefix in xxx.xxx.xxx.xxx/xx format.", "Invalid input");
                    return false;
                }
            }
        }
    }
    for(var i=0; i<$("#instanceDiv").children().length-1; i++) {
        var divid = String($("#instanceDiv").children()[i].id);
        var id = getID(divid);
        var networkType1 = $(allInterfaceDiv+"_"+id+"_typeName").attr('placeholder');
        var ddNetworkTxt1 = $(allInterfaceDiv+"_"+id+"_ddnetwork").data("contrailDropdown").value();
        if(ddNetworkTxt1 == "" || ddNetworkTxt1 == null){
            showInfoWindow(networkType1+" virtual network cannot be empty.", "Input valid data.");
            return false;
        }
        if(ddNetworkTxt1 != "Auto Configured"){
            for(var j=i+1; j<$("#instanceDiv").children().length; j++) {
                var divid = String($("#instanceDiv").children()[j].id);
                var id2 = getID(divid);
                var networkType2 = $(allInterfaceDiv+"_"+id2+"_typeName").attr('placeholder');
                var ddNetworkTxt2 = $(allInterfaceDiv+"_"+id2+"_ddnetwork").data("contrailDropdown").value();
                if(ddNetworkTxt1 != "Auto Configured"){
                    if(ddNetworkTxt1 === ddNetworkTxt2){
                        showInfoWindow("Interface"+(i+1)+" and Interface" +(j+1) +" cannot be same.", "Input valid data.");
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
function checkAuto(e){
    var interfaceElementID = getID(e.currentTarget.id);
    if(e.added.text === "Auto Configured"){
        $("#interface_" + interfaceElementID + "_widget").addClass("hide");
    } else {
        var showOption = $("#interface_" + interfaceElementID+"_showStaticRout").val();
        if(showOption === "true"){
            $("#interface_" + interfaceElementID + "_widget").removeClass("hide");
        } else {
            $("#interface_" + interfaceElementID + "_widget").addClass("hide");
        }
    }
}
function createInterfaceEntry(intf, len,showAuto,showOption,editData) {
var interfacesLen = $("#instanceDiv").children().length;
 
 var intfDiv = document.createElement("div");
 intfDiv.id = "interface_" + interfacesLen;
 intfDiv.className = "control-group";

 var intfLabel = document.createElement("label");
 intfLabel.className = "control-label";
 intfLabel.innerHTML = "Interface " + (interfacesLen + 1);
 intfDiv.appendChild(intfLabel);

 var ctrlDiv = document.createElement("div");
 ctrlDiv.className = "controls";
 intfDiv.appendChild(ctrlDiv);

 var rowFluidDiv = document.createElement("div");
 rowFluidDiv.className = "row-fluid";
 ctrlDiv.appendChild(rowFluidDiv);

 var span10 = document.createElement("span");
 span10.className = "span10";
 rowFluidDiv.appendChild(span10);
 
 var span5 = document.createElement("span");
 span5.className = "span5";
 span10.appendChild(span5);

 var inputTxt = document.createElement("input");
 inputTxt.type = "text";
 inputTxt.className = "span12";
 inputTxt.id = "interface_" + interfacesLen+"_typeName";
 inputTxt.setAttribute("disabled", "disabled");
 span5.appendChild(inputTxt);

 var selectNet = document.createElement("div");
 selectNet.id = "interface_" + interfacesLen + "_ddnetwork";
 selectNet.className = "span7 pull-right";
 span10.appendChild(selectNet);
 
 var inputTxtStaticRout = document.createElement("input");
 inputTxtStaticRout.type = "text";
 inputTxtStaticRout.id = "interface_" + interfacesLen+"_showStaticRout";
 inputTxtStaticRout.className = "hide";
 $(inputTxtStaticRout).val(showOption);
 span10.appendChild(inputTxtStaticRout);
 
 var rowFluidDiv1 = document.createElement("div");
 rowFluidDiv1.id = "interface_option_" + interfacesLen;
 rowFluidDiv1.className = "row-fluid";
 ctrlDiv.appendChild(rowFluidDiv1);

 var widgetDiv = document.createElement("div");
 widgetDiv.id = "interface_" + interfacesLen+"_widget";
 widgetDiv.className = "widget-box span8 transparent collapsed";
 rowFluidDiv1.appendChild(widgetDiv);

 var widgetHeaderDiv = document.createElement("div");
 widgetHeaderDiv.id = "interface_widget_header_" + interfacesLen;
 widgetHeaderDiv.className = "widget-header";
 widgetDiv.appendChild(widgetHeaderDiv);

 var widgetHeaderH5 = document.createElement("h5");
 widgetHeaderH5.className = "smaller";
 widgetHeaderDiv.appendChild(widgetHeaderH5);
 //widgetHeaderH5.setAttribute("onclick", "collapseElement(this)");
 widgetHeaderH5.setAttribute("onclick", "scrollUp(\"#windowCreateSvcInstances\",this,true);");

 var widgetHeaderH5I = document.createElement("i");
 widgetHeaderH5I.className = "icon-caret-right grey"; 
 widgetHeaderH5.appendChild(widgetHeaderH5I);

 var widgetHeaderH5Span = document.createElement("span");
 widgetHeaderH5Span.innerHTML = "Static Routes";
 widgetHeaderH5.appendChild(widgetHeaderH5Span);

 var widgetBodyDiv = document.createElement("div");
 widgetBodyDiv.id = "interface_widget_body_" + interfacesLen;
 widgetBodyDiv.className = "widget-body";
 widgetDiv.appendChild(widgetBodyDiv);

 var widgetBodyMainDiv = document.createElement("div");
 widgetBodyMainDiv.id = "interface_widget_body_main_" + interfacesLen;
 widgetBodyMainDiv.className = "widget-main padding-4";
 widgetBodyDiv.appendChild(widgetBodyMainDiv);

 var rowFluidDiv2 = document.createElement("div");
 rowFluidDiv2.className = "row-fluid margin-0-0-10";
 widgetBodyMainDiv.appendChild(rowFluidDiv2);

 var srTuples = document.createElement("div");
 srTuples.id = "interface_" + interfacesLen + "_srTuple";
 widgetBodyMainDiv.appendChild(srTuples);

 var itemHeaderDiv = document.createElement("div");
 itemHeaderDiv.className = "rule-item-header";
 rowFluidDiv2.appendChild(itemHeaderDiv);

 var rowFluidDiv3 = document.createElement("div");
 rowFluidDiv3.className = "row-fluid";
 itemHeaderDiv.appendChild(rowFluidDiv3);

 var span5Div1 = document.createElement("div");
 span5Div1.className = "span5";
 rowFluidDiv3.appendChild(span5Div1);

 var span5Div2 = document.createElement("div");
 span5Div2.className = "span5";
 rowFluidDiv3.appendChild(span5Div2);

 var pullLeftDiv = document.createElement("div");
 pullLeftDiv.className = "pull-left";
 pullLeftDiv.setAttribute("style", "margin-left:5px");
 rowFluidDiv3.appendChild(pullLeftDiv);

 var span5H71 = document.createElement("h7");
 span5H71.className = "smaller";
 span5H71.textContent = "Prefix"; 
 span5Div1.appendChild(span5H71);

 var span5H72 = document.createElement("h7");
 span5H72.className = "smaller";
 span5H72.textContent = "Next hop";
 span5Div2.appendChild(span5H72);

 var titleDiv = document.createElement("div");
 pullLeftDiv.title = "Add static route below";
 rowFluidDiv3.appendChild(titleDiv);

 var titleDivI = document.createElement("i");
 titleDivI.className = "icon-plus";
 titleDivI.setAttribute("onclick", "appendStaticRouteEntry(this, true,'interface_" + interfacesLen + "_srTuple','Interface "+(interfacesLen+1)+"');");
 titleDivI.setAttribute("title", "Add static route below");
 titleDiv.appendChild(titleDivI);

    $(selectNet).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:checkAuto
    });
    var networksTemp = [];
    if(showAuto === true){
        networksTemp.unshift({'text':"Auto Configured",'value':"Auto Configured"});
    }
    for(i=0;i<networks.length;i++){
        networksTemp.push(networks[i]);
    }

    if(showOption === false || showAuto === true){
        $(widgetDiv).addClass("hide");
    }
    $(selectNet).data("contrailDropdown").setData(networksTemp);
    $(selectNet).data("contrailDropdown").value(networksTemp[0].value);
 
    if(null !== intf && typeof intf !== "undefined") {
        //$(inputTxt).val(ucfirst(intf["service_interface_type"]));
        $(inputTxt).attr("placeholder", ucfirst(intf["service_interface_type"]));
    }
    $("#instanceDiv").append(intfDiv);
    if(editData != {} && editData != undefined ){
        if(editData.virtual_network != ""){
            $(selectNet).data("contrailDropdown").value(editData.virtual_network);
        } else {
            $(selectNet).data("contrailDropdown").value("Auto Configured"); 
            $(widgetDiv).addClass("hide");
        }
        $(selectNet).data("contrailDropdown").enable(false);
        if("static_routes" in editData && "route" in editData.static_routes){
        for(var inc=0;inc<(editData.static_routes.route).length;inc++){
            appendStaticRouteEntry(this, true,'interface_' + interfacesLen + '_srTuple','Interface '+(interfacesLen+1),editData.static_routes.route[inc].prefix);
        }
        }
    } else {
        $(selectNet).data("contrailDropdown").enable(true);
    }
    
 
    return intfDiv;
}
function zoneChange(who){
    var ddZoneText = $("#ddZone").data("contrailDropdown").text();
    setHostForZone(ddZoneText);
}
function svcTemplateChange(who,editData) {
    
    var templateProps = JSON.parse($("#ddsvcTemplate").data("contrailDropdown").value());
    var tmplSvcScaling = templateProps["service_template_properties"]["service_scaling"];
    var availZone = templateProps["service_template_properties"]["availability_zone_enable"];
    $("#maxInstances").addClass("hide");
    $("#avilZone").addClass("hide");
    $(txtMaximumInstances).val("1");

    closeAllStaticRout();

    if (tmplSvcScaling == true ||
        tmplSvcScaling === "True" || tmplSvcScaling === "true") {
        $("#maxInstances").removeClass("hide");
    }
    if(availZone == true || availZone == "True" || availZone === "true") {
        $("#avilZone").removeClass("hide");        
    }
    var svcTmplIntf = [];
    svcTmplIntf = templateProps["service_template_properties"]["interface_type"];
    $("#instanceDiv").empty();
    for(var i = 0;i<svcTmplIntf.length;i++){
        var showAuto = true;
        var showOption = true;
        if(svcTmplIntf[i]["service_interface_type"] != "management"){
            if(templateProps.service_template_properties.service_mode == "in-network" 
                || templateProps.service_template_properties.service_mode == "in-network-nat"){
                showAuto = false;
            }
            if(svcTmplIntf[i]["service_interface_type"] == "other") {
                 showAuto = false;
            }
        }
        if (svcTmplIntf[i]["static_route_enable"] === true){
            showAuto = false;
            showOption = true;
        } else {
            showOption = false;
        }
        
        var data = null;
        if(editData != undefined){
            if("interface_list" in editData.ServiceProperties){
                data = editData.ServiceProperties.interface_list[i];
            } else {
                data = [];
                if(svcTmplIntf[i]["service_interface_type"] == "management"){
                    if(editData.ServiceProperties.management_virtual_network != undefined){
                        data.virtual_network = editData.ServiceProperties.management_virtual_network;
                    }
                }
                if(svcTmplIntf[i]["service_interface_type"] == "left"){
                    if(editData.ServiceProperties.left_virtual_network != undefined){
                        data.virtual_network = editData.ServiceProperties.left_virtual_network;
                    }
                }
                if(svcTmplIntf[i]["service_interface_type"] == "right"){
                    if(editData.ServiceProperties.right_virtual_network != undefined){
                        data.virtual_network = editData.ServiceProperties.right_virtual_network;
                    }
                }
            }
            $(txtMaximumInstances).val(editData.ServiceProperties.scale_out.max_instances);
        }
        createInterfaceEntry(svcTmplIntf[i],i,showAuto,showOption,data);
    }
}
function reorderInterface(templateObj){
    if("interface_type" in templateObj.service_template_properties){
        var oldTemplate = templateObj.service_template_properties.interface_type;
        var result = "";
        templateObj.service_template_properties.interface_type = [];
        result = pullInst("management",oldTemplate);
        if(result != ""){
            templateObj.service_template_properties.interface_type.push(result)
        }
        result = pullInst("left",oldTemplate);
        if(result != ""){
            templateObj.service_template_properties.interface_type.push(result)
        }
        result = pullInst("right",oldTemplate);
        if(result != ""){
            templateObj.service_template_properties.interface_type.push(result)
        }
    }
    return templateObj;
}
function pullInst(type,templateInstDetail){
    for(var i=0;i<templateInstDetail.length;i++){
        if(templateInstDetail[i].service_interface_type === type){
            var returnobj = {static_route_enable: false, shared_ip: templateInstDetail[i].shared_ip, service_interface_type: templateInstDetail[i].service_interface_type};
            return (returnobj);
        }
    }
    return "";
}
function closeAllStaticRout(){
    var widgetBoxElem = $("#lNetDiv").find('#widgetStaticRoutes');
    $(widgetBoxElem).addClass('collapsed'); 
    widgetBoxElem = $(widgetBoxElem).find('.widget-toolbar i');
    $(widgetBoxElem).addClass('icon-chevron-down');
    $(widgetBoxElem).removeClass('icon-chevron-up');

    widgetBoxElem = $("#rNetDiv").find('#widgetStaticRoutes');
    $(widgetBoxElem).addClass('collapsed'); 
    widgetBoxElem = $(widgetBoxElem).find('.widget-toolbar i');
    $(widgetBoxElem).addClass('icon-chevron-down');
    $(widgetBoxElem).removeClass('icon-chevron-up');

    widgetBoxElem = $("#maxInstances").find('#widgetStaticRoutes');
    $(widgetBoxElem).addClass('collapsed'); 
    widgetBoxElem = $(widgetBoxElem).find('.widget-toolbar i');
    $(widgetBoxElem).addClass('icon-chevron-down');
    $(widgetBoxElem).removeClass('icon-chevron-up');
}
function closeCreatesvcInstancesWindow() {
    clearPopupValues();
}

function clearPopupValues() {
    mode = "";
    $(txtsvcInstanceName).val("");
    $(txtMaximumInstances).val("");
    var ddsvcTemplateData = $("#ddsvcTemplate").data("contrailDropdown").getAllData();
    if(ddsvcTemplateData.length > 0)
        $("#ddsvcTemplate").data("contrailDropdown").value(ddsvcTemplateData[0].value);
}
/*
 * Create Window
 */
function svcInstancesCreateWindow(mode,rowIndex) {
    if($("#btnCreatesvcInstances").hasClass('disabled-link')) {
           return;
    }
    var selectedDomainName = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").value();
    var selectedProjectName = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").value();
    if(!isValidDomainAndProject(selectedDomainName, selectedProjectName)){
        gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
        gridsvcInstances.showGridMessage('errorGettingData');
        return;
    }

    var getAjaxs = [];

    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/service-instance-templates/" + selectedDomain,
        type:"GET"
    });
    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/virtual-networks", 
        type:"GET"
    });
    getAjaxs[2] = $.ajax({
        url:"/api/tenants/config/service-template-images/" +
            selectedDomainName ,
        type:"GET"
    });
    getAjaxs[3] = $.ajax({
        url:"/api/tenants/config/getAvailabilityZone/",
        type:"GET"
    });

    if(globalObj['webServerInfo']['role'].indexOf("superAdmin") > -1){
        getAjaxs[4] = $.ajax({
            url:"/api/tenants/config/getHostList/",
            type:"GET"
        });
    }
    $.when.apply($, getAjaxs).then(
        function () {
            var results = arguments;
            //globalObj['webServerInfo']['role'] = "user";
            var hostList = [];
            var availabilityZone = [];
            if(globalObj['webServerInfo']['role'].indexOf("superAdmin") > -1){
                hostList = results[4][0].host;
                $("#host").removeClass("hide");
                $("ddZone").removeClass("span5");
                $("ddZone").addClass("span12");
            } else {
                $("#host").addClass("hide");
                $("ddZone").addClass("span5");
                $("ddZone").removeClass("span12");
            }
            availabilityZone = results[3][0].availabilityZoneInfo;
            var ddzoneList = [];
            allZoneList = [];
            ddzoneList.push({"text":"ANY",value:"ANY"});
            for(var tempi = 0 ; tempi < availabilityZone.length; tempi++){
                if(availabilityZone[tempi].zoneState.available == true || availabilityZone[tempi].zoneState.available == "true" || availabilityZone[tempi].zoneState.available == "True"){
                    ddzoneList.push({"text":availabilityZone[tempi].zoneName , "value":availabilityZone[tempi].zoneName});
                    for(var tempj = 0; tempj < hostList.length;tempj++){
                        if(hostList[tempj].zone == availabilityZone[tempi].zoneName){
                            allZoneList.push({"zone":hostList[tempj].zone,"host_name":hostList[tempj].host_name});
                        }
                    }
                }
            }

            $("#ddZone").data("contrailDropdown").setData(ddzoneList);
            $("#ddZone").data("contrailDropdown").value(ddzoneList[0].text);
            setHostForZone(ddzoneList[0].text);
			var svcTemplates = [];
            var svcTemplateObjs = jsonPath(results[0][0], "$..service-template");
            var svcTemplatesLen = 0;
            if(svcTemplateObjs != "false" && svcTemplateObjs != false)
                var svcTemplatesLen = svcTemplateObjs.length;

            for (var i = 0; i < svcTemplatesLen; i++) {
                var svcMode = (svcTemplateObjs[i].service_template_properties.service_mode == null) ? 
                           "Service Mode is Inactive" : svcTemplateObjs[i].service_template_properties.service_mode;

                if("ordered_interfaces" in svcTemplateObjs[i].service_template_properties
                    && (svcTemplateObjs[i].service_template_properties.ordered_interfaces != null 
                    && svcTemplateObjs[i].service_template_properties.ordered_interfaces != undefined 
                    && svcTemplateObjs[i].service_template_properties.ordered_interfaces != "false" 
                    && svcTemplateObjs[i].service_template_properties.ordered_interfaces != false )){
                    var addedData = "["+svcMode+" (";
                    for(var j=0;j<svcTemplateObjs[i].service_template_properties.interface_type.length;j++){
                        if(j > 0) addedData += ", ";
                        addedData += svcTemplateObjs[i].service_template_properties.interface_type[j].service_interface_type;
                    }
                    addedData += ")]";
                    svcTemplates.push({'text':(svcTemplateObjs[i].fq_name[1]+" - "+addedData),
                       'value':JSON.stringify(svcTemplateObjs[i])});

                } else {
                    svcTmplIntf = reorderInterface(svcTemplateObjs[i]);
                    var addedData = "["+svcMode+" (";
                    for(var j=0;j<svcTmplIntf.service_template_properties.interface_type.length;j++){
                        if(j > 0) addedData += ", ";
                        addedData += svcTmplIntf.service_template_properties.interface_type[j].service_interface_type;
                    }
                    addedData += ")]";
                    svcTemplates.push({'text':(svcTemplateObjs[i].fq_name[1]+" - "+addedData),
                       'value':JSON.stringify(svcTemplateObjs[i])});
                }

            }
            templateImages = jsonPath(results[2], "$..name");
			//svcTemplates = [];

            if(svcTemplates.length > 0){
                $("#ddsvcTemplate").data("contrailDropdown").setData(svcTemplates);
                $("#ddsvcTemplate").data("contrailDropdown").value(svcTemplates[0].value);
                windowCreateSvcInstances.modal('show');
                txtsvcInstanceName.focus();
            } else {
                showInfoWindow("No Service Template found.", "Add Service Template");
                return false;
            }
            if(!isValidDomainAndProject(selectedDomainName, selectedProjectName)){
                gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
                gridsvcInstances.showGridMessage('errorGettingData');
                return;
            }
            networks = []; 
            for(var j=0;j < results[1][0]['virtual-networks'].length;j++){
                var val="";
                var networklen = results[1][0]['virtual-networks'][j].fq_name.length; 
                for(var k=0;k<networklen;k++){
                    val += results[1][0]['virtual-networks'][j].fq_name[k];
                    if(k < networklen-1) {
                        val+=":";
                    }
                }
                var networkText = "";
                if(results[1][0]['virtual-networks'][j].fq_name[1] != $("#ddProjectSwitcher").data("contrailDropdown").text()){
                    networkText = results[1][0]['virtual-networks'][j].fq_name[2] +" ("+results[1][0]['virtual-networks'][j].fq_name[0]+":"+results[1][0]['virtual-networks'][j].fq_name[1]+")";
                } else {
                    networkText = results[1][0]['virtual-networks'][j].fq_name[2];
                }
                networks.push({'text':networkText,'value':val})
            }

            if(mode === "edit"){
                windowCreateSvcInstances.find('.modal-header-title').text("Edit Service Instance");
                var selectedRow = $("#gridsvcInstances").data("contrailGrid")._dataView.getItem(rowIndex);
                $('#btnCreatesvcInstencesOK').data('uuid',selectedRow.uuid);
                editWindow(rowIndex);
            } else {
                if(svcTemplates != undefined && svcTemplates.length > 0)
                    svcTemplateChange();
                windowCreateSvcInstances.find('.modal-header-title').text("Create Service Instance");
                $("#txtMaximumInstances").removeAttr("disabled","disabled");
                $("#txtsvcInstanceName").removeAttr("disabled","disabled");
                $("#ddsvcTemplate").data("contrailDropdown").enable();
            }
        },
        function () {
            //If atleast one api fails
            //var results = arguments;
        }
    );
}

function setHostForZone(zoneName,defautValue){
    var hostValue = [];
    //if(zoneName == "ANY"){
        hostValue.push({text:"ANY", value:"ANY"});
    //} else {
        for(var i = 0; i<allZoneList.length;i++){
            if(allZoneList[i].zone == zoneName){
                hostValue.push({text:allZoneList[i].host_name, value:allZoneList[i].host_name});
            }
        }
    //}
    $("#ddZoneHost").data("contrailDropdown").setData(hostValue);
    if(defautValue != "" && defautValue != null){
        $("#ddZoneHost").data("contrailDropdown").value(defautValue);
    } else {
        $("#ddZoneHost").data("contrailDropdown").value(hostValue[0].text);
    }
}
function createSInstanceSuccessCb() {
    fetchDataForGridsvcInstances();
}

function createSInstanceFailureCb() {
    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    gridsvcInstances.showGridMessage('errorGettingData');
    fetchDataForGridsvcInstances();
}
function editWindow(rowIndex){
    var selectedRow = $("#gridsvcInstances").data("contrailGrid")._dataView.getItem(rowIndex);
    $(txtsvcInstanceName).val(selectedRow.Service_Instance);
    var ddsvcTemplateData = $("#ddsvcTemplate").data("contrailDropdown").getAllData();
    for(var i=0;i<ddsvcTemplateData.length;i++){
        templateDataLocal = JSON.parse(ddsvcTemplateData[i].value);
        if(selectedRow.Service_Template_Name == templateDataLocal.name){
            $("#ddsvcTemplate").data("contrailDropdown").value(ddsvcTemplateData[i].value);
            svcTemplateChange(this,selectedRow);
            break;
        }
    }
    var zoneHost = (selectedRow.availability_zone).split(":");
    $("#ddZone").data("contrailDropdown").value(zoneHost[0]);
    setHostForZone(zoneHost[0],zoneHost[1]);
    $("#ddsvcTemplate").data("contrailDropdown").enable(false);
    $("#txtsvcInstanceName").attr("disabled","disabled");
    $("#txtMaximumInstances").attr("disabled","disabled");
}
function ucfirst(str) {
    if (str == null)
        return "-";
    var firstLetter = str.slice(0, 1);
    return firstLetter.toUpperCase() + str.substring(1);
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
function getInnerID(divid){
    var split = divid.split("_");
    if(split.length > 3){
        return(split[3])
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
    
    txtsvcInstanceName = $("#txtsvcInstanceName");
    if(isSet(txtsvcInstanceName)) {
        txtsvcInstanceName.remove();
        txtsvcInstanceName = $();
    }

    txtMaximumInstances = $("#txtMaximumInstances");
    if(isSet(txtMaximumInstances)) {
        txtMaximumInstances.remove();
        txtMaximumInstances = $();
    }

    btnCreatesvcInstances = $("#btnCreatesvcInstances");
    if(isSet(btnCreatesvcInstances)) {
        btnCreatesvcInstances.remove();
        btnCreatesvcInstances = $();
    }

    btnDeletesvcInstances = $("#btnDeletesvcInstances");
    if(isSet(btnDeletesvcInstances)) {
        btnDeletesvcInstances.remove();
        btnDeletesvcInstances = $();
    }

    btnCreatesvcInstencesCancel = $("#btnCreatesvcInstencesCancel");
    if(isSet(btnCreatesvcInstencesCancel)) {    
        btnCreatesvcInstencesCancel.remove();
        btnCreatesvcInstencesCancel = $();
    }

    btnCreatesvcInstencesOK = $("#btnCreatesvcInstencesOK");
    if(isSet(btnCreatesvcInstencesOK)) {
        btnCreatesvcInstencesOK.remove();
        btnCreatesvcInstencesOK = $();
    }

    btnCnfDelSInstPopupOK = $("#btnCnfDelSInstPopupOK");
    if(isSet(btnCnfDelSInstPopupOK)) {
        btnCnfDelSInstPopupOK.remove();
        btnCnfDelSInstPopupOK = $();
    }

    btnCnfDelSInstPopupCancel = $("#btnCnfDelSInstPopupCancel");
    if(isSet(btnCnfDelSInstPopupCancel)) {
        btnCnfDelSInstPopupCancel.remove();
        btnCnfDelSInstPopupCancel = $();
    }
    
    ddsvcTemplate = $("#ddsvcTemplate").data("contrailDropdown");
    if(isSet(ddsvcTemplate)) {
        ddsvcTemplate.destroy();
        ddsvcTemplate = $();
    }
    
    gridsvcInstances = $("#gridsvcInstances").data("contrailGrid");
    if(isSet(gridsvcInstances)) {
        gridsvcInstances.destroy();
        $("gridsvcInstances").empty();
        gridsvcInstances = $();
    }

    reloadSvcInstancePage(false);

    consoleWindow = $("#consoleWindow");
    if(isSet(consoleWindow)) {
        consoleWindow.remove();
        consoleWindow = $();
    }
    
    confirmDelete = $("#confirmDelete");
    if(isSet(confirmDelete)) {
        confirmDelete.remove();
        confirmDelete = $();
    }

    windowCreateSvcInstances = $("#windowCreateSvcInstances");
    if(isSet(windowCreateSvcInstances)) {
        windowCreateSvcInstances.remove();
        windowCreateSvcInstances = $();
    }
    
    var gridsTempDetailSVCInstences = $("#gridsTempDetailSVCInstences");
    if(isSet(gridsTempDetailSVCInstences)) {
        gridsTempDetailSVCInstences.remove();
        $("#gridsTempDetailSVCInstences").empty();
        gridsTempDetailSVCInstences = $();
    }
    
    var svcInstancesConfigTemplate = $("#svcInstances-config-template");
    if(isSet(svcInstancesConfigTemplate)) {
        svcInstancesConfigTemplate.remove();
        svcInstancesConfigTemplate = $();
    }
}
Handlebars.registerHelper("ifCond",function(v1,operator,v2,options) {
    switch (operator)
    {
        case "==":
            return (v1==v2)?options.fn(this):options.inverse(this);

        case "!=":
            return (v1!=v2)?options.fn(this):options.inverse(this);

        case "===":
            return (v1===v2)?options.fn(this):options.inverse(this);

        case "!==":
            return (v1!==v2)?options.fn(this):options.inverse(this);

        case "&&":
            return (v1&&v2)?options.fn(this):options.inverse(this);

        case "||":
            return (v1||v2)?options.fn(this):options.inverse(this);

        case "<":
            return (v1<v2)?options.fn(this):options.inverse(this);

        case "<=":
            return (v1<=v2)?options.fn(this):options.inverse(this);

        case ">":
            return (v1>v2)?options.fn(this):options.inverse(this);

        case ">=":
         return (v1>=v2)?options.fn(this):options.inverse(this);

        default:
            return eval(""+v1+operator+v2)?options.fn(this):options.inverse(this);
    }
});

Handlebars.registerHelper("instDetail",function(InstDetailArr,options) {
    var returnHtml = '';
    for(k=0;k<InstDetailArr.length;k++){
        returnHtml += '<div>';
        returnHtml += '<div class="span2">' + InstDetailArr[k][1] +'</div>';
        returnHtml += '<div class="span2">';
        var Stat = String(InstDetailArr[k][2]).toUpperCase();
        if(Stat == "SPAWNING"){ 
            returnHtml += '<img src="/img/loading.gif">';
        } else if(Stat == "INACTIVE") {
            returnHtml += '<span class="status-badge-rounded status-inactive"></span>';
        } else if(Stat == "PARTIALLY ACTIVE"){
            returnHtml += '<img src="/img/loading.gif">'
        } else if(Stat == "ACTIVE"){ 
            returnHtml += '<span class="status-badge-rounded status-active"></span>'
        } else if(Stat == "UPDATE"){
            returnHtml += 'Updating';
        }
        returnHtml += InstDetailArr[k][2]+' </div>';
        returnHtml += '<div class="span2">' +InstDetailArr[k][3] +'</div>';
        returnHtml += '<div class="span6">';
        var InstDetailStr = InstDetailArr[k][4].split("~~");
        if(InstDetailStr.length > 1) {
            returnHtml += '<div class="span10">';
            var msgSplit = InstDetailStr[0].split(" ");
            var msgStr = msgSplit[msgSplit.length-1] + " IP Address not assigned.";
            returnHtml += InstDetailStr[0];
            for(var inc = 0;inc < InstDetailStr.length-1;inc++) {
                returnHtml += '&nbsp;&nbsp;<span class="status-badge-rounded status-inactive" title="#= msgStr #" ></span>'
                returnHtml += InstDetailStr[inc+1];
            }
            returnHtml += '</div>';
        } else {
            returnHtml += '<div class="span10">'+ InstDetailStr +'</div>';
        }
        returnHtml += '<div class="span2"><u><a onClick="showViewConsoleWindow(\''+InstDetailArr[k][0] +'\', \''+ InstDetailArr[k][1] +'\');"> View Console </a></u></div>';
        returnHtml += '</div></div>';
    }
    return returnHtml;
});
