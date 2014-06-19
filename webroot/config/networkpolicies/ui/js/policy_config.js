/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

networkpolicyConfigObj = new networkPolicyConfigObj();

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
                width: 300,
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
                width: 400,
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

                var action = $($(ruleTuple[0]).find("div")).data("contrailCombobox").text();
                if(action.trim() === "") {
                    action = "pass";
                }
                action = action.toLowerCase();

                if($($(ruleTuple[0]).find("div")).data("contrailCombobox").isEnabled() === false){
                    action = null;
                }

                var protocol = $($(ruleTuple[1]).find("div")).data("contrailCombobox").text();
                protocol = getProtocol(protocol);

                var srcVN = $($(ruleTuple[2]).find("div")).data("contrailCombobox").text();
                srcVN = checkValidSourceNetwork(srcVN);
                if(srcVN.toLowerCase() != "any" && srcVN.toLowerCase() != "local"){
                    srcVN = getFQNofVN(selectedDomain, selectedProject, srcVN);
                }
                var srcPorts = $($(ruleTuple[3]).find("input")).val();

                var direction = $($(ruleTuple[4]).find("div.span12")[1]).data("contrailDropdown").value();
                if($($(ruleTuple[4]).find("div.span12")[1]).data("contrailDropdown").isEnabled() === false) {
                    direction = "<>";
                }
                if (direction !== "<>" && direction !== ">") {
                    direction = "<>";
                }

                var destVN = $($(ruleTuple[5]).find("div")).data("contrailCombobox").text();
                destVN = checkValidDestinationNetwork(destVN);
                if(destVN.toLowerCase() != "any" && destVN.toLowerCase() != "local"){
                    destVN = getFQNofVN(selectedDomain, selectedProject, destVN);
                }
                var destPorts = $($(ruleTuple[6]).find("input")).val();
                var applyServicesEnabled = $($(ruleTuple[7]).find("input"))[0].checked;
                var mirrorServicesEnabled = $($(ruleTuple[8]).find("input"))[0].checked
                
                var applyServices = [];
                var mirrorTo = [];
                if(applyServicesEnabled == true) {
                    var id = $($(ruleTuple[7]).find("input"))[0].id;
                    var div_id = id + "_root";
                    applyServices = 
                        //$($("#" + div_id).find("select")).data("contrailMultiselect").value();
                        $($("#" + div_id).find("div.span12")[1]).data("contrailMultiselect").value();
                }
                
                if(mirrorServicesEnabled == true) {
                    var id = $($(ruleTuple[8]).find("input"))[0].id;
                    var div_id = id + "_root";
                    var div = $("#" + div_id);
                    mirrorTo = 
                        //$($("#" + div_id).find("select")).data("contrailMultiSelect").value();
                        $($("#" + div_id).find("div.span12")[1]).data("contrailMultiselect").value();
                }

                rule["application"] = [];
                rule["rule_sequence"] = {};
                rule["rule_sequence"]["major"] = -1;
                rule["rule_sequence"]["minor"] = -1;

                rule["direction"] = direction;
                rule["protocol"] = protocol.toLowerCase();

                rule["action_list"] = {};
                rule["action_list"]["simple_action"] = action;
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
                rule["src_addresses"][0]["subnet"] = null;
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

                rule["dst_addresses"] = [];
                rule["dst_addresses"][0] = {};
                rule["dst_addresses"][0]["security_group"] = null;
                rule["dst_addresses"][0]["subnet"] = null;
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

