//開いている画像にファイル名をキャプションとして重ねるスクリプト

/*
ps-filename2caption.js - overlay file names as caption on images.(Script for Adobe Photoshop)
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
//ファイル名をキャプションとして画像に重ねます

//【使い方】
// 0. 画像ファイルの名前を調整しておく
// 1. settings を書き換える
// 2. Photoshop でこのスクリプトを起動する

//----------------------------------settings

//ファイル名をタイトルに変換するルール
function getTitleFromFileName(fname) {
	return fname.replace(/(.+)\.\w+$/, "$1");
}

var bottomMargin = 20; //画像下端からキャプションまでのマージン
var fontSize = 28;     //キャプションのサイズ
var fontName = app.fonts.getByName("HiraKakuProN-W6"); //フォント名
var fontColor = new SolidColor(); //キャプションの色設定
	fontColor.rgb = new RGBColor;
	fontColor.rgb.red = 255;
	fontColor.rgb.green = 255;
	fontColor.rgb.blue = 255;

//--------------------------------------------------- 関数

//ドキュメント毎の処理
function doDoc(doc) {
	app.activeDocument = doc;
	var artLayerRef = doc.artLayers.add();
	artLayerRef.kind = LayerKind.TEXT;

	var textItemRef = artLayerRef.textItem;
	textItemRef.contents = getTitleFromFileName(doc.name);

	textItemRef.position = [
		i2u(Math.floor(u2i(doc.width) / 2)), 
		i2u(u2i(doc.height) - bottomMargin - fontSize)
	];

	textItemRef.justification = Justification.CENTER;

	textItemRef.size = fontSize;
	textItemRef.color = fontColor;
	textItemRef.font = fontName.postScriptName;

	artLayerRef.applyStyle("基本ドロップシャドウ");

	// 画像を上書き保存するようにする事もできます。
//	doc.save();
//	doc.close();
}

function u2i(unit) {
	return unit.as("px");
}
function i2u(val) {
	return UnitValue(val, "px");
}

//メイン
function main() {
	var originalUnit = preferences.rulerUnits;
	preferences.rulerUnits = Units.PIXELS;

	each(app.documents, doDoc);

	app.preferences.rulerUnits = originalUnit;
}

//コレクションの内容それぞれを引数に code を実行, 逆順実行する
function each(collection, code) {
	for(var i=collection.length-1; i>=0; i--) {
		code(collection[i]);
	}
}

//--------------------------------------------- 読み込み処理スタート
main();
