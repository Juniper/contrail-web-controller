/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

FloatingIPConfigObj = new FloatingIPConfig();

function FloatingIPConfig() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject, ddFipPool, ddAssociate;

    //Grids
    var gridfip;

    //Text Box
    var txtCount;

    //Buttons
    var btnCreatefip, btnDeletefip,
        btnCreatefipCancel, btnCreatefipOK, btnAssociatePopupOK,
        btnAssociatePopupCancel, btnDisassociatePopupOK, btnDisassociatePopupCancel,
        btnCnfReleasePopupOK, btnCnfReleasePopupCancel;

    //Windows
    var windowCreatefip, windowAssociate, confirmDisassociate, confirmRelease;

    var idCount = 0;
    var fipAjaxcount = 0;
    var ajaxParam;

    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents             = initComponents;
    this.initActions                = initActions;
    this.fetchData                  = fetchData;
    this.fetchDataForGridFIP        = fetchDataForGridFIP;
    this.populateDomains            = populateDomains;
    this.handleDomains              = handleDomains;
    this.populateProjects           = populateProjects;
    this.handleProjects             = handleProjects;
    this.showFIPEditWindow          = showFIPEditWindow;
    this.closeCreateFIPWindow       = closeCreateFIPWindow;
    this.fipAssociateWindow         = fipAssociateWindow;
    this.successHandlerForGridFIP   = successHandlerForGridFIP;
    this.failureHandlerForGridFIP   = failureHandlerForGridFIP;
    this.createFIPSuccessCb         = createFIPSuccessCb;
    this.createFFIPailureCb         = createFFIPailureCb;
    this.destroy                    = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#fip-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_networking_fip';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridFIP");
}

function initComponents() {
$("#gridfip").contrailGrid({
        header : {
            title : {
                text : 'Floating IP',
                //cssClass : 'blue',
                //icon : 'icon-list',
                //iconCssClass : 'blue'
            },
            customControls: [
                '<a id="btnDeletefip" class="disabled-link" title="Release Floating IP(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreatefip" onclick="showFIPEditWindow(\'add\');return false;" title="Allocate Floating IP"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />'
            ]
        },
        columnHeader : {
            columns : [
            {
                id:"ip_addr",
                field:"ip_addr",
                name:"IP Address",
                sortable: true,
                width: 100
            },
            {
                id:"instance",
                field:"instance",
                name:"Instance",
                sortable: true,
                width: 200
            },
            {
                id:"fipPool",
                field:"fipPool",
                name:"Floating IP and Pool",
                sortable: true,
                width: 200
            },
            {
                id:"uuid",
                field:"uuid",
                name:"UUID",
                sortable: true,
                width: 200
            }
            ]
        },
        body : {
            options : {
                rowHeight : 30,
                autoHeight : true,
                forceFitColumns: true,
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeletefip').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeletefip').removeClass('disabled-link');
                    }
                },
                actionCell: [
                    {
                        title: ' &nbsp; Associate Instance',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            fipAssociateWindow(rowIndex);
                        }
                    },
                    {
                        title: ' &nbsp; Disassociate',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showDisassociateWindow(rowIndex);;
                        }
                    }
                ]
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Floating IPs..',
                },
                empty: {
                    text: 'No Floating IPs Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Floating IPs.'
                }
            }
        }
    });

    gridfip = $("#gridfip").data("contrailGrid");
    gridfip.showGridMessage("loading");
    btnDeletefip            = $("#btnDeletefip");
    btnCreatefip            = $("#btnCreatefip");
    btnCreatefipCancel      = $("#btnCreatefipCancel");
    btnCreatefipOK          = $("#btnCreatefipOK");
    btnAssociatePopupOK     = $("#btnAssociatePopupOK");
    btnAssociatePopupCancel = $("#btnAssociatePopupCancel");
    btnDisassociatePopupOK  = $("#btnDisassociatePopupOK");
    btnDisassociatePopupCancel  = $("#btnDisassociatePopupCancel");
    btnCnfReleasePopupOK        = $("#btnCnfReleasePopupOK");
    btnCnfReleasePopupCancel    = $("#btnCnfReleasePopupCancel");
    txtCount = $("#txtCount");

    fipAjaxcount = 0;

    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });
    ddFipPool = $("#ddFipPool").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });
    ddAssociate = $("#ddAssociate").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });

    $('body').append($("#windowCreatefip"));
    windowCreatefip = $("#windowCreatefip");
    windowCreatefip.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#windowAssociate"));
    windowAssociate = $("#windowAssociate");
    windowAssociate.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmRelease"));
    confirmRelease = $("#confirmRelease");
    confirmRelease.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmDisassociate"));
    confirmDisassociate = $("#confirmDisassociate");
    confirmDisassociate.modal({backdrop:'static', keyboard: false, show:false});
}

