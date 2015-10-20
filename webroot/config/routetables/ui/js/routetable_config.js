/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

routeTableConfigObj = new RouteTableConfig();

function RouteTableConfig() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject;

    //Comboboxes

    //Grids
    var gridRT;
    var gridRTDetailTemplate;

    //Buttons
    var btnCreateRT, btnDeleteRT,
        btnCreateRTCancel, btnCreateRTOK, btnRemovePopupOK, 
        btnRemovePopupCancel,btnCnfRemoveMainPopupOK,
        btnCnfRemoveMainPopupCancel;

    //Textboxes
    var txtRTName;

    //Windows
    var windowCreateRT, confirmRemove, confirmMainRemove;

    //Misc
    var mode = "";
    var rtAjaxcount = 0;
    var idCount = 0;
    var ajaxParam;
    var dynamicID;

    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForGridRT = fetchDataForGridRT;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.successHandlerForGridRTRow = successHandlerForGridRTRow;
    this.handleProjects = handleProjects;
    this.showRTEditWindow = showRTEditWindow;
    this.closeCreateRTWindow = closeCreateRTWindow;
    this.deleteRT = deleteRT;
    this.successHandlerForGridRT = successHandlerForGridRT;
    this.failureHandlerForGridRT = failureHandlerForGridRT;
    this.createRTSuccessCb = createRTSuccessCb;
    this.createRTFailureCb = createRTFailureCb;
    this.validateRouteEntry = validateRouteEntry;
    this.validate = validate;
    this.dynamicID = dynamicID;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#rt-config-template").html());
    $(contentContainer).empty();
    $(contentContainer).html(configTemplate);
    var createRTTemplate = Handlebars.compile($("#create-rt-template").html());
    $('body').append(createRTTemplate);    
    currTab = 'config_net_rt';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridRT");
}

function initComponents() {
    dynamicID = 0;
    $("#gridRT").contrailGrid({
        header : {
            title : {
                text : 'Route Tables',
            },
            customControls: ['<a id="btnDeleteRT" class="disabled-link" title="Delete Route Table(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateRT" onclick="showRTEditWindow(\'add\');return false;" title="Create Route Table"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
            columns : [
            {
                id: "RouteTable",
                field: "RouteTable",
                name: "Name",
                minWidth : 120,
                sortable: true
            },
            {
                id: "routes",
                field: "routes",
                name: "Routes",
                minWidth : 120,
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.routes === "object") {
                        for(var i=0; i<dc.routes.length, i<2; i++) {
                            if(typeof dc.routes[i] !== "undefined") {
                                var px = "";
                                var nh = "";
                                if(null !== dc.routes[i].prefix && typeof dc.routes[i].prefix == "string" &&
                                    dc.routes[i].prefix.trim() !== "")
                                    px = "<b>Prefix</b> " + dc.routes[i].prefix.trim();
                                if(null !== dc.routes[i].next_hop && typeof dc.routes[i].next_hop == "string" &&
                                    dc.routes[i].next_hop.trim() !== "")
                                    nh = " <b>Next Hop</b> " + dc.routes[i].next_hop.trim();
                                returnString += px + nh + "<br>";
                            }
                       }
                       if(dc.routes.length > 2) {
                           returnString += '<span class="moredataText">(' + 
                           (dc.routes.length-2) + 
                           ' more)</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                }
            },
            {
                id: "virtual_network_back_refs",
                field: "virtual_network_back_refs",
                name: "Associated Virtual Networks",
                minWidth : 100,
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
                    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
                    if(typeof dc.virtual_network_back_refs === "object") {
                        for(var i=0; i<dc.virtual_network_back_refs.length, i<2; i++) {
                            var vn = dc.virtual_network_back_refs[i];
                            var virtualNetworkBackRefs = "";
                            if(typeof vn !== "undefined") {
                                if(selectedDomain === vn["to"][0] &&
                                    selectedProject === vn["to"][1]) {
                                    virtualNetworkBackRefs += vn["to"][2];
                                } else {
                                    virtualNetworkBackRefs += vn["to"].join(":");
                                }
                                returnString += virtualNetworkBackRefs + "<br>";
                           }
                       }
                       if(dc.virtual_network_back_refs.length > 2) {
                           returnString += '<span class="moredataText">(' + 
                           (dc.virtual_network_back_refs.length-2) + 
                           ' more)</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                },
                sortable: true
            },
            ]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteRT').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteRT').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showRTEditWindow('edit',rowIndex);
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
                    template: $("#gridRTDetailTemplate").html()
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Route Tables..',
                },
                empty: {
                    text: 'No Route Tables Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Route Tables.'
                }
            }
        }
    });

    gridRT = $("#gridRT").data('contrailGrid');
    btnCreateRT = $("#btnCreateRT");
    btnDeleteRT = $("#btnDeleteRT");
    btnCreateRTCancel = $("#btnCreateRTCancel");
    btnCreateRTOK = $("#btnCreateRTOK");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");

    txtRTName = $("#txtRTName");
    rtAjaxcount = 0;

    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });

    gridRT.showGridMessage('loading');
    windowCreateRT = $("#windowCreateRT");
    windowCreateRT.on("hide", closeCreateRTWindow);
    windowCreateRT.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function deleteRT(selected_rows) {
    var deleteAjaxs = [];
    if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/route-table/";
        cbParams.urlField = "uuid";
        cbParams.fetchDataFunction = "fetchDataForGridRT";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting route table - ";
        cbParams.errorField = "RouteTable";
        deleteObject(cbParams);
    }
}

