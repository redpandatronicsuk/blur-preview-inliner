<script>
    function onImgLoad(img) {
        img.classList.add('loaded');
        setTimeout(()=>{img.parentNode.children[0].remove()}, 2000);
    }
</script>

# blur-preview-inliner
Tool for process HTML files to replace img tags with an inlined, low resolution, blurred preview image which is shown instantly and fades away once the higher resolution image had finished loading.


<div class="blur-img-container">
    <img class="preview" src="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAIG/8QAHxAAAgAGAwEAAAAAAAAAAAAAAQIAAwUREhMUIUEx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwb/xAAZEQACAwEAAAAAAAAAAAAAAAACIQABA0H/2gAMAwEAAhEDEQA/ANBVqtxZeSbTobLEmwf50ffYla+kxQ4kuAwuBcdQhEfiAlm67GFi5//Z" height="1600" width="2560">
    <img class="sharp" onload="onImgLoad(this)" src="http://kingofwallpapers.com/animal/animal-021.jpg" height="1600" width="2560">
</div>