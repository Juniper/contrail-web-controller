/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

ServiceTemplatesObj = new ServiceTemplates();

function ServiceTemplates() {
    //Variable definitions

    //Text Box
    var txtTempName;

    //Dropdowns
    var ddDomain, ddProject, ddImageName, ddserType, ddserMode,ddFlavors;

    //Multi Select Drop Down

    //Grids
    var gridsvcTemplate ;//gridInterfaces;

    //Buttons
    var btnCreatesvcTemplate, btnDeletesvcTemplate,
        btnAddInterfaces, btnDeleteInterfaces,
        btnCreateSTempCancel, btnCreateSTempOK,
        btnCnfDelPopupOK, btnCnfDelPopupCancel;

    //Datasources
    //var dsGridSTemp;

    //Windows
    var windowCreateStemp, confirmDelete;

    var dynamicID,flavourSelectVal;
    var idCount = 0;
    var stAjaxcount = 0;
    var ajaxParam;

    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents                 = initComponents;
    this.initActions                    = initActions;
    this.fetchData                      = fetchData;
    this.fetchDataForGridsvcTemplate    = fetchDataForGridsvcTemplate;
    this.populateDomains                = populateDomains;
    this.handleDomains                  = handleDomains;
    this.populateProjects               = populateProjects;
    this.handleProjects                 = handleProjects;
    this.closeCreatesvcTemplateWindow   = closeCreatesvcTemplateWindow;
    this.sTempCreateWindow              = sTempCreateWindow;
    this.successHandlerForGridsTemp     = successHandlerForGridsTemp;
    this.failureHandlerForGridsTemp     = failureHandlerForGridsTemp;
    this.createStempSuccessCb           = createStempSuccessCb;
    this.createStempFailureCb           = createStempFailureCb;
    this.destroy = destroy;
    this.dynamicID = dynamicID;
    this.flavourSelectVal = flavourSelectVal;
}

function load() {
    var configTemplate = Handlebars.compile($("#svcTemplate-config-template").html());
    $(contentContainer).empty();
    $(contentContainer).html(configTemplate);
    currTab = 'config_sc_svctemplate';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridsTemp");
}

function initComponents() {
    gridsvcTemplate = $("#gridsvcTemplate").contrailGrid({
        header : {
            title : {
                text : 'Service Templates',
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
            customControls: ['<a id="btnDeletesvcTemplate" class="disabled-link" title="Delete Service Templates"><i class="icon-trash"></i></a>',
                '<a id="btnCreatesvcTemplate" class="disabled-link" onclick="sTempCreateWindow(\'add\');return false;" title="Create Service Templates"><i class="icon-plus"></i></a>',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
        columns:[
            {
                id:"templateName",
                field:"templateName",
                name:"Template",
                minWidth:110,
                sortable: true
            },
            {
                id:"Service_Mode",
                field:"Service_Mode",
                name:"Service Mode",
                minWidth:100,
                searchable: true
            },
            {
                id:"service_Type",
                field:"service_Type",
                name:"Service Type",
                minWidth:100,
                searchable: true
            },
            {
                id:"service_Scaling",
                field:"service_Scaling",
                name:"Service Scaling",
                minWidth:100,
                searchable: true
            },
            {
                id:"interface_type",
                field:"interface_type",
                name:"Interfaces",
                minWidth:250,
                searchable: true
            },
            {
                id:"image_Name",
                field:"image_Name",
                name:"Image Name",
                minWidth:100,
                width:100,
                searchable: true
            },
            {
                id:"flavors",
                field:"flavors",
                name:"Flavor",
                minWidth:90,
                width:90,
                searchable: true
            }
        ]},
        body : {
            options : {
                autoHeight : true,
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeletesvcTemplate').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeletesvcTemplate').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                detail: {
                    template: $("#gridsTempDetailTemplate").html(),
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Service Templates..',
                },
                empty: {
                    text: 'No Service Templates Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Service Templates.'
                },
                updating: {
                    text: "Updating Service Templates table"
                }
            }
        }
    });
    txtTempName             = $("#txtTempName");
    btnCreatesvcTemplate    = $("#btnCreatesvcTemplate");
    btnDeletesvcTemplate    = $("#btnDeletesvcTemplate");
    btnAddInterfaces        = $("#btnAddInterfaces");
    btnDeleteInterfaces     = $("#btnDeleteInterfaces");
    btnCreateSTempCancel    = $("#btnCreateSTempCancel");
    btnCreateSTempOK        = $("#btnCreateSTempOK");
    btnCnfDelPopupOK        = $("#btnCnfDelPopupOK");
    btnCnfDelPopupCancel    = $("#btnCnfDelPopupCancel");
    dynamicID = 0;
    flavourSelectVal = "";
    stAjaxcount = 0;

    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({});
    ddImageName = $("#ddImageName").contrailDropdown({
    });
    ddserType = $("#ddserType").contrailDropdown({
        data: [{text:"Firewall", value:"firewall"},{text:"Analyzer", value:"analyzer"}],
        dataTextField:"text",
        dataValueField:"value",
        change:checkAnalyzer
    });
    $("#ddserType").data("contrailDropdown").value("firewall");
    ddserMode = $("#ddserMode").contrailDropdown({
       data: [{text:"Transparent", value:"transparent"},
        {text:"In-Network", value:"in-network"},
        {text:"In-Network NAT", value:"in-network-nat"}],
        dataTextField:"text",
        dataValueField:"value",
        change:enableSharedIP
    });
    $("#ddserMode").data("contrailDropdown").value("transparent");
    ddFlavors = $("#ddFlavors").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });

    gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
    gridsvcTemplate.showGridMessage('loading');
    
    windowCreateStemp = $("#windowCreateStemp");
    windowCreateStemp.modal({backdrop:'static', keyboard: false, show:false});

    confirmDelete = $("#confirmDelete");
    confirmDelete.modal({backdrop:'static', keyboard: false, show:false});
}

