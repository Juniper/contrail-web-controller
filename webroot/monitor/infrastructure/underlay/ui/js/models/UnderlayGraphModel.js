/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-graph-model', 'backbone'],function(ContrailGraphModel, Backbone) {
   UnderlayGraphModel = ContrailGraphModel.extend({
       nodes : [],
       links : [],
       tors : [],
       spines : [],
       cores : [],
       vRouters : [],
       vRouterMap : {},
       vmMap : {},
       VMs : [],
       VNs : [],
       tree : [],
       adjacencyList : [],
       underlayAdjacencyList : [],
       connectedElements : [],
       jointjsElements : [],
       selectedElement : {},
       flowPath: new Backbone.Model({
                     nodes: [],
                     links: []
                 }),
       underlayPathIds: [],
       underlayPathReqObj: {},
       uveMissingNodes: [],
       configMissingNodes: [],
       getElementsForUnderlayGraph : function (response) {
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
                   chassis_type: "coreswitch",
                   more_attributes: {},
                   errorMsg:'Configuration Unavailable'
               };
               nodes.push(nodeObj);
           }
           for(var i = 0; i < uveMissingLen; i++) {
               var nodeObj = {
                   name:uveMissingNodes[i],
                   node_type: "physical-router",
                   chassis_type: "coreswitch",
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
           } else {
               var spines = this.spines;
               if(spines.length > 0) {
                   firstLevelNodes = spines;
               } else {
                   var tors = this.tors;
                   if(tors.length > 0) {
                       firstLevelNodes = tors;
                   }
               }
           }
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
           var els = this.createElementsFromAdjacencyList();
           //this.addElementsToGraph(els, null);
           this.jointjsElements = els;
           return {
               elements: this.jointjsElements,
               nodes: this.nodes,
               links: this.links,
           };
       },
      
       createElementsFromAdjacencyList: function () {
           var elements = [];
           var linkElements = [];
           var self = this;
           var adjacencyList = this.adjacencyList;
           var conElements = this.connectedElements;
           var nodes = this.nodes;
           var links = this.links;
           var elMap = this.elementMap;
           _.each(adjacencyList, function(edges, parentElementLabel) {
               if(null !== elMap["node"][parentElementLabel] &&
                   typeof elMap["node"][parentElementLabel] !== "undefined") {
                   var el = self.getCell(elMap["node"][parentElementLabel]);
                   if(null !== el && typeof el !== "undefined") {
                       elements.push(el);
                       return;
                   } else {
                       el = jsonPath(conElements, '$[?(@.id=="' +
                          elMap["node"][parentElementLabel] + '")]');
                       if(typeof el === "object" && el.length === 1) {
                           elements.push(el[0]);
                           return;
                       }
                   }
               }        
               var parentNode = jsonPath(nodes, '$[?(@.name=="' +
                   parentElementLabel + '")]');
               if(false !== parentNode && parentNode.length === 1) {
                   parentNode = parentNode[0];
                   var parentName = parentNode.name;
                   var parentNodeType = parentNode.node_type;
                   elements.push(self.createNode(parentNode));
                   var currentEl = elements[elements.length-1];
                   conElements.push(currentEl);
                   var currentElId = currentEl.id;
                   elMap.node[parentName] = currentElId;
               }
           });

           _.each(adjacencyList, function(edges, parentElementLabel) {        
               var parentNode = jsonPath(nodes, '$[?(@.name=="' +
                   parentElementLabel + '")]');
               if(false !== parentNode && parentNode.length === 1) {
                   parentNode = parentNode[0];
                   var parentNodeType = parentNode.node_type;
                   var parentId = elMap.node[parentNode.name];
                   _.each(edges, function(childElementLabel) {
                       if(null !== elMap["link"][parentElementLabel +
                           "<->" + childElementLabel] &&
                           typeof elMap["link"][parentElementLabel +
                           "<->" + childElementLabel] !== "undefined") {
                           var linkEl = self.getCell(elMap["link"][parentElementLabel +
                               "<->" + childElementLabel]);
                           if(null !== linkEl && typeof linkEl !== "undefined") {
                               linkElements.push(linkEl);
                               return;
                           } else {
                               linkEl = jsonPath(conElements, '$[?(@.id=="' +
                                   elMap["link"][parentElementLabel +
                                   '<->' + childElementLabel] + '")]');
                               if(typeof linkEl === "object" &&
                                    linkEl.length === 1) {
                                   linkElements.push(linkEl[0]);
                                   return;
                               }
                           }
                       }
                       var childNode = jsonPath(nodes, '$[?(@.name=="' +
                           childElementLabel + '")]');
                       if(false !== childNode && childNode.length === 1) {
                           childNode = childNode[0];
                           var childNodeType = childNode.node_type;
                           var childId = elMap.node[childNode["name"]];
                           var link_type = parentNodeType.split("-")[0][0] +
                               parentNodeType.split("-")[1][0] + '-' + 
                               childNodeType.split("-")[0][0] +
                               childNodeType.split("-")[1][0];
                           for(var i=0; i<links.length; i++) {
                               var link = links[i];
                               if(link.endpoints[0] === link.endpoints[1])
                                   continue;
                               if((link.endpoints[0] === childElementLabel &&
                                       link.endpoints[1] === parentElementLabel) ||
                                   (link.endpoints[1] === childElementLabel &&
                                        link.endpoints[0] === parentElementLabel)) {
                                   var linkName = childElementLabel +
                                       "<->" + parentElementLabel;
                                   var altLinkName = parentElementLabel +
                                       "<->" + childElementLabel;
                                   if((null == elMap["link"][linkName] &&
                                       typeof elMap["link"][linkName] == "undefined") &&
                                       null == elMap["link"][altLinkName] && 
                                       typeof elMap["link"][altLinkName] == "undefined") {
                                       linkElements.push(self.createLink(
                                           link, link_type, parentId, childId));
                                       var currentLink =
                                           linkElements[linkElements.length-1];
                                       var currentLinkId = currentLink.id;
                                       conElements.push(currentLink);
                                       elMap.link[linkName] = currentLinkId;
                                       elMap.link[altLinkName] = currentLinkId;
                                       break;
                                   }
                               }
                           }
                       }
                   });
               }
           });

           for(var i=0; i<links.length; i++) {
               var link = links[i];
               if(link.endpoints[0] === link.endpoints[1])
                   continue;
               var endpoints = link.endpoints;
               var endpoint0 = endpoints[0];
               var endpoint1 = endpoints[1];
               var linkName = endpoint0 + "<->" + endpoint1;
               var altLinkName = endpoint1 + "<->" + endpoint0;
               if(null !== elMap["node"] && typeof elMap["node"] !== "undefined") {
                   if(null == elMap["node"][endpoint0] &&
                        typeof elMap["node"][endpoint0] == "undefined") {
                       var node = jsonPath(nodes,
                           '$[?(@.name=="' + endpoint0 + '")]');
                       if(false !== node && node.length === 1) {
                           node = node[0];
                           var nodeName = node.name;
                           var currentEl = this.createNode(node);
                           conElements.push(currentEl);
                           var currentElId = currentEl.id;
                           elMap.node[nodeName] = currentElId;
                           if(adjacencyList.hasOwnProperty(nodeName)) {
                               elements.push(currentEl);
                           }
                       }
                   }
                   if(null == elMap["node"][endpoint1] &&
                       typeof elMap["node"][endpoint1] == "undefined") {
                       var node = jsonPath(nodes,
                           '$[?(@.name=="' + endpoint1 + '")]');
                       if(false !== node && node.length === 1) {
                           node = node[0];
                           var nodeName = node.name;
                           var currentEl = this.createNode(node);
                           conElements.push(currentEl);
                           var currentElId = currentEl.id;
                           elMap.node[nodeName] = currentElId;
                           if(adjacencyList.hasOwnProperty(nodeName)) {
                               elements.push(currentEl);
                           }
                       }
                   }
               }

               if(null !== elMap["link"] && typeof elMap["link"] !== "undefined") {
                   if((null == elMap["link"][linkName] &&
                       typeof elMap["link"][linkName] == "undefined") ||
                       null == elMap["link"][altLinkName] &&
                       typeof elMap["link"][altLinkName] == "undefined") {
                       var parentNode = jsonPath(nodes,
                           '$[?(@.name=="' + endpoint0 + '")]');
                       if(false !== parentNode && parentNode.length === 1) {
                           parentNode = parentNode[0];
                           var parentNodeType = parentNode.node_type;
                           var parentId = elMap.node[parentNode.name];
                           var childNode = jsonPath(nodes,
                               '$[?(@.name=="' + endpoint1 + '")]');
                           if(false !== childNode && childNode.length === 1) {
                               childNode = childNode[0];
                               var childNodeType = childNode.node_type;
                               var childId = elMap.node[childNode.name];
                               var link_type = parentNodeType.split("-")[0][0] +
                                   parentNodeType.split("-")[1][0] + '-' + 
                                   childNodeType.split("-")[0][0] +
                                   childNodeType.split("-")[1][0];
                               var linkEl = this.createLink(link,
                                   link_type, parentId, childId);
                               conElements.push(linkEl);
                               var currentLinkId = linkEl.id;
                               elMap.link[linkName] = currentLinkId;
                               elMap.link[altLinkName] = currentLinkId;
                               if(adjacencyList.hasOwnProperty(endpoint0) &&
                                   adjacencyList.hasOwnProperty(endpoint1)) {
                                   linkElements.push(linkEl);
                               }
                           }
                       }
                   } else {
                       //Check if already added to linkElements to be rendered. If yes, do nothing.
                       linkEl = jsonPath(linkElements,
                           '$[?(@.id=="' + elMap["link"][linkName] + '")]');
                       if(typeof linkEl === "object" && linkEl.length === 1) {
                           //already exists, dont do anything.
                       } else {
                           //Check in Graph. If available, add again to render.
                           var linkEl = this.getCell(elMap["link"][linkName]);
                           if(null !== linkEl && typeof linkEl !== "undefined") {
                               if(adjacencyList.hasOwnProperty(endpoint0) &&
                                   adjacencyList.hasOwnProperty(endpoint1)) {
                                   linkElements.push(linkEl);
                               }
                           } else {
                               //Check if this element already created. If yes, add to linkElements if this link
                               // exists in adjList
                               linkEl = jsonPath(conElements,
                                   '$[?(@.id=="' + elMap["link"][linkName] + '")]');
                               if(typeof linkEl === "object" &&
                                    linkEl.length === 1) {
                                   if(adjacencyList.hasOwnProperty(endpoint0) &&
                                       adjacencyList.hasOwnProperty(endpoint1)) {
                                       linkElements.push(linkEl[0]);
                                   }
                               }
                           }
                       }
                   }
               }
           }
           this.connectedElements = conElements;
           // Links must be added after all the elements. This is because when the links
           // are added to the graph, link source/target
           // elements must be in the graph already.
           return elements.concat(linkElements.unique());
       },
       
       addElementsToGraph: function (els, clickedElement) {
           var paper = $('#' + ctwl.UNDERLAY_GRAPH_ID).data('graphView');
           $('#' + ctwl.UNDERLAY_GRAPH_ID).find("div").remove();
           this.clear();
           paper.setDimensions(2000,2000);
           paper.setOrigin(0,0);
           $('#' + ctwl.UNDERLAY_GRAPH_ID).prop('style')
               .removeProperty('transform');
           $('#' + ctwl.UNDERLAY_GRAPH_ID).offset({
               "top" : $('#' + ctwl.UNDERLAY_GRAPH_ID).parent().offset().top,
               "left": $('#' + ctwl.UNDERLAY_GRAPH_ID).parent().offset().left
           });
           //this.addCells(els);
           var newGraphSize = joint.layout.DirectedGraph.layout(this,
               {"rankDir" : "TB", "nodeSep" : 50, "rankSep" : 50});
           var svgHeight = newGraphSize.height;
           var svgWidth = newGraphSize.width;
           var viewAreaHeight = $('#' + ctwl.UNDERLAY_GRAPH_ID).height();
           var viewAreaWidth = $('#' + ctwl.UNDERLAY_GRAPH_ID).width();
           var paperWidth = paper.options.width;
           var paperHeight = paper.options.height;
           var newPaperHeight = paperHeight;
           var newPaperWidth = paperWidth;
           var offsetX = 0;
           var offsetY = 15;
           var offset = {
               x: 0,
               y: 0
           };
           if(svgHeight > paperHeight) {
               newPaperHeight = svgHeight;
           }
           if(svgWidth > paperWidth) {
               newPaperWidth = svgWidth;
           }
           if(newPaperHeight !== 2000 || newPaperWidth !== 2000 )
               paper.setDimensions(newPaperWidth, newPaperHeight);

           if(svgHeight < viewAreaHeight) {
               offsetY = (viewAreaHeight - svgHeight)/2;
           }
           if(svgWidth < viewAreaWidth) {
               offsetX = (viewAreaWidth - svgWidth)/2;
           }

           offset = {
               x: offsetX,
               y: offsetY
           };
           $.each(els, function (elementKey, elementValue) {
               elementValue.translate(offset.x, offset.y);
           });
           if(svgHeight > viewAreaHeight) {
               $("#" + ctwl.UNDERLAY_GRAPH_ID).offset({
                   "top" : -(svgHeight - viewAreaHeight)/2
               });
           }
           if(svgWidth > viewAreaWidth) {
               if(typeof clickedElement !== "undefined" &&
                   null !== clickedElement) {
                   var fixedDivPosition =
                       $('#' + ctwl.UNDERLAY_GRAPH_ID).parent().offset();
                   var fixedDivWidth =
                       $('#' + ctwl.UNDERLAY_GRAPH_ID).parent().width();
                   var fixedDivHeight =
                       $('#' + ctwl.UNDERLAY_GRAPH_ID).parent().height();
                   var centerXOfFixedDiv =
                       fixedDivPosition.left + (fixedDivWidth/2);
                   var clickedElementAbsPosition = 
                       $('div.font-element[font-element-model-id="'+ clickedElement.id +'"]').offset();
                   var clickedElementAbsPositionX =
                       clickedElementAbsPosition.left;
                   var offsetToMoveX =
                       clickedElementAbsPositionX - centerXOfFixedDiv;
                   $('#' + ctwl.UNDERLAY_GRAPH_ID).css({
                       "left": (-offsetToMoveX) + "px"
                   });
               }
           }
           this.markErrorNodes();
       },
       
       createLink: function (link, link_type, srcId, tgtId) {
           var options;
           var linkElement;
           link.link_type = link_type;
           options = {
               direction   : "bi",
               linkType    : link.link_type,
               linkDetails : link
           };
           link['connectionStroke'] = '#637939';

           options['sourceId'] = srcId;
           options['targetId'] = tgtId;
           linkElement = new ContrailElement('link', options);
           return linkElement;
       },
       
       createNode: function (node) {
           var nodeName = node['name'],
           type = node.node_type,
           chassis_type = node.chassis_type,
           width = 40,
           height = 40,
           imageLink, element, options, imageName;
           var refX, refY;
           var labelNodeName = contrail.truncateText(nodeName,20);
           switch(chassis_type) {
               case "coreswitch":
                   chassis_type = 'router';
                   break;
               case "spine":
                   chassis_type = 'router';
                   break;
               case "tor":
                   chassis_type = 'switch';
                   break;
               case "virtual-machine":
                   if(node.hasOwnProperty('more_attributes') &&
                       node.more_attributes.hasOwnProperty('vm_name') &&
                       node.more_attributes.vm_name.trim() !== "" &&
                       node.more_attributes.vm_name.trim() !== "-") {
                       labelNodeName = contrail.truncateText(
                           node.more_attributes.vm_name.trim(),10);
                   } else {    
                       labelNodeName = contrail.truncateText(nodeName,10);
                   }
                   refY = .9;
                   break;
           }
           imageName = getImageName(node);
           imageLink = '/img/icons/' + imageName;
           options = {
               attrs: {
                   image: {
                       'xlink:href': imageLink,
                       width: width,
                       height: height
                   },
                   text: {
                       text: labelNodeName,
                       "ref-y": refY
                   }
               },
               size: {
                   width: width,
                   height: height
               },
               nodeDetails: node,
               font: {
                   iconClass: 'icon-contrail-' + chassis_type
               }
           };
           element = new ContrailElement(type, options);
           return element;
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