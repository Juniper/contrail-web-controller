/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

networkpolicyConfigObj = new networkPolicyConfigObj();
var iconNetwork ='icon-contrail-virtual-network', iconPolicy ='icon-contrail-network-policy', iconSubnet ='icon-contrail-network-ipam';
function networkPolicyConfigObj() {
    //Variable definitions
    //Dropdowns
    var ddDomain, ddProject, ddIPOptions;

    //Comboboxes

    //Grids
    var gridPolicy;

    //Buttons
    var btnCreatePolicy, btnDeletePolicy, btnCreatePolicyCancel, btnCreatePolicyOK, btnAddRule, btnDeleteRule,
    btnRemovePopupOK, btnRemovePopupCancel, btnCnfRemoveMainPopupOK, btnCnfRemoveMainPopupCancel;

    //Textboxes
    var txtPolicyName;


    //Windows
    var windowCreatePolicy, confirmRemove, confirmMainRemove;

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
    this.fetchDataForGridPolicy = fetchDataForGridPolicy;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.handleProjects = handleProjects;
    this.deletePolicy = deletePolicy;
    this.showPolicyEditWindow = showPolicyEditWindow;
    this.closeCreatePolicyWindow = closeCreatePolicyWindow;
    this.successHandlerForGridPolicy = successHandlerForGridPolicy;
    this.failureHandlerForGridPolicy = failureHandlerForGridPolicy;
    this.createPolicySuccessCb = createPolicySuccessCb;
    this.createPolicyFailureCb = createPolicyFailureCb;
    this.validate = validate;
    this.dynamicID = dynamicID;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#policy-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_net_policies';

    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function fetchData() {
    fetchDomains("populateDomains", "failureHandlerForGridPolicy");
}

function initComponents() {
    $("#gridPolicy").contrailGrid({
        header : {
            title : {
                text : 'Policies',
                //cssClass : 'blue',
                //icon : 'icon-list',
                //iconCssClass : 'blue'
            },
            customControls: ['<a id="btnDeletePolicy" class="disabled-link" title="Delete Network Policy(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreatePolicy" onclick="showPolicyEditWindow(\'add\');return false;" title="Create Network Policy"><i class="icon-plus"></i></a>',
                'Project:<div id="ddProjectSwitcher" />',
                'Domain: <div id="ddDomainSwitcher" />']
        },
        columnHeader : {
            columns : [
            {
                id:"NetworkPolicy", 
                field:"NetworkPolicy",
                name:"Policy",
                width: 200,
                sortable: true
            },
            {
                id: "AssociatedNetworks",
                field: "AssociatedNetworks",
                name: "Associated Networks",
                width: 150,
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.AssociatedNetworks === "object") {
                       for(var i=0; i<dc.AssociatedNetworks.length, i<2; i++) {
                           if(typeof dc.AssociatedNetworks[i] !== "undefined") {
                               returnString += dc.AssociatedNetworks[i] + "<br>";
                           }
                       }
                       if(dc.AssociatedNetworks.length > 2) {
                       returnString += '<span class="moredataText">(' + (dc.AssociatedNetworks.length-2) + ' more)</span> \
                           <span class="moredata" style="display:none;" ></span>';
                       }
                    }
                    return returnString;
                }
            },
            {
                id: "PolicyRules",
                field: "PolicyRules",
                name: "Rules",
                width: 650,
                formatter: function(r, c, v, cd, dc) {
                    var returnString = "";
                    if(typeof dc.PolicyRules === "object") {
                       for(var i=0; i<dc.PolicyRules.length, i<2; i++) {
                           if(typeof dc.PolicyRules[i] !== "undefined") {
                               returnString += dc.PolicyRules[i] + "<br>";
                           }
                       }
                       if(dc.PolicyRules.length > 2) {
                       returnString += '<span class="moredataText">(' + (dc.PolicyRules.length-2) + ' more)</span> \
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
                    onNothingChecked: function(e){
                        $('#btnDeletePolicy').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeletePolicy').removeClass('disabled-link');
                    }
                },
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showPolicyEditWindow('edit',rowIndex);
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
                detail:{
                    template: $("#gridPolicyDetailTemplate").html()
                }
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading Network Policies..',
                },
                empty: {
                    text: 'No Network Policies Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Network Policies.'
                }
            }
        }
    });

    gridPolicy = $("#gridPolicy").data("contrailGrid");
    gridPolicy.showGridMessage("loading");

    btnCreatePolicy = $("#btnCreatePolicy");
    btnDeletePolicy = $("#btnDeletePolicy");
    btnAddRule = $("#btnAddRule");
    btnDeleteRule = $("#btnDeleteRule");
    btnCreatePolicyCancel = $("#btnCreatePolicyCancel");
    btnCreatePolicyOK = $("#btnCreatePolicyOK");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");

    txtPolicyName = $("#txtPolicyName");
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
    windowCreatePolicy = $("#windowCreatePolicy");
    windowCreatePolicy.on("hide", closeCreatePolicyWindow);
    windowCreatePolicy.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function deletePolicy(selected_rows) {
    btnDeletePolicy.attr("disabled","disabled");
    var deleteAjaxs = [];
    if (selected_rows && selected_rows.length > 0) {
        var cbParams = {};
        cbParams.selected_rows = selected_rows;
        cbParams.url = "/api/tenants/config/policy/"; 
        cbParams.urlField = "PolicyUUID";
        cbParams.fetchDataFunction = "fetchDataForGridPolicy";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting policies - ";
        cbParams.errorField = "NetworkPolicy";
        deleteObject(cbParams);
    }
}

function initActions() {
    btnDeletePolicy.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide')
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        var selected_rows = $("#gridPolicy").data("contrailGrid").getCheckedRows();
        deletePolicy(selected_rows);
        confirmMainRemove.modal('hide');
    });

    btnCreatePolicyCancel.click(function (a) {
        windowCreatePolicy.hide();
    });

    btnCreatePolicyOK.click(function (a) {
        if($(this).hasClass('disabled-link')) { 
            return;
        }    
        if (validate() !== true)
            return;

        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
            gridPolicy.showGridMessage('errorGettingData');
            return;
        }

        var policyConfig = {};
        policyConfig["network-policy"] = {};
        policyConfig["network-policy"]["parent_type"] = "project";

        policyConfig["network-policy"]["fq_name"] = [];
        policyConfig["network-policy"]["fq_name"][0] = selectedDomain;
        policyConfig["network-policy"]["fq_name"][1] = selectedProject;
        policyConfig["network-policy"]["fq_name"][2] = txtPolicyName.val();

        var ruleTuples = $("#ruleTuples")[0].children;
        if (ruleTuples && ruleTuples.length > 0) {
            policyConfig["network-policy"]["network_policy_entries"] = {};
            policyConfig["network-policy"]["network_policy_entries"]["policy_rule"] = [];
            for (var i = 0; i < ruleTuples.length; i++) {
                policyConfig["network-policy"]["network_policy_entries"]["policy_rule"][i] = {};
                var rule = policyConfig["network-policy"]["network_policy_entries"]["policy_rule"][i];

                var ruleTuple = $($(ruleTuples[i]).find("div")[0]).children();
                var actDropDown = $($(ruleTuple[0]).find("div")[1]).data("contrailDropdown") ? 
                    $($(ruleTuple[0]).find("div")[1]).data("contrailDropdown") : $($(ruleTuple[0]).find("div")[3]).data("contrailDropdown"); 
                var action = actDropDown.text();
                if(action.trim() === "") {
                    action = "pass";
                }
                action = action.toLowerCase();

                if(actDropDown.isEnabled() === false){
                    action = null;
                }
                
                var protoCombobox = $($(ruleTuple[1]).find("div")[0]).data("contrailCombobox") ?
                    $($(ruleTuple[1]).find("div")[0]).data("contrailCombobox") : $($(ruleTuple[1]).find("div")[1]).data("contrailCombobox")
                var protocol = protoCombobox.text();
                if (protocol == "") {
                    protocol = "any";
                }
                var srcDropdown = $($(ruleTuple).find('div[id*="selectSrcNetwork_"]')[1]).data('contrailDropdown');
                var srcVN = srcDropdown.value();
                srcVN = checkValidSourceNetwork(srcVN);
                if(srcVN.toLowerCase() != "any" && srcVN.toLowerCase() != "local"){
                    srcVN = getFQNofVN(selectedDomain, selectedProject, srcVN);
                }
                var srcPorts = $($(ruleTuple[3]).find("input")).val();

                var direction = $($(ruleTuple[4]).find("div.span12")[1]).data('contrailDropdown').value();
                if($($(ruleTuple[4]).find("div.span12")[1]).data("contrailDropdown").isEnabled() === false) {
                    direction = "<>";
                }
                if (direction !== "<>" && direction !== ">") {
                    direction = "<>";
                }
                
                var destDropdown = $($(ruleTuple).find('div[id*="selectDestNetwork_"]')[1]).data("contrailDropdown");
                var destVN = destDropdown.value();
                destVN = checkValidDestinationNetwork(destVN);
                if(destVN.toLowerCase() != "any" && destVN.toLowerCase() != "local"){
                    destVN = getFQNofVN(selectedDomain, selectedProject, destVN);
                }
                var destPorts = $($(ruleTuple[6]).find("input")).val();
                var loggingEnabled = $($(ruleTuple[7]).find("input"))[0].checked;
                var applyServicesEnabled = $($(ruleTuple[8]).find("input"))[0].checked;
                var mirrorServicesEnabled = $($(ruleTuple[9]).find("input"))[0].checked
                
                var applyServices = [];
                var mirrorTo = [];
                if(applyServicesEnabled == true) {
                    var id = $($(ruleTuple[8]).find("input"))[0].id;
                    var div_id = id + "_root";
                    applyServices = 
                        //$($("#" + div_id).find("select")).data("contrailMultiselect").value();
                        $($("#" + div_id).find("div.span11")[1]).data("contrailMultiselect").value();
                }
                
                if(mirrorServicesEnabled == true) {
                    var id = $($(ruleTuple[9]).find("input"))[0].id;
                    var div_id = id + "_root";
                    var div = $("#" + div_id);
                    mirrorTo = 
                        //$($("#" + div_id).find("select")).data("contrailMultiSelect").value();
                        $($("#" + div_id).find("div.span11")[1]).data("contrailMultiselect").value();
                }

                rule["application"] = [];
                rule["rule_sequence"] = {};
                rule["rule_sequence"]["major"] = -1;
                rule["rule_sequence"]["minor"] = -1;

                rule["direction"] = direction;
                rule["protocol"] = protocol.toLowerCase();

                rule["action_list"] = {};
                rule["action_list"]["simple_action"] = action;
                rule["action_list"]["log"] = loggingEnabled;
                rule["action_list"]["gateway_name"] = null;
                
                if (applyServices && applyServices.length > 0) {
                    for(var asCount=0; asCount<applyServices.length; asCount++) {
                        if(applyServices[asCount].indexOf(":") == -1) {
                            applyServices[asCount] =
                            selectedDomain + ":" + selectedProject + 
                            ":" + applyServices[asCount];
                        }
                    }
                    rule["action_list"]["apply_service"] = applyServices;
                } else {
                    rule["action_list"]["apply_service"] = null;
                }

                if(mirrorTo && mirrorTo.length > 0) {
                    rule["action_list"]["mirror_to"] = {};
                    for(var msCount=0; msCount<mirrorTo.length; msCount++) {
                        if(mirrorTo[msCount].indexOf(":") == -1) {
                            mirrorTo[msCount] =
                            selectedDomain + ":" + selectedProject + 
                            ":" + mirrorTo[msCount];
                        }
                    }
                    rule["action_list"]["mirror_to"] = {"analyzer_name":mirrorTo[0]};
                }
                else {
                    rule["action_list"]["mirror_to"] = null;
                }

                rule["src_addresses"] = [];
                rule["src_addresses"][0] = {};
                rule["src_addresses"][0]["security_group"] = null;
                rule["src_addresses"][0]["virtual_network"] = null;
                rule["src_addresses"][0]["network_policy"] = null;
                rule["src_addresses"][0]["subnet"] = null;
                var srcGrpName = getSelectedGroupName($($($(ruleTuple[2]).find('a'))).find('i'));
                if(srcGrpName === 'CIDR') { 
                    srcVN = srcVN.split('/');
                    var srcVNPostObj;
                    if(srcVN.length == 2) {
                        srcVNPostObj = {"ip_prefix" : srcVN[0], "ip_prefix_len" : parseInt(srcVN[1])}
                    }
                    rule["src_addresses"][0]["subnet"] = srcVNPostObj;
                } else if(srcGrpName === "Networks") {
                    if (srcVN && "" !== srcVN) {
                        if ("any" === srcVN.toLowerCase())
                            rule["src_addresses"][0]["virtual_network"] = "any";
                        else {
                            if ("local" === srcVN.toLowerCase())
                                rule["src_addresses"][0]["virtual_network"] = "local";
                            else {
                                if(srcVN.indexOf(":") !== -1) {
                                    rule["src_addresses"][0]["virtual_network"] = srcVN;
                                } else {
                                    rule["src_addresses"][0]["virtual_network"] = [selectedDomain, selectedProject, srcVN].join(":");   
                                }
                            }
                        }
                    }
                } else if(srcGrpName === "Policies") {
                    srcVN = srcVN.split("~`~")[0];
                    srcVN = getFQNofPolicy(selectedDomain, selectedProject, srcVN);
                    if(srcVN.indexOf(':') !== -1) {
                        rule["src_addresses"][0]["network_policy"] = srcVN;          
                    } else {
                        rule["src_addresses"][0]["network_policy"] = [selectedDomain, selectedProject, srcVN].join(":"); 
                    }    
                }
                rule["dst_addresses"] = [];
                rule["dst_addresses"][0] = {};
                rule["dst_addresses"][0]["security_group"] = null;
                rule["dst_addresses"][0]["virtual_network"] = null;
                rule["dst_addresses"][0]["subnet"] = null;
                rule["dst_addresses"][0]["network_policy"] = null;
                var destGrpName = getSelectedGroupName($($($(ruleTuple[5]).find('a'))).find('i'));
                if(destGrpName === "CIDR") {
                    destVN = destVN.split('/');
                    var destVNPostObj;
                    if(destVN.length == 2) {
                        destVNPostObj = {"ip_prefix" : destVN[0], "ip_prefix_len" : parseInt(destVN[1])}
                    }
                    rule["dst_addresses"][0]["subnet"] = destVNPostObj;
                } else if(destGrpName === "Networks") {
                    if (destVN && "" !== destVN) {
                        if ("any" === destVN.toLowerCase())
                            rule["dst_addresses"][0]["virtual_network"] = "any";
                        else {
                            if ("local" === destVN.toLowerCase())
                                rule["dst_addresses"][0]["virtual_network"] = "local";
                            else {
                                if(destVN.indexOf(":") !== -1) {
                                    rule["dst_addresses"][0]["virtual_network"] = destVN;
                                } else {
                                    rule["dst_addresses"][0]["virtual_network"] = [selectedDomain, selectedProject, destVN].join(":");  
                                }
                            }
                        }
                    }
                } else if(destGrpName === "Policies") {
                    destVN = destVN.split("~`~")[0];
                    destVN = getFQNofPolicy(selectedDomain, selectedProject, destVN);   
                    if(destVN.indexOf(":") !== -1) {                   
                        rule["dst_addresses"][0]["network_policy"] = destVN;
                    } else {
                        rule["dst_addresses"][0]["network_policy"] = [selectedDomain, selectedProject, destVN].join(":");
                    }    
                }

                var startPortsArray = getStartPort(srcPorts);
                if (startPortsArray != -1)
                    startPortsArray = startPortsArray.split(",");

                var endPortsArray = getEndPort(srcPorts);
                if (endPortsArray != -1)
                    endPortsArray = endPortsArray.split(",");

                if (startPortsArray != -1 && endPortsArray != -1 &&
                    startPortsArray.length > 0 && endPortsArray.length > 0) {
                    //if(dontAllowPortsIfServiceEnabled(applyServicesEnabled, true, false) === true &&
                    if(dontAllowPortsIfServiceEnabled(mirrorServicesEnabled, true, true) === true) {
                        rule["src_ports"] = [];
                        if(checkValidPortRange(startPortsArray, endPortsArray, true) === true) {
                            for (var j = 0; j < startPortsArray.length; j++) {
                                rule["src_ports"][j] = {};
                                rule["src_ports"][j]["start_port"] = parseInt(startPortsArray[j]);
                                rule["src_ports"][j]["end_port"] = parseInt(endPortsArray[j]);
                            }
                        } else {
                            return false;
                        }
                    } else
                        return false;
                } else {
                    rule["src_ports"] = [{}];
                    rule["src_ports"][0]["start_port"] = -1;
                    rule["src_ports"][0]["end_port"] = -1;
                }

                startPortsArray = getStartPort(destPorts);
                if (startPortsArray != -1)
                    startPortsArray = startPortsArray.split(",");

                endPortsArray = getEndPort(destPorts);
                if (endPortsArray != -1)
                    endPortsArray = endPortsArray.split(",");

                if (startPortsArray != -1 && endPortsArray != -1 &&
                    startPortsArray.length > 0 && endPortsArray.length > 0) {
                    //if(dontAllowPortsIfServiceEnabled(applyServicesEnabled, false, false) === true &&
                    if(dontAllowPortsIfServiceEnabled(mirrorServicesEnabled, false, true) === true) {
                        rule["dst_ports"] = [];
                        if(checkValidPortRange(startPortsArray, endPortsArray)) {
                            for (var j = 0; j < startPortsArray.length; j++) {
                                rule["dst_ports"][j] = {};
                                rule["dst_ports"][j]["start_port"] = parseInt(startPortsArray[j]);
                                rule["dst_ports"][j]["end_port"] = parseInt(endPortsArray[j]);
                            }
                        } else {
                            return false;
                        }
                    } else
                        return false;
                } else {
                    rule["dst_ports"] = [{}];
                    rule["dst_ports"][0]["start_port"] = -1;
                    rule["dst_ports"][0]["end_port"] = -1;
                }
            }
        }
        policyConfig["network-policy"]["display_name"] = policyConfig["network-policy"]["fq_name"][policyConfig["network-policy"]["fq_name"].length-1];
        //console.log(policyConfig);
        if (txtPolicyName[0].disabled == true)
            mode = "edit";
        else
            mode = "add";
        //mode = "";
        if (mode === "add") {
            doAjaxCall("/api/tenants/config/policys", "POST", JSON.stringify(policyConfig),
                "createPolicySuccessCb", "createPolicyFailureCb");
        }
        else if (mode === "edit") {
            var policyUUID = jsonPath(configObj, "$.network-policys[?(@.fq_name[2]=='" + txtPolicyName.val() + "')]")[0].uuid;
            policyConfig["network-policy"]["uuid"] = policyUUID;
            doAjaxCall("/api/tenants/config/policy/" + policyUUID, "PUT", JSON.stringify(policyConfig),
                "createPolicySuccessCb", "createPolicyFailureCb");
        }
        windowCreatePolicy.modal("hide");
    });
}