function initGridsvcTemplateDetail(e) {
    var detailRow = e.detailRow;
}

function initActions() {
    btnCreatesvcTemplate.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {         
            sTempCreateWindow("add");
        }    
    });

    btnDeletesvcTemplate.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmDelete.find('.modal-header-title').text("Confirm");
            confirmDelete.modal('show');
        }
    });

    btnCreateSTempCancel.click(function (a) {
        windowCreateStemp.modal('hide');
    });

    btnCnfDelPopupCancel.click(function (a) {
        confirmDelete.modal('hide')
    });

    btnCnfDelPopupOK.click(function (a) {
        //Release functions
        $('#btnDeletesvcTemplate').addClass('disabled-link');
        var selected_rows = $("#gridsvcTemplate").data("contrailGrid").getCheckedRows();
         var deleteAjaxs = [];
         if(selected_rows && selected_rows.length > 0) {
            var cbParams = {};
            cbParams.selected_rows = selected_rows;
            cbParams.url = "/api/tenants/config/service-template/"; 
            cbParams.urlField = "uuid";
            cbParams.fetchDataFunction = "createStempSuccessCb";
            cbParams.errorTitle = "Error";
            cbParams.errorShortMessage = "Error in deleting Service Template - ";
            cbParams.errorField = "templateName";
            deleteObject(cbParams);
        }
        confirmDelete.modal('hide');
    });
    btnCreateSTempOK.click(function (a) {
        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        if(!isValidDomain(selectedDomain)){
            gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
            gridsvcTemplate.showGridMessage('errorGettingData');
             return;
        }
        var selectedImage = $("#ddImageName").data("contrailDropdown").value();
        var selectedScaling = $("#chkServiceEnabeling")[0].checked;
        var availZone = $("#chkAvailZoneEnable")[0].checked;
        var selectedType = $("#ddserType").data("contrailDropdown").value();
        var selectedMode = $("#ddserMode").data("contrailDropdown").value();
        var selectedFlavour = $("#ddFlavors").data("contrailDropdown").value();
        var serviceTemplate = {};
        var validatReturn = validate();
        
        if (validatReturn == true) {
            serviceTemplate["service-template"] = {};
            serviceTemplate["service-template"]["parent_type"] = "domain";
            serviceTemplate["service-template"]["fq_name"] = [];
            serviceTemplate["service-template"]["fq_name"] = [selectedDomain, $(txtTempName).val()];
            serviceTemplate["service-template"]["service_template_properties"] = {};
            serviceTemplate["service-template"]["service_template_properties"]["image_name"] = selectedImage;
            serviceTemplate["service-template"]["service_template_properties"]["service_scaling"] = selectedScaling;
            serviceTemplate["service-template"]["service_template_properties"]["service_type"] = selectedType;
            serviceTemplate["service-template"]["service_template_properties"]["service_mode"] = selectedMode;
            serviceTemplate["service-template"]["service_template_properties"]["availability_zone_enable"] = availZone;
            serviceTemplate["service-template"]["service_template_properties"]["interface_type"] = [];
            serviceTemplate["service-template"]["service_template_properties"]["flavor"] = selectedFlavour;
            serviceTemplate["service-template"]["service_template_properties"]["ordered_interfaces"] = true;
            //serviceTemplate["service-template"]["service_template_properties"]["ordered_interfaces"] = false;

            for(var j=0;j < $("#allInterface").children().length; j++){
                var divid = String($("#allInterface").children()[j].id);
                id = getID(divid);
                var interfaceType = $("#allInterface_"+id+"_ddInst").data("contrailCombobox").text().toLowerCase();
                var interfaceIp = $("#allInterface_"+id+"_cmbSharedIp")[0].checked;
                var interfaceRout = $("#allInterface_"+id+"_cmbStaticRout")[0].checked;
                serviceTemplate["service-template"]["service_template_properties"]["interface_type"].push(
                        {"service_interface_type":interfaceType,
                            "shared_ip":interfaceIp,"static_route_enable":interfaceRout});
            }
            serviceTemplate["service-template"]["display_name"] = serviceTemplate["service-template"]["fq_name"][serviceTemplate["service-template"]["fq_name"].length-1];
            doAjaxCall("/api/tenants/config/service-templates", "POST", JSON.stringify(serviceTemplate),
                "createStempSuccessCb", "createStempFailureCb");
            windowCreateStemp.modal('hide');
        }
    });
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
function validate() {
    if ($(txtTempName).val().trim() == "") {
        showInfoWindow("Enter a valid Template Name", "Input required");
        return false;
    }
    var selectedImage = $("#ddImageName").data("contrailDropdown");
    if (selectedImage.text().trim() === "") {
        showInfoWindow("Enter a valid Image Name", "Input required");
        return false;
    }
    var selectedImage = $("#ddFlavors").data("contrailDropdown");
    if (selectedImage.text().trim() === "") {
        showInfoWindow("Enter a valid Flavour", "Input required");
        return false;
    }
    if ($("#allInterface").children().length < 1) {
        showInfoWindow("Add at least one interface", "Input required");
        return false;
    } else {
        var allInterfaceList = [];
        var returnFlag = false;
        for (var i = 0; i < $("#allInterface").children().length; i++) {
            var divid = String($("#allInterface").children()[i].id);
            id = getID(divid);
            var interfaceVal = $("#allInterface_"+id+"_ddInst").data("contrailCombobox").value();
            var interfaceText = $("#allInterface_"+id+"_ddInst").data("contrailCombobox").text();
            if(interfaceText === ""){
                showInfoWindow("Enter a valid Interface name.", "Invalid Interface");
                return false;
            }
            if($("#ddserType").data("contrailDropdown").text() === "Analyzer"){
                if (interfaceVal.toLowerCase() == "left") {
                    returnFlag = true;
                }
                if(interfaceText.toLowerCase() != "left" && interfaceText.toLowerCase() != "management"){
                    showInfoWindow(interfaceText + " is not a valid Interface for Analyzer.", "Invalid Interface");
                    return false;
                }                
                for(var j=0;j<allInterfaceList.length;j++){
                    if(interfaceVal.toLowerCase() === allInterfaceList[j]){
                        showInfoWindow("Only one " + interfaceVal+" Interface can be configured.", "Input required");
                        return false;
                    }
                }
            } else {
                if (interfaceVal.toLowerCase() == "left" || interfaceVal.toLowerCase() == "right") {
                    returnFlag = true;
                }
                if(interfaceText.toLowerCase() != "left" && interfaceText.toLowerCase() != "right"
                       && interfaceText.toLowerCase() != "management" && interfaceText.toLowerCase() != "other"){
                    showInfoWindow(interfaceText + " is not a valid Interface.", "Invalid Interface");
                    return false;
                }                
                for(var j=0;j<allInterfaceList.length;j++){
                    if(interfaceVal.toLowerCase() === allInterfaceList[j] && (interfaceVal.toLowerCase() != "other")){
                        showInfoWindow("Only one " + interfaceVal+" Interface can be configured.", "Input required");
                        return false;
                    }
                }

            }
            allInterfaceList.push(interfaceVal.toLowerCase());
        }
        if(returnFlag === true){
            return true;
        } else {
            if($("#ddserType").data("contrailDropdown").text() === "Analyzer"){
                showInfoWindow("Add Left Interface", "Input required");
            } else {
                showInfoWindow("Add Left or Right Interface", "Input required");
            }
            return false;
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
        $("#ddDomainSwitcher").data("contrailDropdown").value(sel_domain);
        fetchProjects("populateProjects", "failureHandlerForGridsTemp");
        $('#btnCreatesvcTemplate').removeClass('disabled-link');
    } else {
        $("#gridsvcTemplate").data("contrailGrid")._dataView.setData([]);
        btnCreatesvcTemplate.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');                
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridsvcTemplate.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');        
    }}

function handleDomains(e) {
    var dName = e.added.text;
    setCookie("domain", dName);  
    btnCreatesvcTemplate.removeClass('disabled-link');    
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
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForGridsvcTemplate();
    } else {
        $("#gridsvcTemplate").data("contrailGrid")._dataView.setData([]);
        btnCreatesvcTemplate.addClass('disabled-link');
        gridsvcTemplate.showGridMessage("empty");
        emptyCookie('project');                
    }  
}
function setIPwithID(id){
    var interfaceType = $("#allInterface_"+id+"_ddInst").data("contrailCombobox").text();
    
    if($("#ddserMode").data("contrailDropdown").value() == "transparent"){
        $("#allInterface_"+id+"_cmbStaticRout")[0].checked = false;
        document.getElementById("allInterface_"+id+"_cmbStaticRout").disabled=true;
    } else {
        document.getElementById("allInterface_"+id+"_cmbStaticRout").disabled=false;
    }

    if ($("#chkServiceEnabeling")[0].checked == true) {
        switch(interfaceType){
            case "Left":{
                $("#allInterface_"+id+"_cmbSharedIp")[0].checked = true;
                document.getElementById("allInterface_"+id+"_cmbSharedIp").disabled=true;
                break;
            }
            case "Right":{
                if ($("#ddserMode").data("contrailDropdown").value() == "transparent" ||
                    $("#ddserMode").data("contrailDropdown").value() == "in-network"){
                    $("#allInterface_"+id+"_cmbSharedIp")[0].checked = true;
                } else {
                    $("#allInterface_"+id+"_cmbSharedIp")[0].checked = false;
                }
                document.getElementById("allInterface_"+id+"_cmbSharedIp").disabled=true;
                break;
            }
            case "Management":{
                $("#allInterface_"+id+"_cmbSharedIp")[0].checked = false;
                document.getElementById("allInterface_"+id+"_cmbSharedIp").disabled=true;
                break;
            }
            case "Other":{
                $("#allInterface_"+id+"_cmbSharedIp")[0].checked = false;
                document.getElementById("allInterface_"+id+"_cmbSharedIp").disabled=false;
                break;
            }
        }
    } else {
        document.getElementById("allInterface_"+id+"_cmbSharedIp").disabled=true;
        $("#allInterface_"+id+"_cmbSharedIp")[0].checked = false;
    }
}
function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridsvcTemplate();
}

