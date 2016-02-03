/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {

    var RoutingPolicyFormatter = function() {
        var self = this;
        //Formating the result from api//
        this.routingPolicyDataParser = function(response) {
            var routingPolicyData = [];
            var routingPolicy = response["routing-policys"];
            if(routingPolicy != null &&
                routingPolicy != undefined){
                var routingPolicyLen = routingPolicy.length;
                for(var j=0; j < routingPolicyLen; j++) {
                    routingPolicyData.push(routingPolicy[j]['routing-policy']);
                }
            }
            return routingPolicyData;
        };
        this.RoutingPoliceyNameFormatter = function(d, c, v, cd, dc) {
            var policyName = "-";
            if(dc["fq_name"] != "" &&
               dc["fq_name"] != undefined &&
               dc["fq_name"] != null){
                var policyName = dc["fq_name"][2];
            }
            return policyName;
        };

        this.RoutingPolicyTermFormatter = function(d, c, v, cd, dc) {
            var routingPolicyData = "";
            var term =
                getValueByJsonPath(dc, "routing_policy_entries;term", []);
            var termCount = term.length;
            var termLen = termCount
            if(termLen > 3) {
                termLen = 3;
            }
            for(var i = 0; i < termLen; i++){
                routingPolicyData += self.termFormatting(term[i]);
            }
            if(termCount > 3) {
                routingPolicyData += "(" + (termCount - 3) + " more)";
            }
            return routingPolicyData;
        };

        this.RoutingPolicyTermExpandFormatter = function(d, c, v, cd, dc) {
            var routingPolicyData = "";
            var term =
                getValueByJsonPath(dc, "routing_policy_entries;term", []);
            var termLen = term.length;
            for(var i = 0; i < termLen; i++){
                routingPolicyData += self.termFormatting(term[i]);
            }
            return routingPolicyData;
        };

        this.termFormatting = function(term) {
            var formattedTerm = "";
            var from = getValueByJsonPath(term, "term_match_condition", "")
            formattedTerm += "from ";
            if (from != "") {
                var community = getValueByJsonPath(term, "term_match_condition;community", "");
                if(community != "") {
                    formattedTerm +=  "community " + self.termFormat(community) + " ";
                }
                var termPrefix = getValueByJsonPath(term,
                                             "term_match_condition;prefix", []);
                if (termPrefix.length > 0) {
                    var prefixLen = termPrefix.length;
                    for (var i = 0; i < prefixLen; i++) {
                        var perPrefix = termPrefix[i],
                            type = getValueByJsonPath(perPrefix, "prefix_type", ""),
                            prefix = getValueByJsonPath(perPrefix, "prefix", "");
                        if(prefix != "") {
                            formattedTerm +=  "prefix " + self.termFormat(prefix) + " ";
                        }
                        if(type != "") {
                            formattedTerm += self.termFormat(type) + " ";
                        }
                    }
                }
            } else {
                formattedTerm += self.termFormat("any ");
            }
            var thenValue = "";
            var then =
                getValueByJsonPath(term, "term_action_list;update;community;add", "");
            var thenCommunity = [];
            if(then != "") {
                thenValue +=  "add ";
                var thenCommunity = getValueByJsonPath(term,
                                       "term_action_list;update;community;add;community",
                                       []);
            } else {
                then =
                   getValueByJsonPath(term, "term_action_list;update;community;remove", "");
                if(then != "") {
                    thenValue +=  "remove ";
                    thenCommunity = getValueByJsonPath(term,
                                       "term_action_list;update;community;remove;community",
                                       []);
                } else {
                    then = getValueByJsonPath(term,
                                       "term_action_list;update;community;set", "");
                    if(then != "") {
                        thenValue +=  "set ";
                        thenCommunity = getValueByJsonPath(term,
                                       "term_action_list;update;community;set;community",
                                       []);
                    }
                }
            }
            if(thenCommunity.length > 0) {
                var thenCommunityVal = thenCommunity.join(", ");
                thenValue += "communities "
                              + self.termFormat(thenCommunityVal) + " ";
            }

            var localPref = getValueByJsonPath(term,
                                       "term_action_list;update;local_pref", "")
            if(localPref != "") {
                thenValue +=  "local-preference "
                              + self.termFormat(localPref) + " ";
            }
            if(thenValue == "") {
                formattedTerm += " then ";
                formattedTerm += self.termFormat("default");
            } else {
                formattedTerm += " then ";
                formattedTerm += thenValue;
            }
            var action = getValueByJsonPath(term, "term_action_list;action", "")
            if(action != "") {
                formattedTerm +=  " action " + self.termFormat(action) + " ";
            } else {
                formattedTerm +=  " action " + self.termFormat("default");
            }
            formattedTerm += "<br>";
            return formattedTerm;
        };
        this.termFormat = function(text) {
            return '<span class="rule-format">' + text  + '</span>';
        };

        this.buildFromStructure = function(fromString) {
            var returnObject = {}
            if(fromString != null && fromString.trim() != "") {
                var fromArr = fromString.trim().split("\n");
                if(fromArr.length > 0) {
                    var fromLen = fromArr.length;
                    var attr = {};
                    attr.community = 0;
                    attr.prefix = 0;
                    for(var i = 0;i < fromLen; i++) {
                        fromArr[i] = fromArr[i].replace(/ +(?= )/g,'');
                        var fromArraySplit = fromArr[i].trim().split(" ");
                        var fromKey = fromArraySplit[0].toLowerCase();
                        returnObject.error = {};
                        returnObject.error.available = false;
                        switch (fromKey) {
                            case "community":{
                                attr.community++;
                                if(attr.community > 1) {
                                    returnObject.error.message
                                      = "Can not have more than one community.";
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                if(fromArraySplit.length == 2) {
                                    returnObject.community = {};
                                    returnObject.community = fromArraySplit[1];
                                } else {
                                    if(fromArraySplit.length == 1) {
                                        returnObject.error.message =
                                                    "Enter community value.";
                                    } else {
                                        returnObject.error.message =
                                              "Community has to be in the format " +
                                              "[community <value>]<enter>\n"
                                    }
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                break;
                            }
                            case "prefix":{
                                attr.prefix++;
                                if(attr.prefix > 1) {
                                    returnObject.error.message
                                      = "Can not have more than one prefix.";
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                if(fromArraySplit.length == 2 ||
                                   fromArraySplit.length == 3) {
                                    returnObject.prefix = [];
                                    returnObject.prefix[0] = {};
                                    returnObject.prefix[0].prefix =
                                                 fromArraySplit[1];
                                    if(fromArraySplit.length == 2) {
                                        if(fromArraySplit[1] == "exact" ||
                                           fromArraySplit[1] == "longer" ||
                                           fromArraySplit[1] == "orlonger") {
                                            returnObject.error.message =
                                                     "Enter prefix value.";
                                            returnObject.error.available = true;
                                            return returnObject;
                                        }
                                        returnObject.prefix[0].prefix_type =
                                                            "exact";
                                    } else {
                                        var prefixType =
                                            fromArraySplit[2].toLowerCase();
                                        if(prefixType == "orlonger" ||
                                           prefixType == "longer" ||
                                           prefixType == "exact") {
                                        returnObject.prefix[0].prefix_type =
                                                            fromArraySplit[2];
                                        } else {
                                            returnObject.error.message =
                                            "Prefix type has to be exact or longer or orlonger.";
                                            returnObject.error.available = true;
                                            return returnObject;
                                        }
                                    }
                                } else {
                                    if(fromArraySplit.length == 1) {
                                        returnObject.error.message =
                                                     "Enter prefix value.";
                                    } else {
                                        returnObject.error.message =
                                                     "Prefix has to be in the format " +
                                                     "[prefix <value> [exact|longer|orlonger]]";
                                    }
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                break;
                            }
                            default : {
                                returnObject.error.message =
                                              "From has to be in the format " +
                                              "[community <value>]<enter>\n" +
                                              "[prefix <value> [exact|longer|orlonger]]";
                                returnObject.error.available = true;
                                return returnObject;
                            }
                        }
                    }
                }
            }
            return returnObject;
        };
        this.buildThenStructure = function(thenString) {
            var returnObject = {};
            returnObject.error = {};
            if(thenString != null && thenString.trim() != "") {
                var thenArr = thenString.trim().split("\n");
                if(thenArr.length > 0) {
                    var thenLen = thenArr.length;
                    var attr = {};
                    attr.community = 0;
                    attr.prefix = 0;
                    for(var i = 0;i < thenLen; i++) {
                        thenArr[i] = thenArr[i].replace(/ +(?= )/g,'');
                        thenArr[i] = thenArr[i].replace(/ , /g, ',');
                        thenArr[i] = thenArr[i].replace(/, /g, ',');
                        thenArr[i] = thenArr[i].replace(/ ,/g, ',');
                        var thenArraySplit = thenArr[i].trim().split(" ");
                        var thenOperation = thenArraySplit[0].toLowerCase();
                        var thenKey = "";
                        if(thenOperation == "add" || thenOperation == "set" ||
                           thenOperation == "remove") {
                            thenArraySplit.shift(1);
                        }
                        var thenKey = thenArraySplit[0].toLowerCase();
                        returnObject.error = {};
                        returnObject.error.available = false;
                        switch (thenKey) {
                            case "community":{
                                attr.community++;
                                if(attr.community > 1) {
                                    returnObject.error.message
                                      = "Can not have more than one community.";
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                if(thenOperation == "community" ||
                                    thenOperation == "") {
                                    returnObject.error.message =
                                    "Specify add or set or remove for the community.";
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                if(thenArraySplit.length == 2) {
                                    returnObject.community = {};
                                    if(thenOperation == "add") {
                                        returnObject.community.add = {};
                                        returnObject.community.add.community
                                                           = [];
                                        var valueSplit = thenArraySplit[1].split(",");
                                        for(var l = 0; l < valueSplit.length; l++) {
                                            if(valueSplit[l].trim() == ""){
                                                valueSplit.splice(l,1);
                                                l--;
                                            }
                                        }
                                        returnObject.community.add.community = valueSplit;
                                    } else if(thenOperation == "remove") {
                                        returnObject.community.remove = {};
                                        returnObject.community.remove.community
                                                           = [];
                                        var valueSplit = thenArraySplit[1].split(",");
                                        for(var l = 0; l < valueSplit.length; l++) {
                                            if(valueSplit[l].trim() == ""){
                                                valueSplit.splice(l,1);
                                                l--;
                                            }
                                        }
                                        returnObject.community.remove.community = valueSplit;
                                    } else if(thenOperation == "set") {
                                        returnObject.community.set = {};
                                        returnObject.community.set.community
                                                           = [];
                                        var valueSplit = thenArraySplit[1].split(",");
                                        for(var l = 0; l < valueSplit.length; l++) {
                                            if(valueSplit[l].trim() == ""){
                                                valueSplit.splice(l,1);
                                                l--;
                                            }
                                        }
                                        returnObject.community.set.community = valueSplit;
                                    }
                                } else {
                                    if(thenArraySplit.length == 1) {
                                        returnObject.error.message
                                                = "Enter community value.";
                                    } else {
                                        returnObject.error.message
                                                = "Community has to be in the format "
                                                + "[add|set|remove community <value1>[,value2,valuen]]<enter>";
                                    }
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                break;
                            }
                            case "local-pref": {
                                attr.prefix++;
                                if(thenOperation != "" &&
                                   thenOperation != "local-pref") {
                                    returnObject.error.message
                                            = "local-pref has to be in the format "
                                            + "[local-pref <value>].";
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                if(attr.prefix > 1) {
                                    returnObject.error.message
                                      = "Can not have more than one local pref.";
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                if(thenArraySplit.length == 2) {
                                    var isNotANumber = isNaN(thenArraySplit[1]);
                                    if(isNotANumber == true) {
                                        returnObject.error.message
                                          = "Enter local-pref value in number.";
                                        returnObject.error.available = true;
                                        return returnObject;
                                    } else {
                                        var localPref =
                                            Number(thenArraySplit[1]);
                                        if(localPref < 0) {
                                            returnObject.error.message
                                             = "local-pref value has to be more than 0.";
                                            returnObject.error.available = true;
                                            return returnObject;
                                        }
                                        returnObject["local_pref"]
                                            = Number(thenArraySplit[1]);
                                    }
                                } else {
                                    if(thenArraySplit.length == 1) {
                                        returnObject.error.message
                                            = "Enter local-pref value.";
                                    } else {
                                        returnObject.error.message
                                            = "local-pref has to be in the format "
                                            + "[local-pref <value>].";
                                    }
                                    returnObject.error.available = true;
                                    return returnObject;
                                }
                                break;
                            }
                            default : {
                                returnObject.error.message
                                            = "Then has to be in the format "
                                             + "[add|set|remove community <value1>[,value2,valuen]]<enter>"
                                             + "[local-pref <value>].";
                                returnObject.error.available = true;
                                return returnObject;
                            }
                        }
                    }
                }
            }
            return returnObject;
        };
        this.fromObjToStr = function(fromObj) {
            if(fromObj == null) {
                return "";
            }
            var returnStr = "";
            if(fromObj.community != "") {
                returnStr += "community " + fromObj.community;
            }

            var prefixVal = getValueByJsonPath(fromObj, "prefix", []),
                prefixLen = prefixVal.length;
            if (returnStr != "" && prefixLen > 0) {
                returnStr += "\n"
            }
            for (var i = 0; i < prefixLen; i++) {
                var prefixIP = getValueByJsonPath(prefixVal[i], "prefix", "");
                    prefixType = getValueByJsonPath(prefixVal[i], "prefix_type", "");
                if(prefixIP != "") {
                    returnStr += "prefix " + prefixIP;
                    returnStr += " " + prefixType;
                }
            }
            return returnStr;
        };

        this.thenObjToStr = function(thenObj) {
            if(thenObj == null) {
                return "";
            }
            var returnStr = "";
            var community = getValueByJsonPath(thenObj, "community", "");
            if(community != "") {
                var communityObj = thenObj.community;
                if("add" in communityObj) {
                    returnStr += "add ";
                    returnStr += "community " + communityObj.add.community;
                } else if("set" in communityObj) {
                    returnStr += "set ";
                    returnStr += "community " + communityObj.set.community;
                } else if("remove" in communityObj) {
                    returnStr += "remove ";
                    returnStr += "community " + communityObj.remove.community;
                }
            }
            if("local_pref" in thenObj &&
               thenObj["local_pref"] != "") {
                if(returnStr != "") returnStr += "\n"
                returnStr += "local-pref " + thenObj["local_pref"];
            }
            return returnStr;
        };
    }
    return RoutingPolicyFormatter;
});