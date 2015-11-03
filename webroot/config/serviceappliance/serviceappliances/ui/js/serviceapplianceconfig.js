/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
 
serviceApplianceConfigObj = new ServiceApplianceConfig();
function ServiceApplianceConfig() {
    //Variable Definations

    //Grids
    var gridSap;

    //Datasources
    var dsGridSap;

    //Textboxes
    var txtSapName, txtSapIPAddress, txtSapUserName, txtSapPassword;
    
    //Buttons
    var btnCreateSap, btnDeleteSap, btnCreateSapCancel, btnCreateSapOK,
        btnRemovePopupOK, btnRemovePopupCancel, btnCnfRemoveMainPopupOK, 
        btnCnfRemoveMainPopupCancel;

    var windowCreateSap, confirmRemove, confirmMainRemove;

    //Dropdowns
    var ddSapSet;

    //Multiselects
    //var msPhysicalInterfaces;

    //Combobox
    //var cmbSapInterface;

    //Misc
    var dsAjaxcount = 0;
    var idCount = 0;
    var dynamicID = 0;
    var mode = "";

    //Method Definations 
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForGridSap = fetchDataForGridSap;
    this.handleSapSet = handleSapSet;
    this.deleteSap = deleteSap;
    this.showSapEditWindow = showSapEditWindow;
    this.closeCreateSapWindow = closeCreateSapWindow;
    this.successHandlerForGridSapRow = successHandlerForGridSapRow;
    this.failureHandlerForGridSapRow = failureHandlerForGridSapRow;
    this.createSapSuccessCb = createSapSuccessCb;
    this.createSapFailureCb = createSapFailureCb;
    this.validate = validate;
    this.dynamicID = dynamicID;
    this.idCount = idCount;
    this.destroy = destroy; 
}

function load() {
    var configTemplate = Handlebars.compile($("#sap-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_infra_sap';
    init();
}
  
function init() {
    initComponents();
    initActions();
    fetchData();
}
    
function initComponents() {
    //initializing the service applicance grid

    $("#gridSap").contrailGrid({
        header : {
            title: {
                text : 'Service Appliances',
            },
            customControls: ['<a id="btnDeleteSap" class="disabled-link" title="Delete Service Appliance(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateSap" title="Create Service Appliance"><i class="icon-plus"></i></a>',
                'Service Appliance Set: <div id="ddSapSet"/>']
        }, 
        columnHeader : {
            columns : [
            {
                id : 'service_appliance_name',
                field : 'service_appliance_name',
                name : 'Name'
            },
            {
                id : 'service_appliance_ip_address',
                field : 'service_appliance_ip_address',
                name : 'IP Address'
            },
            /*{
                id : 'service_appliance_interface',
                field : 'service_appliance_interface',
                name : 'Interface'
            }*/
            ]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteSap').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteSap').removeClass('disabled-link');
                    }
                },                
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showSapEditWindow("edit", rowIndex);
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
                detail : {
                    template : $("#gridSapDetailTemplate").html()
                }    
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Service Appliances...'
                },
                empty: {
                    text: 'No Service Appliances.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Service Appliances.'
                }
            }
        }
    });      
    gridSap = $("#gridSap").data('contrailGrid');
    gridSap.showGridMessage("loading");
    btnCreateSap = $("#btnCreateSap");
    btnDeleteSap = $("#btnDeleteSap");
    btnCreateSapCancel = $("#btnCreateSapCancel");
    btnCreateSapOK = $("#btnCreateSapOK");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");

    txtSapName = $("#txtSapName");
    txtSapIPAddress = $("#txtSapIPAddress");
    txtSapUserName = $("#txtSapUserName");
    txtSapPassword = $("#txtSapPassword");

    /*msPhysicalInterfaces = $("#msPhysicalInterfaces").contrailMultiselect({
        placeholder: "Select Physical Intefaces...",
        dataTextField:"text",
        dataValueField:"value",
        dropdownCssClass: 'select2-medium-width'
    });*/

    ddSapSet = $("#ddSapSet").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change: handleSapSet
    });
    /*cmbSapInterface = $("#cmbSapInterface");
    var interfaceVal = [
        {text:"left", value:"left"},
        {text:"right", value:"right"},
        {text:"management", value:"management"},
        {text:"other", value:"other"}
    ];
    cmbSapInterface = $("#cmbSapInterface").contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        placeholder:"Enter or Select an interface"
    });
    $("#cmbSapInterface").data("contrailCombobox").setData(interfaceVal);
    $("#cmbSapInterface").data("contrailCombobox").value(interfaceVal[0].value);
    $("#cmbSapInterface").data("contrailCombobox").text(interfaceVal[0].text);*/

    dsAjaxcount = 0;
    dynamicID = 0;
    windowCreateSap = $("#windowCreateSap");
    windowCreateSap.on("hide", closeCreateSapWindow);
    windowCreateSap.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function deleteSap(selected_rows) {
    btnDeleteSap.attr("disabled","disabled");
    var deleteAjaxs = [];
    if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/service-appliance/";
        cbParams.urlField = "uuid";
        cbParams.fetchDataFunction = "fetchDataForGridSap";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting service appliances - ";
        cbParams.errorField = "service_appliance_name";
        deleteObject(cbParams);
    }
}

