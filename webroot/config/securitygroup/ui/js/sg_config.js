/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

sgConfigObj = new sgConfigObj();
var  iconSG ='icon-contrail-security-group', iconSubnet ='icon-contrail-network-ipam';
function sgConfigObj() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject;

    //Comboboxes

    //Grids
    var gridSG;

    //Buttons
    var btnCreateSG, btnDeleteSG, btnCreateSGCancel, btnCreateSGOK, btnAddRule, btnDeleteRule,
    btnRemovePopupOK, btnRemovePopupCancel, btnCnfRemoveMainPopupOK, btnCnfRemoveMainPopupCancel;

    //Textboxes
    var txtRuleName, txtSGID;


    //Windows
    var windowCreateSG, confirmRemove, confirmMainRemove;

    var idCount =0;
    var polAjaxcount = 0;
    var ajaxParam;
    var dynamicID = 0;
    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForgridSG = fetchDataForgridSG;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.handleProjects = handleProjects;
    this.deleteSG = deleteSG;
    this.showsgEditWindow = showsgEditWindow;
    this.closeCreateSGWindow = closeCreateSGWindow;
    this.successHandlerForgridSGRow = successHandlerForgridSGRow;
    this.failureHandlerForgridSGRow = failureHandlerForgridSGRow;
    this.successHandlerForgridSG = successHandlerForgridSG;
    this.failureHandlerForgridSG = failureHandlerForgridSG;
    this.createSGSuccessCb = createSGSuccessCb;
    this.createSGFailureCb = createSGFailureCb;
    this.validate = validate;
    this.dynamicID = dynamicID;
    this.appendSGRuleEntry = appendSGRuleEntry;
    this.formatedRule = formatedRule;
    this.getDirection = getDirection;
    this.formatSGPolicyRule = formatSGPolicyRule;
    this.showRemoveWindow = showRemoveWindow;
    this.clearValuesFromDomElements = clearValuesFromDomElements;
    this.clearRuleEntries = clearRuleEntries;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#sg-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_net_sg';

    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForgridSG");
}

function initComponents() {
    $("#gridSG").contrailGrid({
        header : {
            title : {
                text : 'Security Groups',
            },
            customControls: ['<a id="btnDeleteSG" class="disabled-link" title="Delete Security Group(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateSG" onclick="showsgEditWindow(\'add\');return false;" title="Create Security Group"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
            columns : [
            {
                id:"sgName",
                field:"sgName",
                name:"Security Groups",
                width: 200,
                sortable: true
            },
            {
                id: "sgRules",
                field: "sgRules",
                name: "Rules",
                width: 650,
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.sgRules === "object") {
                       for(var i=0; i<dc.sgRules.length, i<2; i++) {
                           if(typeof dc.sgRules[i] !== "undefined") {
                               returnString += dc.sgRules[i] + "<br>";
                           }
                       }
                       if(dc.sgRules.length > 2) {
                       returnString += '<span class="moredataText">(' + (dc.sgRules.length-2) + ' more)</span> \
                           <span class="moredata" style="display:none;" ></span>';
                       }
                    }
                    return returnString;
                }
            }]
        },
        body : {
            options : {
                forceFitColumns: true,
                checkboxSelectable: {
                    enableRowCheckbox: function(dc) {
                         return (dc.sgName != "default");
                    },
                    onNothingChecked: function(e){
                        $('#btnDeleteSG').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteSG').removeClass('disabled-link');
                    }
                },
                actionCell: function(dc){
                    if(dc.sgName != "default"){
                        return [{
                            title: 'Edit',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                showsgEditWindow('edit',rowIndex);
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
                         return [{
                            title: 'Edit',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                showsgEditWindow('edit',rowIndex);
                            }
                        }];
                    }
                },

                /*actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showsgEditWindow('edit',rowIndex);
                        }
                    },
                    {
                        title: 'Delete',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showRemoveWindow(rowIndex);
                        }
                    }
                ],*/
                detail:{
                    template: $("#gridSGDetailTemplate").html()
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Security Groups..',
                },
                empty: {
                    text: 'No Security Groups Found.'
                },
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Security Groups.'
                }
            }
        }
    });

    gridSG = $("#gridSG").data("contrailGrid");
    gridSG.showGridMessage("loading");

    btnCreateSG = $("#btnCreateSG");
    btnDeleteSG = $("#btnDeleteSG");
    btnAddRule = $("#btnAddRule");
    btnDeleteRule = $("#btnDeleteRule");
    btnCreateSGCancel = $("#btnCreateSGCancel");
    btnCreateSGOK = $("#btnCreateSGOK");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");

    txtRuleName = $("#txtRuleName");
    txtSGID = $("#txtSGID");
    polAjaxcount = 0;

    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });
    dynamicID = 0;
    windowCreateSG = $("#windowCreateSG");
    windowCreateSG.on("hide", closeCreateSGWindow);
    windowCreateSG.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function deleteSG(selected_rows) {
    btnDeleteSG.attr("disabled","disabled");
    var deleteAjaxs = [];
    if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/securitygroup/";
        cbParams.urlField = "sgUUID";
        cbParams.fetchDataFunction = "fetchDataForgridSG";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting Security Group - ";
        cbParams.errorField = "sgName";
        deleteObject(cbParams);
    }
}

