/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'backbone', 'contrail-model', 'vis-node-model', 'vis-edge-model'],
    function(_, Backbone, ContrailModel, VisNodeModel, VisEdgeModel) {
    var UnderlayGraphModel = ContrailModel.extend({
        defaultConfig : {
          nodes                 : [],
          links                 : [],
          nodesCollection       : null,
          edgesCollection       : null,
          elementMap            : { node: {}, link: {} },
          tree                  : null,
          adjacencyList         : null,
          underlayAdjacencyList : null,
          connectedElements     : [],
          underlayPathReqObj    : {},
          lastInteracted        : null,
          selectedElement       : new Backbone.Model({
                                    nodeType: '',
                                    nodeDetail: {}
                                    }),
          flowPath              : new Backbone.Model({
                                    nodes: [],
                                    links: []
                                    }),
          topologyChanged       : false
        },

        formatModelConfig: function (modelConfig) {
            var self = this,
                modelConfigNodes    = modelConfig["nodes"],
                modelConfigEdges    = modelConfig["links"],
                nodeModels          = [],
                edgeModels          = [],
                bbCollectionNodes   = null,
                bbCollectionEdges   = null;

            _.each(modelConfigNodes, function(modelConfigNode, idx) {
                nodeModels.push(new VisNodeModel(modelConfigNode));
            });

            bbCollectionNodes = new Backbone.Collection(nodeModels);
            modelConfig.nodesCollection = bbCollectionNodes;
            self.nodesCollection = bbCollectionNodes;
            _.each(modelConfigEdges, function(modelConfigEdge, idx) {
                var existingEdge = _.filter(edgeModels, function(edge) {
                    return (edge.endpoints().sort().join(",") ==
                        modelConfigEdge.endpoints.sort().join(","));
                });
                if(existingEdge.length == 0)
                    edgeModels.push(new VisEdgeModel(modelConfigEdge, bbCollectionNodes));
            });
            bbCollectionEdges = new Backbone.Collection(edgeModels);
            self.edgesCollection = bbCollectionEdges;
            modelConfig.edgesCollection = bbCollectionEdges;
            var cores = self.getCores();
            var spines = self.getSpines();
            var tors = self.getToRs();
            var vRouters = self.getVirtualRouters();
            var vms = self.getVirtualMachines();

            var vRouterMap = {};
            $.each(vRouters, function(idx, obj){
                vRouterMap[obj.attributes.name()] = obj.attributes.model().attributes;
            });
            modelConfig.vRouterMap = vRouterMap;

            var vmMap = {};
            $.each(vms, function(idx, obj){
                vmMap[obj.attributes.name()] = obj.attributes.model().attributes;
            });
            modelConfig.vmMap = vmMap;
            var firstLevelNodes = [],
                tmpTree = {},
                tree = {};

            for(var i=0; i<self.nodesCollection.models.length; i++) {
                tmpTree[self.nodesCollection.models[i].attributes.name()] =
                    self.nodesCollection.models[i].attributes;
            }
            if(cores.length > 0) {
               firstLevelNodes = cores;
               modelConfig.firstLevelNode = "coreswitch";
            } else {
               if(spines.length > 0) {
                   firstLevelNodes = spines;
                   modelConfig.firstLevelNode = "spine";
               } else {
                   if(tors.length > 0) {
                       firstLevelNodes = tors;
                       modelConfig.firstLevelNode = "tor";
                   }
               }
            }
            modelConfig.firstLevelNodes = firstLevelNodes;
            self.parseTree(firstLevelNodes, tree, tmpTree, 
                null, self.nodesCollection, self.edgesCollection);
            var first = tmpTree[Object.keys(tmpTree)[0]];
            if(null != first && first.hasOwnProperty("name")) {
                $.each(tmpTree, function (elementKey, elementValue) {
                    tree[elementKey] = elementValue;
                });
            }
            modelConfig.tree = tree;
            modelConfig.adjacencyList = self.prepareData('tor', modelConfig.tree);
            modelConfig.underlayAdjacencyList = modelConfig.adjacencyList;
            return modelConfig;
        },
        addNode: function(nodeConfig) {
            var self = this;
            var newNodeModel = new VisNodeModel(nodeConfig);
            self.nodesCollection.add(newNodeModel);
            return newNodeModel;
        },
        addEdge: function(edgeConfig) {
            var self = this;
            var newEdgeModel = new VisEdgeModel(edgeConfig, self.nodesCollection);
            self.edgesCollection.add(newEdgeModel);
            return newEdgeModel;
        },
        getPhysicalRouters: function() {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.node_type() == "physical-router");
                });
        },
        getCores: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "coreswitch");
                });
        },
        getSpines: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "spine");
                });
        },
        getToRs: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "tor");
                });
        },
        getVirtualRouters: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "virtual-router");
                });
        },
        getVirtualMachines: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "virtual-machine");
                });
        },

        getErrorNodes: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "unknown");
                });
        },
        getNode: function(id) {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.element_id() == id)
                });
        },
        getEdge: function(id) {
            return _.filter(this.edgesCollection.models, function(edge) {
                return (edge.attributes.element_id() == id)
                });
        },
        prepareData : function (stopAt, tree) {
            var treeModel = tree;
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
                        propObj.chassis_type() !== stopAt)) {
                        adjList[prop][adjList[prop].length] = child;
                        this.prepareDG(child, children[child], adjList, stopAt);
                    }
                }
            }
        },

        parseTree : function (parents, tree, tmpTree, parent, nodesCollection, edgesCollection) {
            if(null !== parents && false !== parents &&
                typeof parents === "object" && parents.length > 0) {
                for(var i=0; i<parents.length; i++) {
                    var parentAttrs = parents[i].attributes;
                    if(tmpTree.hasOwnProperty(parentAttrs.name())) {
                        delete tmpTree[parentAttrs.name()];
                    }
                    var parent_chassis_type = parentAttrs.chassis_type();
                    var children_chassis_type =
                        this.getChildChassisType(parent_chassis_type);
                    tree[parentAttrs.name()] = parentAttrs;
                    tree[parentAttrs.name()].model().set("parent", []);
                    if($.inArray(parent, 
                        tree[parentAttrs.name()].model().attributes.parent == -1))
                        tree[parentAttrs.name()].model().attributes.parent.push(parent);
                    var children =
                        this.getChildren(parentAttrs.name(), children_chassis_type,
                            nodesCollection, edgesCollection);

                    tree[parentAttrs.name()]["children"] = {};
                    this.parseTree(children,
                      tree[parentAttrs.name()]["children"],
                        tmpTree, parentAttrs.name(), nodesCollection, edgesCollection);
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

        getChildren : function (parent, child_type, nodesCollection, edgesCollection) {
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
            //var nodes = modelConfigNodes;
            //var links = modelConfigEdges;
            //fix
            var srcPoint = _.filter(edgesCollection.models, function(edge) {
                return (edge.attributes.endpoints()[0] == parent)
                });
            var dstPoint = _.filter(edgesCollection.models, function(edge) {
                return (edge.attributes.endpoints()[1] == parent)
                });
            /*var srcPoint = jsonPath(links,
                '$[?(@.endpoints[0]=="' + parent + '")]');
            var dstPoint = jsonPath(links,
                '$[?(@.endpoints[1]=="' + parent + '")]');*/
            var children = [], childNodes = [];
            if(false !== srcPoint && srcPoint.length > 0) {
                for(var i=0; i<srcPoint.length; i++) {
                    var sp = srcPoint[i].attributes.endpoints();
                    //var otherEndNode =
                        //jsonPath(nodes, '$[?(@.name=="' + sp[1] + '")]');
                    var otherEndNode = _.filter(nodesCollection.models, function(node) {
                        return (node.attributes.name() == sp[1])
                        });
                    if(false !== otherEndNode && otherEndNode.length == 1 &&
                        otherEndNode[0].attributes.chassis_type() == child_type) {
                        children.push(otherEndNode[0].attributes.name());
                    }
                }
            }
            if(false !== dstPoint && dstPoint.length > 0) {
                for(var i=0; i<dstPoint.length; i++) {
                    var sp = dstPoint[i].attributes.endpoints();
                    //var otherEndNode =
                    //    jsonPath(nodes, '$[?(@.name=="' + sp[0] + '")]');
                    var otherEndNode = _.filter(nodesCollection.models, function(node) {
                        return (node.attributes.name() == sp[0])
                        });
                    if(false !== otherEndNode && otherEndNode.length == 1 &&
                        otherEndNode[0].attributes.chassis_type() == child_type) {
                        children.push(otherEndNode[0].attributes.name());
                    }
                }
            }
            children = children.unique();
            for(var i=0; i<children.length; i++) {
                //var childNode = jsonPath(nodes,
                //    '$[?(@.name=="' + children[i] + '")]');
                var childNode = _.filter(nodesCollection.models, function(node) {
                    return (node.attributes.name() == children[i])
                    });
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
            var vRouterList = this.getVirtualRouters();
            for(var i = 0; i < ifNull(vRouterList,[]).length; i++) {
                var vRouterData = vRouterList[i];
                var vRouterIPs = getValueByJsonPath(vRouterData.attributes.model().attributes,
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