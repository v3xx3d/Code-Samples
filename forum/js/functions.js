var App;

$(document).ready( function(){

	App = {

		user: {},
		imageCache: [],

		init: function(){
			// if( document.location.pathname == '/'){
			// 	document.location.hash = '/login';
			// }

			App.request( 'GET', '/session-status', null, 
				function(data){
					// console.log(data);
					if( data.session ){
						console.log('user already logged in, redirecting...');
						App.user = data.user;
						console.log(App.user);
						$('body').addClass( App.user.permissions );
						$('#post_preview_name').empty().append(App.user.username);
						App.navigate('categories');
						App.get_categories();
					} else {
						App.navigate('login');
					}
				}
			)
		},

		navigate: function(page){
			if( !page || page == '' ){
				console.error( 'Navigating without a target page!');
				return;
			}

			var pageString = '#' + page;
			if( $(pageString).length ){
				$('body').attr('id', 'page_'+page );
				$('.page').removeClass('active');
				$(pageString).addClass('active');

				document.location.hash = '/' + page;
			} else {
				console.error('Page not found: ' + page );
			}
		},



		navClick: function(){
			return App.navigate( $(this).attr('data-page') );
		},



		login: function(){
			var errors = 0;
			App.clearErrors('login');

			if( $('#login input[name="username"]').val().length < 3 ){
				App.errorField('#login .field.username', 'Enter your full username');
				errors++;
			}

			if( $('#login input[name="password"]').val().length < 3 ){
				App.errorField('#login .field.password', 'Enter your full password');
				errors++;
			}

			if( !errors ){
				// form submission here
				App.request( 'POST', '/login', 
					{
						username: $('#login input[name="username"]').val(),
						password: $('#login input[name="password"]').val()
					}, 
					function(data){
						console.log(data);
						if( data.error ){
							App.errorField('#login .field.server_error', data.error);
						} else {
							App.user = data;
							$('body').addClass( App.user.permissions );
							$('#post_preview_name').empty().append(App.user.username);
							App.navigate('categories');
							App.get_categories();
						}
					}
				)
			} else return false;
		},



		signup: function(){
			var errors = 0;
			App.clearErrors('signup');

			if( $('#signup input[name="username"]').val().length < 3 || $('#signup input[name="username"]').val().length > 15 ){
				App.errorField('#signup .field.username', 'Username should be 3-15 characters: letters and numbers');
				errors++;
			}

			if( $('#signup input[name="password"]').val().length < 3 || $('#signup input[name="password"]').val().length > 15 ){
				App.errorField('#signup .field.password', 'Password should be 6 characters or more');
				errors++;
			}

			if( $('#signup input[name="confirm_password"]').val().length < 3 ){
				App.errorField('#signup .field.confirm_password', 'Confirm your password');
				errors++;
			} else if( $('#signup input[name="password"]').val() != $('#signup input[name="confirm_password"]').val() ){
				App.errorField('#signup .field.confirm_password', 'Passwords fields must match!');
				errors++;
			}

			if( $('#signup input[name="email"]').val().length < 3 ){
				App.errorField('#signup .field.email', 'Enter your email address');
				errors++;
			}

			if( !errors ){
				// form submission here
				App.request( 'POST', '/signup', 
					{
						username: $('#signup input[name="username"]').val(),
						password: $('#signup input[name="password"]').val(),
						email: $('#signup input[name="email"]').val()
					}, 
					function(data){
						console.log(data);
						if( data.error ){
							App.errorField('#signup .field.server_error', data.error);
						} else {
							App.user = data;
							$('body').addClass( App.user.permissions );
							App.navigate('categories');
							App.get_categories();
						}
					}
				)
			} else return false;
		},



		errorField: function(selector, notice){
			$(selector+' .label-danger').empty().append(notice).css('display', 'inline-block');
			$(selector+' input').addClass('error');
			$(selector+' select').addClass('error');
			$(selector+' textarea').addClass('error');
		},



		clearErrors: function(page){
			$('#' + page + ' input').removeClass('error');
			$('#' + page + ' select').removeClass('error');
			$('#' + page + ' textarea').removeClass('error');
			$('#' + page + ' .label-danger').hide();
		},

		emptyForm: function(page){
			$('#' + page + ' input').val('');
			$('#' + page + ' select').val('0');
			$('#' + page + ' textarea').val('');
			$('#' + page + ' .label-danger').hide();
		},



		request: function( type, location, data, callback ){
			// console.log(data);
			var http = new XMLHttpRequest();
			http.open(type, location, true);

			http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

			http.onloadend = function() {
				App.check_session( JSON.parse(http.responseText), callback );
			}
			http.send( JSON.stringify(data) );
		},


		check_session: function( data, cb ){
			if( data.session_timeout ){
				//do stuff here if session disappears
				alert('Your session has been lost! OH NOES! Please log back in.');
				App.navigate('login');
			} else {
				cb( data );
			}
		},



		add_category: function(){
			var errors = 0;
			App.clearErrors('add_category');

			if( $('#add_category input[name="name"]').val().length < 3 || $('#add_category input[name="name"]').val().length > 25 ){
				App.errorField('#add_category .field.name', 'Category name should be 3-25 characters');
				errors++;
			}

			if( $('#add_category textarea[name="description"]').val().length < 3 ){
				App.errorField('#add_category .field.description', 'Enter category description');
				errors++;
			}

			if( $('#add_category select[name="permissions"]').val() == 0 ){
				App.errorField('#add_category .field.permissions', 'Select category permission level');
				errors++;
			}

			if( !errors ){
				// form submission here
				App.request( 'POST', '/category', 
					{
						name: $('#add_category input[name="name"]').val(),
						description: $('#add_category textarea[name="description"]').val(),
						permissions: $('#add_category select[name="permissions"]').val()
					}, 
					function(data){
						console.log(data);
						if( data.error ){
							App.errorField('#add_category .field.server_error', data.error);
						} else {
							App.navigate('categories');
							App.emptyForm('add_category');
							App.get_categories();
						}
					}
				)
			} else return false;
		},



		get_categories: function(){
			App.request( 'GET', '/categories', null,
				function(data){
					// console.log(data);
					if( data.error ){
						console.error('Error getting categories!');
					} else {
						$('#category_wrap').empty();

						// console.log('before: ' + data);
						data.sort( function(a,b){
							var textA = a.name.toUpperCase();
						    var textB = b.name.toUpperCase();
						    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
						})
						// console.log('after: ' + data);

						for( var i = 0; i < data.length; i++ ){
							$('#category_wrap').append( App.build_category(
								data[i]._id,
								data[i].name,
								data[i].description,
								data[i].posts.length
							))
						}
					}
				}
			)
		},



		build_category: function(id, n, d, p){
			return 	'<div id="category_' + id + '" class="category">' + 
						'<h2>' + n + '</h2>' +
						'<h6>' + d + '</h6>' +
			            '<p>Posts: ' + p + '</p>' + 
			        '</div>';
		},



		add_post: function(category){
			var cat_id = category.split('_')[1];
			var errors = 0;

			console.log('adding post to category: ' + cat_id);

			App.clearErrors('add_post');

			// if( $('#add_post select[name="type"]').val() == 0 ){
			// 	App.errorField('#add_post .field.type', 'Select a post type');
			// 	errors++;
			// }

			if( $('#add_post input[name="subject"]').val().length < 3 || $('#add_post input[name="subject"]').val().length > 50 ){
				App.errorField('#add_post .field.subject', 'Subject should be 3-50 characters');
				errors++;
			}

			if( $('#add_post textarea[name="content"]').val().length < 3 ){
				App.errorField('#add_post .field.content', 'Enter category description');
				errors++;
			}

			

			if( !errors ){
				App.request( 'POST', '/category/'+cat_id+'/post',
					{
						type: 'normal',
						subject: $('#add_post input[name="subject"]').val(),
						content: $('#add_post textarea[name="content"]').val()
					},
					function(data){
						console.log(data);
						if( data.error ){
							App.errorField('#add_post .field.server_error', data.error);
						} else {
							App.emptyForm('add_post');
							App.get_posts(category);
							$('#post_preview_subject, #post_preview_content').empty();
							App.navigate('post_list');
						}
					}
				)
			}
		},



		get_posts: function(category){
			var id = category.split('_')[1];
			App.request( 'GET', '/category/'+id, null,
				function(data){
					// console.log(data);
					if( data.error ){
						console.error('Error getting categories: ' + data.error);
					} else {
						$('#posts_wrap').empty();

						if( data.length ){

							//sort posts by most recent activity
							data.sort( function(a,b){
								var d1 = a.replies.length ? a.replies[ a.replies.length-1 ].date : a.datecreated;
							    var d2 = b.replies.length ? b.replies[ b.replies.length-1 ].date : b.datecreated;
							    return new Date(d2) - new Date(d1);
							})

							for( var i = 0; i < data.length; i++ ){
								$('#posts_wrap').append( App.build_post_list_item(
									data[i]._id,
									data[i].subject,
									data[i].creator,
									data[i].replies.length,
									data[i].views,
									data[i].replies.length ? data[i].replies[ data[i].replies.length-1 ].date : data[i].datecreated,
									data[i].replies.length ? data[i].replies[ data[i].replies.length-1 ].username : data[i].creator
								))
							}
							App.navigate('post_list');
						} else {
							$('#posts_wrap').append('<p>No posts yet!</p>');
							App.navigate('post_list');
						}
					}
				}
			)
		},


		build_post_list_item: function(id, s, c, r, v, date, poster ){
			return '' + 
			'<div id="post_' + id + '" class="post row">' +
                '<div class="col-sm-4 subject">' + 
                    '<p>' + s + '</p>' +
                '</div>' +
                '<div class="col-sm-2 poster">' +
                    '<p>' + c + '</p>' +
                '</div>' +
                '<div class="col-sm-2 replies">' +
                    '<p>' + r + ' replies</p>' +
                '</div>' +
                '<div class="col-sm-2 views">' +
                    '<p>' + v + ' views</p>' +
                '</div>' +
                '<div class="col-sm-2 last">' +
                    '<p>Last post ' + Util.date_format(date) + ' by ' + poster + '</p>' +
                '</div>' +
            '</div>';
		},



		get_post: function(post){
			var post_id = post.split('_')[1];
			App.request( 'GET', '/post/'+post_id, null,
				function(data){
					// console.log(data);
					if( data.error ){
						console.error('Error getting categories!');
					} else {
						$('#post_replies').empty();
						$('#post_header').empty();

						$('#post_header').append( App.build_post_head( 
							data.creator,
							data.subject,
							data.datecreated,
							data.content 
						))

						for( var i = 0; i < data.replies.length; i++ ){
							$('#post_replies').append( App.build_post_reply(
								data.replies[i].username,
								data.replies[i].date,
								data.replies[i].content
							))
						}
						App.navigate('post');
						
					}
				}
			)
		},


		build_post_head: function(n, s, d, c){
			return '' +
			'<div id="post_head_name" class="col-sm-2">' +
                '<p>' + n + '</p>' +
            '</div>' +
            '<div id="post_head_content" class="col-sm-10">' +
            	'<h1>' + s + '</h1>' +
            	'<h6>Posted on ' + Util.date_format(d) + '</h6>' +
                '<hr/>' +
                '<p>' + Util.formatPost(c) + '</p>' +
            '</div>';
		},

		build_post_reply: function(n, d, c){
			return '' + 
			'<div class="reply row">' +
                '<div class="reply_name col-sm-2">' +
                    '<p>' + n + '</p>' +
                '</div>' +
                '<div class="reply_content col-sm-10">' +
                	'<h6>Posted on ' + Util.date_format(d) + '</h6>' +
                	'<hr/>' +
                    '<p>' + Util.formatPost(c) + '</p>' +
                '</div>' +
           '</div>';
		},

		reply_to_post: function(post){
			var post_id = post.split('_')[1];
			console.log('reply to post: ' + post_id);

			App.clearErrors('post_reply_box');

			var errors = 0;

			if( $('#post_reply_box textarea[name="reply_text"]').val() == '' ){
				App.errorField('#post_reply_box', 'Enter your reply!');
				errors++;
			}

			if( !errors ){
				// replace iOS inserted emoticons with :colon: syntax to speed things up and not break the db
				var before;
				var contents = before = $('#post_reply_box textarea[name="reply_text"]').val()
				console.log(contents);
				emoji.text_mode = true;
				contents = emoji.replace_unified(contents);
				emoji.text_mode = false;

				// alert( before + ' - ' + contents );
				console.log(contents);

				App.request( 'POST', '/post/'+post_id+'/reply', 
					{
						content: contents
					},
					function(data){
						console.log(data);
						if( data.error ){
							console.error('Error: ' + data.error );
						} else {
							App.get_post(post);
							$('#post_reply_show').show();
							$('#post_reply_box').hide();
							$('#reply_area').val('');
							$('#reply_preview_content').empty();
						}
					}
				)
			}
		}


	}

	$('#notify').click(function(){
		$(this).hide();
	})


	$('.nav').click(function(e){
		e.preventDefault();
		var clickfunction = App.navClick.bind(this);
		clickfunction();
	})

	$('#post_reply_show').click(function(e){
		e.preventDefault();
		$('.post_preview_name').empty().append( App.user.username );
		$('#post_reply_box').show();
		$('#post_preview').show();
		$(this).hide();
	})

	$('#post_reply_cancel').click(function(e){
		e.preventDefault();
		$('#post_reply_show').show();
		$('#post_reply_box').hide();
		$('#post_preview').hide();
		$('#reply_area').val('');
		$('#reply_preview_content').empty();
	})

	$('#post_cancel').click(function(e){
		e.preventDefault();
		App.emptyForm('add_post');
		App.navigate('post_list');
		$('#post_preview_subject, #post_preview_content').empty();
		$('#post_preview_name').empty().append(App.user.username);
	})

	$('#reply_submit').click(function(e){
		App.reply_to_post( $('#post').attr('data-post') );
	})

	$('#login_submit').click(function(){ App.login(); });
	$('#signup_submit').click(function(){ App.signup(); });
	$('#add_category_submit').click(function(){ App.add_category(); });

	$('#add_post_submit').click( function(){ 
		App.add_post( $('#post_list').attr('data-category') );
	});

	$(document).on('click', '.post', function(){
		App.get_post( $(this).attr('id') );
		$('#post').attr('data-post', $(this).attr('id') );
	});

	$(document).on('click', '.category', function(){ 
		App.get_posts( $(this).attr('id') );
		$('#post_list').attr('data-category', $(this).attr('id') );
	});

	window.onhashchange = function(){
		// console.log(document.location.hash);
	}


	$('#fileselect').change(function(e){

		var input = '#' + $(this).attr('data-input');
		var pre = '#' + $(this).attr('data-pre');

		var files = e.target.files;
		var formData = new FormData();

		var file;

		if( e.target.files[0] ){
			file = e.target.files[0];
		} else return;

		

		if( !file || !file.type.match('image.*')) {
			return;
		}

		formData.append('image', file, file.name);

		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/save-image', true);
		xhr.onload = function() {
	    	App.check_session( JSON.parse(xhr.responseText), function(data){
	    		if( !data.error ){
	    			console.log( 'file uploaded successfully: ' + data.filepath );
	    			var cursor = $(input)[0].selectionStart;
					var cs = $(input).val();

					var tag_string = '[img=/' + data.filepath + ']';

					$(input).val( [cs.slice(0, cursor), tag_string, cs.slice(cursor)].join('') );

					var new_cursor = cursor + tag_string.length;
					$(input)[0].setSelectionRange(new_cursor,new_cursor);
					$(input).focus();
					$(pre).empty().append( Util.formatPost( $(input).val() ) );
	    		} else {
	    			console.log( 'error: ' + data.error );
	    		}
	    	});
		};
		xhr.send(formData);

	})

	$('.format_btn').click(function(){
		var text_area;
		if( $(this).hasClass('format_post') ){
			text_area = '#post_area';
		} else if( $(this).hasClass('format_reply') ){
			text_area = '#reply_area';
		}

		var cursor = $(text_area)[0].selectionStart;
		var p = $(this).attr('id').split(/[_\-]/);

		var cs = $(text_area).val();
		var tag_string = '[' + p[1] + ((p.length == 3) ? ('='+p[2]) : '') + '][/' + p[1] + ']';

		

		$(text_area).val( [cs.slice(0, cursor), tag_string, cs.slice(cursor)].join('') );


		var new_cursor = ( p.length == 3 ) ? ( cursor + 3 + p[1].length + p[2].length ) : ( cursor + 2 + p[1].length );
		$(text_area)[0].setSelectionRange(new_cursor,new_cursor);
		$(text_area).focus();
	})

	$('.user_input').on('input propertychange', function(){
		var id = '#' + $(this).attr('id').split('_')[0] + '_preview_content';
		$(id).empty().append( Util.formatPost( $(this).val() ) );
	});

	$('#post_subject_input').on('input propertychange', function(){
		$('#post_preview_subject').empty().append( $(this).val() )
	})

	$('.add_image').on('click', function(){
		$('#fileselect').attr('data-input', $(this).attr('data-input'));
		$('#fileselect').attr('data-pre', $(this).attr('data-pre'));
		$('#fileselect').click();
	})


	App.init();
});