function initActions() {
    btnDeleteSG.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide');
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        var selected_rows = $("#gridSG").data("contrailGrid").getCheckedRows();
        deleteSG(selected_rows);
        confirmMainRemove.modal('hide');
    });

    btnCreateSGCancel.click(function (a) {
        windowCreateSG.hide();
    });

    btnCreateSGOK.click(function (a) {
        if($(this).hasClass('disabled-link')) {
            return;
        }
        if (validate() !== true)
            return;

        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
            gridSG.showGridMessage('errorGettingData');
            return;
        }
        var sgid = txtSGID.val().trim();
        var sgConfig = {};
        sgConfig["security-group"] = {};
        sgConfig["security-group"]["parent_type"] = "project";
        sgConfig["security-group"]["fq_name"] = [];
        sgConfig["security-group"]["fq_name"][0] = selectedDomain;
        sgConfig["security-group"]["fq_name"][1] = selectedProject;
        sgConfig["security-group"]["fq_name"][2] = txtRuleName.val();
        sgConfig["security-group"]["display_name"] = txtRuleName.val();
        sgConfig["security-group"]["name"] = txtRuleName.val();
        sgConfig["security-group"]["configured_security_group_id"] = Number(sgid);
        sgConfig["security-group"]["security_group_entries"] = {};
        sgConfig["security-group"]["security_group_entries"]["policy_rule"] = [];
        var sGRuleTuples = $("#sGRuleTuples")[0].children;
        if (sGRuleTuples && sGRuleTuples.length > 0) {
            for(i = 0 ; i< sGRuleTuples.length ; i++){
                var divid = sGRuleTuples[i].id;
                var id = getID(divid);
                var direction = $("#sGRuleTuples_"+id+"_direction").data("contrailDropdown").value();
                var protocol = $("#sGRuleTuples_"+id+"_protocol").data("contrailCombobox").value();
                if (protocol == "") {
                    protocol = "any";
                }
                if (isNumber(protocol)) {
                    protocol = String(Number(protocol));
                }
                var etherType = $("#sGRuleTuples_"+id+"_ether").data("contrailDropdown").value();
                var remoteAddr = $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown").value();
                var remotePorts = $("#sGRuleTuples_"+id+"_remotePorts").val();
                var selectedRemoteAddrType = getSelectedGroupName($("#sGRuleTuples_"+id+"_remoteAddr"));
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i] = {};
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["direction"] = ">";
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["protocol"] = protocol.toLowerCase();

                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"] = [];
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0] = {};

                if(remotePorts != ""){
                    if(remotePorts.trim() === "-1" || remotePorts.toUpperCase().trim() === "ANY"){
                        sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["start_port"] = 0;
                        sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["end_port"] = 65535;
                    } else {
                        remotePorts = remotePorts.split("-");
                        if(remotePorts != "" && remotePorts.length >= 1){
                            if((remotePorts.length == 1 && remotePorts[0].toUpperCase().trim() == "ANY") || 
                                (remotePorts.length == 2 && remotePorts[0].toUpperCase().trim() == "ANY" && remotePorts[1].toUpperCase().trim() == "ANY")) { 
                                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["start_port"] = 0;
                                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["end_port"] = 65535;
                            } else {
                                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["start_port"] = Number(remotePorts[0]);
                                if(remotePorts.length == 1){
                                    sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["end_port"] = Number(remotePorts[0]);
                                } else {
                                    sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["end_port"] = Number(remotePorts[1]);
                                }
                            }
                        }
                    }
                } else {
                    sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["start_port"] = 0;
                    sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_ports"][0]["end_port"] = 65535;
                }
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"] = [];
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_ports"] = [];
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_ports"][0] = {};
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_ports"][0]["start_port"] = 0;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_ports"][0]["end_port"] = 65535;

                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0] = {};
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["network_policy"] = null;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["virtual_network"] = null;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["subnet"] = null;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["security_group"] = null;

                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"] = [];
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0] = {};
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["network_policy"] = null;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["virtual_network"] = null;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["security_group"] = null;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["subnet"] = null;
                sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["ethertype"] = etherType;

                if(direction == "Ingress"){
                    sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["security_group"] = "local";
                    if(selectedRemoteAddrType == "SecurityGroup"){
                        if(remoteAddr.split(":").length == 3){
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["security_group"] = remoteAddr;
                        } else if(remoteAddr.split(":").length == 1){
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["security_group"] = selectedDomain + ":" + selectedProject + ":" + remoteAddr;
                        }
                    } else if(selectedRemoteAddrType == "CIDR"){
                        sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["subnet"] = {};
                        if(remoteAddr == null || remoteAddr == "" || remoteAddr == "Enter a CIDR" || remoteAddr == "0.0.0.0/0"){
                            if(etherType == "IPv4"){
                                remoteAddr = "0.0.0.0/0";
                            } else if(etherType == "IPv6"){
                                remoteAddr = "::/0";
                            }
                        }
                        var subnetAdd = remoteAddr.split("/")
                        if(subnetAdd[0] == ""){
                            if(etherType == "IPv4"){
                                subnetAdd[0] = "0.0.0.0";
                            } else if(etherType == "IPv6"){
                                subnetAdd[0] = "::";
                            }
                        }
                        sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["subnet"]["ip_prefix"] = subnetAdd[0];
                        if(subnetAdd.length == 1){
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["subnet"]["ip_prefix_len"] = 32;
                        } else if(subnetAdd.length == 2){
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["subnet"]["ip_prefix_len"] = Number(subnetAdd[1]);
                        }
                    }
                } else if(direction == "Egress"){
                    sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["src_addresses"][0]["security_group"] = "local";
                    if(selectedRemoteAddrType == "SecurityGroup"){
                        if(remoteAddr.split(":").length == 3) {
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["security_group"] = remoteAddr;
                        } else if(remoteAddr.split(":").length == 1) {
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["security_group"] = selectedDomain + ":" + selectedProject + ":" + remoteAddr;
                        }
                    } else if(selectedRemoteAddrType == "CIDR"){
                        sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["subnet"] = {};
                        if(remoteAddr == null || remoteAddr == "" || remoteAddr == "Enter a CIDR" || remoteAddr == "0.0.0.0/0") {
                            if(etherType == "IPv4"){
                                remoteAddr = "0.0.0.0/0";
                            } else if(etherType == "IPv6"){
                                remoteAddr = "::/0";
                            }
                        }
                        var subnetAdd = remoteAddr.split("/")
                        if(subnetAdd[0] == ""){
                            if(etherType == "IPv4"){
                                subnetAdd[0] = "0.0.0.0";
                            } else if(etherType == "IPv6"){
                                subnetAdd[0] = "::";
                            }
                        }
                        sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["subnet"]["ip_prefix"] = subnetAdd[0];
                        if(subnetAdd.length == 1){
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["subnet"]["ip_prefix_len"] = 32;
                        } else if(subnetAdd.length == 2){
                            sgConfig["security-group"]["security_group_entries"]["policy_rule"][i]["dst_addresses"][0]["subnet"]["ip_prefix_len"] = Number(subnetAdd[1]);
                        }
                    }
                }
            }
        }
      if (txtRuleName[0].disabled == true)
            mode = "edit";
        else
            mode = "add";
        //mode = "";
        if (mode === "add") {
            doAjaxCall("/api/tenants/config/securitygroup", "POST", JSON.stringify(sgConfig),
                "createSGSuccessCb", "createSGFailureCb");
        }
        else if (mode === "edit") {
            var sgUUID = jsonPath(configObj, "$.security-group[*][?(@.fq_name[2]=='" + txtRuleName.val() + "')]")[0].uuid;
            sgConfig["security-group"]['uuid'] = sgUUID;
            doAjaxCall("/api/tenants/config/securitygroup/" + sgUUID, "PUT", JSON.stringify(sgConfig),
                "createSGSuccessCb", "createSGFailureCb");
        }

        windowCreateSG.modal("hide");
    });
}

function setSGinAddress(e){
    var sGRuleTuples = $("#sGRuleTuples")[0].children;
    if (sGRuleTuples && sGRuleTuples.length > 0) {
        for(i = 0 ; i< sGRuleTuples.length ; i++){
            var sGRuleTuples = $("#sGRuleTuples")[0].children;
            var divid = sGRuleTuples[i].id;
            var id = getID(divid);
            addCurrentSG(id);
        }
    }
}

