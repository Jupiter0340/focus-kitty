var KittyRoom = (() => {
  let canvas, ctx, running = false, happyUntil = 0, previous = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const C = { wall: '#eee0c5', line: '#b49a76', wood: '#a77b53', dark: '#76563e', pale: '#f9efd9', sage: '#7e8b5a', leaf: '#586d45', sky: '#b9d0c1', cat: '#e2a45d', fur: '#f7dca6', outline: '#73523b' };
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
  function pot(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);rect(8,-33,4,38,C.leaf);rect(-3,-29,13,7,C.sage);rect(-7,-35,11,6,C.sage);rect(11,-43,14,7,C.leaf);rect(19,-49,9,6,C.leaf);rect(12,-16,14,6,C.sage);rect(0,0,24,5,C.dark);rect(2,5,20,22,'#ba7957');rect(6,27,12,4,C.dark);rect(4,6,4,17,'#d69a71');ctx.restore();}
  function book(x,y,w,h,c){rect(x,y,w,h,c);rect(x+2,y+3,w-4,2,'#ecdcbb');rect(x+2,y+h-5,w-4,2,'#ecdcbb');}
  function draw(t){
    ctx.imageSmoothingEnabled=false;
    rect(0,0,576,360,C.wall);
    // Wallpaper vertical stitches and wainscoting.
    for(let x=14;x<576;x+=32){for(let y=14;y<246;y+=32){rect(x,y,2,3,'#dfcfaf');rect(x-1,y+1,4,1,'#dfcfaf');}}
    rect(0,248,576,7,C.wood);rect(0,255,576,105,'#d5b58b');rect(0,255,576,4,'#b68d63');
    for(let y=280;y<360;y+=27){rect(0,y,576,2,'#bc986e');for(let x=(y%2?20:72);x<576;x+=112)rect(x,y-24,2,24,'#c39f75');}
    // Large recessed window and view across the hills.
    rect(55,49,192,153,C.dark);rect(61,55,180,139,C.wood);rect(69,62,164,124,C.sky);
    rect(181,73,22,22,'#f7e6ac');rect(177,77,30,14,'#f7e6ac');
    rect(81,87,32,8,'#eef0d6');rect(89,82,17,5,'#eef0d6');rect(105,91,19,5,'#eef0d6');
    rect(70,145,32,41,'#9fae83');rect(102,137,39,49,'#9fae83');rect(141,151,40,35,'#9fae83');rect(181,139,52,47,'#9fae83');rect(70,168,163,18,'#788d65');
    rect(148,60,7,130,C.wood);rect(69,122,164,6,C.wood);rect(55,194,194,8,C.dark);rect(49,201,205,8,C.wood);rect(49,201,205,3,'#c39669');
    // Curtains and warm light on the floor.
    rect(44,42,217,5,C.dark);rect(48,47,24,100,'#e4c49c');rect(51,47,5,100,'#d8b187');rect(62,47,5,100,'#eed3ae');rect(232,47,24,100,'#e4c49c');rect(235,47,5,100,'#d8b187');rect(246,47,5,100,'#eed3ae');rect(48,144,24,6,'#b98b63');rect(232,144,24,6,'#b98b63');
    rect(84,263,116,20,'#e5c99b');rect(70,283,155,20,'#e5c99b');rect(55,303,190,16,'#e5c99b');rect(132,263,5,56,'#d5b58b');
    // Shelf, books, framed paw print and a trailing plant.
    rect(348,85,167,7,C.dark);rect(348,79,167,7,C.wood);rect(359,92,5,16,C.wood);rect(499,92,5,16,C.wood);
    book(364,44,12,35,'#859070');book(379,38,11,41,'#bc785a');book(393,49,14,30,'#d2b17b');rect(420,45,33,34,C.dark);rect(424,49,25,26,C.pale);rect(432,55,3,4,'#bc8e60');rect(439,55,3,4,'#bc8e60');rect(432,62,10,7,'#bc8e60');
    pot(474,51,.8);rect(504,87,5,34,C.leaf);rect(508,107,9,5,C.sage);rect(500,97,8,5,C.sage);rect(503,121,4,10,C.leaf);
    // Small desk with book, steaming tea, a little lamp and wooden stool.
    rect(322,190,207,11,C.dark);rect(316,181,219,11,C.wood);rect(316,181,219,3,'#c49a70');rect(333,201,10,74,C.dark);rect(510,201,10,74,C.dark);rect(344,205,165,31,'#bb9067');rect(350,211,153,18,'#cda47a');rect(416,216,20,4,C.dark);
    rect(368,171,53,8,'#a87350');rect(370,168,22,6,C.pale);rect(395,169,24,5,'#ede0bf');rect(393,168,2,9,C.dark);
    rect(436,164,17,17,'#ede2be');rect(453,167,7,10,C.dark);rect(453,169,4,6,C.wall);rect(436,178,18,3,'#c3a477');
    if(!reduced.matches){let steam=Math.floor(t/500)%3;rect(442,153-steam*2,2,6,'#c7bba4');rect(447,150-steam,2,5,'#c7bba4');}
    rect(486,140,4,37,C.dark);rect(477,176,22,5,C.dark);rect(478,122,20,8,'#7f8c60');rect(473,130,30,12,'#7f8c60');rect(470,142,36,4,C.dark);
    rect(443,264,48,8,C.dark);rect(446,260,42,7,'#ba8e61');rect(450,272,6,35,C.dark);rect(480,272,6,35,C.dark);rect(453,292,30,4,C.wood);
    // Tall plant and basket.
    pot(32,248,1.8);rect(20,307,58,5,'#be986a');rect(24,312,50,25,'#b58d60');for(let x=27;x<72;x+=9)rect(x,313,2,22,'#ceb083');
    // Pixel rug and cushion, shadow, cat.
    rect(215,282,179,8,'#b98b69');rect(196,290,218,30,'#b98b69');rect(210,320,190,10,'#b98b69');rect(223,330,163,5,'#b98b69');rect(215,291,179,29,'#cfaa82');rect(228,284,151,7,'#cfaa82');rect(226,320,157,7,'#cfaa82');
    rect(263,294,97,8,'#8b8b61');rect(254,301,116,16,'#8b8b61');rect(263,317,98,5,'#8b8b61');rect(260,299,104,13,'#a4a47a');
    // Tiny yarn ball and framed wall note.
    rect(174,283,19,16,'#b87459');rect(170,287,27,9,'#b87459');rect(175,285,3,12,'#d69879');rect(182,283,2,16,'#d69879');rect(192,294,20,2,'#b87459');rect(209,291,2,5,'#b87459');
    rect(277,101,40,46,'#a77952');rect(281,105,32,38,C.pale);rect(289,114,16,2,'#c5b48c');rect(286,121,20,2,'#c5b48c');rect(291,129,10,5,'#a5aa7c');
    if(running){rect(398,221,3,3,C.dark);rect(405,221,3,3,C.dark);rect(412,221,3,3,C.dark);}
  }
  function loop(t){if(t-previous>120){draw(t);previous=t;}requestAnimationFrame(loop);}
  return { init(el){canvas=el;ctx=canvas.getContext('2d');draw(0);requestAnimationFrame(loop);},setRunning(value){running=value;},pet(){happyUntil=Date.now()+2200;} };
})();