function allowOnlyProtocolAnyIfServiceEnabled(serviceEnabled, protocol, mirrorService) {
    // Only Protocol ANY is allowed when service chaining is selected.
    var msg = "Only 'ANY' protocol allowed while " + 
        (mirrorService === true ? "mirroring" : "applying") + " services.";
    if(serviceEnabled === true && protocol !== "any") {
        showInfoWindow(msg, "Invalid Rule");
        return false;
    }
    return true;
}

function dontAllowPortsIfServiceEnabled(serviceEnabled, sourcePort, mirrorService) {
    // Only port(source and/or destination) ANY is allowed when service chaining is selected.   
    var msg = 
        "Only 'ANY' " + (sourcePort === true ? "source " : "destination ") + 
        "port allowed while " + (mirrorService === true ? "mirroring " : "applying ") + "services.";
    if(serviceEnabled === true) {
        showInfoWindow(msg, "Invalid Rule");
        return false;
    }
    return true;
}

function getCurrentNetRuleDropdown(e, type) {
    var curDropdown = $($(e.parentNode.parentNode).find('div[ id*= "' + type + '"]')[1]).data('contrailDropdown');        
    return curDropdown;        
}

function prepareNewInstanceValues(ds, val) {
   var newValue = '';
   val = val.split(',');   
   for(var i = 0; i < ds.length; i++) {
       for(var j = 0; j < val.length; j++) {
           if(val[j] === ds[i].text) {
               if(newValue === '') {
                   newValue = ds[i].value;
               } else {
                   newValue = ',' + ds[i].value;
               }
           }
       }
   }
   return newValue;
}

