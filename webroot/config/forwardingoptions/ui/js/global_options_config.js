/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

fwdOptionsConfigObj = new ForwardingOptionsConfigObj();

function ForwardingOptionsConfigObj() {
    this.load = load;
    this.init = init;
    this.destroy = destroy;
    this.initComponents = initComponents;
	this.createEPEntry = createEPEntry;
	this.appendEPEntry = appendEPEntry
	this.deleteEPEntry = deleteEPEntry; 
	this.clearEPEntries = clearEPEntries;
	this.populateData = populateData;
	this.validate = validate;
    //Variable definitions
    //Dropdowns
    var ddVxLan;

    //Buttons
    var btnSaveFwdOptions, btnCnfSaveCancel, btnCnfSaveOK;
    var confirmMainSave;
}

function load() {
    var configTemplate = Handlebars.compile($("#fwdoptions-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_infra_fwdoptions';
    init();
}

function initComponents() {
    dynamicID = 0;
    $("#gridGlobalConfig").contrailGrid({
        header : {
            title : {
                text : 'Global Config Options',
            },
            customControls: ['<a id="btnEditGblConfig" onclick="showGblConfigEditWindow();return false;" title="Edit Global Config"><i class="icon-edit"></i></a>']
        },
        columnHeader : {
            columns : [
            {
                id: "property",
                field: "property",
                name: "",
                minWidth : 60,
                sortable: false
            },
            {
                id: "value",
                field: "value",
                name: "",
                minWidth : 60,
                sortable: false,
                formatter: function(r, c, v, cd, dc) {
                    if(dc.property === 'Encapsulation Priority Order') {
                        var ele = '';
                        if(dc.value.length > 0) {
                            for(var i = 0; i < dc.value.length; i++) {
                                var item = dc.value[i];
                                if(ele === ''){
                                    ele = '<span>' + item + '</span>'
                                } else {
                                    ele += '<br><span>' + item + '</span>'
                                }
                            }
                        } else {
                            ele = '-';
                        }
                        return ele;
                    } else if(dc.property === 'iBGP Auto Mesh') {
                        if(dc.value) {
                            return 'Enabled';
                        } else {
                            return "Disabled";
                        }
                    } else if(dc.property === 'IP Fabric Subnets') {
                        var ele = '';
                        if(dc.value.length > 0) {
                            for(var i = 0; i < dc.value.length ; i++) {
                                var item = dc.value[i];
                                if(ele === ''){
                                    ele = '<span>' + item.ip_prefix + '/' + item.ip_prefix_len + '</span>'
                                } else {
                                    ele += '<br><span>' + item.ip_prefix + '/' + item.ip_prefix_len + '</span>'
                                }                                
                            }
                        } else {
                            ele = '-';
                        }
                        return ele;
                    } else {
                        return dc.value;
                    }
                }
            }]
        },
        body : {
            options : {
                forceFitColumns: true,
                editable: false,
                autoEdit: false
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Global Config..',
                },
                empty: {
                    text: 'No Global Config Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Global Config.'
                }
            }
        }
    });

    gridGlobalConfig = $("#gridGlobalConfig").data('contrailGrid');

    ddVxLan = $("#ddVxLan").contrailDropdown({
        data: [{id:"automatic", text:'Auto Configured'}, {id:"configured", text:'User Configured'}]
    });
    
    $("#ddAutoMesh").contrailDropdown({
        data : [{id:"enabled", text:'Enabled'}, {id:"disabled", text:'Disabled'}]
    });
    
	confirmMainSave = $("#confirmMainSave");
	confirmMainSave.modal({backdrop:'static', keyboard: false, show:false});
    windowEditGblConfig = $('#windowEditGblConfig');
    windowEditGblConfig.modal({backdrop:'static', keyboard: false, show:false});
}

function showGblConfigEditWindow() {
    windowEditGblConfig.find('h6.modal-header-title').text('Edit Global Config');
    setEditPopupData();
    windowEditGblConfig.modal('show');
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

function getiBGPAutoMeshJSON() {
    var ibgpAutoMeshObj = {};
    var autoMeshCkd =  $('#ddAutoMesh').data('contrailDropdown').value() === 'enabled' ? true : false;
    ibgpAutoMeshObj = {
        "global-system-config":{
            "_type":ggasnObj._type,
            "uuid":ggasnObj.uuid,
            "ibgp_auto_mesh":autoMeshCkd
        }
    };
    return ibgpAutoMeshObj;
}

function isPriorityChanged(oldPriority, newPriority) {
    if(oldPriority.length != newPriority.length) {
        return true;
    } else {
        for(var i = 0; i < oldPriority.length; i++) {
            if(oldPriority[i] != newPriority[i]) {
                return true;
            }
        }
    }
    return false;
}

function isIPFabricSubnetChanged(oldSubnets, newSubnets) {
    if(oldSubnets.length != newSubnets.length) {
        return true;
    } else {
        for(var i = 0; i < oldSubnets.length; i++) {
            if(oldSubnets[i].ip_prefix != newSubnets[i].ip_prefix
                || oldSubnets[i].ip_prefix_len != newSubnets[i].ip_prefix_len) {
                return true;    
            }
        }        
    }
    return false;
}

function getModifiedSubnets() {
    var subnetList = [];
    var subnetTuples = $("#subnetTuples")[0].children;
    if (subnetTuples && subnetTuples.length > 0) {
        for (var i = 0; i < subnetTuples.length; i++) {
            var id = getID(String($("#subnetTuples").children()[i].id));
            var cidr = $("#subnetTuples_"+id+"_txtCIDR").val().trim();
            cidr = cidr.split('/');
            subnetList.push({"ip_prefix" : cidr[0], "ip_prefix_len" : parseInt(cidr[1], 10)});
        }
    }
    return subnetList;
}

function getipFabricSubnetsJSON() {
    var ipFabricSubnetsObj = {};
    var subnetObj = {};
    var subnetList = getModifiedSubnets();;
    subnetObj = {"subnet" : subnetList}
    ipFabricSubnetsObj = {
        "global-system-config":{
            "_type":ggasnObj._type,
            "uuid":ggasnObj.uuid,
            "ip_fabric_subnets":subnetObj
        }
    };
    return ipFabricSubnetsObj;
}

function initActions() {
    $('#btnEditGblConfigOK').click(function (a) {
        if(!validate()) {
            return false;
        }
        gridGlobalConfig._dataView.setData([]);
        gridGlobalConfig.showGridMessage('loading');
        var globalVRouterConfig = {};
        var ajaxArry = [];
        var fwdOptnURL, fwdOptnActionType;;
        globalVRouterConfig["global-vrouter-config"] = {};
        var vxlanid = $(ddVxLan).val();
        globalVRouterConfig["global-vrouter-config"]["vxlan_network_identifier_mode"] = vxlanid;
        
        var priorities = [];
        var epTuples = $("#epTuples")[0].children;
        var epTuples = $("#epTuples")[0].children;
        if (epTuples && epTuples.length > 0) {
        	var encapsulationLabels = ["MPLS Over GRE","MPLS Over UDP","VxLAN"];
        	var encapsulationValues = ["MPLSoGRE","MPLSoUDP","VXLAN"];

        	for (var i = 0; i < epTuples.length; i++) {
        		var epTuple = $($($(epTuples[i]).find("div")[0]).find("div")[0]);
                var priority = $($(epTuple).find("div.span12")[1]).data("contrailDropdown").text();
                if(encapsulationLabels.indexOf(priority) !== -1) {
                	priorities.push(encapsulationValues[encapsulationLabels.indexOf(priority)]);	
                }
        	}
        }
        if(vxlanid === "configured" && priorities.indexOf("VXLAN") === -1) {
        	showInfoWindow("Encapsulation type 'VxLAN' is required while setting VxLAN identifier mode.", "Input Required");
        	return false;
        }
        windowEditGblConfig.modal('hide');
        if(priorities.length > 0) {
        	globalVRouterConfig["global-vrouter-config"]["encapsulation_priorities"] = {};
        	globalVRouterConfig["global-vrouter-config"]["encapsulation_priorities"]["encapsulation"] = [];
        	for(var i=0; i<priorities.length; i++) {
        		globalVRouterConfig["global-vrouter-config"]["encapsulation_priorities"]["encapsulation"][i] = priorities[i];
        	}
        }
        if(null === configObj["global-vrouter-config"] ||
        	typeof configObj["global-vrouter-config"] === "undefined" ||
        	null === configObj["global-vrouter-config"]["uuid"] ||
        	typeof configObj["global-vrouter-config"]["uuid"] === "undefined") {
            /*doAjaxCall("/api/tenants/config/global-vrouter-configs", "POST", JSON.stringify(globalVRouterConfig),
                    null, "handleCommitFailure");*/
            fwdOptnURL = "/api/tenants/config/global-vrouter-configs";
            fwdOptnActionType = "POST";
        } else {
            var gvrId = configObj["global-vrouter-config"]["uuid"];
            /*doAjaxCall("/api/tenants/config/global-vrouter-config/" + gvrId + "/forwarding-options",
            	"PUT", JSON.stringify(globalVRouterConfig), null, "handleCommitFailure");*/
            fwdOptnURL = "/api/tenants/config/global-vrouter-config/" + gvrId + "/forwarding-options";
            fwdOptnActionType = "PUT";
        }
        //post url for forwarding options
        if(isPriorityChanged(actPriorities, priorities) || (actVxlan !== vxlanid)) {
            ajaxArry.push($.ajax({
               url : fwdOptnURL,
               type : fwdOptnActionType,
               contentType : "application/json; charset=utf-8",
               data : JSON.stringify(globalVRouterConfig)
            }));
        }
        var autoMeshCkd =  $('#ddAutoMesh').data('contrailDropdown').value() === 'enabled' ? true : false;
        var isASNSerialFlow = ($("#txtgasn").val().trim() !== ggasn.toString() && isiBGPAutoMesh != autoMeshCkd) ? true : false;
        if(isASNSerialFlow) {
            doAjaxCall("/api/tenants/admin/config/global-asn", "PUT", JSON.stringify(getGasnJSON()), "successASNUpdate", "failureASNUpdate");
        } else {
            //post url for global asn
            if($("#txtgasn").val().trim() !== ggasn.toString()) {
                ajaxArry.push($.ajax({
                   url : "/api/tenants/admin/config/global-asn",
                   type : "PUT",
                   contentType : "application/json; charset=utf-8",
                   data : JSON.stringify(getGasnJSON())
                }));
            }

            //post url for iBGP Auto Mesh
            if(isiBGPAutoMesh != autoMeshCkd) {
                ajaxArry.push($.ajax({
                   url : "/api/tenants/admin/config/ibgp-auto-mesh",
                   type : "PUT",
                   contentType : "application/json; charset=utf-8",
                   data : JSON.stringify(getiBGPAutoMeshJSON())
                }));
            }
        }
        
        //post url for ip fabric subnets
        if(isIPFabricSubnetChanged(ipFabricSubnets, getModifiedSubnets())) {
            ajaxArry.push($.ajax({
               url : "/api/tenants/admin/config/ip-fabric-subnets",
               type : "PUT",
               contentType : "application/json; charset=utf-8",
               data : JSON.stringify(getipFabricSubnetsJSON())
            }));
        }        
        
        $.when.apply($, ajaxArry).then(
            function () {
                //all success
                if(!isASNSerialFlow) {
                    fetchData();
                }
            },
            function (error) {
                //If atleast one api fails
                showInfoWindow(error.responseText, error.statusText);
                if(!isASNSerialFlow) {
                    fetchData();
                }
            });
    });
}

function successASNUpdate() {
    doAjaxCall("/api/tenants/admin/config/ibgp-auto-mesh", "PUT", JSON.stringify(getiBGPAutoMeshJSON()), "successiAutoMeshUpdate", "failureiAutoMeshUpdate");
}

function failureASNUpdate() {
    fetchData();
}

function successiAutoMeshUpdate() {
    fetchData();
}

function failureiAutoMeshUpdate() {
    fetchData();
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

function handleCommitFailure(result) {
	showInfoWindow("Error in saving configuration.", "Error", result);
	fetchData();
}

function setEditPopupData() {
    $("#ddVxLan").data("contrailDropdown").value(actVxlan);
    $("#epTuples").html("");
    for(var i=0; i<actPriorities.length; i++) {
        var epEntry = createEPEntry(actPriorities[i], i);
        $("#epTuples").append(epEntry);
    }
    $('#txtgasn').val(ggasn);
    var ddAutoMesh = $('#ddAutoMesh').data('contrailDropdown');
    if(isiBGPAutoMesh) {
        ddAutoMesh.value('enabled');
    } else {
        ddAutoMesh.value('disabled');
    }
    $("#subnetTuples").html("");
    for(var i=0; i<ipFabricSubnets.length; i++) {
        var subnetEntry = createSubnetEntry(ipFabricSubnets[i], i);
        $("#subnetTuples").append(subnetEntry);
    }
}

function populateData(result) {
	var vxLanIdentifierModeLabels = ["Auto Configured", "User Configured"];
	var vxLanIdentifierModeValues = ["automatic", "configured"];
	var encapsulationMap = {"MPLSoGRE":"MPLS Over GRE", "MPLSoUDP":"MPLS Over UDP", "VXLAN":"VxLAN"};
    var gridDS = [];
    var priorities;
    $("#epTuples").html("");
	if(null !== result) {
		gvrConfig = result["global-vrouter-config"];
		configObj["global-vrouter-config"] = {};
		configObj["global-vrouter-config"] = result["global-vrouter-config"];
		if(null !== gvrConfig["vxlan_network_identifier_mode"] && 
			typeof gvrConfig["vxlan_network_identifier_mode"] !== "undefined") {
			$("#ddVxLan").data("contrailDropdown").value(gvrConfig["vxlan_network_identifier_mode"]);
		} else {
			//Set default 'automatic' for VxLANIdentifierMode
			$("#ddVxLan").data("contrailDropdown").value(vxLanIdentifierModeValues[0]);
		}
		if(null !== gvrConfig["encapsulation_priorities"] && 
			typeof gvrConfig["encapsulation_priorities"] !== "undefined" &&
			null !== gvrConfig["encapsulation_priorities"]["encapsulation"] &&
			typeof gvrConfig["encapsulation_priorities"]["encapsulation"] !== "undefined" &&
			gvrConfig["encapsulation_priorities"]["encapsulation"].length > 0) {
			priorities = gvrConfig["encapsulation_priorities"]["encapsulation"];
			for(var i=0; i<priorities.length; i++) {
				var epEntry = createEPEntry(priorities[i], i);
				$("#epTuples").append(epEntry);
			}
		} else {
			//Add default MPLSoGRE even if nothing is configured. TBD
			var epEntry = createEPEntry("MPLSoGRE", 0);
			$("#epTuples").append(epEntry);
		}
	} else {
		//Set default 'automatic' for VxLANIdentifierMode
		$("#ddVxLan").data("contrailDropdown").value(vxLanIdentifierModeValues[0]);
		//Add default MPLSoGRE even if nothing is configured. TBD
		var epEntry = createEPEntry("MPLSoUDP", 0);
		$("#epTuples").append(epEntry);
		epEntry = createEPEntry("MPLSoGRE", 1);
		$("#epTuples").append(epEntry);
		epEntry = createEPEntry("VXLAN", 2);
		$("#epTuples").append(epEntry);
	}
    $('#txtgasn').val(ggasn);
    var ddAutoMesh = $('#ddAutoMesh').data('contrailDropdown');
    if(isiBGPAutoMesh) {
        ddAutoMesh.value('enabled');
    } else {
        ddAutoMesh.value('disabled');
    }
    //prepare grid data
    var ddVxLan = $("#ddVxLan").data("contrailDropdown");
    gridDS.push({'property' : 'VxLAN Identifier Mode', 'value' : ddVxLan.text()});
    actVxlan = ddVxLan.value();
    if(priorities != null) {
        actPriorities = priorities;
        var gridPriorities = [];
        for(var i = 0; i < priorities.length; i++) {
            gridPriorities.push(priorities[i]);
        }
        gridDS.push({'property' : 'Encapsulation Priority Order', 
            'value' : gridPriorities});
    } else {
        actPriorities = ["MPLSoUDP", "MPLSoGRE", "VXLAN"];
        gridDS.push({'property' : 'Encapsulation Priority Order', 'value' : ["MPLS Over UDP", "MPLS Over GRE", "VxLAN"]});
    }
    gridDS.push({'property' : 'Global ASN', 'value' : ggasn});
    gridDS.push({'property' : 'iBGP Auto Mesh', 'value' : isiBGPAutoMesh});
    gridDS.push({'property' : 'IP Fabric Subnets', 'value':ipFabricSubnets});
    gridGlobalConfig._dataView.setData(gridDS);
}


function fetchData() {
    configObj["global-vrouter-config"] = {};
   gridGlobalConfig._dataView.setData([]);
   gridGlobalConfig.showGridMessage('loading');
    doAjaxCall(
    	"/api/tenants/config/global-vrouter-config", "GET",
        null, "successHandlerForGblVrouterConfig", "failureHandlerForGblVrouterConfig", null, null);
}

function successHandlerForGblVrouterConfig(gblVrouterCfgData) {
    fetchGblSystemConfigData(gblVrouterCfgData);
}

function failureHandlerForGblVrouterConfig(error) {
    gridGlobalConfig.showGridMessage('errorGettingData');
}

function fetchGblSystemConfigData(gblVrouterCfgData) {
    $.ajax({
        type:"GET",
        cache:false,
        url:"/api/tenants/admin/config/global-asn"
    }).success(function (res) {
            ggasnObj = jsonPath(res, "$.*")[0];
            ggasn = ggasnObj["autonomous_system"];
            isiBGPAutoMesh = ggasnObj['ibgp_auto_mesh'] == null ? true : ggasnObj['ibgp_auto_mesh'];
            ipFabricSubnets = ggasnObj['ip_fabric_subnets'] != null && ggasnObj['ip_fabric_subnets']['subnet'] != null
                                  && ggasnObj['ip_fabric_subnets']['subnet'].length > 0 ? ggasnObj['ip_fabric_subnets']['subnet'] : [];
            populateData(gblVrouterCfgData);
        }).fail(function (msg) {
            if(msg && msg.statusText !== "abort") {
                //showInfoWindow("Error in getting Global ASN.", "Error");
                gridGlobalConfig.showGridMessage('errorGettingData');
            }
        });
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function createEPEntry(ep, len) {
	var encapsulationLabels = ["MPLS Over GRE","MPLS Over UDP","VxLAN"];
	var encapsulationValues = ["MPLSoGRE","MPLSoUDP","VXLAN"];

    var selectPriorities = document.createElement("div");
    selectPriorities.className = "span12";

    var divPriorities = document.createElement("div");
    divPriorities.className = "span5 margin-0-0-5";
    divPriorities.setAttribute("style", "width: 44%");
    divPriorities.appendChild(selectPriorities);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendEPEntry(this);");
    iBtnAddRule.setAttribute("title", "Add Encapsulation Priority below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteEPEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete Encapsulation Priority");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divPriorities);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.appendChild(divRowFluidMargin5);

    $(selectPriorities).contrailDropdown({
        data: [
            {
                id: encapsulationValues[0],
                text: encapsulationLabels[0]
            },
            {
                id: encapsulationValues[1],
                text: encapsulationLabels[1]
            },
            {
                id: encapsulationValues[2],
                text: encapsulationLabels[2]
            }
        ]
    });
    
    if (null !== ep && typeof ep !== "undefined") {
    	$(selectPriorities).data("contrailDropdown").value(ep);
    } else {
        var existing = [];
        var epTuples = $("#epTuples")[0].children;
        if (epTuples && epTuples.length > 0) {
        	for (var i = 0; i < epTuples.length; i++) {
        		var epTuple = $($(epTuples[i]).find("div")[0]).children();
                var priority = $($(epTuple).find("div.select2-offscreen")[0]).data("contrailDropdown").text();
                existing.push(priority);
        	}
        	var available = encapsulationLabels.diff(existing);
        	if(available.length >0)
        		$(selectPriorities).data("contrailDropdown").text(available[0]);
        }
    }

    return rootDiv;
}

function appendEPEntry(who, defaultRow) {
	var len = $("#epTuples").children().length;
	if(len >= 3) {
		return false;
	}
    var epEntry = createEPEntry(null, len);
    if (defaultRow) {
        $("#epTuples").append($(epEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(epEntry, parentEl.nextSibling);
    }
}

function deleteEPEntry(who) {
    var epTuples = $("#epTuples")[0].children;
    if (epTuples && epTuples.length == 1) {
        showInfoWindow("Atleast one encapsulation priority is required.", "Invalid Action");
        return false;
    }
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearEPEntries() {
    var tuples = $("#epTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#epTuples").empty();
    }
}

function createSubnetEntry(subnet, len) {
    dynamicID++;
    id =  dynamicID;
    var inputTxtPoolName = document.createElement("input");
    inputTxtPoolName.type = "text";
    inputTxtPoolName.className = "span12";
    inputTxtPoolName.setAttribute("placeholder", "CIDR");
    inputTxtPoolName.setAttribute("id","subnetTuples_"+id+"_txtCIDR");
    var divPoolName = document.createElement("div");
    divPoolName.className = "span3";
    divPoolName.setAttribute("style", "width:38%");
    divPoolName.appendChild(inputTxtPoolName);

    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendSubnetEntry(this);");
    iBtnAddRule.setAttribute("title", "Add CIDR below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteSubnetEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete FIP Pool");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin5 = document.createElement("div");
    divRowFluidMargin5.className = "row-fluid margin-0-0-5";
    divRowFluidMargin5.appendChild(divPoolName);
    //divRowFluidMargin5.appendChild(divProjects);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin5.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "subnetTuples_"+id;
    rootDiv.appendChild(divRowFluidMargin5);

    if (null !== subnet && typeof subnet !== "undefined") {
        $(inputTxtPoolName).val(subnet.ip_prefix + '/' + subnet.ip_prefix_len);
    } else {
        $(inputTxtPoolName).val('');
    }

    return rootDiv;
}

function validateSubnetEntry() {
    var len = $("#subnetTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var cidr =
                $($($($("#subnetTuples").children()[i]).find(".span3")[0]).find("input")).val().trim();
            if (typeof cidr === "undefined" || cidr === "") {
                showInfoWindow("Enter CIDR", "Input required");
                return false;
            }
            if ("" === cidr.trim() || !isValidIP(cidr.trim())) {
                showInfoWindow("Enter a valid CIDR", "Invalid input in CIDR");
                return false;
            }
            if(cidr.split("/").length != 2) {
                showInfoWindow("Enter a valid CIDR in xxx.xxx.xxx.xxx/xx format", "Invalid input in CIDR");
                return false;
            }
        }
    }
    return true;
}

function appendSubnetEntry(who, defaultRow) {
    if(validateSubnetEntry() === false)
        return false;

    var fipEntry = createSubnetEntry(null, $("#subnetTuples").children().length);
    if (defaultRow) {
        $("#subnetTuples").prepend($(fipEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(fipEntry, parentEl.nextSibling);
    }
    //scrollUp("#windowCreateVN",fipEntry,false);
}

function deleteSubnetEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearSubnetEntries() {
    var tuples = $("#subnetTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#subnetTuples").empty();
    }
}

function validate() {
    var vxlanid = $(ddVxLan).val();
    var priorities = [];
    var epTuples = $("#epTuples")[0].children;
    if (epTuples && epTuples.length > 0) {
    	var encapsulationLabels = ["MPLS Over GRE","MPLS Over UDP","VxLAN"];
    	var encapsulationValues = ["MPLSoGRE","MPLSoUDP","VXLAN"];

    	for (var i = 0; i < epTuples.length; i++) {
            var epTuple = $($($(epTuples[i]).find("div")[0]).find("div")[0]);
            var priority = $($(epTuple).find("div.span12")[1]).data("contrailDropdown").text();
            if(encapsulationLabels.indexOf(priority) !== -1) {
            	priorities.push(encapsulationValues[encapsulationLabels.indexOf(priority)]);	
            }
    	}
        var unique=priorities.filter(function(itm,i,a){
            return i==priorities.indexOf(itm);
        });
        if(priorities.length != unique.length){
            showInfoWindow("Encapsulation cannot be same.", "Input Required");
            return false;
        }
    }
    if(vxlanid === "configured" && priorities.indexOf("VXLAN") === -1) {
    	showInfoWindow("Encapsulation type 'VxLAN' is required while setting VxLAN identifier mode.", "Input Required");
    	return false;
    }
	return true;
}

function destroy() {
    clearEPEntries();

    btnSaveFwdOptions = $("#btnSaveFwdOptions");
    if(isSet(btnSaveFwdOptions)) {
        btnSaveFwdOptions.remove();
        btnSaveFwdOptions = $();
    }

    btnCnfSaveCancel = $("#btnCnfSaveCancel");
    if(isSet(btnCnfSaveCancel)) {
        btnCnfSaveCancel.remove();
        btnCnfSaveCancel = $();
    }

    btnCnfSaveOK = $("#btnCnfSaveOK");
    if(isSet(btnCnfSaveOK)) {
        btnCnfSaveOK.remove();
        btnCnfSaveOK = $();
    }
    
    ddVxLan = $("#ddVxLan").data("contrailDropdown");
    if(isSet(ddVxLan)) {
        ddVxLan.destroy();
        ddVxLan = $();
    }

    confirmMainSave = $("#confirmMainSave");
    if(isSet(confirmMainSave)) {
        confirmMainSave.remove();
        confirmMainSave = $();
    }

    var fwdOptionsTemplate = $("#fwdoptions-config-template");
    if(isSet(fwdOptionsTemplate)) {
        fwdOptionsTemplate.remove();
        fwdOptionsTemplate = $();
    }
}
