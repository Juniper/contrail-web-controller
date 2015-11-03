/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

serviceApplianceSetConfigObj = new ServiceApplianceSetConfigObj();

function ServiceApplianceSetConfigObj() {
    //Variable definitions

    //Text Box
    var txtSapSetName;

    //Grids
    var gridSapSet;

    //Buttons
    var btnCreateSapSet, btnDeleteSapSet,
        btnCreateSapSetCancel, btnCreateSapSetOK,
        btnCnfDelPopupOK, btnCnfDelPopupCancel;

    //Datasources
    var dsGridSapSet;

    //Combobox
    var cmbHAMode, cmbApplianceDriver;

    //Windows
    var windowCreateSapSet, confirmDelete, confirmDeleterow;
    var mode="create";
    var idCount = 0;
    var dynamicID;
	var drAjaxcount = 0;
    var ajaxParam;

    //Method definitions
    this.load                       = load;
    this.init                       = init;
    this.initComponents             = initComponents;
    this.initActions                = initActions;
    this.fetchData                  = fetchData;
    this.fetchDataForGridSapSet     = fetchDataForGridSapSet;
    this.closeCreateSapSetWindow    = closeCreateSapSetWindow;
    this.sapSetCreateWindow         = sapSetCreateWindow;
    this.successHandlerForSapSet    = successHandlerForSapSet;
    this.failureHandlerForSapSet    = failureHandlerForSapSet;
    this.createSapSetSuccessCb      = createSapSetSuccessCb;
    this.createSapSetFailureCb      = createSapSetFailureCb;
    this.destroy                    = destroy;   
    this.dynamicID                  = dynamicID;
}

function load() {
    var configTemplate = Handlebars.compile($("#sapset-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_infra_sapset';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDataForGridSapSet();
}

function initComponents() {
    dynamicID = 0;
    $("#gridSapSet").contrailGrid({
        header : {
            title:{
                text : 'Service Appliance Set'
            },
            customControls: ['<a id="btnDeleteSapSet" class="disabled-link" title="Delete service appliance set(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateSapSet" title="Create service appliance set"><i class="icon-plus"></i></a>']
        },
        columnHeader : {
            columns : [
            {
                id : 'service_appliance_set_name',
                field : 'service_appliance_set_name',
                name : 'Service Appliance Set',
                cssClass :'cell-hyperlink-blue',
                events : {
                    onClick : function(e, dc) {
                        layoutHandler.setURLHashParams({uuid : dc.uuid} ,{p : 'config_appliance_sap' ,merge : false ,triggerHashChange : true});
                    }
                } 
            } ,
            {
                id : 'service_appliance_driver',
                field : 'service_appliance_driver',
                name : 'Appliance Driver'
            } ,
             {
                id : 'service_appliance_ha_mode',
                field : 'service_appliance_ha_mode',
                name : 'HA Mode'
            }]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteSapSet').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteSapSet').removeClass('disabled-link');
                    }
                },                
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            sapSetEditWindow(rowIndex);
                        }
					},
                    {
                        title: 'Delete',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showDelWindow(rowIndex);
                        }
                    }                    
                ],
                detail : {
                    template : $("#gridSapSetDetailTemplate").html()
                }    
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Service Appliance Sets..'
                },
                empty: {
                    text: 'No Service Appliance Set.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Service Appliance Set.' 
                }
           }            
        }
    });

    gridSapSet = $("#gridSapSet").data("contrailGrid");

    txtSapSetName            = $("#txtSapSetName");
    btnCreateSapSet          = $("#btnCreateSapSet");
    btnDeleteSapSet          = $("#btnDeleteSapSet");
    btnCreateSapSetCancel    = $("#btnCreateSapSetCancel");
    btnCreateSapSetOK        = $("#btnCreateSapSetOK");
    btnCnfDelPopupOK         = $("#btnCnfDelPopupOK");
    btnCnfDelPopupCancel     = $("#btnCnfDelPopupCancel");
    btnCnfDelRowPopupOK      = $("#btnCnfDelRowPopupOK");
    btnCnfDelRowPopupCancel  = $("#btnCnfDelRowPopupCancel");
    cmbHAMode                = $("#cmbHAMode");
    cmbApplianceDriver       = $("#cmbApplianceDriver");
    var haModeVal = [
        {text:"active-active", value:"active-active"},
        {text:"active-standby", value:"active-standby"}
    ];
    cmbHAMode = $("#cmbHAMode").contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        placeholder:"Enter or Select a HA Mode"
    });
    $("#cmbHAMode").data("contrailCombobox").setData(haModeVal);
    $("#cmbHAMode").data("contrailCombobox").value(haModeVal[0].value);
    $("#cmbHAMode").data("contrailCombobox").text(haModeVal[0].text);

    var driverVal = [
        {text:"svc_monitor.services.loadbalancer.drivers.ha_proxy.driver.OpencontrailLoadbalancerDriver", value:"svc_monitor.services.loadbalancer.drivers.ha_proxy.driver.OpencontrailLoadbalancerDriver"}
    ];

    cmbApplianceDriver = $("#cmbApplianceDriver").contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        placeholder:"Enter or Select a load balancer driver"
    });
    $("#cmbApplianceDriver").data("contrailCombobox").setData(driverVal);
    $("#cmbApplianceDriver").data("contrailCombobox").value(driverVal[0].value);
    $("#cmbApplianceDriver").data("contrailCombobox").text(driverVal[0].text);

    drAjaxcount = 0;
    gridSapSet.showGridMessage('loading');

    windowCreateSapSet = $("#windowCreateSapSet");
    windowCreateSapSet.modal({backdrop:'static', keyboard: false, show:false});

    confirmDelete = $("#confirmDelete");
    confirmDelete.modal({backdrop:'static', keyboard: false, show:false});

    confirmDeleterow = $("#confirmDeleterow");
    confirmDeleterow.modal({backdrop:'static', keyboard: false, show:false});
}

