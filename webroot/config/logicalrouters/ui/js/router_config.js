/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

routerConfigObj = new routerConfigObj();

function routerConfigObj() {
    //Variable definitions

    //Text Box
    var txtRouterName;

    //Dropdowns
    var ddDomain, ddProject, ddRouterStatus,ddExtGateway;
    
    
    var msConnectedNetworks;

    //Grids
    var gridLogRouter;

    //check box

    //Buttons
    var btnCreateLogicalRouter, btnDeleteLogicalRouter,
        btnCreateLRCancel, btnCreateLROK,
        btnCnfDelLRPopupOK, btnCnfDelLRPopupCancel;

    //Datasources
    //var dsGridSTemp;

    //Windows
    var windowCreateRouter, confirmDelete, consoleWindow;

    var dynamicID;
    var networks = [];
    var connectedNetworksVMI = [];
    var network_subnet = [];
    var ajaxParam;
    var stAjaxcount;
    var externalGatewayChanged;

    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForGridLogRouter = fetchDataForGridLogRouter;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.handleProjects = handleProjects;
    this.closeCreateLogRouterWindow = closeCreateLogRouterWindow;
    this.logRouterCreateWindow = logRouterCreateWindow;
    //this.successHandlerForGridsLRouter = successHandlerForGridsLRouter;
    this.failureHandlerForGridsTemp = failureHandlerForGridsTemp;
    this.createLogicalRouterSuccessCb = createLogicalRouterSuccessCb;
    this.createLogRouterFailureCb = createLogRouterFailureCb;
    this.destroy = destroy;
    this.dynamicID = dynamicID;
    this.connectedNetworksVMI = connectedNetworksVMI;
    this.externalGatewayChanged = externalGatewayChanged;
    this.stAjaxcount = stAjaxcount;
}
/* istanbul ignore next */
function load() {
    var configTemplate = Handlebars.compile($("#LogicRouter-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_net_routers';
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

    $("#gridLogRouter").contrailGrid({
        header : {
            title : {
                text : 'Routers',
            },
            customControls: ['<a id="btnDeleteLogicalRouter" class="disabled-link" title="Delete Routers"><i class="icon-trash"></i></a>',
                '<a id="btnCreateLogicalRouter" class="disabled-link" onclick="logRouterCreateWindow(\'add\');return false;" title="Create Router"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
        columns:[
            {
                id:"routerName",
                field:"routerName",
                name:"Name",
                minWidth : 120,
                sortable: true
            },
            {
                id:"externalGateway",
                field:"externalGateway",
                name:"External Gateway",
                minWidth : 300,
                sortable: true
            },
            {
                id:"connectedNetwork",
                field:"connectedNetwork",
                name:"Connected Network",
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
            {
                id:"lRouterStatus",
                field:"lRouterStatus",
                name:"Admin State",
                minWidth : 70,
            }
        ]
        },
        body : {
            options : {
                autoHeight : true,
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteLogicalRouter').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteLogicalRouter').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            logRouterCreateWindow('edit',rowIndex);
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
                    template: $("#gridsDetailLRouter").html(),
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Routers..'
                },
                empty: {
                    text: 'No Router Found.'
                },
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Router.'
                },
                updating: {
                    text: "Updating Router table"
                }

            }
        }
    });

    txtRouterName = $("#txtRouterName");
    btnCreateLogicalRouter = $("#btnCreateLogicalRouter");
    btnDeleteLogicalRouter = $("#btnDeleteLogicalRouter");
    btnCreateLRCancel = $("#btnCreateLRCancel");
    btnCreateLROK = $("#btnCreateLROK");
    btnCnfDelLRPopupOK = $("#btnCnfDelLRPopupOK");
    btnCnfDelLRPopupCancel = $("#btnCnfDelLRPopupCancel");
    dynamicID = 0;
    stAjaxcount = 0;
    connectedNetworksVMI = [];

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
    ddRouterStatus = $("#ddRouterStatus").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
    });
    ddExtGateway = $("#ddExtGateway").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        //change:changeGateway
    });
    msConnectedNetworks = $("#msConnectedNetworks").contrailMultiselect({
        placeholder: "Select Networks",
        dataTextField:"text",
        dataValueField:"value",
        dropdownCssClass: 'select2-medium-width'
    });

    
    $(ddRouterStatus).data("contrailDropdown").setData([{"text":"Up","value":true},{"text":"Down","value":false}]);
    $(ddRouterStatus).data("contrailDropdown").text("Up");

    gridLogRouter = $("#gridLogRouter").data("contrailGrid");
    gridLogRouter.showGridMessage('loading');

    confirmDelete = $("#confirmDelete");
    confirmDelete.modal({backdrop:'static', keyboard: false, show:false});

    consoleWindow = $("#consoleWindow");
    consoleWindow.modal({backdrop:'static', keyboard: false, show:false});

    windowCreateRouter = $("#windowCreateRouter");
    windowCreateRouter.on('hide', closeCreateLogRouterWindow);
    windowCreateRouter.modal({backdrop:'static', keyboard: false, show:false});
}

