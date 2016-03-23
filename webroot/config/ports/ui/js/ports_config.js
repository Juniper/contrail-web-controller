/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

portsConfigObj = new portsConfigObj();
var  iconPorts ='image-Security', iconSubnet ='image-subnet';
var deleteMsg = 'Confirm to delete all Port(s) for Project (%s)';
function portsConfigObj() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject;
    var ddVN,ddVNState,ddDeviceOwnerName,ddDeviceOwnerUUID,
        ddDeviceOwnerUUIDRouter,
        ddSubInterfaceParent;//,ddAAP,ddTenentID;

    //Comboboxes

    var msSecurityGroup,msFloatingIp;
    //Grids
    var gridPorts;

    //Buttons
    var btnCreatePorts, btnDeletePorts, btnCreatePortsCancel, btnCreatePortsOK, btnAddRule, btnDeleteRule,
    btnRemovePopupOK, btnRemovePopupCancel, btnCnfRemoveMainPopupOK, btnCnfRemoveMainPopupCancel;

    //Textboxes
    var txtPortName,txtMacAddress;


    //Windows
    var windowCreatePorts, confirmRemove, confirmMainRemove;

    var idCount =0;
    var polAjaxcount = 0;
    var delCountPerRequest;
    var ajaxParam;
    var dynamicID = 0;
    var pageCount;
    var allfloatingIP;
    var allNetworkData;
    var currentVNSubnetDetail;
    var routerUUID;
    var computeUUID;
    var mac_address;
    var ip_address;
    var selectedParentVMIObject;
            
    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForgridPorts = fetchDataForgridPorts;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.handleProjects = handleProjects;
    this.deletePorts = deletePorts;
    this.showPortEditWindow = showPortEditWindow;
    this.closeCreatePortsWindow = closeCreatePortsWindow;
    this.successHandlerForgridPortsRow = successHandlerForgridPortsRow;
    this.failureHandlerForgridPortsRow = failureHandlerForgridPortsRow;
    this.successHandlerForgridPorts = successHandlerForgridPorts;
    this.failureHandlerForgridPorts = failureHandlerForgridPorts;
    this.createPortsSuccessCb = createPortsSuccessCb;
    this.createPortsFailureCb = createPortsFailureCb;
    this.validate = validate;
    this.dynamicID = dynamicID;
    this.pageCount = pageCount;
    this.allfloatingIP = allfloatingIP;
    this.allNetworkData = allNetworkData;
    this.currentVNSubnetDetail = currentVNSubnetDetail;
    this.mac_address = mac_address;
    this.ip_address = ip_address;
    this.selectedParentVMIObject = selectedParentVMIObject;
    this.successHandlerForDeleteAll = successHandlerForDeleteAll;
    this.failureHandlerForDeleteAll = failureHandlerForDeleteAll;
    //this.appendPortsRuleEntry = appendPortsRuleEntry;
    //this.formatedRule = formatedRule;
    //this.getDirection = getDirection;
    //this.formatPortsPolicyRule = formatPortsPolicyRule;
    this.showRemoveWindow = showRemoveWindow;
    this.clearValuesFromDomElements = clearValuesFromDomElements;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#ports-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_net_ports';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForgridPorts");
}

function groupBy( array , f )
{
  var groups = {};
  array.forEach( function( o )
  {
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o );  
  });
  return Object.keys(groups).map( function( group )
  {
    return groups[group]; 
  })
}

function initComponents() {
    var deletePortsDropdownTemplate = contrail.getTemplate4Id('delete-port-action-template');
    var columnsToBeAddedDynamically = [];
    var displayOwnerNameColumn = {
                id: "displayOwnerName",
                field: "displayOwnerName",
                name: "Device",
                width:150
    
    };
    if(!isVCenter())
        columnsToBeAddedDynamically.push(displayOwnerNameColumn);
    $("#gridPorts").contrailGrid({
        header : {
            title : {
                text : 'Ports',
            },
            customControls: [deletePortsDropdownTemplate(),
                '<a id="btnCreatePorts" onclick="showPortEditWindow(\'add\');return false;" title="Create Port"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
            columns : [
            {
                id:"portUUID",
                field:"portUUID",
                name:"UUID",
                width:225,
                sortable: true
            },
            {
                id: "vnString",
                field: "vnString",
                name: "Network",
                width:175
            },
            {
                id: "fixedIPVal",
                field: "fixedIPVal",
                name: "Fixed IPs",
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.fixedIPVal === "object") {
                       for(var i=0; i<dc.fixedIPVal.length, i<2; i++) {
                           if(typeof dc.fixedIPVal[i] !== "undefined") {
                               returnString += dc.fixedIPVal[i] + "<br>";
                           }
                       }
                       if(dc.fixedIPVal.length > 2) {
                           returnString += '<span class="moredataText">(' + 
                           (dc.fixedIPVal.length-2) + 
                           ' more)</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                },
                width:150,
                sorter : comparatorIP
            },
            {
                id: "floatingIPVal",
                field: "floatingIPVal",
                name: "Floating IPs",
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.floatingIPVal === "object") {
                       for(var i=0; i<dc.floatingIPVal.length, i<2; i++) {
                           if(typeof dc.floatingIPVal[i] !== "undefined") {
                               returnString += dc.floatingIPVal[i] + "<br>";
                           }
                       }
                       if(dc.floatingIPVal.length > 2) {
                           returnString += '<span class="moredataText">(' + 
                           (dc.floatingIPVal.length-2) + 
                           ' more)</span><span class="moredata" style="display:none;"></span>';
                       }
                    }
                    return returnString;
                },
                width:150,
                sorter : comparatorIP
            }
            /*{
                id: "AllowedAddressPair",
                field: "AllowedAddressPair",
                name: "Paired"
            },
            {
                id: "status",
                field: "status",
                name: "Status"
            }*/
            ].concat(columnsToBeAddedDynamically)
        },
        body : {
            options : {
                forceFitColumns: true,
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeletePorts').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeletePorts').removeClass('disabled-link');
                    }
                },
                actionCell: function(dc){
                    var menu = [];
                    menu.push({
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showPortEditWindow('edit',rowIndex);
                        }
                    });
                    if(dc.chiled == false) {
                        menu.push({
                            title: 'Add Sub Interface',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                showPortEditWindow('add',rowIndex, 'true');
                            }
                        });
                    }
                    menu.push({
                        title: 'Delete',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showRemoveWindow(rowIndex);
                        }
                    });
                    return menu;
                },
                detail:{
                    template: $("#gridPortsDetailTemplate").html()
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Ports.',
                },
                empty: {
                    text: 'No Ports Found.'
                },
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Ports.'
                }
            }
        }
    });

    gridPorts = $("#gridPorts").data("contrailGrid");
    gridPorts.showGridMessage("loading");

    btnCreatePorts = $("#btnCreatePorts");
    btnDeletePorts = $("#btnDeletePorts");
    btnAddRule = $("#btnAddRule");
    btnDeleteRule = $("#btnDeleteRule");
    btnCreatePortsCancel = $("#btnCreatePortsCancel");
    btnCreatePortsOK = $("#btnCreatePortsOK");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");

    txtPortName = $("#txtPortName");
    txtMacAddress = $("#txtMacAddress");
    polAjaxcount = 0;
    delCountPerRequest = 250;
    mac_address = [];
    ip_address = [];
    selectedParentVMIObject = [];

    ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:handleDomains
    });
    ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });
    ddVN = $("#ddVN").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:updateSubnet
    });
    
    ddSubInterfaceParent = $("#ddSubInterfaceParent").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        change:setSubInterfaceProperties
    });
    
    ddVNState = $("#ddVNState").contrailDropdown({
        data: [{id:"true", text:'Up'}, {id:"false", text:'Down'}]
    });
    //ddAAP = $("#ddAAP").contrailDropdown({
    //    dataTextField:"text",
    //    dataValueField:"value"
    //});
    ddDeviceOwnerName = $("#ddDeviceOwnerName").contrailDropdown({
        data: [{id:"None", text:'None'}, {id:"compute", text:'Compute'}, {id:"router", text:'Router'}],
        change:updateDevice
    });

    ddDeviceOwnerUUID = $("#ddDeviceOwnerUUID").contrailCombobox({
        dataTextField:"text",
        dataValueField:"value"
    });
    ddDeviceOwnerUUIDRouter = $("#ddDeviceOwnerUUIDRouter").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });
    /*ddTenentID = $("#ddTenentID").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value"
    });*/

    msSecurityGroup = $("#msSecurityGroup").contrailMultiselect({
        placeholder: "Select Security Group",
        dataTextField:"text",
        dataValueField:"value",
        dropdownCssClass: 'select2-medium-width'
    });

    msFloatingIp = $("#msFloatingIp").contrailMultiselect({
        placeholder: "Select Floating IPs",
        dataTextField:"text",
        dataValueField:"value",
        dropdownCssClass: 'select2-medium-width'
    });
    dynamicID = 0;
    pageCount = 50;
    allfloatingIP = [];
    allNetworkData = [];
    currentVNSubnetDetail = [];

    windowCreatePorts = $("#windowCreatePorts");
    windowCreatePorts.on("hide", closeCreatePortsWindow);
    windowCreatePorts.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}
function enableSubInterface(e){
    if(e.checked == true){
        $(".subInterface").removeClass("hide");
    } else {
        $(".subInterface").addClass("hide");
    }
    scrollUp("#windowCreatePorts",$("#is_subInterface"),false);
}
function enableSG(e){
    if(e.checked == true){
        //$("#msSecurityGroup").removeClass("hide");
        $("#msSecurityGroup").data("contrailMultiselect").enable(true);
        $("#s2id_msSecurityGroup").find('input').attr('value', 'Select Security Groups');
        var sgData = $("#msSecurityGroup").data("contrailMultiselect").getAllData()
        var sgDataLen = sgData.length;
        for(var i=0;i < sgDataLen;i++){
            if((sgData[i].text).toLowerCase() == "default"){
                $("#msSecurityGroup").data("contrailMultiselect").value([sgData[i].value]);
                break;
            }
        }
    } else {
        //$("#msSecurityGroup").addClass("hide");
        $("#msSecurityGroup").data("contrailMultiselect").value([]);
        $("#msSecurityGroup").data("contrailMultiselect").enable(false);
        $("#s2id_msSecurityGroup").find('input').attr('value', 'Security Group disabled');

    }
}

function deletePorts(selected_rows) {
    btnDeletePorts.attr("disabled","disabled");
    gridPorts.showGridMessage("loading");
    var deleteAjaxs = [];
    /*if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/ports/";
        cbParams.urlField = "portUUID";
        cbParams.fetchDataFunction = "fetchDataForgridPorts";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting Port - ";
        cbParams.errorField = "portName";
        deleteObject(cbParams);
    }*/
    var deleteArr = [];
    var deleteID = [];
    var selectedRowCount = selected_rows.length
    for(i = 0; i < selectedRowCount; i++){
        deleteID.push(selected_rows[i].portUUID);
        if(((i+1) % delCountPerRequest) == 0 || (i+1) == selectedRowCount){
            deleteArr.push([{"deleteIDs":deleteID,"type":"virtual-machine-interface"}]);
            deleteID = [];
       }
    }
    var delArr = deleteArr[0];
    deleteArr.splice(0, 1);
    doAjaxCall("/api/tenants/config/delete", "POST", JSON.stringify(delArr),
                "loopDeletePortSuccessCb", "loopDeletePortFailCb", null, deleteArr, 0, true);
}
var errorDeleteMsg = "";

function loopDeletePortSuccessCb(result , deleteArr) {
    loopDeletePort(deleteArr);
}
function loopDeletePortFailCb(result , deleteArr) {
    gridPorts.showGridMessage('loading');
    errorDeleteMsg += result.responseText;
    loopDeletePort(deleteArr)
}

function loopDeletePort(deleteArr) {
    if(deleteArr.length >= 1){
        var delArr = deleteArr[0];
        deleteArr.splice(0, 1);
        doAjaxCall("/api/tenants/config/delete", "POST", JSON.stringify(delArr),
            "loopDeletePortSuccessCb", "loopDeletePortFailCb", null, deleteArr, 0, true);
    } else {
        if(errorDeleteMsg != "") {
            showInfoWindow(errorDeleteMsg, "Error");
        }
        errorDeleteMsg = "";
        fetchDataForgridPorts();
    }
}

