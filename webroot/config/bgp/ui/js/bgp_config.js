/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

bgpConfigObj = new bgpConfigObj();

function bgpConfigObj() {
    var mode = "", guuid = "",
    ghref = "", ggasn = "", ggasnObj = "",isiBGPAutoMesh = '';

    var bgpGrid, bgpwindow, gasnwindow, selectedName, bgpData,
        bgp_details_data, bgpavailabledata, bgpselectdata, globalData;
    
    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.populateGW = populateGW;
    this.isJuniperControlNode = isJuniperControlNode;
    this.isGlobalASN = isGlobalASN;
    this.handleltor = handleltor;
    this.handlertol = handlertol;
    this.clearBgpWindow = clearBgpWindow;
    this.closeBgpWindow = closeBgpWindow;
    this.validate = validate;
    this.getBGPJson = getBGPJson;
    this.addEditBgp = addEditBgp;
    this.setActions = setActions;
    this.onActionChange = onActionChange;
    this.deleteBgp = deleteBgp;
    this.populateMultiselect = populateMultiselect;
    this.selectExternal = selectExternal;
    this.closeGasnWindow = closeGasnWindow;
    this.openGasnWindow = openGasnWindow;
    this.validateGasn = validateGasn;
    this.getGasnJSON = getGasnJSON;
    this.gasnSuccess = gasnSuccess;
    this.gasnFailure = gasnFailure;
    this.submitGasn = submitGasn;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#bgp-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_infra_bgp';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function populateGW() {
    var ip_input = $("#txtiprange").val().trim();
    if ("" != ip_input) {
        populateIp();
        if (iprange_data.length > 0) {
            $("#txtgw").val(iprange_data[iprange_data.length - 1].ip)
        }
    }
}

function isJuniperControlNode(vendor) {
    if (!isSet(vendor) || vendor == null || vendor.trim().toLowerCase() == "" ||
        vendor.trim() == "-" || vendor.trim().toLowerCase() == "contrail") {
        return true;
    }
    return false;
}

function isGlobalASN() {
    var asn = $('#txtasn').val().trim();
    if (asn == ggasn) {
        return true;
    } else {
        return false;
    }
}

function handleltor(left, right, options) {
    var selected = $('#msbgppeer').data('contrail2WayMultiselect').getLeftSelectedData();
    
    if (selected.length <= 0)
        return false;
    var type = "";
    if ($("#chkjnpr")[0].checked === true)
        type = "control";
    else
        type = "external";
    if (selected.length > 0) {
        for (var i = 0; i < selected.length; i++) {
            for (var j = 0; j < globalData.length; j++) {
                if (globalData[j].name == selected[i].value) {
                    if (type == "external") {
                        if (!isJuniperControlNode(globalData[j].vendor)) {
                            showInfoWindow("BGP peer(" +
                                globalData[j].name +
                                ") can be paired only with Control Nodes.",
                                "Selection Error");
                            return false;
                        }
                    }
                }
            }
        }
    }
    
    return true;
}

function handlertol(left, right, options) {
    var selected = $('#msbgppeer').data('contrail2WayMultiselect').getRightSelectedData();
    
    if (selected.length <= 0)
        return false;
    var type = "";
    if ($("#chkjnpr")[0].checked === true)
        type = "control";
    else
        type = "external";
    // if (selected.length > 0) {
        // if (isGlobalASN()) {
            // showInfoWindow("Peer cannot be unpaired.", "Selection Error");
            // return false;
        // } else {
            // for (var i = 0; i < selected.length; i++) {
                // for (var j = 0; j < globalData.length; j++) {
                    // if (globalData[j].name == selected[i].value) {
                        // if (type == "control") {
                            // if (isJuniperControlNode(globalData[j].vendor)) {
                                // showInfoWindow("Control Node('" +
                                    // globalData[j].name + "') cannot be unpaired.",
                                    // "Selection Error");
                                // return false;
                            // }
                        // }
                    // }
                // }
            // }
        // }
    // }
    
    return true;
}

function clearBgpWindow() {
    mode = "";
    $("#txtvendor").val("");
    $("#txtname").val("");
    $("#txtasn").val("");
    $("#txtrid").val("");
    $("#txtaddr").val("");
    $("#txtport").val("");
    $("#txtholdtime").val(90);
    $("#txtname")[0].disabled = false;
    $("#txtasn")[0].disabled = false;
    $("#txtvendor")[0].disabled = false;
    $("#txtrid")[0].disabled = false;
    $("#txtport")[0].disabled = false;
    $("#txtaddr")[0].disabled = false;
    $("#chkexternal").click();
    $('#msbgppeer').data('contrail2WayMultiselect').setLeftData([]);
    $('#msbgppeer').data('contrail2WayMultiselect').setRightData([]);
    $('#multifamily').data('contrailMultiselect').value(['inet-vpn','inet6-vpn','route-target','e-vpn']);
}

function closeBgpWindow() {
    bgpwindow.modal('hide');
    clearBgpWindow();
}