function initActions() {
    btnDeleteSap.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide')
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        var selected_rows = $("#gridSap").data("contrailGrid").getCheckedRows();
        deleteSap(selected_rows);
        confirmMainRemove.modal('hide');
    });

    btnCreateSapCancel.click(function (a) {
        windowCreateSap.hide();
    });

    btnCreateSap.click(function (a) {
        mode = "add";
        showSapEditWindow(mode);
    });

    btnCreateSapOK.click(function (a) {
        if($(this).hasClass('disabled-link')) { 
            return;
        }    
        if (validate() !== true)
            return;

        if (txtSapName[0].disabled == true)
            mode = "edit";
        else
            mode = "add";

        var selectedSapSet = $("#ddSapSet").data("contrailDropdown").text();
        var sapConfig = {};
        sapConfig["service-appliance"] = {};
        sapConfig["service-appliance"]["parent_type"] = "service-appliance-set";

        sapConfig["service-appliance"]["fq_name"] = [];
        sapConfig["service-appliance"]["fq_name"][0] = "default-global-system-config";
        sapConfig["service-appliance"]["fq_name"][1] = selectedSapSet;
        sapConfig["service-appliance"]["fq_name"][2] = txtSapName.val();
        sapConfig["service-appliance"]["display_name"] = txtSapName.val();
        sapConfig["service-appliance"]["name"] = txtSapName.val();

        sapConfig["service-appliance"]["service_appliance_ip_address"] = 
            txtSapIPAddress.val();

        /*var interfaceVal = $("#cmbSapInterface").data("contrailCombobox").value();
        if(null !== interfaceVal && typeof interfaceVal == "string" &&
            "" !== interfaceVal.trim())
            sapConfig["service-appliance"]["service_appliance_interface"] =
                interfaceVal.trim();*/

        var userName = txtSapUserName.val();
        var password = txtSapPassword.val();
        if((null !== userName && typeof userName === "string" &&
            userName.trim() !== "") || (null !== password &&
            typeof password === "string" && password.trim() !== "")) {
            sapConfig["service-appliance"]["service_appliance_user_credentials"] = {};

            if(null !== userName && typeof userName == "string" &&
                "" !== userName.trim())
                sapConfig["service-appliance"]["service_appliance_user_credentials"]["username"] =
                    userName.trim();
            else {
                if(mode === "edit")
                    sapConfig["service-appliance"]["service_appliance_user_credentials"]["username"] = null;
            }
            if(null !== password && typeof password == "string" &&
                "" !== password.trim())
                sapConfig["service-appliance"]["service_appliance_user_credentials"]["password"] =
                    password.trim();
            else {
                if(mode === "edit")
                    sapConfig["service-appliance"]["service_appliance_user_credentials"]["password"] = null;
            }
       } else {
           if(mode === "edit")
               sapConfig["service-appliance"]["service_appliance_user_credentials"] = null;
       }

        var len = $("#sapPropTuples").children().length;
        if(len > 0) {
            sapConfig["service-appliance"]["service_appliance_properties"] = {};
            sapConfig["service-appliance"]["service_appliance_properties"]["key_value_pair"] = [];
            for(var i=0; i<len; i++) {
                sapConfig["service-appliance"]["service_appliance_properties"]["key_value_pair"][i] = {};
                var key =
                    $($($($("#sapPropTuples").children()[i]).find(".span5")).find("input")[0]).val().trim();
                var value =
                    $($($($("#sapPropTuples").children()[i]).find(".span5")).find("input")[1]).val().trim();

                if (typeof key === "string" && key.trim() !== "") {
                    sapConfig["service-appliance"]["service_appliance_properties"]["key_value_pair"][i] = 
                    {
                        "key": key,
                        "value": value
                    };
                }
            }
        } else {
            if(mode == "edit")
                sapConfig["service-appliance"]["service_appliance_properties"] = null;
        }

        /*var physicalIfs = $("#msPhysicalInterfaces").data("contrailMultiselect").getSelectedData();
        if (physicalIfs && physicalIfs.length > 0) {
            sapConfig["service-appliance"]["physical_interface_refs"] = [];
            for (var i = 0; i < physicalIfs.length; i++) {
                var tmpPhysicalIf = (physicalIfs[i].fq_name).split(":");
                if(tmpPhysicalIf.length === 3) {
                    sapConfig["service-appliance"]["physical_interface_refs"][i] = {};
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["uuid"] = physicalIfs[i].value;
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["to"] = [];
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["to"][0] = tmpPhysicalIf[0];
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["to"][1] = tmpPhysicalIf[1];
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["to"][2] = tmpPhysicalIf[2];
                    //sapConfig["service-appliance"]["physical_interface_refs"][i]["attr"] = null;
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["attr"] = {};
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["attr"]["fq_name"] = [];
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["attr"]["fq_name"][0] = tmpPhysicalIf[0];
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["attr"]["fq_name"][1] = tmpPhysicalIf[1];
                    sapConfig["service-appliance"]["physical_interface_refs"][i]["attr"]["fq_name"][2] = tmpPhysicalIf[2];
                }
            }
        }*/
        if (mode === "add") {
            doAjaxCall("/api/tenants/config/service-appliances", "POST", JSON.stringify(sapConfig),
                "createSapSuccessCb", "createSapFailureCb");
        }
        else if (mode === "edit") {
            //tbd add fq_name[1] 
            var selectedSapSet = $("#ddSapSet").data("contrailDropdown").text();
            var sapUUID = jsonPath(configObj, "$.service-appliances[?(@.fq_name[1]=='" + selectedSapSet + 
                "' && @.fq_name[2]=='" + txtSapName.val() + "')]")[0].uuid;
            sapConfig["service-appliance"]["uuid"] = sapUUID;
            doAjaxCall("/api/tenants/config/service-appliance/" + sapUUID, "PUT", JSON.stringify(sapConfig),
                "createSapSuccessCb", "createSapFailureCb");
        }
        windowCreateSap.modal("hide");
    });
}
    

