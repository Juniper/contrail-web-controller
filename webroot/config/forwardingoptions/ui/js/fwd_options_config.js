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
	btnSaveFwdOptions = $("#btnSaveFwdOptions");
	btnCnfSaveOK = $("#btnCnfSaveOK");
	btnCnfSaveCancel = $("#btnCnfSaveCancel");
    ddVxLan = $("#ddVxLan").contrailDropdown({
        data: [{id:"automatic", text:'Automatic'}, {id:"configured", text:'Configured'}]
    });


	$('body').append($("#confirmMainSave"));
	confirmMainSave = $("#confirmMainSave");
	confirmMainSave.modal({backdrop:'static', keyboard: false, show:false});
}

function initActions() {
	btnSaveFwdOptions.click(function (e) {
        e.preventDefault();
        if(validate() === true)
        confirmMainSave.modal('show');
        return false;
    });

	btnCnfSaveCancel.click(function (a) {
    	confirmMainSave.modal('hide');
    });

    btnCnfSaveOK.click(function (a) {
        var globalVRouterConfig = {};
        globalVRouterConfig["global-vrouter-config"] = {};
        var vxlanid = $(ddVxLan).val();
        globalVRouterConfig["global-vrouter-config"]["vxlan_network_identifier_mode"] = vxlanid;
        
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
        }
        
        if(vxlanid === "configured" && priorities.indexOf("VXLAN") === -1) {
        	showInfoWindow("Encapsulation type 'VxLAN' is required while setting VxLAN identifier mode.", "Input Required");
        	return false;
        }
        
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
            doAjaxCall("/api/tenants/config/global-vrouter-configs", "POST", JSON.stringify(globalVRouterConfig),
                    null, "handleCommitFailure");
        } else {
            var gvrId = configObj["global-vrouter-config"]["uuid"];
            doAjaxCall("/api/tenants/config/global-vrouter-config/" + gvrId + "/forwarding-options",
            	"PUT", JSON.stringify(globalVRouterConfig), null, "handleCommitFailure");
        }
        
        confirmMainSave.modal('hide');
    });

}

function handleCommitFailure(result) {
	showInfoWindow("Error in saving configuration.", "Error", result);
	fetchData();
}

function populateData(result) {
	var vxLanIdentifierModeLabels = ["Automatic", "Configured"];
	var vxLanIdentifierModeValues = ["automatic", "configured"];

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
			var priorities = gvrConfig["encapsulation_priorities"]["encapsulation"];
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
		var epEntry = createEPEntry("MPLSoGRE", 0);
		$("#epTuples").append(epEntry);
		epEntry = createEPEntry("MPLSoUDP", 1);
		$("#epTuples").append(epEntry);
		epEntry = createEPEntry("VXLAN", 2);
		$("#epTuples").append(epEntry);
	}
}

function fetchData() {
    configObj["global-vrouter-config"] = {};
    doAjaxCall(
    	"/api/tenants/config/global-vrouter-config", "GET",
        null, "populateData", null, null, null);
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
    divPriorities.className = "span2 margin-0-0-5";
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
                var priority = $($(epTuple).find("div")[3]).data("contrailDropdown").text();
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
