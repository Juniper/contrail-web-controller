/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'underlay-graph-model',
    'graph-view',
    'contrail-list-model',
], function (_, ContrailView, UnderlayGraphModel, GraphView, ContrailListModel) {
    var UnderlayGraphView = ContrailView.extend({
        render: function () {
            var self = this,
                graphTemplate =
                    contrail.getTemplate4Id(ctwl.TMPL_UNDERLAY_GRAPH_VIEW),
                selectorId = '#' + ctwl.UNDERLAY_GRAPH_ID,
                graphModel =
                    new UnderlayGraphModel(getUnderlayGraphModelConfig());
            self.$el.html(graphTemplate());
            var graphView = new GraphView(getUnderlayGraphViewConfig(
                    graphModel, selectorId, self));
            $(selectorId).data('graphView', graphView);
            graphView.render();
            // Drawing the underlay path and trace flow for a given flow
            graphModel.flowPath.on('change:nodes', function () {
                var nodes = graphModel.flowPath.get('nodes');
                var links = graphModel.flowPath.get('links');
                if(nodes.length <=0 || links.length <= 0){
                    showInfoWindow("Cannot Map the path for selected flow", "Info");
                    resetTopology({
                        resetBelowTabs: false,
                        model: graphModel
                    });
                    return false;
                }
                highlightedElements = {
                    nodes: [],
                    links: []
                };
                var elementMap = graphModel['elementMap'];
                var adjList = graphModel.prepareData("virtual-router");
                var nodeNames = [];
                for(var i=0; i<nodes.length; i++) {
                    nodeNames.push(nodes[i].name);
                    if(!adjList.hasOwnProperty(nodes[i].name)) {
                        adjList[nodes[i].name] = [];
                    }
                }

                for (var i = 0; i < links.length; i++) {
                    var endpoints = links[i].endpoints;
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    if(adjList.hasOwnProperty(endpoint0)) {
                        if(adjList[endpoint0].indexOf(endpoint1) == -1)
                            adjList[endpoint0][adjList[endpoint0].length] = endpoint1;
                    }
                    if(adjList.hasOwnProperty(endpoint1)) {
                        if(adjList[endpoint1].indexOf(endpoint0) == -1)
                            adjList[endpoint1][adjList[endpoint1].length] = endpoint0;
                    }
                }
                graphModel['adjacencyList'] = adjList;
                var childElementsArray = graphModel.createElementsFromAdjacencyList();

                var tors = graphModel['tors'];
                for(var i=0; i<tors.length; i++) {
                    var tor = tors[i];
                    var torName = tor.name;
                    var virtualRouters = tor.children;
                    for(var vrName in virtualRouters) {
                        if(nodeNames.indexOf(vrName) === -1) {
                            var vr_id = elementMap.node[vrName];
                            for(var j=0; j<childElementsArray.length; j++) {
                                var childEl = childElementsArray[j];
                                if(null === childEl || typeof childEl === "undefined")
                                    continue;
                                if(childEl.id === vr_id) {
                                    childElementsArray[j] = null;
                                    break;
                                }
                            }
                        }
                    }
                }
                childElementsArray = childElementsArray.filter(function(n){ return n != undefined });
                for(var i=0; i<tors.length; i++) {
                    var tor = tors[i];
                    var torName = tor.name;
                    var virtualRouters = tor.children;
                    for(var vrName in virtualRouters) {
                        if(nodeNames.indexOf(vrName) === -1) {
                            var link = torName + "<->" + vrName;
                            var altLink = vrName + "<->" + torName;
                            var link_id = elementMap.link[link];
                            var alt_link_id = elementMap.link[altLink];
                            for(var j=0; j<childElementsArray.length; j++) {
                                var childEl = childElementsArray[j];
                                if(null === childEl || typeof childEl === "undefined")
                                    continue;
                                if(childEl.id === link_id ||
                                    childEl.id === alt_link_id) {
                                    childElementsArray[j] = null;
                                }
                            }
                        }
                    }
                }
                childElementsArray = childElementsArray.filter(function(n){ return n != undefined });
                addElementsToGraph(childElementsArray);
                adjustDimensions(childElementsArray, graphModel);
                // Need to call the initClickevents again because
                // to bind events to newly added elements like vRouters
                cowu.bindPopoverInTopology(getUnderlayTooltipConfig(self),
                    graphView);
                $(".popover").popover().hide();
                var connectionWrapIds = [];
                for (var i = 0; i < links.length; i++) {
                    var endpoints = links[i].endpoints;
                    var endpoint0 = endpoints[0];
                    var endpoint1 = endpoints[1];
                    var link = elementMap.link[endpoint0 + "<->" + endpoint1];
                    if(null == link || typeof link === "undefined")
                        continue;
                    else {
                        if(typeof $("g.link[model-id='" + link + "']").find('path.connection-wrap') == "object" &&
                            $("g.link[model-id='" + link + "']").find('path.connection-wrap').length === 1) {
                            connectionWrapIds.push($("g.link[model-id='" + link + "']").find('path.connection-wrap')[0].id);
                            $("g.link[model-id='" + link + "']")
                                .css("opacity", "1");
                        }
                    }
                }
                if(connectionWrapIds.length > 0) {
                    graphModel['underlayPathIds'] = connectionWrapIds;
                    monitorInfraUtils.showFlowPath(connectionWrapIds, null, graphModel);
                }
                // When the underlay path is same for earlier flow and
                // current flow change events are not triggering so we need to
                // reset the nodes and links to empty array once the path is plotted.
                graphModel.flowPath.set('nodes',[], {silent: true});
                graphModel.flowPath.set('links',[], {silent: true});
            });
        },
        markers: function () {}
    });

    function getUnderlayGraphModelConfig() {
        return  {
            forceFit: false,
            rankDir: 'TB',
            generateElementsFn: function (response) {
                return this.getElementsForUnderlayGraph(response);
            },
            remote: {
                ajaxConfig: {
                    url: ctwl.URL_UNDERLAY_TOPOLOGY,
                    type: 'GET'
                },
                successCallback: function (response, underlayGraphModel) {
                    $('#' + ctwl.GRAPH_LOADING_ID).hide();
                    if (contrail.checkIfExist(underlayGraphModel.elementsDataObj)){
                        var elements = underlayGraphModel.elementsDataObj.elements;
                        if (elements.length > 0) {
                            adjustDimensions(elements);
                            var markers =
                                monitorInfraUtils.getMarkersForUnderlay();
                            var defs = $('#' + ctwl.UNDERLAY_GRAPH_ID ).find('svg').find('defs');
                            for(var i=0; i<markers.length; i++)
                                defs.append(markers[i]);
                        } else {
                            underlayGraphModel.empty = true;
                        }
                        return false;
                    }
                }
            },
            vlRemoteConfig: {
                vlRemoteList: [{
                    getAjaxConfig: function (response) {
                        return {
                            url: ctwl.URL_UNDERLAY_TOPOLOGY_REFRESH
                        };
                    },
                    successCallback: function (response, underlayGraphModel) {
                        if(response.topologyChanged) {
                            underlayGraphModel['tree'] = {};
                            var eleDataObj = underlayGraphModel.generateElements(
                                $.extend(true, {}, response),
                                underlayGraphModel.elementMap,
                                underlayGraphModel.rankDir);
                            addElementsToGraph(
                                eleDataObj['elements'], underlayGraphModel);
                            adjustDimensions(eleDataObj['elements']);
                        }
                    }
                }]
            },
            cacheConfig: {
                ucid: ctwc.UNDERLAY_TOPOLOGY_CACHE
            },
        };
    }
    function addElementsToGraph (elements, graphModel) {
        if(graphModel == null) {
            var paper = monitorInfraUtils.getUnderlayGraphInstance();
            graphModel = paper.model;
        }
        graphModel.clear();
        $("#" + ctwl.UNDERLAY_GRAPH_ID).find('div').remove();
        graphModel.addCells(elements);
    }
    function adjustDimensions (elements, clickedElement) {
        var paper = monitorInfraUtils.getUnderlayGraphInstance();
        var graphModel = paper.model;
        paper.setDimensions(2000,2000);
        paper.setOrigin(0,0);
        $('#' + ctwl.UNDERLAY_GRAPH_ID).prop('style')
            .removeProperty('transform');
        $('#' + ctwl.UNDERLAY_GRAPH_ID).offset({
            "top" : $('#' + ctwl.UNDERLAY_GRAPH_ID).parent().offset().top,
            "left": $('#' + ctwl.UNDERLAY_GRAPH_ID).parent().offset().left
        });
        var newGraphSize = joint.layout.DirectedGraph.layout(graphModel,
            {"rankDir" : "TB", "nodeSep" : 60, "rankSep" : 60});
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
        $.each(elements, function (elementKey, elementValue) {
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
        markErrorNodes(graphModel);
    }

    function markErrorNodes (graphModel) {
        var errorNodes = graphModel.getErrorNodes();
            var elementMap = graphModel.elementMap;
            var elementMapNodes = ifNull(elementMap['node'],{});
            if(!$.isArray(errorNodes)) {
                errorNodes = [errorNodes];
            }
            var errorNodesLen = errorNodes.length;
            for (var i = 0; i < errorNodesLen; i++) {
                if(elementMapNodes[errorNodes[i]] != null) {
                    $('div.font-element[font-element-model-id="' +
                        elementMapNodes[errorNodes[i]]  + '"]')
                    .find('i')
                    .css("color", '#b94a48');
                }
            }
    }

    function addDimlightToConnectedElements (type) {
        if (type == 'node') {
            $('div.font-element')
                .removeClass('elementHighlighted')
                .addClass('dimHighlighted');
            $('div.font-element')
                .find('i')
                .css("color", "#555");
            $('g.element')
                .removeClassSVG('elementHighlighted')
                .addClassSVG('dimHighlighted');
        } else if (type == 'link') {
            $('g.link')
                .removeClassSVG('elementHighlighted')
                .addClassSVG('dimHighlighted')
                .css('');
        }
    }

    function addHighlightToNodesAndLinks (nodes, els, graphModel) {
        var elMap = graphModel['elementMap'];
        var errorNodes = graphModel.getErrorNodes();
        if(typeof nodes == "object" && nodes.length > 0) {
            var nodeNames = [];
            for(var i=0; i<nodes.length; i++) {
                var node = nodes[i], name = node.name;
                nodeNames.push(name);
                var node_model_id = jsonPath(elMap, '$.node[' + node.name + ']');
                if(false !== node_model_id && typeof node_model_id === "object" &&
                    node_model_id.length === 1 && errorNodes.indexOf(name) == -1) {
                    node_model_id = node_model_id[0];
                    addHighlightToNode(node_model_id);
                }
            }

            $.each(elMap.link, function(link, link_id){
                var endpoints = link.split("<->");
                var endpoint0 = endpoints[0];
                var endpoint1 = endpoints[1];
                if(nodeNames.indexOf(endpoint0) !== -1 &&
                    nodeNames.indexOf(endpoint1) !== -1) {
                    addHighlightToLink(link_id);
                }
            });
        }
    }

    function addHighlightToNode (node_model_id) {
        $('div.font-element[font-element-model-id="' + node_model_id + '"]')
            .addClass('elementHighlighted')
            .removeClass('dimHighlighted')
            .removeClass('hidden');

        $('g.element[model-id="' + node_model_id + '"]')
            .addClassSVG('elementHighlighted')
            .removeClassSVG('dimHighlighted')
            .removeClassSVG('hidden');

        $('div.font-element[font-element-model-id="' + node_model_id + '"]')
            .find('i')
            .css("color", "#498AB9");
    }

    function addHighlightToLink (link_model_id) {
        $('g.link[model-id="' + link_model_id + '"]')
            .removeClassSVG('hidden')
            .removeClassSVG('dimHighlighted')
            .addClassSVG('elementHighlighted');

        $('g.link[model-id="' + link_model_id + '"]')
            .find('path.connection')
                .css("stroke", "#498AB9");
        $('g.link[model-id="' + link_model_id + '"]')
            .find('path.marker-source')
                .css("fill", "#498AB9")
                .css("stroke", "#498AB9");
        $('g.link[model-id="' + link_model_id + '"]')
            .find('path.marker-target')
                .css("fill", "#498AB9")
                .css("stroke", "#498AB9");
        $('g.link[model-id="' + link_model_id + '"]')
            .find('path.connection-wrap')
            .css("opacity", "")
            .css("fill", "")
            .css("stroke", "");
    }
    function getClickEventConfig (underlayGraphModel, self) {
        var timeout;
        return {
            'blank:pointerdblclick' :
                 function (evt) {
                     evt.stopImmediatePropagation();
                     resetTopology({resetBelowTabs: false,
                                    model: underlayGraphModel});
                 },
            'cell:pointerdblclick' :
                 function (cellView, evt, x, y) {
                     var graphView =
                         monitorInfraUtils.getUnderlayGraphInstance();
                     evt.stopImmediatePropagation();
                     if (timeout) {
                         clearTimeout(timeout);
                         timeout = null;
                     }
                     var dblClickedElement = cellView.model,
                         elementType = dblClickedElement['attributes']['type'],
                         nodeDetails =
                             dblClickedElement['attributes']['nodeDetails'];
                     switch(elementType) {
                         case 'contrail.PhysicalRouter':
                             var chassis_type    = nodeDetails['chassis_type'];
                             if(chassis_type === "tor") {
                                 underlayGraphModel.selectedElement.set({
                                     'nodeType': ctwc.PROUTER,
                                     'nodeDetail': nodeDetails});
                                 underlayGraphModel.selectedElement.set({
                                     'nodeType': '',
                                     'nodeDetail': {}},{silent:true});
                                 var children = underlayGraphModel.getChildren(
                                         nodeDetails['name'], "virtual-router");
                                 var adjList = _.clone(
                                     underlayGraphModel['underlayAdjacencyList']);
                                 if(children.length > 0) {
                                     var childrenName = [];
                                     for(var i=0; i<children.length; i++) {
                                         childrenName.push(children[i]["name"]);
                                         adjList[children[i]["name"]] = [];
                                     }
                                     adjList[nodeDetails['name']] = childrenName;
                                     underlayGraphModel['adjacencyList'] = adjList;
                                     var childElementsArray = underlayGraphModel
                                         .createElementsFromAdjacencyList();
                                     addElementsToGraph(childElementsArray);
                                     adjustDimensions(childElementsArray,
                                          dblClickedElement,
                                          underlayGraphModel);
                                     addDimlightToConnectedElements('node');
                                     addDimlightToConnectedElements('link');
                                     var thisNode = [nodeDetails];
                                     addHighlightToNodesAndLinks(
                                         thisNode.concat(children),
                                         childElementsArray,
                                         underlayGraphModel);
                                 }
                             }
                             // Need to call the initClickevents again because
                             // to bind events to newly added elements like vRouters
                             cowu.bindPopoverInTopology(
                                 getUnderlayTooltipConfig(self),
                                 graphView);
                             $(".popover").popover().hide();
                             break;

                         case 'contrail.VirtualRouter':
                             /*
                              * setting the selected element triggers
                              * handler in underlaytabview which renders the
                              * tabs of vrouter(click handler)
                              */
                             graphView.model.selectedElement.set({
                                 'nodeType': ctwc.VROUTER,
                                 'nodeDetail': nodeDetails});
                             graphView.model.selectedElement.set({
                                 'nodeType': '',
                                 'nodeDetail': {}},{silent:true});
                             var model_id = $(dblClickedElement).attr('id');
                             var children = underlayGraphModel.getChildren(
                                 nodeDetails['name'],
                                 "virtual-machine");
                             var oldAdjList =
                                 _.clone(underlayGraphModel['adjacencyList']);
                             var newAdjList =
                                 _.clone(underlayGraphModel['adjacencyList']);
                             if(children.length > 0) {
                                 var childrenName = [];
                                 for(var i=0; i<children.length; i++) {
                                     childrenName.push(children[i]["name"]);
                                     newAdjList[children[i]["name"]] = [];
                                 }
                                 newAdjList[nodeDetails['name']] = childrenName;
                             } else {
                                 newAdjList = oldAdjList;
                             }
                             underlayGraphModel['adjacencyList'] = newAdjList;
                             var childElementsArray = underlayGraphModel
                                 .createElementsFromAdjacencyList();
                             addElementsToGraph(childElementsArray, underlayGraphModel);
                             adjustDimensions(childElementsArray, dblClickedElement,
                                  underlayGraphModel);
                             addDimlightToConnectedElements('node');
                             addDimlightToConnectedElements('link');
                             var thisNode = [nodeDetails];
                             addHighlightToNodesAndLinks(
                                 thisNode.concat(children),
                                 childElementsArray,
                                 underlayGraphModel);
                             underlayGraphModel['adjacencyList'] = oldAdjList;
                             cowu.bindPopoverInTopology(
                                 getUnderlayTooltipConfig(self),
                                 graphView);
                             $(".popover").popover().hide();
                             break;
                     }
                 },
                 'cell:pointerclick': function (cellView, evt, x, y) {
                     evt.stopImmediatePropagation();
                     clearHighlightedConnectedElements();
                     addDimlightToConnectedElements();
                     var clickedElement = cellView.model;
                     var elementType    = clickedElement['attributes']['type'];
                     var nodeDetails = {};
                     if(elementType != ctwc.UNDERLAY_LINK) {
                         nodeDetails = clickedElement['attributes']['nodeDetails'];
                         addHighlightToNodesAndLinks([nodeDetails], null,
                                 underlayGraphModel);
                     }
                     var graph =
                         monitorInfraUtils.getUnderlayGraphInstance();
                     var data = {};
                     switch(elementType) {
                         case 'contrail.PhysicalRouter':
                             if(nodeDetails['more_attributes']['ifTable'] == '-')
                                 nodeDetails['more_attributes']['ifTable'] = [];
                             graph.model.selectedElement.set({
                                 'nodeType': ctwc.PROUTER,
                                 'nodeDetail': nodeDetails});
                             graph.model.selectedElement.set({
                                 'nodeType': '',
                                 'nodeDetail': {}},{silent:true});
                             break;
                         case 'contrail.VirtualRouter':
                             graph.model.selectedElement.set({
                                 'nodeType': ctwc.VROUTER,
                                 'nodeDetail': nodeDetails});
                             graph.model.selectedElement.set({
                                 'nodeType': '',
                                 'nodeDetail': {}},{silent:true});
                             break;
                         case 'contrail.VirtualMachine':
                             graph.model.selectedElement.set({
                                 'nodeType': ctwc.VIRTUALMACHINE,
                                 'nodeDetail': nodeDetails});
                             graph.model.selectedElement.set({
                                 'nodeType': '',
                                 'nodeDetail': {}},{silent:true});
                             break;
                         case 'link':
                             var targetElement =
                                 graph.model.getCell(
                                     clickedElement['attributes']['target']['id']);
                             var sourceElement =
                                 graph.model.getCell(
                                     clickedElement['attributes']['source']['id']);
                             var endpoints =
                                 [sourceElement['attributes']['nodeDetails']['name'],
                                  targetElement['attributes']['nodeDetails']['name']];
                             addHighlightToNodesAndLinks(
                                 [targetElement['attributes']['nodeDetails'],
                                  sourceElement['attributes']['nodeDetails']],
                                  null,
                                 underlayGraphModel);
                             var linkDetail = {};
                             linkDetail['endpoints'] = endpoints;
                             linkDetail['sourceElement'] = sourceElement;
                             linkDetail['targetElement'] = targetElement;
                             graph.model.selectedElement.set({
                                 'nodeType': ctwc.UNDERLAY_LINK,
                                 'nodeDetail': linkDetail});
                             graph.model.selectedElement.set({
                                 'nodeType': '',
                                 'nodeDetail': {}},{silent:true});
                             break;
                         }
                 },

                 'cell:pointerdown' :
                      function (cellView, evt, x, y) {
                          evt.stopImmediatePropagation();
                          removeUnderlayPathIds();
                      },
                 'cell:pointerup' :
                      function (cellView, evt, x, y) {
                          evt.stopImmediatePropagation();
                          var ids = underlayGraphModel['underlayPathIds'];
                          var graph =
                              monitorInfraUtils.getUnderlayGraphInstance();
                          monitorInfraUtils.showFlowPath(ids,
                               null, graph.model);
                      },
             };
         }

    function getUnderlayTooltipConfig (self) {
        var tooltipTitleTmpl =
                contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
            tooltipContentTmpl =
                contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);
        return {
            PhysicalRouter: {
                title: function (element, graphView) {
                    var viewElement = graphView.model.getCell(element.attr('model-id')),
                        pRouterName = viewElement.attributes.nodeDetails['name'];

                    return tooltipTitleTmpl({
                        name: pRouterName,
                        type: ctwl.TITLE_GRAPH_ELEMENT_PHYSICAL_ROUTER});

                },
                content: function (element, graphView) {
                    var viewElement =
                        graphView.model.getCell(element.attr('model-id'));
                        actions = [], tooltipLblValues = [], ifLength = 0;
                    var nodeDetails = getValueByJsonPath(viewElement,
                                'attributes;nodeDetails',{});
                    var iconClass = 'icon-contrail-router';
                    if(nodeDetails.chassis_type == 'tor') {
                        iconClass = 'icon-contrail-switch';
                    }
                    actions.push({
                        text: 'Configure',
                        iconClass: 'icon-cog'
                    },{
                        text: 'View',
                        iconClass: 'icon-external-link'
                    });
                    ifLength = getValueByJsonPath(nodeDetails,
                        'more_attributes;ifTable',[]).length;
                    tooltipLblValues.push({
                        label:'Name',
                        value: viewElement.attributes.nodeDetails['name']
                    });
                    if(nodeDetails['errorMsg'] != null) {
                        tooltipLblValues.push({
                            label:'Events',
                            value: nodeDetails['errorMsg']
                        });
                    } else {
                        tooltipLblValues.push({
                            label: 'Interfaces',
                            value: ifLength
                        },{
                            label: 'Management IP',
                            value: ifNull(nodeDetails['mgmt_ip'],'-')
                        });
                    }

                    return tooltipContentTmpl({
                        info: tooltipLblValues,
                        iconClass: iconClass,
                        actions: actions
                    });
                },
                dimension: {
                    width: 340
                },
                actionsCallback: function (element, graphView) {
                    var viewElement =
                        graphView.model.getCell(element.attr('model-id')),
                        actions = [];
                    var nodeDetails = viewElement.attributes.nodeDetails;
                    actions.push({
                        callback: function (key, options) {
                            loadFeature({p: 'config_pd_physicalRouters'});
                        }
                    });

                    actions.push({
                        callback: function (key, options) {
                            graphView.model.selectedElement.set({
                                'nodeType': ctwc.PROUTER,
                                'nodeDetail': nodeDetails});
                            graphView.model.selectedElement.set({
                                'nodeType': '',
                                'nodeDetail': {}},{silent:true});
                        }
                    });

                    return actions;
                }
            },
            VirtualRouter: {
                title: function (element, graphView) {
                    var viewElement = graphView.model.getCell(element.attr('model-id')),
                        vRouterName = viewElement.attributes.nodeDetails['name'];

                    return tooltipTitleTmpl({name: vRouterName, type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_ROUTER});
                },
                content: function (element, graphView) {
                    var viewElement = graphView.model.getCell(element.attr('model-id')),
                        actions = [],
                        instances = graphView.model.VMs;
                    var vms = 0, name = getValueByJsonPath(viewElement,
                            'attributes;nodeDetails;name', '-');
                    for(var i=0; i<instances.length; i++) {
                        if(instances[i]['more_attributes']['vrouter'] ===
                            name){
                            vms++;
                        }
                    }

                    actions.push({
                        text: 'Configure',
                        iconClass: 'icon-cog'
                    },{
                        text: 'View',
                        iconClass: 'icon-external-link'
                    });

                    var tooltipContent = [{
                            label:'Name',
                            value: name
                        },{
                            label: "Number of VMs",
                            value: vms
                        }
                    ];
                    return tooltipContentTmpl({
                        info: tooltipContent,
                        iconClass: 'icon-contrail-virtual-router',
                        actions: actions
                    });
                },
                dimension: {
                    width: 355
                },
                actionsCallback: function (element, graphView) {
                    var viewElement = graphView.model.getCell(element.attr('model-id')),
                        actions = [];
                    var nodeDetails = viewElement.attributes.nodeDetails;
                    actions.push({
                        callback: function (key, options) {
                            loadFeature({p: 'config_infra_vrouters'});
                        }
                    });

                    actions.push({
                        callback: function () {
                            graphView.model.selectedElement.set({
                                'nodeType': ctwc.VROUTER,
                                'nodeDetail': nodeDetails});
                            graphView.model.selectedElement.set({
                                'nodeType': '',
                                'nodeDetail': {}},{silent:true});
                        }
                    });
                    return actions;
                }
            },
            VirtualMachine: {
                title: function (element, graphView) {
                    var viewElement = graphView.model.getCell(element.attr('model-id')),
                        virtualMachineName = getValueByJsonPath(viewElement,
                            'attributes;nodeDetails;name', '-');
                    return tooltipTitleTmpl({name: virtualMachineName, type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE});
                },
                content: function (element, graphView) {
                    var viewElement = graphView.model.getCell(element.attr('model-id')),
                        actions = [], tooltipContent, tooltipLblValues = [];
                    var vmIp = "", vn = "", label, instanceName = "";
                    var instanceUUID =
                        viewElement.attributes.nodeDetails['name'];
                    var instances = graphView.model.VMs;
                    for(var i=0; i<instances.length; i++) {
                        if(instances[i].name === instanceUUID) {
                            var attributes = ifNull(instances[i]['more_attributes'],{}),ipArr = [],vnArr = [];
                            var interfaceList = ctwu.getDataBasedOnSource(ifNull(attributes['interface_list'],[]));
                            label = "Name";
                            instanceName = attributes['vm_name'];
                            for(var j = 0; j < interfaceList.length; j++) {
                                if(interfaceList[j]['virtual_network'] != null)
                                    vnArr.push(interfaceList[j]['virtual_network']);
                                if(interfaceList[j]['ip6_active'] && interfaceList[j]['ip6_address'] != '0.0.0.0')
                                    ipArr.push(interfaceList[j]['ip6_address']);
                                else if(interfaceList[j]['ip_address'] != '0.0.0.0')
                                    ipArr.push(interfaceList[j]['ip_address']);
                            }
                            if(ipArr.length > 0)
                                vmIp = ipArr.join();
                            if(vnArr.length > 0)
                                vn = ctwu.formatVNName(vnArr);
                            break;
                        }
                    }
                    if("" == instanceName)
                        instanceName =
                            viewElement.attributes.nodeDetails['name'];
                    actions.push({
                        text: 'View',
                        iconClass: 'icon-external-link'
                    });

                    tooltipContent = {
                        iconClass: 'icon-contrail-virtual-machine font-size-30',
                        actions: actions
                    };
                    tooltipLblValues = [{
                        label: label,
                        value: instanceName
                    }];
                    if(vmIp !== "") {
                        tooltipLblValues.push({
                            label: "IP",
                            value: vmIp
                        });
                    }
                    if(vn !== "") {
                        tooltipLblValues.push({
                            label: "Network(s)",
                            value: vn
                        });
                    }
                    tooltipContent['info'] = tooltipLblValues;
                    return tooltipContentTmpl(tooltipContent);
                },
                dimension: {
                    width: 355
                },
                actionsCallback: function (element, graphView) {
                    var viewElement = graphView.model.getCell(element.attr('model-id')),
                        actions = [];
                    var nodeDetails = viewElement.attributes.nodeDetails;
                    actions.push({
                        callback: function (key, options) {
                            graphView.model.selectedElement.set({
                                'nodeType': ctwc.VIRTUALMACHINE,
                                'nodeDetail': nodeDetails});
                            graphView.model.selectedElement.set({
                                'nodeType': '',
                                'nodeDetail': {}},{silent:true});
                        }
                    });

                    return actions;
                }
            },
            link: {
                title: function (element, graphView) {
                    var graphModel = graphView.model;
                    var viewElement =
                        graphModel.getCell(element.attr('model-id'));
                    var instances = graphModel['VMs'];
                    var instanceName1 = "";
                    var instanceName2 = "";
                    var endpoint1 = viewElement.attributes.linkDetails.endpoints[0];
                    var endpoint2 = viewElement.attributes.linkDetails.endpoints[1];
                    for(var i=0; i<instances.length; i++) {
                        if(instances[i].name === endpoint1) {
                            instanceName1 =
                                instances[i]['more_attributes']['vm_name'];
                        } else if (instances[i].name === endpoint1) {
                            instanceName2 =
                                instances[i]['more_attributes']['vm_name'];
                        }
                    }
                    if("" == instanceName1)
                        instanceName1 = endpoint1;
                    if("" == instanceName2)
                        instanceName2 = endpoint2;

                    return tooltipTitleTmpl({
                        name: instanceName1 + ctwc.LINK_CONNECTOR_STRING + instanceName2,
                        type: ctwl.TITLE_GRAPH_ELEMENT_CONNECTED_NETWORK
                    });
                },
                content: function (element, graphView) {
                    var viewElement =
                        graphView.model.getCell(element.attr('model-id'));
                    var local_interfaces = [];
                    var remote_interfaces = [];
                    if(viewElement.attributes && viewElement.attributes.hasOwnProperty('linkDetails') &&
                        viewElement.attributes.linkDetails.hasOwnProperty('more_attributes') &&
                        viewElement.attributes.linkDetails.more_attributes &&
                        "-" !== viewElement.attributes.linkDetails.more_attributes &&
                        viewElement.attributes.linkDetails.more_attributes.length > 0) {
                        var moreAttrs = viewElement.attributes.linkDetails.more_attributes;
                        for(var i=0; i<moreAttrs.length; i++) {
                            local_interfaces.push(moreAttrs[i].local_interface_name + " (" + moreAttrs[i].local_interface_index + ")");
                            remote_interfaces.push(moreAttrs[i].remote_interface_name + " (" + moreAttrs[i].remote_interface_index + ")");
                        }
                    }
                    data = [{
                            lbl:
                                viewElement.attributes.linkDetails.endpoints[0],
                            value:
                                local_interfaces
                        },{
                            lbl:
                                viewElement.attributes.linkDetails.endpoints[1],
                            value:
                                remote_interfaces
                        }];
                    return tooltipContentTmpl({
                        info: data,
                        iconClass: 'icon-resize-horizontal'
                    });
                },
                dimension: { width: 400 }
            }

        };
    };

    function resetTopology (options) {
        var underlayGraphModel = options['model'];
        removeUnderlayPathIds();
        underlayGraphModel['underlayPathIds'] = [];
        clearHighlightedConnectedElements();
        $("#" + ctwl.UNDERLAY_GRAPH_ID).panzoom("resetZoom");
        $("#" + ctwl.UNDERLAY_GRAPH_ID).panzoom("resetPan");
        $("#" + ctwl.UNDERLAY_GRAPH_ID).panzoom("reset");
        //resizeTopology();
        var adjList = _.clone(underlayGraphModel['underlayAdjacencyList']);
        underlayGraphModel['adjacencyList']= adjList;
        var childElementsArray =
            underlayGraphModel.createElementsFromAdjacencyList();
        addElementsToGraph(childElementsArray, underlayGraphModel);
        adjustDimensions(childElementsArray);
        if(options['resetBelowTabs'] == true) {
            monitorInfraUtils.removeUnderlayTabs();
        }
    }

    function removeUnderlayPathIds() {
        $("#"+ctwl.UNDERLAY_GRAPH_ID).find(".connection-wrap-up").remove();
        $("#"+ctwl.UNDERLAY_GRAPH_ID).find(".connection-wrap-down").remove();
    }

    function clearHighlightedConnectedElements() {
        $('div.font-element')
            .removeClass('elementHighlighted')
            .removeClass('dimHighlighted');
        $('g.element')
            .removeClassSVG('elementHighlighted')
            .removeClassSVG('dimHighlighted');
        $('div.font-element')
            .css('fill', "")
            .css('stroke', "");
        $('div.font-element')
            .find('i')
                .css("color", "#555");
        $('g.element').find('text').css('fill', "#393939");
        $('g.element').find('rect').css('fill', "#393939");

        $('g.link')
            .removeClassSVG('elementHighlighted')
            .removeClassSVG('dimHighlighted');
        $("g.link").find('path.connection')
            .css("stroke", "#393939")
            .css("opacity", "0.6")
        $("g.link").find('path.marker-source')
            .css("fill", "#393939")
            .css("stroke", "#393939");
        $("g.link").find('path.marker-target')
            .css("fill", "#393939")
            .css("stroke", "#393939");
        $("g.link").find('path.connection-wrap')
            .css("opacity", "")
            .css("fill", "")
            .css("stroke", "");

        var paper = monitorInfraUtils.getUnderlayGraphInstance();
        markErrorNodes(paper.model);
    }

    function getControlPanelConfig (self, selectorId) {
        return {
            default: {
                zoom: {
                    enabled: true,
                    selectorId: selectorId,
                    config: {
                        duration: 300,
                        increment: 0.3,
                        minScale: 0.3,
                        maxScale: 2,
                        focalZoom: false,
                        contain: false
                    }
                }
            }
        }

    }

    function getUnderlayGraphViewConfig(underlayGraphModel, selectorId, self) {
        return {
            el: $(selectorId),
            linkView: joint.shapes.contrail.LinkView,
            model: underlayGraphModel,
            tooltipConfig: getUnderlayTooltipConfig(self),
            clickEvents: getClickEventConfig(underlayGraphModel, self),
            controlPanel: getControlPanelConfig(self, selectorId),
            emptyCallback: function (contrailGraphModel) {
                var notFoundTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig =
                        $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {
                            iconClass: false,
                            defaultErrorMessage: false,
                            defaultNavLinks: false,
                            title: ctwm.NO_PHYSICALDEVICES
                    });
                $(selectorId).html(notFoundTemplate(notFoundConfig));
            },
            failureCallback: function (contrailGraphModel) {
                var xhr = contrailGraphModel.errorList[0],
                    notFoundTemplate =
                        contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig =
                        $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE,
                                {errorMessage: xhr.responseText});

                if (!(xhr.status === 0 && xhr.statusText === 'abort')) {
                    $(selectorId).html(notFoundTemplate(notFoundConfig));
                }
            }
        }
    }
    return UnderlayGraphView;
});