function appendSapPropEntry(who, defaultRow) {
    if(validateSapPropEntry() === false)
        return false;

    var sapPropEntry = createSapPropEntry(null, $("#sapPropTuples").children().length);
    if (defaultRow) {
        $("#sapPropTuples").prepend($(sapPropEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(sapPropEntry, parentEl.nextSibling);
    }
}

function validateSapPropEntry() {
    var len = $("#sapPropTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var key =
                $($($($("#sapPropTuples").children()[i]).find(".span5")).find("input")[0]).val().trim();
            var value =
                $($($($("#sapPropTuples").children()[i]).find(".span5")).find("input")[1]).val().trim();

            if (typeof key === "undefined" || (typeof key === "string" && key.trim() === "")) {
                showInfoWindow("Enter valid key.", "Input required");
                return false;
            }
            if (typeof value === "undefined" || (typeof value === "string" && value.trim() === "")) {
                showInfoWindow("Enter valid value.", "Input required");
                return false;
            }
        }
    }
    return true;
}

function createSapPropEntry(sapProperties, len) {
    var inputTxtKey = document.createElement("input");
    inputTxtKey.type = "text";
    inputTxtKey.className = "span12";
    inputTxtKey.setAttribute("placeholder", "Key");
    var divKey = document.createElement("div");
    divKey.className = "span5";
    divKey.appendChild(inputTxtKey);

    var inputTxtValue = document.createElement("input");
    inputTxtValue.type = "text";
    inputTxtValue.className = "span12";
    inputTxtValue.setAttribute("placeholder", "Value");
    var divValue = document.createElement("div");
    divValue.className = "span5";
    divValue.appendChild(inputTxtValue);

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendSapPropEntry(this);");
    iBtnAddRule.setAttribute("title", "Add Property below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteSapPropEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Property");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divKey);
    divRowFluidMargin5.appendChild(divValue);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.appendChild(divRowFluidMargin5);
    if (null !== sapProperties && typeof sapProperties !== "undefined") {
        var key_value = sapProperties;
        var key = key_value.key;
        var value = key_value.value;
        $(inputTxtKey).val(key);
        $(inputTxtValue).val(value);
    }    

    return rootDiv;
}

function deleteSapPropEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearSapPropEntry() {
    var tuples = $("#sapPropTuples").children();
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#sapPropTuples").empty();
    }
}

function handleSapSet() {
    var selectedSap = $("#ddSapSet").data("contrailDropdown").value();
    $("#gridSap").data("contrailGrid")._dataView.setData([]);
    gridSap.showGridMessage('empty');
    doAjaxCall('/api/tenants/config/service-appliances?parentUUID=' + selectedSap,
        'GET', null, 'successHandlerForGridSapRow',
        'failureHandlerForGridSapRow', null, null, null);
}

function fetchDataForGridSap() {
    $("#cb_gridSap").attr("checked", false);
    $("#gridSap").data("contrailGrid")._dataView.setData([]);
    this.idCount = 0;
    dsAjaxcount++;
    configObj["service-appliances"] = [];
    gridSap.showGridMessage('loading');
    var sapSetId = $("#ddSapSet").data("contrailDropdown").value();
    doAjaxCall("/api/tenants/config/service-appliances?parentUUID="+sapSetId, 
        "GET", null, "successHandlerForGridSapRow", "failureHandlerForGridSapRow", null, null);
}

function successHandlerForGridSapRow(result) {
    var selectedSapSet = $("#ddSapSet").data("contrailDropdown").text();
    var sapData = $("#gridSap").data("contrailGrid")._dataView.getItems();
    delete configObj["service-appliances"];
    configObj["service-appliances"] = [];
    var saps = jsonPath(result, "$..service-appliance");

    for (var i = 0; i < saps.length; i++) {
        var sap = saps[i];
        var sapName = sap["fq_name"][2];
        var uuid = sap["uuid"];
        var sapDisplayName = sap["display_name"];
        var sapIPAddress = sap["service_appliance_ip_address"];
        var sapUser = "";
        var sapPwd = "";
        //var sapInterface = "";
        if(sap.hasOwnProperty("service_appliance_user_credentials") && null !== sap["service_appliance_user_credentials"]) {
            if (sap["service_appliance_user_credentials"].hasOwnProperty("username") &&
                null !== sap["service_appliance_user_credentials"]["username"] &&
                typeof sap["service_appliance_user_credentials"]["username"] == "string" &&
                sap["service_appliance_user_credentials"]["username"].trim() !== "") {
                sapUser = sap["service_appliance_user_credentials"]["username"].trim();
            }
            if (sap["service_appliance_user_credentials"].hasOwnProperty("password") &&
                null !== sap["service_appliance_user_credentials"]["password"] &&
                typeof sap["service_appliance_user_credentials"]["password"] == "string" &&
                sap["service_appliance_user_credentials"]["password"].trim() !== "") {
                sapPwd = sap["service_appliance_user_credentials"]["password"].trim();
            }
        }
        /*if(sap.hasOwnProperty("service_appliance_interface") &&
            typeof sap["service_appliance_interface"] === "string" &&
            sap["service_appliance_interface"].trim() !== "") {
            sapInterface = sap["service_appliance_interface"].trim();
        }*/
        var sapUserCredentials = {username: sapUser, password: sapPwd}
        configObj["service-appliances"].push(sap);

        /*var pIfs = [];
        var pIfsString = "";
        if(null !== sap["physical_interface_refs"] && 
            sap["physical_interface_refs"] instanceof Array &&
            sap["physical_interface_refs"].length > 0) {
            for(var j=0; j<sap["physical_interface_refs"].length; j++) {
                pIfs.push(sap["physical_interface_refs"][j].to.join(":"));
                if(j == 0) {
                    pIfsString = sap["physical_interface_refs"][j].to[1] + ":" +
                    sap["physical_interface_refs"][j].to[2];
                } else {
                    pIfsString = "<br/>" + sap["physical_interface_refs"][j].to[1] + ":" +
                    sap["physical_interface_refs"][j].to[2];
                }
            }
        } else {
            pIfsString = "-";
        }*/

        var props = sap["service_appliance_properties"];
        var propString = "-";
        if(props !== null && typeof props !== "undefined" &&
            props.hasOwnProperty("key_value_pair") &&
            props["key_value_pair"].length > 0) {
            props = props["key_value_pair"]; 
            $.each(props,function(idx,d){
                if(idx == 0){
                    propString = d.key + " " + d.value; 
                } else {
                    propString += "<br/>" + d.key + " " + d.value;
                }
            });
        } else {
            props = [];
        }

        sapData.push({
            "id": this.idCount++, 
            "service_appliance_name": sapName,
            "service_appliance_ip_address": sap.service_appliance_ip_address,
            "service_appliance_display_name": sapDisplayName,
            "service_appliance_user_credentials": sapUserCredentials,
            "service_appliance_user": sapUser,
            //"service_appliance_interface": sapInterface,
            //"physical_interface_refs": pIfs,
            //"physical_interface_refs_string": pIfsString,
            "service_appliance_properties": props,
            "sap_prop_string": propString,
            "uuid":uuid
        });
    }

    $("#gridSap").data("contrailGrid")._dataView.setData(sapData);
    if(result.more == true || result.more == "true"){
        gridSap.showGridMessage('loading');
    } else {
        if(!sapData || sapData.length<=0)
            gridSap.showGridMessage('empty');
    }
}

