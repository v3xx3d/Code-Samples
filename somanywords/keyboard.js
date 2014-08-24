/* our keyboard functions */
function keystrokes(key){
	/* letters */
	if( key > 64 && key < 91 ){


		var chartest = String.fromCharCode(key);
		
		
		var nextindex = nextvalidindex(chartest);
		if( nextindex == -1 ){
			return false;
		}

		
		last = nextindex;
		first = alltheindexes[0];
		

		$('#cell'+nextindex).removeClass('unselected').addClass('selected');
		allthetexts += chartest;
		$('#curword').attr('value', allthetexts);
		selected[nextindex] = true;
		alltheindexes.push(nextindex);

		console.log(alltheindexes)
		console.log(allthetexts)
		console.log($('#curword').attr('value'));

	/* backspace */
	}else if( key == 8 ){

		if( allthetexts.length > 0 ){
			$('#cell'+alltheindexes[alltheindexes.length-1]).removeClass('selected').addClass('unselected');
			selected[alltheindexes[alltheindexes.length-1]] = false;
			allthetexts = allthetexts.substring(0, allthetexts.length -1);
			$('#curword').attr('value', allthetexts);
			alltheindexes.pop();
		}

	/* enter */
	}else if( key == 13 ){
		if( allthetexts.length >= minwordlength ){
			submitword();
		}
	}
}

function nextvalidindex(let){
	for( f = 0; f < board.length; f++){
		if( let == board[f] && isadjacent(f) && !selected[f] ){
			return f;
		}
	}

	for( g = allthetexts.length -1; g > -1; g++ ){
		var let2 = allthetexts[g];
		var dex2 = alltheindexes[g];

		for( h = dex2; h < board.length; h++ ){
			
		}
	}

	return -1;
}


// if( alltheindexes.length == 0 ){
			
		// 	getindexes(chartest);
			
		// 	if( validindexes.length > 0){
		// 		for( s = 0; s < validindexes.length; s++){
		// 			selected[validindexes[s]] = true;
		// 			var tempstring3 = '#cell' + validindexes[s];
		// 			$(tempstring3).removeClass(hoverclass).addClass('selected');
		// 		}
				
		// 		if( validindexes.length == 1){
		// 			last = validindexes[0];
		// 			alltheindexes.push(validindexes[0]);
		// 		}
				
		// 		allthetexts += chartest;
		// 		$('#curword').attr('value', allthetexts);
		// 	}
		// } else if( alltheindexes.length == 1 ){
		// 	if( validindexes.length > 1){
				
		// 	} else {
				
				
		// 		if( validindexes.length > 0){
					
		// 			getindexes(chartest);
					
		// 			if( validindexes.length == 1){
		// 				last = validindexes[0];
		// 				alltheindexes.push(validindexes[0]);
		// 			}
					
		// 			allthetexts += chartest;
		// 			$('#curword').attr('value', allthetexts);
		// 		}
		// 	}
		// } else {
		
		// }