function toggleApplyServiceDiv(e, nonAnalyzerInsts, val) {
    if(e.checked === true) {
         var actDropDown = $($(e.parentNode.parentNode.children[0]).find("div.span12")).data('contrailDropdown') ?
            $($(e.parentNode.parentNode.children[0]).find("div.span12")).data('contrailDropdown') : $($(e.parentNode.parentNode.children[0]).find("div.span12")[1]).data('contrailDropdown');     
        actDropDown.enable(false);
        $($(e.parentNode.parentNode.children[4]).find("div.span12")[1]).data("contrailDropdown").enable(false);
        //Select always 'Pass' if applying service
        actDropDown.text("PASS");
        //Select always '<>' (Bidirectional) if applying service
        $($(e.parentNode.parentNode.children[4]).find("div.span12")[1]).data("contrailDropdown").value("<>");

        
        //Disabling 'any' on Src VN. 
        //Disabling 'local' on Src vn.
        var srcDropdown = getCurrentNetRuleDropdown(e,'selectSrcNetwork_');
        if(srcDropdown) {
            var selSrcTxt = srcDropdown.value();
            verifySrcDestSelectedItem(selSrcTxt, srcDropdown, 
                $($($(e.parentNode.parentNode.children[2]).find('a')).find('i')), undefined, false);
        }    
        //Disabling 'any' on Dest VN.
        //Disabling 'local' on Dest vn.
        var destDropdown = getCurrentNetRuleDropdown(e, 'selectDestNetwork_');
        if(destDropdown) {
            var selDestTxt = destDropdown.value();   
            verifySrcDestSelectedItem(selDestTxt, destDropdown,
                $($($(e.parentNode.parentNode.children[5]).find('a')).find('i')), undefined, false);
        }    

        var tupleDiv = e.parentNode.parentNode.parentNode.children; 
        if(tupleDiv.length > 1) {
            //Either Apply service or Mirror service div is shown.
            for(var i=0; i<tupleDiv.length; i++) {
                var rootDiv = $(tupleDiv[i]);
                if(rootDiv.attr("id") && rootDiv.attr("id").indexOf("apply_service") != -1) {
                    rootDiv.show();
                    return;
                }
            }
        }
        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
        
        var servicesLbl = document.createElement("label");
        servicesLbl.setAttribute("id", "svcLbl");        
        servicesLbl.innerHTML =  "Services  ";
        servicesLbl.className = "span1";
        servicesLbl.setAttribute('style','margin-top:5px');
        var msApplyServices = document.createElement("div");
        msApplyServices.className = "span11";
        
        var div = document.createElement("div");
        div.className = "row-fluid margin-0-0-5";
        div.appendChild(servicesLbl);
        div.appendChild(msApplyServices);
        var rootDiv = document.createElement("div");
        rootDiv.id = e.id + "_root";
        rootDiv.appendChild(div);
        
        $(msApplyServices).contrailMultiselect({
            dataTextField : 'text',
            dataValueField : 'value', 
            placeholder: "Select a service to apply...",
            width:'852px'
        });

        if (nonAnalyzerInsts && nonAnalyzerInsts.length > 0) {
            nonAnalyzerInsts = nonAnalyzerInsts.split(",");
            var dsInsts = [];
            for(var n = 0; n < nonAnalyzerInsts.length; n++) {
                var instTxt = nonAnalyzerInsts[n].split(':');
                if(instTxt.length === 3) {
                    instTxt = instTxt[2] + ' (' + instTxt[0] + ':' + instTxt[1] + ')';
                } else {
                    instTxt = instTxt[0];
                }
                dsInsts.push({value : nonAnalyzerInsts[n], text : instTxt})                
            }
            $(msApplyServices).data("contrailMultiselect").setData(dsInsts);
            if(val && val.length > 0) {
                //val = prepareNewInstanceValues(dsInsts, val);
                val = val.split(",");
                for(var i=0; i<val.length; i++) {
                    if(val[i].split(":")[0] === selectedDomain &&
                        val[i].split(":")[1] === selectedProject) {
                        val[i] = val[i].split(":")[2];  
                    }
                }
                $(msApplyServices).data("contrailMultiselect").value(val);
            }
            else {
                $(msApplyServices).data("contrailMultiselect").value("");
            }
        }
        e.parentNode.parentNode.parentNode.appendChild(rootDiv);
    }
    else {
        var actDropDown = $($(e.parentNode.parentNode.children[0]).find("div.span12")).data('contrailDropdown') ?
            $($(e.parentNode.parentNode.children[0]).find("div.span12")).data('contrailDropdown') : $($(e.parentNode.parentNode.children[0]).find("div.span12")[1]).data('contrailDropdown');    
        actDropDown.enable(true);

        $($(e.parentNode.parentNode.children[4]).find("div.span12")[1]).data("contrailDropdown").enable(true);

        //Enabling 'any' on Src VN.
        //Enabling 'local' on Src VN.
        var srcDropdown = getCurrentNetRuleDropdown(e, 'selectSrcNetwork_');
        if(srcDropdown) {
            var selSrcTxt = srcDropdown.value();
            verifySrcDestSelectedItem(selSrcTxt, srcDropdown,
                $($($(e.parentNode.parentNode.children[2]).find('a')).find('i')), undefined, true);
        }   
        
        //Enabling 'any' on Dest VN.
        //Enabling 'local' on Dest VN.
        var destDropdown = getCurrentNetRuleDropdown(e, 'selectDestNetwork_');
        if(destDropdown) {
            var selDestTxt = destDropdown.value();   
            verifySrcDestSelectedItem(selDestTxt, destDropdown,
                $($($(e.parentNode.parentNode.children[5]).find('a')).find('i')), undefined, true);
        }        

        var tupleDiv = e.parentNode.parentNode.parentNode.children; 
        if(tupleDiv.length > 1) {
            //Either Apply service or Mirror service div is shown.
            for(var i=0; i<tupleDiv.length; i++) {
                var rootDiv = $(tupleDiv[i]);
                if(rootDiv.attr("id") && rootDiv.attr("id").indexOf("apply_service") != -1) {
                    rootDiv.hide();
                    return;
                }
            }
        }
    }
}

function toggleMirrorServiceDiv(e, serviceInsts, val) {
    if(e.checked === true) {
        var tupleDiv = e.parentNode.parentNode.parentNode.children; 
        if(tupleDiv.length > 1) {
            //Either Apply service or Mirror service div is shown.
            for(var i=0; i<tupleDiv.length; i++) {
                var rootDiv = $(tupleDiv[i]);
                if(rootDiv.attr("id") && rootDiv.attr("id").indexOf("mirror_service") != -1) {
                    rootDiv.show();
                    return;
                }
            }
        }
        var servicesLbl = document.createElement("label");
        servicesLbl.setAttribute("id", "mirrorLbl");        
        servicesLbl.innerHTML =  "Mirror";
        servicesLbl.className = "span1";
        servicesLbl.setAttribute('style','margin-top:5px');
        
        var msMirrorServices = document.createElement("div");
        msMirrorServices.className = "span11";
        
        var div = document.createElement("div");
        div.className = "row-fluid margin-0-0-5";
        div.appendChild(servicesLbl);        
        div.appendChild(msMirrorServices);
        var form = document.createElement("form");
        form.appendChild(div);
        var rootDiv = document.createElement("div");
        rootDiv.appendChild(form);
        rootDiv.id = e.id + "_root";

        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();

        $(msMirrorServices).contrailMultiselect({
            dataTextField : 'text',
            dataValueField : 'value',         
            placeholder: "Select a service to mirror...",
            dropdownCssClass: 'select2-medium-width',
            width:'852px'
        });
        if (serviceInsts && serviceInsts.length > 0) {
            serviceInsts = serviceInsts.split(",");
            var dsInsts = [];
            for(var n = 0; n < serviceInsts.length; n++) {
                var instTxt = serviceInsts[n].split(':');
                if(instTxt.length === 3) {
                    instTxt = instTxt[2] + ' (' + instTxt[0] + ':' + instTxt[1] + ')';
                } else {
                    instTxt = instTxt[0];
                }
                dsInsts.push({value : serviceInsts[n], text : instTxt})                
            }            
            $(msMirrorServices).data("contrailMultiselect").setData(dsInsts);
            if(val && val.length > 0) {
                val = prepareNewInstanceValues(dsInsts, val);;
                val = val.split(",");
                for(var i=0; i<val.length; i++) {
                    if(val[i].split(":")[0] === selectedDomain &&
                        val[i].split(":")[1] === selectedProject) {
                        val[i] = val[i].split(":")[2];  
                    }
                }
                $(msMirrorServices).data("contrailMultiselect").value(val);
            }
            else {
                $(msMirrorServices).data("contrailMultiselect").value("");
            }
        }
        e.parentNode.parentNode.parentNode.appendChild(rootDiv);
    }
    else {
        var tupleDiv = e.parentNode.parentNode.parentNode.children; 
        if(tupleDiv.length > 1) {
            //Either Apply service or Mirror service div is shown.
            for(var i=0; i<tupleDiv.length; i++) {
                var rootDiv = $(tupleDiv[i]);
                if(rootDiv.attr("id") && rootDiv.attr("id").indexOf("mirror_service") != -1) {
                    rootDiv.hide();
                    return;
                }
            }
        }
    }
}

