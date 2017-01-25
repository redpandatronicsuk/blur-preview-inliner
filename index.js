/**
 * A script for replacing images in HTML with tiny 
 * (10px max width or height) smooth blurred base64
 * inlined images, which will smoothly fade to the
 * full resolution image once it is loaded.
 * 
 * We use juice to inline styles before processing,
 * as cheerio can only give us inline styles. Maybe
 * phantom can be used instead in a future version
 * instead of cheerio...
 */

const fs = require('fs');
const request = require('request');
var juice = require('juice');
const cheerio = require('cheerio');
const sharp = require('sharp');

const filename = process.argv[2];
const blurImgSize = process.argv[3] ? Number(process.argv[3]) : 10;

const $ = cheerio.load(juice(fs.readFileSync(filename, 'utf-8')));
const imgs = $('img');

let openRequests = 0;

imgs.each((idx, element) => {
    let img = $(element);
    let md, heightScaler, widthScaler, newWidth, newHeight, percentageTooSmall;
    openRequests++;
    request({
        url: img[0].attribs.src,
        encoding: null
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            sharp(new Buffer(body, 'binary')).metadata((err, data) => {
                md = data;
                console.log('md', md);
                console.log('Old width and height', md.width, md.height);
                if (md.width > md.height) {
                    widthScaler = blurImgSize / md.width;
                    mewWidth = blurImgSize;
                    newHeight = md.height * widthScaler;
                    let decimalPart = newHeight % 1;
                    percentageTooSmall = decimalPart / newHeight;
                    console.log({widthScaler, newWidth, newHeight, decimalPart, percentageTooSmall});
                }
            })
                .resize(blurImgSize)
                .toBuffer()
                .then(data => {
                    var base64Image = data.toString('base64');
                    // console.log('base64', base64Image, 'meta', md);
                    // console.log('img', img);
                    //console.log('style', img[0].attribs.style);
                    img.addClass('sharp');
                    //img[0].attribs.onload = 'this.classList.add("loaded"); this.previousSibling.remove()';
                    let imgHTML = img.html();
                    console.log('imgHTML', imgHTML);
                    img.replaceWith(`
                    <div class="blur-img-container" style="${img[0].attribs.style}">
                        <img class="preview" src="data:image/${md.format};base64,${base64Image}" height="${String(md.height - md.height * percentageTooSmall)}" width="${String(md.width)}">
                        <img class="sharp" onload="onImgLoad(this)" src="${img[0].attribs.src}" height="${String(md.height)}" width="${String(md.width)}">
                        ${imgHTML}
                    </div>`);
                    openRequests--;
                    writeFileIfFinished($, openRequests);
                });
        } else {
            openRequests--;
            writeFileIfFinished($, openRequests);
        }
    })
});

// for (let i = 0; i < imgs.length; i++) {     let img = imgs[i]; }

function writeFileIfFinished($, openRequests) {
    console.log('openRequests-', openRequests);
    if (openRequests === 0) {
        $('head').append(`
        <style>
            div.blur-img-container {
                position: relative;
                padding: 0 !important;
            }

            div.blur-img-container img {
                width: 100%;
                height: auto;
            }

            img.sharp {
                opacity: 0;
                position: absolute;
                top: 0;
                left: 0;
            }

            img.sharp.loaded {
                animation: fadeIn 2s;
                animation-fill-mode: both;
            }

            img.preview {
                position: absolute;
                top: 0;
                left: 0;
            }

            @keyframes fadeIn {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
        </style>
        <script>
            function onImgLoad(img) {
                img.classList.add('loaded');
                setTimeout(()=>{img.parentNode.children[0].remove()}, 2000);
            }
        </script>
        `);
        //console.log($.html());
        let lidx = filename.lastIndexOf('.');
        let outFileName = filename.slice(0,  + lidx) + '-blurview' + filename.slice(lidx);
        fs.writeFileSync(outFileName, $.html(), 'utf-8');
    }
}