function fetchDataForGridsvcTemplate() {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").value();
    var selectedDomainText = $("#ddDomainSwitcher").data("contrailDropdown").text();
    if(!isValidDomain(selectedDomainText)){
        gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
        gridsvcTemplate.showGridMessage('errorGettingData');
        return;
    }
    $("#gridsvcTemplate").data("contrailGrid")._dataView.setData([]);
    gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
    gridsvcTemplate.showGridMessage('loading');
    idCount = 0;
    stAjaxcount++;
    ajaxParam = selectedDomain+"_"+stAjaxcount;
    doAjaxCall(
        "/api/admin/config/get-data?type=service-template&count=4&fqnUUID=" + selectedDomain, "GET",
        null, "successHandlerForGridsTemp", "failureHandlerForGridsTemp", null, ajaxParam
    );
}

function successHandlerForGridsTemp(result,cbparam ) {
    if(cbparam != ajaxParam){
        return;
    }
    if(result.more == true || result.more == "true"){
        doAjaxCall("/api/admin/config/get-data?type=service-template&count=4&fqnUUID="+ 
            $("#ddDomainSwitcher").data("contrailDropdown").value() +"&lastKey="+result.lastKey, 
            "GET", null, "successHandlerForGridsTemp", "failureHandlerForGridsTempRow", null, cbparam); 
    }
    successHandlerForGridsTempRow(result);
}

