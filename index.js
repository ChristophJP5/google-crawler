const puppeteer = require("puppeteer-extra");
const fs = require("fs");
var userAgent = require("user-agents");
const {
  getSearchResults,
  getResults,
  confirmDSGVO,
  random,
} = require("./fucntions");
const UserAgent = require("user-agents");
// console.log();

const companies = fs
  .readFileSync("companies.csv")
  .toString()
  .split("\r\n")
  .reverse();
let rows = [];
async function gsearch() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1080,720",
      "--remote-debugging-port=9222",
      "--remote-debugging-address=0.0.0.0", // You know what your doing?
      "--disable-gpu",
      "--disable-features=IsolateOrigins,site-per-process",
      "--blink-settings=imagesEnabled=true",
      "--allow-external-pages",
      "--allow-third-party-modules",
      "--data-reduction-proxy-http-proxies",
    ],
  });
  const page = await browser.newPage();
  let userAgent = new UserAgent([
    /Chrome/,
    {
      connection: {
        type: "wifi",
      },
      platform: "MacIntel",
    },
  ]).toString();
  await page.setUserAgent(userAgent);

  await page.goto("https://google.com");
  await page.waitFor(random(209));
  console.log("go");
  await confirmDSGVO(page);
  for (const companyId in companies) {
    const company = companies[companyId];
    rows = [...rows, ...(await getResults(page, company))];
    fs.writeFileSync("google_export.csv", rows.join("\n"));
  }

  setTimeout(() => {
    browser.close();
  }, 4000);
}

gsearch();