function addCurrentSG(id){
    var currentSG = $("#txtRuleName").val();
    if(currentSG.trim() != ""){
        var remoteAddValue = $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown").getAllData();
        var allSecurietyGroup = remoteAddValue[1].children;
        var isAvailable = false;
        var sgLen = allSecurietyGroup.length;
        for(var i=0; i < sgLen;i++){
            var tempLoopSGVal = allSecurietyGroup[i].value;
            if(tempLoopSGVal.split(":").length > 1){
                if(currentSG == tempLoopSGVal || currentSG == tempLoopSGVal.split(":")[2]) {
                    isAvailable = true;
                    break;
                }
            } else {
                allSecurietyGroup.splice(i , 1);
                sgLen--;
            }
        }
        if(isAvailable ==  false){
            allSecurietyGroup.unshift({"id":currentSG,"parent": "SecurityGroup","text":currentSG+" (Current)","value":currentSG});
            remoteAddValue[1].children = allSecurietyGroup;
            var val = $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown").value();
            var text = $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown").text();
            var selectedRemoteAddrType = getSelectedGroupName($("#sGRuleTuples_"+id+"_remoteAddr"));
            $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown").setData(remoteAddValue);
            if(val != "" && val != "Enter a CIDR"){
                $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown").value(val);
                var ra = $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown");
                verifyRASelectedItem(text,ra,"",selectedRemoteAddrType);
            }
        }
    }
}

function appendSGRuleEntry(who, defaultRow) {
    dynamicID += 1;
    var ruleEntry = createSGRuleEntry(null, dynamicID, "sGRuleTuples",window.sgData);
    if (defaultRow) {
        $("#sGRuleTuples").prepend($(ruleEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(ruleEntry, parentEl.nextSibling);
    }
    addCurrentSG(dynamicID);
    scrollUp("#windowCreateSG",ruleEntry,false);
}

function addNewItemMainDataSource(txt, data, selector, grpType) {
    var grpName = "SecurityGroup";
    if(grpType) {
        grpName = grpType;
    } else {
        grpName = getSelectedGroupName(selector);
    }
    var display = txt.split(':');
    if(grpName != "CIDR"){
        if(display.length === 3) {
            var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
            var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
            if(display[0] == selectedDomain && display[1] == selectedProject){
                display = display[2];
            } else {
                display = display[2] + ' (' + display[0] + ':' + display[1] + ')';
            }
        } else {
            display = display[0];
        }
    } else {
        display = txt;
    }

    for(var i = 0; i < data.length; i++) {
        if(data[i].text === grpName) {
            data[i].children.push({text : display, value : txt, parent : grpName});
            break;
        }
    }
}

function removeNewItemMainDataSource(txt, selector, grpType) {
    var grpName = "SecurityGroup";
    if(grpType) {
        grpName = grpType;
    } else {
        grpName = getSelectedGroupName(selector);
    }
    for(var i = 0; i < dsSrcDest.length; i++) {
        if(dsSrcDest[i].text === grpName) {
            var remItemIndex = getIndexOf(dsSrcDest[i].children, txt);
            dsSrcDest[i].children.splice(remItemIndex, 1);
            break;
        }
    }
}

function isItemExists(txt, data) {
    var isThere = false;
    for(var i = 0; i < data.length; i++) {
        for(var j = 0; j < data[i].children.length; j++) {
            if(txt === data[i].children[j].value) {
                return true;
            }
        }
    }
    return isThere;
}

function createSGRuleEntry(rule, id, element,SGData) {
    var selectDivDirection = document.createElement("div");
    selectDivDirection.className = "span2 pull-left";
    var selectDirection = document.createElement("div");
    selectDirection.setAttribute("id",element+"_"+id+"_"+"direction");
    selectDirection.className = "span12";
    selectDivDirection.appendChild(selectDirection);

    var selectDivProtocol = document.createElement("div");
    selectDivProtocol.className = "span2 pull-left";
    var selectProtocol = document.createElement("div");
    selectProtocol.className = "span12";
    selectProtocol.setAttribute("id",element+"_"+id+"_"+"protocol");
    selectProtocol.setAttribute("onchange","changePlaceHolder("+id+")");
    selectDivProtocol.appendChild(selectProtocol);

    var selectDivAction = document.createElement("div");
    selectDivAction.className = "span2 pull-left";
    var selectEther = document.createElement("div");
    selectEther.className = "span12";
    selectEther.setAttribute("id",element+"_"+id+"_"+"ether");
    selectDivAction.appendChild(selectEther);

    var selectDivRemoteAddress = document.createElement("div");
    selectDivRemoteAddress.className = "span3 pull-left";
    var remoteAddr = document.createElement("div");
    remoteAddr.className = "span12";
    remoteAddr.setAttribute("id",element+"_"+id+"_"+"remoteAddr");
    selectDivRemoteAddress.appendChild(remoteAddr);

    var inputTxtRemotePorts = document.createElement("input");
    inputTxtRemotePorts.type = "text";
    inputTxtRemotePorts.className = "span12";
    inputTxtRemotePorts.setAttribute("placeholder", "ANY");
    inputTxtRemotePorts.setAttribute("id",element+"_"+id+"_"+"remotePorts");
    var divRowFluidDestPorts = document.createElement("div");
    divRowFluidDestPorts.className = "span2";
    divRowFluidDestPorts.appendChild(inputTxtRemotePorts);

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendSGRuleEntry(this, false);");
    iBtnAddRule.setAttribute("title", "Add rule below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-right margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteRuleEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete rule");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-right margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin10 = document.createElement("div");
    divRowFluidMargin10.className = "row-fluid margin-0-0-5";
    divRowFluidMargin10.appendChild(selectDivDirection);
    divRowFluidMargin10.appendChild(selectDivAction);
    divRowFluidMargin10.appendChild(selectDivRemoteAddress);
    divRowFluidMargin10.appendChild(selectDivProtocol);
    divRowFluidMargin10.appendChild(divRowFluidDestPorts);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = element+"_"+id+"_"+"rule";
    rootDiv.className = 'rule-item';
    rootDiv.appendChild(divRowFluidMargin10);

    $(selectDirection).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        placeholder: "Ingress"
    });
    $(selectDirection).data("contrailDropdown").setData([{"text":"Ingress","value":"Ingress"},{"text":"Egress","value":"Egress"}]);

    $(selectProtocol).contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        dataSource: {},
        placeholder: "ANY",
    });
    $(selectProtocol).data("contrailCombobox").setData(
                     [{"text":"ANY","value":"any"},
                      {"text":"TCP","value":"tcp"},
                      {"text":"UDP","value":"udp"},
                      {"text":"ICMP","value":"icmp"}]);
    $(selectProtocol).data("contrailCombobox").text("ANY");
    $(selectEther).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        dataSource: {},
        placeholder: "IPV4"
    });
    $(selectEther).data("contrailDropdown").setData([{"text":"IPV4","value":"IPv4"},{"text":"IPV6","value":"IPv6"}]);
    $(selectEther).data("contrailDropdown").text("IPV4");

    var mainDS = [];
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var allSG = [];
    for (var i = 0; i < SGData.length; i++) {
        var sg = SGData[i];
        var fqname = sg["fq_name"];
        var fqNameValue = sg["fq_name"][0] + ":" + sg["fq_name"][1] + ":" + sg["fq_name"][2];
        if(fqname[0] === selectedDomain && fqname[1] === selectedProject) {
            if(sg["fq_name"][2] == $("#txtRuleName").val()){
                allSG.push({text : sg["fq_name"][2]+" (Current)", value : fqNameValue, parent : "SecurityGroup" });
            } else {
                allSG.push({text : sg["fq_name"][2], value : fqNameValue, parent : "SecurityGroup" });
            }
        }
    }
    //add other project Security Group at the end
    for(var i = 0; i < SGData.length; i++) {
        var sg = SGData[i];
        var fqname = sg["fq_name"];
        var domain = fqname[0];
        var project = fqname[1];
        if(domain !== selectedDomain || project !== selectedProject) {
            var fqNameTxt = sg["fq_name"][2] +' (' + domain + ':' + project +')';
            var fqNameValue = domain + ":" + project + ":" + sg["fq_name"][2];
            allSG.push({text : fqNameTxt, value : fqNameValue, parent : "SecurityGroup"});
        }
    }

    mainDS.push({text : 'CIDR', id :'subnet',  children : [{text:'Enter a CIDR', value:"-1/0", disabled : true, parent :"CIDR"}]},
        {text : 'SecurityGroup', id : 'SecurityGroup', children : allSG});
    dsSrcDest = mainDS;
    $(remoteAddr).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        query : select2Query,
        formatResult : select2ResultFormat,
        formatSelection : select2Format,
        minimumResultsForSearch:1,
        dropdownCssClass: 'sgSelect2',
        selectOnBlur: true
    }).on('select2-close', function() {
        loadSelect2CloseActions();
    }).on('select2-open', function() {
        loadSelect2OpenActions();
    });
    $(remoteAddr).data("contrailDropdown").setData(mainDS);
    $(remoteAddr).data("contrailDropdown").value(mainDS[0].children[0].value);
    var ra = $(remoteAddr).data("contrailDropdown");
    verifyRASelectedItem("0.0.0.0/0",ra,"","CIDR");
    if (null !== rule && typeof rule !== "undefined") {//edit
        var formatedRuleData = formatedRule(rule);
        $(selectDirection).data("contrailDropdown").value(formatedRuleData.direction);
        $(selectProtocol).data("contrailCombobox").value(formatedRuleData.protocol);
        $(selectEther).data("contrailDropdown").value(formatedRuleData.etherType);
        //if(formatedRuleData.remoteAddress == "::/0") {
        //    formatedRuleData.remoteAddress = "0.0.0.0/0";
        //}
        verifyRASelectedItem(formatedRuleData.remoteAddress,ra,"",formatedRuleData.remoteType);
        $(inputTxtRemotePorts).val(formatedRuleData.remotePort);
    }
    return rootDiv;
}