function initActions() {
    btnDeleteRT.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide');
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        var selected_rows = $("#gridRT").data("contrailGrid").getCheckedRows();
        deleteRT(selected_rows);
        confirmMainRemove.modal('hide');
    });
    
    btnCreateRTCancel.click(function (a) {
        windowCreateRT.hide();
    });

    btnCreateRTOK.click(function (a) {
        if($(this).hasClass('disabled-link')) { 
            return;
        }     
        if (validate() !== true)
            return;
        if (txtRTName[0].disabled == true){
            mode = "edit";
        } else {
            mode = "add";
        }
        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
            gridRT.showGridMessage('errorGettingData');
            return;
        }
            
        var rtConfig = {};
        rtConfig["route-table"] = {};
        rtConfig["route-table"]["parent_type"] = "project";
        rtConfig["route-table"]["fq_name"] = [];
        rtConfig["route-table"]["fq_name"][0] = selectedDomain;
        rtConfig["route-table"]["fq_name"][1] = selectedProject;
        rtConfig["route-table"]["fq_name"][2] = txtRTName.val();

        var currentRoutes = [];
        var routeTuples = $("#routeTuples")[0].children;
        if (routeTuples && routeTuples.length > 0) {
            for (var j = 0; j < routeTuples.length; j++) {
                var routeTuple = $($(routeTuples[j]).find("div")[0]).children();
                var currentRouteText = ($($(routeTuple[0]).find("input")).val().trim());
                var currentNextHopText = null;
                if(($($(routeTuple[1]).find("input")).val().trim()) != "")
                    currentNextHopText = ($($(routeTuple[1]).find("input")).val().trim());
                currentRoutes.push({"prefix" : currentRouteText,"next_hop" : currentNextHopText, "next_hop_type" : null });
            }
        }

        if(currentRoutes.length > 0) {
            rtConfig["route-table"]["routes"] = {};
            rtConfig["route-table"]["routes"]["route"] = currentRoutes;
        } else {
            if(mode === "edit")
                rtConfig["route-table"]["routes"] = null;
        }

        if (mode === "add") {
            doAjaxCall("/api/tenants/config/route-tables", "POST", JSON.stringify(rtConfig),
                "createRTSuccessCb", "createRTFailureCb",null,null,null);
        }
        else if (mode === "edit") {
            var currentRt = jsonPath(configObj, "$.route-tables[?(@.fq_name[0]=='" + selectedDomain + "' && " +
                            "@.fq_name[1]=='" + selectedProject + "' && @.fq_name[2]=='" + txtRTName.val().trim() + "')]");
            if((currentRt instanceof Array) && currentRt.length === 1)
               currentRt = currentRt[0]; 
            var rtUUID = currentRt.uuid;
            doAjaxCall("/api/tenants/config/route-table/" + rtUUID, "PUT", JSON.stringify(rtConfig),
                "createRTSuccessCb", "createRTFailureCb", null, null, null);
        }
        windowCreateRT.modal("hide");
    });
}