function appendRuleEntry(who, defaultRow) {
    var ruleEntry = createRuleEntry(null, $("#ruleTuples").children().length, window.vns, window.policies, window.subnets, window.sts);
    if (defaultRow) {
        $("#ruleTuples").prepend($(ruleEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(ruleEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreatePolicy",ruleEntry,false);
}

function addNewItemMainDataSource(txt, data, selector, grpType) {
    var grpName = "Networks";
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
    var grpName = "Networks";
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

function verifySrcDestSelectedItem(selTxt, dropDown, e, grpType, enbleOpt) {
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

function createRuleEntry(rule, len, vns, policies, subnets, sts) {
    dynamicID += 1;

    var selectDivAction = document.createElement("div");
    selectDivAction.className = "span2 pull-left";
    selectDivAction.setAttribute("style","width:5%");    
    var selectAction = document.createElement("div");
    selectAction.className = "span12";
    selectAction.setAttribute("id" , "selectAction_"+dynamicID);    
    selectDivAction.appendChild(selectAction);

    var selectDivProtocol = document.createElement("div");
    selectDivProtocol.className = "span2 pull-left";
    selectDivProtocol.setAttribute("style","width:7%");
    var selectProtocol = document.createElement("div");
    selectProtocol.className = "span12";
    selectProtocol.setAttribute("id" , "selectProtocol_"+dynamicID);
    selectDivProtocol.appendChild(selectProtocol);

    var selectDivSrcNetwork = document.createElement("div");
    selectDivSrcNetwork.className = "span2 pull-left";
    selectDivSrcNetwork.setAttribute("style","width:19%");
    var selectSrcNetwork = document.createElement("div");
    selectSrcNetwork.className = "span12";
    selectSrcNetwork.setAttribute("id" , "selectSrcNetwork_"+dynamicID);
    selectDivSrcNetwork.appendChild(selectSrcNetwork);

    var inputTxtSrcPorts = document.createElement("input");
    inputTxtSrcPorts.type = "text";
    inputTxtSrcPorts.className = "span12";
    inputTxtSrcPorts.setAttribute("placeholder", "Ports");
    inputTxtSrcPorts.setAttribute("value", "ANY");
    var divRowFluidSrcPorts = document.createElement("div");
    divRowFluidSrcPorts.className = "span1";
    divRowFluidSrcPorts.setAttribute("style","width:4%");
    divRowFluidSrcPorts.appendChild(inputTxtSrcPorts);

    var selectDivDirection = document.createElement("div");
    selectDivDirection.className = "span1 pull-left";
    var selectDirection = document.createElement("div");
    selectDirection.className = "span12";
    selectDivDirection.appendChild(selectDirection);
    
    var selectDivDestNetwork = document.createElement("div");
    selectDivDestNetwork.className = "span2 pull-left";
    selectDivDestNetwork.setAttribute("style","width:19%");
    var selectDestNetwork = document.createElement("div");
    selectDestNetwork.className = "span12";
    selectDestNetwork.setAttribute("id", "selectDestNetwork_"+dynamicID);
    selectDivDestNetwork.appendChild(selectDestNetwork);

    var inputTxtDestPorts = document.createElement("input");
    inputTxtDestPorts.type = "text";
    inputTxtDestPorts.className = "span12";
    inputTxtDestPorts.setAttribute("placeholder", "Ports");
    inputTxtDestPorts.setAttribute("value", "ANY");    
    var divRowFluidDestPorts = document.createElement("div");
    divRowFluidDestPorts.className = "span1";
    divRowFluidDestPorts.setAttribute("style","width:4%");    
    divRowFluidDestPorts.appendChild(inputTxtDestPorts);

    var selectLog = document.createElement("input");
    selectLog.type = "checkbox";
    selectLog.className = "ace-input";
    selectLog.id = "cb_log_" + len;
    var spanLog = document.createElement("span");
    spanLog.className = "ace-lbl";
    spanLog.innerHTML = "&nbsp;";
    var divRowFluidLog = document.createElement("div");
    divRowFluidLog.className = "span1";
    divRowFluidLog.setAttribute("style","width:4%");
    divRowFluidLog.appendChild(selectLog);
    divRowFluidLog.appendChild(spanLog);

    var selectApplyService = document.createElement("input");
    selectApplyService.type = "checkbox";
    selectApplyService.className = "ace-input";
    selectApplyService.id = "cb_apply_service_" + len;
    var spanApplyService = document.createElement("span");
    spanApplyService.className = "ace-lbl";
    spanApplyService.innerHTML = "&nbsp;";
    var divRowFluidApplyService = document.createElement("div");
    divRowFluidApplyService.className = "span1";
    divRowFluidApplyService.setAttribute("style","width:4.5%");
    divRowFluidApplyService.appendChild(selectApplyService);
    divRowFluidApplyService.appendChild(spanApplyService);

    var selectMirrorTo = document.createElement("input");
    selectMirrorTo.type = "checkbox";
    selectMirrorTo.className = "ace-input";
    selectMirrorTo.id = "cb_mirror_service_" + len;
    var spanSelectMirrorTo = document.createElement("span");
    spanSelectMirrorTo.className = "ace-lbl";
    spanSelectMirrorTo.innerHTML = "&nbsp;";
    var divRowFluidMirrorTo = document.createElement("div");
    divRowFluidMirrorTo.className = "span1";
    divRowFluidMirrorTo.setAttribute("style","width:2%");    
    divRowFluidMirrorTo.appendChild(selectMirrorTo);
    divRowFluidMirrorTo.appendChild(spanSelectMirrorTo);

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendRuleEntry(this, false);");
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
    divRowFluidMargin10.appendChild(selectDivAction);
    divRowFluidMargin10.appendChild(selectDivProtocol);
    divRowFluidMargin10.appendChild(selectDivSrcNetwork);
    divRowFluidMargin10.appendChild(divRowFluidSrcPorts);
    divRowFluidMargin10.appendChild(selectDivDirection);
    divRowFluidMargin10.appendChild(selectDivDestNetwork);
    divRowFluidMargin10.appendChild(divRowFluidDestPorts);
    divRowFluidMargin10.appendChild(divRowFluidLog);
    divRowFluidMargin10.appendChild(divRowFluidApplyService);
    divRowFluidMargin10.appendChild(divRowFluidMirrorTo);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.className = 'rule-item';
    rootDiv.appendChild(divRowFluidMargin10);

    $(selectAction).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        dataSource: {
        },
        placeholder: "PASS"
    });
    $(selectAction).data("contrailDropdown").setData([{"text":"PASS","value":0},{"text":"DENY","value":1}]);
    $(selectAction).data("contrailDropdown").text("PASS");
    
    
    $(selectProtocol).contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        dataSource: {
        },
        placeholder: "ANY"
    });
    $(selectProtocol).data("contrailCombobox").setData(
                     [{"text":"ANY","value":"any"},
                      {"text":"TCP","value":"tcp"},
                      {"text":"UDP","value":"udp"},
                      {"text":"ICMP","value":"icmp"}]);
    $(selectProtocol).data("contrailCombobox").text("ANY");
    
    $(selectDirection).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        placeholder: "<>"
    });
    $(selectDirection).data("contrailDropdown").setData([{"text":"<>","value":"<>"},{"text":">","value":">"}]);

    var mainDS = [];
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var allVns = [{text:'Enter or Select a Network', value:"dummy", disabled : true },{"text":"ANY (All Networks in Current Project)","value":"any", "parent": "Networks"},{"text":"LOCAL (All Networks to which this policy is associated)","value":"local", "parent": "Networks"}];
    for (var i = 0; i < vns.length; i++) {
        var vn = vns[i];
        var virtualNetwork = vn["fq_name"];
        var domain = virtualNetwork[0];
        var project = virtualNetwork[1];
        if(domain === selectedDomain && project === selectedProject) {
            if(vn["fq_name"][2].toLowerCase() === "any" || vn["fq_name"][2].toLowerCase() === "local"){
                var fqNameTxt = vn["fq_name"][2] +' (' + domain + ':' + project +')';
                var fqNameValue = domain + ":" + project + ":" + vn["fq_name"][2];
                allVns.push({text : fqNameTxt, value : fqNameValue, parent : "Networks" });
            } else {
                allVns.push({text : vn["fq_name"][2], value : vn["fq_name"][2], parent : "Networks" });                
            }
        }
    }
    //add other project networks at the end
    for(var i = 0; i < vns.length; i++) { 
        var vn = vns[i];
        var virtualNetwork = vn["fq_name"];
        var project = virtualNetwork[1];    
        if(project !== selectedProject) {    
            var fqNameTxt = vn["fq_name"][2] +' (' + domain + ':' + project +')';
            var fqNameValue = domain + ":" + project + ":" + vn["fq_name"][2];
            allVns.push({text : fqNameTxt, value : fqNameValue, parent : "Networks"});            
        }    
    }
    //prepare policies sub array
    var allPolicies = [{text:'Enter or Select a Policy', value:"dummy", disabled : true }];
    for(var i = 0; i < policies.length; i++) {
        var policy = policies[i];
        var fqn =  policy["fq_name"];
        var domain = fqn[0];
        var project = fqn[1];
        if(domain === selectedDomain && project === selectedProject) {
            allPolicies.push({text : policy["fq_name"][2], value : policy["fq_name"][2]+"~`~Policy", parent : "Policies"});
        }
    }
    //add other project policies at the end    
    for(var i = 0; i < policies.length; i++) {
        var policy = policies[i];
        var fqn =  policy["fq_name"];
        var project = fqn[1];
        if(project !== selectedProject) {         
            var fqNameTxt = policy["fq_name"][2] +' (' + domain + ':' + project +')';
            var fqNameValue = domain + ":" + project + ":" + policy["fq_name"][2];
            allPolicies.push({text : fqNameTxt, value : fqNameValue+"~`~Policy", parent : 'Policies'});           
        }    
    }
  
    mainDS.push({text : 'CIDR', id : 'subnet',  children : [{text:'Enter a CIDR', value:"dummy", disabled : true }]},
        {text : 'Networks', id : 'network', children : allVns},
        {text : 'Policies', id : 'policy', children : allPolicies});
        
    dsSrcDest = mainDS;  
    $(selectSrcNetwork).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        query : select2Query,
        formatResult : select2ResultFormat,
        formatSelection : select2Format,
        selectOnBlur: true
    }).on('select2-close', function() {
        loadSelect2CloseActions();
    }).on('select2-open', function() {
        loadSelect2OpenActions();
    }); 

    $(selectDestNetwork).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        query : select2Query,
        formatResult : select2ResultFormat,
        formatSelection : select2Format,
        selectOnBlur: true
    }).on('select2-close', function() {
        loadSelect2CloseActions();
    }).on('select2-open', function() {
        loadSelect2OpenActions();
    });     
    $(selectSrcNetwork).data("contrailDropdown").setData(mainDS);
    $(selectSrcNetwork).data("contrailDropdown").value(mainDS[1].children[1].value);
    $(selectDestNetwork).data("contrailDropdown").setData(mainDS);
    $(selectDestNetwork).data("contrailDropdown").value(mainDS[1].children[1].value);
    
    var analyzerInsts = [];
    var serviceInsts = [];
    if (null !== sts && sts.length > 0) {
        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();

        for (var i = 0; i < sts.length; i++) {
            if (sts[i].service_template_properties.service_type === "analyzer") {
                if (typeof sts[i].service_instance_back_refs !== "undefined" &&
                    sts[i].service_instance_back_refs.length > 0) {
                    for (var j = 0; j < sts[i].service_instance_back_refs.length; j++) {
                        if(sts[i].service_instance_back_refs[j].to[0] === selectedDomain &&
                            sts[i].service_instance_back_refs[j].to[1] === selectedProject) {
                            analyzerInsts[analyzerInsts.length] = sts[i].service_instance_back_refs[j].to[2];
                            serviceInsts[serviceInsts.length] = sts[i].service_instance_back_refs[j].to[2];
                        } else {
                            analyzerInsts[analyzerInsts.length] = 
                                sts[i].service_instance_back_refs[j].to[0] + ":" +
                                sts[i].service_instance_back_refs[j].to[1] + ":" +
                                sts[i].service_instance_back_refs[j].to[2];
                            serviceInsts[serviceInsts.length] = 
                                sts[i].service_instance_back_refs[j].to[0] + ":" +
                                sts[i].service_instance_back_refs[j].to[1] + ":" +
                                sts[i].service_instance_back_refs[j].to[2];
                        }
                    }
                }
            } else {
                if (typeof sts[i].service_instance_back_refs !== "undefined" &&
                    sts[i].service_instance_back_refs.length > 0) {
                    for (var j = 0; j < sts[i].service_instance_back_refs.length; j++) {
                        if(sts[i].service_instance_back_refs[j].to[0] === selectedDomain &&
                            sts[i].service_instance_back_refs[j].to[1] === selectedProject) {
                            serviceInsts[serviceInsts.length] = sts[i].service_instance_back_refs[j].to[2];
                        } else {
                               serviceInsts[serviceInsts.length] = 
                                   sts[i].service_instance_back_refs[j].to[0] + ":" +
                                   sts[i].service_instance_back_refs[j].to[1] + ":" +
                                   sts[i].service_instance_back_refs[j].to[2];
                           }
                    }
                }
            }
        }
        selectApplyService.setAttribute("onclick", "toggleApplyServiceDiv(this, '" + serviceInsts.join() + "')");
        selectMirrorTo.setAttribute("onclick", "toggleMirrorServiceDiv(this, '" + analyzerInsts.join() + "')");
    }

    if (null !== rule && typeof rule !== "undefined") {
        var actionUnderActionList = false;
        if (null !== rule["action_list"] && typeof rule["action_list"] !== "undefined") {
            if (typeof rule["action_list"]["simple_action"] !== "undefined") {
                var action = rule["action_list"]["simple_action"];
                if (null !== action && typeof action !== "undefined") {
                    actionUnderActionList = true;
                    action = action.toUpperCase();
                    $(selectAction).data("contrailDropdown").text(action);
                } else {
                    $(selectAction).data("contrailDropdown").enable(false);
                }
                var logging = rule["action_list"]["log"];
                if (null !== logging && typeof logging !== "undefined" && true === logging) {
                    selectLog.setAttribute("checked", true);
                }
            }
        } else {
            $(selectAction).data("contrailDropdown").enable(false);
        }
        if(actionUnderActionList === false) {
            //If simple_action is not under "action_list", look directly under "policy_rule"
            //Dont allow to edit.
            if(null !== rule["simple_action"] && typeof rule["simple_action"] !== "undefined") {
                action = rule["simple_action"];
                $(selectAction).data("contrailDropdown").enable(false);
                $(selectAction).data("contrailDropdown").text(action.toUpperCase());
            } else {
                $(selectAction).data("contrailDropdown").enable(false);
            }
        }
        
        var protocol = rule["protocol"];
        if (null !== protocol && typeof protocol !== "undefined") {
            protocol = protocol.toUpperCase();
            $(selectProtocol).data("contrailCombobox").text(protocol);
        }
        var direction = rule["direction"];
        if (null !== direction && typeof direction !== "undefined") {
            direction = direction.toUpperCase();
            $(selectDirection).data("contrailDropdown").value(direction);
        }

        if (null !== rule["src_addresses"] && typeof rule["src_addresses"] !== "undefined" &&
            rule["src_addresses"].length > 0) {
            var srcNetwork = [];
            var srcGrpType = "Networks";
            for (var i = 0; i < rule["src_addresses"].length; i++) {
                if (null !== rule["src_addresses"][i]["virtual_network"] &&
                    typeof rule["src_addresses"][i]["virtual_network"] !== "undefined") {
                    srcGrpType = "Networks";
                    srcNetwork[i] = rule["src_addresses"][i]["virtual_network"];
                    srcNetwork[i] = parseFQNSrcDest(selectedDomain, selectedProject, srcNetwork[i]);
                } else if(null !== rule["src_addresses"][i]["subnet"] &&
                    typeof rule["src_addresses"][i]["subnet"] !== "undefined") {
                    srcGrpType = "CIDR";
                    srcNetwork[i] = rule["src_addresses"][i]["subnet"]['ip_prefix'] + '/' 
                        + rule["src_addresses"][i]["subnet"]['ip_prefix_len'];
                } else if(null !== rule["src_addresses"][i]["network_policy"] &&
                    typeof rule["src_addresses"][i]["network_policy"] !== "undefined") {
                    srcGrpType = "Policies";
                    srcNetwork[i] = rule["src_addresses"][i]["network_policy"] + "~`~Policy";
                    srcNetwork[i] = parseFQNSrcDest(selectedDomain, selectedProject, srcNetwork[i]);
                }                    
            }
            var srcNw = srcNetwork.join();
            var srcDropdown =  $(selectSrcNetwork).data("contrailDropdown");
            verifySrcDestSelectedItem(srcNw, srcDropdown, '',  srcGrpType);
        }
        if (null !== rule["dst_addresses"] && typeof rule["dst_addresses"] !== "undefined" &&
            rule["dst_addresses"].length > 0) {
            var destNetwork = [];
            var destGrpType = "Networks";
            for (var i = 0; i < rule["dst_addresses"].length; i++) {
                if (null !== rule["dst_addresses"][i]["virtual_network"] &&
                    typeof rule["dst_addresses"][i]["virtual_network"] !== "undefined") {
                    destGrpType = "Networks";
                    destNetwork[i] = rule["dst_addresses"][i]["virtual_network"];
                    destNetwork[i] = parseFQNSrcDest(selectedDomain, selectedProject, destNetwork[i]);
                } else if (null !== rule["dst_addresses"][i]["subnet"] &&
                    typeof rule["dst_addresses"][i]["subnet"] !== "undefined") {
                    destGrpType = "CIDR";
                    destNetwork[i] = rule["dst_addresses"][i]["subnet"]['ip_prefix'] + '/' 
                        + rule["dst_addresses"][i]["subnet"]['ip_prefix_len'];
                } else if(null !== rule["dst_addresses"][i]["network_policy"] &&
                    typeof rule["dst_addresses"][i]["network_policy"] !== "undefined") {
                    destGrpType = "Policies";
                    destNetwork[i] = rule["dst_addresses"][i]["network_policy"] + "~`~Policy";
                    destNetwork[i] = parseFQNSrcDest(selectedDomain, selectedProject, destNetwork[i]);
                }
            }
            var destNw = destNetwork.join();
            var destDropdown =  $(selectDestNetwork).data("contrailDropdown");
            verifySrcDestSelectedItem(destNw, destDropdown, '',  destGrpType);
        }

        if (null !== rule["src_ports"] && typeof rule["src_ports"] !== "undefined" &&
            rule["src_ports"].length > 0) {
            var portDesc = [];
            if (rule["src_ports"].length === 1 && rule["src_ports"][0]["start_port"] === -1) {
                $(inputTxtSrcPorts).val("ANY");
            } else {
                for (var i = 0; i < rule["src_ports"].length; i++) {
                    if (rule["src_ports"][i]["end_port"] !== -1 &&
                        rule["src_ports"][i]["start_port"] != rule["src_ports"][i]["end_port"])
                        portDesc[i] = rule["src_ports"][i]["start_port"] + " - " + rule["src_ports"][i]["end_port"];
                    else
                        portDesc[i] = rule["src_ports"][i]["start_port"];
                }
                $(inputTxtSrcPorts).val(portDesc.join(","));
            }
        }

        if (null !== rule["dst_ports"] && typeof rule["dst_ports"] !== "undefined" &&
            rule["dst_ports"].length > 0) {
            var portDesc = [];
            if (rule["dst_ports"].length === 1 && rule["dst_ports"][0]["start_port"] === -1) {
                $(inputTxtDestPorts).val("ANY");
            } else {
                for (var i = 0; i < rule["dst_ports"].length; i++) {
                    if (rule["dst_ports"][i]["end_port"] !== -1 && 
                        rule["dst_ports"][i]["start_port"] != rule["dst_ports"][i]["end_port"])
                        portDesc[i] = rule["dst_ports"][i]["start_port"] + " - " + rule["dst_ports"][i]["end_port"];
                    else
                        portDesc[i] = rule["dst_ports"][i]["start_port"];
                }
                $(inputTxtDestPorts).val(portDesc.join(","));
            }
        }

        if (null !== rule["action_list"] && typeof rule["action_list"] !== "undefined") {
            var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
            var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
            if (null !== rule["action_list"]["apply_service"] && typeof rule["action_list"]["apply_service"] !== "undefined" &&
                rule["action_list"]["apply_service"].length > 0) {
                var applyServices = [];
                for (var i = 0; i < rule["action_list"]["apply_service"].length; i++) {
                    var tmpInst = rule["action_list"]["apply_service"][i].split(':');
                    if(tmpInst.length === 3) {
                        if(tmpInst[0] === selectedDomain &&  tmpInst[1]  ===  selectedProject) {
                            tmpInst = tmpInst[2];
                        } else {
                            tmpInst = tmpInst[0] + ':' + tmpInst[1] + ':' + tmpInst[2];
                        }   
                    } else {
                        tmpInst = tmpInst[0]
                    }
                    applyServices[i] = tmpInst;
                }
                if(applyServices && applyServices.length > 0) {
                    selectApplyService.setAttribute("checked", true);
                    selectApplyService.setAttribute("onclick", 
                        "toggleApplyServiceDiv(this, '" + serviceInsts.join() + "', '" + applyServices.join() + "')");
                    toggleApplyServiceDiv(selectApplyService, serviceInsts.join(), applyServices.join());
                } else {
                    selectApplyService.setAttribute("checked", false);
                }
            }
            if(null !== rule["action_list"]["mirror_to"] && typeof rule["action_list"]["mirror_to"] !== "undefined" &&
                null !== rule["action_list"]["mirror_to"]["analyzer_name"] &&
                typeof rule["action_list"]["mirror_to"]["analyzer_name"] !== "undefined") {
                var mirrorServices = [rule["action_list"]["mirror_to"]["analyzer_name"]];
                if(mirrorServices && mirrorServices.length > 0) {
                    selectMirrorTo.setAttribute("checked", true);
                    selectMirrorTo.setAttribute("onclick", 
                        "toggleMirrorServiceDiv(this, '" + analyzerInsts.join() + "', '" + mirrorServices.join() + "')");
                    toggleMirrorServiceDiv(selectMirrorTo, analyzerInsts.join(), mirrorServices.join());
                } else {
                    selectMirrorTo.setAttribute("checked", false);
                }
            }
        }
    }
    return rootDiv;
}

