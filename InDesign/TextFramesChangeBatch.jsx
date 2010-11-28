//連結されたテキストフレーム（フレームグリッド）の設定を一括変更する InDesign スクリプト

/*
TextFramesChangeBatch.jsx - change the configuration of linked TextFrames(FrameGrids).(Script for Adobe InDesign)
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
//リンクされたテキストフレーム（フレームグリッド）の設定を一括変更するスクリプトです。
//書籍のInDesignドキュメントを電子書籍版に作り替えるために作成しました。

//【使い方】
// 1. setting を書き換える
// 2. InDesignで設定を変更したいテキストフレームの先頭フレームを選択する
// 3. InDesignのスクリプトパネルから、このスクリプトを実行する

//【メモ】
//Adobe用のスクリプト書きます（有料） hrk8 /at/ drumsoft.com まで

//------------------------------------------- setting
function setting(o) {
	o.textFramePreferences.textColumnCount = 1;

	o.parentStory.gridData.characterAki = 0.75;
	o.parentStory.gridData.lineAki = 12;
	o.parentStory.gridData.pointSize = 15;

	o.visibleBounds = ["15mm", "14.204mm","192.535mm","133.796mm"];
}


main();

function main(){
	if (app.documents.length == 0){
		alert ("Please open a document, select an object, and try again.");
		return;
	}
	if (app.selection.length == 0){
		alert ("Please select an object and try again.");
		return;
	}

	for(var myCounter = 0;myCounter < app.selection.length; myCounter++){
		switch (app.selection[myCounter].constructor.name){
			case "TextFrame":
				doEdit(app.selection[myCounter]);
				break;
		}
	}
}

function doEdit(frame) {
	//enumerate textframe links
	var e, i = 0;
	for(e = frame; e; e = e.nextTextFrame) {
		setting(e);
		i++;
	}

	alert(i + "フレームの設定を変更しました");
}