function validate() {
    var name, asn, rid, addr, port, vendor, family = [], peers = [];
    name = $("#txtname").val().trim();
    asn = $("#txtasn").val().trim();
    rid = $("#txtrid").val().trim();
    addr = $("#txtaddr").val().trim();
    port = $("#txtport").val().trim();
    family = $("#txtfamily").val().trim();
    family = family.split("-");
    vendor = $("#txtvendor").val().trim();
    holdTime = $("#txtholdtime").val().trim();
    if ("" == name) {
        showInfoWindow("Enter a BGP router name", "Input required");
        return false;
    }
    try {
        asn = parseInt(asn);
        if (asn < 1 || asn > 65534 || isNaN(asn)) {
            showInfoWindow("Enter valid BGP ASN number between 1-65534", "Invalid input");
            return false;
        }
    } catch (e) {
        showInfoWindow("Enter valid BGP ASN number between 1-65534", "Invalid input");
        return false;
    }
    if ("" == rid || !validip(rid) || rid.indexOf("/") != -1) {
        showInfoWindow("Enter a valid BGP router ID in the format xxx.xxx.xxx.xxx", "Invalid input");
        return false;
    }
    if ("" == addr || !validip(addr) || addr.indexOf("/") != -1) {
        showInfoWindow("Enter a vaid BGP peer address in the format xxx.xxx.xxx.xxx", "Invalid input");
        return false;
    }
    try {
        port = parseInt(port);
        if (port <= 0 || port > 9999 || isNaN(port)) {
            showInfoWindow("Enter valid BGP port number between 1-9999", "Invalid input");
            return false;
        }
    } catch (e) {
        showInfoWindow("Enter valid BGP port number between 1-9999", "Invalid input");
        return false;
    }
    try {
        if(holdTime != "") {
            holdTime = parseInt(holdTime);
            if (holdTime < 1 || holdTime > 65535 || isNaN(holdTime)) {
                showInfoWindow("Enter valid  hold time between 1-65535", "Invalid input");
                return false;
            }
        }
    } catch (e) {
        showInfoWindow("Enter valid  hold time between 1-65535", "Invalid input");
        return false;
    }     
    if ($(chkextern)[0].checked === true) {
        if ("" == vendor.trim()) {
            showInfoWindow("Enter valid vendor name or SKU such as 'Juniper' or 'MX-40'.", "Input required");
            return false;
        }

        if ("contrail" == vendor.toLowerCase()) {
            showInfoWindow("Vendor name cannot be 'contrail'. Enter valid vendor name or SKU such as 'Juniper' or 'MX-40'.", "Invalid input");
            return false;
        }
    }
    if ("" == family || family.length <= 0) {
        showInfoWindow("Enter BGP peer address family", "Input required");
        return false;
    }

    var selectdata = $('#msbgppeer').data('contrail2WayMultiselect').getRightData();
    for (var i = 0; i < selectdata.length; i++) {
        peers[i] = selectdata[i].label;
    }
    return true;
}