function initActions() {
    btnDeletePorts.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.find("#txtConfirm").text('Confirm Port(s) delete');
            confirmMainRemove.modal('show');
        }
    });

    $('#btnDeleteAllPorts').click(function (a) {
        confirmMainRemove.find('.modal-header-title').text("Confirm");
        var proj = $("#ddProjectSwitcher").data("contrailDropdown");
        var porjName = proj != null ? proj.text() : '';
        deleteMsg = deleteMsg.replace('%s', porjName);
        confirmMainRemove.find("#txtConfirm").text(deleteMsg);
        confirmMainRemove.modal('show');
    });

    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide');
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        confirmMainRemove.modal('hide');
        if(confirmMainRemove.find("#txtConfirm").text() == deleteMsg) {
            $.allajax.abort();
            var proj = $("#ddProjectSwitcher").data("contrailDropdown");
            var uuid = proj != null ? proj.value() : '';
            doAjaxCall('/api/tenants/config/delete-all-ports?uuid=' + uuid, 'DELETE', null,
                'successHandlerForDeleteAll', 'failureHandlerForDeleteAll', null, null, 300000);
        } else {
            var selected_rows = $("#gridPorts").data("contrailGrid").getCheckedRows();
            deletePorts(selected_rows);
        }
    });

    btnCreatePortsCancel.click(function (a) {
        windowCreatePorts.hide();
    });

    btnCreatePortsOK.click(function (a) {
        if($(this).hasClass('disabled-link')) {
            return;
        }
        if (validate() !== true)
            return;
        
        if (txtPortName[0].disabled == true)
            mode = "edit";
        else
            mode = "add";

        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
            gridPorts.showGridMessage('errorGettingData');
            return;
        }

        var portConfig = {};
        
        portConfig["virtual-machine-interface"] = {};
        portConfig["virtual-machine-interface"]["parent_type"] = "project";
        portConfig["virtual-machine-interface"]["fq_name"] = [];
        portConfig["virtual-machine-interface"]["fq_name"][0] = selectedDomain;
        portConfig["virtual-machine-interface"]["fq_name"][1] = selectedProject;
        if(txtPortName.val().trim() != ""){
            portConfig["virtual-machine-interface"]["fq_name"][2] = txtPortName.val().trim();
            portConfig["virtual-machine-interface"]["display_name"] = txtPortName.val().trim();
            portConfig["virtual-machine-interface"]["name"] = txtPortName.val().trim();
        }
        portConfig["virtual-machine-interface"]["virtual_network_refs"] = [];
        portConfig["virtual-machine-interface"]["virtual_network_refs"][0] = {};
        var vnVal = $("#ddVN").data("contrailDropdown").value();
        vnVal = vnVal.split(":");
        portConfig["virtual-machine-interface"]["virtual_network_refs"][0]["to"] = vnVal;
                
        portConfig["virtual-machine-interface"]["id_perms"] = {};
        portConfig["virtual-machine-interface"]["id_perms"]["enable"] = JSON.parse($("#ddVNState").data("contrailDropdown").value());
        
        var deviceName =  $("#ddDeviceOwnerName").data("contrailDropdown").value();
        if(deviceName == "None"){
            portConfig["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "";
        } else if(deviceName == "router"){
            var deviceDetail = JSON.parse($("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").value());
            portConfig["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "network:router_interface";
            portConfig["virtual-machine-interface"]["logical_router_back_refs"] = [];
            portConfig["virtual-machine-interface"]["logical_router_back_refs"][0] = {};
            portConfig["virtual-machine-interface"]["logical_router_back_refs"][0]["to"] = deviceDetail[0]["to"];
            portConfig["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"] = deviceDetail[0]["uuid"];
        } else if(deviceName == "compute"){
            portConfig["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "compute:nova";
            portConfig["virtual-machine-interface"]["virtual_machine_refs"] = [];
            portConfig["virtual-machine-interface"]["virtual_machine_refs"][0] = {};
            var deviceuuidval = $("#ddDeviceOwnerUUID").data("contrailCombobox").value();
            if(IsJsonString(deviceuuidval)){
                var deviceDetail = JSON.parse(deviceuuidval);
                portConfig["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"] = deviceDetail[0]["uuid"];
                portConfig["virtual-machine-interface"]["virtual_machine_refs"][0]["to"] = deviceDetail[0]["to"];
            } else {
                portConfig["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"] = deviceuuidval;
            }
            
        }
        
        if(txtMacAddress.val().trim() != ""){
            portConfig["virtual-machine-interface"]["virtual_machine_interface_mac_addresses"] = {};
            portConfig["virtual-machine-interface"]["virtual_machine_interface_mac_addresses"]["mac_address"] = [];
            portConfig["virtual-machine-interface"]["virtual_machine_interface_mac_addresses"]["mac_address"][0] = txtMacAddress.val();
        }
        //security_group
        portConfig["virtual-machine-interface"]["security_group_refs"] = [];
        var msSGselectedData = $("#msSecurityGroup").data("contrailMultiselect").getSelectedData();
        if (msSGselectedData && msSGselectedData.length > 0) {
            for (var i = 0; i < msSGselectedData.length; i++) {
                var sgDta = (msSGselectedData[i].value).split(":");
                portConfig["virtual-machine-interface"]["security_group_refs"][i] = {};
                portConfig["virtual-machine-interface"]["security_group_refs"][i]["to"] = sgDta;
            }
        }
        
        //Fixed IP
        var allFixedIPTuples = $("#FixedIPTuples")[0].children;
        if (allFixedIPTuples && allFixedIPTuples.length > 0) {
            portConfig["virtual-machine-interface"]["instance_ip_back_refs"] = [];
            //portConfig["virtual-machine-interface"]["instance_ip_back_refs"][0] = {};
            //portConfig["virtual-machine-interface"]["instance_ip_back_refs"][0]["instance_ip_address"] = [];
            for(i = 0 ; i< allFixedIPTuples.length ; i++){
                var divid = allFixedIPTuples[i].id;
                var id = getID(divid);
                var cidrValue = JSON.parse($("#FixedIPTuples_"+id+"_ddFixedIPSubnet").data("contrailDropdown").value());
                var fixedIPValue = $("#FixedIPTuples_"+id+"_txtFixedIPValue").val();
                portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i] = {};
                portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["instance_ip_address"] = [];
                portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["instance_ip_address"][0] = {};
                portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["instance_ip_address"][0]["fixedIp"] = fixedIPValue;
                portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["instance_ip_address"][0]["domain"] = vnVal[0];
                portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["instance_ip_address"][0]["project"] = vnVal[1];
                portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["subnet_uuid"] = cidrValue["subnetUUID"];
                var subnetIP = cidrValue["subnetCIDR"].split("/")[0];
                if(isIPv4(subnetIP)){
                    portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["instance_ip_family"] = "v4";
                } else if(isIPv6(subnetIP)){
                    portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["instance_ip_family"] = "v6";
                }
                
                if(mode == "edit"){
                    portConfig["virtual-machine-interface"]["instance_ip_back_refs"][i]["uuid"] = cidrValue["fixedipuuid"];
                }
            }
        }
        
        // Floating IP
        var selectedFloatingIP = $("#msFloatingIp").data("contrailMultiselect").getSelectedData();
        if (selectedFloatingIP && selectedFloatingIP.length > 0) {
            portConfig["virtual-machine-interface"]["floating_ip_back_refs"] = [];
            for (var i = 0; i < selectedFloatingIP.length; i++) {
                for(var j=0;j< allfloatingIP.length;j++){
                    if(allfloatingIP[j]["uuid"] == selectedFloatingIP[i].value){
                        portConfig["virtual-machine-interface"]["floating_ip_back_refs"][i] = {};
                        portConfig["virtual-machine-interface"]["floating_ip_back_refs"][i]["to"] = allfloatingIP[j]["to"];
                        portConfig["virtual-machine-interface"]["floating_ip_back_refs"][i]["uuid"] = allfloatingIP[j]["uuid"];
                    }
                }
            }
        }
        /*
        var floatingIPElement = "FloatingIPTuples";
        var allFloatingIPTuples = $("#"+floatingIPElement)[0].children;
        if (allFloatingIPTuples && allFloatingIPTuples.length > 0) {
            portConfig["virtual-machine-interface"]["floating_ip_back_refs"] = [];
            for(i = 0 ; i< allFloatingIPTuples.length ; i++){
                var divid = allFloatingIPTuples[i].id;
                var id = getID(divid);
                var floatingIPValue = $("#"+floatingIPElement+"_"+id+"_ddFIP").data("contrailDropdown").value();
                floatingIPValue = JSON.parse(floatingIPValue);
                portConfig["virtual-machine-interface"]["floating_ip_back_refs"][i] = {};
                portConfig["virtual-machine-interface"]["floating_ip_back_refs"][i]["to"] = floatingIPValue[0]["to"];
                portConfig["virtual-machine-interface"]["floating_ip_back_refs"][i]["uuid"] = floatingIPValue[0]["uuid"];
            }
        }*/
        
        // Static Route
        var staticIPElement = "StaticRoutTuples";
        var allStaticIPTuples = $("#"+staticIPElement)[0].children;
        portConfig["virtual-machine-interface"]["interface_route_table_refs"] = [];
        if (allStaticIPTuples && allStaticIPTuples.length > 0) {
            portConfig["virtual-machine-interface"]["interface_route_table_refs"][0] = {};
            portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["sharedip"] = {};
            portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["sharedip"]["route"] = [];

            for(i = 0 ; i< allStaticIPTuples.length ; i++){
                var divid = allStaticIPTuples[i].id;
                var id = getID(divid);
                var staticIPValue = $("#"+staticIPElement+"_"+id+"_txtPrefix").val();
                var staticIPNextHop = $("#"+staticIPElement+"_"+id+"_txtNextHop").val();
                var staticIPData = $("#"+staticIPElement+"_"+id+"_SRdata").val();
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["sharedip"]["route"][i] = {};
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["sharedip"]["route"][i]["prefix"] = staticIPValue;
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["sharedip"]["route"][i]["next_hop"] = null;
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["sharedip"]["route"][i]["next_hop_type"] = null;
            }
            if(staticIPData != "" && staticIPData != null && staticIPData != undefined){
                staticIPData = JSON.parse(staticIPData);
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["to"] = staticIPData["to"];
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][0]["uuid"] = staticIPData["uuid"];
                
            }

        }
        
        
        
        //DHCP
        var dhcpElement = "DHCPTuples";
        var allDHCPTuples = $("#"+dhcpElement)[0].children;
        portConfig["virtual-machine-interface"]["virtual_machine_interface_dhcp_option_list"] = {};
        if (allDHCPTuples && allDHCPTuples.length > 0) {
            portConfig["virtual-machine-interface"]["virtual_machine_interface_dhcp_option_list"]["dhcp_option"] = [];
            var unGroupedDHCPOptionsList = [];
            for(i = 0 ; i< allDHCPTuples.length ; i++){
                var divid = allDHCPTuples[i].id;
                var id = getID(divid);
                var dhcpCode = $("#"+dhcpElement+"_"+id+"_txtDHCPCode").val();
                var dhcpValue = $("#"+dhcpElement+"_"+id+"_txtDHCPValue").val();
                unGroupedDHCPOptionsList[i] = {};
                unGroupedDHCPOptionsList[i]["dhcp_option_name"] = dhcpCode.trim();
                unGroupedDHCPOptionsList[i]["dhcp_option_value"] = dhcpValue.trim();

            }
            if(unGroupedDHCPOptionsList.length > 0) {
                var groupedDHCPOptionsList = groupBy(unGroupedDHCPOptionsList, function(item) {
                    return [item.dhcp_option_name];
                });
                if (groupedDHCPOptionsList && groupedDHCPOptionsList != "" && groupedDHCPOptionsList.length > 0) {
                    returnDHCPOptionsList = [];
                    for (var i = 0; i < groupedDHCPOptionsList.length; i++) {
                        var dhcpOptionsOfSameValue = jsonPath(groupedDHCPOptionsList[i], "$.*.dhcp_option_value");
                        if(dhcpOptionsOfSameValue === false)
                            dhcpOptionsOfSameValue = "";
                        else {
                            dhcpOptionsOfSameValue = dhcpOptionsOfSameValue.join(" ");
                        }
                        if(typeof dhcpOptionsOfSameValue === "string" && dhcpOptionsOfSameValue.trim() !== "") {
                            returnDHCPOptionsList.push({
                                "dhcp_option_name": groupedDHCPOptionsList[i][0]['dhcp_option_name'],
                                "dhcp_option_value": dhcpOptionsOfSameValue
                                });
                        }
                    }
                    if(returnDHCPOptionsList.length > 0)
                        portConfig["virtual-machine-interface"]["virtual_machine_interface_dhcp_option_list"]["dhcp_option"] = returnDHCPOptionsList;
                }
            }
        }
        
        //Subinterface
        portConfig["virtual-machine-interface"]["virtual_machine_interface_properties"] = {};
        portConfig["virtual-machine-interface"]["virtual_machine_interface_refs"] = [];
        if ($("#is_subInterface")[0].checked) {
            portConfig["virtual-machine-interface"]["virtual_machine_interface_properties"]["sub_interface_vlan_tag"] = Number($("#txtVlan").val().trim());
            portConfig["virtual-machine-interface"]["virtual_machine_interface_refs"][0] = JSON.parse($("#ddSubInterfaceParent").data("contrailDropdown").value());
        } else {
            if(selectedParentVMIObject.length > 0) {
                portConfig["virtual-machine-interface"]["virtual_machine_interface_refs"] = selectedParentVMIObject;
            }
        }
        
        
        //Allow Address Pair
        portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"] = {};
            var aapElement = "AAPTuples";
            var allaapTuples = $("#"+aapElement)[0].children;
            if (allaapTuples && allaapTuples.length > 0) {
                portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"] = {};
                portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"] = [];

                for(i = 0 ; i< allaapTuples.length ; i++){
                    var divid = allaapTuples[i].id;
                    var id = getID(divid);
                    var mac = $("#"+aapElement+"_"+id+"_txtAddAllowPairMAC").val();
                    var ip = $("#"+aapElement+"_"+id+"_txtAddAllowPairIP").val();
                    var prefix = 32;
                    portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"][i] = {};
                    if (mac.trim() != "") {
                        portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"][i]["mac"] = mac;
                    }
                    if(ip != ""){
                        portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"][i]["ip"] = {};
                        if(ip.split("/").length == 2) {
                            prefix = Number(ip.split("/")[1]);
                            ip = ip.split("/")[0];
                        }
                        portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"][i]["ip"]["ip_prefix"] = ip;
                        portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"][i]["ip"]["ip_prefix_len"] = prefix;
                    }
                    portConfig["virtual-machine-interface"]["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"][i]["address_mode"] = "active-standby";
                }
            }
        
        
        //console.log(JSON.stringify(portConfig));
        if (mode === "add") {
            doAjaxCall("/api/tenants/config/ports", "POST", JSON.stringify(portConfig),
                "createPortsSuccessCb", "createPortsFailureCb");
        }
        else if (mode === "edit") {
            var portUUID = jsonPath(configObj, "$.port[*][?(@.fq_name[2]=='" + txtPortName.val() + "')]")[0].uuid;
            portConfig["virtual-machine-interface"]["uuid"] = portUUID;
            doAjaxCall("/api/tenants/config/ports/" + portUUID, "PUT", JSON.stringify(portConfig),
                "createPortsSuccessCb", "createPortsFailureCb");
        }

        windowCreatePorts.modal("hide");
    });
}
/*
function appendPortsRuleEntry(who, defaultRow) {
    dynamicID += 1;
    var ruleEntry = createPortsRuleEntry(null, dynamicID, "sGRuleTuples",window.sgData);
    if (defaultRow) {
        $("#sGRuleTuples").prepend($(ruleEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(ruleEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreatePorts",ruleEntry,false);
}*/

