  /**********************************************************
  ******************* Portfolio 2013         ****************
  ******************* Author : Loren Grixti  ****************
 ************************************************************/

/*** TODO *************************
> gallery view navigation (left-right)
> second layout mode (tileMode)
> add frontend projects
> add responsive

/* APPLICATION MAP :
/****************************************************

Portfolio = {
		init : 					function(mode,callback) {},
		UI: 					{},		
		CONFIG : 				{},
		GLOBAL : 				{}
		getdata = {
			init: 				function(callback) {},
			albums : 			function() {},		
			galleries : 			function(callback) {},
			pictures : 			function(gid) {}
		navigation = {
			init : 				function(mode) {},
			home : 				function() {},
			album : {			
				create : 		function(getAlbums) {},
				show : 			function() {},
				activate : 		function(slug) {},
				launch : 		function(albumSlug) {}
			gallery : {
				create : 		function(callback) {},
				launch : 		function(slug) {},
				getActive : 		function() {},
				getRecent : 		function() {},
				setActive : 		function(slug) {}
		template = {
			init : 				function() {},
			resize : {
				init : 			function() {},
				albums: 		function() {},
				scrollTop: 		function(mode) {},
				scrollBottom: 		function(mode) {}
			gallery : {
				initTogglers : 		function() {},
				show : 			function() {},
				hide : 			function() {},
				posterMode : 		function() {},
				tileMode : 		function() {},
				blogMode : 		function() {}
			project : {
				init : 			function() {},
				create : 		function(pictures,slug) {},
				open : 			function() {},
				close : 		function() {}
			closepopin : 			function() {},
			showreel : {
				init : 			function() {},
				loaded : 		function() {},
				ready : 		function(event) {},
				pause : 		function(event) {},
				play : 			function(event) {},
				create : 		function() {},
				open : 			function() {},
				center : 		function() {},
				close : 		function() {}
			about : 			{
				init : 			function() {},
				open : 			function() {},
				close : 		function() {}
			blackScreen : {			
				init : 			function() {},
				show : 			function() {},
				hide : 			function() {}
		route = {
			init: 				function(){},
			setChangeEvent: 		function(){},
			pushThis : 			function(pushIt) {},
			pushUrl: 			function() {},
			go: 				function() {}		

*********** Extend functions ************************
			centerThis : 			function()	
			slide : 			function(state,from)
****************************************************/