function getBGPJson() {
    var bgp_params = [];
    var name,display_name, asn, rid, addr, port, vendor, ctrlTypeFamily = [], peers = [], type, holdTime, bgpTypeFamily = [];
    name = $("#txtname").val().trim();
    asn = parseInt($("#txtasn").val().trim());
    rid = $("#txtrid").val().trim();
    addr = $("#txtaddr").val().trim();
    port = parseInt($("#txtport").val().trim());
    vendor = $("#txtvendor").val().trim();
    if($('#txtholdtime').val().trim() == "") {
        holdTime = 90;    
    } else {
        holdTime = parseInt($('#txtholdtime').val().trim());
    }
    var selBGPAddFamily = $('#multifamily').data('contrailMultiselect').getSelectedData();
    if(selBGPAddFamily.length > 0) {
        for(var bgpAdd = 0; bgpAdd < selBGPAddFamily.length;  bgpAdd++) {
           bgpTypeFamily.push(selBGPAddFamily[bgpAdd].text);     
        }
    } 
    var selControlAddFmly = $('#txtfamily').data('contrailMultiselect').getSelectedData(); 
    if(selControlAddFmly.length > 0) {
        for(var bgpAdd = 0; bgpAdd < selControlAddFmly.length;  bgpAdd++) {
           ctrlTypeFamily.push(selControlAddFmly[bgpAdd].text);     
        }
    }     
    if ($("#chkjnpr")[0].checked === true) {
        type = "control";
        vendor = "contrail";
        asn = parseInt(ggasn);
    } else {
        type = "external";
    }
    peers = [];
    // if(type == "control") {
        // //If user is trying to create a new control node,
        // //peer with all control nodes and external bgp peers.
        // for (var j = 0; j < bgpData.length; j++) {
            // if(mode === "add") {
                // peers.push({"uuid":bgpData[j].uuid, "href":bgpData[j].href, "_id_params":bgpData[j]._id_params,
                // "to":["default-domain", "default-project" , "ip-fabric", "__default__", bgpData[j].name],"display_name":bgpData[j].display_name});
            // } else if(mode === "edit") {
                // if(bgpData[j].uuid !== guuid) {
                    // peers.push({"uuid":bgpData[j].uuid, "href":bgpData[j].href, "_id_params":bgpData[j]._id_params,
                    // "to":["default-domain", "default-project" , "ip-fabric", "__default__", bgpData[j].name],"display_name":bgpData[j].display_name});
                // }
            // }
        // }
    // } else {
        //If user is trying to create a new external BGP node, 
        //peer with all control nodes.
        var selectdata = $('#msbgppeer').data('contrail2WayMultiselect').getRightData();
        for (var i = 0; i < selectdata.length; i++) {
            if ("" != selectdata[i].label.trim()) {
                for (var j = 0; j < bgpData.length; j++) {
                    if (bgpData[j].name == selectdata[i].label) {
                        peers.push({"uuid":bgpData[j].uuid, "href":bgpData[j].href, "_id_params":bgpData[j]._id_params,
                            "to":["default-domain", "default-project" , "ip-fabric", "__default__", selectdata[i].label],"display_name":bgpData[j].display_name});
                        break;
                    }
                }
            }
        }
    // }
    if (!isiBGPAutoMesh || type === 'external') {
        if (mode == "add") {
            bgp_params = {
                "bgp-router":{
                    "parent_type":"routing-instance",
                    "fq_name":["default-domain", "default-project", "ip-fabric", "__default__", name],
                    "parent_name":"__default__",
                    "bgp_router_parameters":{
                        "address_families":{
                            "family": (type === "control") ? ctrlTypeFamily : bgpTypeFamily
                        },
                        "autonomous_system":asn,
                        "address":addr,
                        "identifier":rid,
                        "port":port,
                        "vendor":vendor,
                        "hold_time":holdTime
                    },
                    "bgp_router_refs":peers,
                    "name":name,
                    "display_name":display_name
                }
            };
        } else if (mode == "edit") {
            bgp_params = {
                "bgp-router":{
                    "uuid":guuid,
                    "href":ghref,
                    "id_perms":_gid_perms,
                    "_type":"bgp-router",
                    "fq_name":["default-domain", "default-project", "ip-fabric", "__default__", name],
                    "parent_name":"__default__",
                    "bgp_router_parameters":{
                        "address_families":{
                            "family": (type === "control") ? ctrlTypeFamily : bgpTypeFamily
                        },
                        "autonomous_system":asn,
                        "address":addr,
                        "identifier":rid,
                        "port":port,
                        "vendor":vendor,
                        "hold_time":holdTime                        
                    },
                    "bgp_router_refs":peers,
                    "name":name,
                    "display_name":display_name
                }
            };
        }
    } else {
        if (mode == "add") {
            bgp_params = {
                "bgp-router":{
                    "parent_type":"routing-instance",
                    "fq_name":["default-domain", "default-project", "ip-fabric", "__default__", name],
                    "parent_name":"__default__",
                    "bgp_router_parameters":{
                        "address_families":{
                            "family": (type === "control") ? ctrlTypeFamily : bgpTypeFamily
                        },
                        "autonomous_system":asn,
                        "address":addr,
                        "identifier":rid,
                        "port":port,
                        "vendor":vendor,
                        "hold_time":holdTime                        
                    },
                    "name":name,
                    "display_name":display_name
                }
            };
        }
        else if (mode == "edit") {
            bgp_params = {
                "bgp-router":{
                    "uuid":guuid,
                    "href":ghref,
                    "id_perms":_gid_perms,
                    "_type":"bgp-router",
                    "fq_name":["default-domain", "default-project", "ip-fabric", "__default__", name],
                    "parent_name":"__default__",
                    "bgp_router_parameters":{
                        "address_families":{
                            "family": (type === "control") ? ctrlTypeFamily : bgpTypeFamily
                        },
                        "autonomous_system":asn,
                        "address":addr,
                        "identifier":rid,
                        "port":port,
                        "vendor":vendor,
                        "hold_time":holdTime                        
                    },
                    "name":name,
                    "display_name":display_name
                }
            };
        }
    }
    return bgp_params;
}