/* istanbul ignore next */
function initActions() {
    btnCreateLogicalRouter.click(function (a) {
    });

    btnDeleteLogicalRouter.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmDelete.find('.modal-header-title').text("Confirm");
            confirmDelete.modal('show');
        }
    });

    btnCreateLRCancel.click(function (a) {
        windowCreateRouter.modal('hide');
    });

    btnCnfDelLRPopupCancel.click(function (a) {
        confirmDelete.modal('hide')
    });

    btnCnfDelLRPopupOK.click(function (a) {
        //Release functions
        var selected_rows = $("#gridLogRouter").data("contrailGrid").getCheckedRows();
        deleteLR(selected_rows);
        confirmDelete.modal('hide')
    });

    btnCreateLROK.click(function (a) {
        if (validate() == false) {
            return;
        }
        var lRouter = {};
        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)){
            gridLogRouter = $("#gridLogRouter").data("contrailGrid");
            gridLogRouter.showGridMessage('errorGettingData');
            return;
        }
        var instName = $(txtRouterName).val();
        var maxInstances = 1;
        var autoScale = false;
            
/*            for(var inc = 0; inc < configObj["logical_router"].length; inc++){
                if(uuid == configObj["logical_router"][inc]["uuid"]){
                    lRouter["logical-router"] = configObj["logical_router"][inc];
                    break;
                }
            }
            lRouter["logical-router"]["parent_type"] = "project";
            lRouter["logical-router"]["fq_name"] = [selectedDomain,
            selectedProject,
            $(txtRouterName).val()];
            lRouter["logical-router"]["id_perms"]["enable"] = JSON.parse($("#ddRouterStatus").data("contrailDropdown").value());
            if($("#ddExtGateway").data("contrailDropdown").value() != ""){
                if(lRouter["logical-router"]["virtual_network_refs"] == undefined)
                    lRouter["logical-router"]["virtual_network_refs"] = [];
                if(lRouter["logical-router"]["virtual_network_refs"][0] == undefined)
                    lRouter["logical-router"]["virtual_network_refs"][0] = {};
                var obj = {};
                obj.to = ($("#ddExtGateway").data("contrailDropdown").value()).split(":");
                lRouter["logical-router"]["virtual_network_refs"][0] = obj;
            } else {
                 lRouter["logical-router"]["virtual_network_refs"] = [];
            }
            lRouter["logical-router"]["display_name"] = lRouter["logical-router"]["fq_name"][lRouter["logical-router"]["fq_name"].length-1];*/

            lRouter["logical-router"] = {};
            lRouter["logical-router"]["parent_type"] = "project";
            lRouter["logical-router"]["fq_name"] = [];
            lRouter["logical-router"]["fq_name"] = [selectedDomain, selectedProject, $(txtRouterName).val()];
            lRouter["logical-router"]["id_perms"] = {};
            lRouter["logical-router"]["id_perms"]["enable"] = JSON.parse($("#ddRouterStatus").data("contrailDropdown").value());
            lRouter["logical-router"]["virtual_network_refs"] = [];
            if($("#ddExtGateway").data("contrailDropdown").value() != "None"){
                lRouter["logical-router"]["virtual_network_refs"][0] = {};
                var obj = {};
                extGatewayArray = ($("#ddExtGateway").data("contrailDropdown").value()).split(",");
                obj.to = extGatewayArray[0].split(":");
                obj.uuid = extGatewayArray[1];
                lRouter["logical-router"]["virtual_network_refs"][0] = obj;
            }
            var selectedConnectedNetworks = $("#msConnectedNetworks").data("contrailMultiselect").value();
            
            if(selectedConnectedNetworks.length > 0){
                lRouter["logical-router"]["virtual_machine_interface_refs"] = [];
            }
            var inc = 0;
            for(var i=0; i<selectedConnectedNetworks.length; i++) {
                var selectedSubnet = [];
                var uuid = "";
                var to = [];
                var connectedNetworkValue = selectedConnectedNetworks[i];
                for(var j = 0;j<network_subnet.length;j++){
                    if(network_subnet[j]["value"] == connectedNetworkValue){
                        selectedSubnet = network_subnet[j]["subnet"];
                    }
                }
                if(connectedNetworksVMI.length > 0){
                    for(var tempInc = 0;tempInc < connectedNetworksVMI.length;tempInc++){
                        if("virtual_network_refs" in connectedNetworksVMI[tempInc]){
                            if(connectedNetworksVMI[tempInc]["virtual_network_refs"][0]["to"].join(":") == connectedNetworkValue){
                                uuid = connectedNetworksVMI[tempInc]["uuid"];
                                to = connectedNetworksVMI[tempInc]["to"];
                            }
                        }
                    }
                }
                var currentConnectedNetwork = connectedNetworkValue.split(":")
                lRouter["logical-router"]["virtual_machine_interface_refs"][i] = {};
                if(uuid != "" ) {
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["uuid"] = uuid;
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["to"] = [];
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["to"] = to;
                } else {
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["parent_type"] = "project";
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["fq_name"] = [];
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["fq_name"][0] = selectedDomain;
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["fq_name"][1] = selectedProject;
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["virtual_network_refs"] = [];
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["virtual_network_refs"][0] = {};
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["virtual_network_refs"][0]["to"] = currentConnectedNetwork;
                    lRouter["logical-router"]["virtual_machine_interface_refs"][i]["virtual_machine_interface_device_owner"] = "network:router_interface";
                    if(selectedSubnet.length > 0){
                        lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"] = [];
                        lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0] = {};
                        lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["instance_ip_address"] = [];
                        lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["instance_ip_address"][0] = {};
                        lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["instance_ip_address"][0]["fixedIp"] = "";//selectedSubnet[0]["subnet"]["default_gateway"];
                        lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["instance_ip_address"][0]["domain"] = selectedDomain;
                        lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["instance_ip_address"][0]["project"] = selectedProject;
                        //lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["subnet_uuid"] = selectedSubnet[0]["subnet"]["subnet_uuid"];
                        /*if(mode == "edit"){
                            lRouter["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["uuid"] = cidrValue["fixedipuuid"];
                        }*/
                    }

                
                }
                
            }
            if(txtRouterName.attr("disabled") === "disabled"){
                var uuid = $('#btnCreateLROK').data('uuid');
                var selectedLRoutedIDpermUUID = [];
                for(var inc = 0; inc < configObj["logical_router"].length; inc++){
                    if(uuid == configObj["logical_router"][inc]["uuid"]){
                        selectedLRoutedIDpermUUID = configObj["logical_router"][inc]["id_perms"]["uuid"];
                        break;
                    }
                }
                lRouter["logical-router"]["uuid"] = uuid;
                lRouter["logical-router"]["id_perms"]["uuid"] = selectedLRoutedIDpermUUID;
                console.log("update"+JSON.stringify(lRouter));
                
                doAjaxCall("/api/tenants/config/logicalrouter/" + $('#btnCreateLROK').data('uuid'), "PUT", JSON.stringify(lRouter), "createLogicalRouterSuccessCb", "createLogRouterFailureCb");
            } else {
                doAjaxCall("/api/tenants/config/logicalrouter", "POST", JSON.stringify(lRouter), "createLogicalRouterSuccessCb", "createLogRouterFailureCb");
            }
            connectedNetworksVMI = [];
        /*for(var i=0; i<$("#instanceDiv").children().length; i++) {
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
                    lRouter["logical-router"]["service_instance_properties"]["left_virtual_network"] = ddNetworkTxt;
                    break;
                }
                case "Right" :{
                    lRouter["logical-router"]["service_instance_properties"]["right_virtual_network"] = ddNetworkTxt;
                    break;
                }
                case "Management" :{
                    lRouter["logical-router"]["service_instance_properties"]["management_virtual_network"] = ddNetworkTxt;
                    break;
                }
            }
            lRouter["logical-router"]["service_instance_properties"]["interface_list"][i] = {};
            lRouter["logical-router"]["service_instance_properties"]["interface_list"][i]["virtual_network"] = ddNetworkTxt;
            if($(allInterfaceDiv+"_"+id+"_srTuple").children().length >= 1){
                lRouter["logical-router"]["service_instance_properties"]["interface_list"][i]["static_routes"] = {};
                lRouter["logical-router"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"] = [];
                for(var l = 0;l< $(allInterfaceDiv+"_"+id+"_srTuple").children().length;l++){
                    var divid = String($(allInterfaceDiv+"_"+id+"_srTuple").children()[l].id);
                    var innerId = getID(divid);
                    var prefix = $(allInterfaceDiv+"_"+id+"_srTuple_"+innerId+"_txtPrefix").val();
                    lRouter["logical-router"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l] = {};
                    lRouter["logical-router"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l]["prefix"] = prefix;
                    lRouter["logical-router"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l]["next_hop"] = null;
                    lRouter["logical-router"]["service_instance_properties"]["interface_list"][i]["static_routes"]["route"][l]["next_hop_type"] = null;
                }
            }
        }*/
        windowCreateRouter.modal('hide');
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
        $("#gridLogRouter").data("contrailGrid")._dataView.setData([]);
        btnCreateLogicalRouter.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridLogRouter.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');
    }
}

