var Util = {

	replace_breaks: function(s){
		return s.replace( /\n/g, '<br/>')
	},

	get_month_string: function(n){
			var m = '';
			switch( n ){
				case 0:
					m = 'January';
					break;
				case 1:
					m = 'February';
					break;
				case 2:
					m = 'March';
					break;
				case 3:
					m = 'April';
					break;
				case 4:
					m = 'May';
					break;
				case 5:
					m = 'June';
					break;
				case 6:
					m = 'July';
					break;
				case 7:
					m = 'August';
					break;
				case 8:
					m = 'September';
					break;
				case 9:
					m = 'October';
					break;
				case 10:
					m = 'November';
					break;
				case 11:
					m = 'December';
					break;
				default:
					m = 'wat?';
			}

			return m;
		},

		get_date_suffix: function(n){
			var suf = '';
			switch( n ){
				case 1:
				case 21:
				case 31:
					suf = 'st';
					break;
				case 2:
				case 22:
					suf = 'nd';
					break;
				case 3:
				case 23:
					suf = 'rd';
					break;
				default:
					suf = 'th';
			}
			return suf;
		},

		date_format: function(d){
			var tempdate = new Date(d);

			var monthnum = tempdate.getMonth();
			var daynum = tempdate.getDate();
			var yearnum = tempdate.getFullYear();
			var hournum = tempdate.getHours();

			var ts = '';

			if( hournum > 12 ){
				hournum = hournum - 12;
				ts = 'pm';
			} else {
				ts = 'am';

				if( hournum == 0 ){
					hournum = 12;
				}
			}

			var minnum = tempdate.getMinutes();
			if( minnum < 10 ){
				minnum = '0' + minnum;
			}


			var monthstring = Util.get_month_string(monthnum);
			var date_suffix = Util.get_date_suffix(daynum);

			return '' + monthstring + ' ' + daynum + date_suffix + ', ' + yearnum + ' ' + hournum + ':' + minnum + ts;
		},

		get_selected_text: function() {
		    var html = "";
		    if (typeof window.getSelection != "undefined") {
		        var sel = window.getSelection();
		        if (sel.rangeCount) {
		            var container = document.createElement("div");
		            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
		                container.appendChild(sel.getRangeAt(i).cloneContents());
		            }
		            html = container.innerHTML;
		        }
		    } else if (typeof document.selection != "undefined") {
		        if (document.selection.type == "Text") {
		            html = document.selection.createRange().htmlText;
		        }
		    }
		    return html;
		},

		formatPost: function(p){
			p = Util.htmlEncode(p);
			p = Util.replace_breaks(p);
			p = Util.replacePreviewTags(p);
			p = emoji.replace_unified(p);
			p = emoji.replace_colons(p);
			return p;
		},

		replacePreviewTags: function(t){
			var tags = [
				{ t: 'b', s: 'bold' },
				{ t: 'i', s: 'italic' },
				{ t: 'u', s: 'underline' },
				{ t: 'size', s: 'font-size', v: true },
				{ t: 'img', sc: true, v: true }
			];

			for( var i = 0; i < tags.length; i++ ){
				if( !tags[i].v ){
					t = t.replace( RegExp('\\['+tags[i].t+'\\]','g'), '<span class="'+tags[i].s+'">');
					t = t.replace( RegExp('\\[\\/'+tags[i].t+'\\]','g'), '</span>');
				} else {
					
					var r = '\\[' + tags[i].t + '=(.*?)\\]';
					var regExp = RegExp(r, 'g');

					var test;
					var matches = [];
					

					while ((test = regExp.exec(t)) !== null){
						matches.push(test);
					}
					// console.log(matches);

					for( var j = 0; j < matches.length; j++ ){
						if( tags[i].t != 'img' ){
							var rep = RegExp('\\[' + tags[i].t + '=' + matches[j][1] + '\\]');
							t = t.replace(rep, '<span style="' + tags[i].s + ':' + matches[j][1] + 'px;">')
						} else {
							var regExp = RegExp('\\[img=' + matches[j][1] + '\\]','g');
							if( document.location.hostname == 'localhost' ){
								t = t.replace( regExp, '<img src="http://somanywords.vexterity.com' + matches[j][1] + '" />' );
							} else {
								t = t.replace( regExp, '<img src="' + matches[j][1] + '" />' );
							}
							
						}
						
					}
					
					if( !tags[i].sc ){
						t = t.replace( RegExp('\\[\\/'+tags[i].t+'\\]','g'), '</span>');
					}
					
				}
				
			}

			return t;
		},

		htmlEncode: function(str) {
		    return String(str)
	            .replace(/&/g, '&amp;')
	            .replace(/"/g, '&quot;')
	            .replace(/'/g, '&#39;')
	            .replace(/</g, '&lt;')
	            .replace(/>/g, '&gt;');
		}

}