function changePlaceHolder(id){
    var protical = $("#sGRuleTuples_"+id+"_protocol").data("contrailCombobox").value();
    if(protical == "icmp"){
        $("#sGRuleTuples_"+id+"_remotePorts")[0].setAttribute("placeholder", "type ANY - code ANY");
        $("#sGRuleTuples_"+id+"_remotePorts").val("");
    } else {
        $("#sGRuleTuples_"+id+"_remotePorts")[0].setAttribute("placeholder", "ANY");
    }
}
function validatePort(id){
    var protocal = $("#sGRuleTuples_"+id+"_protocol").val();
    var remotePorts = $("#sGRuleTuples_"+id+"_remotePorts").val();
    if(remotePorts != "" && remotePorts.toUpperCase() != "ANY"){
        var ports = remotePorts.split("-");
        if(ports.length > 2){
            showInfoWindow("Invalid Port Range.", "Error");
            return false;
        }
        if(ports.length == 1 && ports[0].toUpperCase().trim() != "" && ports[0].toUpperCase().trim() != "ANY"){
            if(!isNumber(ports[0]) || !isNumber(ports[0])){
                showInfoWindow("Port can be a number or ANY.", "Error");
                return false;
            }
        }
        if(ports.length == 2 && ports[0].toUpperCase().trim() != "" && ports[0].toUpperCase().trim() != "ANY" &&
              ports[1].toUpperCase().trim() != "" && ports[1].toUpperCase().trim() != "ANY"){
            if(!isNumber(ports[0]) || !isNumber(ports[0])){
                showInfoWindow("Port can be a number or ANY.", "Error");
                return false;
            }
        }
    }
    if(protocal == "icmp"){
        if(remotePorts.toUpperCase().trim() != "ANY" && remotePorts.toLowerCase().trim() != "") {
            var rp = remotePorts.split("-");
            if((rp.length == 2 && Number(rp[1]) > 255 && Number(rp[1]) !== 65535) || 
               (rp.length == 1 && Number(rp[0]) > 255 && Number(rp[0]) !== 65535)){
                showInfoWindow("ICMP range has to be within the range 0 - 255.", "Error");
                return false;
            }
        }
    }
    return true;
}
function formatedRule(rule){
    var returnObject = {};
    returnObject.direction = getDirection(rule);
    returnObject.protocol = rule.protocol;
    if(null != rule.ethertype && "" != rule.ethertype){
        returnObject.etherType = rule.ethertype;
    } else {
        returnObject.etherType = "IPv4";
    }
    if(returnObject.direction == "Ingress") {
        if(rule.src_addresses[0].security_group === null){
            if(rule.src_addresses[0].subnet != null){
                var cidr = rule.src_addresses[0].subnet.ip_prefix + "/" + rule.src_addresses[0].subnet.ip_prefix_len;
                returnObject.remoteAddress = cidr;
                returnObject.remoteType = "CIDR";
            }
        } else {
            returnObject.remoteAddress = rule.src_addresses[0].security_group;
            returnObject.remoteType = "SecurityGroup";
        }
    } else if(returnObject.direction == "Egress"){
        if(rule.dst_addresses[0].security_group === null){
            if(rule.dst_addresses[0].subnet != null){
                var cidr = rule.dst_addresses[0].subnet.ip_prefix +"/"+rule.dst_addresses[0].subnet.ip_prefix_len;
                returnObject.remoteAddress = cidr;
                returnObject.remoteType = "CIDR";
            }
        } else {
            returnObject.remoteAddress = rule.dst_addresses[0].security_group;
            returnObject.remoteType = "SecurityGroup";
        }
    }
    returnObject.remotePort = rule.dst_ports[0].start_port+" - "+ rule.dst_ports[0].end_port;
    return returnObject;
}