function parseFQNSrcDest(selectedDomain, selectedProject, resource) {
    var newRes = resource;
    var domain = resource.split(":")[0];
    var project = resource.split(":")[1];
    if(domain === selectedDomain && project === selectedProject) {
        if(resource.split(":")[2].toLowerCase() !== "any" &&
            resource.split(":")[2].toLowerCase() !== "local") {
            newRes  = resource.split(":")[2];
        }
    }
    return newRes;    
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
        setSelectedGroupIcon("Networks");        
    }
    $('.select2-results').removeAttr('style');
    $('.res-icon').remove();
}

function loadSelect2OpenActions() {
    var subEleArry = $(".select2-result-sub");
    if(subEleArry && subEleArry.length > 0) {
        $(subEleArry[0]).addClass('hide'); 
        $(subEleArry[2]).addClass('hide');
    }
    $('.select2-results').attr('style','max-height:400px;');
    $('.res-icon').remove();
    $(".select2-search").prepend('<i class="'+ iconNetwork +' res-icon"> </i>')
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
    } else {
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
            case 'Networks' :
                subEle = $(subEleArry[1]);
                break;   
            case 'Policies' :
                subEle = $(subEleArry[2]);        
                break;  
            case 'CIDR' :
               subEle = $(subEleArry[0]);        
               break;                      
        }
        subEle.removeClass('hide');
    }
}