function addEditBgp(data) {
    var bgp_params, bgpEditselectdata = [];
    if (mode == "edit") {
        var vendor, detailStr, peers = [],
            tmp_availablelist = [],
            tmp_selectlist = [];

        if (data.role.indexOf("Control") != -1) {
            $("#chkjnpr").click();
        } else {
            $("#chkextern").click();
        }
        $("#txtname").val(data.name);
        $("#txtname")[0].disabled = true;
        $("#txtport")[0].disabled = true;
        $("#txtaddr").val(data.ip);
        detailStr = data['detailStr'];
        detailStr = detailStr.split(";");
        for (var i = 0; i < detailStr.length; i++) {
            if (detailStr[i].indexOf("BGP ASN") != -1) {
                $("#txtasn").val(detailStr[i].split("BGP ASN")[1].trim());
            } else if (detailStr[i].indexOf("Router ID") != -1) {
                $("#txtrid").val(detailStr[i].split("Router ID")[1].trim());
            } else if (detailStr[i].indexOf("BGP Port") != -1) {
                $("#txtport").val(detailStr[i].split("BGP Port")[1].trim());
            } else if (detailStr[i].indexOf("Address family") != -1) {
                var msFamily = $('#multifamily').data('contrailMultiselect');
                var addFamilyData = detailStr[i].split("Address family")[1].trim();
                addFamilyData = addFamilyData.split(',');
                var addFamilyArry = [];
                for(var addCnt = 0; addCnt < addFamilyData.length; addCnt++) {
                    addFamilyArry.push(addFamilyData[addCnt]);
                }
                msFamily.value(addFamilyArry);
            } else if (detailStr[i].indexOf("Vendor") != -1) {
                $("#txtvendor").val(detailStr[i].substr(7));
            } else if (detailStr[i].indexOf("Hold Time") != -1) {
                var holdTimeVal = detailStr[i].split("Hold Time")[1].trim();
                holdTimeVal = holdTimeVal === "-" ? "" : holdTimeVal;              
                $("#txtholdtime").val(holdTimeVal);
            }            
        }
        data.details.forEach(function (d) {
            if (d.name == "Peers" && d.value.trim() != '') {
                peers = d.value.split(",");
                peers.forEach(function (a) {
                    bgpEditselectdata.push({"label":a, "value":a});
                });
                $('#msbgppeer').data('contrail2WayMultiselect').setRightData(bgpEditselectdata);
                tmp_selectlist = clone(bgpEditselectdata);
            }
        });
        vendor = $("#txtvendor").val().trim();
        if (isJuniperControlNode(vendor)) {
            for (var j = 0; j < bgpData.length; j++) {
                if ($("#txtname").val() != bgpData[j].name) {
                    tmp_availablelist.push({'label':bgpData[j].name, 'value':bgpData[j].name});
                }
            }
        } else {
            if ("" != $("#txtvendor").val().trim()) {
                for (var j = 0; j < bgpData.length; j++) {
                    if (isJuniperControlNode(bgpData[j].vendor) &&
                        $("#txtname").val() != bgpData[j].name) {
                        tmp_availablelist.push({'label':bgpData[j].name, 'value':bgpData[j].name});
                    }
                }
            }
        }
        for (var i = 0; i < tmp_selectlist.length; i++) {
            for (var j = tmp_availablelist.length - 1; j > -1; j--) {
                if (tmp_selectlist[i].label == tmp_availablelist[j].label) {
                    tmp_availablelist.splice(j, 1);
                }
            }
        }
        $('#msbgppeer').data('contrail2WayMultiselect').setLeftData(tmp_availablelist);
    }
}

function fetchData() {
    $("#gridBGP").data("contrailGrid")._dataView.setData([]);
    $("#gridBGP").data("contrailGrid").showGridMessage('loading');
    $.ajax({
        type:"GET",
        cache:false,
        url:"/api/tenants/admin/config/global-asn"
    }).success(function (res) {
            ggasnObj = jsonPath(res, "$.*")[0];
            ggasn = ggasnObj["autonomous_system"];
            isiBGPAutoMesh = ggasnObj['ibgp_auto_mesh'] == null ? true : ggasnObj['ibgp_auto_mesh'];
            if(isiBGPAutoMesh) {
                 $('#chk_ibgp_auto_mesh').attr('checked', 'checked');
                 //$("#peersdiv").hide();
            } else {
                $('#chk_ibgp_auto_mesh').removeAttr('checked');
                //$("#peersdiv").show();
            }
            //$("#btneditgasn").val("Global ASN - " + ggasn);
            $('#btneditgasn').removeClass('disabled-link');
            $("#btneditgasn").attr("title", "Global ASN - " + ggasn);
            $("#btneditgasn").text("Global ASN - " + ggasn);
        }).fail(function (msg) {
            if(msg && msg.statusText !== "abort") {
            showInfoWindow("Error in getting Global ASN.", "Error");
            }
            $('#btneditgasn').removeClass('disabled-link');
        });
    $.ajax({
        type:"GET",
        cache:false,
        url:"/api/admin/nodes/bgp"
    }).success(function (res) {
            $('#btnaddbgp').removeClass('disabled-link');
            var counter = 0;
            bgpavailabledata.splice(0, bgpavailabledata.length);
            bgpavailabledata.splice(0, bgpavailabledata.length);
            bgpData.splice(0, bgpData.length);
            globalData.splice(0, globalData.length);
            bgpselectdata.splice(0, bgpselectdata.length);
            if(res == null || typeof res == "undefined" || res.length <= 0) {
                $("#gridBGP").data("contrailGrid").showGridMessage('empty');
                return;
            }
            res.forEach(function (d) {
                if (null != d) {
                    var type = (d.type) ? d.type : "",
                        append = "", role = "", roles, addr_families = [],
                        peers = [], details = [], detailStr = "";
                    if (type.indexOf("bgp-router") != -1) {
                        globalData.push(d);
                        bgpavailabledata.push({"label":d.name, "value":d.name});
                        if (isJuniperControlNode(d.vendor)) {
                            append = "Control Node";
                        } else {
                            append = "BGP Peer";
                        }
                        roles = type.split(", ");
                        roles.forEach(function (e) {
                            if (e == "bgp-router") {
                                role = append;
                            }
                        });
                        if (d.address_families && d.address_families.family) {
                            d.address_families.family.forEach(function (e) {
                                addr_families.push(e);
                            });
                        }
                        addr_families = addr_families.toString();
                        //tbd bgp peers
                        details.push({ "name":"Display Name", "value":d.display_name });
                        details.push({ "name":"UUID", "value":d.uuid});
                        if (d.bgp_refs) {
                            peers = d.bgp_refs.toString();
                            details.push({ "name":"Peers", "value":peers });
                        }
                        if (type.indexOf("bgp-router") != -1) {
                            if (d.vendor && d.vendor.trim() != "") {
                                detailStr = "Vendor " + d.vendor + "; ";
                                details.push({ "name":"Vendor", "value":d.vendor });
                            }
                            if (d.autonomous_system) {
                                detailStr += "BGP ASN " + d.autonomous_system + ";";
                                details.push({ "name":"BGP ASN", "value":d.autonomous_system });
                            }
                            if (d.identifier && d.identifier.trim() != "") {
                                detailStr += "Router ID " + d.identifier + "; ";
                                details.push({ "name":"Router ID", "value":d.identifier });
                            }
                            if (d.port) {
                                detailStr += "BGP Port " + d.port + "; ";
                                details.push({ "name":"BGP Port", "value":d.port });
                            }
                            if (addr_families && addr_families.trim() != "") {
                                detailStr += "Address family " + addr_families + "; ";
                                details.push({ "name":"Address family", "value":addr_families });
                            }
                            if(d["hold_time"]) { 
                                detailStr += "Hold Time " + d["hold_time"] + "; ";
                                details.push({ "name":"Hold Time", "value":d["hold_time"]});                                
                            }
                        }
                        if (d.address && "" != d.address) {
                            bgpData.push({
                                "id":counter++,
                                "uuid":d.uuid,
                                "href":d.href,
                                "id_perms":d.id_perms,
                                "ip":d.address,
                                "role":role,
                                "name":d.name,
                                "display_name":d.display_name,
                                "vendor":(d.vendor == null) ? "-" : d.vendor,
                                "details":details,
                                "detailStr":detailStr
                            });
                        } else if (d.ip_address && "" != d.ip_address) {
                            bgpData.push({
                                "id":counter++,
                                "uuid":d.uuid,
                                "href":d.href,
                                "id_perms":d.id_perms,
                                "ip":d.ip_address,
                                "role":role,
                                "name":d.name,
                                "display_name":d.display_name,
                                "vendor":(d.vendor == null) ? "-" : d.vendor,
                                "details":details,
                                "detailStr":detailStr
                            });
                        }
                    }
                }
                //counter++;
            });
            setActions();
        }).fail(function (msg) {
            $("#gridBGP").data("contrailGrid").showGridMessage("errorGettingData");
        });
}

