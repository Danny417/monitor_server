function initialize() {
	var map_canvas = document.getElementById('data_map');
	var map_options = {
		center: new google.maps.LatLng(0.0, 0.0),
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true
	}
	map = new google.maps.Map(map_canvas, map_options);
	map.set('styles', [
	  {
		  featureType: 'all',
		  elementType: 'all',
		  stylers: [
		  { color: '#a6a9ac' }
		]
	  }, {
		  featureType: 'all',
		  elementType: 'labels',
		  stylers: [
		  { visibility: 'off' }
		]
	  }, {
		  featureType: 'water',
		  elementType: 'all',
		  stylers: [
		  { color: '#ffffff' }
		]
	  }
	]);
	for(var key in nodes) {
		drawNode(nodes[key]);
	}	
}
google.maps.event.addDomListener(window, 'load', initialize);

function drawNode(node) {	
	var latLng = new google.maps.LatLng(node.latitude, node.longitude);
	node.overlay = new SVGOverlay(latLng, node.status, map);	
}
SVGOverlay.prototype = new google.maps.OverlayView();
/** @constructor */
function SVGOverlay(latlon, status, map) {
	this.latlon_ = latlon;
	this.map_ = map;
	this.div_ = null;
	switch(status) {
		case 'failboot':
			this.color = 'B1020B';
			break;
		case 'warning':
			this.color = 'd2ff11';
			break;
		default:
			this.color = '02B183';
			break;
	}
	this.setMap(map);
}

SVGOverlay.prototype.onAdd = function () {

	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.innerHTML = div.innerHTML + '<svg width="100px" height="100px"><g transform="translate(50,50)"><g><path d="M 0 -8 a 8 8 0 1 0 0.00001 0" fill="#'
					+ this.color +'" stroke="' + this.color + '" linejoin="round" stroke-width="1" fill-opacity="0.8" stroke-opacity="0.3"></path><animateTransform attributeType="xml" attributeName="transform" type="scale" values="1;5;4;3;2;1" dur="1s" fill="freeze" /> </g> </g> </svg>'

	this.div_ = div;

	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
}

SVGOverlay.prototype.draw = function () {
	var overlayProjection = this.getProjection();
	var div = this.div_;
	var latLg = overlayProjection.fromLatLngToDivPixel(this.latlon_);
	div.style.left = latLg.x - 50 + 'px';
	div.style.top = latLg.y - 50 + 'px';
	div.style.width = '100px';
	div.style.height = '100px';

}

SVGOverlay.prototype.onRemove = function () {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
}