function getIndexOf(arry, txt) {
    for(var i = 0; i < arry.length; i ++) {
        if(arry[i].value === txt) {
            return i;
        }
    }
    return 0;
}

function loadSelect2CloseActions() {
    //show inbuilt select2 search results for custom term
    $('.select2-results > .select2-results-dept-0.select2-result-selectable').attr('style','display:block');
    if($(".select2-search") &&  $(".select2-search").length > 0) {
        setSelectedGroupIcon("SecurityGroup");
    }
    $('.select2-results').removeAttr('style');
    $('.res-icon').remove();
}

function verifyRASelectedItem(selTxt, dropDown, e, grpType, enbleOpt) {
    if(!isItemExists(selTxt, dsSrcDest)) {
        addNewItemMainDataSource(selTxt, dsSrcDest, e, grpType);
        dropDown.setData(dsSrcDest);
        if(enbleOpt != undefined) {
            dropDown.enableOptionList(enbleOpt,["any","local"]);
        }
        dropDown.value(selTxt);
        removeNewItemMainDataSource(selTxt, e, grpType);
    } else {
        if(enbleOpt != undefined) {
            dropDown.enableOptionList(enbleOpt,["any","local"]);
        }
        dropDown.value(selTxt);
    }
}

function loadSelect2OpenActions() {
    var subEleArry = $(".select2-result-sub");
    if(subEleArry && subEleArry.length > 0) {
        $(subEleArry[0]).addClass('hide');
        $(subEleArry[2]).addClass('hide');
    }
    // $('.select2-results').attr('style','max-height:400px;');
    $('.res-icon').remove();
    $(".select2-search").prepend('<i class="'+ iconSubnet +' res-icon"> </i>')
}

function addNewTermDataSource(grpName, term, data) {
    var newItem = {id : term, text : term, parent : grpName};
    for(var i = 0; i < data.length ; i++) {
        if(data[i].text === grpName &&  data[i].children.length === 1) {
            data[i].children.push(newItem);
            break;
        }
    }
}

function setFocusSelectedItem(grpName, term, data) {
    for(var i = 0; i < data.length ; i++) {
        if(data[i].text === grpName &&  data[i].children.length === 2) {
            $($('div:contains('+ term +')').parent()).addClass('select2-highlighted');
            break;
        }
    }
}

function select2Query(query) {
    //using predefined process method to make work select2 selection
    var t = query.term,filtered = { results: [] }, process;
    

    var data = {results: []};
    var grpName = getSelectedGroupName();
    if(query.term != undefined) {
        data.results.push({ id : query.term, text : query.term, parent : grpName});
        this.data = [];
        var filteredResults = [];
        for(var i = 0; i < dsSrcDest.length;i++) {
            var children = dsSrcDest[i]['children'];
            filteredResults[i] = {
                text: dsSrcDest[i]['text'],
                children: []
            };
            for(var j = 0; j < children.length; j++) {
                if(children[j].text.indexOf(query.term) != -1 || children[j].disabled == true) {
                    filteredResults[i].children.push(dsSrcDest[i].children[j]);
                }
            }
            data.results.push(filteredResults[i]);
        }
        if(query.term != '') {
            addNewTermDataSource(grpName, query.term, data.results);
        }
        var pageSize = 200;
        for(var i=1 ; i < data.results.length ; i++){
            var more = false;
            if (data.results[i]['children'].length >= query.page*pageSize) {
                more = true;
            }
            data.results[i]['children'] = data.results[i]['children'].slice((query.page-1) * pageSize, query.page * pageSize);
            if (more) {
                data.results[i]['children'].push({id:"search" + i, text:"Search to find more entries", disabled : true})
            }
        }
    } else{
        process = function(datum, collection) {
            var group, attr;
            datum = datum[0];
            if (datum.children) {
                group = {};
                for (attr in datum) {
                    if (datum.hasOwnProperty(attr)) group[attr]=datum[attr];
                }
                group.children=[];
                $(datum.children).each2(function(i, childDatum) { process(childDatum, group.children); });
                if (group.children.length || query.matcher(t, '', datum)) {
                    collection.push(group);
                }
            } else {
                if (query.matcher(t, '', datum)) {
                    collection.push(datum);
                }
            }
        };
        if(t != ""){
            $(dsSrcDest).each2(function(i, datum) { process(datum, filtered.results); })
        }
        data.results = dsSrcDest;
    }
    query.callback(data);
    //set focus for a searched item
    setFocusSelectedItem(grpName, query.term, data.results);

    //hide inbuilt select2 search results for custom term
    $('.select2-results > .select2-results-dept-0.select2-result-selectable').attr('style','display:none');

    // var subEleArry = $(".select2-result-sub");
    // if(subEleArry && subEleArry.length > 0) {
    //     $(subEleArry[0]).attr('style','max-height:150px;overflow:auto;');
    //     $(subEleArry[1]).attr('style','max-height:150px;overflow:auto;');
    //     $(subEleArry[2]).attr('style','max-height:150px;overflow:auto;');
    // }
    retainExpandedGroup();


    if($(".select2-result-label") && $(".select2-result-label").length > 0) {
        //set background color for groups
        for(var i = 0; i < $(".select2-result-label").length; i++) {
            if($($('.select2-result-label')[i]).find('i') && $($('.select2-result-label')[i]).find('i').length > 0) {
                $($('.select2-result-label')[i]).attr('style','background-color:#E2E2E2;margin-top:2px;')
                $($('.select2-result-label')[i]).attr('style','background-color:#E2E2E2;margin-top:2px;')
            }
        }
        $(".select2-result-label").on('click', function() {
            if($(this).parent().hasClass('select2-disabled')) {
                return;
            }
            $('.select2-result-sub').addClass('hide');
            $(this).parent().find('.select2-result-sub').removeClass('hide');

            $(".res-icon").remove();
            setSelectedGroupIcon(this.textContent.trim());
        });
    }
    if($(".select2-search") &&  $(".select2-search").length > 0) {
        var grpName = getSelectedGroupName();
        setSelectedGroupIcon(grpName);
    }
}

function retainExpandedGroup() {
    var subEleArry = $(".select2-result-sub");
    if(subEleArry && subEleArry.length > 0) {
        subEleArry.addClass('hide');
        var grpName = getSelectedGroupName();
        var subEle = $(subEleArry[1]);
        switch(grpName) {
            case 'SecurityGroup' :
                subEle = $(subEleArry[1]);
                break;
            case 'CIDR' :
               subEle = $(subEleArry[0]);
               break;
        }
        subEle.removeClass('hide');
    }
}

