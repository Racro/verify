const puppeteer = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteerExtra = require('puppeteer-extra');
var Xvfb = require('xvfb');

var xvfb = new Xvfb({
    silent: true,
    reuse: true,
    xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
});
// xvfb.startSync((err)=>{if (err) console.error(err)});

args = {
    args: [
        // enable FLoC
        '--no-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--start-maximized',
        // '--display='+xvfb._display,
        `--disable-extensions-except=./extn_src/adblock_v2,./extn_src/extension`,
        `--load-extension=./extn_src/adblock_v2,./extn_src/extension`,
    ]
};
args.executablePath = '/tmp/chrome_97/chrome';
// args.executablePath = '/usr/bin/google-chrome';
args.headless = false;

puppeteerExtra.default.use(StealthPlugin());
puppeteerExtra.default.launch(args).then(async browser => {
// puppeteer.launch(args).then(async browser => {
    // const browser = await puppeteer.launch(args);

    // Adblock
    await new Promise(r => setTimeout(r, 10000));

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    // Array of selectors to check
    const selectors = ['[id^="google_ads_iframe"]', '[name^="google_ads_iframe"]', 'div[data-google-query-id]'];

    // URL to visit
    const url1 = 'https://www.geeksforgeeks.org/deletion-in-linked-list/';
    const url2 = 'https://stackoverflow.com/questions/67698176/error-loading-webview-error-could-not-register-service-workers-typeerror-fai'

    await page.goto(url1, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));

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


    await autoScroll(page);

    console.error('\nREACHED HERE\n');

    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i)
            console.error(`${i}: ${msg.args()[i]}`);
    });

    let source = await page.content();
    console.log(`PAGE_CONTENT: ${source}`);

    // for (const selector of selectors) {
    //     // console.error(`SELECTOR: ${selector}`);
    //     const exists = await page.evaluate((selector) => {
    //         return document.querySelector(selector) !== null;
    //     }, selector);

    //     if (exists) {
    //         console.log(`Selector "${selector}" found on the page.`);
    //     } else {
    //         console.log(`Selector "${selector}" NOT found on the page.`);
    //     }
    // }

    await new Promise(r => setTimeout(r, 100000));

    await browser.close();
});
xvfb.stopSync();