function createRouteEntry(route, len,id,element) {
    var nextHop = document.createElement("input");
    nextHop.type = "text";
    nextHop.className = "span12";
    nextHop.setAttribute("placeholder", "IP Address");
    nextHop.setAttribute("id",element+"_"+id+"_txtNextHop");
    var divNextHop = document.createElement("div");
    divNextHop.className = "span3";    
    divNextHop.appendChild(nextHop);

    var inputTxtSR = document.createElement("input");
    inputTxtSR.type = "text";
    inputTxtSR.className = "span12";
    inputTxtSR.setAttribute("placeholder", "Prefix");
    inputTxtSR.setAttribute("id",element+"_"+id+"_txtRoutePrefix");
    var divSR = document.createElement("div");
    divSR.className = "span3";
    divSR.appendChild(inputTxtSR);


    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendRouteEntry(this);");
    iBtnAddRule.setAttribute("title", "Add Route below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteRouteEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Route");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divSR);
    divRowFluidMargin5.appendChild(divNextHop);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    //rootDiv.id = "rule_" + len;
    rootDiv.id = "rule_" + id;
    rootDiv.appendChild(divRowFluidMargin5);

    if (null !== route && typeof route !== "undefined") {
        $(inputTxtSR).val(route.prefix);
        $(nextHop).val(route.next_hop);
    }    
    return rootDiv; 
}

function validateRouteEntry() {
    var routeTuples = $("#routeTuples")[0].children;
    var len = routeTuples.length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var routeTuple = $($(routeTuples[i]).find("div")[0]).children();
            var hostRoute = $($(routeTuple[0]).find("input")).val().trim();
            if (typeof hostRoute === "undefined" || "" === hostRoute ||
                hostRoute.indexOf("/") === -1 || !validip(hostRoute)) {
                showInfoWindow("Enter a valid IP address for Prefix in xxx.xxx.xxx.xxx/xx format", "Invalid input for Routes");
                return false;
            }
            /*routeTuple = $($(routeTuples[i]).find("div")[2]).children();
            if($(routeTuple[0]).val() != undefined && $(routeTuple[0]).val().trim() != ""){
                var nextHop = $(routeTuple[0]).val().trim();
                if (typeof nextHop === "undefined" || "" === nextHop ||
                    nextHop.indexOf("/") >= 0 || !validip(nextHop)) {
                    showInfoWindow("Enter a valid IP address for Next Hop in xxx.xxx.xxx.xxx format", "Invalid input for Routes");
                    return false;
                }
            }*/
        }
    }
    return true;
}

