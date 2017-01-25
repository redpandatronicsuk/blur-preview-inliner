#!/usr/bin/env node

/**
 * A script for replacing images in HTML with tiny 
 * (10px max width or height) smooth blurred base64
 * inlined images, which will smoothly fade to the
 * full resolution image once it is loaded.
 * 
 * We use juice to inline styles before processing,
 * as cheerio can only give us inline styles. Maybe
 * phantom can be used in a future version instead
 * of cheerio...
 */

const fs = require('fs');
const request = require('request');
var juice = require('juice');
const cheerio = require('cheerio');
const sharp = require('sharp');

const filename = process.argv[2];
const blurImgSize = process.argv[3] ? Number(process.argv[3]) : 10;
const transitionDuration = process.argv[4] ? Number(process.argv[4]) : 2000;

const $ = cheerio.load(juice(fs.readFileSync(filename, 'utf-8')));
const imgs = $('img');

let openRequests = 0;

imgs.each((idx, element) => {
    let img = $(element);
    let md;
    openRequests++;
    request({
        url: img[0].attribs.src,
        encoding: null
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            sharp(new Buffer(body, 'binary')).metadata((err, data) => {
                md = data;
            })
                .resize(blurImgSize)
                .toBuffer()
                .then(data => {
                    var base64Image = data.toString('base64');
                    img.addClass('sharp');
                    let imgHTML = img.html();
                    console.log('imgHTML', imgHTML);
                    img.replaceWith(`
                    <div class="blur-img-container" style="${img[0].attribs.style}">
                        <div class="blur-imgs-wrap">
                            <img class="preview" src="data:image/${md.format};base64,${base64Image}">
                            <img class="sharp" onload="onImgLoad(this)" src="${img[0].attribs.src}">
                            ${imgHTML}
                        </div>
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

function writeFileIfFinished($, openRequests) {
    console.log('openRequests-', openRequests);
    if (openRequests === 0) {
        $('head').append(`
        <style>
            div.blur-img-container {
                position: relative;
                padding: 0 !important;
            }

            div.blur-imgs-wrap {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            div.blur-img-container img {
                width: 100%;
            }

            img.sharp {
                opacity: 0;
            }

            img.sharp.loaded {
                animation: fadeIn ${transitionDuration / 1000}s;
                animation-fill-mode: both;
            }

            img.preview {
                position: absolute;
                transition: height .5s, width .5s;
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
                var blurSibling = img.parentElement.children[0];
                var bb = img.getBoundingClientRect();
                blurSibling.style.height = bb.height + 'px';
                blurSibling.style.width = bb.width + 'px';
                img.classList.add('loaded');
                setTimeout(()=>{img.parentNode.children[0].remove()}, ${transitionDuration});
            }
        </script>
        `);
        let lidx = filename.lastIndexOf('.');
        let outFileName = filename.slice(0,  + lidx) + '-blurview' + filename.slice(lidx);
        console.log('Writing to file: %s...', outFileName);
        fs.writeFileSync(outFileName, $.html(), 'utf-8');
        console.log('Done!');
    }
}