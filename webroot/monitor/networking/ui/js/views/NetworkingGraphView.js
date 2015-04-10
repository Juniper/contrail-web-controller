/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-graph-model',
    'joint',
    'graph-view'
], function (_, Backbone, ContrailGraphModel, Joint, GraphView) {
    var NetworkingGraphView = Backbone.View.extend({
        render: function () {
            var graphTemplate = contrail.getTemplate4Id(cowc.TMPL_NETWORKING_GRAPH_VIEW),
                viewConfig = this.attributes.viewConfig,
                connectedGraph = viewConfig['connectedGraph'],
                configGraph = viewConfig['configGraph'],
                selectorId = '#networking-graph',
                connectedSelectorId = '#graph-connected-elements',
                configSelectorId = '#graph-config-elements';

            this.$el.html(graphTemplate);

            var connectedGraphView = this.renderConnectedGraph(connectedGraph, selectorId, connectedSelectorId, configSelectorId);
            this.renderConfigGraph(configGraph, configSelectorId, connectedGraphView);
        },

        renderConnectedGraph: function (graphConfig, selectorId, connectedSelectorId, configSelectorId) {
            var cGraphModelConfig = $.extend(true, {}, graphConfig, {
                forceFit: true,
                generateElementsFn: getElements4ConnectedGraphFn(graphConfig, selectorId)
            });

            var cGraphViewConfig = {
                el: $(connectedSelectorId),
                linkView: joint.shapes.contrail.LinkView,
                graphModelConfig: cGraphModelConfig,
                tooltipConfig: ctwgrc.getConnectedGraphTooltipConfig(),
                clickEvents: {
                    'cell:pointerclick': cgPointerClick,
                    'cell:pointerdblclick': cgPointerDblClick,
                    'blank:pointerdblclick': getCgBlankDblClick(connectedSelectorId, graphConfig)
                },
                controlPanel: getControlPanelConfig(graphConfig, selectorId, connectedSelectorId, configSelectorId),
                successCallback: function (jointObject, directedGraphSize) {
                    if (jointObject.graph.elementsDataObj.elements.length == 0) {
                        var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {
                                title: ctwm.NO_NETWORK_FOUND,
                                iconClass: false,
                                defaultErrorMessage: false,
                                navLinks: [ctwc.CONFIGURE_NETWORK_LINK_CONFIG]
                            });

                        $(selectorId).html(notFoundTemplate(notFoundConfig));
                        return;
                    }

                    var currentHashParams = layoutHandler.getURLHashParams(),
                        connectedGraphView = jointObject.paper,
                        focusedElement = graphConfig.focusedElement;

                    $(connectedSelectorId).data('graph-size', directedGraphSize);
                    $(connectedSelectorId).data('joint-object', jointObject);

                    adjustConnectedGraphDimension(selectorId, connectedSelectorId, configSelectorId);
                    panConnectedGraph2Center(focusedElement, connectedSelectorId);

                    highlightElement4ZoomedElement(connectedSelectorId, jointObject, graphConfig);

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        highlightConnectedClickedElement(currentHashParams.clickedElement, connectedGraphView)
                    } else if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT){
                        removeFaint4AllElements();
                        removeHighlight4AllElements();
                    }

                    if (!$(selectorId).find('.refresh i').hasClass('icon-repeat')) {
                        setTimeout(function(){
                            $(selectorId).find('.refresh i').removeClass('icon-spin icon-spinner').addClass('icon-repeat');
                        }, 1000);
                    }
                }
            };

            var connectedGraphView = new GraphView(cGraphViewConfig);
            connectedGraphView.render();
            return connectedGraphView;
        },

        renderConfigGraph: function (graphConfig, configSelectorId, connectedGraphView) {
            var confGraphModelConfig = $.extend(true, {}, graphConfig, {
                forceFit: false,
                generateElementsFn: getElements4ConfigGraph
            });

            var confGraphViewConfig = {
                el: $(configSelectorId),
                width: 150,
                graphModelConfig: confGraphModelConfig,
                tooltipConfig: ctwgrc.getConfigGraphTooltipConfig(),
                clickEvents: {
                    'cell:pointerclick': getConfgPointerClickFn(connectedGraphView)
                }
            };

            var configGraphView = new GraphView(confGraphViewConfig);
            configGraphView.render();
            return configGraphView;
        }
    });

    var getControlPanelConfig = function(graphConfig, selectorId, connectedSelectorId, configSelectorId) {
        return {
            default: {
                zoom: {
                    enabled: true,
                    selectorId: connectedSelectorId,
                    config: {
                        onReset: function() {
                            var focusedElement = graphConfig.focusedElement;
                            panConnectedGraph2Center(focusedElement, connectedSelectorId)
                        }
                    }
                }
            },
            custom: {
                resize: {
                    iconClass: 'icon-resize-full',
                    title: 'Resize',
                    events: {
                        click: function() {
                            return function(event) {
                                var focusedElement = graphConfig.focusedElement;
                                $(this).find('i').toggleClass('icon-resize-full').toggleClass('icon-resize-small');
                                adjustConnectedGraphDimension(selectorId, connectedSelectorId, configSelectorId);
                                panConnectedGraph2Center(focusedElement, connectedSelectorId)
                            }
                        }
                    }
                },
                realign: {
                    iconClass: function (jointObject) {
                        var rankDir = jointObject.graph.rankDir;
                        return ((rankDir == ctwc.GRAPH_DIR_TB) ? 'icon-align-left' : 'icon-align-center');
                    },
                    title: 'Change Direction',
                    events: {
                        click: function() {
                            return function (event) {
                                var jointObject = $(connectedSelectorId).data('joint-object'),
                                    connectedGraphView = jointObject.paper;

                                if ($(this).find('i').hasClass('icon-align-left')) {
                                    connectedGraphView.model.reLayoutGraph(ctwc.GRAPH_DIR_LR);
                                } else if ($(this).find('i').hasClass('icon-align-center')) {
                                    connectedGraphView.model.reLayoutGraph(ctwc.GRAPH_DIR_TB);
                                }
                            }
                        }
                    }
                },
                refresh: {
                    iconClass: 'icon-repeat',
                    title: 'Refresh',
                    events: {
                        click: function() {
                            return function (event) {
                                var jointObject = $(connectedSelectorId).data('joint-object'),
                                    connectedGraphView = jointObject.paper;

                                if ($(this).find('i').hasClass('icon-repeat')) {
                                    $(this).find('i').removeClass('icon-repeat').toggleClass('icon-spin icon-spinner');
                                    connectedGraphView.refreshData();
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    function getElements4ConnectedGraphFn(graphconfig, selectorId) {
        var focusedElementType = graphconfig.focusedElement.type,
            fqName = graphconfig.focusedElement.name.fqName;

        return function (response, elementMap, rankDir) {
            var connectedElements = [],
                zoomedElements = [],
                nodes = response['nodes'],
                zoomedNodeElement = null,
                links = response['links'],
                zoomedNode = null;

            if (focusedElementType == ctwc.GRAPH_ELEMENT_PROJECT) {
                createNodeElements(nodes, connectedElements, elementMap);
            } else {
                var zoomedNodeKey = null,
                    options = null;

                $.each(nodes, function (nodeKey, nodeValue) {
                    if (nodeValue.name == fqName) {
                        zoomedNode = nodeValue;
                        zoomedNodeKey = nodeKey;

                        if (rankDir == ctwc.GRAPH_DIR_TB) {
                            options = getVerticalZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);
                        } else if (rankDir == ctwc.GRAPH_DIR_LR) {
                            options = getHorizontalZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);
                        } else {
                            options = getZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);
                        }

                        zoomedNodeElement = createCloudZoomedNodeElement(zoomedNode, {
                            width: options['widthZoomedElement'],
                            height: options['heightZoomedElement']
                        });

                        connectedElements.push(zoomedNodeElement);
                        elementMap.node[fqName] = zoomedNodeElement.id;

                        if (rankDir == ctwc.GRAPH_DIR_TB) {
                            generateVerticalVMGraph(zoomedElements, zoomedNodeElement, options, elementMap);
                        } else if (rankDir == ctwc.GRAPH_DIR_LR) {
                            generateHorizontalVMGraph(zoomedElements, zoomedNodeElement, options, elementMap);
                        } else {
                            generateVMGraph(zoomedElements, zoomedNodeElement, options, elementMap);
                        }
                    }
                });

                nodes.splice(zoomedNodeKey, 1);
                createNodeElements(nodes, connectedElements, elementMap);
            }
            createLinkElements(links, connectedElements, elementMap);

            return {
                elements: connectedElements,
                nodes: nodes,
                links: links,
                zoomedNodeElement: zoomedNodeElement,
                zoomedElements: zoomedElements
            };
        };
    };

    function getElements4ConfigGraph(response, elementMap) {
        var configElements = [],
            collections = {},
            configData = response['configData'],
            configSVGHeight = 0;

        createNodes4ConfigData(configData, collections);

        configSVGHeight = createCollectionElements(collections, configElements, elementMap);

        return {
            elements: configElements,
            configSVGHeight: configSVGHeight
        };
    };

    function adjustConnectedGraphDimension(selectorId, connectedSelectorId, configSelectorId) {
        /*
         * Height logic (graphHeight[g], availableHeight[g], minHeight[m])
         * a < m     = m
         * g < m < a = m
         * m < g < a = g
         * m < a < g = a
         */

        var resizeFlag = ($(selectorId).parents('.visualization-container').find('.icon-resize-small').is(':visible')),
            tabHeight = resizeFlag ? 155 : 435, //TODO - move to constants
            minHeight = 300,
            availableHeight = window.innerHeight - tabHeight,
            directedGraphSize = $(connectedSelectorId).data('graph-size'),
            jointObject = $(connectedSelectorId).data('joint-object'),
            connectedGraphView = jointObject.paper,
            connectedGraphWidth = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'width') ? directedGraphSize.width : 0,
            connectedGraphHeight = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'height') ? directedGraphSize.height : 0,
            configGraphHeight = $(configSelectorId + ' svg').attr('height'),
            graphHeight = Math.max(connectedGraphHeight, configGraphHeight),
            adjustedHeight = availableHeight;

        if(!resizeFlag) {
            if (availableHeight < minHeight) {
                adjustedHeight = minHeight;
            } else {
                if (graphHeight < minHeight) {
                    adjustedHeight = minHeight;
                } else {
                    if (graphHeight < availableHeight) {
                        adjustedHeight = graphHeight;
                    }
                }
            }
        }

        connectedGraphView.setDimensions(Math.max($(selectorId).width(), connectedGraphWidth) + cowc.GRAPH_MARGIN_RIGHT,
            connectedGraphHeight + cowc.GRAPH_MARGIN_BOTTOM, 1);

        $(selectorId).parent().height(adjustedHeight);
        $(selectorId).parent().css('width', '100%');

        $(connectedSelectorId).parents('.col1').height(adjustedHeight);
        $(configSelectorId).parents('.col3').height(adjustedHeight);

        if(connectedGraphHeight < adjustedHeight) {
            $(connectedSelectorId + ' svg').attr('height', adjustedHeight);
        }

        if(configGraphHeight < adjustedHeight) { //TODO - Needs to be tested with multiple config elements
            $(configSelectorId + ' svg').attr('height', adjustedHeight);
        }
    };

    var panConnectedGraph2Center = function(focusedElement, connectedSelectorId) {
        var directedGraphSize = $(connectedSelectorId).data('graph-size'),
            connectedGraphWidth = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'width') ? directedGraphSize.width : 0,
            connectedGraphHeight = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'height') ? directedGraphSize.height : 0,
            availableGraphWidth = $(connectedSelectorId).parents('.col1').width(),
            availableGraphHeight = $(connectedSelectorId).parents('.col1').height(),
            panX = (availableGraphWidth - connectedGraphWidth) / 2,
            panY = (availableGraphHeight - connectedGraphHeight) / 2;

        if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT && (connectedGraphHeight - cowc.GRAPH_MARGIN_BOTTOM - cowc.GRAPH_MARGIN_TOP) > availableGraphHeight) {
            panY = 35 - cowc.GRAPH_MARGIN_TOP;
        }

        $(connectedSelectorId).panzoom("resetPan");
        $(connectedSelectorId).panzoom("pan", panX, panY, { relative: true });
        $(connectedSelectorId).css({'backface-visibility':'initial'});
    };

    var createVirtualMachineNode = function(position, size, node, srcVNDetails) {
        var nodeType = ctwc.GRAPH_ELEMENT_INSTANCE,
            element, options;

        options = {
            position: position,
            size: size,
            font: {
                iconClass: 'icon-contrail-virtual-machine'
            },
            nodeDetails: {
                fqName: node,
                node_type: nodeType,
                srcVNDetails: srcVNDetails
            },
            elementType: nodeType
        };
        element = new ContrailElement(nodeType, options);
        return element;
    };

    var createVirtualMachineLink = function(position, size){
        var rect = new joint.shapes.basic.Rect({
            type: 'VirtualMachineLink',
            position: position, size: size,
            attrs: {rect:{stroke: '#3182bd', opacity: 1, fill: '#3182bd'}}
        });
        return rect;
    };

    function generateVMGraph(zoomedElements, zoomedNodeElement, options, elementMap) {
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2,
            position = {},
            size = {width: vmWidth, height: vmHeight};

        var centerLineHeight = 0.1,
            xFactor = 0, yFactor = -1;

        for (var i = 0; i < vmLength; i++) {
            if (i % vmPerRow == 0) {
                xFactor = 0;
                yFactor++;
            }

            position = {x: xOrigin + (xSeparation * xFactor), y: yOrigin + ((ySeparation + centerLineHeight) * yFactor)};
            vmNode = createVirtualMachineNode(position, size, vmList[i], options['srcVNDetails']);
            elementMap.node[vmList[i]] = vmNode.id;
            xFactor++;
            zoomedElements.push(vmNode);
        }

        return zoomedElements;
    };

    function generateHorizontalVMGraph(zoomedElements, zoomedNodeElement, options, elementMap) {
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2,
            position = {},
            size = {width: vmWidth, height: vmHeight},
            virtualMachineCommonLinkPosition = {}, virtualMachineCommonLinkSize = {},
            virtualMachineLinkPosition = {}, virtualMachineLinkSize = {};

        var xFactor = 0, yFactor = 0, linkThickness = 1, rectThickness = 2, horizontalAdjustFactor = 6;
        if(vmLength !== 0){
            virtualMachineCommonLinkPosition = {x: xOrigin - vmWidth/2, y: yOrigin + ySeparation - horizontalAdjustFactor};
            virtualMachineCommonLinkSize = {width: vmLength * xSeparation + vmWidth/2, height: rectThickness};

            zoomedElements.push(createVirtualMachineLink(virtualMachineCommonLinkPosition, virtualMachineCommonLinkSize));
        }

        for (var i = 0; i < vmLength; i++) {
            position = {x: xOrigin + (xSeparation * xFactor), y: yOrigin + ((ySeparation) * yFactor)};
            vmNode = createVirtualMachineNode(position, size, vmList[i], options['srcVNDetails']);
            elementMap.node[vmList[i]] = vmNode.id;
            zoomedElements.push(vmNode);

            virtualMachineLinkPosition = {x: xOrigin + (xSeparation * xFactor)+ vmWidth/2 +1, y: yOrigin + ((ySeparation) * yFactor) + vmHeight};
            virtualMachineLinkSize = {width: linkThickness, height: (ySeparation/2) - 6};
            zoomedElements.push(createVirtualMachineLink(virtualMachineLinkPosition, virtualMachineLinkSize));

            xFactor++;
        }

        return zoomedElements;
    };

    function generateVerticalVMGraph(zoomedElements, zoomedNodeElement, options, elementMap) {
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2,
            position = {},
            size = {width: vmWidth, height: vmHeight},
            virtualMachineCommonLinkPosition = {}, virtualMachineCommonLinkSize = {},
            virtualMachineLinkPosition = {}, virtualMachineLinkSize = {};

        var centerLineHeight = 0.1,
            xFactor = 0, yFactor = -1,
            linkThickness = 1, rectThickness = 2;

        if(vmLength !== 0){
            virtualMachineCommonLinkPosition = {x: xOrigin + vmWidth + xSeparation/2, y: yOrigin - vmMargin/2};
            virtualMachineCommonLinkSize = {width: rectThickness, height: vmLength * ySeparation};
            zoomedElements.push(createVirtualMachineLink(virtualMachineCommonLinkPosition, virtualMachineCommonLinkSize));
        }

        for (var i = 0; i < vmLength; i++) {
            if (i % vmPerRow == 0) {
                xFactor = 0;
                yFactor++;
            }
            position = {x: xOrigin + (xSeparation * xFactor), y: yOrigin + ((ySeparation) * yFactor)};
            vmNode = createVirtualMachineNode(position, size, vmList[i], options['srcVNDetails']);
            elementMap.node[vmList[i]] = vmNode.id;
            zoomedElements.push(vmNode);

            virtualMachineLinkPosition = {x: xOrigin + vmWidth + 2, y: yOrigin + ((ySeparation) * yFactor) + vmHeight/2};
            virtualMachineLinkSize = {width: xSeparation/2 - 2, height: linkThickness};
            zoomedElements.push(createVirtualMachineLink(virtualMachineLinkPosition, virtualMachineLinkSize));
        }

        return zoomedElements;
    };

    var cgPointerClick = function(cellView, evt, x, y) {
        var clickedElement = cellView.model.attributes,
            elementNodeType= clickedElement.elementType,
            elementNodeId = cellView.model.id,
            bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
            tabConfig = {};

        switch (elementNodeType) {
            case ctwc.GRAPH_ELEMENT_NETWORK:
                var networkFQN = clickedElement.nodeDetails.name,
                    networkUUID = ctwu.getUUIDByName(networkFQN);

                clickedElement = {
                    fqName: networkFQN,
                    uuid: networkUUID,
                    type: elementNodeType
                };

                layoutHandler.setURLHashParams({ clickedElement: clickedElement }, { merge: true, triggerHashChange: false});

                highlightCurrentNodeElement(elementNodeId);
                tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);

                break;

            case ctwc.GRAPH_ELEMENT_INSTANCE:
                var networkFQN = clickedElement.nodeDetails.srcVNDetails.name,
                    instanceUUID = clickedElement.nodeDetails.fqName;

                clickedElement = {
                    fqName: networkFQN,
                    uuid: instanceUUID,
                    type: elementNodeType
                };

                layoutHandler.setURLHashParams({ clickedElement: clickedElement }, { merge: true, triggerHashChange: false});

                highlightCurrentNodeElement(elementNodeId);
                tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);

                break;

            case ctwc.GRAPH_ELEMENT_CONNECTED_NETWORK:
                var sourceElement = clickedElement.linkDetails.dst,
                    targetElement = clickedElement.linkDetails.src;

                clickedElement = {
                    sourceElement: sourceElement,
                    targetElement: targetElement,
                    linkDetails: clickedElement.linkDetails
                };

                highlightCurrentLinkElement(elementNodeId);
                tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);

                break;
        };
    };

    var highlightConnectedClickedElement = function(clickedElement, connectedGraphView) {
        var elementNodeType = clickedElement.type,
            elementMap = connectedGraphView.model.elementMap;

        switch (elementNodeType) {
            case ctwc.GRAPH_ELEMENT_NETWORK:
                var networkFQN = clickedElement.fqName;
                highlightCurrentNodeElement(elementMap.node[networkFQN]);

                break;

            case ctwc.GRAPH_ELEMENT_INSTANCE:
                var instanceUUID = clickedElement.uuid;
                highlightCurrentNodeElement(elementMap.node[instanceUUID]);

                break;
        };
    };

    var cgPointerDblClick = function(cellView, evt, x, y) {
        var dblClickedElement = cellView.model.attributes,
            elementNodeType= dblClickedElement.elementType,
            elementNodeId = cellView.model.id;

        switch (elementNodeType) {
            case ctwc.GRAPH_ELEMENT_NETWORK:
                loadFeature({
                    p: 'mon_networking_networks',
                    q: {
                        focusedElement: {
                            fqName: dblClickedElement.nodeDetails['name'],
                            type: elementNodeType
                        },
                        view: 'details',
                        type: 'network'
                    }
                });
                $('g.VirtualNetwork').popover('hide');
                break;

            case ctwc.GRAPH_ELEMENT_INSTANCE:
                var srcVN = dblClickedElement.nodeDetails.srcVNDetails.name;
                loadFeature({
                    p: 'mon_networking_instances',
                    q: {
                        type: 'instance',
                        view: 'details',
                        focusedElement: {
                            fqName: srcVN,
                            uuid: dblClickedElement.nodeDetails['fqName'],
                            type: ctwc.GRAPH_ELEMENT_NETWORK
                        }
                    }
                });
                $('g.VirtualMachine').popover('hide');
                break;

        }
    };

    var getCgBlankDblClick = function(connectedSelectorId, graphConfig) {

        return function() {
            var currentHashParams = layoutHandler.getURLHashParams(),
                focusedElementType = graphConfig.focusedElement.type,
                bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = {};

            switch (focusedElementType) {
                case ctwc.GRAPH_ELEMENT_PROJECT:
                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        removeFaint4AllElements();
                        removeHighlight4AllElements();

                        var projectFQN = graphConfig.focusedElement.name.fqName,
                            projectUUID = ctwu.getUUIDByName(projectFQN);

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: projectFQN,
                            uuid: projectUUID
                        });

                        ctwgrc.setProjectURLHashParams(null, projectFQN, false);
                    }

                    break;

                case ctwc.GRAPH_ELEMENT_NETWORK:
                    var networkFQN = graphConfig.focusedElement.name.fqName;

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var networkUUID = ctwu.getUUIDByName(networkFQN);

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: networkFQN,
                            uuid: networkUUID
                        });

                        highlightNetwork4ZoomedElement(connectedSelectorId, graphConfig);
                        ctwgrc.setNetworkURLHashParams(null, networkFQN, false);

                    } else {
                        var projectFQN = networkFQN.split(':').splice(0,2).join(':');
                        ctwgrc.setProjectURLHashParams(null, projectFQN, true);
                    }

                    break;

                case ctwc.GRAPH_ELEMENT_INSTANCE:
                    var networkFQN = graphConfig.focusedElement.name.fqName;

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var instanceUUID = graphConfig.focusedElement.name.instanceUUID;

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: networkFQN,
                            uuid: instanceUUID
                        });

                        highlightInstance4ZoomedElement(connectedSelectorId, graphConfig);
                        ctwgrc.setInstanceURLHashParams(null, networkFQN, instanceUUID, false);
                    } else {
                        ctwgrc.setNetworkURLHashParams(null, networkFQN, true);
                    }

                    break;
            };

            if (!$.isEmptyObject(tabConfig)) {
                cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
            }
        };
    };

    var highlightElement4ZoomedElement = function(connectedSelectorId, jointObject, graphConfig) {
        var focusedElementType = graphConfig.focusedElement.type;

        if (focusedElementType == ctwc.GRAPH_ELEMENT_NETWORK) {
            highlightNetwork4ZoomedElement(connectedSelectorId, graphConfig);
        }
        else if (focusedElementType == ctwc.GRAPH_ELEMENT_INSTANCE) {
            highlightInstance4ZoomedElement(connectedSelectorId, graphConfig);
        }
    };

    var highlightNetwork4ZoomedElement = function(connectedSelectorId, graphConfig) {
        faintAllElements();
        highlightSVGElements([$('g.ZoomedElement')]);
        highlightElements([$('div.VirtualMachine')]);
        highlightSVGElements([$('g.VirtualMachine'), $('.VirtualMachineLink')]);
    };

    var highlightInstance4ZoomedElement = function(connectedSelectorId, graphConfig) {
        faintAllElements();
        highlightSVGElements([$('g.ZoomedElement')]);

        var jointObject = $(connectedSelectorId).data('joint-object'),
            graphElements = jointObject.graph.getElements(),
            vmFqName = graphConfig.focusedElement.name.instanceUUID;

        $.each(graphElements, function (graphElementKey, graphElementValue) {
            if (graphElementValue.attributes.type == 'contrail.VirtualMachine' && graphElementValue.attributes.nodeDetails.fqName == vmFqName) {
                var modelId = graphElementValue.id;

                highlightElements([$('div.font-element[font-element-model-id="' + modelId + '"]')]);
                highlightSVGElements([$('g[model-id="' + modelId + '"]')]);
            }
        });
    };

    function getConfgPointerClickFn(connectedGraphView) {
        return function (cellView, evt, x, y) {
            var clickedElement = cellView.model.attributes,
                elementNodeType= clickedElement.elementType,
                elementMap = connectedGraphView.model.elementMap,
                jointObject = {
                    graph: connectedGraphView.model
                };

            switch (elementNodeType) {
                case ctwc.GRAPH_ELEMENT_NETWORK_POLICY:
                    onClickNetworkPolicy(cellView.model, jointObject, elementMap);
                    break;
            };
        }
    };

    function onClickNetworkPolicy(elementObj, jointObject, elementMap) {
        var cellAttributes = elementObj.attributes;

        var policyRules = (contrail.checkIfExist(cellAttributes.nodeDetails.network_policy_entries)) ? cellAttributes.nodeDetails.network_policy_entries.policy_rule : [],
            highlightedElements = { nodes: [], links: [] };

        highlightCurrentNodeElement(cellAttributes.id);

        $.each(policyRules, function (policyRuleKey, policyRuleValue) {
            var sourceNode = policyRuleValue.src_addresses[0],
                destinationNode = policyRuleValue.dst_addresses[0],
                serviceInstanceNode = policyRuleValue.action_list.apply_service,
                serviceInstanceNodeLength = 0,
                policyRuleLinkKey = [];

            highlightedElements = { nodes: [], links: [] };

            $.each(sourceNode, function (sourceNodeKey, sourceNodeValue) {
                if (contrail.checkIfExist(sourceNodeValue)) {
                    highlightedElements.nodes.push(sourceNodeValue);
                    policyRuleLinkKey.push(sourceNodeValue);

                    if (serviceInstanceNode) {
                        serviceInstanceNodeLength = serviceInstanceNode.length
                        $.each(serviceInstanceNode, function (serviceInstanceNodeKey, serviceInstanceNodeValue) {
                            highlightedElements.nodes.push(serviceInstanceNodeValue);
                            policyRuleLinkKey.push(serviceInstanceNodeValue);
                        });
                        policyRuleLinkKey.push(destinationNode[sourceNodeKey]);
                        highlightedElements.links.push(policyRuleLinkKey.join('<->'));
                        highlightedElements.links.push(policyRuleLinkKey.reverse().join('<->'));

                    } else {
                        policyRuleLinkKey.push(destinationNode[sourceNodeKey]);
                        highlightedElements.links.push(destinationNode[sourceNodeKey] + '<->' + sourceNodeValue);
                        highlightedElements.links.push(sourceNodeValue + '<->' + destinationNode[sourceNodeKey]);
                    }
                }
            });
            $.each(destinationNode, function (destinationNodeKey, destinationNodeValue) {
                if (contrail.checkIfExist(destinationNodeValue)) {
                    highlightedElements.nodes.push(destinationNodeValue);
                }
            });

            if (elementMap.link[policyRuleLinkKey.join('<->')] || elementMap.link[policyRuleLinkKey.reverse().join('<->')]) {
                highlightedElements.nodes = $.unique(highlightedElements.nodes);
                $.each(highlightedElements.nodes, function (nodeKey, nodeValue) {
                    var nodeElement = jointObject.graph.getCell(elementMap.node[nodeValue]);
                    $('g[model-id="' + nodeElement.id + '"]').removeClassSVG('fainted').addClassSVG('highlighted');
                    $('div[font-element-model-id="' + nodeElement.id + '"]').removeClass('fainted').addClass('highlighted');

                    if ($('g[model-id="' + nodeElement.id + '"]').hasClassSVG('ZoomedElement')) {
                        highlightElements([$('div.VirtualMachine')]);
                        highlightSVGElements([$('g.VirtualMachine'), $('.VirtualMachineLink')]);
                    }


                });

                if (policyRuleValue.action_list.simple_action == 'pass') {
                    highlightedElements.links = $.unique(highlightedElements.links);
                    $.each(highlightedElements.links, function (highlightedElementLinkKey, highlightedElementLinkValue) {
                        if (elementMap.link[highlightedElementLinkValue]) {
                            if (typeof elementMap.link[highlightedElementLinkValue] == 'string') {
                                highlightLinkElementByName(jointObject, elementMap.link[highlightedElementLinkValue]);
                            } else {
                                $.each(elementMap.link[highlightedElementLinkValue], function (linkKey, linkValue) {
                                    highlightLinkElementByName(jointObject, linkValue)
                                });
                            }

                        }
                    });
                }
            }
        });
    };

    var highlightCurrentNodeElement = function(elementNodeId) {
        if ($('g[model-id="' + elementNodeId + '"]').length != 0 && $('div.font-element[font-element-model-id="' + elementNodeId + '"]').length != 0) {
            faintAllElements();

            highlightElements([$('div.font-element[font-element-model-id="' + elementNodeId + '"]')]);
            highlightSVGElements([$('g[model-id="' + elementNodeId + '"]')]);
        }
    };

    var highlightCurrentLinkElement = function(elementNodeId) {
        if ($('g[model-id="' + elementNodeId + '"]').length != 0) {
            faintAllElements();
            highlightSVGElements([$('g[model-id="' + elementNodeId + '"]')]);
        }
    };

    var highlightLinkElementByName = function(jointObject, elementId) {
        var linkElement = jointObject.graph.getCell(elementId);
        if (linkElement) {
            highlightSVGElements([$('g[model-id="' + linkElement.id + '"]')]);
        }
    };

    var highlightElements = function(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClass('fainted').addClass('highlighted');
        });
    };

    var highlightSVGElements = function(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClassSVG('fainted').addClassSVG('highlighted');
        });
    };

    var faintAllElements = function() {
        $('div.font-element').removeClass('highlighted').addClass('fainted');
        $('g.element').removeClassSVG('highlighted').addClassSVG('fainted');
        $('g.link').removeClassSVG('highlighted').addClassSVG('fainted');
    };

    var removeFaint4AllElements  = function() {
        $('div.font-element').removeClass('fainted');
        $('g.element').removeClassSVG('fainted');
        $('g.link').removeClassSVG('fainted');
    };

    var removeHighlight4AllElements  = function() {
        $('div.font-element').removeClass('highlighted');
        $('g.element').removeClassSVG('highlighted');
        $('g.link').removeClassSVG('highlighted');
    };

    return NetworkingGraphView;
});