var ajaxCount = 1;
var ajaxCompleated = 0;
var fip = {};
var selectedRow;
function initActions() {
    btnDeletefip.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmRelease.find('.modal-header-title').text("Confirm");
            confirmRelease.modal('show');
        }
    });

    btnCreatefipCancel.click(function (a) {
        windowCreatefip.modal('hide');
    });

    btnAssociatePopupCancel.click(function (a) {
        windowAssociate.modal('hide');
    });

    btnDisassociatePopupCancel.click(function (a) {
        confirmDisassociate.modal('hide')
    });

    btnCnfReleasePopupCancel.click(function (a) {
        confirmRelease.modal('hide')
    });

    btnAssociatePopupOK.click(function (a) {
        //Associate functions
        var selectedInstance = $(ddAssociate).val();

        var fip = {};
        fip["floating-ip"] = {};
        fip["floating-ip"]["virtual_machine_interface_refs"] = [];
        fip["floating-ip"]["virtual_machine_interface_refs"][0] = {};
        fip["floating-ip"]["virtual_machine_interface_refs"][0]["to"] = JSON.parse(selectedInstance);
        doAjaxCall("/api/tenants/config/floating-ip/" + $('#btnAssociatePopupOK').data('uuid'), "PUT", JSON.stringify(fip),
            "createFIPSuccessCb", "createFFIPailureCb");

        windowAssociate.modal('hide');
    });

    btnDisassociatePopupOK.click(function (a) {
        //Disassociate conformed functions
        var fip = {};
        fip["floating-ip"] = {};
        fip["floating-ip"]["virtual_machine_interface_refs"] = [];
        doAjaxCall("/api/tenants/config/floating-ip/" + $('#btnDisassociatePopupOK').data('uuid'), "PUT", JSON.stringify(fip),
            "createFIPSuccessCb", "createFFIPailureCb");
        confirmDisassociate.modal('hide');
    });

    btnCnfReleasePopupOK.click(function (a) {
        //Release functions
        btnDeletefip.attr("disabled","disabled");
         var selected_rows = $("#gridfip").data("contrailGrid").getCheckedRows();
         var deleteAjaxs = [];
         if(selected_rows && selected_rows.length > 0) {
            var cbParams = {};
            cbParams.selected_rows = selected_rows;
            cbParams.url = "/api/tenants/config/floating-ip/"; 
            cbParams.urlField = "uuid";
            cbParams.fetchDataFunction = "createFIPSuccessCb";
            cbParams.errorTitle = "Error";
            cbParams.errorShortMessage = "Error in deleting FIP - ";
            cbParams.errorField = "ip_addr";
            deleteObject(cbParams);
        }
        confirmRelease.modal('hide');
    });

    btnCreatefipOK.click(function (a) {
        var selectedDomaindd = $("#ddDomainSwitcher").data("contrailDropdown");
        var selectedDomain = selectedDomaindd.text();
        var selectedProjectdd = $("#ddProjectSwitcher").data("contrailDropdown");
        var selectedProject = selectedProjectdd.text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)){
            gridfip.showGridMessage("errorGettingData");
            return;
        }
        ajaxCompleated = 0;
        ajaxCount = 0;
        var selectedPool = $(ddFipPool).val();
        if($(txtCount).val().trim() != ""){
            if (!isNaN($(txtCount).val())) {
                if($(txtCount).val() > 50){
                    showInfoWindow("Enter count between 1 to 50.", "Enter a valid data");
                    return;
                } else {
                    if($(txtCount).val() < 1){
                        showInfoWindow("Enter count between 1 to 50.", "Enter a valid data");
                        return;
                    } else {
                        ajaxCount = ($(txtCount).val());
                    }
                }
            } else {
                showInfoWindow("Enter a valid Number", "Invalid Input.");
                return;
            }
        } else {
            ajaxCount = 1;
        }
        ajaxCompleated = 0;
        fip = {};
        fip["floating-ip"] = {};
        fip["floating-ip"]["parent_type"] = "floating-ip-pool";
        fip["floating-ip"]["fq_name"] = [];
        fip["floating-ip"]["fq_name"] = JSON.parse(selectedPool);
        fip["floating-ip"]["project_refs"] = [];
        fip["floating-ip"]["project_refs"][0] = {};
        fip["floating-ip"]["project_refs"][0]["to"] = [selectedDomain, selectedProject];
        doAjaxCall("/api/tenants/config/floating-ips", "POST", JSON.stringify(fip),
                "createFIPSuccessMultiple", "createFFIPailureAllocate");
        windowCreatefip.modal('hide');
        $(txtCount).val("1");
        gridfip.showGridMessage("loading");
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
        $("#ddDomainSwitcher").data("contrailDropdown").value(domains[0].value);
    }
    fetchProjects("populateProjects", "failureHandlerForGridFIP");
}

