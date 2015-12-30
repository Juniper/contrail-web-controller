/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-vis-model', 'backbone'],function(ContrailVisModel, Backbone) {
    UnderlayGraphModel = ContrailVisModel.extend({
       initialize: function (graphModelConfig) {
           this.nodes = [],
           this.links = [],
           this.tors = [],
           this.spines = [],
           this.cores = [],
           this.vRouters = [],
           this.vRouterMap = {},
           this.vmMap = {},
           this.VMs = [],
           this.VNs = [],
           this.tree = [],
           this.adjacencyList = [],
           this.underlayAdjacencyList = [],
           this.connectedElements = [],
           this.underlayPathIds = [],
           this.underlayPathReqObj = {},
           this.uveMissingNodes = [],
           this.configMissingNodes = [],
           this.firstLevelNode = "",
           this.selectedElement = new Backbone.Model({
               nodeType: '',
               nodeDetail: {}
           });
           this.flowPath = new Backbone.Model({
                nodes: [],
                links: []
           });
           ContrailVisModel.prototype.initialize.apply(this, [graphModelConfig]);
       },
       initializeUnderlayModel : function (response) {
           //update chasis-type in nodes
           var nodes = ifNull(response['nodes'], []);
           var configMissingNodes = getValueByJsonPath(response,
               'errors;configNotFound',[]);
           var configMissingLen = configMissingNodes.length;
           var uveMissingNodes = getValueByJsonPath(response,
               'errors;uveNotFound',[]);
           var uveMissingLen = uveMissingNodes.length;
           for(var i = 0; i < configMissingLen; i++) {
               var nodeObj = {
                   name:configMissingNodes[i],
                   node_type: "physical-router",
                   chassis_type: "unknown",
                   more_attributes: {},
                   errorMsg:'Configuration Unavailable'
               };
               nodes.push(nodeObj);
           }
           for(var i = 0; i < uveMissingLen; i++) {
               var nodeObj = {
                   name:uveMissingNodes[i],
                   node_type: "physical-router",
                   chassis_type: "unknown",
                   more_attributes: {},
                   errorMsg:'System Information Unavailable'
               };
               nodes.push(nodeObj);
           }
           for(var i = 0; i < nodes.length; i++) {
               if(nodes[i].chassis_type === "-") {
                   nodes[i].chassis_type = nodes[i].node_type;
               }
           }
           this.nodes = nodes;
           this.links = ifNull(response['links'], []);
           this.uveMissingNodes = uveMissingNodes;
           this.configMissingNodes = configMissingNodes;
           var tors = jsonPath(nodes, '$[?(@.chassis_type=="tor")]');
           if(false !== tors)
               this.tors = tors;
           else
               this.tors = [];

           var spines = jsonPath(nodes, '$[?(@.chassis_type=="spine")]');
           if(false !== spines)
               this.spines = spines;
           else
               this.spines = [];

           var cores = jsonPath(nodes,
               '$[?(@.chassis_type=="coreswitch")]');
           if(false !== cores)
               this.cores = cores;
           else
               this.cores = [];

           var vRouters = jsonPath(nodes,
               '$[?(@.chassis_type=="virtual-router")]');
           if(false !== vRouters)
               this.vRouters = vRouters;
           else
               this.vRouters = [];

           var vms = jsonPath(nodes,
               '$[?(@.chassis_type=="virtual-machine")]');
           if(false !== vms)
               this.VMs = vms;
           else
               this.VMs = [];

           var vns = jsonPath(nodes,
               '$[?(@.chassis_type=="virtual-network")]');
           if(false !== vns)
               this.VNs = vns;
           else
               this.VNs = vns;

           var vRouterMap = {};
           $.each(this.vRouters,function(idx, obj){
              vRouterMap[obj['name']] = obj;
           });
           this.vRouterMap = vRouterMap;

           var vmMap = {};
           $.each(this.VMs,function(idx,obj) {
              vmMap[obj['name']] = obj;
           });
           this.vmMap = vmMap;

           var tmpTree = {}, tree = {}, firstLevelNodes = [];

           for(var i=0; i<nodes.length; i++) {
               tmpTree[nodes[i].name] = nodes[i];
           }
           if(cores.length > 0) {
               firstLevelNodes = cores;
               this.firstLevelNode = "coreswitch";
           } else {
               var spines = this.spines;
               if(spines.length > 0) {
                   firstLevelNodes = spines;
                   this.firstLevelNode = "spine";
               } else {
                   var tors = this.tors;
                   if(tors.length > 0) {
                       firstLevelNodes = tors;
                       this.firstLevelNode = "tor";
                   }
               }
           }
           this.firstLevelNodes = firstLevelNodes;
           this.parseTree(firstLevelNodes, tree, tmpTree);
           if(JSON.stringify(tmpTree) !== "{}") {
               $.each(tmpTree, function (elementKey, elementValue) {
                   tree[elementKey] = elementValue;
               });
           }
           this.tree = tree;
           var adjacencyList = this.prepareData('tor');
           this.adjacencyList = adjacencyList;
           this.underlayAdjacencyList = adjacencyList;

           //this.addElementsToGraph(els, null);
       },

       getErrorNodes: function () {
           return this.uveMissingNodes.concat(this.configMissingNodes);
       },

       prepareData : function (stopAt) {
           var treeModel = this.tree;
           var adjList = {};
           for(var prop in treeModel) {
               if(treeModel.hasOwnProperty(prop)) {
                   this.prepareDG(prop, treeModel[prop], adjList, stopAt);
               }
           }
           return adjList;
       },

       prepareDG : function (prop, propObj, adjList, stopAt) {
           if ( typeof prop === "undefined" || null === prop ||
                   {} === prop || false === prop)
                   return;
               adjList[prop] = [];
               if(propObj.hasOwnProperty("children")) {
                   var children = propObj["children"];
                   for(var child in children) {
                       if(null === stopAt || typeof stopAt === "undefined" ||
                           (typeof stopAt === "string" &&
                                stopAt.trim() === "") ||
                           (typeof stopAt === "string" &&
                                propObj.chassis_type !== stopAt)) {
                          adjList[prop][adjList[prop].length] = child;
                          this.prepareDG(child, children[child],
                              adjList, stopAt);
                       }
                   }
               }
       },

       parseTree : function (parents, tree, tmpTree) {
           if(null !== parents && false !== parents &&
                   typeof parents === "object" && parents.length > 0) {
               for(var i=0; i<parents.length; i++) {
                   if(tmpTree.hasOwnProperty(parents[i].name)) {
                       delete tmpTree[parents[i].name];
                   }
                   var parent_chassis_type = parents[i].chassis_type;
                   var children_chassis_type =
                       this.getChildChassisType(parent_chassis_type);
                   tree[parents[i].name] = parents[i];
                   var children =
                       this.getChildren(parents[i].name, children_chassis_type);
                   tree[parents[i].name]["children"] = {};
                   this.parseTree(children,
                           tree[parents[i].name]["children"],
                           tmpTree);
               }
           }
           return tree;
       },
       getChildChassisType : function (parent_chassis_type) {
           switch (parent_chassis_type) {
               case "coreswitch":
                   return "spine";
               case "spine":
                   return "tor";
               case "tor":
                   return "virtual-router";
               case "virtual-router":
                   return "virtual-machine";
               case "unknown":
                   return "";
           }
       },
       getChildren : function (parent, child_type) {
           if(null == parent || typeof parent === "undefined" || false == parent ||
                   typeof parent === "object")
                   return [];
               if(typeof parent === "string" && "" === parent.trim())
                   return [];
               if(null == child_type || typeof child_type === "undefined" ||
                   false == child_type || typeof child_type === "object")
                   return [];
               if(typeof child_type === "string" && "" === child_type.trim())
                   return [];
               parent = parent.trim();
               child_type = child_type.trim();
               var nodes = this.nodes;
               var links = this.links;
               //fix
               var srcPoint = jsonPath(links,
                   '$[?(@.endpoints[0]=="' + parent + '")]');
               var dstPoint = jsonPath(links,
                   '$[?(@.endpoints[1]=="' + parent + '")]');
               var children = [], childNodes = [];
               if(false !== srcPoint && srcPoint.length > 0) {
                   for(var i=0; i<srcPoint.length; i++) {
                       var sp = srcPoint[i].endpoints;
                       var otherEndNode =
                           jsonPath(nodes, '$[?(@.name=="' + sp[1] + '")]');
                       if(false !== otherEndNode && otherEndNode.length == 1 &&
                           otherEndNode[0].chassis_type == child_type) {
                           children.push(otherEndNode[0].name);
                       }
                   }
               }
               if(false !== dstPoint && dstPoint.length > 0) {
                   for(var i=0; i<dstPoint.length; i++) {
                       var sp = dstPoint[i].endpoints;
                       var otherEndNode =
                           jsonPath(nodes, '$[?(@.name=="' + sp[0] + '")]');
                       if(false !== otherEndNode && otherEndNode.length == 1 &&
                           otherEndNode[0].chassis_type == child_type) {
                           children.push(otherEndNode[0].name);
                       }
                   }
               }
               children = children.unique();
               for(var i=0; i<children.length; i++) {
                   var childNode = jsonPath(nodes,
                           '$[?(@.name=="' + children[i] + '")]');
                   if(null !== childNode  && false !== childNode &&
                           typeof childNode === "object" &&
                       childNode.length == 1) {
                       childNode = childNode[0];
                       childNodes.push(childNode);
                   }
               }
               return childNodes;
       },

       checkIPInVrouterList: function (data) {
           var vRouterList = this.vRouters;
           for(var i = 0; i < ifNull(vRouterList,[]).length; i++) {
               var vRouterData = vRouterList[i];
               var vRouterIPs = getValueByJsonPath(vRouterData,
                    'more_attributes;VrouterAgent;self_ip_list',[]);
               if(vRouterIPs.indexOf(data['nodeIP']) > -1) {
                   return true;
               }
           }
           return false;
       }
   });
   return UnderlayGraphModel;
});
