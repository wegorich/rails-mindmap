/* 
 * Some code taken from raphaelsjs.com example 
 * Rest of work Piero Bozzolo
 */
OpenMindMap.connection.linear  = function(obj1, obj2, line, bg, omm, title, direction) {
	var paper = omm.paper;
	paper.map = omm;	
	
	if (obj1.line && obj1.from && obj1.to) {
		line = obj1;
		obj1 = line.from;
		obj2 = line.to;
	}
	var bb1 = obj1.getBBox();
	var bb2 = obj2.getBBox();

	var p = [ {	x : bb1.x + bb1.width / 2,	y : bb1.y - 1 }, 
	          {	x : bb1.x + bb1.width / 2,	y : bb1.y + bb1.height + 1 }, 
	          {	x : bb1.x - 1,				y : bb1.y + bb1.height / 2 },
		      {	x : bb1.x + bb1.width + 1, 	y : bb1.y + bb1.height / 2 },
		      {	x : bb2.x + bb2.width / 2, 	y : bb2.y - 1 			   },
		      {	x : bb2.x + bb2.width / 2, 	y : bb2.y + bb2.height + 1 },
		      {	x : bb2.x - 1,				y : bb2.y + bb2.height / 2 },
		      {	x : bb2.x + bb2.width + 1,	y : bb2.y + bb2.height / 2 } 
		     ];
	
	var d = {}, dis = [];
	for ( var i = 0; i < 4; i++) {
		for ( var j = 4; j < 8; j++) {
			var dx = Math.abs(p[i].x - p[j].x), dy = Math.abs(p[i].y - p[j].y);
			if ((i == j - 4) ||
					(((i != 3 && j != 6) || p[i].x < p[j].x)
							&& ((i != 2 && j != 7) || p[i].x > p[j].x)
							&& ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
				dis.push(dx + dy);
				d[dis[dis.length - 1]] = [ i, j ];
			}
		}
	}
	if (dis.length == 0) {
		var res = [ 0, 4 ];
	} else {
		res = d[Math.min.apply(Math, dis)];
	}
	var x1 = p[res[0]].x;
	var y1 = p[res[0]].y;
	var x2 = p[res[1]].x;
	var y2 = p[res[1]].y;
	var path = ["M", x1, y1, "L", x2, y2].join(",");

	if (line && line.line) {
		line.bg && line.bg.attr({path : path});
		line.line.attr({path : path});
	} else {
		var color = typeof line == "string" ? line : "#000";
		var strokeWidth = 1;
	
		var conn = {
			bg : bg && bg.split && paper.path(path).attr({
				stroke : bg.split("|")[0],
				fill : "none",
				"stroke-width" : strokeWidth
			}),
			line : paper.path(path).attr({
				stroke : color,
				fill : "none",
				'stroke-width': strokeWidth				
			}),
			from : obj1,
			to : obj2		
		};
		return conn;
	}
};