function failureHandlerForGridsTempRow(result) {
    gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
    gridsvcTemplate.showGridMessage('errorGettingData');
}

function successHandlerForGridsTempRow(result) {
    var svcTemplateData;
    if(idCount > 0){
        svcTemplateData = $("#gridsvcTemplate").data("contrailGrid")._dataView.getItems();
    } else {
        svcTemplateData = [];
    }
    var svcTemplates = jsonPath(result, "$..service-template");
    var flavors;
    configObj["service-templates"] = [];
    for (var i = 0; i < svcTemplates.length; i++) {
        var svcTemplate = svcTemplates[i];
        configObj["service-templates"][i] = svcTemplates[i];

        var svc_inst_ref = null;
        var svc_instances = "";
        var svc_inst_ref_len = 0;
        if ("service_instance_back_refs" in svcTemplate) {
            svc_inst_ref = svcTemplate.service_instance_back_refs;
            svc_inst_ref_len = svcTemplate.service_instance_back_refs.length;
        }
        for (var j = 0; j < svc_inst_ref_len; j++) {
            svc_instances += svc_inst_ref[j]["to"][1] +
                ":" + svc_inst_ref[j]["to"][2];
            if (j < (svc_inst_ref_len - 1))
                svc_instances += ", ";
        }

        var svc_intf_ref = null;
        var svc_interfaces = "";
        var svc_intf_ref_len = 0;
        if ("interface_type" in svcTemplate.service_template_properties) {
            svc_intf_ref = svcTemplate.service_template_properties.interface_type;
            svc_intf_ref_len = svc_intf_ref.length;
        }
        var static_route_enable = "";
        for (var j = 0; j < svc_intf_ref_len; j++) {
            svc_interfaces += ucfirst(svc_intf_ref[j].service_interface_type);
            var ipRout = "";
            if (svc_intf_ref[j].shared_ip === "true" ||
                svc_intf_ref[j].shared_ip === "True" ||
                svc_intf_ref[j].shared_ip == true) {
                //svc_interfaces += "(Shared IP)";
                ipRout = "Shared IP";
            }
            if (svc_intf_ref[j].static_route_enable === "true" ||
                svc_intf_ref[j].static_route_enable === "True" ||
                svc_intf_ref[j].static_route_enable == true) {
                if(static_route_enable != ""){
                    static_route_enable += " , ";
                }
                if(ipRout != ""){
                ipRout += ", ";
                }
                ipRout += "Static Route";
                static_route_enable += ucfirst(svc_intf_ref[j].service_interface_type); 
            }
            if(ipRout != ""){
                svc_interfaces += "("+ipRout+")";
            }
            if (j < (svc_intf_ref_len - 1))
                svc_interfaces += ", ";
        }
        flavors = svcTemplate.service_template_properties.flavor;
        svcScalingStr = "Disabled";
        svcScaling = svcTemplate.service_template_properties.service_scaling;
        if (svcScaling === "true" || svcScaling === "True" ||
            svcScaling == true)
            svcScalingStr = "Enabled";

        svcTemplateData.push({"id":idCount++, "uuid":svcTemplate.uuid,
            "templateName":svcTemplate.name,
            "templateDN":svcTemplate.display_name,
            "Service_Mode":ucfirst(svcTemplate.service_template_properties.service_mode),
            "availability_zone":svcTemplate.service_template_properties.availability_zone_enable,
            "service_Type":ucfirst(svcTemplate.service_template_properties.service_type),
            "service_Scaling":svcScalingStr,
            "interface_type":(svc_interfaces.length) ? svc_interfaces : "-",
            "image_Name":svcTemplate.service_template_properties.image_name,
            "Instances":(svc_instances.length) ? svc_instances : "-",
            "static_route_enable":static_route_enable,
            "flavors":flavors
        });
    }
    $("#gridsvcTemplate").data("contrailGrid")._dataView.setData(svcTemplateData);
    if(!svcTemplateData || svcTemplateData.length<=0)
        gridsvcTemplate.showGridMessage('empty');
    if(result.more == true || result.more == "true"){
        gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
        gridsvcTemplate.showGridMessage('updating');
    }
}

