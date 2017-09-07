/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'backbone', 'contrail-model', 'vis-node-model',
    'vis-edge-model'],
    function(_, Backbone, ContrailModel, VisNodeModel, VisEdgeModel) {
    var UnderlayGraphModel = ContrailModel.extend({
        defaultConfig : {
          nodesCollection       : null,
          edgesCollection       : null,
          underlayPathReqObj    : {},
          lastInteracted        : null,
          selectedElement       : new Backbone.Model({
                                    "nodeType": "",
                                    "nodeDetail": {}
                                    }),
          flowPath              : new Backbone.Model({
                                    "nodes": [],
                                    "edges": []
                                    }),
          topologyChanged       : false
        },

        formatModelConfig: function (modelConfig) {
            var self = this,
                modelConfigNodes    = modelConfig["nodes"],
                modelConfigEdges    = modelConfig["edges"],
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
                    edgeModels.push(new VisEdgeModel(modelConfigEdge,
                        bbCollectionNodes));
            });
            bbCollectionEdges = new Backbone.Collection(edgeModels);
            self.edgesCollection = bbCollectionEdges;
            modelConfig.edgesCollection = bbCollectionEdges;
            var levelup = self.getOtherSwitch();
            var cores = self.getCores();
            var spines = self.getSpines();
            var tors = self.getToRs();
            var vRouters = self.getVirtualRouters();
            var vms = self.getVirtualMachines();
            var bms = self.getBareMetalServer();

            var vRouterMap = {};
            $.each(vRouters, function(idx, obj){
                vRouterMap[obj.attributes.name()] =
                obj.attributes.model().attributes;
            });
            modelConfig.vRouterMap = vRouterMap;

            var bmsMap = {};
            $.each(bms, function(idx, obj){
                bmsMap[obj.attributes.name()] =
                obj.attributes.model().attributes;
            });
            modelConfig.bmsMap = bmsMap;

            var vmMap = {};
            $.each(vms, function(idx, obj){
                vmMap[obj.attributes.name()] =
                obj.attributes.model().attributes;
            });
            modelConfig.vmMap = vmMap;
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
            var newEdgeModel =
                new VisEdgeModel(edgeConfig, self.nodesCollection);
            self.edgesCollection.add(newEdgeModel);
            return newEdgeModel;
        },
        getPhysicalRouters: function() {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.node_type() == "physical-router");
                });
        },
        getOtherSwitch: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "otherswitch");
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
        getBareMetalServer: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "bare-metal-server");
                });
        },

        getErrorNodes: function () {
            return _.filter(this.nodesCollection.models, function(node) {
                return (node.attributes.chassis_type() == "unknown");
                });
        },
        getNodeByName: function(name) {
            var self = this,
                nodesCollection = self.nodesCollection;
            var nodeModel =
                _.filter(nodesCollection.models, function(nodeModel) {
                    return (nodeModel.attributes.name() == name);
                });
            if(nodeModel && nodeModel.length == 1) {
                return nodeModel[0];
            } else {
                return null;
            }
        },
        getNodeByElementId: function(id) {
            var nodeModel =
                _.filter(this.nodesCollection.models, function(node) {
                    return (node.attributes.element_id() == id)
                });
            if(nodeModel && nodeModel.length == 1) {
                return nodeModel[0];
            } else {
                return null;
            }
        },
        getEdgeByEndpoints: function(endpoint1, endpoint2) {
            var self = this,
                edgesCollection = self.edgesCollection;
            var edgesModel =
                _.filter(edgesCollection.models, function(edgeModel) {
                    var fromId = edgeModel.attributes.from(),
                        toId = edgeModel.attributes.to(),
                        fromModel = self.getNodeByElementId(fromId),
                        toModel = self.getNodeByElementId(toId);
                    if(null == fromModel || null == toModel)
                        return true;
                    var from = fromModel.attributes.name(),
                        to = toModel.attributes.name();
                    return ((from == endpoint1 && to == endpoint2) ||
                        (from == endpoint2 && to == endpoint1));
                });
            if(edgesModel && edgesModel.length == 1) {
                return edgesModel[0];
            } else {
                return null;
            }
        },
        getEdgeByElementId: function(id) {
            var edgeModel =
                _.filter(this.edgesCollection.models, function(edge) {
                    return (edge.attributes.element_id() == id)
                });
            if(edgeModel && edgeModel.length == 1) {
                return edgeModel[0];
            } else {
                return null;
            }
        },
        getUnderlayNodes: function() {
            return this.getOtherSwitch().concat(this.getCores().concat(
                        this.getSpines().concat(
                            this.getToRs()))).concat(
                                this.getErrorNodes());
        },
        getUnderlayEdges: function() {
            var self = this;
            return _.filter(this.edgesCollection.models, function(edge) {
                var edge_type = edge.attributes.link_type();
                if(null == edge_type || typeof edge_type == "undefined") {
                    var fromNodeModel =
                        self.getNodeByElementId(edge.attributes.from());
                    var toNodeModel =
                        self.getNodeByElementId(edge.attributes.to());
                    if(null == fromNodeModel || null == toNodeModel)
                        return false;
                    var fromNodeType = fromNodeModel.attributes.node_type();
                    var toNodeType = toNodeModel.attributes.node_type();
                    edge_type = fromNodeType.split("-")[0][0] +
                        fromNodeType.split("-")[1][0] + '-' +
                        toNodeType.split("-")[0][0] +
                        toNodeType.split("-")[1][0];
                }
                return (edge_type == "pr-pr");
            });
        },
        getParentChassisType : function(child_chassis_type) {
            child_chassis_type =
                ifNull(child_chassis_type, "unknown");
            return {
                "coreswitch"        : "",
                "spine"             : "coreswitch",
                "tor"               : "spine",
                "virtual-router"    : "tor",
                "bare-metal-server" : "tor",
                "virtual-machine"   : "virtual-router",
                "unknown"           : ""
            }[child_chassis_type];
        },
        getChildChassisType : function (parent_chassis_type) {
            parent_chassis_type =
                ifNull(parent_chassis_type, "unknown");
            return {
                "coreswitch"        : "spine",
                "spine"             : "tor",
                "tor"               : "virtual-router",
                "virtual-router"    : "virtual-machine",
                "unknown"           : ""
            }[parent_chassis_type];
          /*switch (parent_chassis_type) {
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
            }*/
        },
        getParentModels: function(nodeModel) {
            var self = this,
                nodeChassisType = nodeModel.attributes.chassis_type(),
                parentChassisType = self.getParentChassisType(nodeChassisType),
                nodeId = nodeModel.attributes.element_id(),
                parentNodeModels = [],
                parentEdgeModels = [];
            _.each(this.edgesCollection.models, function(edge) {
                var fromNodeModel =
                    self.getNodeByElementId(edge.attributes.from()),
                    toNodeModel =
                    self.getNodeByElementId(edge.attributes.to());
                if(null == fromNodeModel || null == toNodeModel)
                    return false;
                if(edge.attributes.from() == nodeId) {
                    if(fromNodeModel.attributes.chassis_type() ==
                        nodeChassisType &&
                        toNodeModel.attributes.chassis_type() ==
                        parentChassisType) {
                        parentNodeModels.push(toNodeModel);
                        parentEdgeModels.push(edge);
                    }
                } else if(edge.attributes.to() == nodeId) {
                    if(toNodeModel.attributes.chassis_type() ==
                        nodeChassisType &&
                        fromNodeModel.attributes.chassis_type() ==
                        parentChassisType) {
                        parentNodeModels.push(fromNodeModel);
                        parentEdgeModels.push(edge);
                    }
                }
            });
            return { "nodes": parentNodeModels, "edges": parentEdgeModels };
        },
        getChildModels: function(nodeModel) {
            var self = this,
                nodeChassisType = nodeModel.attributes.chassis_type(),
                childChassisType = self.getChildChassisType(nodeChassisType),
                nodeId = nodeModel.attributes.element_id(),
                childNodeModels = [],
                childEdgeModels = [];

            _.each(this.edgesCollection.models, function(edge) {
                var fromNodeModel =
                    self.getNodeByElementId(edge.attributes.from()),
                    toNodeModel =
                    self.getNodeByElementId(edge.attributes.to());
                if(null == fromNodeModel || null == toNodeModel)
                    return false;
                if(edge.attributes.from() == nodeId) {
                    if(fromNodeModel.attributes.chassis_type() ==
                        nodeChassisType &&
                        toNodeModel.attributes.chassis_type() ==
                        childChassisType) {
                        childNodeModels.push(toNodeModel);
                        childEdgeModels.push(edge);
                    }

                    if(nodeChassisType == "tor"){
                      if(fromNodeModel.attributes.chassis_type() ==
                          nodeChassisType &&
                          toNodeModel.attributes.chassis_type() ==
                          "bare-metal-server") {
                          childNodeModels.push(toNodeModel);
                          childEdgeModels.push(edge);
                      }
                    }
                } else if(edge.attributes.to() == nodeId) {
                    if(toNodeModel.attributes.chassis_type() ==
                        nodeChassisType &&
                        fromNodeModel.attributes.chassis_type() ==
                        childChassisType) {
                        childNodeModels.push(fromNodeModel);
                        childEdgeModels.push(edge);
                    }

                    if(nodeChassisType == "tor"){
                      if(toNodeModel.attributes.chassis_type() ==
                          nodeChassisType &&
                          fromNodeModel.attributes.chassis_type() ==
                            "bare-metal-server") {
                          childNodeModels.push(fromNodeModel);
                          childEdgeModels.push(edge);
                      }
                    }
                }
            });
            return { "nodes": childNodeModels, "edges": childEdgeModels };
        },
        checkIPInVrouterList: function (data) {
            var vRouterList = this.getVirtualRouters();
            for(var i = 0; i < ifNull(vRouterList,[]).length; i++) {
                var vRouterData = vRouterList[i];
                var vRouterIPs =
                getValueByJsonPath(vRouterData.attributes.model().attributes,
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