function setActions() {
    $("#gridBGP").data("contrailGrid")._dataView.setData(bgpData);
    mode = "";
    selectedName = "";
}

function onActionChange(who, rowIndex) {
    var selectedRow = $("#gridBGP").data("contrailGrid")._dataView.getItem(rowIndex);
    guuid = selectedRow.uuid;
    ghref = selectedRow.href;
    _gid_perms = selectedRow.id_perms;

    if (who == "edit-control") {
        mode = "edit";
        addEditBgp(selectedRow);
        bgpwindow.modal('show');
        bgpwindow.find('h6').text("Edit BGP Peer");
    } else if (who == "debug-control") {
        $.bbq.pushState({p:"mon_bgp", q:{node:'Control Nodes:' + edit_data.name, tab:'console'}});
    } else if (who == "delete") {
        $("#btndelbgp").click();
    }
}

function deleteBgp(selectedRows) {
    $('#btndelbgp').addClass('disabled-link');
    var deleteAjaxs = [];
    if (selectedRows && selectedRows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selectedRows;
        cbParams.url = "/api/admin/bgp-router/"; 
        cbParams.urlField = "uuid";
        cbParams.fetchDataFunction = "fetchData";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting peer - ";
        cbParams.errorField = "name";
        deleteObject(cbParams);
    }
}