function failureHandlerForGridSapRow(result, cbParam) {
    showInfoWindow("Error in getting service appliances data.", "Error");
    gridSap.showGridMessage('errorGettingData');    
}

function showRemoveWindow(rowIndex) {
    $.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Service Appliance delete</h6>',
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
               var selected_row = $("#gridSap").data("contrailGrid")._dataView.getItem(rowNum);
               deleteSap([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
}

function closeCreateSapWindow() {
    clearValuesFromDomElements();
}

function clearValuesFromDomElements() {
    mode = "add";
    txtSapName.val("");
    txtSapName[0].disabled = false;
    txtSapIPAddress.val("");
    txtSapUserName.val("");
    txtSapPassword.val("");
    //msPhysicalInterfaces.data("contrailMultiselect").value("");
    /*var cmbSapInterfaceTmp  = $("#cmbSapInterface").data("contrailCombobox");
    d = cmbSapInterfaceTmp.getAllData()[0];
    cmbSapInterfaceTmp.value(d.value);
    cmbSapInterfaceTmp.text(d.text);*/
    clearSapPropEntry();
}

function fetchData() {
    gridSap._dataView.setData([]);
    gridSap.showGridMessage('loading');
    doAjaxCall(
        "/api/admin/config/get-data?type=service-appliance-set", "GET",
        null, "successHandlerForSapSet", "failureHandlerForSapSet", null, null);
}

function successHandlerForSapSet(result) {
    gridSap.removeGridMessage();
    var sapSetData = [];
    var sapSets = jsonPath(result, "$..service-appliance-set");

    configObj["service-appliance-sets"] = [];

    for (var i = 0; i < sapSets.length; i++) {
        var sapSet = sapSets[i];
        configObj["service-appliance-sets"][i] = sapSets[i];

        sapSetData.push({
            "value":sapSet.uuid,
            "text":sapSet.name,
        });
    }
    
    if(sapSets.length <=0) {
        $("#ddSapSet").data("contrailDropdown").setData("No Service Appliance Set found");
        $("#ddSapSet").data("contrailDropdown").disable();
        gridSap.showGridMessage('empty');
    } else {
        $("#ddSapSet").data("contrailDropdown").setData(sapSetData);
        $("#ddSapSet").data("contrailDropdown").value(sapSetData[0].value);
        $("#ddSapSet").data("contrailDropdown").text(sapSetData[0].text);
        doAjaxCall('/api/tenants/config/service-appliances?parentUUID=' + sapSetData[0].value,
            'GET', null, 'successHandlerForGridSapRow', 
            'failureHandlerForGridSap', null, null, null);
    }
}

function failureHandlerForSapSet() {
    gridSap.showGridMessage('empty');
}

function showSapEditWindow(mode, rowIndex) {
    if($("#btnCreateSap").hasClass('disabled-link')) {
        return; 
    }
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/get-all-physical-interfaces",
        type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function() {
            //all success
            var results = arguments;
            clearValuesFromDomElements();
            /*var physicalInterfaces = jsonPath(results[0], "$.physical-interfaces[*]");
            var pIfs = [];
            if (null !== physicalInterfaces && typeof physicalInterfaces === "object" 
                && physicalInterfaces.length > 0) {
                configObj["physical-interfaces"] = [];
                for (var i = 0; i < physicalInterfaces.length; i++) {
                    configObj["physical-interfaces"][i] = {};
                    configObj["physical-interfaces"][i] = physicalInterfaces[i];
                    pIfs[pIfs.length] = {
                        text: physicalInterfaces[i]["fq_name"][1] + ":" + physicalInterfaces[i]["fq_name"][2],
                        value: physicalInterfaces[i]["uuid"],
                        fq_name: physicalInterfaces[i]["fq_name"].join(":")
                    };
                }
            }
            msPhysicalInterfaces.data("contrailMultiselect").setData(pIfs);*/
            var selectedSapSet = $("#ddSapSet").data("contrailDropdown").text();

            if (mode === "add") {
                windowCreateSap.find('.modal-header-title').text('Create Service Appliance');
                $(txtSapName).focus();
            } else if (mode === "edit") {
                var selectedRow = $("#gridSap").data("contrailGrid")._dataView.getItem(rowIndex);
                windowCreateSap.find('.modal-header-title').text('Edit Service Appliance ' + selectedRow.service_appliance_name);
                txtSapName.val(selectedRow.service_appliance_name);
                txtSapName[0].disabled = true;
                if (selectedRow.hasOwnProperty("service_appliance_ip_address") &&
                    typeof selectedRow["service_appliance_ip_address"] === "string" &&
                    selectedRow["service_appliance_ip_address"].trim() !== "") {
                    txtSapIPAddress.val(selectedRow["service_appliance_ip_address"]);
                } else {
                    txtSapIPAddress.val("");
                }
                /*if (selectedRow.hasOwnProperty("service_appliance_interface") &&
                    typeof selectedRow["service_appliance_interface"] === "string" &&
                    selectedRow["service_appliance_interface"].trim() !== "") {
                    cmbSapInterface = $("#cmbSapInterface").data("contrailCombobox");
                    cmbSapInterface.val(selectedRow["service_appliance_interface"].trim());
                } else {
                    cmbSapInterface.val("");
                }*/

                /*if(selectedRow.hasOwnProperty("service_appliance_physical_interface_refs") &&
                    selectedRow["service_appliance_physical_interface_refs"].length > 0) {
                    var configuredPhysicalInterfaces = [];
                    for(var i=0; i<selectedRow["service_appliance_physical_interface_refs"].length; i++) {
                        var pIf = selectedRow["service_appliance_physical_interface_refs"][i];
                        //configuredPhysicalInterfaces.push(pIf.to[1] + ":" + pIf.to[2]);
                        configuredPhysicalInterfaces.push(pIf.uuid);
                    }
                    msPhysicalInterfaces.data("contrailMultiselect").value(configuredPhysicalInterfaces);
                } else
                    msPhysicalInterfaces.data("contrailMultiselect").value("");*/

                if (selectedRow.hasOwnProperty("service_appliance_user_credentials")) {
                    if(selectedRow["service_appliance_user_credentials"].hasOwnProperty("username") &&
                        typeof selectedRow["service_appliance_user_credentials"]["username"] == "string" &&
                        selectedRow["service_appliance_user_credentials"]["username"].trim() !== "")
                    txtSapUserName.val(selectedRow["service_appliance_user_credentials"]["username"]);
                    if(selectedRow["service_appliance_user_credentials"].hasOwnProperty("password") &&
                        typeof selectedRow["service_appliance_user_credentials"]["password"] == "string" &&
                        selectedRow["service_appliance_user_credentials"]["password"].trim() !== "")
                    txtSapPassword.val(selectedRow["service_appliance_user_credentials"]["password"]);
                } else {
                    txtSapUserName.val("");
                    txtSapPassword.val("");
                }
                if (selectedRow["service_appliance_properties"] &&
                    selectedRow["service_appliance_properties"].length > 0) {
                    var propEntries = selectedRow["service_appliance_properties"];
                    for (var j = 0; j < propEntries.length; j++) {
                        var prop = propEntries[j];
                        var propEntry = createSapPropEntry(prop, j);
                        $("#sapPropTuples").append(propEntry);
                    }
                }

            }            

        }, function() {
            //one fail
            var results = arguments;
        });

    windowCreateSap.modal("show");
    windowCreateSap.find('.modal-body').scrollTop(0);
}

function createSapSuccessCb() {
    gridSap.showGridMessage('loading');
    fetchDataForGridSap();
}

function createSapFailureCb() {
    gridSap.showGridMessage('loading');
    fetchDataForGridSap();
}

function validate() {
    var sapName = txtSapName.val().trim();
    if (typeof sapName === "undefined" || sapName === "") {
        showInfoWindow("Enter a valid service appliance name", "Input required");
        return false;
    }
    var sapIPAddress = txtSapIPAddress.val().trim();
    if (typeof sapIPAddress === "undefined" || sapIPAddress === "" ||
        !isValidIP(sapIPAddress)) {
        showInfoWindow("Enter a valid service appliance IP address", "Input required");
        return false;
    }
    return true;
}

function destroy() {
    ddSapSet = $("#ddSapSet").data("contrailDropdown");
    if(isSet(ddSapSet)) {
        ddSapSet.destroy();
        ddSapSet = $();
    }

    gridSap = $("#gridSap").data("contrailGrid");
    if(isSet(gridSap)) {
        gridSap.destroy();
        $("#gridSap").empty();
        gridSap = $();
    }

    btnCreateSap = $("#btnCreateSap");
    if(isSet(btnCreateSap)) {
        btnCreateSap.remove();
        btnCreateSap = $();
    }

    btnDeleteSap = $("#btnDeleteSap");
    if(isSet(btnDeleteSap)) {
        btnDeleteSap.remove();
        btnDeleteSap = $();
    }

    btnCreateSapCancel = $("#btnCreateSapCancel");
    if(isSet(btnCreateSapCancel)) {
        btnCreateSapCancel.remove();
        btnCreateSapCancel = $();
    }

    btnCreateSapOK = $("#btnCreateSapOK");
    if(isSet(btnCreateSapOK)) {
        btnCreateSapOK.remove();
        btnCreateSapOK = $();
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

    txtSapName = $("#txtSapName");
    if(isSet(txtSapName)) {
        txtSapName.remove();
        txtSapName = $();
    }

    txtSapIPAddress = $("#txtSapIPAddress");
    if(isSet(txtSapIPAddress)) {
        txtSapIPAddress.remove();
        txtSapIPAddress = $();
    }

    txtSapUserName = $("#txtSapUserName");
    if(isSet(txtSapUserName)) {
        txtSapUserName.remove();
        txtSapUserName = $();
    }

    txtSapPassword = $("#txtSapPassword");
    if(isSet(txtSapPassword)) {
        txtSapPassword.remove();
        txtSapPassword = $();
    }

    /*cmbSapInterface = $("#cmbSapInterface").data("contrailCombobox");
    if(isSet(cmbSapInterface)) {
       cmbSapInterface.destroy();
       cmbSapInterface = $();
    }*/

    /*msPhysicalInterfaces = $("#msPhysicalInterfaces").data("contrailMultiselect");
    if(isSet(msPhysicalInterfaces)) {
        msPhysicalInterfaces.destroy();
        msPhysicalInterfaces = $();
    }*/

    var gridSapDetailTemplate = $("#gridSapDetailTemplate");
    if(isSet(gridSapDetailTemplate)) {
        gridSapDetailTemplate.remove();
        gridSapDetailTemplate = $();
    }

    var sapPropTuples = $("#sapPropTuples");
    if(isSet(sapPropTuples)) {
        sapPropTuples.remove();
        sapPropTuples = $();
    }

    windowCreateSap = $("#windowCreateSap");
    if(isSet(windowCreateSap)) {
        windowCreateSap.remove();
        windowCreateSap = $();
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

    var sapConfigTemplate = $("#sap-config-template");
    if(isSet(sapConfigTemplate)) {
        sapConfigTemplate.remove();
        sapConfigTemplate = $();
    }
}