function appendRouteEntry(who, defaultRow) {
    var routeTuples = $("#routeTuples")[0].children;
    if(validateRouteEntry() === false)
        return false;
    dynamicID++;
    var routeEntry = createRouteEntry(null, $("#routeTuples")[0].children,dynamicID,"routeTuples");
    if (defaultRow) {
        $("#routeTuples").prepend($(routeEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(routeEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateRT",routeEntry,false);
}

function deleteRouteEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearRouteEntries() {
    var tuples = $("#routeTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#routeTuples").empty();
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
        fetchProjects("populateProjects", "failureHandlerForGridRT");
    } else {
        $("#gridRT").data("contrailGrid")._dataView.setData([]);
        btnCreateRT.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');        
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridRT.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');        
    }
}

function handleDomains(e) {
    var dName = e.added.text;
    setCookie("domain", dName);
    fetchProjects("populateProjects", "failureHandlerForGridRT");
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
        btnCreateRT.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForGridRT();
    } else {
        $("#gridRT").data("contrailGrid")._dataView.setData([]);
        btnCreateRT.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridRT.showGridMessage("empty");
        emptyCookie('project');
    }
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridRT();
}

function fetchDataForGridRT() {
    $("#cb_gridRT").attr("checked", false);
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridRT.showGridMessage('errorGettingData');
        return;
    }
    $("#gridRT").data("contrailGrid")._dataView.setData([]);
    configObj["route-tables"] = [];
    gridRT.showGridMessage('loading');
    idCount = 0;
    rtAjaxcount = rtAjaxcount+1;
    ajaxParam = $("#ddProjectSwitcher").data("contrailDropdown").value()+"_"+rtAjaxcount;
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/get-config-uuid-list?type=route-table&parentUUID="+$("#ddProjectSwitcher").data("contrailDropdown").value(),
        type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            var results = arguments;
            successHandlerForAllUUIDGet(results[0], ajaxParam);
        },
        function () {
            //If atleast one api fails
            var results = arguments;
            failureHandlerForAllUUIDGet(results);
        }
    );
}

function successHandlerForAllUUIDGet(allUUID, cbparam)
{
    if(cbparam != ajaxParam){
        return;
    }
    if(allUUID.length > 0) {
        var rtUUIDObj = {};
        var sendUUIDArr = [];
        rtUUIDObj.type = "route-table";
        sendUUIDArr = allUUID.slice(0, 50);
        rtUUIDObj.uuidList = sendUUIDArr;
        rtUUIDObj.fields = ["virtual_network_back_refs"];
        allUUID = allUUID.slice(50, allUUID.length);
        var param = {};
        param.cbparam = cbparam;
        param.allUUID = allUUID;
        doAjaxCall("/api/tenants/config/get-config-data-paged", "POST", JSON.stringify(rtUUIDObj),
            "successHandlerForGridRTLoop", "successHandlerForGridRTLoop", null, param);
	} else {
        gridRT.showGridMessage("empty");
    }
}

function failureHandlerForAllUUIDGet(result){
    $("#btnCreateRT").removeClass('disabled-link');
    gridRT.showGridMessage('errorGettingData');
}

function successHandlerForGridRTLoop(result, param){
    var allUUID = param.allUUID;
    var cbparam = param.cbparam;
    if(cbparam != ajaxParam){
        return;
    }
    if(allUUID.length > 0) {
        var rtUUIDObj = {};
        var sendUUIDArr = [];
        rtUUIDObj.type = "route-table";
        sendUUIDArr = allUUID.slice(0, 600);
        rtUUIDObj.uuidList = sendUUIDArr;
        rtUUIDObj.fields = ["virtual_network_back_refs"];
        allUUID = allUUID.slice(600, allUUID.length);
        var param = {};
        param.cbparam = cbparam;
        param.allUUID = allUUID;
        doAjaxCall("/api/tenants/config/get-config-data-paged", "POST", JSON.stringify(rtUUIDObj),
            "successHandlerForGridRTLoop", "successHandlerForGridRTLoop", null, param);
    } else {
        gridRT.removeGridMessage();
    }
    successHandlerForGridRTRow(result);
}

function successHandlerForGridRT(result) {
    var uuids = jsonPath(result, "$..uuid");
    var getAjaxs = [];
    for (var i = 0; i < uuids.length; i++) {
        getAjaxs[i] = $.ajax({
            url:"/api/tenants/config/route-table/" + uuids[i],
            type:"GET"
        });
    }
    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            var results = arguments;
            successHandlerForGridRTRow(results);
        },
        function () {
            //If atleast one api fails
            var results = arguments;
            failureHandlerForGridRTRow(results);
        });
}