function failureHandlerForGridsTemp(result, cbParam) {
    gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
    gridsvcTemplate.showGridMessage('errorGettingData');
}

function closeCreatesvcTemplateWindow() {
    clearPopup();
}
function clearPopup() {
    $(txtTempName).val("");
    var type = $("#ddserType").data("contrailDropdown").getAllData();
    $("#ddserType").data("contrailDropdown").value(type[0].value);
    var mode = $("#ddserMode").data("contrailDropdown").getAllData();
    $("#ddserMode").data("contrailDropdown").value(mode[0].value);

    if($("#ddImageName").data("contrailDropdown").getAllData.length > 0){
        var img = $("#ddImageName").data("contrailDropdown").getAllData();
        $("#ddImageName").data("contrailDropdown").value(img[0].value);
    }
    $("#ddFlavors").data("contrailDropdown").value(flavourSelectVal);
    for(var j=0;j < $("#allInterface").children().length; j++){
        var divid = String($("#allInterface").children()[j].id);
        id = getID(divid);
        var interfaceType = $("#allInterface_"+id+"_ddInst").data("contrailCombobox");
        interfaceType.destroy();
    }
    document.getElementById("allInterface").innerHTML = "";
    
    $("#chkServiceEnabeling")[0].checked = false;
    $(".sharedip").addClass("hide");
    mode = "";
}