function initComponents() {
    bgpData = [];
    bgp_details_data = [];
    bgpavailabledata = [];
    bgpselectdata = [];
    globalData = [];

    $("#gridBGP").contrailGrid({
        header : {
            title : {
                text : 'BGP Peers',
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
            customControls: [
                '<a id="btndelbgp" class="disabled-link" title="Delete BGP Peer(s)"><i class="icon-trash"></i></a>',
                '<a id="btnaddbgp" class="disabled-link" onclick="btnaddbgpClick();return false;" title="Create BGP Peer"><i class="icon-plus"></i></a>',
                '<button id="btneditgasn" class="btn btn-primary btn-mini" onclick="openGasnWindow();return false;" title="Edit Global ASN"></button>',
                '<div><input type="checkbox" id="chk_ibgp_auto_mesh" class="ace-input" onchange="toggleiBGPAutoMesh(this)"></input><span class="ace-lbl">&nbsp;</span><label class="ace-lbl hyperlink-active" for="chk_ibgp_auto_mesh">iBGP Auto Mesh</label></div>'
            ]
        },
        columnHeader : {
            columns : [
                {
                    field:"ip",
                    id:"ip",
                    name:"IP Address",
                    sortable: true,
                    sorter : comparatorIP
                },
                {
                    field:"role",
                    id:"role",
                    name:"Type",
                    sortable: true
                },
                {
                    field:"vendor",
                    id:"vendor",
                    name:"Vendor",
                    sortable: true
                },
                {
                    field:"name",
                    id:"name",
                    name:"HostName",
                    sortable: true
                }
            ]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btndelbgp').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btndelbgp').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            onActionChange('edit-control',rowIndex);
                        }
                    }
                ],
                detail: {
                    template: $("#gridBGPDetailTemplate").html()
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading BGP Peers..',
                },
                empty: {
                    text: 'No BGP Peers Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting BGP Peers.'
                }
            }
        }
    });
    
    $('#msbgppeer').contrail2WayMultiselect({
    	controls: {
    		single: true,
        	all: false
        },
    	beforeMoveOneToRight: handleltor,
        beforeMoveOneToLeft: handlertol,  
        leftTitle: 'Available Peers',
        rightTitle: 'Configured Peers',
        sizeLeft: 10,
        sizeRight: 10
    });
    $('#msbgppeer').data('contrail2WayMultiselect').setLeftData(bgpavailabledata);
    $('#msbgppeer').data('contrail2WayMultiselect').setRightData(bgpselectdata);

    $('#multifamily').contrailMultiselect({
        dataTextField:"text",
        dataValueField:"value"        
    });
    var msFamily = $('#multifamily').data('contrailMultiselect');
    msFamily.setData([{text : 'inet-vpn', value : 'inet-vpn', locked : true},
        {text : 'inet6-vpn', value : 'inet6-vpn'},
        {text : 'route-target', value : 'route-target'},
        {text : 'e-vpn', value : 'e-vpn'}
    ]);
    msFamily.value(['inet-vpn', 'inet6-vpn', 'route-target', 'e-vpn']);
    $('#txtfamily').contrailMultiselect({
        dataTextField:"text",
        dataValueField:"value"         
    });
    var cnFamily = $("#txtfamily").data('contrailMultiselect');
    cnFamily.setData([{text : 'route-target', value : 'route-target', locked : true},
        {text : 'inet-vpn', value : 'inet-vpn', locked : true},
        {text : 'inet6-vpn', value : 'inet6-vpn', locked : true},
        {text : 'e-vpn', value : 'e-vpn', locked : true},
        {text : 'erm-vpn', value : 'erm-vpn', locked : true}
    ]);
    cnFamily.value(['route-target', 'inet-vpn', 'inet6-vpn', 'e-vpn', 'erm-vpn']);
    cnFamily.enable(false);
    bgpwindow = $("#bgpwindow");
    bgpwindow.on("hide", clearBgpWindow);
    bgpwindow.modal({backdrop:'static', keyboard: 'false', show:false});

    gasnwindow = $("#gasnwindow");
    gasnwindow.modal({backdrop:'static', keyboard: 'false', show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    $('#confirmAutoMeshUpdate').modal({backdrop:'static', keyboard: false, show:false});
    $('#confirmPeers').modal({backdrop:'static', keyboard: false, show:false});
}

function toggleiBGPAutoMesh(e) {
    $('#confirmAutoMeshUpdate').find('.modal-header-title').text("Confirm");
    $('#confirmAutoMeshUpdate').modal('show');
}

function ibgpAutoMeshSuccess(res) {
    //showInfoWindow("iBGP Auto Mesh value is updated","Success");
    fetchData();
}

function ibgpAutoMeshFailure() {
    showInfoWindow("Error in submitting iBGP Auto Mesh data", "Error");
    fetchData();
}

function btnaddbgpClick() {
    //$('#msbgppeer').data('contrail2WayMultiselect').setLeftData(bgpavailabledata);
    mode = "add";
    bgpwindow.modal('show');
    bgpwindow.find('h6').text("Create BGP Peer");
    $("#txtasn").val(ggasn);
    $("#txtport").val("179");
    $("#chkextern").click();
    $("#txtname").focus();  
    bgpwindow.find('.modal-body').scrollTop(0);    
}

function initActions() {
    $("#btndelbgp").click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });
    $('#btnAutoMeshUpdatePopupOK').click(function(a){
        $('#confirmAutoMeshUpdate').modal('hide');
        var autoMeshCkd =  $('#chk_ibgp_auto_mesh')[0].checked;
        if(autoMeshCkd) {
            $("#peersdiv").hide();
        } else {
            $("#peersdiv").show();
        }
        var ibgpAutoMeshObj = {
             "global-system-config":{
                 "_type":ggasnObj._type,
                 "uuid":ggasnObj.uuid,
                 "ibgp_auto_mesh":autoMeshCkd
             }
         };
         doAjaxCall("/api/tenants/admin/config/ibgp-auto-mesh",
             "PUT", JSON.stringify(ibgpAutoMeshObj), "ibgpAutoMeshSuccess", "ibgpAutoMeshFailure"); 
        $("#gridBGP").data("contrailGrid")._dataView.setData([]);
        $("#gridBGP").data("contrailGrid").showGridMessage('loading');
    });

    $('#btnAutoMeshUpdatePopupCancel').click(function(a){
        iBGPAutoMeshCacelActions();
    });

    $("#btnCnfRemoveMainPopupCancel").click(function (a) {
        confirmMainRemove.modal('hide');
    });

    $("#btnCnfRemoveMainPopupOK").click(function (a) {
        var selected_rows = $("#gridBGP").data("contrailGrid").getCheckedRows();
        deleteBgp(selected_rows);
        confirmMainRemove.modal('hide');
    });

    $("#btnbgpcancel").click(function (a) {
        bgpwindow.modal('hide')
    });
    $("#btnbgpok").click(function (a) {
        if (validate()) {
            var peers = $('#msbgppeer').data('contrail2WayMultiselect').getRightData();
            if(peers.length === 0 &&(!isiBGPAutoMesh || !$("#chkjnpr")[0].checked)) {
                $('#confirmPeers').find('.modal-header-title').text("Information");
                $('#confirmPeers').modal('show');
            } else {
                createUpdateBgp();
            }
        }
    });
    $('#btnPeersPopupOK').click(function(a){
        $('#confirmPeers').modal('hide');
        createUpdateBgp();
    });
}

