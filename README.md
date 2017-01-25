<script>
    function onImgLoad(img) {
        //img.classList.add('loaded');
        img.style.opacity = 1;
        setTimeout(()=>{img.parentNode.children[0].remove()}, 2000);
    }
</script>

# blur-preview-inliner
Tool for process HTML files to replace img tags with an inlined, low resolution, blurred preview image which is shown instantly and fades away once the higher resolution image had finished loading.

## Example
<div style="padding: 5px; width: 30%; height: auto; position: relative; padding: 0 !important;">
    <div style="display: flex; align-items: center; justify-content: center;">
        <img style="position: absolute; transition: height .5s, width .5s;" src="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgUH/8QAIxAAAgAFAwUBAAAAAAAAAAAAAQIAAwQRIQUHEgYTIjGRgf/EABQBAQAAAAAAAAAAAAAAAAAAAAT/xAAXEQEBAQEAAAAAAAAAAAAAAAABAEEh/9oADAMBAAIRAxEAPwC3uD36LX6xFqAkhSW4iZcZ8jcfYVJuD0wlLJWZ04zOqKGN1ybQtx5sy2upzbh3h43xkC+PwfBGZH2YGg5Kzt//2Q==">
        <img style="opacity: 0; transition: 1s;" onload="onImgLoad(this)" src="https://melaniekillingervowell.files.wordpress.com/2011/11/lion-wild-animal-sanctuary.jpeg">
        
    </div>
</div>

## Installation
You need to have Node installed to use blur-preview-inliner. If you haven't already installed it, I recommend using [NVM](https://github.com/creationix/nvm) for Macs and Linux and [NVM-Windows](https://github.com/coreybutler/nvm-windows) or [Nodist](https://github.com/marcelklehr/nodist) for Windows.
### Option 1 - NPM
Install it globally with `npm i -g blur-preview-inliner`. Then you will be able to use it with the `bpi` command.
### Option 2 - Git
Clone this repository `git clone ....`, cd into the directory and then type `npm i` to install the dependencies. Then you will be able to use it by running inside the folder with `./index.js`. It is recommended to set up an alias `bpi` pointing to the index.js file.

Once installed (and alias set up in case you installed it using Git) we can type `bpi` in any directory to to invoke the blur-image-inliner.

```
bpi <filename> [resize-size] [transition-duration-in-milliseconds]
```

The `filename` argument is the only one required and is the name of the input HTML file.
`resize-size` is the size the largest dimension of the image to be resized to. For example, if the input image dimension is *100x20*, with a `resize-size` of *10*, the blur preview image will be of size *10x2*, i.e. the largest dimension gets resized to the specified size and the smaller dimension gets resized accordingly to keep the same aspect ratio. The default value for `resize-size` is **10**.
`transition-duration-in-milliseconds` is the duration of the blurred to sharp transition. The default value is 2000, i.e. 2 seconds.

## Example
Have a look in the [example](https://github.com/redpandatronicsuk/blur-preview-inliner/tree/master/example) folder. You will find the input file `hi-res-animals.html` and the blur-preview-inlined file `hi-res-animals-blurview.html`. You can check that you installation works by going into the example directory, deleting the file `hi-res-animals-blurview.html` and then recreate it wiht this command `bpi hi-res-animals.html`. You can also play around with the parameters, for example `bpi hi-res-animals.html 20 5000` to make the blur preview images 20 pixels in size on its longest axis and the blur-to-sharp animation to have a duration of 5 seconds.

Use 1 if you just want to use the average color of the image. Otherwise values between 5-10 are recommended, obviously this depends on the source image size and other factors. Using too large values will make the inlined image too large and the preview looks more like a low resolution version of the sharp image, rather than a blurred preview.

## How it works
The script scans the input HTML file for `img` tags. Then it extracts the `src` attribute of each image, it downloads the image, resizes the image and wraps the original `img` tag in a `div` alongside with the resized, inlined preview image. Because the preview image is inlined, it can be shown as soon as the HTML for it loaded. Although the inlined preview image is much smaller than the original one, we resize it to the size of the original image. The browser will smoothly resize the image, so rather than looking pixely, it looks blurry. Roughly speaking, input

```html
<img src="http://foo.bar/qux.jpg" style="padding: 5px; width: 30%; height: auto;">
```

will get transformed to

```html
<div class="blur-img-container" style="padding: 5px; width: 30%; height: auto;">
    <div class="blur-imgs-wrap">
        <img class="preview" src="data:image/jpeg;base64,/9j/2wBD... ">
        <img class="sharp" onload="onImgLoad(this)" src="http://foo.bar/qux.jpg">
    </div>
</div>
```