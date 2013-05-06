/*
概要:
横方向に順番に配置されたオブジェクト(ex:アウトライン化した文字とか)を、円に巻き付ける様に並べ直す。

使い方:
レイヤー内に下記の様にオブジェクトを並べる

	巻き付け対象オブジェクトN
		:
	巻き付け対象オブジェクト2
	巻き付け対象オブジェクト1
	円の中心点を示すオブジェクト(円型シェイプなど) : center

y: 巻き付け対象オブジェクトの平均y座標を通る水平線
x: center の中心を通る垂直線
の交点が「巻き付け開始位置」となる。

centerを中心に、 center-巻き付け開始位置 を半径とする円に、
各巻き付け対象オブジェクトを巻き付ける。
*/

function main() {
	if ( app.selection.length < 2 ) {
		alert("中心点となるオブジェクトと、1つ以上の巻き付け対象オブジェクトを選択して下さい");
		return;
	}

	var center  = Point.newFromItem(app.selection[app.selection.length - 1]);

	var average_y = 0;
	for ( var i = 0; i < app.selection.length-1; i++ ) {
		var center_object = Point.newFromItem(app.selection[i]).diff(center);
		average_y += center_object.y;
	}
	average_y /= app.selection.length-1;

	var y_direction = average_y.y < 0 ? -1 : 1;
	var base_radius = Math.abs(average_y);
	var wrap_start  = y_direction * Math.PI / 2;

	for ( var i = 0; i < app.selection.length-1; i++ ) {
		var center_object = Point.newFromItem(app.selection[i]).diff(center);
		var radi = Math.abs(center_object.y);
		var argu = wrap_start - y_direction * center_object.x / base_radius;
		Point.newUnit10Vector().rotate(argu).multi(radi).add(center).applyToItem(app.selection[i]);
		app.selection[i].rotate( -( argu*180/Math.PI - y_direction*90 ) );
	}
}

// the Point object represents both point at coordination (x,y) or vector with component (x y).
function Point(x, y) {
	this.x = x;
	this.y = y;
	return this;
}
Point.newFromItem = function(item) { // new Point from Illustrator PageItem object
	return new Point(
		  item.position[0] + item.width/2, 
		- item.position[1] + item.height/2
	);
};
Point.newUnit10Vector = function() { // new Point represents unit vector with coordination (1,0)
	return new Point(1,0);
};
Point.prototype.applyToItem = function(item) { // apply Point to Illustrator PageItem object as its coordination
	item.translate(
		this.x -   (item.position[0] + item.width/2) , 
		- ( this.y - (- item.position[1] + item.height/2) )
	);
}
Point.prototype.diff = function(b) { // = this - b
	return new Point(this.x - b.x, this.y - b.y);
}
Point.prototype.add = function(b) { // = this + a
	return new Point(this.x + b.x, this.y + b.y);
}
Point.prototype.multi = function(a) { // = a * this
	return new Point(a * this.x, a * this.y);
}
Point.prototype.innnerProduct = function(b) { // = this ・ b
	return this.x * b.x + this.y * b.y;
}
Point.prototype.rot90 = function(){ // rotate +90 degree
	return new Point(-this.y, this.x);
}
Point.prototype.rotate = function(rad){ // rotate rad (radian)
	return new Point(
		this.x * Math.cos(rad) - this.y * Math.sin(rad), 
		this.x * Math.sin(rad) + this.y * Math.cos(rad), 
	);
}
Point.prototype.length = function(){ // return length of this object
	return Math.sqrt( this.x*this.x + this.y*this.y );
}
Point.prototype.argument = function(){ // return argument of this this object
	return Math.atan( this.y / this.x ) + ( this.x < 0 ? Math.PI : 0 );
}
Point.prototype.toString = function(){
	return this.x + "," + this.y;
}

main();

