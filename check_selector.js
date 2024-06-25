const puppeteer = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteerExtra = require('puppeteer-extra');
var Xvfb = require('xvfb');
const fs = require('fs');

// Function to read the cookies.js script
const loadCookiesScript = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./cookies.js', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

var xvfb = new Xvfb({
    silent: true,
    reuse: true,
    xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
});
// xvfb.startSync((err)=>{if (err) console.error(err)});

// Function to scroll and load more content
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);

                    resolve();
                }
            }, 100);
        });
    });
}

args = {
    args: [
        // enable FLoC
        '--no-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--start-maximized',
        // '--incognito',
        // '--display='+xvfb._display,
	//`--disable-extensions-except=./extn_src/adblock_v2`,
        //`--load-extension=./extn_src/adblock_v2`,
    ]
};
args.executablePath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome';
// args.executablePath = '/usr/bin/chromium-browser';
args.headless = false;

puppeteerExtra.default.use(StealthPlugin());

for (let i = 0; i < 1; i++){
    puppeteerExtra.default.launch(args).then(async browser => {
    // puppeteer.launch(args).then(async browser => {
        // const browser = await puppeteer.launch(args);

        // Adblock
        
        
        await new Promise(r => setTimeout(r, 2000));
        const context = await browser.createIncognitoBrowserContext();
        await new Promise(r => setTimeout(r, 5000));

        const page = await context.newPage();
        page.setDefaultTimeout(30000);

        // URL to visit
        const url1 = 'https://www.geeksforgeeks.org/deletion-in-linked-list/';
        const url2 = 'https://stackoverflow.com/questions/67698176/error-loading-webview-error-could-not-register-service-workers-typeerror-fai'
        const url3 = 'https://www.nytimes.com'

        try{    
            await page.goto(url1, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 5000));
        } catch(e){
            console.error(`Nooooooooooo: ${e}`);
            await browser.close();
            return;
        }

        // Load and execute the cookies.js script
        const cookiesScript = await loadCookiesScript();
        const iframes = await page.evaluate(new Function(cookiesScript));

        for (let iframe=0; iframe<iframes.length; iframe++){
            const subframes = await iframes[iframe].evaluate(new Function(cookiesScript));
            await new Promise(r => setTimeout(r, 2000));
        }
        
        await new Promise(r => setTimeout(r, 2000));
        await autoScroll(page);

        console.error('\nREACHED HERE\n');

        page.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i)
                console.error(`${i}: ${msg.args()[i]}`);
        });


        await page.screenshot({
            path: `screenshot_${i}.jpg`
        });

        // await new Promise(r => setTimeout(r, 5000));
        page.close()
        await browser.close();
    });
}
xvfb.stopSync();