function failureHandlerForGridRT(result) {
    $("#btnCreateRT").addClass('disabled-link');
    gridRT.showGridMessage('errorGettingData');
}

function showRemoveWindow(rowIndex) {
    $.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Route Table delete</h6>',
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
               var selected_row = $("#gridRT").data("contrailGrid")._dataView.getItem(rowNum);
               deleteRT([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
 }

function successHandlerForGridRTRow(result) {
    var rtData = $("#gridRT").data("contrailGrid")._dataView.getItems();
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var routetables = jsonPath(result, "$..route-table");
    for (var i = 0; i < routetables.length; i++) {
        configObj["route-tables"].push(routetables[i]);
        var rt = routetables[i];
        var rtName = jsonPath(rt, "$.fq_name[2]");
        if (typeof rtName === "object" && rtName.length === 1){
            if($("#ddProjectSwitcher").data("contrailDropdown").value() != rt.parent_uuid) {
                rtName = rtName[0]+" ("+rt["fq_name"][0] +":"+ rt["fq_name"][1] +")";
            } else {
                rtName = rtName[0];
            }
        } else
            rtName = "";

        var uuid = jsonPath(rt, "$.uuid");
        if (typeof uuid === "object" && uuid.length === 1)
            uuid = uuid[0];
        var parent_uuid = jsonPath(rt, "$.parent_uuid");
        if (typeof parent_uuid === "object" && parent_uuid.length === 1)
            parent_uuid = parent_uuid[0];

        var routes = jsonPath(rt, "$.routes");
        var rtDisplayName = jsonPath(rt, "$.display_name");
        if (typeof rtDisplayName === "object" && rtDisplayName.length === 1)
            rtDisplayName = rtDisplayName[0];
        var staticRoutes = [];
        var staticRoutesString = "";
        if(false !== routes && routes instanceof Array && routes.length == 1) {
            routes = routes[0];
            if(routes.hasOwnProperty("route") && routes.route instanceof Array &&
                routes.route.length > 0) {
                for(var j=0; j<routes.route.length; j++) {
                    staticRoutes.push(routes.route[j]);
                    var nh = "";
                    var px = "";
                    if(null !== routes.route[j].prefix && typeof routes.route[j].prefix == "string" &&
                        routes.route[j].prefix.trim() !== "")
                        px = "<b>Prefix</b> " + routes.route[j].prefix.trim();
                    if(null !== routes.route[j].next_hop && typeof routes.route[j].next_hop == "string" &&
                        routes.route[j].next_hop.trim() !== "")
                        nh = " <b>Next Hop</b> " + routes.route[j].next_hop.trim();

                    if(j!=0)
                        staticRoutesString += "<br>" + px + nh;
                    else
                        staticRoutesString += px + nh;
                }
            }
            else {
                staticRoutes = [];
                staticRoutesString = "-";
            }
        } else {
            staticRoutes = [];
            staticRoutesString = "-";
        }
        var vns = jsonPath(rt, "$.virtual_network_back_refs");
        var virtualNetworkBackRefsString = "";
        if(false !== vns && vns instanceof Array && vns.length == 1) {
            vns = vns[0];
            for(var j=0; j<vns.length; j++) {
                var vn = vns[j];
                if(selectedDomain === vn["to"][0] &&
                    selectedProject === vn["to"][1]) {
                    if(j!=0)
                        virtualNetworkBackRefsString += "<br>" + vn["to"][2];
                    else
                        virtualNetworkBackRefsString += vn["to"][2];
                } else {
                    if(j!=0)
                        virtualNetworkBackRefsString += "<br>" + vn["to"].join(":");
                    else
                        virtualNetworkBackRefsString += vn["to"].join(":");
                }
            }
        } else {
            virtualNetworkBackRefsString = "-";
            vns = [];
        }

        rtData.push({
            "id": idCount++,
            "uuid": uuid, 
            "RouteTable": rtName,
            "display_name": rtDisplayName,
            "routes": staticRoutes,
            "virtual_network_back_refs_string": virtualNetworkBackRefsString,
            "routes_string": staticRoutesString,
            "virtual_network_back_refs": vns
        });
    }
    if(!rtData || rtData.length<=0)
        gridRT.showGridMessage('empty');
    $("#gridRT").data("contrailGrid")._dataView.setData(rtData);
}

function failureHandlerForGridRTRow(result, cbParam) {
    gridRT.showGridMessage('errorGettingData');
}

function closeCreateRTWindow() {
    clearValuesFromDomElements();
}

function clearValuesFromDomElements() {
    mode = "";
    txtRTName.val("");
    txtRTName[0].disabled = false;
    clearRouteEntries();
}

function showRTEditWindow(mode, rowIndex) {
    if($("#btnCreateRT").hasClass('disabled-link')) {
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

    clearValuesFromDomElements();
    var results = arguments;
    if (mode === "add") {
        windowCreateRT.find('h6.modal-header-title').text('Create Route Table');
        $(txtRTName).focus();
    } else if (mode === "edit") {
        var selectedRow = $("#gridRT").data("contrailGrid")._dataView.getItem(rowIndex);
        if(null === selectedRow || typeof selectedRow === "undefined" || {} === selectedRow ||
            [] === selectedRow || "" === selectedRow) {
            return false;
        }
        txtRTName.val(selectedRow.RouteTable);
        txtRTName[0].disabled = true;
        windowCreateRT.find('h6.modal-header-title').text('Edit Route Table ' + selectedRow.RouteTable);
        var rowId = selectedRow["id"];
        var selectedRT = configObj["route-tables"][rowId];
        var uniqueRoutes = selectedRow.routes;
        for(var i=0; i<uniqueRoutes.length; i++) {
            dynamicID++;
            var rtEntry = createRouteEntry(uniqueRoutes[i],$("#routeTuples").children().length,dynamicID,"routeTuples");
            $("#routeTuples").append($(rtEntry));
        }
    }
    windowCreateRT.modal("show");
    windowCreateRT.find('.modal-body').scrollTop(0);
}

function createRTSuccessCb(result) {
    gridRT.showGridMessage('loading');   
    fetchDataForGridRT();
}

function createRTFailureCb(result) {
    gridRT.showGridMessage('loading');
    fetchDataForGridRT();
}

function validate() {
    var rtName = txtRTName.val().trim();
    if (typeof rtName === "undefined" || rtName === "") {
        showInfoWindow("Enter a valid route table name", "Input required");
        return false;
    }
    if(validateRouteEntry() === false)
        return false;
    return true;
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
    
    gridRT = $("#gridRT").data("contrailGrid");
    if(isSet(gridRT)) {
        gridRT.destroy();
        $("#gridRT").empty();
        gridRT = $();
    }

    btnCreateRT = $("#btnCreateRT");
    if(isSet(btnCreateRT)) {
        btnCreateRT.remove();
        btnCreateRT = $();
    }

    btnDeleteRT = $("#btnDeleteRT");
    if(isSet(btnDeleteRT)) {
        btnDeleteRT.remove();
        btnDeleteRT = $();
    }

    btnCreateRTCancel = $("#btnCreateRTCancel");
    if(isSet(btnCreateRTCancel)) {
        btnCreateRTCancel.remove();
        btnCreateRTCancel = $();
    }

    btnCreateRTOK = $("#btnCreateRTOK");
    if(isSet(btnCreateRTOK)) {
        btnCreateRTOK.remove();
        btnCreateRTOK = $();
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

    txtRTName = $("#txtRTName");    
    if(isSet(txtRTName)) {
        txtRTName.remove();
        txtRTName = $();
    }

    windowCreateRT = $("#windowCreateRT");
    if(isSet(windowCreateRT)) {
        windowCreateRT.remove();
        windowCreateRT = $();
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

    var rtConfigTemplate = $("#rt-config-template");
    if(isSet(rtConfigTemplate)) {
        rtConfigTemplate.remove();
        rtConfigTemplate = $();
    }
}