function iBGPAutoMeshCacelActions() {
    $('#chk_ibgp_auto_mesh')[0].checked = !$('#chk_ibgp_auto_mesh')[0].checked;
    $('#confirmAutoMeshUpdate').modal('hide');
}

function createUpdateBgp() {
    //if (validate()) {
        bgp_params = getBGPJson();
        var params;
        if (window.JSON) {
            params = {"content":bgp_params}
            params = JSON.stringify(params);
        }
        else {
            params = {"content":bgp_params}
            params = $.toJSON(params);
        }

        if (mode == "add") {
            bgpwindow.modal('hide');
            $.ajax({
                type:"POST",
                url:"/api/admin/bgp-router",
                data:params,
                contentType:"application/json; charset=utf-8",
                headers:{'X-Tenant-Name':'default-project'},
                dataType:"json"
            }).success(function (msg) {
                    guuid = "";
                    ghref = "";
                    _gid_perms = [];
                    mode = "add";
                    bgpData = [];
                    bgp_details_data = [];
                    $("#gridBGP").data("contrailGrid")._dataView.setData([]);
                    $("#gridBGP").data("contrailGrid").showGridMessage('loading');
                    fetchData();
                }).fail(function (msg) {
                    $("#gridBGP").data("contrailGrid")._dataView.setData([]);
                    $("#gridBGP").data("contrailGrid").showGridMessage('loading');
                    showInfoWindow("Error in submitting data", "Error");
                    selectedName = "";
                    mode = "";
                    fetchData();
                });
        }
        else if (mode == "edit") {
            selectedName = $("#txtname").val().trim();
            bgpwindow.modal('hide');
            $.ajax({
                type:"PUT",
                url:"/api/admin/bgp-router/" + bgp_params["bgp-router"].uuid,
                data:params,
                contentType:"application/json; charset=utf-8",
                dataType:"json"
            }).success(function (msg) {
                    guuid = "";
                    ghref = "";
                    _gid_perms = [];
                    $("#gridBGP").data("contrailGrid")._dataView.setData([]);
                    $("#gridBGP").data("contrailGrid").showGridMessage('loading');
                    mode = "edit";
                    bgpData = [];
                    bgp_details_data = [];
                    fetchData();
                }).fail(function (msg) {
                    $("#gridBGP").data("contrailGrid")._dataView.setData([]);
                    $("#gridBGP").data("contrailGrid").showGridMessage('loading');
                    showInfoWindow("Error in submitting data", "Error");
                    selectedName = "";
                    mode = "";
                    fetchData();
                });
        }
    //}
}

function copyToRouterID() {
    $("#txtrid").val($("#txtaddr").val());
}
function selectJnpr() {
    $("#asnpanel").addClass('hide')
    $("#txtasn").val(ggasn);
    $("#vendor-n-family").addClass('hide');
    $("#multipanel").addClass('hide');        
    $("#txtpanel").removeClass('hide');
    if(isiBGPAutoMesh){
        $("#peersdiv").hide();
    } else {
        $("#peersdiv").show();
    }
    populateMultiselect("chkjnpr");
}
function populateMultiselect(who) {
    var jnprs = [];
    var externs = [];
    if (isSet(globalData) && globalData.length > 0) {
        for (var i = 0; i < globalData.length; i++) {
            if (isJuniperControlNode(globalData[i].vendor)) {
                if (mode == "edit" &&
                    $("#txtname").val() != globalData[i].name)
                    jnprs.push({"label":globalData[i].name, "value": globalData[i].name});
                else if (mode == "add")
                    jnprs.push({"label":globalData[i].name, "value": globalData[i].name});
            }
            else {
                if (who == "chkjnpr") {
                    if (mode == "edit" &&
                        $("#txtname").val() != globalData[i].name)
                        externs.push({"label":globalData[i].name, "value": globalData[i].name});
                    else if (mode == "add")
                        externs.push({"label":globalData[i].name, "value": globalData[i].name});
                }
            }
        }
    }
    // if (who == "chkjnpr") {
        // var all = externs.concat(jnprs);
        // $('#msbgppeer').data('contrail2WayMultiselect').setRightData(all);
        // $('#msbgppeer').data('contrail2WayMultiselect').setLeftData([]);
    // } else if (who == "chkexternal") {
        // if (isGlobalASN()) {
            // $('#msbgppeer').data('contrail2WayMultiselect').setRightData(jnprs);
            // $('#msbgppeer').data('contrail2WayMultiselect').setLeftData([]);
        // } else {
            // $('#msbgppeer').data('contrail2WayMultiselect').setRightData([]);
            // $('#msbgppeer').data('contrail2WayMultiselect').setLeftData(jnprs);
        // }
    // }
    var all = externs.concat(jnprs);
    $('#msbgppeer').data('contrail2WayMultiselect').setRightData([]);
    $('#msbgppeer').data('contrail2WayMultiselect').setLeftData(all);
}

