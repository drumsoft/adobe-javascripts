//Illustrator 面付けスクリプト

/*
ai-pdf-imposition.js - impose PDF pages on Illustrator ai file.(Script for Adobe Illustrator)
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
//指定の印刷所がPDF入稿…他InDesignから出せるあらゆる入稿に対応してなくて（えー）
//自分で面付けするために作成したスクリプト

//【使い方】
// 0. InDesign等で原稿PDFファイルを作成しておく
// 1. settings を書き換える
// 2. Illustrator でこのスクリプトを起動する

//----------------------------------settings
//面付けルール
// 用紙の表と裏に対して、 見開き2P x 横2スプレッド x 縦4行 の面付けを行う
// 行の先頭の "f":"r" は面付けの 正方向 逆方向 を示す
var rule=[
[	["r",[21,20],[29,28]],	//表
	["f",[24,17],[32,25]],
	["r",[ 5, 4],[13,12]],
	["f",[ 8, 1],[16, 9]]	],
[	["r",[ 7, 2],[15,10]],	//裏
	["f",[ 6, 3],[14,11]],
	["r",[23,18],[31,26]],
	["f",[22,19],[30,27]]	]
];

//読み込み元 PDF ファイル
var src_pattern = "~/hogehoge.pdf";
//出力設定(#1,#2 は 連番,表裏 へ置き換えられる)
var dst_pattern = "~/impose_#1_#2.ai";

var prefs = {
	page : [148,210], //1ページの紙のサイズ 横 縦
	bleed : [3,3,0,3], //裁ち落としサイズ 天 地 ノド 小口
	paper : [636,939], //面付け先用紙サイズ 横 縦
	pmargin : [20,25], //面付けマージン 横 縦
	poffset : [12,12,12,12], //面付けオフセット(天地左右)
	trimmark : 12.5    //トリムマークのサイズ
};

//トリムマークのカラー設定
var trimMarkColor = new CMYKColor();
trimMarkColor.black = 100.0;

userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS;

//--------------------------------------------- 面付け処理スタート

var gcount = 0;
mapwithrule(rule, 0, src_pattern, dst_pattern);
mapwithrule(rule, 32, src_pattern, dst_pattern);
mapwithrule(rule, 64, src_pattern, dst_pattern);

//--------------------------------------------------- 関数

// mm を pt に変換
function pt(mm){
	return mm * 72 / 25.4;
}

//面付け先ドキュメント adoc に PDF path, page の内容をコピーする
//面付け先での top left を指定する。
function embedItem(adoc, path, page, aleft, atop, isReverse) {
	var width =  pt(prefs.page[0]+prefs.bleed[2]+prefs.bleed[3]);
	var height = pt(prefs.page[1]+prefs.bleed[0]+prefs.bleed[1]);
	//オープン
	app.preferences.PDFFileOptions.pageToOpen = page;
	var pdf = open(new File(path), DocumentColorSpace.CMYK);
	var pdflayer = pdf.layers[0];

	//全体に非印刷オブジェクトを被せる
	var h = pt(prefs.page[1]+prefs.bleed[0]+prefs.bleed[1]);
	pObj = pdflayer.pathItems.rectangle(height,0,width,height);
	pObj.filled = false;
	pObj.stroked = false;

	//オブジェクトをグループ化
	var grouped = pdflayer.groupItems.add();
	each(pdflayer.pageItems, function(itm){
		if (itm.parent === pdflayer && itm !== grouped) itm.move(grouped, ElementPlacement.PLACEATBEGINNING);
	});
	//回転
	if (isReverse) {
		grouped.translate(-width,-height,true,true,true,true);
		grouped.rotate(180,true,true,true,true,Transformation.DOCUMENTORIGIN);
	}
	//面付け先ドキュメントにコピー
	var offsettop = grouped.top - height;
	var offsetleft = grouped.left;
	var duped = grouped.duplicate(adoc, ElementPlacement.PLACEATBEGINNING);
	pdf.close( SaveOptions.DONOTSAVECHANGES );
	duped.left = pt(aleft) + offsetleft;
	duped.top  = pt(atop) + offsettop;
}

//トリムマーク作成
function trimmark(adoc, left, bottom, right, top) {
	var tm = adoc.groupItems.add();
	tm.name = "Trimmark";

	function line (pointArray) {
		each(pointArray, function(a){a[0]=pt(a[0]),a[1]=pt(a[1])});
		pObj = tm.pathItems.add();
		pObj.setEntirePath(pointArray);
		pObj.filled = false;
		pObj.stroked = true;
		pObj.strokeWidth = 0.3;
		pObj.strokeColor = trimMarkColor;
	};
	function corner (xtrim, xbleed, xbound, ytrim, ybleed, ybound) {
		line([[xtrim,ybound], [xtrim,ybleed], [xbound,ybleed]]);
		line([[xbleed,ybound], [xbleed,ytrim], [xbound,ytrim]]);
	};
	function centerVert (x, ybleed, ybound) {
		line([[x,ybleed], [x,ybound]]);
	};
	function centerHori (y, xbleed, xbound) {
		line([[xbleed,y], [xbound,y]]);
	};

	corner(left, left-prefs.bleed[3], left-prefs.trimmark, 
	       bottom, bottom-prefs.bleed[1], bottom-prefs.trimmark);
	corner(left, left-prefs.bleed[3], left-prefs.trimmark, 
	       top, top+prefs.bleed[0], top+prefs.trimmark);
	corner(right, right+prefs.bleed[3], right+prefs.trimmark, 
	       bottom, bottom-prefs.bleed[1], bottom-prefs.trimmark);
	corner(right, right+prefs.bleed[3], right+prefs.trimmark, 
	       top, top+prefs.bleed[0], top+prefs.trimmark);
	centerHori((bottom+top)/2, left-prefs.bleed[3], left-prefs.trimmark);
	centerHori((bottom+top)/2, right+prefs.bleed[3], right+prefs.trimmark);
	centerVert((left+right)/2, bottom-prefs.bleed[1], bottom-prefs.trimmark);
	centerVert((left+right)/2, top+prefs.bleed[0], top+prefs.trimmark);
	centerVert((left+3*right)/4, bottom-prefs.bleed[1], bottom-prefs.trimmark);
	centerVert((left+3*right)/4, top+prefs.bleed[0], top+prefs.trimmark);
	centerVert((3*left+right)/4, bottom-prefs.bleed[1], bottom-prefs.trimmark);
	centerVert((3*left+right)/4, top+prefs.bleed[0], top+prefs.trimmark);
}

//コレクションの内容それぞれを引数に code を実行, 逆順実行する
function each(collection, code) {
	for(var i=collection.length-1; i>=0; i--) {
		code(collection[i]);
	}
}

// 見開き2ページ分の埋め込みを実行
// 埋め込み先ドキュメント, 2ページ分埋め込みルール, PDFファイルパス, PDFページオフセット
// offsetx,offsety:埋め込み位置オフセット(左下角の裁断位置を指定)
// isReverse:上下反転指定
function embed2page(adoc, arule, path, pageoffset, offsetx, offsety, isReverse) {
	embedItem(adoc, path, arule[0]+pageoffset
		, offsetx - prefs.bleed[3]
		, offsety + prefs.page[1] + prefs.bleed[0]
		, isReverse);

	embedItem(adoc, path, arule[1]+pageoffset
		, offsetx + prefs.page[0] - prefs.bleed[2]
		, offsety + prefs.page[1] + prefs.bleed[0]
		, isReverse);

	trimmark(adoc, offsetx, offsety, offsetx+prefs.page[0]*2, offsety+prefs.page[1]);
}


// 面付けメイン処理
function mapwithrule(arule, offset, srcpat, dstpat) {
	for(var side=0; side<2; side++) { //表裏
		// new document
		var mydoc = app.documents.add(DocumentColorSpace.CMYK, pt(prefs.paper[0]), pt(prefs.paper[1]) ,1);
		for(var line=0; line<arule[side].length; line++) { //行
			var direction = arule[side][line][0];
			for(var row=1; row<arule[side][line].length; row++) { //列
				embed2page(mydoc, arule[side][line][row], src_pattern, offset 
		,	               prefs.poffset[2]+(prefs.page[0]*2+prefs.pmargin[0]) * (row-1) 
		,	prefs.paper[1]-prefs.poffset[0]-(prefs.page[1]  +prefs.pmargin[1]) * line - prefs.page[1] 
		,		direction == "r");
			}
		}
		//全てアウトライン作成
		each(mydoc.textFrames, function(tf){ tf.createOutline(); });
		// save file
		var savfile = dstpat.replace("#1", offset+1).replace("#2", side==0 ? "a" : "b");
		var so = new IllustratorSaveOptions();
		so.compatibility = Compatibility.ILLUSTRATOR13;
		so.embedLinkedFiles = true;
		mydoc.saveAs(File(savfile), so);
		mydoc.close();
	}
}