function handleDomains() {
    fetchDataForGridFIP();
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
        //btnCreatefip.attr("disabled",false);
    }    
    fetchDataForGridFIP();
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridFIP();
}

function fetchDataForGridFIP() {
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").value();
    //doAjaxCall(
    //    "/api/tenants/config/floating-ips/" + selectedProject, "GET",
    //    null, "successHandlerForGridFIP", "failureHandlerForGridFIP", null, null
    //);
    
    $("#cb_gridfip").attr("checked", false);
    $("#gridfip").data("contrailGrid")._dataView.setData([]);

    
    gridfip.showGridMessage('loading');
    idCount = 0;
    fipAjaxcount++;
    ajaxParam = selectedProject +"_"+ fipAjaxcount;

    doAjaxCall("/api/admin/config/get-data?type=floating-ip&count=4&fqnUUID="+selectedProject, 
        "GET", null, "successHandlerForGridFIP", "failureHandlerForGridFIP", null, ajaxParam);
}
function successHandlerForGridFIP(result,cbparam) {
    if(cbparam != ajaxParam){
        return;
    }
    if(result.more == true || result.more == "true"){
        gridfip.showGridMessage('loading');
        doAjaxCall("/api/admin/config/get-data?type=floating-ip&count=4&&fqnUUID="+ 
            $("#ddProjectSwitcher").data("contrailDropdown").value() +"&lastKey="+result.lastKey, 
            "GET", null, "successHandlerForGridFIP", "failureHandlerForGridFIP", null, cbparam); 
    }
    successHandlerForGridFIPRow(result);
}

function failureHandlerForGridFIP(result) {
    $("#btnCreatefip").addClass('disabled-link');
    gridfip.showGridMessage("Error","Error in getting data.");
}
function showDisassociateWindow(rowIndex) {
    confirmDisassociate.find('.modal-header-title').text("Disassociate");
    var selectedRow = $("#gridfip").data("contrailGrid")._dataView.getItem(rowIndex);
    $('#btnDisassociatePopupOK').data('uuid',selectedRow.uuid);
    confirmDisassociate.modal('show');
}

function successHandlerForGridFIPRow(result) {
    var fipData = $("#gridfip").data("contrailGrid")._dataView.getItems();
    var fips = jsonPath(result, "$..floating-ip");
    for (var i = 0; i < fips.length; i++) {
        var fip = fips[i];
        var ip_addr = ""
        ip_addr = String(jsonPath(fip, "$.floating_ip_address"));
        var instanceId = "-";
        var instance = jsonPath(fip, "$.virtual_machine_interface_refs");
        if (typeof instance === "object" && instance.length === 1)
            instanceId = String(instance[0][0].to[0]);
        var fipPool = "-";
        var fipPoolVal = jsonPath(fip, "$.fq_name");
        if (typeof fipPoolVal === "object" && fipPoolVal.length === 1)
            fipPool = String(fipPoolVal[0][2]) + ":" + String(fipPoolVal[0][3]);
        var uuid = ""
        uuid = String(jsonPath(fip, "$.uuid"));
        fipData.push({"id":idCount++, "ip_addr":ip_addr, "instance":instanceId, "fipPool":fipPool, "uuid":uuid});
    }
    if(result.more == true || result.more == "true"){
        gridfip.showGridMessage('loading');
    } else {
        if(!fipData || fipData.length<=0)
            gridfip.showGridMessage('empty');
    }
    $("#gridfip").data("contrailGrid")._dataView.setData(fipData);
}

