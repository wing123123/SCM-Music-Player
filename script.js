(function(){
	var hasFrame = window.parent!=window,
		scripts = document.getElementsByTagName('script'),
		current = scripts[scripts.length-1],
		head = document.getElementsByTagName("head")[0],
		url = location.href.replace(/scmplayer\=true/g, 'scmplayer=false'),
		domain = url.substr(0,url.indexOf('/',10)),
		src = current.getAttribute('src').replace(/script\.js/g,'scm.html')+'#'+url,
		host = src.substr(0,src.indexOf('/',10)),
		isOutside = !hasFrame || location.href.indexOf("scmplayer=true")>0,

		addEvent = function(elm, evType, fn) {
			if(elm.addEventListener) 
				elm.addEventListener(evType, fn);
			else if (elm.attachEvent) 
				elm.attachEvent('on' + evType, fn);
			else
				elm['on' + evType] = fn;
		},
		isIE = (function(){
			var undef,v = 3,div = document.createElement('div'),
			all = div.getElementsByTagName('i');
			while (
				div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
				all[0] );
			return v > 4 ? v : undef;
		})(),
		isMobile = navigator.userAgent.match(/iPad|iPhone|Android|Blackberry/i),

		init = function(){
			if(location.hash.indexOf('/')>-1)
				location.replace(location.hash.substr(1));
			if(!document.body){ 
				setTimeout(init,10); 
				return;
			}
			if(isOutside){
				code();
				outside();
			}else
				inside();
		},

		code = function(){
			head.innerHTML += '<style id="scmcss" type="text/css"> html,body{overflow:hidden;} body{margin:0;padding:0;border:0;} img,a,embed,object,div,address,table,iframe,p,span,form{ display:none;border:0;margin:0;padding:0; } #scmframe{display:block; background-color:transparent; position:fixed; top:0px; left:0px; width:100%; height:100%; z-index:167;} </style>';
			/*
			while(head.firstChild.id!="scmcss")
				head.removeChild(head.firstChild);
			*/
			
			var scmframe = document.createElement('iframe');
			scmframe.frameBorder = 0;
			scmframe.id = "scmframe";
			scmframe.allowTransparency = true;
			scmframe.src = src;
			
			document.body.insertBefore(scmframe,document.body.firstChild);
			
			addEvent(window,'load',function() {
				while(document.body.lastChild.id!="scmframe")
					document.body.removeChild(document.body.lastChild);
			});
		},
		outside = function(){
			//fix frame height in IE
			if(isIE)
				addEvent(window,'resize',function(){
					var scmframeStyle = document.getElementById('scmframe').style;
					scmframeStyle.height = (function(){
						if( typeof( window.innerHeight ) == 'number' )
							return window.innerHeight; 
						else if( document.documentElement && document.documentElement.clientHeight ) 
							return document.documentElement.clientHeight; 
						else if( document.body && document.body.clientHeight ) 
							return document.body.clientHeight; 
					})();
				});

				var hash = location.hash,
				interval = setInterval(function(){
					if(location.hash == hash) return;
					hash = location.hash;
					if(hash.indexOf('/')>-1)
						window.scmframe.location.replace(hash.substr(1));
				},50);
		},
		inside = function(){
			//fix links
			addEvent(document.body,'click',function(e){
				var tar = e.target;
				while(!tar.tagName.match(/^(a|area)$/i) && tar!=document.body) 
					tar = tar.parentNode;
				if(tar.tagName.match(/^(a|area)$/i)){
					if(tar.href.indexOf('https://')==0 || (tar.href.indexOf(location.host)==-1 &&
					tar.href.indexOf("http://")==0 ))	{
						//external links
						window.open(tar.href,'_blank');
						window.focus();
						e.preventDefault();
					}else if(tar.href.indexOf("http://")==0 ){
						window.top.location.hash = tar.href.replace(domain,'');
						window.top.scmframe = window;
						e.preventDefault();
					}
				}
			});
			
			var config = current.getAttribute('data-config');
			//send config
			if(config)
				window.parent.postMessage('SCM.config('+config+')',host);
		};

	if(window.SCM && window.SCMMusicPlayer) return;

	//SCM interface
	window.SCM = (function(keys){
		var keys = keys.split(','),
			obj = {},
			post = function(key){
				return function(arg){
					var argStr = '';
					if(typeof(arg)!='undefined')
						argStr = (key.match(/(play|queue)/) ? 'new Song(':'(') +
							JSON.stringify(arg)+')';
					window.parent.postMessage('SCM.'+key+'('+argStr+')',host);
				}
			};
		for(var i=0;i<keys.length;i++){
			var key = keys[i];
			obj[key] = post(key);
		}
		return obj;
	})(
		'queue,play,pause,next,previous,volume,skin,placement,'+
		'loadPlaylist,repeatMode,isShuffle,showPlaylist,'+
		'togglePlaylist,toggleShuffle,changeRepeatMode'
	);
	SCM.init = function(config){
		window.parent.postMessage('SCM.config('+config+')',host);
	};
	window.SCMMusicPlayer = SCM;

	init();

})();
