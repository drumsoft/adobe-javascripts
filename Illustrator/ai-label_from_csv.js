//CSVデータからラベルを作成するスクリプト

/*
ai-label_from_csv.js - create labels from CSV file.(Script for Adobe Illustrator)
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
//CSVファイルからラベルを作成するスクリプトです
//CSVファイルの1行目をフィールド名として扱います。
//スクリプトは、illustratorドキュメントからフィールド名と同じ名前のテキストを探し、フィールドに対応するデータを入力します。
//一枚のドキュメントに複数の同名フィールドがある場合、見つかった順番にCSVの各行のデータを入力して行きます。
//※順番がでたらめにならない様に、ラベル1枚分毎にオブジェクトをグループ化して置く事をおすすめします。
//データを埋められたドキュメントは指定された連番ファイルに保存されます。（CSVの行数がドキュメント内の入力対象テキストより多い場合は、複数のファイルが保存されます）元のドキュメントに上書きはされません。
//※データの文字数が多く、折り返しによりラベルに元々入っている行数より多くなる場合は文字が自動縮小されます。最大n行まで表示させたい項目には、あらかじめn行分のダミーテキストを入力しておいて下さい。

//【使い方】
// 1. CSVファイルを作成しておく
// 2. ラベルひな形となる Illustrator ドキュメントを作成し保存する
// 3. 下記の settings を調整する
// 4. ひな形 Illustrator ファイルを開いたままこのスクリプトを起動する

//----------------------------------settings
//設定
var target_dir = "~/";
var target_name = "hogehoge"; //CSVファイルのファイル名
//読み込み元 CSV ファイル, 区切り記号, クォート記号
var src_data = target_dir + target_name + ".csv";
var src_delimiter = "\t";
var src_quote = "\"";
//出力ファイルパス(#1は連番へ置き換えられる)
var dst_pattern = target_dir + "output/" + target_name + "_#1.ai";

//保存時のファイル連番開始番号
var fileNumber = 1;
//保存時の保存設定
var so = new IllustratorSaveOptions();
//so.compatibility = Compatibility.ILLUSTRATOR13;
//so.embedLinkedFiles = true;

//最小フォントサイズ
var minFontSize = 5;
//テキストが入りきらない場合に文字サイズの自動縮小が行われるが、その際の最小サイズを指定する

userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS;

//--------------------------------------------------- 関数

//メイン処理
function generate_tags(adoc, datapath, delimiter, dstpath) {
	try {
		var csv = new CSVParser(datapath, delimiter);
	}catch(e){
		alert(e);
		return;
	}

	while(!csv.eof()){
		var rec = csv.next();
		var texts = adoc.textFrames;
		var repeatMarker = {};
		for(i=0,l=texts.length; i<l; i++){
			if (texts[i].name in rec) {
				if (texts[i].name in repeatMarker) {
					repeatMarker = {};
					if (csv.eof()) break;
					rec = csv.next();
				}
				repeatMarker[texts[i].name] = 1;
				var maxLines = texts[i].lines.length;
				texts[i].contents = rec[texts[i].name];
				if (texts[i].kind == TextType.AREATEXT) {
					while(texts[i].lines.length > maxLines) {
						texts[i].textRange.characterAttributes.size -= 1;
						if(texts[i].textRange.characterAttributes.size <= minFontSize) break;
					}
				}
			}
		}
		adoc = pageFinal(adoc, dstpath);
	}
	csv.close();
}

function pageFinal(adoc, dstpath) {
	if (dstpath == null || dstpath == "") {	// print
		
	}else{	// save file
		var path = adoc.fullName;
		var savfile = dstpath.replace("#1", fileNumber++);
		adoc.saveAs(File(savfile), so);
		adoc.close();
		app.open(path);
		adoc = app.activeDocument;
	}
	return adoc;
}

Array.prototype.map = function(fun) {
	var r = new Array(this.length);
	for(var i=0,l=this.length; i<l; i++) {
		r[i] = fun(this[i]);
	}
	return r;
}

function get_unquoter(quote) {
	return function(str) {
		var tail = str.length - 1;
		if (str.charAt(0) == quote && str.charAt(tail) == quote) {
			return str.substring(1,tail);
		}
		return str;
	}
}

function CSVParser(path, delimiter) {
	this.delimiter = delimiter;
	this.srcfile = new File(path);
	if (!this.srcfile.open("r")) {
		throw "cannot open " + path + ". (" + this.srcfile.error + ")";
	}
	if (this.srcfile.eof) {
		throw path + " has no record.";
	}
	this.columns = this.srcfile.readln().split(this.delimiter).map(get_unquoter(src_quote));
}
CSVParser.prototype.next = function(){
	if (this.srcfile.eof) return null;
	var record = {};
	var clmns = this.srcfile.readln().split(this.delimiter).map(get_unquoter(src_quote));
	for(var i=0,l=Math.min(clmns.length, this.columns.length); i<l; i++){
		record[this.columns[i]] = clmns[i];
	}
	return record;
}
CSVParser.prototype.eof = function(){
	return this.srcfile.eof;
}
CSVParser.prototype.close = function(){
	this.srcfile.close();
}

//--------------------------------------------- 読み込み処理スタート
generate_tags(app.activeDocument, src_data, src_delimiter, dst_pattern);