function showRemoveWindow(rowIndex) {
$.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm router delete</h6>',
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
               var selected_row = $("#gridLogRouter").data("contrailGrid")._dataView.getItem(rowNum);
               deleteLR([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
}

function deleteLR(selected_rows) {
    btnDeleteLogicalRouter.attr("disabled","disabled");
    var deleteAjaxs = [];
    if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/logicalrouter/";
        cbParams.urlField = "uuid";
        cbParams.fetchDataFunction = "createLogicalRouterSuccessCb";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting Router - ";
        cbParams.errorField = "routerName";
        deleteObject(cbParams);
    }
}

/* istanbul ignore next */
function handleDomains(e) {
    //fetchDataForGridLogRouter();
    var dName = e.added.text;
    setCookie("domain", dName);
    fetchProjects("populateProjects", "failureHandlerForGridsTemp");
}

function changeGateway(e){

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
        btnCreateLogicalRouter.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForGridLogRouter();
    } else {
        $("#gridLogRouter").data("contrailGrid")._dataView.setData([]);
        btnCreateLogicalRouter.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridLogRouter.showGridMessage("empty");
        emptyCookie('project');
    }
}

/* istanbul ignore next */
function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridLogRouter();
}

function fetchDataForGridLogRouter() {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").value();
    var selectedDomainText = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var proid = $("#ddProjectSwitcher").data("contrailDropdown").value();
    if(!isValidDomain(selectedDomainText)){
        gridLogRouter = $("#gridLogRouter").data("contrailGrid");
        gridLogRouter.showGridMessage('errorGettingData');
        return;
    }
    $("#gridLogRouter").data("contrailGrid")._dataView.setData([]);
    gridLogRouter = $("#gridLogRouter").data("contrailGrid");
    gridLogRouter.showGridMessage('loading');
    stAjaxcount++;
    configObj["logical_router"] = [];
    ajaxParam = selectedDomain+"_"+stAjaxcount;
    doAjaxCall(
        "/api/admin/config/get-data?type=logical-router&count=20&fqnUUID=" + proid, "GET",
        null, "successHandlerForGridsLRouterLoop", "failureHandlerForLRouterLoop", null, ajaxParam
    );
}