function addNewItemMainDataSource(txt, data, selector, grpType) {
    var grpName = "SecurityGroup";
    if(grpType) {
        grpName = grpType;
    } else {
        grpName = getSelectedGroupName(selector);
    }
    var display = txt.split(':');
    if(display.length === 3) {
        display = display[2] + ' (' + display[0] + ':' + display[1] + ')';
    } else {
        display = display[0];
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

function verifyRASelectedItem(selTxt, dropDown, e, grpType) {
    if(!isItemExists(selTxt, dsSrcDest)) {
        addNewItemMainDataSource(selTxt, dsSrcDest, e, grpType);
        dropDown.setData(dsSrcDest);
        dropDown.value(selTxt);
        removeNewItemMainDataSource(selTxt, e, grpType);
    } else {
        dropDown.value(selTxt);
    }
}

function loadSelect2OpenActions() {
    var subEleArry = $(".select2-result-sub");
    if(subEleArry && subEleArry.length > 0) {
        $(subEleArry[0]).addClass('hide');
        $(subEleArry[2]).addClass('hide');
    }
    $('.select2-results').attr('style','max-height:400px;');
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

    var data = {results: []};
    var grpName = getSelectedGroupName();
    if(query.term != undefined && query.term != "") {
        data.results.push({ id : query.term, text : query.term, parent : grpName});
        this.data = [];
        $.extend(true, this.data, dsSrcDest);
        for(var i = 0; i < this.data.length;i++) {
            var children = [] ;
            $.extend(true, children, this.data[i].children);;
            for(var j = 0; j < children.length; j++) {
                if(children[j].text.indexOf(query.term) == -1 && children[j].disabled != true) {
                    var newIndex = getIndexOf(this.data[i].children, children[j].value);
                    this.data[i].children.splice(newIndex, 1);
                }
            }
            data.results.push(this.data[i]);
        }
        addNewTermDataSource(grpName, query.term, data.results);
    } else{
        data.results = dsSrcDest;
    }
    query.callback(data);
    //set focus for a searched item
    setFocusSelectedItem(grpName, query.term, data.results);

    //hide inbuilt select2 search results for custom term
    $('.select2-results > .select2-results-dept-0.select2-result-selectable').attr('style','display:none');

    var subEleArry = $(".select2-result-sub");
    if(subEleArry && subEleArry.length > 0) {
        $(subEleArry[0]).attr('style','max-height:150px;overflow:auto;');
        $(subEleArry[1]).attr('style','max-height:150px;overflow:auto;');
        $(subEleArry[2]).attr('style','max-height:150px;overflow:auto;');
    }
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
            case 'IPAddress' :
                subEle = $(subEleArry[1]);
                break;
            case 'MACAddress' :
               subEle = $(subEleArry[0]);
               break;
        }
        subEle.removeClass('hide');
    }
}

function getSelectedGroupName(selector) {
    var grpName = 'MACAddress';
    var element = ""//selector ? selector : $(".res-icon");
    if(selector != undefined  && selector != ""){
        var divAll = $("body").find("div[id*='"+$(selector)[0].id+"']");
        for(var i = 0;i < divAll.length; i++){
            if($(divAll[i]).find("."+iconPorts).length > 0) {
                grpName = 'IPAddress';
                return grpName;
            } else if($(divAll[i]).find("."+iconSubnet).length) {
                grpName = "MACAddress";
                return grpName;
            }
        }
    } else {
        element = $(".res-icon");
        if(element.hasClass(iconPorts)) {
            grpName = 'IPAddress';
        } else if(element.hasClass(iconSubnet)) {
            grpName = "MACAddress";
        }
    }
    return grpName;
}

function setSelectedGroupIcon(grpName) {
    var currentIcon = iconSubnet;
    switch(grpName) {
        case 'IPAddress' :
            currentIcon = iconPorts;
            break;
        case 'MACAddress' :
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
        case 'IPAddress' :
            fomattedTxt = '<i class="' + iconPorts + '"></i>' + ' ' + state.text;
            break;
        case 'MACAddress' :
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
        fetchProjects("populateProjects", "failureHandlerForgridPorts");
    } else {
        $("#gridPorts").data("contrailGrid")._dataView.setData([]);
        btnCreatePorts.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridPorts.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');
    }
}

function handleDomains(e) {
    //fetchDataForgridPorts();
    var dName = e.added.text;
    setCookie("domain", dName);
    fetchProjects("populateProjects", "failureHandlerForgridPorts");
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
        btnCreatePorts.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForgridPorts();
    } else {
        $("#gridPorts").data("contrailGrid")._dataView.setData([]);
        btnCreatePorts.addClass('disabled-link');
        var emptyObj = [{text:'No Projects found',value:"Message"}];
        $("#ddProjectSwitcher").data("contrailDropdown").setData(emptyObj);
        $("#ddProjectSwitcher").data("contrailDropdown").text(emptyObj[0].text);
        $("#ddProjectSwitcher").data("contrailDropdown").enable(false);
        gridPorts.showGridMessage("empty");
        emptyCookie('project');
    }
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForgridPorts();
}

function fetchDataForgridPorts() {
    $("#cb_gridPorts").attr("checked", false);
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridPorts.showGridMessage('errorGettingData');
        return;
    }

    $("#gridPorts").data("contrailGrid")._dataView.setData([]);
    idCount = 0;
    polAjaxcount++;
    configObj["port"] = [];
    gridPorts.showGridMessage('loading');
    var proid = $("#ddProjectSwitcher").data("contrailDropdown").value();
    ajaxParam = proid + "_" + polAjaxcount;
    doAjaxCall("/api/tenants/config/get-config-uuid-list?type=virtual-machine-interface&parentUUID="+proid,
        "GET", null, "successHandlerForAllPortUUIDGet", "failureHandlerForAllPortUUIDGet", null, ajaxParam);
}

function successHandlerForAllPortUUIDGet(allUUID, cbparam)
{
    if (cbparam != ajaxParam){
        return;
    }
    if (allUUID.length > 0) {
        var vmiUUIDObj = {};
        var sendUUIDArr = [];
        vmiUUIDObj.type = "virtual-machine-interface";
        sendUUIDArr = allUUID.slice(0, 50);
        vmiUUIDObj.uuidList = sendUUIDArr;
        //vmiUUIDObj.fields = ["floating_ip_pools"];
        allUUID = allUUID.slice(50, allUUID.length);
        var param = {};
        param.allUUID = allUUID;
        param.cbparam = cbparam;
        doAjaxCall("/api/tenants/config/get-virtual-machine-details-paged", "POST", JSON.stringify(vmiUUIDObj),
            "successHandlerForgridPorts", "failureHandlerForgridPorts", null, param);
    } else {
        $("#btnCreatePorts").removeClass('disabled-link');
        gridPorts.showGridMessage("empty");
    }
}

function failureHandlerForAllPortUUIDGet(result){
    $("#btnCreatePorts").removeClass('disabled-link');
    gridPorts.showGridMessage('errorGettingData');
}

function successHandlerForgridPorts(result , param) {
    var allUUID = param.allUUID;
    var cbparam = param.cbparam;
    if (cbparam != ajaxParam){
        return;
    }
    if(allUUID.length > 0) {
        var vmiUUIDObj = {};
        var sendUUIDArr = [];
        vmiUUIDObj.type = "virtual-machine-interface";
        sendUUIDArr = allUUID.slice(0, 200);
        vmiUUIDObj.uuidList = sendUUIDArr;
        //vmiUUIDObj.fields = ["floating_ip_pools"];
        allUUID = allUUID.slice(200, allUUID.length);
        var param = {};
        param.allUUID = allUUID;
        param.cbparam = cbparam;
        doAjaxCall("/api/tenants/config/get-virtual-machine-details-paged", "POST", JSON.stringify(vmiUUIDObj),
            "successHandlerForgridPorts", "failureHandlerForgridPorts", null, param);
    }
    gridPorts.showGridMessage('loading');
    successHandlerForgridPortsRow(result);
    if (allUUID.length <= 0) {
        gridPorts.removeGridMessage();
    }
}

function failureHandlerForgridPorts(result) {
    $("#btnCreatePorts").addClass('disabled-link');
    gridPorts.showGridMessage('errorGettingData');
}

function successHandlerForgridPortsRow(result) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var PortsData = $("#gridPorts").data("contrailGrid")._dataView.getItems();
    var Ports = result;
    if(Ports != undefined && Ports != null){
        for (var i = 0; i < Ports.length; i++) {
            if(Ports[i] != null && Ports[i] != undefined){
                var eachPorts = Ports[i]["virtual-machine-interface"];
                mapedData = mapVMIData(eachPorts,selectedDomain,selectedProject);
                configObj["port"].push(Ports[i]);
                PortsData.push({"id":idCount++,
                             "portName":mapedData.portName,
                             "portUUID":mapedData.portUUID,
                             "sgString":mapedData.sgString,
                             "sgMSValues":mapedData.sgMSValues,
                             "vnString":mapedData.vnString,
                             "vnValues":mapedData.vnValues,
                             "vnUUID":mapedData.vnUUID,
                             "status":mapedData.status,
                             "displayOwnerName": (mapedData.chiled === true) ?
                                 "Sub Interface" : mapedData.displayOwnerName,
                             "deviceOwner":mapedData.deviceOwner,
                             "deviceOwnerUUIDValue":mapedData.deviceOwnerUUIDValue,
                             "deviceOwnerValue":mapedData.deviceOwnerValue,
                             "devOwnerName":mapedData.devOwnerName,
                             "fixedip":mapedData.fixedip,
                             "fixedIPVal":mapedData.fixedIPVal,
                             "fixedIPValue":mapedData.fixedIPValue,
                             "floatingIP":mapedData.floatingIP,
                             "floatingIPVal":mapedData.floatingIPVal,
                             "floatingIPValue":mapedData.floatingIPValue,
                             "macAddress":mapedData.macAddress,
                             "AllowedAddressPair":mapedData.AllowedAddressPair,
                             "AllowedAddressPairValue":mapedData.AllowedAddressPairValue,
                             "DHCPOption":mapedData.DHCPOption,
                             "DHCPOptionValue":mapedData.DHCPOptionValue,
                             "staticIPString":mapedData.staticIPString,
                             "subInterfaceFlag":mapedData.subInterfaceFlag,
                             "staticIPValue":mapedData.staticIPValue,
                             "chiled":mapedData.chiled,
                             "parent":mapedData.parent,
                             "childrensUUID":mapedData.childrensUUID,
                             "subInterfaceVlan":mapedData.subInterfaceVlan,
                             "subInterfaceVMI":mapedData.subInterfaceVMI,
                             "subinterfaceUUID":mapedData.subinterfaceUUID,
                             "logicalInterfaceName":mapedData.logicalInterfaceName,
                             "vmiChildrenInterfaceObject":mapedData.vmiChildrenInterfaceObject,
                             //"tenentID":mapedData.tenentID,
                             "deviceID":mapedData.deviceID
                           });
            }
        }
    }
    var gridPageSize = $("#gridPorts").data("contrailGrid")._dataView.getPagingInfo().pageSize;
    if(!PortsData || PortsData.length<=0)
        gridPorts.showGridMessage('empty');
    $("#gridPorts").data("contrailGrid")._dataView.setData(PortsData);
}