function closeCreateFIPWindow() {
    mode = "";
    windowCreatefip.modal('hide');
}

function showFIPEditWindow(mode) {
    if($("#btnCreatefip").hasClass('disabled-link')) {
        return;
    }    
    //Allocation code to be done in this place
    if (mode == "add") {
        windowCreatefip.modal('show');
        $("#btnCreatefipOK").attr("disabled","disabled");
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").value();
        $("#ddFipPool").data("contrailDropdown").setData([""]);
        $("#ddFipPool").data("contrailDropdown").value('');
        var getAjaxs = [];
        getAjaxs[0] = $.ajax({
            url:"/api/tenants/config/floating-ip-pools/" + selectedProject,
            type:"GET"
        });
        $.when.apply($, getAjaxs).then(
            function () {
                //all success
                var results = arguments;
                var fipPools = [];
                for (var i = 0; i < results[0].floating_ip_pool_refs.length; i++) {
                    var poolObj = results[0].floating_ip_pool_refs[i];
                    var poolName = poolObj.to[1] + ":" + poolObj.to[2] + ":" + poolObj.to[3];
                    fipPools.push({text:poolName, value:JSON.stringify(poolObj.to)})
                }
                $("#ddFipPool").data("contrailDropdown").setData(fipPools);
                windowCreatefip.find('.modal-header-title').text("Allocate Floating IP");
                windowCreatefip.modal('show');
                //todo: ddFipPool.data("contrailDropdown").focus();
                if(fipPools.length > 0){
                    $("#btnCreatefipOK").attr("disabled",false);
                    $("#ddFipPool").data("contrailDropdown").value(fipPools[0].value);
                }
            },
            function () {
                $("#btnCreatefipOK").attr("disabled","disabled");
            });
    }

}

/*
 * Associate Floating IP to an Instance
 */
function fipAssociateWindow(rowIndex) {
    //Allocation code to be done in this place
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProjectdd = $("#ddProjectSwitcher").data("contrailDropdown");
    var selectedProject = selectedProjectdd.text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)){
        gridfip.showGridMessage("errorGettingData");
        return;
    }
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/virtual-machine-interfaces?tenant_id=" +
            selectedDomain + ":" + selectedProject,
        type:"GET"
    });
    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            var results = arguments;
            var vmi = [];
            for (var i = 0; i < results[0].virtual_machine_interface_back_refs.length; i++) {
                var vmiObj = results[0].virtual_machine_interface_back_refs[i];
                var vmiName = "";
                if ('instance_ip_address' in vmiObj) {
                    vmiName = "(" + vmiObj['instance_ip_address'] + ") ";
                }
                vmiName += vmiObj.to[0];
                vmi.push({text:vmiName, value:JSON.stringify(vmiObj.to)})
            }
            if(vmi && vmi.length > 0) {
                ddAssociate.data("contrailDropdown").setData(vmi);
                ddAssociate.data("contrailDropdown").value(vmi[0]);
            }
            windowAssociate.find('.modal-header-title').text("Associate Floating IP");
            var selectedRow = $("#gridfip").data("contrailGrid")._dataView.getItem(rowIndex);
            $('#btnAssociatePopupOK').data('uuid',selectedRow.uuid);
            windowAssociate.modal('show');
        },
        function () {
            //If atleast one api fails
            //var results = arguments;
            showInfoWindow("Error fetching VM interfaces", "Error");
            return false;
        });
}

