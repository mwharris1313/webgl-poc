// =================================================================
function loadImage(url, callback) {
	var image = new Image();
	image.src = url;
	image.onload = callback;
	return image;
}

function loadImages(urls, callback) {
	var images = [];
	var imagesToLoad = urls.length;
 
	var onImageLoad = function() {
		imagesToLoad--;
		if (imagesToLoad == 0) callback(images); // all images loaded
	};
 
	for (var i = 0; i < imagesToLoad; i++) {
		var image = loadImage(urls[i], onImageLoad);
		images.push(image);
	}
}