function mapVMIData(portData,selectedDomain,selectedProject){
    var returnMapData = {};
    
    var portStatus = portData.id_perms.enable;
    if(String(portStatus) == "false"){
        portStatus = "Down";
    } else {
        portStatus = "Up";
    }
    var sgString = "";
    var sgMSValues = [];
    var sg = portData["security_group_refs"];
    if(sg != undefined && sg != null){
        var sgLength = sg.length;
        if(sgLength > 0){
            for(i = 0;i< sgLength;i++){
                if(sg[i]["to"][0] == selectedDomain && sg[i]["to"][1] == selectedProject){
                    sgStr = sg[i]["to"][sg[i]["to"].length-1];
                } else {
                    sgStr = sg[i]["to"][2] +" ("+ sg[i]["to"][0]+":"+sg[i]["to"][1]+")";
                }
                var sgValue = sg[i]["to"].join(":");
                sgMSValues.push(sgValue);
                if(sgString != "") sgString += ", ";
                sgString += sgStr;
            }
        }
    }
    var vn = portData["virtual_network_refs"];
    var vnLength = vn.length;
    var vnString = "";
    var vnUUID = "";
    var vnValues = [];
    if(vnLength > 0){
        for(i = 0;i< vnLength;i++){
            var vnStr = "";
            if(vn[i]["to"][0] == selectedDomain && vn[i]["to"][1] == selectedProject){
                vnStr = vn[i]["to"][vn[i]["to"].length-1];
            } else {
                vnStr = vn[i]["to"][2]+"("+vn[i]["to"][0]+":"+vn[i]["to"][1]+")";
            }
            var sgValue = vn[i]["to"].join(":");
            vnValues.push({"text":vnStr ,"values":sgValue});
            if(vnString != "") vnString += ", ";
            vnString += vnStr;
            vnUUID = vn[i]["uuid"];
        }
    }
    var fixedIPString = "";
    var fixedIPVal = [];
    var fixedIPValue = [];
    if(portData["instance_ip_back_refs"] != undefined && portData["instance_ip_back_refs"] != null){
        var fixedIP = portData["instance_ip_back_refs"];
        var fixedIPLength = fixedIP.length;
        if(fixedIPLength > 0){
            for(i = 0;i< fixedIPLength;i++){
                if(fixedIP[i]["fixedip"] !== undefined && fixedIP[i]["fixedip"] !== null &&
                   fixedIP[i]["fixedip"]["ip"] !== undefined && fixedIP[i]["fixedip"]["ip"] !== null){
                    if(fixedIPString != "") fixedIPString += ", ";
                    fixedIPString += fixedIP[i]["fixedip"]["ip"];
                    fixedIPValue.push({"fixedip":fixedIP[i]["fixedip"]["ip"],'subnetid':fixedIP[i]["fixedip"]["subnet_uuid"],'fixedipuuid':fixedIP[i]['uuid']});
                    fixedIPVal.push(fixedIP[i]["fixedip"]["ip"]);
                }
            }
        }
    }

    var floatingIPString = "";
    var floatingIPVal = [];
    var floatingIPValue = [];
    if(portData["floating_ip_back_refs"] != undefined && portData["floating_ip_back_refs"] != null){
        var floatingIP = portData["floating_ip_back_refs"];
        var floatingIPLength = floatingIP.length;
        if(floatingIPLength > 0){
            for(i = 0;i< floatingIPLength;i++){
                if(floatingIP[i]["floatingip"] !== undefined && floatingIP[i]["floatingip"] !== null &&
                   floatingIP[i]["floatingip"]["ip"] !== undefined && floatingIP[i]["floatingip"]["ip"] !== null){
                    if(floatingIPString != "") floatingIPString += ", ";
                    floatingIPString += floatingIP[i]["floatingip"]["ip"];
                    var val = floatingIP[i].uuid;
                    floatingIPValue.push(val);
                    floatingIPVal.push(floatingIP[i]["floatingip"]["ip"]);
                }
            }
        }
    }
    
    var DHCPOption = "";
    var DHCPOptionValue = [];
    if(portData["virtual_machine_interface_dhcp_option_list"] != undefined && portData["virtual_machine_interface_dhcp_option_list"] != null){
        if("dhcp_option" in portData["virtual_machine_interface_dhcp_option_list"] && portData["virtual_machine_interface_dhcp_option_list"]["dhcp_option"].length > 0){
        var DHCP = portData["virtual_machine_interface_dhcp_option_list"]["dhcp_option"];
        var DHCPLen = DHCP.length;
            for(var i = 0;i< DHCPLen;i++){
                var spaceSeperatedDhcpOptionValue = DHCP[i]["dhcp_option_value"].split(" ");
                for(var j=0; j<spaceSeperatedDhcpOptionValue.length; j++) {
                    if(DHCPOption != "") DHCPOption += ", ";
                    DHCPOption += DHCP[i]["dhcp_option_name"].trim() +":"+ spaceSeperatedDhcpOptionValue[j].trim();
                    DHCPOptionValue.push({"code":(DHCP[i]["dhcp_option_name"]).trim(),"value":spaceSeperatedDhcpOptionValue[j].trim()});
                }
            }
        }
    }
    
    var staticIPString = "";
    var staticIPValue = [];
    if(portData["interface_route_table_refs"] != undefined && portData["interface_route_table_refs"] != null){
        var staticIP = portData["interface_route_table_refs"];
        var fixedIPLength = staticIP.length;
        if(fixedIPLength > 0){
            for(i = 0;i< fixedIPLength;i++){
                if(staticIP[i]["sharedip"] !== undefined && staticIP[i]["sharedip"] !== null &&
                   staticIP[i]["sharedip"]["route"] !== undefined && staticIP[i]["sharedip"]["route"] !== null &&
                   staticIP[i]["sharedip"]["route"].length > 0){
                    for(var j = 0;j < staticIP[i]["sharedip"]["route"].length; j++){
                    
                        if(staticIPString != "") staticIPString += ", ";
                        staticIPString += staticIP[i]["sharedip"]["route"][j]["prefix"];
                        if(staticIP[i]["sharedip"]["route"][j]["next_hop"] != "" && staticIP[i]["sharedip"]["route"][j]["next_hop"] != null){
                            staticIPString += ":"+staticIP[i]["sharedip"]["route"][j]["next_hop"];
                        }
                        staticIPValue.push({"prefix":staticIP[i]["sharedip"]["route"][j]["prefix"],"nexthop":staticIP[i]["sharedip"]["route"][j]["next_hop"],"uuid":staticIP[i]["uuid"],"to":staticIP[i]["to"]});
                    }
                }
            }
        }
    }    
    
    var allowAddressPairText = "";
    var allowAddressPairValue = [];
    
    if("virtual_machine_interface_allowed_address_pairs" in portData && 
        portData["virtual_machine_interface_allowed_address_pairs"] != null &&
        portData["virtual_machine_interface_allowed_address_pairs"] != undefined &&
        'allowed_address_pair' in portData["virtual_machine_interface_allowed_address_pairs"] &&
        portData["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"].length > 0){
            
        var AAP = portData["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"];
        var AAPLen = AAP.length;
        if(AAPLen > 0){
            allowAddressPairText = "Enabled ";
        }
        for(var AAPinc = 0;AAPinc < AAPLen;AAPinc++){
            var address = "";
            if(("ip" in AAP[AAPinc]) &&
              ("ip_prefix" in AAP[AAPinc]["ip"]) &&
              (AAP[AAPinc]["ip"]["ip_prefix"] != undefined ) &&
              (AAP[AAPinc]["ip"]["ip_prefix"] != null )){
                address = AAP[AAPinc]["ip"]["ip_prefix"] +"/"+ AAP[AAPinc]["ip"]["ip_prefix_len"];
            }
            if(("mac" in AAP[AAPinc]) &&
              (AAP[AAPinc]["mac"] != "")){
                if((address) != "") address += ", "; 
                address += AAP[AAPinc]["mac"];
            }
            allowAddressPairText += "[" + address +"]";
            allowAddressPairValue.push(AAP[AAPinc]);
        }
    } else {
        allowAddressPairText = "Disabled";
    }
    
    var subInterfaceFlag = "Disabled";
    var chiled = false;
    var parent = false;
    var childrensUUID = "";
    var subInterfaceVlan = "-";
    var subInterfaceVMI = {};
    var subinterfaceUUID = "-";
    var vmiChildrenInterfaceObject = [];
    if("virtual_machine_interface_properties" in portData && 
       "sub_interface_vlan_tag" in portData["virtual_machine_interface_properties"]){
        subInterfaceVlan = portData["virtual_machine_interface_properties"]["sub_interface_vlan_tag"];
        
        if("virtual_machine_interface_refs" in portData){
            subInterfaceFlag =  "Enabled";
            chiled = true;
            subInterfaceVMI = {"uuid":portData["virtual_machine_interface_refs"][0]["uuid"],
                               "to":portData["virtual_machine_interface_refs"][0]["to"]};
            subinterfaceUUID = portData["virtual_machine_interface_refs"][0]["uuid"];
        }
    }
    
    if("virtual_machine_interface_refs" in portData && 
       (!("virtual_machine_interface_properties" in portData) ||
       !("sub_interface_vlan_tag" in portData["virtual_machine_interface_properties"] ))){
        parent = true;
        var len = portData["virtual_machine_interface_refs"].length-1;
        vmiChildrenInterfaceObject = portData["virtual_machine_interface_refs"];
        for(var i=0;i<=len;i++){
            if(childrensUUID != "") childrensUUID+="<br>&nbsp;&nbsp;";
            childrensUUID += portData["virtual_machine_interface_refs"][i]["uuid"];
        }
    }
    
    var macAddress = portData.virtual_machine_interface_mac_addresses.mac_address[0];
    
    var devOwner = portData.virtual_machine_interface_device_owner ? portData.virtual_machine_interface_device_owner : "";
    
    var deviceOwnerValue = "None";
    var deviceOwnerUUIDValue = "";
    var deviceOwnerUUID = "";
    var displayOwnerName = devOwner;
    var logicalInterfaceName = "";
    if(devOwner == "network:router_interface"){
            deviceOwnerValue = "router";
        if("logical_router_back_refs" in portData && portData["logical_router_back_refs"].length > 0 ){
            //devOwnerName = "Router";
            var deviceUUIDArr = [];
            deviceUUIDArr.push({"to":portData["logical_router_back_refs"][0]["to"],"uuid":portData["logical_router_back_refs"][0]["uuid"]});
            deviceOwnerUUIDValue = JSON.stringify(deviceUUIDArr);
            deviceOwnerUUID = portData["logical_router_back_refs"][0]["to"][2] + " (" + portData["logical_router_back_refs"][0]["uuid"] +")";
        }
    } else  if("compute" == devOwner.substring(0,7)){
        if("virtual_machine_refs" in portData && portData["virtual_machine_refs"].length >= 0 ){
            deviceOwnerValue = "compute";
            //devOwnerName = "Nova";
            var deviceUUIDArr = []
            deviceUUIDArr.push({"to":portData["virtual_machine_refs"][0]["to"],"uuid":portData["virtual_machine_refs"][0]["uuid"]});
            deviceOwnerUUIDValue = JSON.stringify(deviceUUIDArr);
            deviceOwnerUUID = portData["virtual_machine_refs"][0]["uuid"];
        }
    } else if ("logical_interface_back_refs" in portData) {
        displayOwnerName = "Logical Interface";
        var LILen = portData["logical_interface_back_refs"][0]["to"].length;
        logicalInterfaceName = portData["logical_interface_back_refs"][0]["to"][LILen-1];
    }
    
    //var tenentID = "";
    
    
    
    returnMapData.portName = portData['fq_name'][2];
    returnMapData.portUUID = portData.uuid;
    returnMapData.status = portStatus;
    returnMapData.deviceOwner = devOwner;
    returnMapData.displayOwnerName = displayOwnerName;
    returnMapData.deviceOwnerValue = deviceOwnerValue;
    returnMapData.deviceOwnerUUIDValue = deviceOwnerUUIDValue;
    returnMapData.sgString = sgString;
    returnMapData.sgMSValues = sgMSValues;
    returnMapData.vnString = vnString;
    returnMapData.vnUUID = vnUUID;
    returnMapData.vnValues = vnValues;
    returnMapData.fixedip = fixedIPString;
    returnMapData.fixedIPVal = fixedIPVal;
    returnMapData.fixedIPValue = fixedIPValue;
    returnMapData.floatingIP = floatingIPString;
    returnMapData.floatingIPVal = floatingIPVal;
    returnMapData.floatingIPValue = floatingIPValue;
    returnMapData.DHCPOption = DHCPOption;
    returnMapData.DHCPOptionValue = DHCPOptionValue;
    returnMapData.macAddress = macAddress;
    returnMapData.AllowedAddressPair = allowAddressPairText;
    returnMapData.AllowedAddressPairValue = allowAddressPairValue;
    returnMapData.staticIPString = staticIPString;
    returnMapData.staticIPValue = staticIPValue;
    returnMapData.subInterfaceFlag = subInterfaceFlag;
    returnMapData.chiled = chiled;
    returnMapData.parent = parent;
    returnMapData.childrensUUID = childrensUUID;
    returnMapData.vmiChildrenInterfaceObject = vmiChildrenInterfaceObject;
    returnMapData.subInterfaceVlan = subInterfaceVlan;
    returnMapData.subInterfaceVMI = subInterfaceVMI;
    returnMapData.subinterfaceUUID = subinterfaceUUID;
    returnMapData.logicalInterfaceName = logicalInterfaceName;

    //returnMapData.tenentID = tenentID; //need to find
    returnMapData.deviceID = deviceOwnerUUID;
    return returnMapData;
}
/*
function sgRuleFormat(text) {
    return '<span class="rule-format">' + text  + '</span>';
}*/

function setSubInterfaceProperties(e){
    //console.log(e);
    //var vmiData = JSON.stringify(e);
    
}

function updateSubnet(createFlag){
        var selectedFqname = $("#ddVN").data("contrailDropdown").value();
        var fqname;
        $("#FixedIPTuples").empty();
        for(var i = 0 ;i<allNetworkData.length;i++){
            fqname = allNetworkData[i]["virtual-network"]["fq_name"].join(":");
            if(fqname === selectedFqname){
                var subnet = allNetworkData[i]["virtual-network"]["network_ipam_refs"];
                if(subnet.length > 0){
                    currentVNSubnetDetail = [];
                    for(var subnetInc = 0; subnetInc < subnet.length; subnetInc++){
                        var subnetCIDR = subnet[subnetInc]["subnet"]["ipam_subnet"];
                        var subnetGateway = subnet[subnetInc]["subnet"]["default_gateway"];
                        var subnetUUID = subnet[subnetInc]["subnet"]["subnet_uuid"];
                        var SubnetVal = {};
                        SubnetVal.Gateway = subnetGateway;
                        SubnetVal.subnetCIDR = subnetCIDR;
                        SubnetVal.subnetUUID = subnetUUID;
                        currentVNSubnetDetail.push({"text" : subnetCIDR,"value":JSON.stringify(SubnetVal)});
                    }
                    $("#fixedipContainer").find('div.pull-left').removeClass('hide');
                    if(createFlag != false){
                        var element = "FixedIPTuples";
                        var FixedIPEntry = createFixedIPEntry(null, dynamicID++,element);
                        if(FixedIPEntry !== false)
                        $("#"+element).append(FixedIPEntry);
                        if (Number($("#"+element).children().length) >= currentVNSubnetDetail.length) {
                            $(".fixedipAdd").addClass("hide");
                        } else {
                            $(".fixedipAdd").removeClass("hide");
                        }
                    }
                } else {
                    $("#fixedipContainer").find('div.pull-left').addClass('hide');
                }
                break;
            } 
        }
}
function updateDevice(e){
//update
//ddDeviceOwnerUUID
    var selectedDeviceValue = $("#ddDeviceOwnerName").data("contrailDropdown").value();
    $("#ddDeviceOwnerUUID").data("contrailCombobox").setData([]);
    $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").setData([]);
    $("#divDeviceOwnerUUID").addClass("hide");
    $("#divDeviceOwnerUUIDRouter").addClass("hide");
    if(selectedDeviceValue != "None"){
        if(selectedDeviceValue == "router"){
            $("#divDeviceOwnerUUIDRouter").removeClass("hide");
            $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").setData(routerUUID);
            if(routerUUID.length > 0){
                $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").value(routerUUID[0].value);
            } else {
                $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").value([]);
            }
        } else if(selectedDeviceValue == "compute"){
            $("#divDeviceOwnerUUID").removeClass("hide");
            $("#ddDeviceOwnerUUID").data("contrailCombobox").setData(computeUUID);
            if(computeUUID.length > 0){
                $("#ddDeviceOwnerUUID").data("contrailCombobox").value(computeUUID[0].value);
            } else {
                $("#ddDeviceOwnerUUID").data("contrailCombobox").value([]);
            }
        }
    }
}