function createFIPSuccessMultiple() {
    ajaxCompleated++;
    if(ajaxCompleated < ajaxCount){
        doAjaxCall("/api/tenants/config/floating-ips", "POST", JSON.stringify(fip),
                "createFIPSuccessMultiple", "createFFIPailureAllocate");
    } else {
        ajaxCompleated = 0;
        ajaxCount = 0;
        fetchDataForGridFIP();
    }
    closeCreateFIPWindow();
}
function createFIPSuccessCb() {
    fetchDataForGridFIP();
    closeCreateFIPWindow();
}
function createFFIPailureAllocate() {
    if(ajaxCompleated != 0){
        if ($("#infoWindow").length > 0){
            $("#infoWindow").remove();
            $(".modal-backdrop.in").remove();
        }
        showInfoWindow((ajaxCount-ajaxCompleated)+ " of " +ajaxCount+" Floating IP(s) Failed.","Failed");
    }
    ajaxCompleated = 0;
    ajaxCount = 0;
    fetchDataForGridFIP();
    closeCreateFIPWindow();
}
function createFFIPailureCb() {
    closeCreateFIPWindow();
    fetchDataForGridFIP();
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

    ddFipPool = $("#ddFipPool").data("contrailDropdown");
    if(isSet(ddFipPool)) {
        ddFipPool.destroy();
        ddFipPool = $();
    }

    ddAssociate = $("#ddAssociate").data("contrailDropdown");
    if(isSet(ddAssociate)) {
        ddAssociate.destroy();
        ddAssociate = $();
    }

    btnCreatefip = $("#btnCreatefip");
    if(isSet(btnCreatefip)) {
        btnCreatefip.remove();
        btnCreatefip = $();
    }

    txtCount = $("#txtCount");
    if(isSet(txtCount)) {
        txtCount.remove();
        txtCount = $();
    }

    btnDeletefip = $("#btnDeletefip");
    if(isSet(btnDeletefip)) {
        btnDeletefip.remove();
        btnDeletefip = $();
    }

    btnCreatefipCancel = $("#btnCreatefipCancel");    
    if(isSet(btnCreatefipCancel)) {
        btnCreatefipCancel.remove();
        btnCreatefipCancel = $();
    }

    btnCreatefipOK = $("#btnCreatefipOK");    
    if(isSet(btnCreatefipOK)) {
        btnCreatefipOK.remove();
        btnCreatefipOK = $();
    }

    btnAssociatePopupOK = $("#btnAssociatePopupOK");
    if(isSet(btnAssociatePopupOK)) {
        btnAssociatePopupOK.remove();
        btnAssociatePopupOK = $();
    }

    btnAssociatePopupCancel = $("#btnAssociatePopupCancel");
    if(isSet(btnAssociatePopupCancel)) {
        btnAssociatePopupCancel.remove();
        btnAssociatePopupCancel = $();
    }

    btnDisassociatePopupOK = $("#btnDisassociatePopupOK");
    if(isSet(btnDisassociatePopupOK)) {
        btnDisassociatePopupOK.remove();
        btnDisassociatePopupOK = $();
    }

    btnDisassociatePopupCancel = $("#btnDisassociatePopupCancel");
    if(isSet(btnDisassociatePopupCancel)) {
        btnDisassociatePopupCancel.remove();
        btnDisassociatePopupCancel = $();
    }

    btnCnfReleasePopupOK = $("#btnCnfReleasePopupOK");
    if(isSet(btnCnfReleasePopupOK)) {
        btnCnfReleasePopupOK.remove();
        btnCnfReleasePopupOK = $();
    }

    btnCnfReleasePopupCancel = $("#btnCnfReleasePopupCancel");
    if(isSet(btnCnfReleasePopupCancel)) {
        btnCnfReleasePopupCancel.remove();
        btnCnfReleasePopupCancel = $();
    }

    windowCreatefip = $("#windowCreatefip");
    if(isSet(windowCreatefip)) {
        windowCreatefip.remove();
        windowCreatefip = $();
    }

    windowAssociate = $("#windowAssociate");
    if(isSet(windowAssociate)) {
        windowAssociate.remove();
        windowAssociate = $();
    }

    confirmDisassociate = $("#confirmDisassociate");
    if(isSet(confirmDisassociate)) {
        confirmDisassociate.remove();
        confirmDisassociate = $();
    }

    confirmRelease = $("#confirmRelease");
    if(isSet(confirmRelease)) {
        confirmRelease.remove();
        confirmRelease = $();
    }

    gridfip = $("#gridfip").data("contrailGrid");
    if(isSet(gridfip)) {
        gridfip.destroy();
        $("#gridfip").empty();
        gridfip = $();
    }
    
    var configFipTemplate = $("#fip-config-template");
    if(isSet(configFipTemplate)) {
        configFipTemplate.remove();
        configFipTemplate = $();
    }
}
