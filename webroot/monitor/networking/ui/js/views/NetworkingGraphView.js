/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-graph-model',
    'graph-view'
], function (_, Backbone, ContrailGraphModel, GraphView) {

    var VM_GRAPH_OPTIONS = {
        regularVMSize: {width: 20, height: 20, margin: 20},
        minVMSize: {width: 10, height: 10},
        externalRectRatio: {width: 16, height: 4},
        internalRectRatio: {width: 16, height: 4},
        minInternalRect: {width: 200, height: 100},
        marginRatio: {width: 1, height: 1}
    };

    var NetworkingGraphView = Backbone.View.extend({
        render: function () {
            var self = this,
                graphTemplate = contrail.getTemplate4Id(cowc.TMPL_NETWORKING_GRAPH_VIEW),
                viewConfig = this.attributes.viewConfig,
                connectedGraph = viewConfig['connectedGraph'],
                configGraph = viewConfig['configGraph'],
                selectorId = '#' + ctwl.NETWORKING_GRAPH_ID,
                connectedSelectorId = '#' + ctwl.GRAPH_CONNECTED_ELEMENTS_ID,
                configSelectorId = '#' + ctwl.GRAPH_CONFIG_ELEMENTS_ID,
                graphLoadingSelectorId = '#' + ctwl.GRAPH_LOADING_ID,
                connectedGraphView, connectedGraphModel,
                configGraphView, configGraphModel;

            self.$el.html(graphTemplate());

            setTimeout(function() {
                connectedGraphView = self.renderConnectedGraph(connectedGraph, selectorId, connectedSelectorId, configSelectorId);
                connectedGraphModel = connectedGraphView.model;
                if (contrail.checkIfExist(configGraph)) {
                    configGraphView = self.renderConfigGraph(configGraph, configSelectorId, connectedGraphView);
                    configGraphModel = configGraphView.model;

                    if ((!configGraphModel.isRequestInProgress() && !connectedGraphModel.isRequestInProgress())
                            || (configGraphModel.loadedFromCache && connectedGraphModel.loadedFromCache)) {
                        $(graphLoadingSelectorId).hide();
                    } else {
                        if (configGraphModel.isRequestInProgress()) {
                            configGraphModel.onAllRequestsComplete.subscribe(function () {
                                if (!connectedGraphModel.isRequestInProgress()) {
                                    $(graphLoadingSelectorId).hide();
                                }
                            });
                        }
                        if (connectedGraphModel.isRequestInProgress()) {
                            connectedGraphModel.onAllRequestsComplete.subscribe(function () {
                                if (!configGraphModel.isRequestInProgress()) {
                                    $(graphLoadingSelectorId).hide();
                                }
                            });
                        }
                    }
                } else {
                    if (!connectedGraphModel.isRequestInProgress() || connectedGraphModel.loadedFromCache) {
                        $(graphLoadingSelectorId).hide();
                    } else {
                        connectedGraphModel.onAllRequestsComplete.subscribe(function () {
                            $(graphLoadingSelectorId).hide();
                        });
                    }
                }
            }, 10);
        },

        renderConnectedGraph: function (graphConfig, selectorId, connectedSelectorId, configSelectorId) {
            var connectedGraphView = new GraphView(getConnectedGraphViewConfig(graphConfig, selectorId, connectedSelectorId, configSelectorId));
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
                tooltipConfig: nmwgrc.getConfigGraphTooltipConfig(),
                clickEvents: {
                    'cell:pointerclick': getConfgPointerClickFn(connectedGraphView)
                },
                successCallback: function (jointObject) {
                    $(configSelectorId).panzoom();
                }
            };

            var configGraphView = new GraphView(confGraphViewConfig);
            configGraphView.render();
            return configGraphView;
        }
    });

    function getConnectedGraphModelConfig(graphConfig, selectorId) {
        return $.extend(true, {}, graphConfig, {
            forceFit: true,
            generateElementsFn: getElements4ConnectedGraphFn(graphConfig, selectorId),
            remote: {
                successCallback: function (response, contrailGraphModel) {
                    if (!contrail.checkIfExist(contrailGraphModel.elementsDataObj)
                        || (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT
                        && contrailGraphModel.elementsDataObj.elements.length == 0)
                        || (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_NETWORK
                        && contrailGraphModel.elementsDataObj.zoomedElements.length == 0)) {
                        contrailGraphModel.empty = true;
                        return false;
                    }
                }
            }
        });
    }

    function getConnectedGraphViewConfig(graphConfig, selectorId, connectedSelectorId, configSelectorId) {
        return {
            el: $(connectedSelectorId),
            linkView: joint.shapes.contrail.LinkView,
            graphModelConfig: getConnectedGraphModelConfig(graphConfig, selectorId),
            tooltipConfig: nmwgrc.getConnectedGraphTooltipConfig(),
            clickEvents: {
                'cell:pointerclick': getCgPointerClick(connectedSelectorId),
                'cell:pointerdblclick': cgPointerDblClick,
                'blank:pointerdblclick': getCgBlankDblClick(connectedSelectorId, graphConfig)
            },
            controlPanel: getControlPanelConfig(graphConfig, selectorId, connectedSelectorId, configSelectorId),
            emptyCallback: function (contrailGraphModel) {
                var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {
                        iconClass: false,
                        defaultErrorMessage: false,
                        defaultNavLinks: false
                    });

                if(!contrail.checkIfExist(contrailGraphModel.elementsDataObj)) {
                    notFoundConfig.title = ctwm.NO_DATA_FOUND;
                } else if (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT && contrailGraphModel.elementsDataObj.elements.length == 0) {
                    notFoundConfig.title = ctwm.NO_NETWORK_FOUND;
                } else if (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_NETWORK && contrailGraphModel.elementsDataObj.zoomedElements.length == 0) {
                    notFoundConfig.title =  ctwm.NO_VM_FOUND;
                }
                $(selectorId).html(notFoundTemplate(notFoundConfig));
            },
            failureCallback: function (contrailGraphModel) {
                var xhr = contrailGraphModel.errorList[0],
                    notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText});

                if(!(xhr.status === 0 && xhr.statusText === 'abort')) {
                    $(selectorId).html(notFoundTemplate(notFoundConfig));
                }
            },
            successCallback: function (jointObject) {
                var directedGraphSize = jointObject.graph.directedGraphSize,
                    currentHashParams = layoutHandler.getURLHashParams(),
                    focusedElement = graphConfig.focusedElement;

                $(connectedSelectorId).data('graph-size', directedGraphSize);
                $(connectedSelectorId).data('joint-object', jointObject);

                adjustConnectedGraphDimension(selectorId, connectedSelectorId, configSelectorId, true);
                panConnectedGraph2Center(focusedElement, connectedSelectorId);

                highlightElement4ZoomedElement(connectedSelectorId, graphConfig);

                if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                    highlightConnectedClickedElement(currentHashParams.clickedElement, connectedGraphView)
                } else if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT){
                    removeFaint4AllElements();
                    removeHighlight4AllElements();
                }

                if (!$(selectorId).find('.refresh i').hasClass('icon-repeat')) {
                    setTimeout(function(){
                        $(selectorId).find('.refresh i').removeClass('icon-spin icon-spinner').addClass('icon-repeat');
                    }, 200);
                }
            }
        }
    }

    function getControlPanelConfig(graphConfig, selectorId, connectedSelectorId, configSelectorId) {
        return {
            default: {
                zoom: {
                    enabled: true,
                    selectorId: connectedSelectorId,
                    config: {
                        onReset: function() {
                            var focusedElement = graphConfig.focusedElement;
                            panConnectedGraph2Center(focusedElement, connectedSelectorId)
                            $(configSelectorId).panzoom('resetPan');
                        }
                    }
                }
            },
            custom: {
                resize: {
                    iconClass: 'icon-resize-full',
                    title: 'Resize',
                    events: {
                        click: function (e, self, controlPanelSelector) {
                            $(self).find('i').addClass('icon-spin icon-spinner');
                            setTimeout(function() {
                                $(self).find('i').removeClass('icon-spin icon-spinner');
                                $(self).find('i').toggleClass('icon-resize-full').toggleClass('icon-resize-small');
                                adjustConnectedGraphDimension(selectorId, connectedSelectorId, configSelectorId, false);
                                $(connectedSelectorId).panzoom('reset');
                                $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                                $(self).removeClass('refreshing');
                            }, 200);
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
                        click: function (e, self, controlPanelSelector) {
                            var jointObject = $(connectedSelectorId).data('joint-object'),
                                connectedGraphModel = jointObject.graph;

                            setLoadingScreen(connectedGraphModel);
                            if ($(self).find('i').hasClass('icon-align-left')) {
                                $(self).find('i').removeClass('icon-align-left').toggleClass('icon-spin icon-spinner');
                                setTimeout(function(){
                                    connectedGraphModel.reLayoutGraph(ctwc.GRAPH_DIR_LR);
                                    //Hack to set width for Webkit browser
                                    var width = $(connectedSelectorId + ' svg').attr('width');
                                    $(connectedSelectorId + ' svg').attr('width', width);
                                }, 200)
                            } else if ($(self).find('i').hasClass('icon-align-center')) {
                                $(self).find('i').removeClass('icon-align-center').toggleClass('icon-spin icon-spinner');
                                setTimeout(function() {
                                    connectedGraphModel.reLayoutGraph(ctwc.GRAPH_DIR_TB);
                                    var width = $(connectedSelectorId + ' svg').attr('width');
                                    $(connectedSelectorId + ' svg').attr('width', width);
                                }, 200);
                            }
                        }
                    }
                },
                refresh: {
                    iconClass: 'icon-repeat',
                    title: 'Refresh',
                    events: {
                        click: function (e, self, controlPanelSelector) {
                            var jointObject = $(connectedSelectorId).data('joint-object'),
                                connectedGraphView = jointObject.paper,
                                connectedGraphModel = jointObject.graph;

                            setLoadingScreen(connectedGraphModel);
                            if ($(self).find('i').hasClass('icon-repeat')) {
                                $(self).find('i').removeClass('icon-repeat').toggleClass('icon-spin icon-spinner');
                                connectedGraphView.refreshData();
                            }
                        }
                    }
                }
            }
        };
    };

    function setLoadingScreen(connectedGraphModel) {
        var graphLoadingSelectorId = '#' + ctwl.GRAPH_LOADING_ID;
        $(graphLoadingSelectorId).show();

        connectedGraphModel.onAllRequestsComplete.subscribe(function () {
            $(graphLoadingSelectorId).hide();
        });
    }

    function getElements4ConnectedGraphFn(graphconfig, selectorId) {
        var focusedElementType = graphconfig.focusedElement.type,
            fqName = graphconfig.focusedElement.name.fqName;

        return function (response, elementMap, rankDir) {
            var elements4ConnectedGraph = [],
                zoomedElements = [],
                nodes = response['nodes'],
                zoomedNodeElement = null,
                links = response['links'],
                zoomedNode = null;

            if (focusedElementType == ctwc.GRAPH_ELEMENT_PROJECT || focusedElementType == ctwc.GRAPH_ELEMENT_INSTANCE) {
                createNodeElements(nodes, elements4ConnectedGraph, elementMap);
                createLinkElements(links, elements4ConnectedGraph, elementMap);

                var linkedElements = elementMap['linkedElements'],
                    nodeSeparation = 90, groupedElements = [],
                    groupedElementsCount, maxRowCount,
                    groupedParentWidth, groupedParentHeight;

                if(linkedElements.length > 0) {
                    return {
                        elements: elements4ConnectedGraph,
                        nodes: nodes,
                        links: links,
                        zoomedNodeElement: zoomedNodeElement,
                        zoomedElements: zoomedElements
                    };
                } else {
                    groupedElements = elements4ConnectedGraph;
                    groupedElementsCount = groupedElements.length;
                    maxRowCount = Math.ceil(Math.sqrt(groupedElementsCount));
                    groupedParentWidth = maxRowCount * nodeSeparation;
                    groupedParentHeight = maxRowCount * nodeSeparation;

                    for(var i = 0; i < groupedElements.length; i++) {
                        var groupedElement = groupedElements[i],
                            position = getGroupedElementPosition(i, maxRowCount, nodeSeparation);

                        groupedElement.attributes.position.x = position.x;
                        groupedElement.attributes.position.y = position.y;
                    }

                    if(groupedElements.length > 0) {
                        var groupParentElement = new joint.shapes.contrail.GroupParentElement({
                            size: {width: groupedParentWidth, height: groupedParentHeight},
                            attrs: {
                                rect: {width: groupedParentWidth, height: groupedParentHeight}
                            }
                        });

                        linkedElements.push(groupParentElement);
                    }

                    return {
                        elements: linkedElements,
                        nodes: nodes,
                        links: links,
                        zoomedNodeElement: groupParentElement,
                        zoomedElements: groupedElements
                    };
                }

            } else if (focusedElementType == ctwc.GRAPH_ELEMENT_NETWORK) {
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

                        elements4ConnectedGraph.push(zoomedNodeElement);
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
                createNodeElements(nodes, elements4ConnectedGraph, elementMap);
                createLinkElements(links, elements4ConnectedGraph, elementMap);

                return {
                    elements: elements4ConnectedGraph,
                    nodes: nodes,
                    links: links,
                    zoomedNodeElement: zoomedNodeElement,
                    zoomedElements: zoomedElements
                };
            }
        };
    };

    function getGroupedElementPosition(index, maxRowCount, nodeSeparation) {
        index = index + 1;

        var row = Math.floor(index / maxRowCount),
            column = index % maxRowCount;

        return {
            x: nodeSeparation * (column == 0 ? (maxRowCount - 1) : (column - 1)),
            y: nodeSeparation * (column == 0 ? (row - 1) : row)
        }
    };

    function getElements4ConfigGraph(response, elementMap) {
        var elements4ConfigGraph = [],
            collections = {},
            configData = response['configData'],
            configSVGHeight = 0;

        createNodes4ConfigData(configData, collections);

        configSVGHeight = createCollectionElements(collections, elements4ConfigGraph, elementMap);

        return {
            elements: elements4ConfigGraph,
            configSVGHeight: configSVGHeight
        };
    };

    function adjustConnectedGraphDimension(selectorId, connectedSelectorId, configSelectorId, initResizeFlag) {
        var resizeFlag = ($(selectorId).parents('.visualization-container').find('.icon-resize-small').is(':visible')),
            tabHeight = resizeFlag ? 155 : 510, //TODO - move to constants
            minHeight = 275,
            availableHeight = window.innerHeight - tabHeight,
            directedGraphSize = $(connectedSelectorId).data('graph-size'),
            jointObject = $(connectedSelectorId).data('joint-object');

        if(!contrail.checkIfExist(jointObject)) {
            return;
        }

        var connectedGraphView = jointObject.paper,
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

        if (initResizeFlag && ((connectedGraphHeight - cowc.GRAPH_MARGIN_BOTTOM - cowc.GRAPH_MARGIN_TOP - adjustedHeight) > 20)) {
            $(selectorId).parents('.visualization-container').find('.icon-resize-full')
                .removeClass('icon-resize-full').addClass('icon-resize-small');

            adjustedHeight = window.innerHeight - 155;
        }

        connectedGraphView.setDimensions(connectedGraphWidth, connectedGraphHeight, 1);

        $(connectedSelectorId).width(connectedGraphWidth);

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

    function panConnectedGraph2Center(focusedElement, connectedSelectorId) {
        var directedGraphSize = $(connectedSelectorId).data('graph-size'),
            connectedGraphWidth = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'width') ? directedGraphSize.width : 0,
            connectedGraphHeight = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'height') ? directedGraphSize.height : 0,
            availableGraphWidth = $(connectedSelectorId).parents('.col1').width(),
            availableGraphHeight = $(connectedSelectorId).parents('.col1').height(),
            panX = (availableGraphWidth - connectedGraphWidth) / 2,
            panY = (availableGraphHeight - connectedGraphHeight) / 2;

        if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT) {
            if ((connectedGraphHeight - cowc.GRAPH_MARGIN_BOTTOM - cowc.GRAPH_MARGIN_TOP) > availableGraphHeight) {
                panY = 35 - cowc.GRAPH_MARGIN_TOP;
            }
            if ((connectedGraphWidth - cowc.GRAPH_MARGIN_LEFT - cowc.GRAPH_MARGIN_RIGHT) > availableGraphWidth) {
                panX = 35 - cowc.GRAPH_MARGIN_LEFT;
            }
        }

        $(connectedSelectorId).panzoom("resetPan");
        $(connectedSelectorId).panzoom("pan", panX, panY, { relative: true });
        $(connectedSelectorId).css({'backface-visibility':'initial'});

        //Safari related hack to orient the graph correctly
        $(connectedSelectorId).redraw();
    };

    function createVirtualMachineNode(position, size, vmName, srcVNDetails, uve) {
        var nodeType = ctwc.GRAPH_ELEMENT_INSTANCE,
            element, options;

        options = {
            position: position,
            size: size,
            font: {
                iconClass: 'icon-contrail-virtual-machine-top'
            },
            nodeDetails: {
                fqName: vmName,
                srcVNDetails: srcVNDetails,
                uve: uve
            },
            elementType: nodeType
        };
        element = new ContrailElement(nodeType, options);
        return element;
    };

    function createVirtualMachineLink(position, size){
        var rect = new joint.shapes.basic.Rect({
            type: 'VirtualMachineLink no-drag-element',
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
            vmNode, vmList = options['vmList'],
            vmDetailsMap = options['vmDetailsMap'],
            vmUVE = null ;

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
            vmUVE = contrail.checkIfExist(vmDetailsMap) ? vmDetailsMap[vmList[i]] : null;
            vmNode = createVirtualMachineNode(position, size, vmList[i], options['srcVNDetails'], vmUVE);
            elementMap.node[vmList[i]] = vmNode.id;
            xFactor++;
            zoomedElements.push(vmNode);
            zoomedNodeElement.embed(vmNode);
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
            vmNode, vmList = options['vmList'],
            vmDetailsMap = options['vmDetailsMap'],
            vmUVE;

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2,
            position = {},
            size = {width: vmWidth, height: vmHeight},
            virtualMachineCommonLinkPosition = {}, virtualMachineCommonLinkSize = {}, virtualMachineCommonLinkNode,
            virtualMachineLinkPosition = {}, virtualMachineLinkSize = {}, virtualMachineLinkNode;

        var xFactor = 0, yFactor = 0, linkThickness = 2, rectThickness = 2, horizontalAdjustFactor = 6;
        if(vmLength !== 0){
            virtualMachineCommonLinkPosition = {x: xOrigin - vmWidth/2, y: yOrigin + ySeparation - horizontalAdjustFactor};
            virtualMachineCommonLinkSize = {width: vmLength * xSeparation + vmWidth/2, height: rectThickness};
            virtualMachineCommonLinkNode = createVirtualMachineLink(virtualMachineCommonLinkPosition, virtualMachineCommonLinkSize);
            zoomedElements.push(virtualMachineCommonLinkNode);
            zoomedNodeElement.embed(virtualMachineCommonLinkNode);
        }

        for (var i = 0; i < vmLength; i++) {
            position = {x: xOrigin + (xSeparation * xFactor), y: yOrigin + ((ySeparation) * yFactor)};
            vmUVE = contrail.checkIfExist(vmDetailsMap) ? vmDetailsMap[vmList[i]] : null;
            vmNode = createVirtualMachineNode(position, size, vmList[i], options['srcVNDetails'], vmUVE);
            elementMap.node[vmList[i]] = vmNode.id;
            zoomedElements.push(vmNode);
            zoomedNodeElement.embed(vmNode);

            virtualMachineLinkPosition = {x: xOrigin + (xSeparation * xFactor)+ vmWidth/2 +1, y: yOrigin + ((ySeparation) * yFactor) + vmHeight};
            virtualMachineLinkSize = {width: linkThickness, height: (ySeparation/2) - 6};
            virtualMachineLinkNode = createVirtualMachineLink(virtualMachineLinkPosition, virtualMachineLinkSize);
            zoomedElements.push(virtualMachineLinkNode);
            zoomedNodeElement.embed(virtualMachineLinkNode);

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
            vmNode, vmList = options['vmList'],
            vmDetailsMap = options['vmDetailsMap'],
            vmUVE;

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2,
            position = {},
            size = {width: vmWidth, height: vmHeight},
            virtualMachineCommonLinkPosition = {}, virtualMachineCommonLinkSize = {}, virtualMachineCommonLinkNode,
            virtualMachineLinkPosition = {}, virtualMachineLinkSize = {}, virtualMachineLinkNode;

        var centerLineHeight = 0.1,
            xFactor = 0, yFactor = -1,
            linkThickness = 2, rectThickness = 2;

        if(vmLength !== 0){
            virtualMachineCommonLinkPosition = {x: xOrigin + vmWidth + xSeparation/2, y: yOrigin - vmMargin/2};
            virtualMachineCommonLinkSize = {width: rectThickness, height: vmLength * ySeparation};
            virtualMachineCommonLinkNode = createVirtualMachineLink(virtualMachineCommonLinkPosition, virtualMachineCommonLinkSize)
            zoomedElements.push(virtualMachineCommonLinkNode);
            zoomedNodeElement.embed(virtualMachineCommonLinkNode);
        }

        for (var i = 0; i < vmLength; i++) {
            if (i % vmPerRow == 0) {
                xFactor = 0;
                yFactor++;
            }
            position = {x: xOrigin + (xSeparation * xFactor), y: yOrigin + ((ySeparation) * yFactor)};
            vmUVE = contrail.checkIfExist(vmDetailsMap) ? vmDetailsMap[vmList[i]] : null;
            vmNode = createVirtualMachineNode(position, size, vmList[i], options['srcVNDetails'], vmUVE);
            elementMap.node[vmList[i]] = vmNode.id;
            zoomedElements.push(vmNode);
            zoomedNodeElement.embed(vmNode);

            virtualMachineLinkPosition = {x: xOrigin + vmWidth + 2, y: yOrigin + ((ySeparation) * yFactor) + vmHeight/2};
            virtualMachineLinkSize = {width: xSeparation/2 - 2, height: linkThickness};
            virtualMachineLinkNode = createVirtualMachineLink(virtualMachineLinkPosition, virtualMachineLinkSize)
            zoomedElements.push(virtualMachineLinkNode);
            zoomedNodeElement.embed(virtualMachineLinkNode);
        }

        return zoomedElements;
    };

    function getCgPointerClick(connectedSelectorId) {
        return function(cellView, evt, x, y) {
            var clickedElement = cellView.model.attributes,
                elementNodeType = clickedElement.elementType,
                elementNodeId = cellView.model.id,
                bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = {};

            setTimeout(function () {
                $('.popover').remove();
            }, cowc.TOOLTIP_DELAY);

            switch (elementNodeType) {
                case ctwc.GRAPH_ELEMENT_NETWORK:
                    var networkFQN = clickedElement.nodeDetails.name,
                        networkUUID = nmwu.getUUIDByName(networkFQN);

                    if (!ctwu.isServiceVN(networkFQN)) {
                        clickedElement = {
                            fqName: networkFQN,
                            uuid: networkUUID,
                            type: elementNodeType
                        };

                        layoutHandler.setURLHashParams({clickedElement: clickedElement}, {
                            merge: true,
                            triggerHashChange: false
                        });

                        highlightCurrentNodeElement(elementNodeId);
                        tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                        cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
                    }

                    break;

                case ctwc.GRAPH_ELEMENT_INSTANCE:
                    var networkFQN = clickedElement.nodeDetails.srcVNDetails.name,
                        instanceUUID = clickedElement.nodeDetails.fqName;

                    clickedElement = {
                        fqName: networkFQN,
                        uuid: instanceUUID,
                        type: elementNodeType
                    };

                    layoutHandler.setURLHashParams({clickedElement: clickedElement}, {
                        merge: true,
                        triggerHashChange: false
                    });

                    highlightCurrentNodeElement(elementNodeId);
                    tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                    cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);

                    break;

                case ctwc.GRAPH_ELEMENT_CONNECTED_NETWORK:
                    var jointObject = $(connectedSelectorId).data('joint-object'),
                        connectedGraphModel = jointObject.graph,
                        sourceNode = connectedGraphModel.getCell(clickedElement.source),
                        targetNode = connectedGraphModel.getCell(clickedElement.target),
                        sourceType = sourceNode.attributes.elementType,
                        targetType = targetNode.attributes.elementType,
                        sourceElement = clickedElement.linkDetails.dst,
                        targetElement = clickedElement.linkDetails.src;

                    if (!(sourceType === ctwc.TYPE_VIRTUAL_NETWORK && targetType === ctwc.TYPE_VIRTUAL_MACHINE)) {
                        clickedElement = {
                            sourceElement: sourceElement,
                            targetElement: targetElement,
                            linkDetails: clickedElement.linkDetails
                        };

                        highlightCurrentLinkElement(elementNodeId);
                        tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                        cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
                    }

                    break;
            };
        };
    };

    function highlightConnectedClickedElement(clickedElement, connectedGraphView) {
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

    function cgPointerDblClick(cellView, evt, x, y) {
        var dblClickedElement = cellView.model.attributes,
            elementNodeType= dblClickedElement.elementType,
            elementNodeId = cellView.model.id;

        setTimeout(function() {
            $('.popover').remove();
        }, cowc.TOOLTIP_DELAY);

        switch (elementNodeType) {
            case ctwc.GRAPH_ELEMENT_NETWORK:
                var networkFQN = dblClickedElement.nodeDetails['name'];

                if (!ctwu.isServiceVN(networkFQN)) {
                    loadFeature({
                        p: 'mon_networking_networks',
                        q: {
                            focusedElement: {
                                fqName: networkFQN,
                                type: elementNodeType
                            },
                            view: 'details',
                            type: 'network'
                        }
                    });
                    $('g.VirtualNetwork').popover('hide');
                }
                break;

            case ctwc.GRAPH_ELEMENT_INSTANCE:
                var srcVN = dblClickedElement.nodeDetails.srcVNDetails.name,
                    vmUVE = dblClickedElement.nodeDetails.uve,
                    vmName = contrail.checkIfExist(vmUVE) ? vmUVE['UveVirtualMachineAgent']['vm_name'] : null;

                loadFeature({
                    p: 'mon_networking_instances',
                    q: {
                        type: 'instance',
                        view: 'details',
                        focusedElement: {
                            fqName: srcVN,
                            uuid: dblClickedElement.nodeDetails['fqName'],
                            vmName: vmName,
                            type: ctwc.GRAPH_ELEMENT_INSTANCE
                        }
                    }
                });
                $('g.VirtualMachine').popover('hide');
                break;

        }
    };

    function getCgBlankDblClick(connectedSelectorId, graphConfig) {

        return function() {
            var currentHashParams = layoutHandler.getURLHashParams(),
                focusedElementType = graphConfig.focusedElement.type,
                bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = {};

            switch (focusedElementType) {
                case ctwc.GRAPH_ELEMENT_PROJECT:
                    removeFaint4AllElements();
                    removeHighlight4AllElements();

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var projectFQN = graphConfig.focusedElement.name.fqName,
                            projectUUID = nmwu.getUUIDByName(projectFQN);

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: projectFQN,
                            uuid: projectUUID
                        });

                        nmwgrc.setProjectURLHashParams(null, projectFQN, false);
                    }

                    break;

                case ctwc.GRAPH_ELEMENT_NETWORK:
                    var networkFQN = graphConfig.focusedElement.name.fqName;

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var networkUUID = nmwu.getUUIDByName(networkFQN);

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: networkFQN,
                            uuid: networkUUID
                        });

                        highlightNetwork4ZoomedElement(connectedSelectorId, graphConfig);
                        nmwgrc.setNetworkURLHashParams(null, networkFQN, false);

                    } else {
                        var projectFQN = networkFQN.split(':').splice(0,2).join(':');
                        nmwgrc.setProjectURLHashParams(null, projectFQN, true);
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

                        nmwgrc.setInstanceURLHashParams(null, networkFQN, instanceUUID, false);
                    } else {
                        nmwgrc.setNetworkURLHashParams(null, networkFQN, true);
                    }

                    break;
            };

            if (!$.isEmptyObject(tabConfig)) {
                cowu.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
            }
        };
    };

    function highlightElement4ZoomedElement(connectedSelectorId, graphConfig) {
        var focusedElementType = graphConfig.focusedElement.type;

        if (focusedElementType == ctwc.GRAPH_ELEMENT_NETWORK) {
            highlightNetwork4ZoomedElement(connectedSelectorId, graphConfig);
        }
    };

    function highlightNetwork4ZoomedElement(connectedSelectorId, graphConfig) {
        faintElements([$(connectedSelectorId).find('div.font-element')]);
        faintSVGElements([$(connectedSelectorId).find('g.element'), $(connectedSelectorId).find('g.link')]);
        highlightElements([$('div.VirtualMachine')]);
        highlightSVGElements([$('g.ZoomedElement'), $('g.VirtualMachine'), $('.VirtualMachineLink')]);
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

    function highlightCurrentNodeElement(elementNodeId) {
        if ($('g[model-id="' + elementNodeId + '"]').length != 0 && $('div.font-element[font-element-model-id="' + elementNodeId + '"]').length != 0) {
            faintAllElements();

            highlightElements([$('div.font-element[font-element-model-id="' + elementNodeId + '"]')]);
            highlightSVGElements([$('g[model-id="' + elementNodeId + '"]')]);
        }
    };

    function highlightCurrentLinkElement(elementNodeId) {
        if ($('g[model-id="' + elementNodeId + '"]').length != 0) {
            faintAllElements();
            highlightSVGElements([$('g[model-id="' + elementNodeId + '"]')]);
        }
    };

    function highlightLinkElementByName(jointObject, elementId) {
        var linkElement = jointObject.graph.getCell(elementId);
        if (linkElement) {
            highlightSVGElements([$('g[model-id="' + linkElement.id + '"]')]);
        }
    };

    function highlightElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClass('fainted').addClass('highlighted');
        });
    };

    function highlightSVGElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClassSVG('fainted').addClassSVG('highlighted');
        });
    };

    function faintElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClass('highlighted').addClass('fainted');
        });
    };

    function faintSVGElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClassSVG('highlighted').addClassSVG('fainted');
        });
    };

    function faintAllElements() {
        $('div.font-element').removeClass('highlighted').addClass('fainted');
        $('g.element').removeClassSVG('highlighted').addClassSVG('fainted');
        $('g.link').removeClassSVG('highlighted').addClassSVG('fainted');
    };

    function removeFaint4AllElements() {
        $('div.font-element').removeClass('fainted');
        $('g.element').removeClassSVG('fainted');
        $('g.link').removeClassSVG('fainted');
    };

    function removeHighlight4AllElements() {
        $('div.font-element').removeClass('highlighted');
        $('g.element').removeClassSVG('highlighted');
        $('g.link').removeClassSVG('highlighted');
    };

    function getHorizontalZoomedVMSize(availableHeight, availableWidth, srcVNDetails) {
        var maxExternalRectWidth = .7 * availableWidth,
            maxExternalRectHeight = maxExternalRectWidth * (VM_GRAPH_OPTIONS.externalRectRatio['height'] / VM_GRAPH_OPTIONS.externalRectRatio['width']);

        var vmMargin = VM_GRAPH_OPTIONS.regularVMSize['margin'],
            maxInternalRectWidth = Math.floor(((VM_GRAPH_OPTIONS.internalRectRatio['width'] / VM_GRAPH_OPTIONS.externalRectRatio['width']) * maxExternalRectWidth)) - vmMargin,
            maxInternalRectHeight = Math.floor(((VM_GRAPH_OPTIONS.internalRectRatio['height'] / VM_GRAPH_OPTIONS.externalRectRatio['height']) * maxExternalRectHeight)) - vmMargin,
            maxInternalRectArea = maxInternalRectHeight * maxInternalRectWidth;

        var noOfVMs = srcVNDetails.more_attributes.vm_count,
            VMHeight = VM_GRAPH_OPTIONS.regularVMSize['height'],
            VMWidth = VM_GRAPH_OPTIONS.regularVMSize['width'],
            widthNeededForVM = VM_GRAPH_OPTIONS.regularVMSize.width + vmMargin,
            heightNeededForVM = VM_GRAPH_OPTIONS.regularVMSize.height + vmMargin,
            areaPerVM = widthNeededForVM * heightNeededForVM,
            actualAreaNeededForVMs = areaPerVM * noOfVMs,
            vmPerRow = noOfVMs, noOfRows;

        var returnObj = {
                'VMHeight': VMHeight,
                'VMWidth': VMWidth,
                'VMMargin': vmMargin
            },
            internalRectangleWidth, internalRectangleHeight, noOfVMsToDraw;

        noOfVMsToDraw = noOfVMs;
        noOfRows = 1;
        internalRectangleWidth = (((vmPerRow < ctwc.MAX_VM_TO_PLOT) ? vmPerRow :  ctwc.MAX_VM_TO_PLOT) * widthNeededForVM) + vmMargin;
        internalRectangleHeight = (noOfRows * heightNeededForVM) + vmMargin;

        returnObj['vmPerRow'] = vmPerRow;
        returnObj['noOfVMsToDraw'] = (noOfVMsToDraw > ctwc.MAX_VM_TO_PLOT) ? ctwc.MAX_VM_TO_PLOT : noOfVMsToDraw;
        returnObj['widthZoomedElement'] = internalRectangleWidth * (VM_GRAPH_OPTIONS.externalRectRatio['width'] / VM_GRAPH_OPTIONS.internalRectRatio['width']);
        returnObj['heightZoomedElement'] = internalRectangleHeight * (VM_GRAPH_OPTIONS.externalRectRatio['height'] / VM_GRAPH_OPTIONS.internalRectRatio['height']);
        returnObj['vmList'] = srcVNDetails.more_attributes.virtualmachine_list;
        returnObj['vmDetailsMap'] = srcVNDetails.more_attributes.virtualmachine_details;
        returnObj['srcVNDetails'] = srcVNDetails;

        return returnObj;

    }

    function getVerticalZoomedVMSize(availableHeight, availableWidth, srcVNDetails) {
        var maxExternalRectWidth = .7 * availableWidth,
            maxExternalRectHeight = maxExternalRectWidth * (VM_GRAPH_OPTIONS.externalRectRatio['height'] / VM_GRAPH_OPTIONS.externalRectRatio['width']);

        var vmMargin = VM_GRAPH_OPTIONS.regularVMSize['margin'],
            maxInternalRectWidth = Math.floor(((VM_GRAPH_OPTIONS.internalRectRatio['width'] / VM_GRAPH_OPTIONS.externalRectRatio['width']) * maxExternalRectWidth)) - vmMargin,
            maxInternalRectHeight = Math.floor(((VM_GRAPH_OPTIONS.internalRectRatio['height'] / VM_GRAPH_OPTIONS.externalRectRatio['height']) * maxExternalRectHeight)) - vmMargin,
            maxInternalRectArea = maxInternalRectHeight * maxInternalRectWidth;

        var noOfVMs = srcVNDetails.more_attributes.vm_count,
            VMHeight = VM_GRAPH_OPTIONS.regularVMSize['height'],
            VMWidth = VM_GRAPH_OPTIONS.regularVMSize['width'],
            widthNeededForVM = VM_GRAPH_OPTIONS.regularVMSize.width + vmMargin,
            heightNeededForVM = VM_GRAPH_OPTIONS.regularVMSize.height + vmMargin,
            areaPerVM = widthNeededForVM * heightNeededForVM,
            actualAreaNeededForVMs = areaPerVM * noOfVMs,
            vmPerRow = 1, noOfRows;

        var returnObj = {
                'VMHeight': VMHeight,
                'VMWidth': VMWidth,
                'VMMargin': vmMargin
            },
            internalRectangleWidth, internalRectangleHeight, noOfVMsToDraw;

        noOfVMsToDraw = noOfVMs;
        noOfRows = Math.ceil(noOfVMsToDraw / vmPerRow);
        internalRectangleWidth = (vmPerRow * widthNeededForVM) + vmMargin;
        internalRectangleHeight = (((noOfRows < ctwc.MAX_VM_TO_PLOT) ? noOfRows :  ctwc.MAX_VM_TO_PLOT) * heightNeededForVM) + vmMargin;

        returnObj['vmPerRow'] = vmPerRow;
        returnObj['noOfVMsToDraw'] = (noOfVMsToDraw > ctwc.MAX_VM_TO_PLOT) ? ctwc.MAX_VM_TO_PLOT : noOfVMsToDraw;
        returnObj['widthZoomedElement'] = internalRectangleWidth * (VM_GRAPH_OPTIONS.externalRectRatio['width'] / VM_GRAPH_OPTIONS.internalRectRatio['width']);
        returnObj['heightZoomedElement'] = internalRectangleHeight * (VM_GRAPH_OPTIONS.externalRectRatio['height'] / VM_GRAPH_OPTIONS.internalRectRatio['height']);
        returnObj['vmList'] = srcVNDetails.more_attributes.virtualmachine_list;
        returnObj['vmDetailsMap'] = srcVNDetails.more_attributes.virtualmachine_details;
        returnObj['srcVNDetails'] = srcVNDetails;

        return returnObj;
    }

    function createNodes4ConfigData(configData, collections) {
        var networkPolicys = configData['network-policys'],
            securityGroups = configData['security-groups'],
            networkIPAMS = configData['network-ipams'],
            name, i;

        if (networkPolicys != null && networkPolicys.length > 0) {
            var font = {
                iconClass: 'icon-contrail-network-policy'
            };
            collections.networkPolicys = {name: 'Network Policies', node_type: 'collection-element', nodes: []};
            for (i = 0; networkPolicys != null && i < networkPolicys.length; i++) {
                name = networkPolicys[i]['fq_name'].join(':');
                collections.networkPolicys.nodes.push({
                    name: name,
                    node_type: 'network-policy',
                    elementType: 'network-policy',
                    nodeDetails: networkPolicys[i],
                    font: font
                });
            }
        }

        if (securityGroups != null && securityGroups.length > 0) {
            var font = {
                iconClass: 'icon-contrail-security-group'
            };
            collections.securityGroups = {name: 'Security Groups', node_type: 'collection-element', nodes: []};
            for (i = 0; securityGroups != null && i < securityGroups.length; i++) {
                name = securityGroups[i]['fq_name'].join(':');
                collections.securityGroups.nodes.push({
                    name: name,
                    node_type: 'security-group',
                    elementType: 'security-group',
                    nodeDetails: securityGroups[i],
                    font: font
                });
            }
        }

        if (networkIPAMS != null && networkIPAMS.length > 0) {
            var font = {
                iconClass: 'icon-contrail-network-ipam'
            };
            collections.networkIPAMS = {name: 'Network IPAMS', node_type: 'collection-element', nodes: []};
            for (i = 0; networkIPAMS != null && i < networkIPAMS.length; i++) {
                name = networkIPAMS[i]['fq_name'].join(':');
                collections.networkIPAMS.nodes.push({
                    name: name,
                    node_type: 'network-ipam',
                    elementType: 'network-ipam',
                    nodeDetails: networkIPAMS[i],
                    font: font
                });
            }
        }
    }

    function createNodeElements(nodes, elements, elementMap, config) {
        var newElement, nodeName;
        for (var i = 0; i < nodes.length; i++) {
            newElement = createNodeElement(nodes[i], config);
            nodeName = nodes[i]['name'];
            elements.push(newElement);
            elementMap.node[nodeName] = newElement.id;
        }
    }

    function createNodeElement(node, config) {
        var nodeFQN = node['name'],
            nodeType = node['node_type'],
            width = (config != null && config.width != null) ? config.width : 35,
            height = (config != null && config.height != null) ? config.height : 35,
            imageLink, element, options, imageName,
            nodeNameList, nodeName;

        imageName = getImageName(node);
        imageLink = '/img/icons/' + imageName;
        nodeNameList = nodeFQN.split(":");
        nodeName = (nodeNameList.length > 2) ? nodeNameList[2] : nodeFQN;
        options = {
            attrs: {
                text: {
                    text: contrail.truncateText(nodeName, 10)
                }
            },
            size: {
                width: width,
                height: height
            },
            nodeDetails: node,
            font: {
                iconClass: 'icon-contrail-' + nodeType
            },
            elementType: nodeType
        };
        element = new ContrailElement(nodeType, options);
        return element;
    }

    function createCloudZoomedNodeElement(nodeDetails, config) {
        var factor = 1;
        var currentZoomedElement = new joint.shapes.contrail.ZoomedCloudElement({
            size: {width: config.width * factor, height: config.height * factor},
            attrs: {
                rect: {width: config.width * factor, height: config.height * factor},
                text: {
                    text: contrail.truncateText(nodeDetails['name'].split(":")[2], 50),
                    'ref-x': .5,
                    'ref-y': -20
                }
            }
        });
        currentZoomedElement['attributes']['nodeDetails'] = nodeDetails;
        return currentZoomedElement;
    }

    function createCollectionElements(collections, elements, elementMap) {
        var elementDimension = {
            width: 37,
            height: 37,
            marginLeft: 17,
            marginRight: 17,
            marginTop: 10,
            marginBottom: 0,
            firstRowMarginTop: 10
        };
        var collectionPositionX = 10,
            collectionPositionY = 20,
            width = 0,
            height = 0;
        $.each(collections, function (collectionKey, collectionValue) {
            var nodeRows = 1;
            collectionPositionX = 0,
                collectionPositionY += height,
                width = (elementDimension.width + elementDimension.marginLeft + elementDimension.marginRight) * collectionValue.nodes.length;
            height = nodeRows * (elementDimension.width + elementDimension.marginTop + elementDimension.marginBottom) + elementDimension.marginTop + elementDimension.marginBottom + elementDimension.firstRowMarginTop;
            var options = {
                position: {
                    x: collectionPositionX,
                    y: collectionPositionY
                },
                attrs: {
                    rect: {
                        width: width,
                        height: height
                    },
                    text: {
                        text: collectionValue.name
                    }
                }
            };

            var collectionElement = new ContrailElement(collectionValue.node_type, options);
            elements.push(collectionElement);
            elementMap.node[collectionValue.name] = collectionElement.id;

            var collectionNodePositionX = 0,
                collectionNodePositionY = 0;

            $.each(collectionValue.nodes, function (collectionNodeKey, collectionNodeValue) {
                collectionNodePositionX = collectionPositionX + (collectionNodeKey % 2) * (elementDimension.width + elementDimension.marginLeft + elementDimension.marginRight)
                    + elementDimension.marginLeft;
                collectionNodePositionY = elementDimension.firstRowMarginTop + (collectionPositionY + height * parseInt(collectionNodeKey / 2));

                var nodeName = collectionNodeValue['name'],
                    nodeType = collectionNodeValue['node_type'],
                    imageName = getImageName(collectionNodeValue),
                    imageLink = '/img/icons/' + imageName,
                    options = {
                        position: {
                            x: collectionNodePositionX,
                            y: collectionNodePositionY
                        },
                        attrs: {
                            image: {
                                'xlink:href': imageLink,
                                width: elementDimension.width,
                                height: elementDimension.height
                            },
                            text: {
                                text: contrail.truncateText(nodeName.split(":")[2], 15)
                            }
                        },
                        nodeDetails: collectionNodeValue.nodeDetails,
                        elementType: collectionNodeValue.elementType,
                        font: collectionNodeValue.font
                    },
                    element = new ContrailElement(nodeType, options);

                collectionElement.embed(element);
                elements.push(element);
                elementMap.node[nodeName] = element.id;
            });

            collectionPositionY = collectionNodePositionY;
        });

        return collectionPositionY + elementDimension.height + elementDimension.firstRowMarginTop;
    }

    function createLinkElements(links, elements, elementMap) {
        var link, sourceId, sourceName, targetId, linkedElements = [];
        for (var i = 0; i < links.length; i++) {
            var sInstances = links[i] ['service_inst'],
                dir = links[i]['dir'],
                source = {}, target = {};

            if (sInstances == null || sInstances.length == 0) {
                sourceId = elementMap.node[links[i]['src']];
                targetId = elementMap.node[links[i]['dst']];

                source = {
                    id: sourceId,
                    name: links[i]['src']
                };
                target = {
                    id: targetId,
                    name: links[i]['dst']
                };

                link = createLinkElement(source, target, dir, links[i], elements, elementMap);
                linkedElements.push(link);
            } else {
                var linkElements = [],
                    linkElementKeys = [],
                    linkElementKeyString = '',
                    linkElementKeyStringBi = '';
                for (var j = 0; j < sInstances.length; j++) {
                    if (j == 0) {
                        sourceId = elementMap.node[links[i]['src']];
                        sourceName = links[i]['src'];
                        source = {
                            id: sourceId,
                            name: sourceName
                        };
                    } else {
                        sourceId = elementMap.node[sInstances[j - 1]];
                        sourceName = sInstances[j - 1];
                        source = {
                            id: sourceId,
                            name: sourceName
                        };
                    }
                    targetId = elementMap.node[sInstances[j]];
                    target = {
                        id: targetId,
                        name: sInstances[j]
                    };
                    linkElements.push({
                        source: source,
                        target: target
                    });
                    linkElementKeys.push(source.name);
                }

                sourceId = elementMap.node[sInstances[j - 1]];
                source = {
                    id: sourceId,
                    name: sInstances[j - 1]
                };

                targetId = elementMap.node[links[i]['dst']];
                target = {
                    id: targetId,
                    name: links[i]['dst']
                };
                linkElements.push({
                    source: source,
                    target: target
                });
                linkElementKeys.push(source.name);
                linkElementKeys.push(target.name);

                linkElementKeyString = linkElementKeys.join('<->');
                elementMap.link[linkElementKeyString] = [];

                if (dir == 'bi') {
                    linkElementKeyStringBi = linkElementKeys.reverse().join('<->');
                    elementMap.link[linkElementKeyStringBi] = [];
                }

                $.each(linkElements, function (linkElementKey, linkElementValue) {
                    link = createLinkElement(linkElementValue.source, linkElementValue.target, dir, links[i], elements, elementMap);
                    linkedElements.push(link);

                    elementMap.link[linkElementKeyString].push(link.id);
                    if (dir == 'bi') {
                        elementMap.link[linkElementKeyStringBi].push(link.id);
                    }
                });
            }
        }
        elementMap['linkedElements'] = linkedElements;
    };

    function createLinkElement(source, target, dir, linkDetails, elements, elementMap) {
        var options = {
            sourceId: source.id,
            targetId: target.id,
            direction: dir,
            linkType: 'bi',
            linkDetails: linkDetails,
            elementType: 'connected-network'
        };
        var link = new ContrailElement('link', options);
        elements.push(link);
        elementMap.link[source.name + '<->' + target.name] = link.id;
        if (link.attributes.linkDetails.dir == 'bi') {
            elementMap.link[target.name + '<->' + source.name] = link.id;
        }
        return link;
    }

    return NetworkingGraphView;
});