function failureHandlerForgridPortsRow(result, cbParam) {
    showInfoWindow("Error in getting Port data.", "Error");
    gridPorts.showGridMessage('errorGettingData');
}

function showRemoveWindow(rowIndex) {
$.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Port delete</h6>',
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
               var selected_row = $("#gridPorts").data("contrailGrid")._dataView.getItem(rowNum);
               deletePorts([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
}

function closeCreatePortsWindow() {
    clearValuesFromDomElements();
}

function clearValuesFromDomElements() {
    mode = "";
    $("#txtPortName").val("");
    $("#txtPortName").removeAttr("disabled","disabled");
    $("#txtMacAddress").removeAttr("disabled","disabled");
    $("#ddVN").removeAttr("disabled","disabled");
    $("#ddVNState").data("contrailDropdown").value("true");
    $("#FloatingIPTuples").empty();
    $("#FixedIPTuples").empty();
    $("#DHCPTuples").empty();
    $("#is_SG")[0].checked = true;
    $("#msSecurityGroup").data('contrailMultiselect').enable(true);
    $("#StaticRoutTuples").empty();
    $("#AAPTuples").empty();
    $("#txtMacAddress").val("");
    $("#txtVlan").val("");
    $("#ddDeviceOwnerName").data("contrailDropdown").value("None");
    $("#ddSubInterfaceParent").data('contrailDropdown').enable(true);
    $("#is_subInterface").attr("checked", false);
    $(".subInterface").addClass("hide");
    $("#ddDeviceOwnerName").removeAttr("disabled","disabled");
    $("#ddDeviceOwnerUUID").removeAttr("disabled","disabled");
    $("#ddDeviceOwnerUUIDRouter").removeAttr("disabled","disabled");
    updateDevice();

}

function showPortEditWindow(mode, rowIndex, enableSubInterfaceFlag) {
    if($("#btnCreatePorts").hasClass('disabled-link')) {
        return;
    }
    if(!isVCenter()) {
        $('#ddDeviceOwnerName').parents('.controls').parent().show();
    } else
        $('#ddDeviceOwnerName').parents('.controls').parent().hide();
    var selectedPortUUID = "";
    if (mode === "add") {
        windowCreatePorts.find('.modal-header-title').text('Create Port');
    } else {
        windowCreatePorts.find('.modal-header-title').text('Edit Port');
    }
    if(enableSubInterfaceFlag == "true" || mode == "edit") {
	    var mapedData = $("#gridPorts").data("contrailGrid")._dataView.getItem(rowIndex);
        selectedPortUUID = mapedData["portUUID"];
        vnUUID = mapedData["vnUUID"];
    }
    if(enableSubInterfaceFlag == "true") {
        windowCreatePorts.find('.modal-header-title').text('Add SubInterface to port ' + selectedPortUUID);
    }
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var selectedProjectVal = $("#ddProjectSwitcher").data("contrailDropdown").value();
    $("#btnCreatePortsOK").attr("disabled","disabled");
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridPorts.showGridMessage('errorGettingData');
        return;
    }
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
    url:"/api/tenants/config/securitygroup",
        timeout:300000,
    type:"GET"
    });
    if(mode === "add") {
        getAjaxs[1] = $.ajax({
            url:"/api/tenants/config/all-virtual-networks?uuid="+selectedProjectVal,
            timeout:300000,
            type:"GET"
            
        });
    } else {
        getAjaxs[1] = $.ajax({
            url:"/api/tenants/config/virtual-network/"+vnUUID,
            //url:"/api/tenants/config/all-virtual-networks-fields?vnuuid="+vnUUID,
            timeout:300000,
            type:"GET"
        });
    
    }
    getAjaxs[2] = $.ajax({
        url:"/api/tenants/config/floating-ips/"+selectedProjectVal,
        timeout:300000,
        type:"GET"
    });
    getAjaxs[3] = $.ajax({
        //url:"/api/admin/config/get-data?type=virtual-machine-interface&fqnUUID="+selectedProjectVal,
        url:"/api/tenants/config/get-virtual-machines-ips?uuid="+selectedProjectVal,
        timeout:300000,
        type:"GET"
    });
    getAjaxs[4] = $.ajax({
        url:"/api/tenants/config/list-logical-routers?projUUID="+selectedProjectVal,
        timeout:300000,
        type:"GET"
    });
    getAjaxs[6] = $.ajax({
        url:"/api/tenants/config/listVirtualMachines",
        timeout:300000,
        type:"GET"
    });


    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            clearValuesFromDomElements();
            var results = arguments;
            //Security Group
            var securityGroupsData = [];
            var allSG = [];
            var sgValue = [];
            $("#btnCreatePortsOK").removeAttr('disabled');
            securityGroupsData = results[0][0]["security-groups"];
            for (var i = 0; i < securityGroupsData.length; i++) {
                var sg = securityGroupsData[i];
                var fqname = sg["fq_name"];
                var fqNameValue = sg["fq_name"][0] + ":" + sg["fq_name"][1] + ":" + sg["fq_name"][2];
                if(fqname[0] === selectedDomain && fqname[1] === selectedProject) {
                    allSG.push({text : sg["fq_name"][2], value : fqNameValue});
                    if(sg["fq_name"][2].toLowerCase() == "default"){
                        sgValue.push(fqNameValue);
                    }
                }
            }
            //add other project Security Group at the end
            for(var i = 0; i < securityGroupsData.length; i++) {
                var sg = securityGroupsData[i];
                var fqname = sg["fq_name"];
                var domain = fqname[0];
                var project = fqname[1];
                if(domain !== selectedDomain || project !== selectedProject) {
                    var fqNameTxt = sg["fq_name"][2] +' (' + domain + ':' + project +')';
                    var fqNameValue = sg["fq_name"].join(":");
                    allSG.push({text : fqNameTxt, value : fqNameValue});
                }
            }
            msSecurityGroup.data("contrailMultiselect").setData(allSG);
            msSecurityGroup.data("contrailMultiselect").value(sgValue);

           //Network Network
            var allNetworks = [];
            allNetworkData = [];
            var localNetworks = [];
            if(typeof results[1][0].length == "undefined" && "virtual-network" in results[1][0]){
                localNetworks.push(results[1][0]);
                allNetworkData.push(results[1][0]);
            } else {
                if(results[1][0] != null && results[1][0] != "") {
                    localNetworks = results[1][0];
                    allNetworkData = results[1][0];
                }
            }
            for(var j=0;j < localNetworks.length;j++){
                var val="";
                var localNetwork = localNetworks[j]["virtual-network"];
                val = localNetwork["fq_name"].join(":");
                var networkText = "";
                if(localNetwork.fq_name[1] != selectedProject){
                    networkText = localNetwork.fq_name[2] +" ("+localNetwork.fq_name[0]+":"+localNetwork.fq_name[1]+")";
                } else {
                    networkText = localNetwork.fq_name[2];
                }
                allNetworks.push({'text':networkText,'value':val})
            }
            
            /*localNetworks = [];
            if(results[5][0] != null && results[5][0] != "" && results[5][0].length > 0) {
                localNetworks = results[5][0];
            }
            for(var j=0;j < localNetworks.length;j++){
                var val="";
                var localNetwork = localNetworks[j]["virtual-network"];
                allNetworkData.push(localNetworks[j]);
                val = localNetwork["fq_name"].join(":");
                var networkText = "";
                if(localNetwork.fq_name[1] != selectedProject){
                    networkText = localNetwork.fq_name[2] +" ("+localNetwork.fq_name[0]+":"+localNetwork.fq_name[1]+")";
                    allNetworks.push({'text':networkText,'value':val})
                }
            }*/
            $("#ddVN").data("contrailDropdown").setData(allNetworks);

            if(allNetworks.length > 0) {
                if(enableSubInterfaceFlag == "true"){
                    $("#ddVN").data("contrailDropdown").value(mapedData.vnValues[0]["values"]);
                } else {
                    $("#ddVN").data("contrailDropdown").value(allNetworks[0].value);
			    }
                updateSubnet();
            } else {
                //Disable port create and show a popup 
                windowCreatePorts.modal("hide");
                $("#ddVN").data("contrailDropdown").value("");
                showInfoWindow("No Network found", "Invalid Input");
                return false;
            }

            //Floating IP
            allfloatingIP = [];
            var allfloatingIPLocal = [];
            var localFloatingIP = [];
            if(results[2][0] != null && results[2][0] != "" && results[2][0]["floating_ip_back_refs"] && results[2][0]["floating_ip_back_refs"].length > 0) {
                localFloatingIP = results[2][0]["floating_ip_back_refs"];
            }
            for(var j=0;j < localFloatingIP.length;j++){
                var val="";
                var fip = localFloatingIP[j]["floating-ip"];
                val = fip.uuid;
                var fipText = "";
                if(fip.fq_name[1] != selectedProject){
                    //fipText = fip.floating_ip_address +" ["+ fip.fq_name[fip.fq_name.length-1] +" ("+fip.fq_name[0]+":"+fip.fq_name[1]+")]";
                    fipText = fip.floating_ip_address +" ["+ fip.fq_name[2] +":"+ fip.fq_name[3] +" ("+ fip.fq_name[0] +":"+ fip.fq_name[1] + ")]";
                } else {
                    //fipText = fip.floating_ip_address +" ["+ fip.fq_name[fip.fq_name.length-1]+"]";
                    fipText = fip.floating_ip_address +" ["+ fip.fq_name[2] +":"+ fip.fq_name[3]+"]";
                }
                allfloatingIP.push({"text":fipText,"to":fip.fq_name,"uuid":fip.uuid});
                allfloatingIPLocal.push({'text':fipText,'value':val});
            }
            
            msFloatingIp.data("contrailMultiselect").setData(allfloatingIPLocal);
            msFloatingIp.data("contrailMultiselect").value("");
            
            //Allow Address Pair and Device owner
            var vmiArray = [];
            var mainDS = [];
            routerUUID = [];
            computeUUID = [];
            var subnetValue = "";
            
            if(results[3][0] != null && results[3][0] != "" && results[3][0]["data"] && results[3][0]["data"].length > 0) {
                vmiArray = results[3][0]["data"];
            }
            var vmiArrayLen = vmiArray.length;
            var subInterfaceParentDatas = [];
            for(var j=0;j < vmiArrayLen;j++){
                var val="";
                var mac_text = "";
                var subInterfaceParentValObj = {};
                var subInterfaceParentText = "";
                if(vmiArray[j] != null && vmiArray[j] != undefined){
                
                    var ip = vmiArray[j]["virtual-machine-interface"];
                    if((ip.virtual_machine_interface_properties == null || 
                        (ip.virtual_machine_interface_properties != null && 
                        ip.virtual_machine_interface_properties.sub_interface_vlan_tag == null)) &&
                        (ip["virtual_network_refs"] != undefined && 
                             ip["virtual_network_refs"] != null &&
                             ip["virtual_network_refs"][0]["to"][1] == selectedProject) &&
                             ((selectedPortUUID != ip["uuid"]) || 
                              ((selectedPortUUID == ip["uuid"]) && enableSubInterfaceFlag == "true"))){

                        subInterfaceParentText += ip["uuid"] + "\xa0\xa0";
                        if(ip["instance_ip_back_refs"] != undefined &&
                            ip["instance_ip_back_refs"] != null && 
                            ip["instance_ip_back_refs"][0]["to"] != undefined &&
                            ip["instance_ip_back_refs"][0]["to"] != null){
                                subInterfaceParentValObj.instance_ip_back_refs = ip["instance_ip_back_refs"];
                                subInterfaceParentText += ip["instance_ip_back_refs"][0]["fixedip"]["ip"];
                        }
                        if(ip["virtual_machine_interface_mac_addresses"] != undefined &&
                            ip["virtual_machine_interface_mac_addresses"] != null && 
                            ip["virtual_machine_interface_mac_addresses"]["mac_address"] != undefined &&
                            ip["virtual_machine_interface_mac_addresses"]["mac_address"] != null){
                                if(ip["virtual_machine_interface_mac_addresses"]["mac_address"][0] != ""){
                                    subInterfaceParentValObj.mac_text = ip["virtual_machine_interface_mac_addresses"]["mac_address"][0];
                                    subInterfaceParentText += "\xa0\xa0[" + 
                                        ip["virtual_machine_interface_mac_addresses"]["mac_address"][0]
                                        + "]\xa0\xa0";
                                }
                            }
                        subInterfaceParentText +=
                            ip["virtual_network_refs"][0]["to"][2]; 

                        subInterfaceParentValObj.virtual_network_refs = ip["virtual_network_refs"][0]["to"];
                        var value = {"uuid":ip["uuid"],"to":ip["fq_name"]};
                        subInterfaceParentDatas.push({"text":subInterfaceParentText, "value":JSON.stringify(value)});
                        /*if(ip["virtual_machine_interface_device_owner"] == "compute:nova"){
                            //take it from VMR
                            if("virtual_machine_refs" in ip && ip["virtual_machine_refs"].length >=0){
                                var compute = ip["virtual_machine_refs"];
                                var text = compute[0]["to"][0];
                                var valArr = [];
                                valArr.push({"to":compute[0]["to"], "uuid":compute[0]["uuid"]});
                                computeUUID.push({"text":text,"value":JSON.stringify(valArr)});
                            }
                        }*/
                    }
                        if(ip["uuid"] == selectedPortUUID && enableSubInterfaceFlag == "true"){
                            var value = {"uuid":ip["uuid"],"to":ip["fq_name"]};
                            subnetValue = JSON.stringify(value);
                        }
                }
            }
            $("#ddSubInterfaceParent").data("contrailDropdown").setData(subInterfaceParentDatas);
            $("#is_subInterface").attr("disabled","disabled")
            $("#ddSubInterfaceParent").data("contrailDropdown").value("");
            if(subInterfaceParentDatas.length > 0) {
                $("#is_subInterface").removeAttr("disabled","disabled")
                //$("#ddSubInterfaceParent").data("contrailDropdown").value(subInterfaceParentDatas[0].value);
            }

            var vmArray = [];
            if(results[6][0] != null && results[6][0] != "" &&
               (null != results[6][0]['virtual-machines'])) {
                vmArray = results[6][0]['virtual-machines'];
            }
            var vmArrayLen = vmArray.length;
            for(var j=0;j < vmArrayLen;j++){
                var vm = vmArray[j];
                var text = vm["uuid"];
                var valArr = [];
                valArr.push({"to":vm["fq_name"], "uuid":vm["uuid"]});
                computeUUID.push({"text":text,"value":JSON.stringify(valArr)});
            }
            
            if(results[4][0] != null && results[4][0] != "" &&
               results[4][0]["logical-routers"] &&
               results[4][0]["logical-routers"].length > 0) {
                var logicalRouters = results[4][0]['logical-routers'];
                var logicalRoutersCnt = logicalRouters.length;
                for(var lrInc = 0; lrInc < logicalRoutersCnt; lrInc++){
                    // take it from logical router
                    var localLogicalRout = logicalRouters[lrInc];
                    var text = localLogicalRout["fq_name"][2] + " (" + localLogicalRout["uuid"] + ")";
                    var valArr = [];
                    valArr.push({"to":localLogicalRout["fq_name"], "uuid":localLogicalRout["uuid"]});
                    routerUUID.push({"text":text,"value":JSON.stringify(valArr)});
                }
            }
            
            if (mode === "add") {
                if(enableSubInterfaceFlag == "true") {
                    $("#is_subInterface").attr("checked", true);
                    $("#txtVlan").val("");
                    $("#ddSubInterfaceParent").data('contrailDropdown').enable(false);
                    $(".subInterface").removeClass("hide");
                    $("#ddSubInterfaceParent").data("contrailDropdown").value(subnetValue);
                    $(".AdvanceExpandBox").removeClass("collapsed");
                    $($($(".AdvanceExpandBox").find("i"))[0]).removeClass("icon-caret-right");
                    $($($(".AdvanceExpandBox").find("i"))[0]).addClass("icon-caret-down");
                    $(txtVlan).focus();
                } else {
                    $("#ddSubInterfaceParent").data('contrailDropdown').enable(true);
                    windowCreatePorts.find('.modal-header-title').text('Create Port');
                    $(txtPortName).focus();
                }
            } else if (mode === "edit") {
                var selectedVMI = null;
                for(var j=0;j < vmiArrayLen;j++){
                    var uuid = vmiArray[j]["virtual-machine-interface"]['uuid'];
                    if(uuid == selectedPortUUID){
                        selectedVMI = vmiArray[j]["virtual-machine-interface"];
                        break;
                    }
                }
                
                if(ip == null){
                    //No VIP available.
                }
                
                //var mapedData = mapVMIData(selectedVMI,selectedDomain,selectedProject);
                //var mapedData = $("#gridPorts").data("contrailGrid")._dataView.getItem(rowIndex);
                windowCreatePorts.find('.modal-header-title').text('Edit Port ' + mapedData.portName);

                // Not editable fields
                $("#txtPortName").attr("disabled","disabled");
                $("#ddVN").attr("disabled","disabled");
                $("#txtMacAddress").attr("disabled","disabled");
                
                //Assign edite values
                $("#txtPortName").val(mapedData.portName);
                $("#txtMacAddress").val(mapedData.macAddress);
                $("#ddVN").data("contrailDropdown").value(mapedData.vnValues[0]["values"]);

                if(mapedData.status == "Up"){
                    $("#ddVNState").data("contrailDropdown").value("true");
                } else {
                    $("#ddVNState").data("contrailDropdown").value("false");
                }
                
                if(mapedData.subInterfaceFlag == "Enabled"){
                    $("#is_subInterface").attr("checked", true);
                    $("#txtVlan").val(mapedData.subInterfaceVlan);
                    $("#ddSubInterfaceParent").data("contrailDropdown").value(JSON.stringify(mapedData.subInterfaceVMI));
                    $("#ddSubInterfaceParent").data('contrailDropdown').enable(false);
                    $(".subInterface").removeClass("hide");
                    selectedParentVMIObject = [];
                } else {
                    $("#is_subInterface").attr("checked", false);
                    $(".subInterface").addClass("hide");
                    selectedParentVMIObject = mapedData.vmiChildrenInterfaceObject;
                }
                
                if(mapedData.displayOwnerName === "Logical Interface"){
                    $("#is_subInterface").attr("checked", false);
                    $(".subInterface").addClass("hide");
                    $("#is_subInterface").attr("disabled","disabled");
                    $("#ddDeviceOwnerName").data("contrailDropdown").value("None");
                    $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").setData([]);
                    $("#ddDeviceOwnerName").attr("disabled","disabled");
                }
                if(!isVCenter()) {
                    $("#ddDeviceOwnerName").data("contrailDropdown").value(mapedData.deviceOwnerValue);
                    updateDevice();
                    if(mapedData.deviceOwnerValue == "compute") {
                        $("#ddDeviceOwnerUUID").data("contrailCombobox").value(mapedData.deviceOwnerUUIDValue);
                    } else if(mapedData.deviceOwnerValue == "router") {
                        $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").value(mapedData.deviceOwnerUUIDValue);
                    }
                }
                if(mapedData.sgMSValues.length > 0){
                    $("#is_SG")[0].checked = true;
                    $("#msSecurityGroup").data('contrailMultiselect').enable(true);
                    $("#msSecurityGroup").data("contrailMultiselect").value(mapedData.sgMSValues);
                } else {
                    $("#is_SG")[0].checked = false;
                    $("#msSecurityGroup").data('contrailMultiselect').enable(false);
                    $("#msSecurityGroup").data("contrailMultiselect").value("");
                }
                
                var element = "FixedIPTuples";
                updateSubnet(false);
                $("#"+element).empty();
                    for(var localInc = 0; localInc < mapedData.fixedIPValue.length;localInc++){
                        dynamicID++;
                        var FixedIPEntry = createFixedIPEntry(mapedData.fixedIPValue[localInc], dynamicID,element);
                        if(FixedIPEntry !== false)
                        $("#"+element).append(FixedIPEntry);
                    }
                    if (Number($("#"+element).children().length) >= currentVNSubnetDetail.length) {
                        $(".fixedipAdd").addClass("hide");
                    }
                var floatingIPArr = [];
                //element = "FloatingIPTuples";
                for(var localInc = 0; localInc < mapedData.floatingIPValue.length;localInc++){
                    floatingIPArr.push(mapedData.floatingIPValue[localInc]);
                    /*dynamicID++;
                    var FloatingIPEntry = createFloatingIPEntry(mapedData.floatingIPValue[localInc], dynamicID,element);
                    $("#"+element).append(FloatingIPEntry);*/
                }
                $("#msFloatingIp").data("contrailMultiselect").value(floatingIPArr);
                
                element = "DHCPTuples";
                if(mapedData.DHCPOption != null && mapedData.DHCPOption != ""){
                    var dhcpOption = mapedData.DHCPOption.split(", ");
                    for(var localInc = 0; localInc < dhcpOption.length;localInc++){
                        var codeVal = dhcpOption[localInc].split(":");
                        dynamicID++;
                        var DHCPEntry = createDHCPEntry(codeVal, dynamicID,element);
                        $("#"+element).append(DHCPEntry);
                    }
                }
                
                element = "StaticRoutTuples";
                if(mapedData.staticIPValue != null && mapedData.staticIPValue != "" && mapedData.staticIPValue.length > 0){
                    var staticRoutLength = mapedData.staticIPValue.length;
                    for(var localInc = 0; localInc < staticRoutLength;localInc++){
                        var staticIp = mapedData.staticIPValue[localInc];
                        dynamicID++;
                        var staticRourEntry = createstaticRouteEntry(staticIp, dynamicID,element);
                        $("#"+element).append(staticRourEntry);
                    }
                }
                
                //returnMapData.staticIPString = staticIPString;
                //returnMapData.staticIPValue = staticIPValue;
        /*element = "StaticRoutTuples";
        var allStaticIPTuples = $("#"+staticIPElement)[0].children;
        if (allStaticIPTuples && allStaticIPTuples.length > 0) {
            portConfig["virtual-machine-interface"]["interface_route_table_refs"] = [];
            for(i = 0 ; i< allStaticIPTuples.length ; i++){
                var divid = allStaticIPTuples[i].id;
                var id = getID(divid);
                var staticIPValue = $("#"+staticIPElement+"_"+id+"_txtPrefix").val();
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][i] = {};
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][i]["sharedip"] = {};
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][i]["sharedip"]["route"] = [];
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][i]["sharedip"]["route"][0] = {};
                portConfig["virtual-machine-interface"]["interface_route_table_refs"][i]["sharedip"]["route"][0]["prefix"] = staticIPValue;
            }
        }*/

                
                if(mapedData.AllowedAddressPair == "Disabled"){
                } else {
                    if(mapedData.AllowedAddressPairValue.length > 0){
                        for(var AAPinc = 0; AAPinc < mapedData.AllowedAddressPairValue.length; AAPinc++){
                            dynamicID++;
                            var element = "AAPTuples";
                            var AAPEntry = appendAAPEntry(null,element,true,mapedData.AllowedAddressPairValue[AAPinc]);
                            $("#"+element).append($(AAPEntry));
                        }
                    }
                   //$(ddAAP).data("contrailDropdown").value(mapedData.AllowedAddressPairValue);
                   //verifyRASelectedItem(mapedData.AllowedAddressPairValue, $("#ddAAP").data("contrailDropdown"), "", mapedData.allowAddressPairType);
                }
                
            }
        },
        function () {
            //If atleast one api fails
            var results = arguments;
            $("#btnCreatePortsOK").removeAttr('disabled');
            windowCreatePorts.modal('hide');
            showInfoWindow("Error fetching data", "Error");
        });
    windowCreatePorts.modal("show");
    windowCreatePorts.find('.modal-body').scrollTop(0);
}

