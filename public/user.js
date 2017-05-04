var socket = io();
var canvas = document.getElementById('cnvs'),
var ctx = canvas.getContext('2d'),
var canvasData = {
        width: 0,
        height: 0,
        pixels: null
    };
var drawing = {
        current: false,
        loc: {
            x: 0,
            y: 0
        },
        color: {
            r: 0,
            g: 0,
            b: 0
        },
        button: -1
    };
var cp_canvas = document.getElementById('colors');
var cp_ctx = cp_canvas.getContext("2d");

// Prevent right click context menu
canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Prevent double click/dragging selections on page
canvas.onmousedown = function() {
    return false;
};

canvas.addEventListener('mousedown', function(e) {
    drawing.button = e.button;
    drawing.current = true;
    drawing.loc = getPixel(canvas, e);

    drawPixel(drawing.loc, drawing.button == 0 ? drawing.color : {'r': 255, 'g': 255, 'b' : 255});
});

canvas.addEventListener('mousemove', function(e) {
    if(!drawing.current) {
        return;
    }
    
    var loc = getPixel(canvas, e);
    
    if(loc.x == drawing.loc.x && loc.y == drawing.loc.y) {
        return;
    }
    
    drawing.loc = loc;
    drawPixel(drawing.loc, drawing.button == 0 ? drawing.color : {'r': 255, 'g': 255, 'b' : 255});
});

canvas.addEventListener('mouseup', function() {
    drawing.button = -1;
    drawing.current = false;
});

canvas.addEventListener('mouseout', function() {
    drawing.button = -1;
    drawing.current = false;
});

// Data received on connect
socket.on('canvas', function(data) {
    canvasData = data;
    drawCanvas();
});

// Drawings from other users
socket.on('draw', function(drawing) {
    canvasData.pixels[drawing.x][drawing.y] = drawing.c;
    drawCanvas();
});

// Fill colour picker canvas with gradients
for(var x = 0; x < 256; x++) {
    for(var y = 0; y < 256; y++) {
        color = HSVtoRGB(x / 256.0, 1, y / 256.0);
        cp_ctx.fillStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        cp_ctx.fillRect(x, y, 1, 1);
    }
}

// Respond to choosing new colours
cp_canvas.addEventListener('mousedown', function(e) {
    var position = getPosition(cp_canvas, e);
    
    var color = HSVtoRGB(position.x / 256, 1, position.y / 256);
    console.log(color);
    drawing.color = color;
});

//
// Functions
//

// Send drawing to server and change pixels locally
function drawPixel(loc, color) {
    socket.emit('draw', {
            x: loc.x,
            y: loc.y,
            c: color
        });
    
    canvasData.pixels[loc.x][loc.y] = color;
    drawCanvas();
}

// Update canvas with current pixels
function drawCanvas() {
    for(var x = 0; x < canvasData.width; x++) {
        for(var y = 0; y < canvasData.height; y++) {
            ctx.fillStyle = 'rgb(' + canvasData.pixels[x][y].r + ',' + canvasData.pixels[x][y].g + ',' + canvasData.pixels[x][y].b + ')';
            ctx.fillRect(x * (800 / canvasData.width), y * (800 / canvasData.height), (800 / canvasData.width), (800 / canvasData.height));
        }
    }
}

// Get coordinate position of a MouseEvent within a canvas
function getPosition(canvas, mouseEvent) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(mouseEvent.clientX - rect.left),
      y: Math.floor(mouseEvent.clientY - rect.top)
    };
}

// Get coordinate indices of "pixel" that a canvas coordinate is within
function getPixel(canvas, mouseEvent) {
    var position = getPosition(canvas, mouseEvent);

    return {
      x: Math.floor(position.x / (800 / canvasData.width)) % canvasData.width,
      y: Math.floor(position.y / (800 / canvasData.height)) % canvasData.height
    };
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}