function selectExternal() {
    $("#asnpanel").removeClass('hide');
    $("#vendor-n-family").removeClass('hide');
    $("#txtpanel").addClass('hide');
    $("#multipanel").removeClass('hide');
    $("#peersdiv").show();
    populateMultiselect("chkexternal");
    $('#bgpbody').scrollTop(100);
}

function closeGasnWindow() {
    
    $("#txtgasn").val("");
    $("#txtgasn")[0].disabled = false;
    gasnwindow.modal('hide');
}

function openGasnWindow() {
    $("#txtgasn").val(ggasn);
    gasnwindow.modal('show');
    $("#txtgasn").focus();
}

function validateGasn() {
    var gasn = $("#txtgasn").val().trim();
    if ("" == gasn) {
        showInfoWindow("Enter Global ASN between 1 - 65534", "Invalid input");
        return false;
    }
    try {
        if (isNumber(gasn)) {
            gasn = parseInt(gasn);
            if (gasn < 1 || gasn > 65534 || isNaN(gasn)) {
                showInfoWindow("Enter valid BGP ASN number between 1-65534", "Invalid input");
                return false;
            }
        }
        else {
            showInfoWindow("Enter valid BGP ASN number between 1-65534", "Invalid input");
            return false;
        }
    } catch (e) {
        showInfoWindow("Enter valid BGP ASN number between 1-65534", "Invalid input");
        return false;
    }
    return true;
}

function getGasnJSON() {
    var gasn_params = {};
    var gasn = $("#txtgasn").val().trim();
    ggasn = gasn;
    gasn_params = {
        "global-system-config":{
            "_type":ggasnObj._type,
            "uuid":ggasnObj.uuid,
            "autonomous_system":parseInt(gasn)
        }
    };
    return gasn_params;
}

function gasnSuccess(res) {
    $("#btneditgasn").attr("title", "Global ASN - " + ggasn);
    $("#btneditgasn").text("Global ASN - " + ggasn);
    fetchData();
}

function gasnFailure() {
    ggasn = ggasnObj["global-system-config"]["autonomous_system"];
    showInfoWindow("Error in submitting data", "Error");
    fetchData();
}

function submitGasn() {
    if (validateGasn() === false)
        return false;
    var gasn_params = getGasnJSON();
    gasn_params = JSON.stringify(gasn_params);
    doAjaxCall("/api/tenants/admin/config/global-asn",
        "PUT", gasn_params, "gasnSuccess", "gasnFailure");
    $("#gridBGP").data("contrailGrid")._dataView.setData([]);
    $("#gridBGP").data("contrailGrid").showGridMessage('loading');
    closeGasnWindow();
}

function destroy() {
    gridBGP = $("#gridBGP").data("contrailGrid");
    if(isSet(gridBGP)) {
        gridBGP.destroy();
        $("#gridBGP").empty();
        gridBGP = $();
    }

    gasnwindow = $("#gasnwindow");
    if(isSet(gasnwindow)) {
        gasnwindow.remove();
        gasnwindow = $();
    }

    bgpwindow = $("#bgpwindow");
    if(isSet(bgpwindow)) {
        bgpwindow.remove();
        bgpwindow = $();
    }
    
    confirmMainRemove = $("#confirmMainRemove");
    if(isSet(confirmMainRemove)) {
        confirmMainRemove.remove();
        confirmMainRemove = $();
    }
    
    gridBgpDetailTemplate = $("#gridBGPDetailTemplate");
    if(isSet(gridBgpDetailTemplate)) {
        gridBgpDetailTemplate.remove();
        gridBgpDetailTemplate = $();
    }
    
    bgppeertemplate = $("#bgppeertemplate");
    if(isSet(bgppeertemplate)) {
        bgppeertemplate.remove();
        bgppeertemplate = $();
    }

    btndelbgp = $("#btndelbgp");
    if(isSet(btndelbgp)) {
        btndelbgp.remove();
        btndelbgp = $();
    }
    
    btnaddbgp = $("#btnaddbgp");
    if(isSet(btnaddbgp)) {
        btnaddbgp.remove();
        btnaddbgp = $();
    }
    
    btneditgasn = $("#btneditgasn");
    if(isSet(btneditgasn)) {
        btneditgasn.remove();
        btneditgasn = $();
    }

    bgpConfigTemplate = $("#bgp-config-template");
    if(isSet(bgpConfigTemplate)) {
        bgpConfigTemplate.remove();
        bgpConfigTemplate = $();
    }
    multifamily = $("#multifamily").data("contrailMultiselect");
    if(isSet(multifamily)) {
        multifamily.destroy();
        multifamily = $();
    } 
    txtfamily = $("#txtfamily").data("contrailMultiselect");
    if(isSet(txtfamily)) {
        txtfamily.destroy();
        txtfamily = $();
    }    
}