function getSelectedGroupName(selector) {
    var grpName = 'CIDR';
    var element = ""//selector ? selector : $(".res-icon");
    if(selector != undefined  && selector != ""){
        var divAll = $("body").find("div[id*='"+$(selector)[0].id+"']");
        for(var i = 0;i < divAll.length; i++){
            if($(divAll[i]).find("."+iconSG).length > 0) {
                grpName = 'SecurityGroup';
                return grpName;
            } else if($(divAll[i]).find("."+iconSubnet).length) {
                grpName = "CIDR";
                return grpName;
            }
        }
    } else {
        element = $(".res-icon");
        if(element.hasClass(iconSG)) {
            grpName = 'SecurityGroup';
        } else if(element.hasClass(iconSubnet)) {
            grpName = "CIDR";
        }
    }
    return grpName;
}

function setSelectedGroupIcon(grpName) {
    var currentIcon = iconSubnet;
    switch(grpName) {
        case 'SecurityGroup' :
            currentIcon = iconSG;
            break;
        case 'CIDR' :
            currentIcon = iconSubnet;
            break;
    }
    $(".res-icon").remove();
    $(".select2-search").prepend('<i class="'+ currentIcon +' res-icon"> </i>');
}

function select2Format(state) {
    var originalOption = state.element;
    var fomattedTxt = state.text;
    if(state.parent != undefined){
        fomattedTxt = choiceSelection(state);
    }
    return "<div style='text-overflow:ellipsis;overflow:hidden;' title ='" + state.text + "'>" + fomattedTxt + "</div>";
}

function select2ResultFormat(state) {
    var originalOption = state.element;
    var fomattedTxt = state.text;
    if(state.id == undefined){
        fomattedTxt = choiceSelection(state);
    }
    return fomattedTxt;
}

function choiceSelection(state) {
    var fomattedTxt;
    var txt = state.parent != undefined ? state.parent : state.text
    switch(txt) {
        case 'SecurityGroup' :
            fomattedTxt = '<i class="' + iconSG + '"></i>' + ' ' + state.text;
            break;
        case 'CIDR' :
            fomattedTxt = '<i class="' + iconSubnet + '"></i>' + ' ' + state.text;
            break;
    }
    return fomattedTxt;
}

function deleteRuleEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
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
        fetchProjects("populateProjects", "failureHandlerForgridSG");
    } else {
        $("#gridSG").data("contrailGrid")._dataView.setData([]);
        btnCreateSG.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridSG.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');
    }
}

function handleDomains(e) {
    //fetchDataForgridSG();
    var dName = e.added.text;
    setCookie("domain", dName);
    fetchProjects("populateProjects", "failureHandlerForgridSG");
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
        btnCreateSG.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForgridSG();
    } else {
        $("#gridSG").data("contrailGrid")._dataView.setData([]);
        btnCreateSG.addClass('disabled-link');
        var emptyObj = [{text:'No Projects found',value:"Message"}];
        $("#ddProjectSwitcher").data("contrailDropdown").setData(emptyObj);
        $("#ddProjectSwitcher").data("contrailDropdown").text(emptyObj[0].text);
        $("#ddProjectSwitcher").data("contrailDropdown").enable(false);
        gridSG.showGridMessage("empty");
        emptyCookie('project');
    }
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForgridSG();
}

function fetchDataForgridSG() {
    $("#cb_gridSG").attr("checked", false);
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridSG.showGridMessage('errorGettingData');
        return;
    }

    $("#gridSG").data("contrailGrid")._dataView.setData([]);
    idCount = 0;
    polAjaxcount++;
    configObj["security-group"] = [];
    gridSG.showGridMessage('loading');
    var proid = $("#ddProjectSwitcher").data("contrailDropdown").value();
    ajaxParam = proid + "_" + polAjaxcount;
    doAjaxCall("/api/admin/config/get-data?type=security-group&count=4&fqnUUID="+proid,
        "GET", null, "successHandlerForgridSG", "failureHandlerForgridSGRow", null, ajaxParam);
}

function successHandlerForgridSG(result , cbparam) {
    if(cbparam != ajaxParam){
        return;
    }
    if(result.more == true || result.more == "true"){
        doAjaxCall("/api/admin/config/get-data?type=security-group&count=4&&fqnUUID="+
            $("#ddProjectSwitcher").data("contrailDropdown").value() +"&lastKey="+result.lastKey,
            "GET", null, "successHandlerForgridSG", "failureHandlerForgridSGRow", null, cbparam);
    }
    successHandlerForgridSGRow(result);
}

function failureHandlerForgridSG(result) {
    $("#btnCreateSG").addClass('disabled-link');
    gridSG.showGridMessage('errorGettingData');
}

function successHandlerForgridSGRow(result) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var SGData = $("#gridSG").data("contrailGrid")._dataView.getItems();
    var SG = result.data;
    if(SG != undefined){
    for (var i = 0; i < SG.length; i++) {
        var eachSG = SG[i]["security-group"];
        var sgName = eachSG.fq_name[2];
        var sgDisplayName = eachSG.display_name;
        var sgID = eachSG.configured_security_group_id;
        var sgIDText = "";
        if (sgID == null || typeof sgID === "undefined") {
            sgID = "";
        } 
        sgIDText = sgID;
        if (sgIDText == "") {
            sgIDText =  "Auto Configured ";
            if(typeof eachSG.security_group_id != "undefined" && typeof eachSG.security_group_id != "undefined"){
                sgIDText +=  "("+ eachSG.security_group_id+")";
            }
        }
        var sgUUID = eachSG.uuid;
        var sgRule = [];
        if(eachSG.security_group_entries){
            var sgPolicyRule = eachSG.security_group_entries.policy_rule;
            for (var inc = 0; inc < sgPolicyRule.length ; inc++){
                sgRule[inc] = formatSGPolicyRule(sgPolicyRule[inc]);
            }
        }
        configObj["security-group"].push(SG[i]);
        SGData.push({"id":idCount++, "sgName":sgName,"sgDisplayName":sgDisplayName, "sgRules":sgRule, "sgUUID":sgUUID, "sgID":sgID, "sgIDText":sgIDText});
    }
    }
    $("#gridSG").data("contrailGrid")._dataView.setData(SGData);
    if(result.more == true || result.more == "true"){
        gridSG.showGridMessage('loading');
    } else {
        if(!SGData || SGData.length<=0)
            gridSG.showGridMessage('empty');
    }
}

function sgRuleFormat(text) {
    return '<span class="rule-format">' + text  + '</span>';
}

function getDirection(rule){
    if(rule.dst_addresses[0].security_group != null && rule.dst_addresses[0].security_group == "local"){
        return ("Ingress");
    }
    if(rule.src_addresses[0].security_group != null && rule.src_addresses[0].security_group == "local"){
        return ("Egress");
    }
    return ("");
}