function initGridSapSetDetail(e) {
    var detailRow = e.detailRow;
}

function initActions() {
    btnCreateSapSet.click(function (a) {
        sapSetCreateWindow("create");
    });

    btnDeleteSapSet.click(function (a) {	
        if(!$(this).hasClass('disabled-link')) {    
            confirmDelete.find('.modal-header-title').text("Confirm");
            confirmDelete.modal('show');
        }    
    });

    btnCreateSapSetCancel.click(function (a) {
        windowCreateSapSet.modal('hide');
    });

    btnCnfDelPopupCancel.click(function (a) {
        confirmDelete.modal('hide')
    });
    
     btnCnfDelRowPopupCancel.click(function (a) {
        confirmDeleterow.modal('hide')
    });

    btnCnfDelPopupOK.click(function (a) {
	    btnDeleteSapSet.attr("disabled","disabled");	
        //Release functions
        confirmDelete.modal('hide');
        var deleteAjaxs = [];
        var selected_rows = $("#gridSapSet").data("contrailGrid").getCheckedRows();
        deleteSapSet(selected_rows);
    });

    btnCreateSapSetOK.click(function (a) {
        var nameVal = $(txtSapSetName).val();
        var haModeVal = $("#cmbHAMode").data("contrailCombobox").value();
        var driverVal  = $("#cmbApplianceDriver").data("contrailCombobox").value();
        var kvTuples = $("#kvTuples")[0].children;
        var sapSetCfg = {};

        var validatReturn = validate();
        if (validatReturn != true) {
            return false;
        }
	    windowCreateSapSet.modal('hide');

        sapSetCfg["service-appliance-set"] = {};
        sapSetCfg["service-appliance-set"]["parent_type"] = "global-system-config";
        sapSetCfg["service-appliance-set"]["fq_name"] = [];
        sapSetCfg["service-appliance-set"]["fq_name"] = ["default-global-system-config", nameVal];
        sapSetCfg["service-appliance-set"]["name"] = nameVal;
        sapSetCfg["service-appliance-set"]["display_name"] = nameVal;
        if(mode === "edit") {
            if(null == driverVal || typeof driverVal === "undefined" || driverVal.trim() === "")
                driverVal = null; 
            if(null == haModeVal || typeof haModeVal === "undefined" || haModeVal.trim() === "")
                haModeVal = null; 
        }
            
        sapSetCfg["service-appliance-set"]["service_appliance_driver"] = driverVal;
        sapSetCfg["service-appliance-set"]["service_appliance_ha_mode"] = haModeVal;
        if (kvTuples && kvTuples.length > 0) {
            sapSetCfg["service-appliance-set"]["service_appliance_set_properties"] = {};
            sapSetCfg["service-appliance-set"]["service_appliance_set_properties"]["key_value_pair"] = [];
            for (var i = 0; i < kvTuples.length; i++) {
                var id = getID(String($("#kvTuples").children()[i].id));
                var keyVal = $("#kvTuples_"+id+"_txtKeyInput").val().trim();
                var valueVal = $("#kvTuples_"+id+"_txtValueInput").val().trim();
                sapSetCfg["service-appliance-set"]["service_appliance_set_properties"]["key_value_pair"][i] = 
                    {
                        "key": keyVal,
                        "value": valueVal
                    };
            }
        } else {
           if(mode === "edit")
               sapSetCfg["service-appliance-set"]["service_appliance_set_properties"] = null; 
        }
        var url, type;
	    if(mode === "create"){
		    url="/api/tenants/config/service-appliance-sets";
		    type="POST";	
	    }
	    else if(mode ==="edit"){
		    url='/api/tenants/config/service-appliance-set/'+ gblSelRow["uuid"];
		    type="PUT";
            sapSetCfg["service-appliance-set"]['uuid'] = gblSelRow["uuid"];
	    }
        doAjaxCall(url, type, JSON.stringify(sapSetCfg),
            "createSapSetSuccessCb", "createSapSetFailureCb");
    });
}