function createPortsSuccessCb() {
    gridPorts.showGridMessage('loading');
    fetchDataForgridPorts();
}

function createPortsFailureCb() {
    gridPorts.showGridMessage('loading');
    fetchDataForgridPorts();
}

function successHandlerForDeleteAll(res) {
    fetchDataForgridPorts();
}

function failureHandlerForDeleteAll(err) {
    fetchDataForgridPorts();
}

function validate() {
    var macText = txtMacAddress.val().trim();
    if(macText != ""){
        if(isValidMACAddress(macText) == false){
            showInfoWindow("Enter valid MAC Address", "Invalid Input");
            return false;
        }
    }
    if(!validateFixedIP("FixedIPTuples")) return false;
    if(!validateAAP("AAPTuples")) return false;
    if(!validateStaticRoute("StaticRoutTuples")) return false;
    if(!validateDHCP("DHCPTuples")) return false;
    var selectedFloatingIP = $("#msFloatingIp").data("contrailMultiselect").getSelectedData();
    var deviceName =  $("#ddDeviceOwnerName").data("contrailDropdown").value();
    if (selectedFloatingIP && selectedFloatingIP.length > 0 && deviceName == "router"){
        showInfoWindow("Floating Ip cannot be assigned to Router port", "Invalid Input");
        return false;
    }
    
    var deviceUUID = $("#ddDeviceOwnerUUID").data("contrailCombobox").text();
    if(deviceName == "compute" && ("" == deviceUUID ||  null == deviceUUID  || typeof deviceUUID == "undefined")){
        showInfoWindow("Device Owner UUID cannot be empty.", "Invalid Input");
        return false
    }
    var deviceUUIDRouter = $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown").value();
    if(deviceName == "router" && ("" == deviceUUIDRouter ||  null == deviceUUIDRouter  || typeof deviceUUIDRouter == "undefined")){
        showInfoWindow("Device Owner UUID cannot be empty.", "Invalid Input");
        return false
    }
    if(deviceName == "compute" && $("#is_subInterface")[0].checked){
        showInfoWindow("Subinterface cannot be assigned along with Compute Device Owner.", "Invalid Input");
        return false
    }
    if ($("#is_subInterface")[0].checked) {
        if(!isNumber($("#txtVlan").val().trim())){
            showInfoWindow("VLAN has to be a number.", "Invalid Input");
            return false
        }
        var vlanVal = Number($("#txtVlan").val().trim());
        if(vlanVal < 1 || vlanVal > 4094 ){
            showInfoWindow("VLAN has to be between 1 to 4094", "Invalid Input");
            return false
        }
        var subInterfaceVal = $("#ddSubInterfaceParent").data("contrailDropdown").value();
        if(subInterfaceVal.trim() == "" ){
            showInfoWindow("Sub Interface cannot be empty.", "Invalid Input");
            return false
        }
    }
    return true;
}

