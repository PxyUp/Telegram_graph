!function(t){"function"==typeof define&&define.amd?define(t):t()}(function(){"use strict";!function(t){if(t&&"undefined"!=typeof window){var e=document.createElement("style");e.setAttribute("type","text/css"),e.innerHTML=t,document.head.appendChild(e)}}('.checkbox_container {\n  display: flex;\n  align-items: center;\n  border-radius: 20px;\n  background-color: white;\n  border: 1px solid #e7ecf0;\n  padding: 5px;\n}\n.checkbox_container:hover {\n  cursor: pointer;\n}\n.checkbox_container .round {\n  position: relative;\n  transition: background-color 0.2s ease-out;\n  border-radius: 50%;\n  cursor: pointer;\n  height: 14px;\n  width: 14px;\n  border: 1px solid transparent;\n  opacity: 1;\n}\n.checkbox_container .round::after {\n  opacity: 1 !important;\n}\n.checkbox_container .round.not_active::after {\n  opacity: 0 !important;\n}\n.checkbox_container .round.not_active {\n  background-color: unset !important;\n}\n.checkbox_container .round::after {\n  border: 2px solid white;\n  border-top: none;\n  border-right: none;\n  content: "";\n  height: 3px;\n  left: 3px;\n  opacity: 0;\n  position: absolute;\n  top: 3px;\n  transform: rotate(-45deg);\n  width: 7px;\n  font-size: 5px;\n}\n.checkbox_container .label {\n  margin-left: 10px;\n}\n\n.pxyup_chart_container {\n  width: 100%;\n  background-color: white;\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n}\n.pxyup_chart_container.animation path {\n  transition: d 0.15s;\n}\n.pxyup_chart_container .axis_labels {\n  user-select: none;\n  font-size: 13px;\n  position: absolute;\n  left: 0;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.pxyup_chart_container .axis_labels div {\n  color: #96a2aa;\n}\n.pxyup_chart_container .preview_container {\n  margin-top: 10px;\n  position: relative;\n  overflow: hidden;\n}\n.pxyup_chart_container .preview_container .preview_controls {\n  position: absolute;\n  width: 100%;\n  left: 0;\n  top: 0;\n  height: 100%;\n}\n.pxyup_chart_container .preview_container .preview_controls .control {\n  will-change: transform;\n  height: 100%;\n  position: absolute;\n}\n.pxyup_chart_container .preview_container .preview_controls .control.left:hover, .pxyup_chart_container .preview_container .preview_controls .control.right:hover {\n  cursor: pointer;\n}\n.pxyup_chart_container .preview_container .preview_controls .control.left {\n  width: 100%;\n  background-color: rgba(245, 249, 251, 0.8);\n}\n.pxyup_chart_container .preview_container .preview_controls .control.left .resize {\n  right: -5px;\n}\n.pxyup_chart_container .preview_container .preview_controls .control.right {\n  background-color: rgba(245, 249, 251, 0.8);\n  width: 100%;\n}\n.pxyup_chart_container .preview_container .preview_controls .control.right .resize {\n  left: -5px;\n}\n.pxyup_chart_container .preview_container .preview_controls .control.center {\n  z-index: 3;\n  border-top: 1px solid rgba(221, 234, 243, 0.7);\n  border-bottom: 1px solid rgba(221, 234, 243, 0.7);\n  height: calc(100% - 2px);\n}\n.pxyup_chart_container .preview_container .preview_controls .control.center:hover {\n  cursor: grab;\n}\n.pxyup_chart_container .preview_container .preview_controls .control.center:active, .pxyup_chart_container .preview_container .preview_controls .control.center:focus {\n  cursor: grabbing;\n}\n.pxyup_chart_container .preview_container .preview_controls .control .resize {\n  z-index: 2;\n  top: 0;\n  position: absolute;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n}\n.pxyup_chart_container .preview_container .preview_controls .control .resize:hover, .pxyup_chart_container .preview_container .preview_controls .control .resize:active, .pxyup_chart_container .preview_container .preview_controls .control .resize:focus {\n  cursor: col-resize;\n}\n.pxyup_chart_container .preview_container .preview_controls .control .resize .caret {\n  background-color: rgba(221, 234, 243, 0.7);\n  width: 10px;\n  height: 100%;\n}\n.pxyup_chart_container .controls {\n  margin-top: 8px;\n  display: flex;\n  min-height: 40px;\n  align-items: center;\n  justify-content: space-around;\n  flex-wrap: wrap;\n}\n.pxyup_chart_container .night_mode_control {\n  margin-top: 10px;\n}\n.pxyup_chart_container .night_mode_control a {\n  font-size: 20px;\n  user-select: none;\n  color: #55abeb;\n}\n.pxyup_chart_container .night_mode_control a:hover {\n  cursor: pointer;\n}\n.pxyup_chart_container .tooltip {\n  display: none;\n  position: absolute;\n  z-index: 10;\n  background-color: white;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n  min-width: 90px;\n  padding: 8px;\n  align-items: center;\n  justify-items: center;\n  flex-direction: column;\n}\n.pxyup_chart_container .tooltip .items {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-wrap: wrap;\n}\n.pxyup_chart_container .tooltip .items > div {\n  display: flex;\n  margin-left: 8px;\n  margin-right: 8px;\n  flex-direction: column;\n}\n.pxyup_chart_container .tooltip .items > div span.value {\n  font-size: 16px;\n  font-weight: bold;\n}\n.pxyup_chart_container .tooltip .items > div span.item {\n  font-size: 14px;\n}\n.pxyup_chart_container svg {\n  display: block;\n  position: relative;\n}\n.pxyup_chart_container svg circle {\n  fill: white;\n  stroke-width: 2;\n}\n.pxyup_chart_container line {\n  stroke: #f2f4f5;\n}\n.pxyup_chart_container line.verticle {\n  display: none;\n  stroke-width: 2;\n}\n.pxyup_chart_container line.verticle.show {\n  display: block;\n}\n.pxyup_chart_container svg {\n  user-select: none;\n  touch-action: pan-x;\n}\n.pxyup_chart_container svg.main_chart path:hover {\n  stroke-width: 3;\n}\n.pxyup_chart_container path {\n  stroke-width: 2;\n}\n.pxyup_chart_container text {\n  font-size: 12px;\n  z-index: 1;\n  background-color: white;\n  font-family: sans-serif;\n  text-shadow: 1px 0.5px white;\n}\n.pxyup_chart_container text.text_step {\n  fill: #96a2aa;\n}\n.pxyup_chart_container.night {\n  background-color: #26303d;\n}\n.pxyup_chart_container.night .axis_labels div {\n  color: #546778;\n}\n.pxyup_chart_container.night .checkbox_container {\n  background-color: #26303d;\n  border-color: #374656;\n}\n.pxyup_chart_container.night .checkbox_container .round.not_active {\n  background-color: unset !important;\n}\n.pxyup_chart_container.night .checkbox_container .label {\n  color: white;\n}\n.pxyup_chart_container.night .tooltip {\n  background-color: #273340;\n}\n.pxyup_chart_container.night .tooltip p {\n  color: white;\n}\n.pxyup_chart_container.night line {\n  stroke: #293544;\n}\n.pxyup_chart_container.night .preview_controls .control.left, .pxyup_chart_container.night .preview_controls .control.right {\n  background-color: rgba(31, 42, 56, 0.8);\n}\n.pxyup_chart_container.night text {\n  text-shadow: 1px 0.5px #242f3e;\n}\n.pxyup_chart_container.night text.text_step {\n  fill: #546778;\n}\n\nbody {\n  margin: 64px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n}');var x=function(){return(x=Object.assign||function(t){for(var e,n=1,i=arguments.length;n<i;n++)for(var o in e=arguments[n])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t}).apply(this,arguments)},n={long:{},short:{}},i={},t=!!window.Intl,o=t&&new Intl.DateTimeFormat("en-US",{weekday:"short",month:"short",day:"numeric"}),r=t&&new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"});function f(t,e){var n=Object.keys(e).map(function(t){return t+": "+e[t]}).join(";");t.style.cssText=n}function _(t,e){return t&&t.size?{height:t.size.height,width:t.size.width}:e}function w(t,e){return t-e}function s(t){var e={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};return t.reduce(function(t,e){return t.min=Math.min(t.min,e),t.max=Math.max(t.max,e),t},e)}var c,e,a=t?function(t,e){return void 0===e&&(e=!1),e?(n.long[t]||(n.long[t]=o.format(t)),n.long[t]):(n.short[t]||(n.short[t]=r.format(t)),n.short[t])}:function(t,e){return void 0===e&&(e=!1),i[t]||(i[t]=new Date(t)),i[t].toLocaleString("en-us",{weekday:e?"short":void 0,month:"short",day:"numeric"})};function h(t,e){return void 0===e&&(e=!1),a(t,e)}function l(t){return t.reduce(function(t,e,n){return 0===n?t+"M "+e.x+" "+e.y:t+" L "+e.x+" "+e.y},"")}function p(t){for(;t.firstChild;)t.removeChild(t.firstChild)}function u(t){return document.createTextNode(t)}function m(n,t){Object.keys(t).forEach(function(e){Array.isArray(t[e])?t[e].forEach(function(t){n.addEventListener(e,t)}):n.addEventListener(e,t[e])})}function d(n,t){Object.keys(t).forEach(function(e){Array.isArray(t[e])?t[e].forEach(function(t){n.removeEventListener(e,t)}):n.removeEventListener(e,t[e])})}function y(e,n){Object.keys(n).forEach(function(t){e.setAttribute(t,n[t])})}function v(t,e,n,i,o){return 1===o?e+(t-e-n)/2:e+(t-e-n)/(o-1)*i}function g(t,e,n,i,o,r){return r===i?e:r===o?t-n:o===i?t-n-(t-e-n)/2:t-n-(r-o)/(i-o)*(t-e-n)}function E(t,e,n,i,o){return t<=n?0:e-i<=t?o-1:Math.min(o-1,Math.round((t-n)/(e-n-i)*(o-1)))}(e=c||(c={})).Line="line",e.X="x";var C=30,b=30,S=10,L=10,I=function(){function t(t,e,n,i,o,r,s,a,c,h,l,p,u,d,m,v,g){var x=this;this.id=t,this.node=e,this.charts_svg=n,this.preview_svg=i,this.toolTip=o,this.toolTipDate=r,this.controlsContainer=s,this.nightModeControl=a,this.axisContainer=c,this.leftPreviewControl=h,this.rightPreviewControl=l,this.centerPreviewControl=p,this.leftResizeControl=u,this.rightResizeControl=d,this.previewControlContainer=m,this.dataset=v,this.options=g,this.isDragActive=!1,this.isResizeActive=!1,this.activeResize=null,this.resizeAnimationFrame=null,this.dragAnimationFrame=null,this.mouseMoveAnimationFrame=null,this.toggleColumnAnimationFrame=null,this.night_mod=!1,this.sliceStartIndex=0,this.sliceEndIndex=0,this.currentSlicePoint={},this.columnsVisible={},this.columnDatasets={},this.animationTimer=null,this.doPreventDefault=function(t){t.stopPropagation()},this.onNightModeClick=function(){x.toggleNightMode()},this.onCheckBoxClick=function(n){x.toggleColumnAnimationFrame&&cancelAnimationFrame(x.toggleColumnAnimationFrame),x.toggleColumnAnimationFrame=requestAnimationFrame(function(){x.removePoints();for(var t=n.target,e=t.getAttribute("key");!e||t===document.body;)e=(t=t.parentNode).getAttribute("key");e&&x.toggleColumnVisible(e)})},this.onMouseUp=function(t){x.isResizeActive=!1,x.isDragActive=!1,x.activeResize=null},this.onResizeStartRight=function(t){t.stopPropagation(),x.isDragActive=!1,x.hideHoverLineAndPoints(),x.isResizeActive=!0,x.activeResize=!0},this.onResizeStartLeft=function(t){t.stopPropagation(),x.isDragActive=!1,x.hideHoverLineAndPoints(),x.isResizeActive=!0,x.activeResize=!1},this.stopProp=function(t){t.stopPropagation()},this.onResizeEndLeft=function(){x.isResizeActive=!1,x.activeResize=null},this.onResizeEndRight=function(){x.isResizeActive=!1,x.activeResize=null},this.onResize=function(t){t.preventDefault(),x.isResizeActive&&(x.resizeAnimationFrame&&cancelAnimationFrame(x.resizeAnimationFrame),x.resizeAnimationFrame=requestAnimationFrame(function(){return x.doResize(x.activeResize,t)}))},this.onDragStart=function(t){t.stopPropagation(),x.hideHoverLineAndPoints(),x.isDragActive=!0},this.onDragEnd=function(t){x.isDragActive=!1},this.onDrag=function(t){t.preventDefault(),x.isDragActive&&(x.dragAnimationFrame&&cancelAnimationFrame(x.dragAnimationFrame),x.dragAnimationFrame=requestAnimationFrame(function(){return x.onPreviewControlClick(t)}))},this.onMouseEnter=function(){x.verticleLine.classList.add("show")},this.onMouseLeave=function(t){var e=w(t.clientY,x.positions.top);(t.toElement!==x.toolTip||e>=x.height-100)&&x.hideHoverLineAndPoints()},this.onToolTipLeave=function(){x.hideHoverLineAndPoints()},this.onPreviewControlClick=function(t){var e=w(t.clientX||t.touches[0].clientX,x.positions.left),n=x.sliceEndIndex-x.sliceStartIndex,i=Math.floor(E(e,x.previewWidth,L,L,x.countElements)-n/2);x.sliceStartIndex=Math.max(i,0),x.sliceEndIndex=Math.min(x.sliceStartIndex+n,x.countElements-1),x.sliceEndIndex===x.countElements-1&&(x.sliceStartIndex=Math.max(0,x.sliceEndIndex-n)),0===x.sliceStartIndex&&(x.sliceEndIndex=Math.min(x.sliceStartIndex+n,x.countElements-2)),x.drawPreviewControls(),x.removeAxisXCharts(),x.draw()},this.onMouseMove=function(o){x.mouseMoveAnimationFrame&&cancelAnimationFrame(x.mouseMoveAnimationFrame),x.mouseMoveAnimationFrame=requestAnimationFrame(function(){var t=o.offsetX,e=o.offsetY;if(15<t&&t<x.width-15&&e<x.height-S){y(x.verticleLine,{x1:t,x2:t});var n=x.findClosesIndexOfPoint(t);if(null===n)return;var i=Object.keys(x.columnsVisible).filter(function(t){return x.columnsVisible[t]}).map(function(t){return{key:t,color:x.dataset.colors[t],x:x.currentSlicePoint[t][n].x,y:x.currentSlicePoint[t][n].y,value:x.currentSlicePoint[t][n].value,date:x.currentSlicePoint[t][n].date}});x.showPoints(i),x.showTooltip(i,{x:t,y:e})}})},this.preventDrag=function(t){return t.preventDefault(),!1},this.onMouseEnterPreview=function(){x.hideHoverLineAndPoints()},this.SVG_CHARTS_LISTENERS={mouseenter:this.onMouseEnter,mouseleave:this.onMouseLeave,mousemove:this.onMouseMove},this.CENTRAL_CONTROL_LISTENERS={mousedown:this.onDragStart,dragstart:this.preventDrag,mouseup:this.onDragEnd,touchstart:this.onDragStart,touchend:this.onDragEnd},this.PREVIEW_CHART_LISTENERS={mouseenter:this.onMouseEnterPreview,mousemove:[this.onDrag,this.onResize],touchmove:[this.onDrag,this.onResize]},this.DOCUMENT_LISTENERS={mouseup:this.onMouseUp},this.TOOLTIP_LISTENERS={mouseleave:this.onToolTipLeave},this.LEFT_RESIZE_CONTROL_LISTENERS={mouseup:this.onResizeEndLeft,dragstart:this.preventDrag,mousedown:this.onResizeStartLeft,touchend:this.onResizeEndLeft,touchstart:this.onResizeStartLeft,click:this.stopProp},this.RIGHT_RESIZE_CONTROL_LISTENERS={mouseup:this.onResizeEndRight,dragstart:this.preventDrag,mousedown:this.onResizeStartRight,touchend:this.onResizeEndRight,touchstart:this.onResizeStartRight,click:this.stopProp},this.height=+this.charts_svg.getAttribute("height"),this.width=+this.charts_svg.getAttribute("width"),this.toolTip.style.maxWidth=this.width-120+"px",Object.keys(this.dataset.names).forEach(function(t){x.columnsVisible[t]=!0}),this.dataset.columns.forEach(function(t){var e=t.shift();if(x.columnDatasets[e]=t,x.countElements||(x.countElements=x.columnDatasets[e].length),!x.sliceStartIndex){var n=Math.max(19,Math.floor(x.countElements/5.5));x.sliceStartIndex=Math.max(x.columnDatasets[e].length-n-1,0)}x.sliceEndIndex||(x.sliceEndIndex=x.columnDatasets[e].length-1)}),this.horizontSteps=g&&g.horizontSteps||6,this.verticleLine=R("line",["verticle"],{x1:0,x2:0,y1:0,y2:this.height-S}),this.charts_svg.appendChild(this.verticleLine),this.addMouseListener(),g.withoutAxisLabel||f(this.axisContainer,{top:this.height-S+"px",width:this.width-30+"px","padding-left":"20px","padding-right":"15px"}),this.draw(),g.withoutPreview||(this.previewHeight=+this.preview_svg.getAttribute("height"),this.previewWidth=+this.preview_svg.getAttribute("width"),this.drawPreview(),this.drawPreviewControls(!0)),g.withoutControls||this.generateControls(),g.withoutNightMode||this.addNightModeListener()}return t.prototype.addNightModeListener=function(){this.nightModeControl.addEventListener("click",this.onNightModeClick)},t.prototype.generateControls=function(){var n=this;this.controlsContainer.style.width=this.width+"px",Object.keys(this.columnsVisible).forEach(function(t){var e=T({tag:"div",classList:["checkbox_container"],attrs:{key:t},children:[{tag:"div",classList:["round"]},{tag:"div",classList:["label"],textValue:n.dataset.names[t]}]});n.controlsContainer.appendChild(e),e.addEventListener("click",n.onCheckBoxClick,!1),n.setColorCheckboxByKey(t)})},t.prototype.addMouseListener=function(){m(this.charts_svg,this.SVG_CHARTS_LISTENERS),m(document,this.DOCUMENT_LISTENERS),m(this.toolTip,this.TOOLTIP_LISTENERS)},t.prototype.destroy=function(t){var e=this;void 0===t&&(t=!0),this.resetTimer(),d(this.charts_svg,this.SVG_CHARTS_LISTENERS),d(document,this.DOCUMENT_LISTENERS),d(this.toolTip,this.TOOLTIP_LISTENERS),this.options.withoutControls||this.controlsContainer.querySelectorAll(".round").forEach(function(t){t.removeEventListener("click",e.onCheckBoxClick)}),this.options.withoutNightMode||this.nightModeControl.removeEventListener("click",this.onNightModeClick),this.options.withoutPreview||(d(this.centerPreviewControl,this.CENTRAL_CONTROL_LISTENERS),d(this.previewControlContainer,this.PREVIEW_CHART_LISTENERS),d(this.leftResizeControl,this.LEFT_RESIZE_CONTROL_LISTENERS),d(this.rightResizeControl,this.RIGHT_RESIZE_CONTROL_LISTENERS),d(this.leftPreviewControl,{click:this.onPreviewControlClick}),d(this.rightPreviewControl,{click:this.onPreviewControlClick})),t&&this.node.remove()},t.prototype.hideHoverLineAndPoints=function(){this.removePoints(),this.verticleLine.classList.remove("show"),this.toolTip.style.display="none"},t.prototype.doResize=function(t,e){if(null!==t){var n=E(w(e.clientX||e.touches[0].clientX,this.positions.left),this.previewWidth,L,L,this.countElements);t?(this.sliceEndIndex=n,this.sliceEndIndex<=this.sliceStartIndex&&(this.sliceEndIndex=this.sliceStartIndex+1)):(this.sliceStartIndex=n,this.sliceStartIndex>=this.sliceEndIndex&&(this.sliceStartIndex=this.sliceEndIndex-1)),this.drawPreviewControls(),this.removeAxisXCharts(),this.draw()}},t.prototype.showPoints=function(t){var n=this;void 0===t&&(t=[]),this.removePoints(),t.forEach(function(t){var e=R("circle",null,{cx:t.x,cy:t.y,stroke:t.color,r:5});n.charts_svg.appendChild(e)})},t.prototype.removePoints=function(){this.charts_svg.querySelectorAll("circle").forEach(function(t){return t.remove()})},t.prototype.showTooltip=function(t,e){var n=this,i=e.x+b,o={display:"flex",right:"unset",left:i+"px",top:e.y+10+"px"},r=this.toolTip.querySelector(".items");p(r),p(this.toolTipDate),this.toolTipDate.appendChild(u(h(t[0].date,!0))),t.map(function(t){return T({tag:"div",attrs:{style:"color: "+t.color},children:[{tag:"span",classList:["value"],textValue:t.value},{tag:"span",classList:["item"],textValue:n.dataset.names[t.key]}]})}).forEach(function(t){return r.appendChild(t)}),i>this.width-90-C&&(o.right=Math.min(90,this.width-i+b+C)+"px",o.left="unset"),f(this.toolTip,o)},t.prototype.findClosesIndexOfPoint=function(t){var e=this,n=Object.keys(this.columnsVisible).filter(function(t){return e.columnsVisible[t]});return n.length?function(t,e){for(var n,i=0,o=t.length-1;1<o-i;)if(e<t[n=Math.floor((i+o)/2)].x)o=n;else{if(!(e>t[n].x))return n;i=n}return e-t[i].x<=t[o].x-e?i:o}(this.currentSlicePoint[n[0]],t):null},t.prototype.removePathByKey=function(t){var e=this.charts_svg.querySelector("path#pxyup_path_"+this.id+"_"+t);e&&e.remove()},t.prototype.setColorCheckboxByKey=function(t){var e=this.dataset.colors[t],n=this.controlsContainer.querySelector('.checkbox_container[key="'+t+'"] .round');this.columnsVisible[t]?(n.classList.remove("not_active"),f(n,{"border-color":e,"background-color":e})):n.classList.add("not_active")},t.prototype.toggleColumnVisible=function(t){var e=this;this.columnsVisible[t]=!this.columnsVisible[t],this.setColorCheckboxByKey(t),this.columnsVisible[t]||this.removePathByKey(t),this.node.classList.add("animation"),this.options.withoutPreview||this.drawPreview(!1),this.refresh(!1,!1),this.animationTimer&&clearTimeout(this.animationTimer),this.animationTimer=window.setTimeout(function(){e.node.classList.remove("animation")},150)},t.prototype.drawPreviewControls=function(t){void 0===t&&(t=!1);var e,n,i,o,r,s,a,c,h,l,p=(e=this.sliceStartIndex,n=this.previewWidth,o=i=L,r=this.countElements,-(n-e/(r-1)*(n-i-o)-o)),u=(s=this.sliceEndIndex,a=this.previewWidth,h=c=L,l=this.countElements,s/(l-1)*(a-c-h)+c);f(this.leftPreviewControl,{transform:"translateX("+p+"px)"}),f(this.rightPreviewControl,{transform:"translateX("+u+"px)"});var d=Math.ceil(Math.abs(Math.abs(this.previewWidth-u)-Math.abs(p)));f(this.centerPreviewControl,{width:d+"px",transform:"translateX("+Math.round(u-d)+"px)"}),t&&(m(this.leftPreviewControl,{click:this.onPreviewControlClick}),m(this.rightPreviewControl,{click:this.onPreviewControlClick}),m(this.centerPreviewControl,this.CENTRAL_CONTROL_LISTENERS),m(this.previewControlContainer,this.PREVIEW_CHART_LISTENERS),m(this.leftResizeControl,this.LEFT_RESIZE_CONTROL_LISTENERS),m(this.rightResizeControl,this.RIGHT_RESIZE_CONTROL_LISTENERS))},t.prototype.draw=function(t,e){void 0===t&&(t=!0),void 0===e&&(e=!0),this.setSupportsLines(),this.drawCurrentSlice(t,e)},t.prototype.refresh=function(t,e){void 0===t&&(t=!0),void 0===e&&(e=!0),this.resetTimer(),this.draw(t,e)},t.prototype.drawAxisX=function(){p(this.axisContainer);var t=this.sliceEndIndex-this.sliceStartIndex+1,e=Math.min(6,t+1),n=e,i=t<=8?1:Math.max(t/(n-1),1),o=this.sliceStartIndex,r=function(t){return T({tag:"div",textValue:t})};if(1==i)for(var s=this.sliceStartIndex;s<=this.sliceEndIndex;s++)this.axisContainer.appendChild(r(h(this.columnDatasets[c.X][s])));else{for(this.axisContainer.appendChild(r(h(this.columnDatasets[c.X][this.sliceStartIndex]))),o+=i;0<e-2&&o<this.sliceEndIndex-2;)this.axisContainer.appendChild(r(h(this.columnDatasets[c.X][Math.ceil(o)]))),e-=1,o+=i;this.axisContainer.appendChild(r(h(this.columnDatasets[c.X][this.sliceEndIndex])))}},t.prototype.resetTimer=function(){this.dragAnimationFrame&&(cancelAnimationFrame(this.dragAnimationFrame),this.dragAnimationFrame=null),this.resizeAnimationFrame&&(cancelAnimationFrame(this.resizeAnimationFrame),this.resizeAnimationFrame=null),this.mouseMoveAnimationFrame&&(cancelAnimationFrame(this.mouseMoveAnimationFrame),this.mouseMoveAnimationFrame=null),this.toggleColumnAnimationFrame&&(cancelAnimationFrame(this.toggleColumnAnimationFrame),this.toggleColumnAnimationFrame=null),this.animationTimer&&(clearTimeout(this.animationTimer),this.animationTimer=null)},t.prototype.setRightIndexSlice=function(t){this.sliceStartIndex=t,this.refresh()},t.prototype.setLeftIndexSlice=function(t){this.sliceEndIndex=t,this.refresh()},t.prototype.removeAxisXCharts=function(){var t=this.charts_svg.querySelector("g.axis");t&&t.remove()},t.prototype.drawCurrentSlice=function(t,e){var r=this;void 0===t&&(t=!0),void 0===e&&(e=!0);var s=0<=this.minValue?0:this.minValue,a=this.sliceEndIndex-this.sliceStartIndex+1;Object.keys(this.columnsVisible).forEach(function(t){var e,n;if(r.columnsVisible[t]){var i=r.charts_svg.querySelector("path#pxyup_path_"+r.id+"_"+t);if(r.currentSlicePoint[t]=r.columnDatasets[t].slice(r.sliceStartIndex,r.sliceEndIndex+1).map(function(t,e){return{x:v(r.width,b,C,e,a),y:g(r.height,10,S,r.maxValue,s,t),value:t,date:r.columnDatasets[c.X][r.sliceStartIndex+e]}}),i)return e=i,n=l(r.currentSlicePoint[t]),void e.setAttribute("d",n);var o=R("path",[],{id:"pxyup_path_"+r.id+"_"+t,stroke:r.dataset.colors[t],fill:"none",d:l(r.currentSlicePoint[t])});r.charts_svg.appendChild(o)}}),!this.options.withoutAxisLabel&&e&&this.drawAxisX()},t.prototype.drawPreview=function(t){var n=this;void 0===t&&(t=!0),this.preview_svg.querySelectorAll("path").forEach(function(t){return t.remove()});var e=[];Object.keys(this.columnsVisible).forEach(function(t){n.columnsVisible[t]&&e.push.apply(e,n.columnDatasets[t])});var i=s(e);this.minValueGlobal=i.min,this.maxValueGlobal=i.max,Object.keys(this.columnsVisible).forEach(function(t){if(n.columnsVisible[t]){var e=R("path",[],{id:"pxyup_path_preview_"+n.id+"_"+t,d:l(n.columnDatasets[t].map(function(t,e){return{x:v(n.previewWidth,10,10,e,n.countElements),y:g(n.previewHeight,5,5,n.maxValueGlobal,n.minValueGlobal,t)}})),stroke:n.dataset.colors[t],fill:"none"});n.preview_svg.prepend(e)}})},t.prototype.setSupportsLines=function(){var e=this,n=[];if(Object.keys(this.columnsVisible).forEach(function(t){e.columnsVisible[t]&&n.push.apply(n,e.columnDatasets[t].slice(e.sliceStartIndex,e.sliceEndIndex+1))}),0!==n.length){var t=s(n);if(this.minValue!==t.min||this.maxValue!==t.max){this.minValue=t.min,this.maxValue=t.max;for(var i=0===n.length?0:Math.ceil((0<this.minValue?this.maxValue:this.maxValue-this.minValue)/this.horizontSteps),o=0<this.minValue?[0]:[this.minValue],r=1;r<this.horizontSteps;r++)o.push(o[0]+i*r||r);this.drawSteps(o)}}else this.removeSteps()},t.prototype.toggleNightMode=function(){this.night_mod=!this.night_mod,p(this.nightModeControl),this.night_mod?(this.node.classList.add("night"),this.nightModeControl.appendChild(u("Switch to day mode"))):(this.node.classList.remove("night"),this.nightModeControl.appendChild(u("Switch to night mode")))},t.prototype.removeSteps=function(){var t=this.charts_svg.querySelector("g.steps");t&&t.remove()},t.prototype.drawSteps=function(t){var r=this;this.removeSteps();var s=0<=this.minValue?0:this.minValue,a=[];t.forEach(function(t,e){var n=0===e?r.height-S:g(r.height,10,S,r.maxValue,s,t),i=R("line",["line_step"],{x1:0,x2:r.width,y1:n,y2:n}),o=R("text",["text_step"],{x:0,y:n-5},[],t);a.push(i),a.push(o)});var e=R("g",["steps"],null,a);this.charts_svg.prepend(e)},t.prototype.getTranspilingDataset=function(){return this.columnDatasets},Object.defineProperty(t.prototype,"positions",{get:function(){return this._position||(this._position=this.charts_svg.getBoundingClientRect()),this._position},enumerable:!0,configurable:!0}),t}(),A=0;function R(t,e,n,i,o){var r=document.createElementNS("http://www.w3.org/2000/svg",t);return e&&e.forEach(function(t){r.classList.add(t)}),n&&y(r,n),i&&i.forEach(function(t){r.appendChild(t)}),void 0!==o&&r.appendChild(document.createTextNode(o)),r}function T(e){if(e.skip)return null;var n="svg"===e.tag?document.createElementNS("http://www.w3.org/2000/svg","svg"):document.createElement(e.tag);return e.textValue&&n.appendChild(u(e.textValue)),e.classList&&e.classList.forEach(function(t){n.classList.add(t)}),e.attrs&&("svg"===e.tag?(Object.keys(e.attrs).forEach(function(t){n.setAttributeNS(null,t,e.attrs[t])}),n.setAttributeNS(null,"viewBox","0 0 "+e.attrs.width+" "+e.attrs.height)):y(n,e.attrs)),e.children&&e.children.forEach(function(t){if(t)if(t.tag){var e=T(t);e&&n.appendChild(e)}else n.appendChild(t)}),n}var k,P=(k=document.querySelector(".draw_engine"),function(t,e){void 0===e&&(e={});var n=T({tag:"div",classList:["axis_labels"],skip:e.withoutAxisLabel}),i=T({tag:"svg",classList:["main_chart"],attrs:x({},_(e.chartsContainer,{width:"400",height:"400"}))}),o=T({tag:"svg",skip:e.withoutPreview,classList:["chart_preview"],attrs:x({},_(e.previewContainer,{width:"400",height:"60"}))}),r=T({tag:"div",classList:["resize"],children:[T({tag:"div",classList:["caret"]})]}),s=T({tag:"div",classList:["resize"],children:[T({tag:"div",classList:["caret"]})]}),a=T({tag:"div",classList:["control","left"],children:[r]}),c=T({tag:"div",classList:["control","center"]}),h=T({tag:"div",classList:["control","right"],children:[s]}),l=T({tag:"div",classList:["preview_controls"],children:[a,c,h]}),p=T({tag:"div",skip:e.withoutPreview,classList:["preview_container"],children:[o,l]}),u=T({tag:"p",classList:["date"]}),d=T({tag:"div",classList:["tooltip"],children:[u,{tag:"div",classList:["items"]}]}),m=T({tag:"div",classList:["controls"],skip:e.withoutControls}),v=T({tag:"a",textValue:"Switch to Night mode"}),g=T({attrs:{id:"pxyup_chart_"+A},classList:["pxyup_chart_container"],tag:"div",children:[i,n,p,d,m,{tag:"div",classList:["night_mode_control"],skip:e.withoutNightMode,children:[v]}]});return new I(A++,k.appendChild(g),i,o,d,u,m,v,n,a,h,c,r,s,l,t,e)});fetch("./chart_data.json").then(function(t){return t.json()}).then(function(t){t.forEach(function(t){P(t)})})});
//# sourceMappingURL=bundle.js.map