function successHandlerForGridsLRouterLoop(result , cbparam) {
    if(cbparam != ajaxParam){
        return;
    }
    if(result.more == true || result.more == "true"){
        doAjaxCall("/api/admin/config/get-data?type=logical-router&count=20&fqnUUID="+
            $("#ddProjectSwitcher").data("contrailDropdown").value() +"&lastKey="+result.lastKey,
            "GET", null, "successHandlerForGridsLRouterLoop", "failureHandlerForLRouterLoop", null, cbparam);
    }
    successHandlerForGridsLRouterRow(result);
}

function failureHandlerForLRouterLoop(result) {

}
function failureHandlerForLRouter(result) {

}

function failureHandlerForGridsTempRow(result) {
    gridLogRouter = $("#gridLogRouter").data("contrailGrid");
    gridLogRouter.showGridMessage('errorGettingData');
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
    scrollUp("#windowCreateRouter",sIEntry,false);
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
function successHandlerForGridsLRouterRow(result) {
    var LogicalRouterConfig = result.data;
    var idCount = 0;
    var LogicalRouterData = $("#gridLogRouter").data("contrailGrid")._dataView.getItems();
    var selectedDomainName = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProjectName = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(LogicalRouterConfig != null && LogicalRouterConfig != undefined){
        for(var j=0;j < LogicalRouterConfig.length;j++) {
            var logicalRouter = LogicalRouterConfig[j]['logical-router'];
            var vmUUIds = [];
            configObj["logical_router"].push(logicalRouter);
            var logicalObjectObj = mapLogicalRouterData(logicalRouter,selectedProjectName,selectedDomainName);
            LogicalRouterData.push({"Id":idCount++, "uuid":logicalObjectObj.uuid,
                "routerName":logicalObjectObj.routerName,
                "lRouterStatus":logicalObjectObj.lRouterStatus,
                "externalGateway":logicalObjectObj.externalGateway,
                "externalGatewayVal":logicalObjectObj.externalGatewayValue,
                "connectedNetwork":logicalObjectObj.connectedNetwork,
                "connectedNetworkArr":logicalObjectObj.connectedNetworkArr,
                "connectedNetworksVMI":logicalObjectObj.connectedNetworksVMI,
                "InterfaceDetailArr":logicalObjectObj.InterfaceDetailArr
            });
        }
    }
    $("#gridLogRouter").data("contrailGrid")._dataView.setData(LogicalRouterData);
    if(result.more == true || result.more == "true"){
        gridLogRouter.showGridMessage('loading');
    } else {
        if(!LogicalRouterData || LogicalRouterData.length<=0)
            gridLogRouter.showGridMessage('empty');
    }
}

function mapLogicalRouterData(LogicalRuter,projectName,selectedDomainName){
    var resultObject = {};
    resultObject.routerName = LogicalRuter["fq_name"][2];
    resultObject.uuid = LogicalRuter["uuid"];
    if(LogicalRuter["id_perms"]["enable"] === true ){
        resultObject.lRouterStatus = "Up";
    } else {
        resultObject.lRouterStatus = "Down";
    }
    resultObject.externalGatewayValue = "None"
    if(LogicalRuter["virtual_network_refs"] != "" && LogicalRuter["virtual_network_refs"] != undefined && LogicalRuter["virtual_network_refs"] != null){
        //resultObject.externalGatewayValue = [];
        resultObject.externalGatewayValue = (LogicalRuter["virtual_network_refs"][0]["to"].join(":"));
        resultObject.externalGatewayValue += ","+ LogicalRuter["virtual_network_refs"][0]["uuid"];
        var externalNet = LogicalRuter["virtual_network_refs"][0]["to"];
        if(externalNet[0] == selectedDomainName && externalNet[1] == projectName){
           resultObject.externalGateway = externalNet[2];
        } else {
           resultObject.externalGateway = externalNet[2]+" (" +externalNet[0] +":"+ externalNet[1] +")";
        }
    }
    resultObject.connectedNetwork = "";
    resultObject.connectedNetworkArr = [];
    resultObject.InterfaceDetailArr = [];
    resultObject.connectedNetworksVMI = [];
    if(LogicalRuter["virtual_machine_interface_refs"] != undefined && LogicalRuter["virtual_machine_interface_refs"] != ""){
        for(var inc = 0 ; inc < LogicalRuter["virtual_machine_interface_refs"].length;inc++){
            if("virtual_network_refs" in LogicalRuter["virtual_machine_interface_refs"][inc]){
                var connectedNetwork = LogicalRuter["virtual_machine_interface_refs"][inc]["virtual_network_refs"][0]["to"];
                var uuid = LogicalRuter["virtual_machine_interface_refs"][inc]["uuid"];
                var network = "";
                var ip = "";
                if("instance_ip_back_refs" in LogicalRuter["virtual_machine_interface_refs"][inc] && 
                   LogicalRuter["virtual_machine_interface_refs"][inc]["instance_ip_back_refs"].length  > 0 && 
                   "ip" in LogicalRuter["virtual_machine_interface_refs"][inc]["instance_ip_back_refs"][0]
                   ){
                    ip = LogicalRuter["virtual_machine_interface_refs"][inc]["instance_ip_back_refs"][0]["ip"];
                }
                resultObject.connectedNetworkArr.push(connectedNetwork.join(":"));
                if(resultObject.connectedNetwork != "")
                    resultObject.connectedNetwork += ", ";
                if(connectedNetwork[0] == selectedDomainName && connectedNetwork[1] == projectName){
                   resultObject.connectedNetwork += connectedNetwork[2];
                   network = connectedNetwork[2];
                } else {
                   resultObject.connectedNetwork += connectedNetwork[2]+" " +connectedNetwork[0] +":"+ connectedNetwork[1] +")";
                   network = connectedNetwork[2]+" (" +connectedNetwork[0] +":"+ connectedNetwork[1] +")";;
                }
                resultObject.InterfaceDetailArr.push({"uuid":uuid,"network":network,"ip":ip});
                /*if (("virtual_network_refs" in LogicalRuter["virtual_machine_interface_refs"][inc] ) && 
                  (LogicalRuter["virtual_machine_interface_refs"][inc]["virtual_network_refs"].length > 0)){
                    var connectedNetwork = LogicalRuter["virtual_machine_interface_refs"][inc]["virtual_network_refs"][0]["to"];
                    var uuid = LogicalRuter["virtual_machine_interface_refs"][inc]["uuid"];
                    var network = "";
                    var ip = LogicalRuter["virtual_machine_interface_refs"][inc]["instance_ip_back_refs"][0]["ip"];
                    if(ip == undefined){
                        ip = "";
                    }
                    
                    var val = String(LogicalRuter["virtual_machine_interface_refs"][inc]["to"].join(":")+"_"+LogicalRuter["virtual_machine_interface_refs"][inc]["uuid"]);
                    
                    resultObject.connectedNetworkArr.push(val);
                    if(resultObject.connectedNetwork != "") 
                        resultObject.connectedNetwork += ", ";
                    if(connectedNetwork[0] == selectedDomainName && connectedNetwork[1] == projectName){
                       resultObject.connectedNetwork += connectedNetwork[2];
                       network = connectedNetwork[2];
                    } else {
                       resultObject.connectedNetwork += connectedNetwork[2]+" (" +connectedNetwork[0] +":"+ connectedNetwork[1] +")";
                       network = connectedNetwork[2]+" (" +connectedNetwork[0] +":"+ connectedNetwork[1] +")";;
                    }
                    resultObject.InterfaceDetailArr.push({"uuid":uuid,"network":network,"ip":ip});
                }*/
            }
        }
        resultObject.connectedNetworksVMI = LogicalRuter["virtual_machine_interface_refs"];
    }
    return resultObject;
}

function failureHandlerForGridsTemp(result, cbParam) {
    gridLogRouter = $("#gridLogRouter").data("contrailGrid");
    gridLogRouter.showGridMessage('errorGettingData');
}
function validate() {
    if ($(txtRouterName).val().trim() == "") {
        showInfoWindow("Enter a valid Router name.", "Input required");
        return false;
    }

/*    var allInterfaceDiv = "#interface";
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
    }*/
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
function createConnectedNetworkEntry(editData, element) {
    dynamicID++;
    var intfDiv = document.createElement("div");
    intfDiv.id = element + "_" + dynamicID;
    intfDiv.className = "control-group";

    var ctrlDiv = document.createElement("div");
    ctrlDiv.className = "controls";
    intfDiv.appendChild(ctrlDiv);

    var span10 = document.createElement("span");
    span10.className = "span10";
    intfDiv.appendChild(span10);

    var selectNet = document.createElement("div");
    selectNet.id = element + "_" + dynamicID + "_ddnetwork";
    selectNet.setAttribute("onchange", "changeCIDR(this, "+dynamicID+","+element+");");
    selectNet.className = "span10";
    span10.appendChild(selectNet);

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "addConnectedNetwork(this, false,'ConnectedNetwork');");
    iBtnAddRule.setAttribute("id",element+"_"+dynamicID+"_"+"btnPlus");
    iBtnAddRule.setAttribute("title", "Add Interface below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteInterfaceEntry(this);");
    iBtnDeleteRule.setAttribute("id",element + "_" +dynamicID+"_"+"btnMinus");
    iBtnDeleteRule.setAttribute("title", "Delete Interface");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    span10.appendChild(divPullLeftMargin5Plus);
    span10.appendChild(divPullLeftMargin5Minus);

    var rowFluidDiv1 = document.createElement("div");
    rowFluidDiv1.id = element + "_" + dynamicID + "_interfaceOption";
    rowFluidDiv1.className = "span10";
    intfDiv.appendChild(rowFluidDiv1);

    var widgetDiv = document.createElement("div");
    widgetDiv.id = element + "_" + dynamicID+"_widget";
    widgetDiv.className = "widget-box span8 transparent collapsed";
    rowFluidDiv1.appendChild(widgetDiv);

    var widgetHeaderDiv = document.createElement("div");
    widgetHeaderDiv.id = "interface_widget_header_" + dynamicID;
    widgetHeaderDiv.className = "widget-header";
    widgetDiv.appendChild(widgetHeaderDiv);

    var widgetHeaderH5 = document.createElement("h5");
    widgetHeaderH5.className = "smaller";
    widgetHeaderDiv.appendChild(widgetHeaderH5);
    widgetHeaderH5.setAttribute("onclick", "scrollUp(\"#windowCreateRouter\",this,true,\"#"+element + "_"+ dynamicID+ "_widget\");");

    var widgetHeaderH5I = document.createElement("i");
    widgetHeaderH5I.className = "icon-caret-right grey";
    widgetHeaderH5.appendChild(widgetHeaderH5I);

    var widgetHeaderH5Span = document.createElement("span");
    widgetHeaderH5Span.innerHTML = "Subnet";
    widgetHeaderH5.appendChild(widgetHeaderH5Span);

    var widgetBodyDiv = document.createElement("div");
    widgetBodyDiv.id = "interface_widget_body_" + dynamicID;
    widgetBodyDiv.className = "widget-body";
    widgetDiv.appendChild(widgetBodyDiv);

    var widgetBodyMainDiv = document.createElement("div");
    widgetBodyMainDiv.id = "interface_widget_body_main_" + dynamicID;
    widgetBodyMainDiv.className = "widget-main";
    widgetBodyDiv.appendChild(widgetBodyMainDiv);

    var srTuples = document.createElement("div");
    srTuples.id = element + "_" + dynamicID + "_srTuple";
    widgetBodyMainDiv.appendChild(srTuples);

    var selectSubnet = document.createElement("div");
    selectSubnet.className = "span12 pull-left";
    selectSubnet.setAttribute("id",element + "_" +dynamicID+"_"+"ddSubnet");
    var divSubnet = document.createElement("div");
    divSubnet.className = "span6";
    divSubnet.appendChild(selectSubnet);
    $(selectSubnet).contrailCombobox({
        dataSource:{} ,
        dataTextField:"text",
        dataValueField:"value",
    });
    srTuples.appendChild(divSubnet);

    var inputTxtRemotePorts = document.createElement("input");
    inputTxtRemotePorts.type = "text";
    inputTxtRemotePorts.className = "span12";
    inputTxtRemotePorts.setAttribute("placeholder", "Fixed IP");
    inputTxtRemotePorts.setAttribute("id",element + "_"+dynamicID+"_"+"remotePorts");
    var divRowFluidDestPorts = document.createElement("div");
    divRowFluidDestPorts.className = "span6";
    divRowFluidDestPorts.appendChild(inputTxtRemotePorts);

    srTuples.appendChild(divRowFluidDestPorts);

    $(selectNet).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
    });
    var networksTemp = [];
    for(i=0;i<networks.length;i++){
        networksTemp.push(networks[i]);
    }

    $(selectNet).data("contrailDropdown").setData(networksTemp);
    if(networksTemp.length > 0)
        $(selectNet).data("contrailDropdown").value(networksTemp[0].value);
    var subnetArr = formatSubnet(network_subnet, networksTemp[0].value);
    $("#"+element + "_"+dynamicID+"_interfaceOption").removeClass("hide");

    $(selectNet).data("contrailDropdown").enable(true);
    if(editData != {} && editData != undefined ){
        $(selectNet).data("contrailDropdown").value(editData);
        subnetArr = formatSubnet(network_subnet, editData);
        $(selectNet).data("contrailDropdown").enable(false);
        $("#"+element + "_"+dynamicID+"_interfaceOption").addClass("hide");
    }
    
    $(selectSubnet).data("contrailCombobox").setData(subnetArr);
    if(subnetArr.length > 0){
        $(selectSubnet).data("contrailCombobox").value(subnetArr[0].value);
        $(inputTxtRemotePorts).val(subnetArr[0].value);
    }
    return intfDiv;
}
function deleteInterfaceEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}
function closeCreateLogRouterWindow() {
    clearPopupValues();
}