/////////////////////////////////////////////////////
//////////////////DHCP option////////////////////////
/////////////////////////////////////////////////////
function appendDHCPEntry(who,element, defaultRow) {
    if(validateDHCP(element) === false)
        return false;
    dynamicID++;
    var DHCPEntry = createDHCPEntry(null, dynamicID,element);
    if (defaultRow) {
        $("#"+element).prepend($(DHCPEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(DHCPEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreatePorts",DHCPEntry,false);
}

function createDHCPEntry(DHCPData, id,element) {
    var inputTxtDHCPCode = document.createElement("input");
    inputTxtDHCPCode.type = "text";
    inputTxtDHCPCode.className = "span12";
    inputTxtDHCPCode.setAttribute("placeholder", "Option code");
    inputTxtDHCPCode.setAttribute("id", element+"_"+id+"_txtDHCPCode");
    var divDHCPName = document.createElement("div");
    divDHCPName.className = "span5";
    divDHCPName.appendChild(inputTxtDHCPCode);
    
    var inputTxtDHCPValue = document.createElement("input");
    inputTxtDHCPValue.type = "text";
    inputTxtDHCPValue.className = "span12";
    inputTxtDHCPValue.setAttribute("placeholder", "Option value");
    inputTxtDHCPValue.setAttribute("id", element+"_"+id+"_txtDHCPValue");
    var divDHCPCode = document.createElement("div");
    divDHCPCode.className = "span5";
    divDHCPCode.appendChild(inputTxtDHCPValue);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendDHCPEntry(this,'"+element+"');");
    iBtnAddRule.setAttribute("title", "Add DHCP Options below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteDHCPEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete DHCP Options");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5 span10";
    divRowFluidMargin5.appendChild(divDHCPName);
    divRowFluidMargin5.appendChild(divDHCPCode);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = element + "_" + id;
    rootDiv.className = "span12 margin-0-0-5";
    rootDiv.appendChild(divRowFluidMargin5);

    if (null !== DHCPData && typeof DHCPData !== "undefined" && DHCPData.length > 1) {
        $(inputTxtDHCPCode).val(DHCPData[0]);
        $(inputTxtDHCPValue).val(DHCPData[1]);
    }
    return rootDiv;
}

function deleteDHCPEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function validateDHCP(element){
    var len = $("#"+element).children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var elementid = getID($("#"+element).children()[i].id);
            var DHCPCode = $("#"+element +"_"+ elementid +"_txtDHCPCode").val();
            if (typeof DHCPCode === "undefined" || DHCPCode.trim() === "") {
                showInfoWindow("Enter DHCP Code", "Input required");
                return false;
            }
            var DHCPValue = $("#"+element +"_"+ elementid +"_txtDHCPValue").val();
            if (typeof DHCPValue === "undefined" || DHCPValue.trim() === "") {
                showInfoWindow("Enter DHCP Value", "Input required");
                return false;
            }
        }
    }
    return true;
}
////////End of DHCP///////////////////////////

/////////////////////////////////////////////////////
//////////////////FixedIP option////////////////////////
/////////////////////////////////////////////////////
function appendFixedIPEntry(who,element, defaultRow) {
    if(validateFixedIP(element) === false)
        return false;
    dynamicID++;
    var FixedIPEntry = createFixedIPEntry(null, dynamicID,element);
    if(FixedIPEntry === false)
        return false;
    if (defaultRow) {
        $("#"+element).prepend($(FixedIPEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(FixedIPEntry, parentEl.nextSibling);
    }
    if (Number($("#"+element).children().length) >= currentVNSubnetDetail.length) {
        $(".fixedipAdd").addClass("hide");
    }
    scrollUp("#windowCreatePorts",FixedIPEntry,false);
}

function createFixedIPEntry(FixedIPData, id,element) {
    var ddFixedIPSubnet = document.createElement("div");
    ddFixedIPSubnet.className = "span12";
    ddFixedIPSubnet.setAttribute("placeholder", "Subnet");
    ddFixedIPSubnet.setAttribute("id", element+"_"+id+"_ddFixedIPSubnet");
    var divFixedIPName = document.createElement("div");
    divFixedIPName.className = "span5";
    var divFixedIPcontainer = document.createElement("div");
    divFixedIPcontainer.appendChild(ddFixedIPSubnet);
    divFixedIPName.appendChild(divFixedIPcontainer);
    
    var inputTxtFixedIPValue = document.createElement("input");
    inputTxtFixedIPValue.type = "text";
    inputTxtFixedIPValue.className = "span12";
    inputTxtFixedIPValue.setAttribute("placeholder", "Fixed IP");
    inputTxtFixedIPValue.setAttribute("id", element+"_"+id+"_txtFixedIPValue");
    var divFixedIPCode = document.createElement("div");
    divFixedIPCode.className = "span5";
    divFixedIPCode.appendChild(inputTxtFixedIPValue);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus fixedipAdd";
    iBtnAddRule.setAttribute("onclick", "appendFixedIPEntry(this,'"+element+"');");
    iBtnAddRule.setAttribute("title", "Add Fixed IP below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus fixedipRemove";
    iBtnDeleteRule.setAttribute("onclick", "deleteFixedIPEntry(this, '"+element+"');");
    iBtnDeleteRule.setAttribute("title", "Delete Fixed IP");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5 span10";
    divRowFluidMargin5.appendChild(divFixedIPName);
    divRowFluidMargin5.appendChild(divFixedIPCode);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = element + "_" + id;
    rootDiv.className = "span12 margin-0-0-5";
    rootDiv.appendChild(divRowFluidMargin5);
    
    $(ddFixedIPSubnet).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        placeholder: "Subnet",
        change:changeSubnetIP
    });

    var subnetData = [];
    var selectedFqname = $("#ddVN").data("contrailDropdown").value();
    //subnetData = getCurrentSubnetData(selectedFqname);
    subnetData = currentVNSubnetDetail.slice();
    $(inputTxtFixedIPValue).val("");
    $(ddFixedIPSubnet).data("contrailDropdown").setData(subnetData);
    if(subnetData.length > 0){
        if(subnetData.length === 1) {
            $(iBtnAddRule).addClass('hide');
            $("#fixedipContainer").find('div.pull-left').addClass('hide');
        }
            var allSubnets = clone(subnetData);
            var len = $("#"+element).children().length;
            if(len > 0) {
                var fixedIPs = [];
                for(var i=0; i<len; i++) {
                    var elementid = getID($("#"+element).children()[i].id);
                    var fixedIP = $("#"+element +"_"+ elementid +"_ddFixedIPSubnet").data('contrailDropdown').text();
                    fixedIPs.push(fixedIP);
                }

                var fipObjs = {};
                for(var i=0; i<fixedIPs.length; i++) {
                    if(fipObjs.hasOwnProperty(fixedIPs[i])) {
                        showInfoWindow("Only one Fixed IP can be assigned to a subnet. Select a different subnet.", "Duplicate subnet");
                        return false;
                    } else {
                        fipObjs[fixedIPs[i]]=0;
                    }
                }
                for(var i=0; i<fixedIPs.length; i++) {
                    var fixedIP = fixedIPs[i];
                    for(var j=0; j<allSubnets.length; j++) {
                        if(fixedIP === allSubnets[j].text) {
                            allSubnets.splice(j, 1);
                            break;
                        }
                    }
                }
            }
            if(allSubnets.length > 0)
                $(ddFixedIPSubnet).data("contrailDropdown").value(allSubnets[0].value);
            else {
                showInfoWindow("Fixed IPs from all subnets are entered already.", "Invalid Input");
                return false;
            }
    }

    if (null !== FixedIPData && typeof FixedIPData !== "undefined") {
        var SubnetVal = {};
        SubnetVal.Gateway = "";
        SubnetVal.subnetUUID = FixedIPData.subnetid;
        SubnetVal.fixedipuuid = FixedIPData.fixedipuuid;
        SubnetVal.subnetCIDR = "";
        subnetData.push({"text" : FixedIPData.fixedip , "value":JSON.stringify(SubnetVal)});
        $(divFixedIPcontainer).addClass("hide");
        $(inputTxtFixedIPValue).val(FixedIPData.fixedip);
        $(inputTxtFixedIPValue).attr("disabled","disabled");
        $(ddFixedIPSubnet).attr("disabled","disabled");
        $(ddFixedIPSubnet).data("contrailDropdown").setData(subnetData);
        $(ddFixedIPSubnet).data("contrailDropdown").value(JSON.stringify(SubnetVal));
    }
    return rootDiv;
}

function getCurrentSubnetData(selectedFqname){
    var fqname;
    var subnetData = [];
    for(var i = 0 ;i<allNetworkData.length;i++){
        fqname = allNetworkData[i]["virtual-network"]["fq_name"].join(":");
        if(fqname === selectedFqname){
            var subnet = allNetworkData[i]["virtual-network"]["network_ipam_refs"];
            if(subnet.length > 0){
                for(var subnetInc = 0; subnetInc < subnet.length; subnetInc++){
                    var subnetCIDR = subnet[subnetInc]["subnet"]["ipam_subnet"];
                    var subnetGateway = subnet[subnetInc]["subnet"]["default_gateway"];
                    var subnetUUID = subnet[subnetInc]["subnet"]["subnet_uuid"];
                    var SubnetVal = {};
                    SubnetVal.Gateway = subnetGateway;
                    SubnetVal.subnetCIDR = subnetCIDR;
                    SubnetVal.subnetUUID = subnetUUID;
                    subnetData.push({"text" : subnetCIDR,"value":JSON.stringify(SubnetVal)});
                }
            }
            break;
        }
    }
    return subnetData;
}

function deleteFixedIPEntry(who, element) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
    $("#fixedipContainer").find('div.pull-left').removeClass('hide');
    if (Number($("#"+element).children().length) < currentVNSubnetDetail.length) {
        $(".fixedipAdd").removeClass("hide");
    }
}

function validateFixedIP(element){
    var fixedIPTexts = [];
    var len = $("#"+element).children().length;
    var fipObjs = {};
    var enteredSubnetUUIDs = [];
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var elementid = getID($("#"+element).children()[i].id);
            var fixedIP = $("#"+element +"_"+ elementid +"_txtFixedIPValue").val();
            var fixedIPText = $("#"+element +"_"+ elementid +"_ddFixedIPSubnet").data('contrailDropdown').text();
            var fixedIPValue = $("#"+element +"_"+ elementid +"_ddFixedIPSubnet").data('contrailDropdown').value();
            var fixedIPValueObj = JSON.parse(fixedIPValue)
            //fixedIPValueObj.subnetUUID = "";
            if(fixedIPValueObj.subnetUUID != "" && fixedIPValueObj.subnetUUID != undefined && fixedIPValueObj.subnetUUID != null) {
                if(enteredSubnetUUIDs.hasOwnProperty(fixedIPValueObj.subnetUUID)){
                    showInfoWindow("Only one Fixed IP can be assigned to a subnet. Select a different subnet.", "Duplicate subnet");
                    return false;
                } else {
                    enteredSubnetUUIDs[fixedIPValueObj.subnetUUID] = 0;
                }
            } else {
                var subnetresult = findSubnetUUIDFromIP(fixedIP);
                if(subnetresult.error == false){
                    enteredSubnetUUIDs[subnetresult.uuid] = 0;
                } else {
                    showInfoWindow("Only one Fixed IP can be assigned to a subnet. Select a different subnet.", "Duplicate subnet");
                    return false;
                }
            }
            if (typeof fixedIP === "string" && fixedIP.trim().length > 0) {
                if(!isValidIP(fixedIP.trim())) {
                   showInfoWindow("Enter a valid IP In the format xxx.xxx.xxx.xxx", "Invalid input in Fixed IP");
                    return false;
                }
                if(fixedIP.split("/").length > 1) {
                    showInfoWindow("Enter a valid IP In the format xxx.xxx.xxx.xxx", "Invalid input in Fixed IP");
                    return false;
                }
                var editable = $("#"+element +"_"+ elementid +"_txtFixedIPValue")[0].disabled;
                if(editable == false){
                if(!isIPBoundToRange(fixedIPText,fixedIP.trim())){
                    showInfoWindow("Enter a fixed IP within the selected subnet range", "Invalid input in Fixed IP");
                    return false;
                }
                if(isStartAddress(fixedIPText, fixedIP.trim()) == true || isEndAddress(fixedIPText, fixedIP.trim()) == true) {
                    showInfoWindow("Fixed IP cannot be same as broadcast/start address", "Invalid input in Fixed IP");
                    return false;
                }
                }
                fixedIPTexts.push(fixedIPText);
            }
        }
        for(var i=0; i<fixedIPTexts.length; i++) {
            if(fipObjs.hasOwnProperty(fixedIPTexts[i])) {
                showInfoWindow("Only one Fixed IP can be assigned to a subnet. Select a different subnet.", "Duplicate subnet");
                return false;
            } else {
                fipObjs[fixedIPTexts[i]]=0;
            }
        }
    }
    return true;
}

function findSubnetUUIDFromIP(fixedIp){
    var subnetUUID = {};
    subnetUUID.error = true;
    for(var i=0; i < currentVNSubnetDetail.length; i++) {
        var eachSubnet = JSON.parse(currentVNSubnetDetail[i].value);
        if (isIPBoundToRange(eachSubnet.subnetCIDR, fixedIp)) {
            subnetUUID.error = false;
            subnetUUID.uuid = eachSubnet.subnetUUID;
            break;
        }
    }
    return subnetUUID;
}
function changeSubnetIP(e){
    var value = e.val;
    var id = getID(e.target.id);
    $("#FixedIPTuples_"+id+"_txtFixedIPValue").val("");
}
////////End of FixedIP///////////////////////////

