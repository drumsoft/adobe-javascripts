//PDFファイルの各ページを製本用に印刷できるように InDesign ドキュメント上に貼付けてページ順を再構成するための InDesign スクリプト。

/*
pdf2book.jsx - reconstruct your PDF file on a InDesign document to make books.(Script for Adobe InDesign)
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
//PDFの書籍データを
// 表─┬─┐裏─┬─┐
// │１│４││３│２│
// └─┴─┘└─┴─┘
//みたいな順番で倍のサイズの用紙に割り付ける事で、印刷-製本をしやすくします。
//InDesignの「ブックレットをプリント」でも同じ事ができますが、直接印刷する事しかできません。PDF化して配布し他の所で印刷してもらいたい場合は、このスクリプトを使いましょう。

//【使い方】（A5の本の例, 他のサイズでもいけます）
// 0. A5,縦,裁ち落とし無し の原稿PDFを用意する
// 1. setting を書き換える pdfPath を 0 で準備したものにする。
// 2. InDesignで A4,横,見開きページではない,裁ち落とし無し,必要なページ数 の新規ドキュメントを作成する
// 3. InDesignのスクリプトパネルから、このスクリプトを実行する

// ※ 2. の「必要なページ数」は setting の rule 1,2 では原稿ページ数の 1/4。 rule 3 では原稿ページ数の 1/2 です。

//【メモ】
//Adobe用のスクリプト書きます（有料） hrk8 /at/ drumsoft.com まで

//------------------------------------------- setting
// source PDF file.
var pdfPath = "~/hogehoge.pdf";

//貼り付けルール
// PDF のページの貼付け順を数字で示す
// 貼付けルールは末尾に行くとループして、その際ページ読み出しのオフセット値(初期値は1)が rulePageSkip 増える。

//var rule = [0,3]; //rule 1: print front side
//var rule = [2,1]; //rule 2: print back side
var rule = [0,3,2,1]; //rule 3: print front+back
rulePageSkip = 4; //page skip number when rule loops.

// 例: 上記の rule 1 では、ページ 1,4 を貼付けたら オフセット値が 4 上昇して次は ページ 5,8 を貼り付け。以下 9,12  13,16  ... と続く。


main();

function main(){
	if (app.documents.length == 0){
		alert ("Please open a document, select an object, and try again.");
		return;
	}

	place(pdfPath, app.activeDocument);
}

function place(pdfPath, aDocument) {
	app.pdfPlacePreferences.pdfCrop = PDFCrop.cropMedia;

	var pdfPageOffset = 1;


	for (counter = 0; Math.floor(counter / 2) < aDocument.pages.length; counter++) {
		var pdfRelPage = rule[counter % rule.length];
		var page = aDocument.pages.item(Math.floor(counter / 2));

		//用紙の半分の位置を計算してそこに配置（右ページの位置）
		var halfWidth = (page.bounds[1]+page.bounds[3])/2;
		app.pdfPlacePreferences.pageNumber = pdfPageOffset + pdfRelPage;
		var pdfItem = page.place(File(pdfPath), [halfWidth,0])[0];

		switch(counter % 2) {
		  case 0: //左ページの場合、PDFのページ幅分左にずらす
			var pdfBound = pdfItem.visibleBounds;
			pdfItem.move(null,[-(pdfBound[3] - pdfBound[1]),0]);
			pdfItem.fit(FitOptions.frameToContent);
			break;
		}

		if ((counter+1) % rule.length == 0)
			pdfPageOffset += rulePageSkip;
	}
}

