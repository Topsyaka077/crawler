const fs = require('fs');
const {JSDOM} = require('jsdom');
const path = require('path');

async function getImages(host, depth, currentDepth) {
    const domContent = await fetch(host).then(data => data.text()).catch(e => console.log(e));
    const dom = new JSDOM(domContent)

    const images = [...dom.window.document.body.querySelectorAll('img')].map(item => ({
        imageUrl: item.src,
        sourceUrl: host,
        depth: currentDepth,
    }));
    if (depth === currentDepth) {
        return images;
    }

    const nestedPromises = [...dom.window.document.body.querySelectorAll('a')].map(item => item.href).map((link) => {    
        const linkToGo = link.includes('http') ? link : `${host}${link}`;
        return getImages(linkToGo, depth, currentDepth + 1)
    });
    const nestedImages = (await Promise.all(nestedPromises)).flat()
    return [...images, ...nestedImages]

}


async function main(host, depth) {
    const res = await getImages(host, +depth, 0);
    fs.writeFileSync(path.resolve(__dirname, 'result.json'), JSON.stringify({
        results: res
    }))
}

main(...process.argv.slice(2));