function sTempCreateWindow(mode) {
    if($("#btnCreatesvcTemplate").hasClass('disabled-link')) { 
        return;
    }
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").value();
    var selectedDomainText = $("#ddDomainSwitcher").data("contrailDropdown").text();
    if(!isValidDomain(selectedDomainText)){
        gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
        gridsvcTemplate.showGridMessage('errorGettingData');
         return;
    }
    $.ajax({
        url:"/api/tenants/config/service-template-images/" + selectedDomain,
        type:"GET"
    })
    .done (function(results) {
        //var results = arguments;
        var imageNames = jsonPath(results, "$..name");
        $("#ddImageName").data("contrailDropdown").setData(imageNames);
        clearPopup();
    })
    .fail (function(results) {
        showInfoWindow("Error in loading Image.", "Error");
    });
    $.ajax({
        url:"/api/tenants/config/system-flavors",
        type:"GET"
    }).done (function(results) {
        flavour = results;
        var flavDataSource = createflavourStructure(flavour);
        $("#ddFlavors").data("contrailDropdown").setData(flavDataSource);
        clearPopup();
        
    })
    .fail (function(results) {
         showInfoWindow("Error in loading flavor.", "Error");
    });
    windowCreateStemp.find('.modal-header-title').text("Add Service Template");
    windowCreateStemp.modal('show');
    txtTempName.focus();

}
function createflavourStructure(flavours){
    var flavour = flavours.flavors;
    var returnValue = [];
    var flavourSelectValTemp;
    for (var i=0;i< flavour.length;i++){
        var swap = flavour[i].swap ? flavour[i].swap : "0" ;
        var text = flavour[i].name + "(RAM:" +flavour[i].ram+ " ,CPU cores:"+flavour[i].vcpus + " ,Disk:"+flavour[i].disk+" ,Swap:"+swap + ".)";
        var val = flavour[i].name;
        returnValue.push({"text":text,"value":val});
        if(flavourSelectVal === ""){
            flavourSelectVal = val;
            flavourSelectValTemp = flavour[i].ram;
        } else {
            if(flavourSelectValTemp !== 4096){
                if(flavour[i].ram >= 4096){
                    flavourSelectVal = val;
                    flavourSelectValTemp = flavour[i].ram;
                }
            }
        }
    }
    return returnValue;
    
}

function createStempSuccessCb() {
    closeCreatesvcTemplateWindow();
    fetchDataForGridsvcTemplate();
}

function createStempFailureCb() {
    closeCreatesvcTemplateWindow();
    fetchDataForGridsvcTemplate();
}

function ucfirst(str) {
    if (str == null)
        return "-";
    var firstLetter = str.slice(0, 1);
    return firstLetter.toUpperCase() + str.substring(1);
}
function enableSingleSharedIP(e){
    var divid = $(e.target.parentNode.parentNode).find("div")[0].id;
    var id = getID(divid);
    if(id !== -1){
        setIPwithID(id);
    }
}
function enableSharedIP(e) {
    for(var j=0;j < $("#allInterface").children().length; j++){
        var divid = String($("#allInterface").children()[j].id);
        id = getID(divid);
        if(id !== -1){
            setIPwithID(id);
        }
    }
}

function checkAnalyzer(){
    var idArr = [];
    if($("#ddserType").data("contrailDropdown").text() === "Analyzer"){
        var ddserTypeval = $("#ddserType").data("contrailDropdown").getAllData();
        if(checkAnalyzerInstence() == false){
            $("#ddserType").data("contrailDropdown").value(ddserTypeval[0].value);
            return false;
        }
        for(var j=0;j < $("#allInterface").children().length; j++){
            var divid = String($("#allInterface").children()[j].id);
            id = getID(divid);
            if(id !== -1){
                idArr.push(id);
                var InterfaceName = $("#allInterface_"+id+"_ddInst").data("contrailCombobox").text();
                if(InterfaceName != "Management" && InterfaceName != "Left"){
                    showInfoWindow("Analyzer cannot have " +InterfaceName + " Interface.", "Wrong data");
                    $("#ddserType").data("contrailDropdown").value(ddserTypeval[0].value);
                    return false;
                }
            }
        }
    }
    resetInterfaces($("#ddserType").data("contrailDropdown").text());
    return true;
}