$(document).ready( function() {

	Portfolio = {
		//Initial launching sequence
		init : function(mode,callback) {
	  		Portfolio.getdata.init( function() {
	  			Portfolio.getdata.albums();				  		
		  		Portfolio.getdata.galleries( function() {			
		  			Portfolio.template.resize.albums();
		  			Portfolio.navigation.album.show();
			  		Portfolio.template.showreel.init();
			  		Portfolio.template.blackScreen.init();
			  		Portfolio.route.init();
			  		Portfolio.template.init();
			  		Portfolio.navigation.init(mode);
			  		if(typeof callback == 'function'){
				    	callback.call(this);
				    }
		  		});	  		 		
	  		});
		},
		// Locate and assign Interface Elements to objects
		UI: {
			"root"				: $("#super-container"),
			"nav"				: $("nav"),
			"header"			: $("header"),
			"navContainer"			: $("aside"),
			"galleriesContainer"		: $("#galleries-container"),
			"galleries"			: $("#galleries-container #galleries"),
			"projectContainer"		: $("#project-container"),
			"project"			: $("#project-container #project"),
			"showreel"			: $("#super-container>#showreel"),
			"about"				: $("#super-container>#about")	
		},		
		//Create arrays for albums galleries and pictures
		DATASOURCES : {
			"albums" 		 	: [],	//db table: ngg_album    
			"galleries" 	 		: [],	//db table: ngg_gallery  
			"pictures"			: [],	//db table: ngg_pictures  
			"childGalleries"		: [],	//db table: ngg_album/col:galleries (to link parent to child)
			"allGalleries"			: []	//generated by Portfolio.getdata.galleries
		},
		//Central configuration variables for app
		CONFIG : {
			//URL CONF
			"site_domain"  			: "http://"+window.top.location.hostname,				
			"site_root"    			: "/",

			"first_time"			: true, //if first time loading site (for rewriting)
			"json_path"			: "js/data.json", //source of data (galleries,albums,pictures)
			"active_album"  		: "", //ID of currently open/to open album
			"active_album_slug" 		: "web-design", //friendly name (no spaces) of currently active album
			"recent_gallery"		: "", //ID of the last opened gallery
			"active_gallery"		: "", //ID of currently open/to open gallery
			"gallery_images_path" 		: "gallery/", //folder name where to find images 
			"active_album_title"		: "",
			"active_gallery_title"		: "",			
			"album_filters"			: ".web-design", //first type of projects to show by default
			"resize_timer"			: 0,
			"gallery_mode" 			: "blogMode", //default mode on init
			"open_popin"			: "", //store name of which popen is open currently
			"showreel_url" 			: "http://www.youtube.com/embed/zh8xD8BE2YA?autoplay=1&hd=1",
			"video_size"			: 0.7, //YouTube player, values is % width/height of screen
			"player"			: "",
			"playerLoaded"			: false
		},
		GLOBAL : {
			"History" 			: window.History
		},	
		getdata : {
			init: function(callback) {				
				$.ajax({
				    type: 'GET',
				    url: Portfolio.CONFIG.json_path,
				    dataType: 'json',
				    success: function(jsonData) {
				        //Populate arrays from the JSON nodes
				        Portfolio.DATASOURCES.albums = jsonData.albums;
				    	Portfolio.DATASOURCES.galleries = jsonData.galleries;
				    	Portfolio.DATASOURCES.pictures = jsonData.pictures;

				    	if(typeof callback == 'function'){
						callback.call(this);
					}
				    },
				    error: function (xhr, ajaxOptions, thrownError) {
				    	console.log("**ALERT** AJAX ERROR "+xhr.status + " : " + thrownError);
				    }
			    });			
			},
			albums : function() {
			   	$albums = Portfolio.DATASOURCES.albums;
			   	Portfolio.navigation.album.create($albums);  			
			},		
			galleries : function(callback) {
				$galleries = Portfolio.DATASOURCES.galleries;
				$gallery   = $galleries.Galleries;	
				
				var arr = [];
				
				$albums = Portfolio.DATASOURCES.albums;
				$album 	= $albums.Albums;

				$.each($albums.Albums, function(x,v) {

					//empty array before using it
					arr.length = 0;

					//cycle all albums and match gallery id with album id using
					//the child-parent matches found in childGalleries array
					arr = $.grep($gallery, function (n,i) { 
						return $.inArray(n.gid, Portfolio.DATASOURCES.childGalleries[$album[x].id]) != -1;				
					});

					//obtained an array only with similar children objects,
					//and add an album object with the name of album to each
					$.map(arr, function(n,i){
	   					return n.album = $album[x].slug;
					});

					//merge all albums in 1 big array
					$.merge(Portfolio.DATASOURCES.allGalleries,arr);
				});
				Portfolio.navigation.gallery.create( function() {
					if(typeof callback == 'function'){
					   	callback.call(this);
					}
				});
			},
			pictures : function(gid) {
				console.log("getting pictures data:"+gid);
				$pictures = Portfolio.DATASOURCES.pictures;
				$picture  = $pictures.Pictures;

				//Filter array showing only pictures belonging to this gallery
				arr = $.grep($picture, function (n,i) { 
					return n.galleryid == gid;
				});
				return arr;
			}
		},	
		navigation 	: {
			init: function(mode) {
				//Set initial events
				console.log("mode : "+mode);
				if(mode == "intro") {
					$("body").addClass("intro");
				} else {
					$("body").removeClass("intro");
				}
				Portfolio.UI.root.addClass("enable");
				Portfolio.UI.header.addClass("enable");
				
				$(document).keyup(function(e) {
				  if (e.keyCode == 27) { Portfolio.navigation.home(); }   // esc
				});
				$(window).scroll(function() {
					if($(this).scrollTop()==0) {
						$(".goTop").removeClass("enable");					
					} else {
						$(".goTop").addClass("enable");					
					}
				});	
				$(".links #about").click( function(e) {
					e.preventDefault();
					Portfolio.route.pushThis("about");
				});
				$(".goTop").click(function() {
					Portfolio.template.resize.scrollTop();
				});
				//Launch galleries using default filtering
				Portfolio.template.about.init();
				Portfolio.navigation.album.launch();
			},
			home : function() {
				Portfolio.CONFIG.recent_gallery = Portfolio.CONFIG.active_gallery;
				Portfolio.CONFIG.active_gallery = "";
				Portfolio.route.pushUrl();	
			},
			album : {			
				create : function(getAlbums) {
					var getName,getID,getSlug,getFilter,addClass,$html = "",
						$albums = getAlbums,
						$album  = $albums.Albums;
					
					$.each($albums.Albums, function(i,v) {
						addClass= "";
						getName = $album[i].name;				
						getID 	= $album[i].id;
						getSlug = $album[i].slug;

						Portfolio.DATASOURCES.childGalleries[getID] = $albums.Albums[i].galleries;	

						getActiveFilter = Portfolio.CONFIG.album_filters;
						if ("."+getSlug == getActiveFilter) addClass = "active";

						//Create Menu Items
						$nav_el = '';
						$nav_el = "<a class='album-links "+addClass+"' href='#' data-slug="+getSlug+" id="+getID+"><span>"+getName+"</span></a>";				
						$html += $nav_el;
					});
					Portfolio.UI.nav.append($html);
					//over click test passed
					Portfolio.UI.nav.find(".album-links").click( function(e){
						e.preventDefault();
						var setSlug = $(this).data("slug");
						Portfolio.navigation.album.setActive(setSlug);
						Portfolio.navigation.album.launch(setSlug);
					});
				},
				show : function() {
					Portfolio.UI.nav.addClass("enabled");
				},
				activate : function(slug) {	//visual activation
					if(slug.charAt(0)==".") slug=slug.substring(1); 
					console.log("activating: "+slug);
					var clickedAlbum = Portfolio.UI.nav.find(".album-links[data-slug='"+slug+"']"),
							  albums = Portfolio.UI.nav.find(".album-links");
					albums.removeClass("active");
					clickedAlbum.addClass("active");
					Portfolio.CONFIG.album_filters = "."+slug;
				},
				setActive : function(slug)  {
					var $getObj = Portfolio.UI.nav.find(".album-links[data-slug='"+slug+"']");
					Portfolio.CONFIG.active_album 		= $getObj.attr("id");
					Portfolio.CONFIG.active_album_slug 	= $getObj.data("slug");
					Portfolio.CONFIG.active_album_title = $getObj.text();
				},
				launch : function(albumSlug) {
					if(albumSlug=="showreel") {
						Portfolio.route.pushThis("showreel");
					} else {
						//set default filter if nothing passed. Particularly used in first time filtering				
						Portfolio.navigation.album.activate(albumSlug || Portfolio.CONFIG.album_filters);
						Portfolio.UI.galleries.find(".element").removeClass("active");
						Portfolio.UI.galleries.find(Portfolio.CONFIG.album_filters).addClass("active");
						console.log("filtering by : " + Portfolio.CONFIG.album_filters);
					}
				}
			},
			gallery : {
				create : function(callback) {
					var $html      = "",	
						$gallery   = Portfolio.DATASOURCES.allGalleries,
						$container = Portfolio.UI.galleries,
						$galleriesContainer = Portfolio.UI.galleriesContainer,
						$galleryMode = Portfolio.CONFIG.gallery_mode,
						$scrollPos = 0;

					$container.empty();
					
					if($gallery.length > 0) {
						$.each($gallery, function(i,v) {

							getAlbum = $gallery[i].album;
							getID    = $gallery[i].gid;	
							getName  = $gallery[i].title;	
							getSlug  = $gallery[i].slug;	 
							getDesc  = $gallery[i].galdesc;
							getThumb = $gallery[i].filename;
							bgURL    = Portfolio.CONFIG.site_domain
									 +Portfolio.CONFIG.site_root
									 +Portfolio.CONFIG.gallery_images_path
									 +getSlug
									 +"/"+getThumb;

							//Create Gallery Items
							$nav_el = '';
							$nav_el =  "<div class='element gallery-holder " + getAlbum + "' id=" 
										+ getID + " style='background-image:url("+bgURL+")'"
										+ " data-album='" + getAlbum 
										+ "' data-slug=" + getSlug+">" 
										+ "<div><h2>"+getName+"</h2>" +
											"<p>"+getDesc+"</p></div>" +
										"</div>";
										
							$container.append($nav_el);

						});
					}
					//over click test passed
					$container.find(".gallery-holder").click( function() {	
						Portfolio.CONFIG.active_album_title 	 = $(this).data("album");	
						Portfolio.navigation.gallery.setActive($(this).data("slug"));					
						Portfolio.route.pushUrl();				
					});
					$galleriesContainer.addClass($galleryMode);
									
					//Call gallery layout mode template
					Portfolio.template.gallery.initTogglers();
					Portfolio.template.gallery[$galleryMode]();

					if(typeof callback == 'function'){
					   	callback.call(this);
					}
				},
				launch : function(slug) {
					if(slug != "2012") {
						
						//TODO galleries are empty at this stage for gallery directeded launches
						getPictures = Portfolio.getdata.pictures(Portfolio.UI.galleries.find(".gallery-holder[data-slug='"+slug+"']").attr("id"));
						Portfolio.template.project.create(getPictures,slug);
						Portfolio.template.project.open();					
					} else {
						Portfolio.template.showreel.create();
					}
				},
				//returns the active gallery within the list as a DOM element
				getActive : function() {				
					if(Portfolio.CONFIG.active_gallery!="") {
						var obj = Portfolio.UI.galleries.find("#"+Portfolio.CONFIG.active_gallery);
						return obj;	
					} else {
						return "";
					}
				},
				getRecent : function() {				
					if(Portfolio.CONFIG.recent_gallery!="") {
						var obj = Portfolio.UI.galleries.find("#"+Portfolio.CONFIG.recent_gallery);
						return obj;	
					} else {
						return "";
					}
				},
				setActive : function(slug) {			
					Portfolio.CONFIG.active_gallery_title = Portfolio.UI.galleries.find(".gallery-holder[data-slug='"+slug+"'] h2").text();	
					Portfolio.CONFIG.active_gallery 	  = Portfolio.UI.galleries.find(".gallery-holder[data-slug='"+slug+"']").attr("id");
				}
			}	
		},	
		template : {
			init : function() {
				$(window).resize(function() {
			  		clearTimeout(Portfolio.CONFIG.resize_timer);
	  				Portfolio.CONFIG.resize_timer = setTimeout(Portfolio.template.resize.init, 100);
				});
				Portfolio.template.project.init();
			},
			resize : {
				init : function() {
					Portfolio.template.resize.albums();
				},
				albums: function() {
					Portfolio.UI.nav.css("margin-top",Portfolio.UI.navContainer.height()/2-Portfolio.UI.nav.height()/2);
				},
				scrollTop: function(mode) {				
					if($.isNumeric(mode)) {
						$('body,html').scrollTop(mode);	
					} else {
						if(mode=="static") {
							$('body,html').scrollTop(0);	
						} else {
							$('body,html').animate({scrollTop: 0}, 800);		
						}	
					}							
				},
				scrollBottom: function(mode) {				
					if($.isNumeric(mode)) {
						$('body,html').scrollTop(mode);	
					} else {
						if(mode=="static") {
							$('body,html').scrollTop($(document).height());	
						} else {
							 console.log("scrolling down to :" + $(document).height());
							 $("html, body").animate({ scrollTop: $(document).height() }, 50000);
						}	
					}							
				}
			},		
			gallery : {
				initTogglers : function() {

					Portfolio.UI.galleriesContainer.find("#layouts a").click(function() {
						$newGalleryMode = $(this).attr("id");
						Portfolio.UI.galleriesContainer.removeClass(Portfolio.CONFIG.gallery_mode).addClass($newGalleryMode);
						Portfolio.CONFIG.gallery_mode = $newGalleryMode;
						Portfolio.template.gallery[$newGalleryMode]();
					});
				},
				show : function() {
					Portfolio.UI.galleries.show();
				},
				hide : function() {
					Portfolio.UI.galleries.hide();
				},
				posterMode : function() {

				},
				tileMode : function() {

				},
				blogMode : function() {

				}
			},
			project : {
				init : function() {
					$galleries = Portfolio.DATASOURCES.galleries;
					$gallery   = $galleries.Galleries;

					$.each($gallery, function(i,v) {
						getName  = $gallery[i].title;
						getAlbum = $gallery[i].album;
						getID    = $gallery[i].gid;	
						Portfolio.UI.project.find(".side").append("<a href='#' id='"+ getID
							+"' data-album='"+getAlbum+"' >"+ getName+"</a>");					
					});	
					//passed over click test
					Portfolio.UI.project.find(".side a").click(function(e) {						
						e.preventDefault();
						Portfolio.CONFIG.active_album_title = $(this).data("album");	
						Portfolio.CONFIG.active_gallery = $(this).attr("id");				
						Portfolio.CONFIG.active_gallery_title = $(this).text();
						Portfolio.route.pushUrl();						
					});

					Portfolio.UI.project.find(".closer").click(function() {
						Portfolio.navigation.home();					
					});				
				},
				create : function(pictures,slug) {
					var $html = "",	
						$pictures = pictures,
					 	$projectHolder = Portfolio.UI.project,
					 	$projectTitle  = $projectHolder.find("h2"),
					 	$projectDescription = $projectHolder.find(".gallery-description");
					 	$projectBody   = $projectHolder.find(".content"),
					 	$projectSide = $projectHolder.find(".side"),
					 	getSlug = slug;
					
					$projectSide.find("[data-album='"+Portfolio.CONFIG.active_album_slug+"']").addClass("enable");
					$projectTitle.html(Portfolio.CONFIG.active_gallery_title);
					//Retrieve main description of gallery and add it under first image			
					$projectDescription.html(Portfolio.navigation.gallery.getActive().find("p").text());
					
					$filePath = Portfolio.CONFIG.site_domain + Portfolio.CONFIG.site_root + Portfolio.CONFIG.gallery_images_path;
					
					$.each($pictures, function(i,v) {					
						$getID	 			= $pictures[i].pid;
						$getSource 			= $pictures[i].filename;
						$getDescription 	= $pictures[i].description;
						$getWidth    		= $pictures[i].metaWidth;
						$getHeight    		= $pictures[i].metaHeight;
						$getPrevID			= $pictures[i].previewpic;

						if($getID!=$getPrevID) {
							  $pic_el = "<img src='"  + $filePath+getSlug+ "/"+$getSource
									+"' width="+$getWidth
									+"  height="+$getHeight
									+" class='projectImage' "
									+"  id='"+$getID+"'>" 
									+ "<div class='description'>"+$getDescription+"</div>";
							$html += $pic_el;
						}					
					});	
					$projectBody.css("background-image","url("+$filePath+getSlug+ "/bg.jpg)");
					$projectBody.html($html);		          		      
			        	$projectBody.parent().css("padding-top","50px").animate({paddingTop:'0px'},1500);        
	  				Portfolio.UI.project.find(".side a").removeClass("active").filter("#"+Portfolio.CONFIG.active_gallery).addClass("active");
				},
				open : function() {
					$("html,body").stop();
					//call openpopin
					
					Portfolio.UI.projectContainer.show();
					Portfolio.UI.project.slide("in","right");

					Portfolio.template.gallery.hide();
					Portfolio.template.blackScreen.show();
					Portfolio.template.resize.scrollTop("static");				
					Portfolio.CONFIG.open_popin = "project";				
				},
				close : function() {
					//call closepopin
					Portfolio.UI.projectContainer.hide();
					Portfolio.UI.project.slide("out","left");
					Portfolio.template.blackScreen.hide();
					Portfolio.template.gallery.show();
					
					var obj = Portfolio.navigation.gallery.getRecent();
					if(obj!="") Portfolio.template.resize.scrollTop(obj.offset().top-obj.height()/2);								
				}
			},		
			closepopin : function() {			
				if(Portfolio.CONFIG.open_popin !="") {
					console.log("closing");
					Portfolio.template[Portfolio.CONFIG.open_popin].close();	
					Portfolio.CONFIG.open_popin = "";
				}
			},
			showreel : {
				init : function() {
					Portfolio.UI.showreel.find(".closer").click(function(){
						Portfolio.navigation.home();		
					});							
					//Load video through youtube api
					var tag = document.createElement('script');
			        	tag.src = "https://www.youtube.com/iframe_api";
			        	var firstScriptTag = document.getElementsByTagName('script')[0];
			        	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				},
				loaded : function() {					
					Portfolio.CONFIG.player = new YT.Player('showreel-player', {
			          		height: '390',
			          		width: '640',
			          		videoId: 'zh8xD8BE2YA?',
			          		events: {
			            			'onReady': Portfolio.template.showreel.ready			            
			          		}
			        	});	
			        	Portfolio.CONFIG.playerLoaded = true;		        
				},
				ready : function(event) {
        			//Video is now ready to be used
				},
				pause : function(event) {
        				Portfolio.CONFIG.player.stopVideo();
				},
				play : function(event) {
        				if(Portfolio.CONFIG.playerLoaded)  {
        					Portfolio.CONFIG.player.playVideo();
        				}
				},
				create : function() {
					Portfolio.template.showreel.open();	
				},
				open : function() {
					Portfolio.UI.showreel.show();
					Portfolio.template.showreel.center();	
					Portfolio.template.showreel.play();
					Portfolio.template.blackScreen.show();
					Portfolio.CONFIG.open_popin = "showreel";
				},
				center : function() {
					var videoSize = Portfolio.CONFIG.video_size;
					var getWidth  = $(window).width()/2 - ($(window).width() * videoSize)/2;
					var getHeight = $(window).height()/2 - ($(window).height() * videoSize)/2;
					Portfolio.UI.showreel.css("left",getWidth);
					Portfolio.UI.showreel.css("top",getHeight/2);
				},
				close : function() {
					Portfolio.UI.showreel.hide();
					Portfolio.template.blackScreen.hide();
					Portfolio.template.showreel.pause();
					Portfolio.CONFIG.open_popin = "";			
				}
			},
			about : {
				init : function() {
					Portfolio.UI.about.find(".closer").click(function(){
						Portfolio.navigation.home();		
					});	
				},
				open : function() {
					console.log("opening about");
					Portfolio.UI.about.show();
					Portfolio.UI.about.show();
					Portfolio.UI.about.centerThis();
					Portfolio.template.blackScreen.show();
					Portfolio.CONFIG.open_popin = "about";
				},
				close : function() {
					Portfolio.UI.about.hide();
					Portfolio.template.blackScreen.hide();
					Portfolio.CONFIG.open_popin = "";				
				}				
			},
			blackScreen : {			
				init : function() {
					var createBlack = $("<div class='blackScreen'></div>");				
					$("body").append(createBlack);
					//passed  over click test
					$(".blackScreen").click(function() {
						Portfolio.navigation.home();
					});
				},
				show : function() {
					$(".blackScreen").show();
				},
				hide : function() {
					$(".blackScreen").hide();
				}
			}
		},
		route : {
			init: function(){
				Portfolio.route.setChangeEvent();				
			},
			setChangeEvent: function(){
				Portfolio.GLOBAL.History.Adapter.bind(window,'statechange',function(){
					Portfolio.route.go();
				});
			},
			pushThis : function(pushIt) {
				Portfolio.GLOBAL.History.pushState(null, null, '/'+Portfolio.CONFIG.site_root+pushIt);
			},
			pushUrl: function() {
				var friendly_gallery = "", friendly_album = "",friendly_gallery_slug = "";
				if (Portfolio.CONFIG.active_gallery != "") {
					friendly_gallery_slug = Portfolio.UI.galleries.find(".gallery-holder#"+Portfolio.CONFIG.active_gallery).data("slug");
					friendly_album = Portfolio.CONFIG.active_album_title;
					friendly_gallery = "/"+friendly_gallery_slug;
				}
				
				Portfolio.GLOBAL.History.pushState(null, null, '/'+Portfolio.CONFIG.site_root+friendly_album+friendly_gallery);
			},
			go: function() {					
				
				url = window.location.href;
				var getSlugs = url.substr((Portfolio.CONFIG.site_domain+Portfolio.CONFIG.site_root).length,url.length);

				var slugs = getSlugs.split('/');	
				console.log("GOING TO : "+getSlugs);
				
				//URL REWRITING POSSIBLE VALUES
				switch (getSlugs) {
				    case "showreel": //popin with youtube video 
				   		if(Portfolio.CONFIG.first_time) {
				   			Portfolio.init("direct",function() {
				   				Portfolio.template.showreel.open();
				   			});
				   		} else {
				   			Portfolio.template.showreel.open();
				   		}	
				   		console.log("executed case: showreel");		   		
				   		break;
				    case "about": //link in header showing personal profile
				    		if(Portfolio.CONFIG.first_time) {
				   			Portfolio.init("direct",function() {
				   				Portfolio.template.about.open();
				   			});
				   		} else {
				   			Portfolio.template.about.open();
				   		}
				    		console.log("executed case: about");	
				   		break;
				    case "": //HOME
						if(Portfolio.CONFIG.first_time) { //if first time accessed through home
							Portfolio.init("intro");					
						} else {
							Portfolio.template.closepopin();
						}
				   		console.log("executed case: home");	
				   		break; 
				    default : //PROJECT ACCESS
				    		if(Portfolio.CONFIG.first_time) { //If accessing a project directly through url
							//if page requested is a gallery				
							Portfolio.init("direct",function() {
								Portfolio.navigation.album.setActive(slugs[0]);	
								Portfolio.navigation.gallery.setActive(slugs[1]);	
								Portfolio.navigation.gallery.launch(slugs[1]); //Launch project		
							});
							
						} else {				
							Portfolio.navigation.album.setActive(slugs[0]);	
							Portfolio.navigation.gallery.setActive(slugs[1]);
							Portfolio.navigation.gallery.launch(slugs[1]); //Launch project	
						}
						console.log("executed case: default");					    	
				}
				Portfolio.CONFIG.first_time = false;
			}			
		}
	}
 	if($("html").hasClass("lt-ie8")) {
 		//Minimum requirements for IE is version 8
 		$("body").html("<div><br>Sorry, you need at least Internet Explorer V8 to view this site.</div>");
 	} else { 	 		
 		Portfolio.route.go(); 		
 	}

 	//EXTEND FUNCTIONS
 	$.fn.centerThis = function () { //this centers objects in the center of the screen	
		this.css("top",  ( $(window).height() - this.height() ) / 2 );
	    	this.css("left", ( $(window).width()  - this.width()  ) / 2 );
	    	return this;	   
 	}; 	
 	$.fn.slide = function(state,from) { //this slides in elements from any corner of the screen
 		
 		var calcLeft = this.width()+(($(window).width()-this.width())/2),
 			calcTop  = this.height()+(($(window).height()-this.height())/2),
 			getFrom  = from || "left",
 			getState  = state || "in";

 			console.log("sending panel to: state: " + getState + " and from: " + getFrom);

 		if(getState == "in") {	 	
	 		if(getFrom == "left" || getFrom == "right") {			
	 			if(getFrom=="left") {
	 				calcLeft = -calcLeft;
	 			}
		 		this.css("left",calcLeft).show().animate({
		 			left : 0
		 		},800);
	 		}
	 		if(getFrom == "top" || getFrom == "bottom") {			
	 			if(getFrom=="top") {
	 				calcTop = -calcTop;
	 			}
		 		this.css("top",calcTop).show().animate({
		 			top : 0
		 		},800);
	 		}
 		} else {
 			if(getFrom == "left" || getFrom == "right") {			
	 			if(getFrom=="right") {
	 				calcLeft = -calcLeft;
	 			}
		 		this.css("left",0).animate({
		 			left : calcLeft
		 		},800,function() {
		 			//$(this).hide();
		 		});
	 		}
	 		if(getFrom == "top" || getFrom == "bottom") {			
	 			if(getFrom=="bottom") {
	 				calcTop = -calcTop;
	 			}
		 		this.css("top",0).animate({
		 			top : calcTop
		 		},800,function() {
		 			//$(this).hide();
		 		});
	 		}
 		}
 	};

});

function onYouTubeIframeAPIReady() {
	Portfolio.template.showreel.loaded();	
}