function formatSGPolicyRule(rule){
    var direction = getDirection(rule);
    var protocal = sgRuleFormat(rule.protocol);
    if(rule.ethertype == undefined){
        rule.ethertype = "IPv4";
    }
    var etherType = sgRuleFormat(rule.ethertype);
    var remoteAddr = "";
    var remotePort = "";
    remotePort = formateSGRule_port(rule.dst_ports[0],rule.protocol);
    
    var returnString = "-";
    if(direction == "Ingress"){
        if(rule.src_addresses[0].security_group != "local" && rule.src_addresses[0].security_group != null){
            remoteAddr = formateSGRule_SGText(rule.src_addresses[0].security_group);
        }  else if(rule.src_addresses[0].subnet !== null) {
            remoteAddr = " network " + sgRuleFormat(rule.src_addresses[0].subnet.ip_prefix + "/" +rule.src_addresses[0].subnet.ip_prefix_len);
        }
        direction = "ingress";
    } else if(direction == "Egress"){
        if(rule.dst_addresses[0].security_group != "local" && rule.dst_addresses[0].security_group != null){
            remoteAddr = formateSGRule_SGText(rule.dst_addresses[0].security_group);
        }  else if(rule.dst_addresses[0].subnet !== null) {
            remoteAddr = " network " + sgRuleFormat(rule.dst_addresses[0].subnet.ip_prefix + "/" +rule.dst_addresses[0].subnet.ip_prefix_len);
        }
        direction = "egress";
    }
    direction = sgRuleFormat(direction);
    returnString = direction + " " +etherType + " " +remoteAddr + " protocol " + protocal +  " ports " + remotePort;
    return returnString;
}

function formateSGRule_port(port,protocal){
    var returnPortString = "";
    var sp = port.start_port;
    var ep = port.end_port;
    if(sp === ep) {
        returnPortString = sgRuleFormat("["+ sp + "]");
    } else {
        if((Number(sp) == 0 && Number(ep) == 65535) || 
            (Number(sp) == 0 && Number(ep) == 255) ||
            (Number(sp) == -1 && Number(ep) == -1)){
                if(protocal == "icmp"){
                    returnPortString = " type " + sgRuleFormat("any") + " code " + sgRuleFormat("any");
                } else {
                    returnPortString = sgRuleFormat("any");
                }
        } else {
        
            if(protocal == "icmp"){
                returnPortString = " type " + sgRuleFormat(sp) + " code " + sgRuleFormat(ep);
            } else {
                returnPortString = sgRuleFormat("["+ sp + " - "+ ep +"]");
            }
        }
    }
    return returnPortString;
}

function formateSGRule_SGText(sg){
    var sgArray = sg.split(":");
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var returnString = "";
    if(sgArray[0] == selectedDomain && sgArray[1] == selectedProject) {
        returnString = " security group " + sgRuleFormat(sgArray[2]) + " ";
    } else  {
        returnString = " security group " + sgRuleFormat(sgArray[2]) +" ("+ sgArray[0] +":"+ sgArray[1] + ") ";
    }
    return returnString;
}


function failureHandlerForgridSGRow(result, cbParam) {
    showInfoWindow("Error in getting Security Group data.", "Error");
    gridSG.showGridMessage('errorGettingData');
}

function showRemoveWindow(rowIndex) {
$.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Security Group delete</h6>',
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
               var selected_row = $("#gridSG").data("contrailGrid")._dataView.getItem(rowNum);
               deleteSG([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
}

function closeCreateSGWindow() {
    clearValuesFromDomElements();
}

function clearValuesFromDomElements() {
    mode = "";
    txtRuleName.val("");
    $("#is_auto")[0].checked = true;
    txtSGID.addClass("hide")
    txtSGID.val("");
    txtRuleName[0].disabled = false;
    clearRuleEntries();
}

function clearRuleEntries() {
    var tuples = $("#sGRuleTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#sGRuleTuples").empty();
    }
}

function showsgEditWindow(mode, rowIndex) {
    if($("#btnCreateSG").hasClass('disabled-link')) {
        return;
    }
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    txtSGID.addClass("hide")
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridSG.showGridMessage('errorGettingData');
        return;
    }
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
    url:"/api/tenants/config/securitygroup",
    type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            clearValuesFromDomElements();
            var results = arguments;
            window.sgData = [];
            window.sgData = results[0]["security-groups"];
            if (mode === "add") {
                windowCreateSG.find('.modal-header-title').text('Create Security Group');
                $(txtRuleName).focus();
                var rule = JSON.parse('{"direction":">","protocol":"any","dst_addresses":[{"security_group":null,"subnet":{"ip_prefix":"0.0.0.0","ip_prefix_len":0}}],"dst_ports":[{"end_port":65535,"start_port":0}],"src_addresses":[{"security_group":"local","subnet":null}],"src_ports":[{"end_port":65535,"start_port":0}],"ethertype":"IPv4"}');
                var ruleEntry = createSGRuleEntry(rule, dynamicID,"sGRuleTuples",sgData);
                $("#sGRuleTuples").append(ruleEntry);
                rule = JSON.parse('{"direction":">","protocol":"any","dst_addresses":[{"security_group":null,"subnet":{"ip_prefix":"::","ip_prefix_len":0}}],"dst_ports":[{"end_port":65535,"start_port":0}],"src_addresses":[{"security_group":"local","subnet":null}],"src_ports":[{"end_port":65535,"start_port":0}],"ethertype":"IPv6"}');
                ruleEntry = "";
                dynamicID++;
                ruleEntry = createSGRuleEntry(rule, dynamicID,"sGRuleTuples",sgData);
                $("#sGRuleTuples").append(ruleEntry);
            } else if (mode === "edit") {
                var selectedRow = $("#gridSG").data("contrailGrid")._dataView.getItem(rowIndex);
                windowCreateSG.find('.modal-header-title').text('Edit Security Group ' + selectedRow.sgName);
                txtRuleName.val(selectedRow.sgName);
                txtRuleName[0].disabled = true;
                txtSGID.val(selectedRow.sgID);
                if(selectedRow.sgID != "") {
                    $("#is_auto")[0].checked = false;
                    txtSGID.removeClass("hide");
                }
                var rowId = selectedRow["id"];
                var selectedSG = configObj["security-group"][rowId];
                if (selectedSG["security-group"] && selectedSG["security-group"]["security_group_entries"]) {
                    var ruleEntries = selectedSG["security-group"]["security_group_entries"]["policy_rule"];
                    for (var j = 0; j < ruleEntries.length; j++) {
                        var rule = ruleEntries[j];
                        dynamicID += 1;
                        var ruleEntry = createSGRuleEntry(rule, dynamicID,"sGRuleTuples",sgData);
                        $("#sGRuleTuples").append(ruleEntry);
                    }
                }
            }
            addCurrentSG(dynamicID);
        },
        function () {
            //If atleast one api fails
            var results = arguments;
        });
    windowCreateSG.modal("show");
    windowCreateSG.find('.modal-body').scrollTop(0);
}

