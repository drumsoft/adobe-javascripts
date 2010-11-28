//元画像をすこしずつずらしてタイル化するスクリプト

/*
ps-slippytile.js - created slippy tiled pattern.(Script for Adobe Photoshop)
Copyright (C) 2010 Haruka Kataoka (@hrk)

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

//【概要】
//元画像の選択領域を、すこしづつずらしながらタイル状にコピーした画像を作るスクリプト

//【使い方】
// 1. settings を書き換える
// 2. Photoshop で元画像ファイルを開く
// 3. タイル化したい領域を選択する。なるべく小さめの領域がオススメ。
// 4. このスクリプトを起動する。
// ※（コピー元領域が kInterval ピクセルずつ右下へずれていきます）

//----------------------------------settings
var kInterval = new UnitValue ("3 px"); //コピー領域のずらし量


// If a docuement is open
if ( app.documents.length > 0 ) {
	var selected = true;
	try {
		app.activeDocument.selection.translate(0,0);
	} catch(e) {
		selected = false;
	}
	if (selected) {
		main(app.activeDocument);
	}else{
		alert("Please select a region.");
	}
}else{
	alert("Please open any document and select a region.");
}

function main(doc) {
	UnitValue.baseUnit = UnitValue(1/doc.resolution, "in");
	var sel = doc.selection;

	try { sel.copy(true) } catch(e) { sel.copy(false) }
	var tempLayer = doc.paste(false);
	var selx = tempLayer.bounds[0];
	var sely = tempLayer.bounds[1];
	var intx = tempLayer.bounds[2] - selx;
	var inty = tempLayer.bounds[3] - sely;
	var initselx = selx;
	tempLayer.remove();

	var dLayer = doc.artLayers.add();
	doc.artLayers.add();

	var posy = new UnitValue ("0 px");
	while(posy < doc.height) {
		var posx = new UnitValue ("0 px");
		selx = initselx;
		while(posx < doc.width) {
			sel.select([[selx,sely], [selx,sely+inty],
			           [selx+intx,sely+inty], [selx+intx,sely]]);
			dLayer.visible = false;
			try { sel.copy(true) } catch(e) { sel.copy(false) }
			dLayer.visible = true;
			var newLayer = doc.paste(false);
			newLayer.translate( posx - newLayer.bounds[0], posy - newLayer.bounds[1]);
			newLayer.merge();
			posx += intx;
			selx += kInterval;
		}
		posy += inty;
		sely += kInterval;
	}
}