function deleteSapSet(selected_rows) {
    if(selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/service-appliance-set/"; 
        cbParams.urlField = "uuid";
        cbParams.fetchDataFunction = "createSapSetSuccessCb";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting Service Appliance Set - ";
        cbParams.errorField = "service_appliance_set_name";
        deleteObject(cbParams);
    }
}

function sapSetEditWindow(i) {
	//Edit Code has to be done
	gblSelRow = $("#gridSapSet").data("contrailGrid")._dataView.getItem(i);
	sapSetCreateWindow("edit", gblSelRow["service_appliance_set_name"]);
}

function showDelWindow(i){

	$.contrailBootstrapModal({
        id: 'confirmRemove',
        title: 'Remove',
        body: '<h6>Confirm Service Appliance Set delete</h6>',
        footer: [{
           title: 'Cancel',
           onclick: 'close',
        },
        {
           id: 'btnRemovePopupOK',
           title: 'Confirm',
           onclick: function(){
               var selected_row = $("#gridSapSet").data("contrailGrid")._dataView.getItem(i);
                deleteSapSet([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
        }
        ]
    });

}

function validate(){
    if($(txtSapSetName).val().trim() == ""){
        showInfoWindow("Enter Service Appliance Set Name ", "Input required");
        return false;
    }
    return true;
}

function fetchDataForGridSapSet() { 
    $("#cb_gridSapSet").attr("checked", false);
    $("#gridSapSet").data("contrailGrid")._dataView.setData([]);
    gridSapSet.showGridMessage('loading');
    idCount = 0;
	drAjaxcount++;
    ajaxParam = drAjaxcount;
    doAjaxCall(
        "/api/admin/config/get-data?type=service-appliance-set&count=50", "GET",
        null, "successHandlerForSapSet", "failureHandlerForSapSetRow", null, ajaxParam
    );
}

function successHandlerForSapSet(result,cbparam) {
    if(cbparam != ajaxParam){
	    return;
	}
    $(".headerRowCheckbox").attr("checked",false); 
    if(result.more == true || result.more == "true"){
        doAjaxCall("/api/admin/config/get-data?type=service-appliance-set&count=50" + 
            "&lastKey="+result.lastKey, 
            "GET", null, "successHandlerForSapSet", "failureHandlerForSapSetRow", null, cbparam); 
    }
    successHandlerForSapSetRow(result);
}

function failureHandlerForSapSetRow(result) {
    gridSapSet.showGridMessage('errorGettingData');	
}

function successHandlerForSapSetRow(result) { 
    gridSapSet.removeGridMessage();
    var sapSetData = [];
    var sapSets = jsonPath(result, "$..service-appliance-set");

    configObj["service-appliance-sets"] = [];

    for (var i = 0; i < sapSets.length; i++) {
        var sapSet = sapSets[i];
        configObj["service-appliance-sets"][i] = sapSets[i];
        var saps = sapSet["service_appliances"];
        var driverStr = 
            (null !== sapSet.service_appliance_driver && 
                typeof sapSet.service_appliance_driver !== "undefined") ?
            sapSet.service_appliance_driver : "-";
        var haModeStr = (null !== sapSet.service_appliance_ha_mode && 
                typeof sapSet.service_appliance_ha_mode !== "undefined") ?
            sapSet.service_appliance_ha_mode : "-";
        var appliances = [];
        var appliancesStr = "-";
        if(saps instanceof Array && saps.length > 0) {
            for(var j=0; j<saps.length; j++) {
                var sap = saps[j];
                appliances.push(sap["to"][2]);
            }
            appliancesStr = appliances.join();
        }
        var props = sapSet.service_appliance_set_properties;
        var propString = "-";
        if(props !== null && typeof props !== "undefined" &&
            props.hasOwnProperty("key_value_pair") &&
            props["key_value_pair"].length > 0) {
            props = props["key_value_pair"]; 
            $.each(props,function(i,d){
                if(i == 0){
                    propString = d.key + " " + d.value; 
                } else {
                    propString += "</br>" + d.key + " " + d.value;
                }
            });
        } else {
            props = [];
        }

        sapSetData.push({"Id":idCount++, 
            "uuid":sapSet.uuid,
            "service_appliance_set_name":sapSet.name,
            "service_appliance_driver": driverStr,
            "service_appliance_ha_mode": haModeStr,
            "service_appliance_set_properties": props,
            "sap_set_prop_string": propString,
            "service_appliances": appliancesStr
        });
    }
    $("#gridSapSet").data("contrailGrid")._dataView.addData(sapSetData);
    if(result.more == true || result.more == "true"){
	   gridSapSet.showGridMessage('loading');
	} else {
       if(sapSets.length <=0) {
           gridSapSet.showGridMessage('empty'); 
       }    
    }
}

function failureHandlerForSapSet(result, cbParam) {
    gridSapSet.showGridMessage('errorGettingData');
}

function createKVEntry(keyvalue,id,element) {
    var keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.className = "span12";
    keyInput.setAttribute("placeholder", "Key");
    keyInput.setAttribute("id",element+"_"+id+"_txtKeyInput");
    var divKey = document.createElement("div");
    divKey.className = "span3";    
    divKey.appendChild(keyInput);

    var valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "span12";
    valueInput.setAttribute("placeholder", "Value");
    valueInput.setAttribute("id",element+"_"+id+"_txtValueInput");
    var divValue = document.createElement("div");
    divValue.className = "span3";
    divValue.appendChild(valueInput);


    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendKVEntry(this);");
    iBtnAddRule.setAttribute("title", "Add Key-Value pair below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteKVEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Key-Value pair");

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
    rootDiv.id = "rule_" + id;
    rootDiv.appendChild(divRowFluidMargin5);

    if (null !== keyvalue && typeof keyvalue !== "undefined") {
        $(keyInput).val(keyvalue.key);
        $(valueInput).val(keyvalue.value);
    }    
    return rootDiv; 
}

function validateKVEntry() {
    var kvTuples = $("#kvTuples")[0].children;
    var len = kvTuples.length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var kvTuple = $($(kvTuples[i]).find("div")[0]).children();
            var key = $($(kvTuple[0]).find("input")).val().trim();
            if (typeof key === "undefined" || "" === key) {
                showInfoWindow("Enter a valid key", "Invalid input for key");
                return false;
            }
            kvTuple = $($(kvTuples[i]).find("div")[2]).children();
            if($(kvTuple[0]).val() != undefined && $(kvTuple[0]).val().trim() != ""){
                var value = $(kvTuple[0]).val().trim();
                if (typeof value === "undefined" || "" === value) {
                    showInfoWindow("Enter a valid value", "Invalid input for value");
                    return false;
                }
            }
        }
    }
    return true;
}

function appendKVEntry(who, defaultRow) {
    var kvTuples = $("#kvTuples")[0].children;
    if(validateKVEntry() === false)
        return false;
    dynamicID++;
    var kvEntry = createKVEntry(null,dynamicID,"kvTuples");
    if (defaultRow) {
        $("#kvTuples").prepend($(kvEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(kvEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreateSapSet",kvEntry,false);
}

function deleteKVEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearKVEntries() {
    var tuples = $("#kvTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#kvTuples").empty();
    }
}

function closeCreateSapSetWindow() {
    //clearPopup();
}
function clearPopup() {
    //New values added
    $(txtSapSetName)[0].disabled=false;
    $(txtSapSetName).val("");
    var cmbHAModeTemp  = $("#cmbHAMode").data("contrailCombobox");
    d = cmbHAModeTemp.getAllData()[0];
    cmbHAModeTemp.value(d.value);
    cmbHAModeTemp.text(d.text);
    var cmbApplianceDriver  = $("#cmbApplianceDriver").data("contrailCombobox");
    d = cmbApplianceDriver.getAllData()[0];
    cmbApplianceDriver.value(d.value);
    cmbApplianceDriver.text(d.text);
    clearKVEntries();
    mode = "create";
}

function sapSetCreateWindow(m) {
    clearPopup();
    mode = m;
    var winTitle="Create Service Appliance Set";
    if(mode =="edit"){
        winTitle="Edit Service Appliance Set";
        populateSapSetEditWindow();
    }
    windowCreateSapSet.find('.modal-header-title').text(winTitle);
    windowCreateSapSet.modal('show');
    txtSapSetName.focus();
}

function populateSapSetEditWindow(){
    var selectedRow  = gblSelRow;
    var rowId        = selectedRow["Id"];
    var selectedSapSet = configObj["service-appliance-sets"][rowId];
    txtSapSetName.val(selectedRow.service_appliance_set_name);
    txtSapSetName[0].disabled = true;
    cmbHAMode = $("#cmbHAMode").data("contrailCombobox");
    var ha_mode = selectedRow.service_appliance_ha_mode;
    if(null !== ha_mode && typeof ha_mode !== "undefined" &&
        ha_mode.trim() !== "" && ha_mode.trim() !== "-") {
        cmbHAMode.value(ha_mode);
    } else {
        cmbHAMode.value("");
    }
    var driver = selectedRow.service_appliance_driver;
    cmbApplianceDriver = $("#cmbApplianceDriver").data("contrailCombobox");
    if(null !== driver && typeof driver !== "undefined" &&
        driver.trim() !== "" && driver.trim() !== "-") {
        cmbApplianceDriver.value(driver);
    } else {
        cmbApplianceDriver.value("");
    }
    var kvPairs = selectedRow.service_appliance_set_properties;
    for(var i=0; i<kvPairs.length;i++){
        dynamicID++;
        var kvEntry = createKVEntry(kvPairs[i], dynamicID, "kvTuples");
        $("#kvTuples").append($(kvEntry));
    }
}

function createSapSetSuccessCb() {
    closeCreateSapSetWindow();
    fetchDataForGridSapSet();
}

function createSapSetFailureCb() {
    closeCreateSapSetWindow();
    fetchDataForGridSapSet();
}

function destroy() {
    txtSapSetName = $("#txtSapSetName");
    if(isSet(txtSapSetName)) {
       txtSapSetName.remove();
       txtSapSetName = $();
    }

    var cmbHAMode = $("#cmbHAMode").data("contrailCombobox");
    if(isSet(cmbHAMode)) {
       cmbHAMode.destroy();
       cmbHAMode = $();
    }

    cmbApplianceDriver = $("#cmbApplianceDriver");
    if(isSet(cmbApplianceDriver)) {
       cmbApplianceDriver.remove();
       cmbApplianceDriver = $();
    }

    btnCreateSapSet = $("#btnCreateSapSet");
    if(isSet(btnCreateSapSet)) {
       btnCreateSapSet.remove();
       btnCreateSapSet = $();
    }

    btnDeleteSapSet = $("#btnDeleteSapSet");
    if(isSet(btnDeleteSapSet)) {
       btnDeleteSapSet.remove();
       btnDeleteSapSet = $();
    }

    btnCreateSapSetCancel = $("#btnCreateSapSetCancel");
    if(isSet(btnCreateSapSetCancel)) {
       btnCreateSapSetCancel.remove();
       btnCreateSapSetCancel = $();
    }

    btnCreateSapSetOK = $("#btnCreateSapSetOK");
    if(isSet(btnCreateSapSetOK)) {
       btnCreateSapSetOK.remove();
       btnCreateSapSetOK = $();
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

    windowCreateSapSet = $("#windowCreateSapSet");
    if(isSet(windowCreateSapSet)) {
       windowCreateSapSet.remove();
       windowCreateSapSet = $();
    }

    gridSapSet = $("#gridSapSet");
    if(isSet(gridSapSet)) {
       gridSapSet.remove();
       gridSapSet = $();
    }
    var gridSapSetDetailTemplate = $("#gridSapSetDetailTemplate");
    if(isSet(gridSapSetDetailTemplate)) {
        gridSapSetDetailTemplate.remove();
        gridSapSetDetailTemplate = $();
    }
    var configTemplate = $("#sapset-config-template");
    if(isSet(configTemplate)) {
    	configTemplate.remove();
    	configTemplate = $();
     }
}