function getSelectedGroupName(selector) {
    var grpName = 'Networks';
    var element = selector ? selector : $(".res-icon");
     if(element.hasClass(iconNetwork)) {
         grpName = 'Networks'
     } else if(element.hasClass(iconPolicy)) {
         grpName = "Policies"
     } else if(element.hasClass(iconSubnet)) {
         grpName = "CIDR";
     }
     return grpName;
}

function setSelectedGroupIcon(grpName) {
    var currentIcon = iconNetwork;
    switch(grpName) {
        case 'Networks' :
            currentIcon = iconNetwork;
            break;   
        case 'Policies' :
            currentIcon = iconPolicy;
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
        case 'Networks' :
            fomattedTxt = '<i class="' + iconNetwork + '"></i>' + ' ' + state.text;
            break;
        case 'Policies' :
            fomattedTxt = '<i class="' + iconPolicy + '"></i>' + ' ' + state.text;
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
        fetchProjects("populateProjects", "failureHandlerForGridPolicy");
    } else {
        $("#gridPolicy").data("contrailGrid")._dataView.setData([]);
        btnCreatePolicy.addClass('disabled-link');
        setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');        
        setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
        gridPolicy.showGridMessage("empty");
        emptyCookie('domain');
        emptyCookie('project');        
    }        
}

function handleDomains(e) {
    //fetchDataForGridPolicy();
    var dName = e.added.text;
    setCookie("domain", dName);    
    fetchProjects("populateProjects", "failureHandlerForGridPolicy");
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
        btnCreatePolicy.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        fetchDataForGridPolicy();
    } else {
        $("#gridPolicy").data("contrailGrid")._dataView.setData([]);
        btnCreatePolicy.addClass('disabled-link');
        var emptyObj = [{text:'No Projects found',value:"Message"}];
        $("#ddProjectSwitcher").data("contrailDropdown").setData(emptyObj);
        $("#ddProjectSwitcher").data("contrailDropdown").text(emptyObj[0].text);
        $("#ddProjectSwitcher").data("contrailDropdown").enable(false);
        gridPolicy.showGridMessage("empty");
        emptyCookie('project');                
    }
}

function handleProjects(e) {
    var pname = e.added.text;
    setCookie("project", pname);
    fetchDataForGridPolicy();
}

function fetchDataForGridPolicy() {
    $("#cb_gridPolicy").attr("checked", false);
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridPolicy.showGridMessage('errorGettingData');
        return;
    }

    $("#gridPolicy").data("contrailGrid")._dataView.setData([]);
    idCount = 0;
    polAjaxcount++;
    configObj["network-policys"] = [];
    gridPolicy.showGridMessage('loading');
    var proid = $("#ddProjectSwitcher").data("contrailDropdown").value();
    ajaxParam = proid + "_" + polAjaxcount;
    doAjaxCall("/api/admin/config/get-data?type=network-policy&count=4&fqnUUID="+proid, 
        "GET", null, "successHandlerForGridPolicy", "failureHandlerForGridPolicyRow", null, ajaxParam);
}

function successHandlerForGridPolicy(result , cbparam) {
    if(cbparam != ajaxParam){
        return;
    }
    if(result.more == true || result.more == "true"){
        doAjaxCall("/api/admin/config/get-data?type=network-policy&count=4&&fqnUUID="+ 
            $("#ddProjectSwitcher").data("contrailDropdown").value() +"&lastKey="+result.lastKey, 
            "GET", null, "successHandlerForGridPolicy", "failureHandlerForGridPolicyRow", null, cbparam); 
    }
    successHandlerForGridPolicyRow(result);
}


function failureHandlerForGridPolicy(result) {
    $("#btnCreatePolicy").addClass('disabled-link');    
    gridPolicy.showGridMessage('errorGettingData');
}

function successHandlerForGridPolicyRow(result) {
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var policyData = $("#gridPolicy").data("contrailGrid")._dataView.getItems();
    var policies = jsonPath(result, "$..network-policy");
    for (var i = 0; i < policies.length; i++) {
        var policy = policies[i];
        if(check4DynamicPolicy(policy)) {
            continue;
        }
        var policyName = jsonPath(policy, "$.fq_name[2]");
        var NetworkPolicyDisplayName = policy["display_name"];
        configObj["network-policys"].push(policies[i]);

        if (typeof policyName === "object" && policyName.length === 1)
            policyName = policyName[0];
        else
            policyName = "-";

        var uuid = jsonPath(policy, "$.uuid");
        if (typeof uuid === "object" && uuid.length === 1)
            uuid = uuid[0];

        var vns = jsonPath(policy, "$.virtual_network_back_refs[*]");
        var networks = [];
        if (vns === false) {
            networks = ["-"];
        } else {
            for(var j=0; j<vns.length; j++) {
                var nwRef = vns[j].to;
                if(nwRef[0] === selectedDomain && nwRef[1] === selectedProject) {
                    networks.push(nwRef[2]);
                } else {
                    networks.push(nwRef.join(":"));
                }
            }
        }

        if (policy["network_policy_entries"] && policy["network_policy_entries"]["policy_rule"] &&
            policy["network_policy_entries"]["policy_rule"].length > 0) {
            var ruleDescriptions = [];
            var policyEntries = policy["network_policy_entries"]["policy_rule"];
            for (var j = 0; j < policyEntries.length; j++) {
                var rule = policyEntries[j];
                ruleDescriptions[j] = formatPolicyRule(rule, selectedDomain, selectedProject);
            }
        }
        else
            ruleDescriptions = ["-"];

        policyData.push({"id":idCount++, "NetworkPolicy":policyName,"NetworkPolicyDisplayName":NetworkPolicyDisplayName, "PolicyRules":ruleDescriptions, "AssociatedNetworks":networks, "PolicyUUID":uuid});
    }

    $("#gridPolicy").data("contrailGrid")._dataView.setData(policyData);
    if(result.more == true || result.more == "true"){
        gridPolicy.showGridMessage('loading');
    } else {
        if(!policyData || policyData.length<=0)
            gridPolicy.showGridMessage('empty');
    }
}


function check4DynamicPolicy(policy) {
    var isDynamicPolicy = false;
    try {
        var startTimes = jsonPath(policy, "$.virtual_network_back_refs[*].attr.timer.start_time");
        for(var i = 0; i < startTimes.length; i++) {
            if(startTimes[i] != null) {
                isDynamicPolicy = true;
                break;
            }
        }
    } catch (error){
        console.log(error.stack);
    }
    return isDynamicPolicy;
}

function failureHandlerForGridPolicyRow(result, cbParam) {
    showInfoWindow("Error in getting policy data.", "Error");
    gridPolicy.showGridMessage('errorGettingData');    
}