/////////////////////////////////////////////////////
//////////////////Allow Address pair////////////////////////
/////////////////////////////////////////////////////
function appendAAPEntry(who,element, defaultRow,data) {
    if(validateAAP(element) === false)
        return false;
    dynamicID++;
    var AAPEntry = createAAPEntry(data, dynamicID,element);
    if (defaultRow) {
        $("#"+element).append($(AAPEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(AAPEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreatePorts",AAPEntry,false);
}

function createAAPEntry(AAPData, id,element) {
    var txtAddAllowPairIP = document.createElement("input");
    txtAddAllowPairIP.type = "text";
    txtAddAllowPairIP.className = "span12";
    txtAddAllowPairIP.setAttribute("placeholder", "IP");
    txtAddAllowPairIP.setAttribute("id", element+"_"+id+"_txtAddAllowPairIP");
    var divFixedIPName = document.createElement("div");
    divFixedIPName.className = "span5";
    divFixedIPName.appendChild(txtAddAllowPairIP);
    
    var txtAddAllowPairMAC = document.createElement("input");
    txtAddAllowPairMAC.type = "text";
    txtAddAllowPairMAC.className = "span12";
    txtAddAllowPairMAC.setAttribute("placeholder", "MAC");
    txtAddAllowPairMAC.setAttribute("id", element+"_"+id+"_txtAddAllowPairMAC");
    var divFixedIPCode = document.createElement("div");
    divFixedIPCode.className = "span5";
    divFixedIPCode.appendChild(txtAddAllowPairMAC);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendAAPEntry(this,'"+element+"');");
    iBtnAddRule.setAttribute("title", "Add Allowed address pairs below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteAAPEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Allowed address pairs");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5 span10";
    divRowFluidMargin5.appendChild(divFixedIPName);
    divRowFluidMargin5.appendChild(divFixedIPCode);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = element + "_" + id;
    rootDiv.className = "span12 margin-0-0-5";
    rootDiv.appendChild(divRowFluidMargin5);
    
    /*$(txtAddAllowPairIP).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        placeholder: "Select IP",
    });
    
    $(txtAddAllowPairMAC).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        placeholder: "Select MAC",
    });

    $(txtAddAllowPairIP).data("contrailDropdown").setData(ip_address);
    $(txtAddAllowPairMAC).data("contrailDropdown").setData(mac_address);
    */
    
    if (null !== AAPData && typeof AAPData !== "undefined") {
        if("mac" in (AAPData)){
            $(txtAddAllowPairMAC).val(AAPData["mac"]);
        }
        if("ip" in (AAPData) && "ip_prefix" in (AAPData["ip"])){
            $(txtAddAllowPairIP).val(AAPData["ip"]["ip_prefix"] + "/" +AAPData["ip"]["ip_prefix_len"]);
        }
    }
    return rootDiv;
}

function deleteAAPEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function validateAAP(element){
    var len = $("#"+element).children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var elementid = getID($("#"+element).children()[i].id);
            var IP = $("#"+element +"_"+ elementid +"_txtAddAllowPairIP").val();
            var MAC = $("#"+element +"_"+ elementid +"_txtAddAllowPairMAC").val();
            if (IP.trim() === "") {
                showInfoWindow("Enter IP Address in Allowed address pairs", "Input required");
                return false;
            }
            if (!isValidIP(IP.trim())) {
                showInfoWindow("Enter valid IP Address in Allowed address pairs", "Input required");
                return false;
            }

            if(MAC.trim() != ""){
                if(isValidMACAddress(MAC) == false){
                    showInfoWindow("Enter valid MAC Address in Allowed address pairs", "Invalid Input");
                    return false;
                }
            }
        }
    }
    return true;
}

////////End of Allow Address pair///////////////////////////

/////////////////////////////////////////////////////
//////////////////Static Routes////////////////////////
/////////////////////////////////////////////////////
function appendStaticRouteEntry(who,element, defaultRow) {
    if(validateStaticRoute(element) === false)
        return false;
    dynamicID++;
    var staticRouteEntry = createstaticRouteEntry(null, dynamicID,element);
    if (defaultRow) {
        $("#"+element).prepend($(staticRouteEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(staticRouteEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreatePorts",staticRouteEntry,false);
}

function createstaticRouteEntry(staticIp, id,element) {
    var inputTxtPrefix = document.createElement("input");
    inputTxtPrefix.type = "text";
    inputTxtPrefix.className = "span12";
    inputTxtPrefix.setAttribute("placeholder", "Prefix");
    inputTxtPrefix.setAttribute("id",element+"_"+id+"_txtPrefix");
    var divPrefix = document.createElement("div");
    divPrefix.className = "span10";
    divPrefix.appendChild(inputTxtPrefix);
    
    var inputTxtNextHop = document.createElement("input");
    inputTxtNextHop.type = "text";
    inputTxtNextHop.className = "span12";
    inputTxtNextHop.setAttribute("placeholder", "Next Hop");
    inputTxtNextHop.setAttribute("id",element+"_"+id+"_txtNextHop");
    var divNextHop = document.createElement("div");
    divNextHop.className = "span5";
    divNextHop.appendChild(inputTxtNextHop);

    var inputTxtData = document.createElement("input");
    inputTxtData.type = "text";
    inputTxtData.className = "hide";
    inputTxtData.setAttribute("id",element+"_"+id+"_SRdata");
    $(inputTxtData).val("");
    divPrefix.appendChild(inputTxtData);

    var netHopDiv = document.createElement("div");
    //netHopDiv.className = "span12";
    var divNetwork = document.createElement("div");
    //divNetwork.className = "span4";
    divNetwork.appendChild(netHopDiv);
    netHopDiv.innerHTML = "";

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendStaticRouteEntry(this,'"+element+"',false);");
    iBtnAddRule.setAttribute("title", "Add Static Route below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteStaticRouteEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Static Route");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5 span10";
    divRowFluidMargin5.appendChild(divPrefix);
    //divRowFluidMargin5.appendChild(divNextHop);
    divRowFluidMargin5.appendChild(divNetwork);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "port_" + id;
    rootDiv.className = "span12 margin-0-0-5";
    rootDiv.appendChild(divRowFluidMargin5);


    if (null !== staticIp && typeof staticIp !== "undefined") {
        $(inputTxtPrefix).val(staticIp["prefix"]);
        $(inputTxtNextHop).val(staticIp["nexthop"]);
        $(inputTxtData).val(JSON.stringify(staticIp));
    }
    
    return rootDiv;
}

function deleteStaticRouteEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function validateStaticRoute(element){
    var len = $("#"+element).children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var elementid = getID($("#"+element).children()[i].id);
            var staticRout_prefix = $("#"+element +"_"+ elementid +"_txtPrefix").val();
            if (typeof staticRout_prefix === "undefined" || staticRout_prefix.trim() === "") {
                showInfoWindow("Enter Static Route Prefix", "Input required");
                return false;
            }
            if (!isValidIP(staticRout_prefix.trim())) {
                showInfoWindow("Enter valid Static Route Prefix", "Input required");
                return false;
            }
            if((staticRout_prefix.trim()).split("/").length != 2) {
                showInfoWindow("Enter valid Static Rout Prefix with the format xxx.xxx.xxx.xxx/xx", "Invalid input in Static Route");
                return false;
            }
        }
    }
    return true;
}

////////End of Static Rout///////////////////////////

Handlebars.registerHelper("formatDHCPOption",function(DHCPOption,options) {
    var returnHtml = '';
    if(DHCPOption.length > 0){
        returnHtml += '<span class="span10">';
        returnHtml += '<div class="bgCol span2">';
        returnHtml += '    <div class="span6"><label>&nbsp;&nbsp;Code</label></div>';
        returnHtml += '    <div class="span6"><label>Value</label></div>';
        returnHtml += '</div>';
        returnHtml += '<div class="span9"></div>';
        for(k=0;k<DHCPOption.length;k++){
            returnHtml += '<div>';
            returnHtml += '<div class="span2">';
            returnHtml += '<div class="span6">&nbsp;&nbsp;' + DHCPOption[k]["code"] +'</div>';
            returnHtml += '<div class="span6">' + DHCPOption[k]["value"] +'</div>';
            returnHtml += '</div>';
            returnHtml += '<div class="span10"></div>';
            returnHtml += '</div>';
        }
        returnHtml += '</span>';
        returnHtml += '<span class="span12"></span>';
    } else {
        returnHtml += '<span class="span10">:</span>';
    }
    return returnHtml;
});

Handlebars.registerHelper("formatAAP",function(AllowedAddressPairValue,options) {
    var returnHtml = '';
    if(AllowedAddressPairValue.length > 0){
        returnHtml += '';
        returnHtml += '<span class="span10">: Enabled</span>';
        returnHtml += '<div><div class="span2"></div>';
        returnHtml += '<div class="bgCol span4">';
        returnHtml += '    <div class="span6"><label>&nbsp;&nbsp;IP</label></div>';
        returnHtml += '    <div class="span6"><label>MAC</label></div>';
        returnHtml += '</div>';
        returnHtml += '<div class="span6"></div>';
        for(k=0;k<AllowedAddressPairValue.length;k++){
            returnHtml += '<div><div class="span2"></div>';
            returnHtml += '<div class="span4">';
            returnHtml += '<div class="span6">&nbsp;&nbsp;' + AllowedAddressPairValue[k]["ip"]["ip_prefix"] +"/"+ AllowedAddressPairValue[k]["ip"]["ip_prefix_len"] +'</div>';
            returnHtml += '<div class="span6">' + AllowedAddressPairValue[k]["mac"] +'</div>';
            returnHtml += '</div>';
            returnHtml += '<div class="span6"></div>';
            returnHtml += '</div>';
        }
        returnHtml += '</span></div>';
        returnHtml += '<span class="span12"></span>';
    } else {
        returnHtml += '<span class="span10">: Disabled</span>';
    }
    return returnHtml;
});

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
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

    ddVN = $("#ddVN").data("contrailDropdown");
    if(isSet(ddVN)) {
        ddVN.destroy();
        ddVN = $();
    }
    
    ddSubInterfaceParent = $("#ddSubInterfaceParent").data("contrailDropdown");
    if(isSet(ddSubInterfaceParent)) {
        ddSubInterfaceParent.destroy();
        ddSubInterfaceParent = $();
    }

    ddVNState = $("#ddVNState").data("contrailDropdown");
    if(isSet(ddVNState)) {
        ddVNState.destroy();
        ddVNState = $();
    }
    /*ddAAP = $("#ddAAP").data("contrailDropdown");
    if(isSet(ddAAP)) {
        ddAAP.destroy();
        ddAAP = $();
    }*/
    if(!isVCenter()) {
    ddDeviceOwnerName = $("#ddDeviceOwnerName").data("contrailDropdown");
    if(isSet(ddDeviceOwnerName)) {
        ddDeviceOwnerName.destroy();
        ddDeviceOwnerName = $();
    }
    ddDeviceOwnerUUID = $("#ddDeviceOwnerUUID").data("contrailCombobox");
    if(isSet(ddDeviceOwnerUUID)) {
        ddDeviceOwnerUUID.destroy();
        ddDeviceOwnerUUID = $();
    }
    ddDeviceOwnerUUIDRouter = $("#ddDeviceOwnerUUIDRouter").data("contrailDropdown");
    if(isSet(ddDeviceOwnerUUIDRouter)) {
        ddDeviceOwnerUUIDRouter.destroy();
        ddDeviceOwnerUUIDRouter = $();
    }
    
    }

    /*ddTenentID = $("#ddTenentID").data("contrailDropdown");
    if(isSet(ddTenentID)) {
        ddTenentID.destroy();
        ddTenentID = $();
    }*/
    
    msSecurityGroup = $("#msSecurityGroup").data("contrailMultiselect");
    if(isSet(msSecurityGroup)) {
        msSecurityGroup.destroy();
        msSecurityGroup = $();
    }
        
    msFloatingIp = $("#msFloatingIp").data("contrailMultiselect");
    if(isSet(msFloatingIp)) {
        msFloatingIp.destroy();
        msFloatingIp = $();
    }
    
    gridPorts = $("#gridPorts").data("contrailGrid");
    if(isSet(gridPorts)) {
        gridPorts.destroy();
        $("#gridPorts").empty();
        gridPorts = $();
    }

    btnCreatePorts = $("#btnCreatePorts");
    if(isSet(btnCreatePorts)) {
        btnCreatePorts.remove();
        btnCreatePorts = $();
    }

    btnDeletePorts = $("#btnDeletePorts");
    if(isSet(btnDeletePorts)) {
        btnDeletePorts.remove();
        btnDeletePorts = $();
    }

    btnCreatePortsCancel = $("#btnCreatePortsCancel");
    if(isSet(btnCreatePortsCancel)) {
        btnCreatePortsCancel.remove();
        btnCreatePortsCancel = $();
    }

    btnCreatePortsOK = $("#btnCreatePortsOK");
    if(isSet(btnCreatePortsOK)) {
        btnCreatePortsOK.remove();
        btnCreatePortsOK = $();
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

    var btnCommonAddPortsRule = $("#btnCommonAddPortsRule");
    if(isSet()) {
        btnCommonAddPortsRule.remove();
        btnCommonAddPortsRule = $();
    }

    txtPortName = $("#txtPortName");
    if(isSet(txtPortName)) {
        txtPortName.remove();
        txtPortName = $();
    }

    var gridPortsDetailTemplate = $("#gridPortsDetailTemplate");
    if(isSet(gridPortsDetailTemplate)) {
        gridPortsDetailTemplate.remove();
        gridPortsDetailTemplate = $();
    }

    var myModalLabel = $("#myModalLabel");
    if(isSet(myModalLabel)) {
        myModalLabel.remove();
        myModalLabel = $();
    }

    /*var sGRuleTuples = $("#sGRuleTuples");
    if(isSet(sGRuleTuples)) {
        sGRuleTuples.remove();
        sGRuleTuples = $();
    }*/

    windowCreatePorts = $("#windowCreatePorts");
    if(isSet(windowCreatePorts)) {
        windowCreatePorts.remove();
        windowCreatePorts = $();
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

    var deletePortConfigTemplate = $("#delete-port-action-template");
    if(isSet(deletePortConfigTemplate)) {
        deletePortConfigTemplate.remove();
        deletePortConfigTemplate = $();
    }

    window.globalSubArry = [];
    window.ruleId = '';
}