function createSGSuccessCb() {
    gridSG.showGridMessage('loading');
    fetchDataForgridSG();
}

function createSGFailureCb() {
    gridSG.showGridMessage('loading');
    fetchDataForgridSG();
}

function validate() {
    var SGName = txtRuleName.val().trim();
    if (typeof SGName === "undefined" || SGName === "") {
        showInfoWindow("Enter a valid Security Group name", "Input required");
        return false;
    }
    
    if($("#is_auto")[0].checked == false){
        var SGID = txtSGID.val();
        if (typeof SGID === "undefined" || SGID.trim() === "") {
            showInfoWindow("Enter Security Group Id.", "Invalid Input");
            return false
        }
        SGID = SGID.trim();
        if(!isNumber(SGID)){
            showInfoWindow("Security Group Id has to be a number.", "Invalid Input");
            return false
        }
        if(Number(SGID) < 1 || Number(SGID) > 7999999) {
            showInfoWindow("Security Group Id has to be between 1 to 7999999.", "Invalid Input");
            return false
        }
    }
    var ruleTuples = $("#sGRuleTuples")[0].children;
    if (ruleTuples && ruleTuples.length > 0) {
        for (var i = 0; i < ruleTuples.length; i++) {
            var divid = $(ruleTuples[i])[0].id;
            var id = getID(divid);
            if(id !== -1){
                if (validatePort(id) == false)
                    return false;

                var remoteAddr = $("#sGRuleTuples_"+id+"_remoteAddr").data("contrailDropdown").value();
                var selectedRemoteAddrType = getSelectedGroupName($("#sGRuleTuples_"+id+"_remoteAddr"));
                if(selectedRemoteAddrType == "SecurityGroup"){
                    if ("" === remoteAddr.trim()) {
                        showInfoWindow("Enter a valid remote Security Group", "Invalid input");
                        return false;
                    }
                    if(isSet(remoteAddr) && isString(remoteAddr) && remoteAddr.indexOf(":") !== -1 && remoteAddr.split(":").length !== 3) {
                        showInfoWindow("Fully Qualified Name of remote Security Group should be in the format Domain:Project:SecurityGroup.", "Invalid FQN");
                        return false;
                    }
                } else if (selectedRemoteAddrType == "CIDR") {
                    if ("" != remoteAddr.trim() && "Enter a CIDR" != remoteAddr.trim()) {
                        if(!isValidIP(remoteAddr.trim())) {
                            showInfoWindow("Enter a valid CIDR", "Invalid CIDR");
                            return false;
                        }
                        var etherType = $("#sGRuleTuples_"+id+"_ether").data("contrailDropdown").value();
                        if (etherType == "IPv4"){
                            if(!isIPv4(remoteAddr.trim())){
                                showInfoWindow("Enter a valid IPv4 Address", "Invalid CIDR");
                                return false;
                            }
                        }
                        if (etherType == "IPv6" && remoteAddr.trim() != "0.0.0.0/0") {
                            if(!(isIPv6(remoteAddr.trim()))){
                                showInfoWindow("Enter a valid IPv6 Address", "Invalid CIDR");
                                return false;
                            }
                        }
                    }
                }
                var protocolCombobox = $("#sGRuleTuples_"+id+"_protocol").data("contrailCombobox");
                var protocolComboboxValue = protocolCombobox.value();
                if (protocolComboboxValue !== "") {
                    var allProtocol = jsonPath(protocolCombobox.getAllData(), "$..text");
                    if (allProtocol.indexOf(protocolComboboxValue.toUpperCase()) < 0) {
                        if (!isNumber(protocolComboboxValue)) {
                            showInfoWindow("Allowed values are 'any', 'icmp', 'tcp', 'udp' or 0 - 255.", "Invalid Protocol");
                            return false;
                        }
                        protocolComboboxValue = Number(protocolComboboxValue);
                        if (protocolComboboxValue % 1 != 0 ||  protocolComboboxValue < 0 || protocolComboboxValue > 255) {
                            showInfoWindow("Allowed values are 'any', 'icmp', 'tcp', 'udp' or 0 - 255.", "Invalid Protocol");
                            return false
                        }
                    }
                }
            }
        }
    }
    return true;
}

function enableSGID(e){
    txtSGID.val("");
    if (e.checked == true){
        txtSGID.addClass("hide")
    } else {
        txtSGID.removeClass("hide")
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

    gridSG = $("#gridSG").data("contrailGrid");
    if(isSet(gridSG)) {
        gridSG.destroy();
        $("#gridSG").empty();
        gridSG = $();
    }

    btnCreateSG = $("#btnCreateSG");
    if(isSet(btnCreateSG)) {
        btnCreateSG.remove();
        btnCreateSG = $();
    }

    btnDeleteSG = $("#btnDeleteSG");
    if(isSet(btnDeleteSG)) {
        btnDeleteSG.remove();
        btnDeleteSG = $();
    }

    btnCreateSGCancel = $("#btnCreateSGCancel");
    if(isSet(btnCreateSGCancel)) {
        btnCreateSGCancel.remove();
        btnCreateSGCancel = $();
    }

    btnCreateSGOK = $("#btnCreateSGOK");
    if(isSet(btnCreateSGOK)) {
        btnCreateSGOK.remove();
        btnCreateSGOK = $();
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

    var btnCommonAddSGRule = $("#btnCommonAddSGRule");
    if(isSet()) {
        btnCommonAddSGRule.remove();
        btnCommonAddSGRule = $();
    }

    txtRuleName = $("#txtRuleName");
    if(isSet(txtRuleName)) {
        txtRuleName.remove();
        txtRuleName = $();
    }
    
    txtSGID = $("#txtSGID");
    if(isSet(txtSGID)) {
        txtSGID.remove();
        txtSGID = $();
    }

    var gridSGDetailTemplate = $("#gridSGDetailTemplate");
    if(isSet(gridSGDetailTemplate)) {
        gridSGDetailTemplate.remove();
        gridSGDetailTemplate = $();
    }

    var myModalLabel = $("#myModalLabel");
    if(isSet(myModalLabel)) {
        myModalLabel.remove();
        myModalLabel = $();
    }

    var sGRuleTuples = $("#sGRuleTuples");
    if(isSet(sGRuleTuples)) {
        sGRuleTuples.remove();
        sGRuleTuples = $();
    }

    windowCreateSG = $("#windowCreateSG");
    if(isSet(windowCreateSG)) {
        windowCreateSG.remove();
        windowCreateSG = $();
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

    var sgConfigTemplate = $("#sg-config-template");
    if(isSet(sgConfigTemplate)) {
        sgConfigTemplate.remove();
        sgConfigTemplate = $();
    }
    window.globalSubArry = [];
    window.ruleId = '';
}