function showRemoveWindow(rowIndex) {
$.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Network Policy delete</h6>',
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
               var selected_row = $("#gridPolicy").data("contrailGrid")._dataView.getItem(rowNum);
               deletePolicy([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
}

function closeCreatePolicyWindow() {
    clearValuesFromDomElements();
}

function clearValuesFromDomElements() {
    mode = "";
    txtPolicyName.val("");
    txtPolicyName[0].disabled = false;
    clearRuleEntries();
}

function clearRuleEntries() {
    var tuples = $("#ruleTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#ruleTuples").empty();
    }
}

function showPolicyEditWindow(mode, rowIndex) {
    if($("#btnCreatePolicy").hasClass('disabled-link')) {
        return; 
    }
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    if(!isValidDomainAndProject(selectedDomain, selectedProject)) {
        gridPolicy.showGridMessage('errorGettingData');
        return;
    }
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
    url:"/api/tenants/config/virtual-networks",
    type:"GET"
    });

    var selectedDomainUUID = jsonPath(configObj, "$..domains[?(@.fq_name[0]=='" + selectedDomain + "')]")[0].uuid;
    var projectUUId = jsonPath(configObj, "$.projects[?(@.fq_name[1]=='" + selectedProject + "')]")[0].uuid;    
    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/service-instance-templates/" + selectedDomainUUID,
        type:"GET"
    });

    getAjaxs[2] = $.ajax({
        url:"/api/tenants/config/service-instances-details/",
        type:"GET"
    });
    
    //get policies
    getAjaxs[3] = $.ajax({
        url:"/api/tenants/config/policys",
        type:"GET"
    });    
    
    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            clearValuesFromDomElements();
            var results = arguments;
            var vns = jsonPath(results[0][0], "$.virtual-networks[*].fq_name[2]");
            var virtualNetworks = jsonPath(results[0][0], "$.virtual-networks[*]");
            configObj["virtual-networks"] = [];
            if (null !== virtualNetworks && typeof virtualNetworks === "object" && virtualNetworks.length > 0) {
                for (var i = 0; i < virtualNetworks.length; i++) {
                    configObj["virtual-networks"][i] = {};
                    configObj["virtual-networks"][i] = virtualNetworks[i];
                }
            }

            var sts = jsonPath(results[1][0], "$.service_templates[*].service-template");
            configObj["service_templates"] = [];
            if (null !== sts && sts.length > 0) {
                for (var i = 0; i < sts.length; i++) {
                    configObj["service_templates"][i] = {};
                    configObj["service_templates"][i]["service-template"] = sts[i];
                }
            }
            var sis = jsonPath(results[2][0], "$.[*].service-instance");
            configObj["service_instances"] = [];
            if (null !== sis && sis.length > 0) {
                for (var i = 0; i < sis.length; i++) {
                    configObj["service_instances"][i] = {};
                    configObj["service_instances"][i]["service-instance"] = sis[i];
                }
            }
            //process policies data
            var policies = jsonPath(results[3][0], '$.network-policys[*]');
            if(null !== policies && policies.length > 0) {
               configObj["policys-input"] = policies;
            }
            
            window.vns = jsonPath(configObj, "$.virtual-networks[*]");;
            window.policies = jsonPath(configObj, "$.policys-input[*]");;
            window.subnets = jsonPath(configObj, "$.network-subnets[*]");
            window.sts =  jsonPath(configObj, "$.service_templates[*].service-template");
            if (mode === "add") {
                windowCreatePolicy.find('.modal-header-title').text('Create Policy');
                $(txtPolicyName).focus();
            } else if (mode === "edit") {
                var selectedRow = $("#gridPolicy").data("contrailGrid")._dataView.getItem(rowIndex);
                windowCreatePolicy.find('.modal-header-title').text('Edit Policy ' + selectedRow.NetworkPolicy);
                txtPolicyName.val(selectedRow.NetworkPolicy);
                txtPolicyName[0].disabled = true;
                var rowId = selectedRow["id"];
                var selectedPolicy = configObj["network-policys"][rowId];
                if (selectedPolicy["network_policy_entries"] && selectedPolicy["network_policy_entries"]["policy_rule"] &&
                    selectedPolicy["network_policy_entries"]["policy_rule"].length > 0) {
                    var policyEntries = selectedPolicy["network_policy_entries"]["policy_rule"];
                    for (var j = 0; j < policyEntries.length; j++) {
                        var rule = policyEntries[j];
                        var ruleEntry = createRuleEntry(rule, j,  window.vns,  window.policies,  window.subnets,  window.sts);
                        $("#ruleTuples").append(ruleEntry);                        
                    }
                }
            }
        },
        function () {
            //If atleast one api fails
            var results = arguments;
        });
    windowCreatePolicy.modal("show");
    windowCreatePolicy.find('.modal-body').scrollTop(0);
}

function createPolicySuccessCb() {
    gridPolicy.showGridMessage('loading');
    fetchDataForGridPolicy();
}

function createPolicyFailureCb() {
    gridPolicy.showGridMessage('loading');
    fetchDataForGridPolicy();
}