function resetInterfaces(serviceType){
    for(var j=0;j < $("#allInterface").children().length; j++){
        var divid = String($("#allInterface").children()[j].id);
        id = getID(divid);
        if(id !== -1){
            var comboBoxElement = $("#allInterface_"+id+"_ddInst").data("contrailCombobox").getAllData();
            if(serviceType === "Analyzer"){
                comboBoxElement.splice(3,1);
                comboBoxElement.splice(2,1);
            } else if(serviceType === "Firewall"){
                comboBoxElement.push({text:"Right",value:"Right"});
                comboBoxElement.push({text:"Other",value:"Other"});
            }
            
        }
    }
}

function checkAnalyzerInstence(){
    if($("#ddserType").data("contrailDropdown").text() === "Analyzer"){
        if($("#allInterface").children().length > 2){
            showInfoWindow("Analyzer cannot have more than two interface.", "Wrong data");
            return false;
        }
    }
    return true;
}

function appendInterfaceEntry(who, defaultRow,element) {
    if($("#ddserType").data("contrailDropdown").text() === "Analyzer"){
        if($("#allInterface").children().length >= 2){
            showInfoWindow("Analyzer cannot have more than two interface.", "Wrong data");
            return false;
        }
    }
        var elementID = "#"+element;
        dynamicID++;
        var sIEntry = createInterfaceEntry(null, dynamicID,element);
        if (defaultRow) {
            $("#"+element).append($(sIEntry));
        } else {
            var parentEl = who.parentNode.parentNode.parentNode;
            parentEl.parentNode.insertBefore(sIEntry, parentEl.nextSibling);
        }
        setIPwithID(dynamicID);
scrollUp("#windowCreateStemp",sIEntry,false);
}
function createInterfaceEntry(data, id,element) {

    var nextInstenceText = getNextInstenceText();
    var selectInst = document.createElement("div");
    var selectInstval = [{text:"Management", value:"Management"},{text:"Left", value:"Left"}];
    selectInst.className = "span12 pull-left";
    if($("#ddserType").data("contrailDropdown").text() != "Analyzer"){
        selectInstval.push({text:"Right", value:"Right"},{text:"Other", value:"Other"});
    }
    selectInst.setAttribute("id",element+"_"+id+"_"+"ddInst");
    var divSelInst = document.createElement("div");
    divSelInst.className = "span4";
    divSelInst.appendChild(selectInst);
    $(selectInst).contrailCombobox({
        dataSource:{} ,
        dataTextField:"text",
        dataValueField:"value",
        change:enableSingleSharedIP
    });
    $(selectInst).data("contrailCombobox").setData(selectInstval);
    $(selectInst).data("contrailCombobox").value(nextInstenceText);
    
    var selectSharedIp = document.createElement("input");
    selectSharedIp.type = "checkbox";
    selectSharedIp.className = "ace-input";
    selectSharedIp.id = "cb_mirror_service_" + id;
    var spanSelectSharedIpLab = document.createElement("span");
    spanSelectSharedIpLab.className = "ace-lbl";
    spanSelectSharedIpLab.innerHTML = "&nbsp;";
    var divSharedIp = document.createElement("div");
    divSharedIp.className = "span3";
    divSharedIp.appendChild(selectSharedIp);
    selectSharedIp.setAttribute("id",element+"_"+id+"_cmbSharedIp");
    selectSharedIp.setAttribute("disabled","disabled");
    divSharedIp.appendChild(spanSelectSharedIpLab);

    var selectStaticRout = document.createElement("input");
    selectStaticRout.type = "checkbox";
    selectStaticRout.className = "ace-input";
    selectStaticRout.id = "cb_mirror_service_" + id;
    var spanSelectRoutLab = document.createElement("span");
    spanSelectRoutLab.className = "ace-lbl";
    spanSelectRoutLab.innerHTML = "&nbsp;";
    var divSharedRout = document.createElement("div");
    divSharedRout.className = "span3";
    selectStaticRout.setAttribute("id",element+"_"+id+"_cmbStaticRout");
    divSharedRout.appendChild(selectStaticRout);
    divSharedRout.appendChild(spanSelectRoutLab);

    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendInterfaceEntry(this,false,'"+element+"');");
    iBtnAddRule.setAttribute("id",element+"_"+id+"_"+"btnPlus");
    iBtnAddRule.setAttribute("title", "Add Interface below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteInterfaceEntry(this);");
    iBtnDeleteRule.setAttribute("id",element+"_"+id+"_"+"btnMinus");
    iBtnDeleteRule.setAttribute("title", "Delete Interface");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divSelInst);
    divRowFluidMargin5.appendChild(divSharedIp);
    divRowFluidMargin5.appendChild(divSharedRout);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    
    var rootDiv = document.createElement("div");
    rootDiv.id = element+"_" + id;
    rootDiv.appendChild(divRowFluidMargin5);

    return rootDiv; 
    
}
function deleteInterfaceEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}
function getNextInstenceText(){
    var tempArr;
    if($("#ddserType").data("contrailDropdown").text() === "Analyzer"){
        tempArr = ["Management","Left"];
    } else {
        tempArr = ["Management","Left","Right","Other"];
    }
    for(var i=0;i < $("#allInterface").children().length; i++){
        var divid = String($("#allInterface").children()[i].id);
        id = getID(divid);
        if(id === -1) {
            return false;
        }
        var interfaceType = $("#allInterface_"+id+"_ddInst").data("contrailCombobox").value();
        for(var j=0;j<tempArr.length;j++){
            if(interfaceType === tempArr[j]){
                tempArr.splice(j,1);
            }
        }
    }
    if(tempArr.length > 0){
        return(tempArr[0]);
    } else {
        if($("#ddserType").data("contrailDropdown").text() === "Analyzer"){
            return("Management");
        } else {
            return("Other");
        }
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

    txtTempName = $("#txtTempName");
    if(isSet(txtTempName)) {
        txtTempName.remove();
        txtTempName = $();
    }

    ddImageName = $("#ddImageName").data("contrailDropdown");
    if(isSet(ddImageName)) {
        ddImageName.destroy();
        ddImageName = $();
    }

    ddserType = $("#ddserType").data("contrailDropdown");
    if(isSet(ddserType)) {
        ddserType.destroy();
        ddserType = $();
    }

    ddserMode = $("#ddserMode").data("contrailDropdown");
    if(isSet(ddserMode)) {
        ddserMode.destroy();
        ddserMode = $();
    }

    ddFlavors = $("#ddFlavors").data("contrailDropdown");
    if(isSet(ddFlavors)) {
        ddFlavors.destroy();
        ddFlavors = $();
    }

    btnCreatesvcTemplate= $("#btnCreatesvcTemplate");
    if(isSet(btnCreatesvcTemplate)) {
        btnCreatesvcTemplate.remove();
        btnCreatesvcTemplate = $();
    }

    btnDeletesvcTemplate= $("#btnDeletesvcTemplate");
    if(isSet(btnDeletesvcTemplate)) {
        btnDeletesvcTemplate.remove();
        btnDeletesvcTemplate = $();
    }

    btnAddInterfaces= $("#btnAddInterfaces");    
    if(isSet(btnAddInterfaces)) {
        btnAddInterfaces.remove();
        btnAddInterfaces = $();
    }

    btnDeleteInterfaces = $("#btnDeleteInterfaces");
    if(isSet(btnDeleteInterfaces)) {
        btnDeleteInterfaces.remove();
        btnDeleteInterfaces = $();
    }

    btnCreateSTempCancel= $("#btnCreateSTempCancel");
    if(isSet(btnCreateSTempCancel)) {
        btnCreateSTempCancel.remove();
        btnCreateSTempCancel = $();
    }

    btnCreateSTempOK= $("#btnCreateSTempOK");
    if(isSet(btnCreateSTempOK)) {
        btnCreateSTempOK.remove();
        btnCreateSTempOK = $();
    }

    btnCnfDelPopupOK= $("#btnCnfDelPopupOK");
    if(isSet(btnCnfDelPopupOK)) {
        btnCnfDelPopupOK.remove();
        btnCnfDelPopupOK = $();
    }

    btnCnfDelPopupCancel= $("#btnCnfDelPopupCancel");
    if(isSet(btnCnfDelPopupCancel)) {
        btnCnfDelPopupCancel.remove();
        btnCnfDelPopupCancel = $();
    }

    gridsvcTemplate = $("#gridsvcTemplate").data("contrailGrid");
    if(isSet(gridsvcTemplate)) {
        gridsvcTemplate.destroy();
        $("#gridsvcTemplate").empty();
        gridsvcTemplate = $();
    }

    windowCreateStemp = $("#windowCreateStemp");
    if(isSet(windowCreateStemp)) {
        windowCreateStemp.remove();
        windowCreateStemp = $();
    }

    confirmDelete = $("#confirmDelete");
    if(isSet(confirmDelete)) {
        confirmDelete.remove();
        confirmDelete = $();
    }

    var svcTemplateConfigTemplate = $("#svcTemplate-config-template");
    if(isSet(svcTemplateConfigTemplate)) {
        svcTemplateConfigTemplate.remove();
        svcTemplateConfigTemplate = $();
    }
}