function clearPopupValues() {
    mode = "";
    $(txtRouterName).val("");
}
function changeCIDR(who,ID){
    var networkVal = $("#ConnectedNetwork_" + ID + "_ddnetwork").data("contrailDropdown").value()
    var subnetArr = formatSubnet(network_subnet, networkVal);
    $("#ConnectedNetwork_"+ID+ "_ddSubnet").data("contrailCombobox").setData(subnetArr);
    if(subnetArr.length > 0){
        $("#ConnectedNetwork_" + ID + "_ddSubnet").data("contrailCombobox").value(subnetArr[0].value);
        $("#ConnectedNetwork_"+dynamicID+"_"+"remotePorts").val(subnetArr[0].value);
    }
}
function formatSubnet(network_subnet, value){
    returnVal = [];
    for(var inc = 0;inc < network_subnet.length;inc++){
        if(network_subnet[inc]["value"] == value){
            for(var j = 0;j < network_subnet[inc]["subnet"].length; j++){
                returnVal.push({"text" : network_subnet[inc]["subnet"][j]["subnet"]["ipam_subnet"],"value" : network_subnet[inc]["subnet"][j]["subnet"]["default_gateway"]});
            }
        }
    }
    return returnVal;
}
/*
 * Create Window
 */

function logRouterCreateWindow(mode,rowIndex) {

    var selectedDomainName = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").value();
    var selectedProjectName = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").value();
    if(!isValidDomainAndProject(selectedDomainName, selectedProjectName)){
        gridLogRouter = $("#gridLogRouter").data("contrailGrid");
        gridLogRouter.showGridMessage('errorGettingData');
        return;
    }

    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/all-virtual-networks?uuid="+selectedProject,
        type:"GET"
    });

    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/external-virtual-networks",
        type:"GET"
    });
    
    /*getAjaxs[2] = $.ajax({
        url:"/api/tenants/config/shared-virtual-networks",
        type:"GET"
    });*/

    $.when.apply($, getAjaxs).then(
        function () {
            var results = arguments;

            networks = [];
            network_subnet = [];
            var externalNetworks = [];
            var localNetworks = [];
            if(results[0][0] != null && results[0][0] != "" && results[0][0].length > 0) {
                localNetworks = results[0][0];
            }
            for(var j=0;j < localNetworks.length;j++){
                var val="";
                var localNetwork = localNetworks[j]["virtual-network"];
                var networklen = localNetwork.fq_name.length;
                for(var k=0;k<networklen;k++){
                    val += localNetwork.fq_name[k];
                    if(k < networklen-1) {
                        val+=":";
                    }
                }
                var networkText = "";
                if(localNetwork.fq_name[1] != $("#ddProjectSwitcher").data("contrailDropdown").text()){
                    networkText = localNetwork.fq_name[2] +" ("+localNetwork.fq_name[0]+":"+localNetwork.fq_name[1]+")";
                } else {
                    networkText = localNetwork.fq_name[2];
                }
                    if(localNetworks[j]["virtual-network"]["router_external"] != true &&
                       "network_ipam_refs" in localNetworks[j]["virtual-network"] && 
                       localNetworks[j]["virtual-network"]["network_ipam_refs"].length > 0){
                        networks.push({'text':networkText,'value':val});
                    }
                var subnet = localNetwork["network_ipam_refs"];
                network_subnet.push({"value" :val,"subnet":subnet})
            }
            //External Network
            localNetworks = [];
            if(results[1][0] != null && results[1][0] != "" && results[1][0] && results[1][0].length > 0) {
                localNetworks = results[1][0];
            }
            externalNetworks = [];
            externalNetworks.push({'text':"None",'value':"None"})
            for(var j=0;j < localNetworks.length;j++){
                var localNetwork = localNetworks[j]["virtual-network"];
                var val=localNetwork.fq_name.join(":");
                val += ","+ localNetwork.uuid;
                /*var networklen = localNetwork.fq_name.length;
                for(var k=0;k<networklen;k++){
                    val += localNetwork.fq_name[k];
                    if(k < networklen-1) {
                        val+=":";
                    }
                }*/
                var networkText = "";
                if(localNetwork.fq_name[1] != $("#ddProjectSwitcher").data("contrailDropdown").text()){
                    networkText = localNetwork.fq_name[2] +" ("+localNetwork.fq_name[0]+":"+localNetwork.fq_name[1]+")";
                } else {
                    networkText = localNetwork.fq_name[2];
                }
                externalNetworks.push({'text':networkText,'value':val})
            }
            
            $(ddExtGateway).data("contrailDropdown").setData(externalNetworks);
            $(ddExtGateway).data("contrailDropdown").text("None");

            /*var localNetworks = [];
            if(results[2][0] != null && results[2][0] != "" && results[2][0].length > 0) {
                localNetworks = results[2][0];
            }
            for(var j=0;j < localNetworks.length;j++){
                var val="";
                var localNetwork = localNetworks[j]["virtual-network"];
                val = localNetwork["fq_name"].join(":");
                var networkText = "";
                if(localNetwork.fq_name[1] != selectedProjectName){
                    if(localNetwork["router_external"] == false &&
                      "network_ipam_refs" in localNetworks[j]["virtual-network"] && 
                      localNetworks[j]["virtual-network"]["network_ipam_refs"].length > 0){
                        networkText = localNetwork.fq_name[2] +" ("+localNetwork.fq_name[0]+":"+localNetwork.fq_name[1]+")";
                        networks.push({'text':networkText,'value':val})
                    }
                }
            }*/
            
            $("#msConnectedNetworks").data("contrailMultiselect").setData(networks);

            $("#ConnectedNetwork").empty();
            windowCreateRouter.modal('show');
            txtRouterName.focus();
            if(mode === "edit"){
                windowCreateRouter.find('.modal-header-title').text("Edit Router");
                var selectedRow = $("#gridLogRouter").data("contrailGrid")._dataView.getItem(rowIndex);
                $('#btnCreateLROK').data('uuid',selectedRow.uuid);
                editWindow(rowIndex);
            } else {
                windowCreateRouter.find('.modal-header-title').text("Create Router");
                $("#txtRouterName").removeAttr("disabled","disabled");
            }
            
            
        },
        function () {
            //If atleast one api fails
            //var results = arguments;
        }
    );
}
function addConnectedNetwork(who,defaultRow,element){
    //var elementID = "#"+element;
    var connectedNetEntry = createConnectedNetworkEntry(null, element);
    if (defaultRow) {
        $("#"+element).append($(connectedNetEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(connectedNetEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateRouter",connectedNetEntry,false);
}

function createLogicalRouterSuccessCb() {
    fetchDataForGridLogRouter();
}

function createLogRouterFailureCb() {
    gridLogRouter = $("#gridLogRouter").data("contrailGrid");
    gridLogRouter.showGridMessage('errorGettingData');
    fetchDataForGridLogRouter();
}
function editWindow(rowIndex){
    var selectedRow = $("#gridLogRouter").data("contrailGrid")._dataView.getItem(rowIndex);
    $(txtRouterName).val(selectedRow.routerName);
    $("#txtRouterName").attr("disabled","disabled");
    if(selectedRow.lRouterStatus == "Down")
    $("#ddRouterStatus").data("contrailDropdown").value("false");
    if(selectedRow.lRouterStatus == "Up")
    $("#ddRouterStatus").data("contrailDropdown").value("true");
    console.log(selectedRow.externalGatewayVal)
    $(ddExtGateway).data("contrailDropdown").value(selectedRow.externalGatewayVal);
    $("#msConnectedNetworks").data("contrailMultiselect").value(selectedRow.connectedNetworkArr);
    connectedNetworksVMI = selectedRow.connectedNetworksVMI;
    /*if(selectedRow.connectedNetworkArr.length > 0){
    var len = selectedRow.connectedNetworkArr.length;
        for(var i = 0; i<len;i++){
            var connectedNetEntry = createConnectedNetworkEntry(selectedRow.connectedNetworkArr[i],"ConnectedNetwork")
            $("#ConnectedNetwork").append($(connectedNetEntry));
        }
    }*/
    
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

    txtRouterName = $("#txtRouterName");
    if(isSet(txtRouterName)) {
        txtRouterName.remove();
        txtRouterName = $();
    }

    btnCreateLogicalRouter = $("#btnCreateLogicalRouter");
    if(isSet(btnCreateLogicalRouter)) {
        btnCreateLogicalRouter.remove();
        btnCreateLogicalRouter = $();
    }

    btnDeleteLogicalRouter = $("#btnDeleteLogicalRouter");
    if(isSet(btnDeleteLogicalRouter)) {
        btnDeleteLogicalRouter.remove();
        btnDeleteLogicalRouter = $();
    }

    btnCreateLRCancel = $("#btnCreateLRCancel");
    if(isSet(btnCreateLRCancel)) {
        btnCreateLRCancel.remove();
        btnCreateLRCancel = $();
    }

    btnCreateLROK = $("#btnCreateLROK");
    if(isSet(btnCreateLROK)) {
        btnCreateLROK.remove();
        btnCreateLROK = $();
    }

    btnCnfDelLRPopupOK = $("#btnCnfDelLRPopupOK");
    if(isSet(btnCnfDelLRPopupOK)) {
        btnCnfDelLRPopupOK.remove();
        btnCnfDelLRPopupOK = $();
    }

    btnCnfDelLRPopupCancel = $("#btnCnfDelLRPopupCancel");
    if(isSet(btnCnfDelLRPopupCancel)) {
        btnCnfDelLRPopupCancel.remove();
        btnCnfDelLRPopupCancel = $();
    }

    ddRouterStatus = $("#ddRouterStatus").data("contrailDropdown");
    if(isSet(ddRouterStatus)) {
        ddRouterStatus.destroy();
        ddRouterStatus = $();
    }

    ddExtGateway = $("#ddExtGateway").data("contrailDropdown");
    if(isSet(ddExtGateway)) {
        ddExtGateway.destroy();
        ddExtGateway = $();
    }

    gridLogRouter = $("#gridLogRouter").data("contrailGrid");
    if(isSet(gridLogRouter)) {
        gridLogRouter.destroy();
        $("gridLogRouter").empty();
        gridLogRouter = $();
    }

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

    windowCreateRouter = $("#windowCreateRouter");
    if(isSet(windowCreateRouter)) {
        windowCreateRouter.remove();
        windowCreateRouter = $();
    }

    var gridsDetailLRouter = $("#gridsDetailLRouter");
    if(isSet(gridsDetailLRouter)) {
        gridsDetailLRouter.remove();
        $("#gridsDetailLRouter").empty();
        gridsDetailLRouter = $();
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

Handlebars.registerHelper("interfaceDetail",function(InterfaceDetailArr,options) {
    var returnHtml = '';
    for(k=0;k<InterfaceDetailArr.length;k++){
        returnHtml += '<div>';
        returnHtml += '<div class="span4">' + InterfaceDetailArr[k]["uuid"] +'</div>';
        returnHtml += '<div class="span3">' + InterfaceDetailArr[k]["network"] +'</div>';
        returnHtml += '<div class="span3">' + InterfaceDetailArr[k]["ip"] +'</div>';        
        returnHtml += '</div>';
    }
    return returnHtml;
});