function validate() {
    var policyName = txtPolicyName.val().trim();
    if (typeof policyName === "undefined" || policyName === "") {
        showInfoWindow("Enter a valid network policy name", "Input required");
        return false;
    }
    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var ruleTuples = $("#ruleTuples")[0].children;
    if (ruleTuples && ruleTuples.length > 0) {
        for (var i = 0; i < ruleTuples.length; i++) {
            var ruleTuple = $($(ruleTuples[i]).find("div")[0]).children();
            var protocolCombobox = $($(ruleTuple).find('div[id*="selectProtocol_"]')[0]).data('contrailCombobox');
            var protocolComboboxValue = protocolCombobox.value();
            if (protocolComboboxValue !== "") {
                var allProtocol = jsonPath(protocolCombobox.getAllData(), "$..text");
                if (allProtocol.indexOf(protocolComboboxValue.toUpperCase()) < 0) {
                    if (!isNumber(protocolComboboxValue)) {
                        showInfoWindow("Allowed values are 'any', 'icmp', 'tcp', 'udp' or 0 - 255.", "Invalid Protocol");
                        return false;
                    }
                    protocolComboboxValue = Number(protocolComboboxValue);
                    if (protocolComboboxValue % 1 != 0 || protocolComboboxValue < 0 || protocolComboboxValue > 255) {
                        showInfoWindow("Allowed values are 'any', 'icmp', 'tcp', 'udp' or 0 - 255.", "Invalid Protocol");
                        return false
                    }
                }
            }
            var actDropDown = $($(ruleTuple).find('div[id*="selectAction_"]')[1]).data('contrailDropdown'); 
            var action_value = actDropDown.text();
            if(action_value.trim() !== "") {
                var action_values = jsonPath(actDropDown.getAllData(), "$..text");
                if(action_values.indexOf(action_value) === -1) {
                    showInfoWindow("Select a valid Action.", "Invalid Rule");
                    return false;
                }
            } else {
                action_value = "pass";  
            }
            action_value = action_value.toLowerCase();
            var applyServicesEnabled = $($(ruleTuple[8]).find("input"))[0].checked;
            var mirrorServicesEnabled = $($(ruleTuple[9]).find("input"))[0].checked
            var applyServices = [];
            var mirrorTo = [];
            var srcGrpName = getSelectedGroupName($($($(ruleTuple[2]).find('a'))).find('i'));
            var destGrpName = getSelectedGroupName($($($(ruleTuple[5]).find('a'))).find('i'));
            if(srcGrpName === 'CIDR') {
                var srcDropDown = $($(ruleTuple).find('div[id*="selectSrcNetwork_"]')[1]).data('contrailDropdown')
                var srcVN = srcDropDown.value().trim();
                if("" === srcVN || !isValidIP(srcVN) || srcVN.split("/").length != 2) {
                    showInfoWindow("Enter a valid CIDR in xxx.xxx.xxx.xxx/xx format for Source", "Invalid input in Source CIDR");
                    return false;
                }
            }
            if(destGrpName === 'CIDR') {
                var destDropDown = $($(ruleTuple).find('div[id*="selectDestNetwork_"]')[1]).data("contrailDropdown");
                var destVN = destDropDown.value().trim();
                if("" === destVN || !isValidIP(destVN) || destVN.split("/").length != 2) {
                    showInfoWindow("Enter a valid CIDR in xxx.xxx.xxx.xxx/xx format for Destination", "Invalid input in Destination CIDR");
                    return false;
                }
            }
            if(srcGrpName === 'CIDR' && destGrpName === 'CIDR') {
                //Only when applying/mirroring services both src and dest cant be CIDRs.
                if(applyServicesEnabled === true || mirrorServicesEnabled === true) {
                showInfoWindow("Both Source and Destination cannot be CIDRs while applying/mirroring services.", "Invalid Rule");
                return false;
                }
            }

            if(applyServicesEnabled == true) {
                var id = $($(ruleTuple[8]).find("input"))[0].id;
                var div_id = id + "_root";
                applyServices = 
                    $($("#" + div_id).find("div.span11")[1]).data("contrailMultiselect").value();
                if(applyServices && applyServices.length <=0) {
                    showInfoWindow("Select atleast one service to apply.", "Invalid Rule");
                    return false;
                }
                //if(allowOnlyProtocolAnyIfServiceEnabled(applyServicesEnabled, protocol, false) === false) {
                //    return false;
                //}
                //When creating service chain with more than one service instance, 
                //only transparent mode services can be chained
                var allTypes = [];
                var asArray = [];
                var allInterface = [];
                if(applyServices && applyServices.length > 0) {
                    var srcDropDown = $($(ruleTuple).find('div[id*="selectSrcNetwork_"]')[1]).data('contrailDropdown')
                    var srcVN = srcDropDown.value();
                    
                    var destDropDown = $($(ruleTuple).find('div[id*="selectDestNetwork_"]')[1]).data("contrailDropdown");
                    var destVN = destDropDown.value();
                    if(isSet(srcVN) && isString(srcVN) && srcVN.indexOf(":") !== -1 && srcVN.split(":").length !== 3) {
                        showInfoWindow("Fully Qualified Name of Source Network should be in the format Domain:Project:NetworkName.", "Invalid FQN");
                        return false;
                    }
                    if(isSet(destVN) && isString(destVN) && destVN.indexOf(":") !== -1 && destVN.split(":").length !== 3) {
                        showInfoWindow("Fully Qualified Name of Destination Network should be in the format Domain:Project:NetworkName.", "Invalid FQN");
                        return false;
                    }                    
                    if(srcVN.toLowerCase() === "local" || srcVN.toLowerCase() === "any") {
                        showInfoWindow("Source network cannot be 'any' or 'local' while applying services.", "Invalid Rule");
                        return false;
                    }
                    if(destVN.toLowerCase() === "local" || destVN.toLowerCase() === "any") {
                        showInfoWindow("Destination network cannot be 'any' or 'local' while applying services.", "Invalid Rule");
                        return false;
                    }
                    var allTemplates = 
                        jsonPath(configObj, "$.service_templates[*].service-template")
                    for(var j=0; j<applyServices.length; j++) {
                        var as = [];
                        if(applyServices[j].indexOf(":") === -1) {
                            as = [selectedDomain, selectedProject, applyServices[j]];
                        } else {
                            as = applyServices[j].split(":");
                        }
                        for(tmplCount=0; tmplCount<allTemplates.length; tmplCount++) {
                            var template = allTemplates[tmplCount];
                            var insts = template.service_instance_back_refs;
                            if(null !== insts && typeof insts !== "undefined" && insts.length > 0) {
                                for(var instCount=0; instCount<insts.length; instCount++) {
                                    if(insts[instCount]["to"][0] == as[0] &&
                                        insts[instCount]["to"][1] == as[1] &&
                                        insts[instCount]["to"][2] == as[2]) {
                                        var smode = template.service_template_properties.service_mode;
                                        if(typeof smode === "undefined" ||
                                            null === smode)
                                            smode = "transparent";
                                        allTypes[allTypes.length] = smode;
                                        asArray[asArray.length] = as.join(":");
                                        allInterface.push({"mode":smode,"inst":as[2]});
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    var inNetworkCount = 0;
                    for(var temp = 0;temp < allInterface.length;temp++){
                        if(allInterface[temp].mode == "in-network-nat")
                            inNetworkCount++;
                        if(inNetworkCount >= 2){
                            showInfoWindow("Cannot have more than one 'in-network-nat' services." , "Invalid Rule");
                            return false;
                        }
                    }
                    if(inNetworkCount >= 1 &&  allInterface[allInterface.length-1].mode != "in-network-nat"){
                        showInfoWindow("Last instance should be of 'in-network-nat' service mode while applying services.", "Invalid Rule");
                        return false;
                    }

                    //Get Unique values.
                    var uniqueTypes = $.grep(allTypes, function(v, k){
                        return $.inArray(v ,allTypes) === k;
                    });
                    //If length of unique values is 1, then all the selected
                    //instances are of same type.
                    /*if(uniqueTypes.length > 1) {
                        if(uniqueTypes.indexOf("in-network") !== -1 || uniqueTypes.indexOf("in-network-nat") !== -1) {
                            var msg = "Only Transparent mode services can be applied when there are more than one instance.";                                    
                            showInfoWindow(msg, "Invalid Rule");
                            return false;
                        }
                    } else if(uniqueTypes.length == 1) {
                        if(allTypes.length > 1) {
                            if(uniqueTypes[0] == "in-network" || uniqueTypes[0] == "in-network-nat") {
                                showInfoWindow("Only one instance can be applied for an " + uniqueTypes[0] + " service.", "Invalid Rule");
                                return false;
                            }
                        }
                    }
                    //in-network must have source and dest vn same as left and right vn. transparent must have both different.
                    if(uniqueTypes.length >= 0) {
                        var srcVN = $($(ruleTuple[2]).find("div")).data("contrailCombobox").text();
                        var destVN = $($(ruleTuple[5]).find("div")).data("contrailCombobox").text();
                        if(srcVN.indexOf(":") === -1) {
                            srcVN = [selectedDomain, selectedProject, srcVN].join(":");
                        }
                        if(destVN.indexOf(":") === -1) {
                            destVN = [selectedDomain, selectedProject, destVN].join(":");
                        }
                        var srcAndDestVNs = [];
                        var rVN = [], lVN = [], mVN = [];
                        var configData = jsonPath(configObj, "$.service_instances[*].service-instance")
                        for(var as=0; as<asArray.length; as++) {
                            asArray[as] = asArray[as].split(":");
                            for(var cd=0; cd<configData.length; cd++) {
                                var cData = configData[cd];
                                if(asArray[as][0] === cData["fq_name"][0] &&
                                    asArray[as][1] === cData["fq_name"][1] &&
                                    asArray[as][2] === cData["fq_name"][2]) {
                                    rVN[rVN.length] = cData["service_instance_properties"]["right_virtual_network"];
                                    lVN[lVN.length] = cData["service_instance_properties"]["left_virtual_network"];
                                    mVN[mVN.length] = cData["service_instance_properties"]["management_virtual_network"];
                                    if(null !== rVN[rVN.length-1] && typeof rVN[rVN.length-1] !== "undefined" && "" !== rVN[rVN.length-1].trim())
                                        srcAndDestVNs[srcAndDestVNs.length] = rVN[rVN.length-1];
                                    if(null !== lVN[lVN.length-1] && typeof lVN[lVN.length-1] !== "undefined" && "" !== lVN[lVN.length-1].trim())
                                        srcAndDestVNs[srcAndDestVNs.length] = lVN[lVN.length-1];
                                    if(null !== mVN[mVN.length-1] && typeof mVN[mVN.length-1] !== "undefined" && "" !== mVN[mVN.length-1].trim())
                                        srcAndDestVNs[srcAndDestVNs.length] = mVN[mVN.length-1];
                                    break;
                                }
                            }
                        }
                        var uniqueVNs = $.grep(srcAndDestVNs, function(v, k){
                            return $.inArray(v ,srcAndDestVNs) === k;
                        });
                        for(var vnCount=0; vnCount<uniqueVNs.length; vnCount++) {
                            if(uniqueVNs[vnCount] === srcVN ||
                                uniqueVNs[vnCount] === destVN) {
                                if(uniqueTypes[0] === "transparent") {
                                    //Transparent services
                                    var msg = 
                                        "Source Network and/or Destination network cannot be same as Left and Right virtual networks of the instance(s)."
                                    showInfoWindow(msg, "Invalid Rule");
                                    return false;
                                }
                            }
                        }
                        if(uniqueTypes[0] !== "transparent") {
                            if(lVN[0] !== srcVN || rVN[0] !== destVN) {
                                //In-network, In-network-nat services.
                                var msg = 
                                    "Source Network and Destination network must be same as Left and Right virtual networks of the instance respectively."
                                showInfoWindow(msg, "Invalid Rule");
                                return false;
                            }                               
                        }
                    }*/
                }
            }

            if(mirrorServicesEnabled == true) {
                var id = $($(ruleTuple[9]).find("input"))[0].id;
                var div_id = id + "_root";
                var div = $("#" + div_id);
                mirrorTo = 
                    $($("#" + div_id).find("div.span11")[1]).data("contrailMultiselect").value();
                if(mirrorTo && mirrorTo.length <=0) {
                    showInfoWindow("Select atleast one instance to mirror.", "Invalid Rule");
                    return false;
                }
                if(mirrorTo && mirrorTo.length > 1) {
                    showInfoWindow("Select only one instance to mirror.", "Invalid Rule");
                    return false;
                }

                if(allowOnlyProtocolAnyIfServiceEnabled(mirrorServicesEnabled, protocolComboboxValue, true) === false) {
                    return false;
                }
            }
        }
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

    gridPolicy = $("#gridPolicy").data("contrailGrid");
    if(isSet(gridPolicy)) {
        gridPolicy.destroy();
        $("#gridPolicy").empty();
        gridPolicy = $();
    }

    btnCreatePolicy = $("#btnCreatePolicy");
    if(isSet(btnCreatePolicy)) {
        btnCreatePolicy.remove();
        btnCreatePolicy = $();
    }

    btnDeletePolicy = $("#btnDeletePolicy");
    if(isSet(btnDeletePolicy)) {
        btnDeletePolicy.remove();
        btnDeletePolicy = $();
    }

    btnCreatePolicyCancel = $("#btnCreatePolicyCancel");
    if(isSet(btnCreatePolicyCancel)) {
        btnCreatePolicyCancel.remove();
        btnCreatePolicyCancel = $();
    }

    btnCreatePolicyOK = $("#btnCreatePolicyOK");
    if(isSet(btnCreatePolicyOK)) {
        btnCreatePolicyOK.remove();
        btnCreatePolicyOK = $();
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

    var btnCommonAddRule = $("#btnCommonAddRule");
    if(isSet()) {
        btnCommonAddRule.remove();
        btnCommonAddRule = $();
    }

    txtPolicyName = $("#txtPolicyName");
    if(isSet(txtPolicyName)) {
        txtPolicyName.remove();
        txtPolicyName = $();
    }

    var gridPolicyDetailTemplate = $("#gridPolicyDetailTemplate");
    if(isSet(gridPolicyDetailTemplate)) {
        gridPolicyDetailTemplate.remove();
        gridPolicyDetailTemplate = $();
    }

    var myModalLabel = $("#myModalLabel");
    if(isSet(myModalLabel)) {
        myModalLabel.remove();
        myModalLabel = $();
    }

    var ruleTuples = $("#ruleTuples");
    if(isSet(ruleTuples)) {
        ruleTuples.remove();
        ruleTuples = $();
    }

    windowCreatePolicy = $("#windowCreatePolicy");
    if(isSet(windowCreatePolicy)) {
        windowCreatePolicy.remove();
        windowCreatePolicy = $();
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

    var policyConfigTemplate = $("#policy-config-template");
    if(isSet(policyConfigTemplate)) {
        policyConfigTemplate.remove();
        policyConfigTemplate = $();
    }
    window.globalSubArry = [];
    window.ruleId = '';    
}
