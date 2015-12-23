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
            var from = getValueByJsonPath(term, "from", "")
            formattedTerm += self.termFormat("from ");
            if(from != ""){
                var community = getValueByJsonPath(term, "from;community", "");
                if(community != "") {
                    formattedTerm +=  self.termFormat("community ") + community + " ";
                }
                var type = getValueByJsonPath(term,
                                             "from;prefix;PrefixMatchType", "");
                var prefix = getValueByJsonPath(term, "from;prefix;prefix", "");
                if(prefix != "") {
                    formattedTerm +=  self.termFormat("prefix ") + prefix + " ";
                }
                if(type != "") {
                    formattedTerm += type + " ";
                }
            } else {
                formattedTerm += "any ";
            }
            var thenValue = "";
            var then =
                getValueByJsonPath(term, "then;update;community;add", "");
            var thenCommunity = [];
            if(then != "") {
                thenValue +=  "add ";
                var thenCommunity = getValueByJsonPath(term,
                                       "then;update;community;add;community",
                                       []);
            } else {
                then =
                   getValueByJsonPath(term, "then;update;community;remove", "");
                if(then != "") {
                    thenValue +=  "remove ";
                    thenCommunity = getValueByJsonPath(term,
                                       "then;update;community;remove;community",
                                       []);
                } else {
                    then = getValueByJsonPath(term,
                                       "then;update;community;set", "");
                    if(then != "") {
                        thenValue +=  "set ";
                        thenCommunity = getValueByJsonPath(term,
                                       "then;update;community;set;community",
                                       []);
                    }
                }
            }
            if(thenCommunity.length > 0) {
                var thenCommunityVal = thenCommunity.join(", ");
                thenValue += self.termFormat("communities ")
                              + thenCommunityVal + " ";
            }

            var localPref = getValueByJsonPath(term,
                                       "then;update;local-pref", "")
            if(localPref != "") {
                thenValue +=  self.termFormat("local preference ")
                              + localPref + " ";
            }
            if(thenValue == "") {
                formattedTerm += self.termFormat(" then ");
                formattedTerm += "default";
            } else {
                formattedTerm += self.termFormat(" then ");
                formattedTerm += thenValue;
            }
            var action = getValueByJsonPath(term, "then;action", "")
            if(action != "") {
                formattedTerm +=  self.termFormat(" action ") + action + " ";
            } else {
                formattedTerm +=  self.termFormat(" action ") + "default";
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
                        var fromArraySplit = fromArr[i].trim().split(" ");
                        var fromKey = fromArraySplit[0].toLowerCase();
                        returnObject.error = {};
                        returnObject.error.available = false;
                        switch (fromKey) {
                            case "community":{
                                attr.community++;
                                if(attr.community > 1) {
                                    returnObject.error.message
                                      = "Can not have more than one Community.";
                                    returnObject.error.available = true;
                                }
                                if(fromArraySplit.length == 2) {
                                    returnObject.community = {};
                                    returnObject.community = fromArraySplit[1];
                                } else {
                                    if(fromArraySplit.length == 1) {
                                        returnObject.error.message =
                                                    "Enter Community value.";
                                    } else {
                                        returnObject.error.message =
                                                     "Invalid Community.";
                                    }
                                    returnObject.error.available = true;
                                }
                                break;
                            }
                            case "prefix":{
                                attr.prefix++;
                                if(attr.prefix > 1) {
                                    returnObject.error.message
                                      = "Can not have more than one Prefix.";
                                    returnObject.error.available = true;
                                }
                                if(fromArraySplit.length == 2 ||
                                   fromArraySplit.length == 3) {
                                    returnObject.prefix = {};
                                    returnObject.prefix.prefix =
                                                 fromArraySplit[1];
                                    if(fromArraySplit.length == 2) {
                                        returnObject.prefix.PrefixMatchType =
                                                            "exact";
                                    } else {
                                        var prefixType =
                                            fromArraySplit[2].toLowerCase();
                                        if(prefixType == "orlonger" ||
                                           prefixType == "longer" ||
                                           prefixType == "exact") {
                                        returnObject.prefix.PrefixMatchType =
                                                            fromArraySplit[2];
                                        } else {
                                            returnObject.error.message =
                                            "Prefix Type has to be exact or longer or orlonger.";
                                            returnObject.error.available = true;
                                        }
                                    }
                                } else {
                                    if(fromArraySplit.length == 1) {
                                        returnObject.error.message =
                                                     "Enter Prefix value.";
                                    } else {
                                        returnObject.error.message =
                                                     "Invalid Prefix.";
                                    }
                                    returnObject.error.available = true;
                                }
                                break;
                            }
                            default : {
                                returnObject.error.message =
                                             "Invalid Object found.";
                                returnObject.error.available = true;
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
                                      = "Can not have more than one Community.";
                                    returnObject.error.available = true;
                                }
                                if(thenOperation == "community" ||
                                    thenOperation == "") {
                                    returnObject.error.message =
                                    "Specify add or set or remove for the community.";
                                    returnObject.error.available = true;
                                    break;
                                }
                                if(thenArraySplit.length == 2) {
                                    returnObject.community = {};
                                    if(thenOperation == "add") {
                                        returnObject.community.add = {};
                                        returnObject.community.add.community
                                                           = [];
                                        returnObject.community.add.community[0]
                                                           = thenArraySplit[1];
                                    } else if(thenOperation == "remove") {
                                        returnObject.community.remove = {};
                                        returnObject.community.remove.community
                                                           = [];
                                        returnObject.community.remove.community[0]
                                                           = thenArraySplit[1];
                                    } else if(thenOperation == "set") {
                                        returnObject.community.set = {};
                                        returnObject.community.set.community
                                                           = [];
                                        returnObject.community.set.community[0]
                                                           = thenArraySplit[1];
                                    }
                                } else {
                                    if(thenArraySplit.length == 1) {
                                        returnObject.error.message
                                                = "Enter Community value.";
                                    } else {
                                        returnObject.error.message
                                                = "Invalid Community.";
                                    }
                                    returnObject.error.available = true;
                                }
                                break;
                            }
                            case "local":
                            case "pref":
                            case "local-pref": {
                                attr.prefix++;
                                if(attr.prefix > 1) {
                                    returnObject.error.message
                                      = "Can not have more than one local pref.";
                                    returnObject.error.available = true;
                                }
                                if(thenArraySplit.length == 2) {
                                    var isNotANumber = isNaN(thenArraySplit[1]);
                                    if(isNotANumber == true) {
                                        returnObject.error.message
                                          = "Enter local-pref value in number.";
                                        returnObject.error.available = true;
                                        break;
                                    } else {
                                        var localPref =
                                            Number(thenArraySplit[1]);
                                        if(localPref < 0) {
                                            returnObject.error.message
                                             = "local-pref value has to be more than 0.";
                                            returnObject.error.available = true;
                                            break;
                                        }
                                        returnObject["local-pref"]
                                            = Number(thenArraySplit[1]);
                                    }
                                } else {
                                    if(thenArraySplit.length == 1) {
                                        returnObject.error.message
                                            = "Enter local-pref value.";
                                    } else {
                                        returnObject.error.message
                                            = "Invalid local-pref.";
                                    }
                                    returnObject.error.available = true;
                                }
                                break;
                            }
                            default : {
                                returnObject.error.message
                                            = "Invalid Object found.";
                                returnObject.error.available = true;
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
            var prefixVal = getValueByJsonPath(fromObj, "prefix;prefix", "");
            if(prefixVal != "") {
                if(returnStr != "") returnStr += "\n"
                returnStr += "prefix " + fromObj.prefix.prefix;
                returnStr += " " + fromObj.prefix.PrefixMatchType;
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
            if("local-pref" in thenObj &&
               thenObj["local-pref"] != "") {
                if(returnStr != "") returnStr += "\n"
                returnStr += "local-pref " + thenObj["local-pref"];
            }
            return returnStr;
        };
    }
    return RoutingPolicyFormatter;
});