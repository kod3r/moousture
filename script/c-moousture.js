var Moousture=new Class({});Moousture.Directions={East:0,SouthEast:1,South:2,SouthWest:3,West:4,NorthWest:5,North:6,NorthEast:7,E:0,SE:1,S:2,SW:3,W:4,NW:5,N:6,NE:7};Moousture.MouseProbe=new Class({Implements:[Options],options:{stopEvent:false},initialize:function(a,e){this.pos={x:-1,y:-1};this.setOptions(e);$(a).addEvent("mousemove",function(b){this.pos.x=b.page.x;this.pos.y=b.page.y;this.options.stopEvent?b.stop():b.stopPropagation()}.bind(this))},probe:function(){var a={};$extend(a,this.pos);return a}});
Moousture.Monitor=new Class({initialize:function(a,e){this.prev={x:0,y:0};this.delay=$pick(a,20);this.thresh=$pick(e,1);this.wasStable=false},_monitor:function(){var a=this.prober.probe();if(Math.abs(a.x-this.prev.x)<this.thresh&&Math.abs(a.y-this.prev.y)<this.thresh){this.wasStable||this.cbObject.onStable(a);this.wasStable=true}else{this.wasStable?this.cbObject.onUnstable(a):this.cbObject.onMove(a);this.wasStable=false}this.prev=a},start:function(a,e){this.timer&&this.stop();this.prober=a;this.cbObject=
e;this.timer=this._monitor.periodical(this.delay,this)},stop:function(){$clear(this.timer);delete this.timer}});
Moousture.ManualMonitor=new Class({initialize:function(a){this.delay=$pick(a,20)},_monitor:function(){this.cbObject.onMove(this.prober.probe())},start:function(a,e){this.timer&&this.stop();this.prober=a;this.cbObject=e;this.timer=this._monitor.periodical(this.delay,this);this.cbObject.reset()},match:function(){this.cbObject&&this.cbObject.onStable(this.prober.probe())},stop:function(){$clear(this.timer);delete this.timer}});
Moousture.Recorder=new Class({options:{matcher:null,maxSteps:8,minSteps:4},Implements:[Options,Events],initialize:function(a){this.setOptions(a);this.options.matcher=a.matcher;this.movLog=[]},onStable:function(){if(!(this.movLog.length<this.options.minSteps)){this.options.matcher&&this.options.matcher.match&&this.options.matcher.match(this.movLog);this.fireEvent("complete",[this.movLog])}this.movLog.empty()},reset:function(){this.movLog.empty()},onUnstable:function(a){this.movLog.empty();this.movLog.push(a);
this.fireEvent("start")},onMove:function(a){this.movLog.length>this.options.maxSteps||this.movLog.push(a)}});
Moousture.GestureMatcher=new Class({mCallbacks:[],mGestures:[],options:{},Implements:[Options],initialize:function(a){this.setOptions(a)},angelize:function(a){for(var e=[],b=1;b<a.length-1;b++)e.push(this.getAngles(a[b],a[b+1]));return e},getAngles:function(a,e){var b=Math.atan2(e.y-a.y,e.x-a.x)+Math.PI/8;if(b<0)b+=2*Math.PI;b=Math.floor(b/(2*Math.PI)*360)/45;return Math.floor(b)},addGesture:function(a,e){this.mCallbacks.push(e);this.mGestures.push(a)},match:function(a){a=this.angelize(a);this.onMatch&&
this.onMatch(a)}});Moousture.Util={};Moousture.Util.nPairReduce=function(a,e){var b=null,d=[];e=$pick(e,1);for(var c=0;c<a.length-e+1;c++){for(var f=a.slice(c,c+e),h=true,g=1;g<f.length;g++)if(a[c]!=f[g])h=false;if(h&&b!=a[c]){d.push(a[c]);b=a[c]}}return d};Moousture.LevenMatcher=new Class({Implements:[Moousture.GestureMatcher],onMatch:function(a){var e=this.mCallbacks.length;if(!(e<1)){for(var b=0,d=this.levenDistance(a,this.mGestures[0]),c=1;c<e;c++){var f=this.levenDistance(a,this.mGestures[c]);if(f<d){d=f;b=c}}this.mCallbacks[b](d/a.length)}},levenDistance:function(a,e){var b=[],d,c,f;for(d=0;d<a.length;d++)b[d]=[];b[0][0]=a[0]!=e[0]?1:0;for(d=1;d<a.length;d++)b[d][0]=b[d-1][0]+1;for(c=1;c<e.length;c++)b[0][c]=b[0][c-1]+1;for(d=1;d<a.length;d++)for(c=
1;c<e.length;c++){f=0;if(a[d]!=e[c])f=1;b[d][c]=b[d-1][c]+1;if(b[d][c]>b[d][c-1]+1)b[d][c]=b[d][c-1]+1;if(b[d][c]>b[d-1][c-1]+f)b[d][c]=b[d-1][c-1]+f}return $pick(b[a.length-1][e.length-1],0)}});
Moousture.ReducedLevenMatcher=new Class({Implements:[Moousture.LevenMatcher],options:{reduceConsistency:2},reduce:function(a){return Moousture.Util.nPairReduce(a,this.options.reduceConsistency)},onMatch:function(a){a=this.reduce(a);var e=this.mCallbacks.length;if(!(e<1||!$defined(a[0]))){for(var b=0,d=this.levenDistance(a,this.mGestures[0]),c=1;c<e;c++){var f=this.levenDistance(a,this.mGestures[c]);if(f<d){d=f;b=c}}this.mCallbacks[b](d/a.length)}}});Moousture.JaroMatcher=new Class({Implements:[Moousture.GestureMatcher],options:{reduceConsistency:2},onMatch:function(a){a=Moousture.Util.nPairReduce(a,this.options.reduceConsistency);var e=this.mCallbacks.length;if(!(e<1)){for(var b=0,d=1-this.jaroDistance(a,this.mGestures[0]),c=1;c<e;c++){var f=1-this.jaroDistance(a,this.mGestures[c]);if(f<d){d=f;b=c}}this.mCallbacks[b](d)}},jaroDistance:function(a,e){var b=a.length>e.length?a.length:e.length,d=b/2,c=[],f=[],h=0,g=0;for(h=0;h<e.length;h++){h<a.length&&
c.push(false);f.push(false)}var i=0;for(h=0;h<a.length;h++){g=h-d;var j=h+d;if(j>b)j=b;if(g<0)g=0;for(g=g;g<j;g++)if(!f[g]&&a[h]==e[g]){i++;c[h]=f[g]=true;break}}if(i===0)return 0;for(h=d=b=0;h<c.length;h++)if(c[h])for(g=b;g<f.length;g++)if(f[g]){b=g+1;if(a[h]!=e[g])d+=0.5;else break}c=(i/a.length+i/e.length+(i-d)/i)/3;if(c>1)c=1;return c}});