function toggleApplyServiceDiv(e, nonAnalyzerInsts, val) {
    if(e.checked === true) {
        $(e.parentNode.parentNode.children[0]).find("div").data("contrailCombobox").enable(false);
        $($(e.parentNode.parentNode.children[4]).find("div.span12")[1]).data("contrailDropdown").enable(false);
        //Select always 'Pass' if applying service
        $(e.parentNode.parentNode.children[0]).find("div").data("contrailCombobox").value("PASS");
        //Select always '<>' (Bidirectional) if applying service
        $($(e.parentNode.parentNode.children[4]).find("div.span12")[1]).data("contrailDropdown").value("<>");

        
        //Disabling 'any' on Src VN. 
        //Disabling 'local' on Src vn.
        $(e.parentNode.parentNode.children[2]).find("div").data("contrailCombobox").enableOptionList(false,["any","local"]);

        //Disabling 'any' on Dest VN.
        //Disabling 'local' on Dest vn.
        $(e.parentNode.parentNode.children[5]).find("div").data("contrailCombobox").enableOptionList(false,["any","local"]);

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
        
        var msApplyServices = document.createElement("div");
        msApplyServices.className = "span12";
        
        var div = document.createElement("div");
        div.className = "row-fluid margin-0-0-5";
        div.appendChild(msApplyServices);
        var rootDiv = document.createElement("div");
        rootDiv.id = e.id + "_root";
        rootDiv.appendChild(div);
        
        $(msApplyServices).contrailMultiselect({
            placeholder: "Select Services in the order to apply..",
            dropdownCssClass: 'select2-medium-width'
        });

        if (nonAnalyzerInsts && nonAnalyzerInsts.length > 0) {
            nonAnalyzerInsts = nonAnalyzerInsts.split(",");
            $(msApplyServices).data("contrailMultiselect").setData(nonAnalyzerInsts);
            if(val && val.length > 0) {
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
        $(e.parentNode.parentNode.children[0]).find("div").data("contrailCombobox").enable(true);

        $($(e.parentNode.parentNode.children[4]).find("div.span12")[1]).data("contrailDropdown").enable(true);

        //Enabling 'any' on Src VN.
        //Enabling 'local' on Src VN.
        $(e.parentNode.parentNode.children[2]).find("div").data("contrailCombobox").enableOptionList(true,["any","local"]);

        //Enabling 'any' on Dest VN.
        //Enabling 'local' on Dest VN.
        $(e.parentNode.parentNode.children[5]).find("div").data("contrailCombobox").enableOptionList(true,["any","local"]);

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
        var msMirrorServices = document.createElement("div");
        msMirrorServices.className = "span12";
        
        var div = document.createElement("div");
        div.className = "row-fluid margin-0-0-5";
        div.appendChild(msMirrorServices);
        var form = document.createElement("form");
        form.appendChild(div);
        var rootDiv = document.createElement("div");
        rootDiv.appendChild(form);
        rootDiv.id = e.id + "_root";

        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();

        $(msMirrorServices).contrailMultiselect({
            placeholder: "Select a service to mirror...",
            dropdownCssClass: 'select2-medium-width'
        });
        if (serviceInsts && serviceInsts.length > 0) {
            serviceInsts = serviceInsts.split(",");
            $(msMirrorServices).data("contrailMultiselect").setData(serviceInsts);
            if(val && val.length > 0) {
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
    var ruleEntry = createRuleEntry(null, $("#ruleTuples").children().length);
    if (defaultRow) {
        //$(ruleTuples).append(ruleEntry);
        $("#ruleTuples").prepend($(ruleEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(ruleEntry, parentEl.nextSibling);
    }
    scrollUp("#windowCreatePolicy",ruleEntry,false);
}

function createRuleEntry(rule, len) {
    dynamicID += 1;
    var vns = jsonPath(configObj, "$.virtual-networks[*]");
    
    var selectDivAction = document.createElement("div");
    selectDivAction.className = "span1 pull-left";
    var selectAction = document.createElement("div");
    selectAction.className = "span12";
    selectDivAction.appendChild(selectAction);

    var selectDivProtocol = document.createElement("div");
    selectDivProtocol.className = "span1 pull-left";
    var selectProtocol = document.createElement("div");
    selectProtocol.className = "span12";
    selectDivProtocol.appendChild(selectProtocol);

    var selectDivSrcNetwork = document.createElement("div");
    selectDivSrcNetwork.className = "span2 pull-left";
    var selectSrcNetwork = document.createElement("div");
    selectSrcNetwork.className = "span12";
    selectSrcNetwork.setAttribute("id" , "selectSrcNetwork_"+dynamicID);
    selectDivSrcNetwork.appendChild(selectSrcNetwork);

    var inputTxtSrcPorts = document.createElement("input");
    inputTxtSrcPorts.type = "text";
    inputTxtSrcPorts.className = "span12";
    inputTxtSrcPorts.setAttribute("placeholder", "Source ports");
    var divRowFluidSrcPorts = document.createElement("div");
    divRowFluidSrcPorts.className = "span1";
    divRowFluidSrcPorts.appendChild(inputTxtSrcPorts);

    var selectDivDirection = document.createElement("div");
    selectDivDirection.className = "span1 pull-left";
    var selectDirection = document.createElement("div");
    selectDirection.className = "span12";
    selectDivDirection.appendChild(selectDirection);
    
    var selectDivDestNetwork = document.createElement("div");
    selectDivDestNetwork.className = "span2 pull-left";
    var selectDestNetwork = document.createElement("div");
    selectDestNetwork.className = "span12";
    selectDestNetwork.setAttribute("id", "selectDestNetwork_"+dynamicID);
    selectDivDestNetwork.appendChild(selectDestNetwork);

    var inputTxtDestPorts = document.createElement("input");
    inputTxtDestPorts.type = "text";
    inputTxtDestPorts.className = "span12";
    inputTxtDestPorts.setAttribute("placeholder", "Destination ports");
    var divRowFluidDestPorts = document.createElement("div");
    divRowFluidDestPorts.className = "span1";
    divRowFluidDestPorts.appendChild(inputTxtDestPorts);

    var selectApplyService = document.createElement("input");
    selectApplyService.type = "checkbox";
    selectApplyService.className = "ace-input";
    selectApplyService.id = "cb_apply_service_" + len;
    var spanApplyService = document.createElement("span");
    spanApplyService.className = "ace-lbl";
    spanApplyService.innerHTML = "&nbsp;";
    var divRowFluidApplyService = document.createElement("div");
    divRowFluidApplyService.className = "span1";
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
    divRowFluidMirrorTo.appendChild(selectMirrorTo);
    divRowFluidMirrorTo.appendChild(spanSelectMirrorTo);

    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendRuleEntry(this);");
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
    divRowFluidMargin10.appendChild(divRowFluidApplyService);
    divRowFluidMargin10.appendChild(divRowFluidMirrorTo);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.id = "rule_" + len;
    rootDiv.className = 'rule-item';
    rootDiv.appendChild(divRowFluidMargin10);

    $(selectAction).contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        dataSource: {
        },
        placeholder: "PASS"
    });
    $(selectAction).data("contrailCombobox").setData([{"text":"PASS","value":0},{"text":"DENY","value":1}]);
    $(selectAction).data("contrailCombobox").value("PASS");
    
    $(selectProtocol).contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        dataSource: {
        },
        placeholder: "ANY"
    });
    $(selectProtocol).data("contrailCombobox").setData([{"text":"ANY","value":0},{"text":"TCP","value":1},{"text":"UDP","value":2},{"text":"ICMP","value":3}]);
    $(selectProtocol).data("contrailCombobox").value("ANY");

    $(selectSrcNetwork).contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        dataSource:{} ,
        placeholder: "any"
    });

    $(selectDirection).contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
        placeholder: "<>"
    });
    $(selectDirection).data("contrailDropdown").setData([{"text":"<>","value":"<>"},{"text":">","value":">"}]);

    $(selectDestNetwork).contrailCombobox({
        dataTextField:"text",
        dataValueField:"value",
        dataSource:{} ,
        placeholder: "any"
    });

    var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
    var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").text();
    var allVns = [{"text":"any","value":"any"},{"text":"local","value":"local"}];
    var dupAllVns = [{"text":"any","value":"any"},{"text":"local","value":"local"}];
    for (var i = 0; i < vns.length; i++) {
        var vn = vns[i];
        var virtualNetwork =
            jsonPath(configObj, 
            "$..virtual-networks[?(@.fq_name[0]=='" + vn["fq_name"][0] + 
            "' && @.fq_name[1]=='" + vn["fq_name"][1] + 
            "' && @.fq_name[2]=='" + vn["fq_name"][2] + "')]")[0]["fq_name"];
        var domain = virtualNetwork[0];
        var project = virtualNetwork[1];
        allVns[i+2] = {};
        allVns[i+2].value  = vn["uuid"];
        dupAllVns[i+2] = {};
        dupAllVns[i+2].value  = vn["uuid"];
        if(domain === selectedDomain && project === selectedProject) {
            if(vn["fq_name"][2].toLowerCase() === "any" || vn["fq_name"][2].toLowerCase() === "local"){
                allVns[i+2].text  = domain + ":" + project + ":" + vn["fq_name"][2];
                dupAllVns[i+2].text = domain + ":" + project + ":" +   vn["fq_name"][2];
            } else {
                allVns[i+2].text  = vn["fq_name"][2];
                dupAllVns[i+2].text  = vn["fq_name"][2];
            }
        }
        else {
            allVns[i+2].text  = domain + ":" + project + ":" + vn["fq_name"][2];
            dupAllVns[i+2].text  = domain + ":" + project + ":" + vn["fq_name"][2];
        }
    }
    $(selectSrcNetwork).data("contrailCombobox").setData(allVns);
    $(selectSrcNetwork).data("contrailCombobox").text("any");
    $(selectDestNetwork).data("contrailCombobox").setData(dupAllVns);
    $(selectDestNetwork).data("contrailCombobox").text("any");
    
    var sts = jsonPath(configObj, "$.service_templates[*].service-template");
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
                    $(selectAction).data("contrailCombobox").value(action);
                } else {
                    $(selectAction).data("contrailCombobox").enable(false);
                }
            }
        } else {
            $(selectAction).data("contrailCombobox").enable(false);
        }
        if(actionUnderActionList === false) {
            //If simple_action is not under "action_list", look directly under "policy_rule"
            //Dont allow to edit.
            if(null !== rule["simple_action"] && typeof rule["simple_action"] !== "undefined") {
                action = rule["simple_action"];
                $(selectAction).data("contrailCombobox").enable(false);
                $(selectAction).data("contrailCombobox").value(action.toUpperCase());
            } else {
                $(selectAction).data("contrailCombobox").enable(false);
            }
        }
        
        var protocol = rule["protocol"];
        if (null !== protocol && typeof protocol !== "undefined") {
            protocol = protocol.toUpperCase();
            $(selectProtocol).data("contrailCombobox").value(protocol);
        }
        var direction = rule["direction"];
        if (null !== direction && typeof direction !== "undefined") {
            direction = direction.toUpperCase();
            $(selectDirection).data("contrailDropdown").value(direction);
        }

        if (null !== rule["src_addresses"] && typeof rule["src_addresses"] !== "undefined" &&
            rule["src_addresses"].length > 0) {
            var srcNetwork = [];
            for (var i = 0; i < rule["src_addresses"].length; i++) {
                if (null !== rule["src_addresses"][i]["virtual_network"] &&
                    typeof rule["src_addresses"][i]["virtual_network"] !== "undefined") {
                    srcNetwork[i] = rule["src_addresses"][i]["virtual_network"];
                    var domain = srcNetwork[i].split(":")[0];
                    var project = srcNetwork[i].split(":")[1];
                    if(domain === selectedDomain && project === selectedProject) {
                        if(srcNetwork[i].split(":")[2].toLowerCase() !== "any" &&
                            srcNetwork[i].split(":")[2].toLowerCase() !== "local") {
                            srcNetwork[i]  = srcNetwork[i].split(":")[2];
                        }
                    }
                }
            }
            var srcNw = srcNetwork.join();
            $(selectSrcNetwork).data("contrailCombobox").value(srcNw);            
        }
        if (null !== rule["dst_addresses"] && typeof rule["dst_addresses"] !== "undefined" &&
            rule["dst_addresses"].length > 0) {
            var destNetwork = [];
            for (var i = 0; i < rule["dst_addresses"].length; i++) {
                if (null !== rule["dst_addresses"][i]["virtual_network"] &&
                    typeof rule["dst_addresses"][i]["virtual_network"] !== "undefined") {
                    destNetwork[i] = rule["dst_addresses"][i]["virtual_network"];
                    var domain = destNetwork[i].split(":")[0];
                    var project = destNetwork[i].split(":")[1];
                    if(domain === selectedDomain && project === selectedProject) {
                        if(destNetwork[i].split(":")[2].toLowerCase() !== "any" &&
                            destNetwork[i].split(":")[2].toLowerCase() !== "local") {
                            destNetwork[i]  = destNetwork[i].split(":")[2];
                        }
                    }
                }
            }
            var destNw = destNetwork.join();
            $(selectDestNetwork).data("contrailCombobox").value(destNw);
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
            if (null !== rule["action_list"]["apply_service"] && typeof rule["action_list"]["apply_service"] !== "undefined" &&
                rule["action_list"]["apply_service"].length > 0) {
                var applyServices = [];
                for (var i = 0; i < rule["action_list"]["apply_service"].length; i++) {
                    applyServices[i] = rule["action_list"]["apply_service"][i];
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
        $("#ddDomainSwitcher").data("contrailDropdown").value(domains[0].value);
    }
    fetchProjects("populateProjects", "failureHandlerForGridPolicy");
}

function handleDomains() {
    //fetchDataForGridPolicy();
    fetchProjects("populateProjects", "failureHandlerForGridPolicy");
}

function populateProjects(result) {
    if (result && result.projects && result.projects.length > 0) {
        //var projects = jsonPath(result, "$.projects[*].fq_name[1]");
        var projects = [];
        for (i = 0; i < result.projects.length; i++) {
            var project = result.projects[i];
            tempProjectDetail = {text:project.fq_name[1], value:project.uuid};
            projects.push(tempProjectDetail);
        }

        $("#ddProjectSwitcher").contrailDropdown({
            dataTextField:"text",
            dataValueField:"value",
            change:handleProjects
        });
        btnCreatePolicy.removeClass('disabled-link')
        $("#ddProjectSwitcher").data("contrailDropdown").enable(true);
        $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
        $("#ddProjectSwitcher").data("contrailDropdown").value(projects[0].value);
        var sel_project = getSelectedProjectObjNew("ddProjectSwitcher", "contrailDropdown");
        $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
        setCookie("project", $("#ddProjectSwitcher").data("contrailDropdown").text());
        fetchDataForGridPolicy();
    } else {
        $("#gridPolicy").data("contrailGrid")._dataView.setData([]);
        btnCreatePolicy.addClass('disabled-link');
        var emptyObj = [{text:'No Policys found',value:"Message"}];
        $("#ddProjectSwitcher").data("contrailDropdown").setData(emptyObj);
        $("#ddProjectSwitcher").data("contrailDropdown").text(emptyObj[0].text);
        $("#ddProjectSwitcher").data("contrailDropdown").enable(false);
        gridPolicy.showGridMessage("empty");
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

        policyData.push({"id":idCount++, "NetworkPolicy":policyName, "PolicyRules":ruleDescriptions, "AssociatedNetworks":networks, "PolicyUUID":uuid});
    }

    if(result.more == true || result.more == "true"){
        gridPolicy.showGridMessage('loading');
    } else {
        if(!policyData || policyData.length<=0)
            gridPolicy.showGridMessage('empty');
    }
    $("#gridPolicy").data("contrailGrid")._dataView.setData(policyData);
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
        url:"/api/tenants/config/service-instances/" + projectUUId,
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
            var sis = jsonPath(results[2][0], "$.[*].ConfigData.service-instance");
            configObj["service_instances"] = [];
            if (null !== sis && sis.length > 0) {
                for (var i = 0; i < sis.length; i++) {
                    configObj["service_instances"][i] = {};
                    configObj["service_instances"][i]["service-instance"] = sis[i];
                }
            }

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
                        var ruleEntry = createRuleEntry(rule, j);
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

            var protocol = $($(ruleTuple[1]).find("div")).data("contrailCombobox").text();
            if(protocol.trim() !== "") {
                var protocols = jsonPath($($(ruleTuple[1]).find("div")).data("contrailCombobox").getAllData(), "$..text");
                if(protocols.indexOf(protocol) === -1) {
                    showInfoWindow("Select a valid Protocol.", "Invalid Rule");
                    return false;
                }
            }
            protocol = getProtocol(protocol);

            var action_value = $($(ruleTuple[0]).find("div")).data("contrailCombobox").text();
            if(action_value.trim() !== "") {
                var action_values = jsonPath($($(ruleTuple[0]).find("div")).data("contrailCombobox").getAllData(), "$..text");
                if(action_values.indexOf(action_value) === -1) {
                    showInfoWindow("Select a valid Action.", "Invalid Rule");
                    return false;
                }
            } else {
                action_value = "pass";  
            }
            action_value = action_value.toLowerCase();
            var applyServicesEnabled = $($(ruleTuple[7]).find("input"))[0].checked;
            var mirrorServicesEnabled = $($(ruleTuple[8]).find("input"))[0].checked
            var applyServices = [];
            var mirrorTo = [];

            if(applyServicesEnabled == true) {
                var id = $($(ruleTuple[7]).find("input"))[0].id;
                var div_id = id + "_root";
                applyServices = 
                    $($("#" + div_id).find("div.span12")[1]).data("contrailMultiselect").value();
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
                if(applyServices && applyServices.length > 0) {
                    var srcVN = $($(ruleTuple[2]).find("div")).data("contrailCombobox").value();
                    var destVN = $($(ruleTuple[5]).find("div")).data("contrailCombobox").value();
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
                                        break;
                                    }
                                }
                            }
                        }
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
                        var srcVN = $($(ruleTuple[2]).find("div")).data("contrailCombobox").value();
                        var destVN = $($(ruleTuple[5]).find("div")).data("contrailCombobox").value();
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
                var id = $($(ruleTuple[8]).find("input"))[0].id;
                var div_id = id + "_root";
                var div = $("#" + div_id);
                mirrorTo = 
                    $($("#" + div_id).find("div.span12")[1]).data("contrailMultiselect").value();
                if(mirrorTo && mirrorTo.length <=0) {
                    showInfoWindow("Select atleast one instance to mirror.", "Invalid Rule");
                    return false;
                }
                if(mirrorTo && mirrorTo.length > 1) {
                    showInfoWindow("Select only one instance to mirror.", "Invalid Rule");
                    return false;
                }

                if(allowOnlyProtocolAnyIfServiceEnabled(mirrorServicesEnabled, protocol, true) === false) {
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
    
}
