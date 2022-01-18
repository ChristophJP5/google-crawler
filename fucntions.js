const getSearchResults = async (page) => {
  try {
    await page.waitForSelector("#search", { timeout: 2000 });
  } catch (e) {}
  await checkForRecpatcha(page);
  await page.waitForTimeout(random(100));
  return await page.evaluate(() => {
    let elements = document.querySelectorAll("#search a[data-ved][ping]");
    return Array.from(elements).map((a) => {
      return {
        link: a.href,
        text: a.parentNode?.nextSibling?.innerText ?? "VIDEO OR NO DESCRIPTION",
      };
    });
  });
};
const random = (max) => Math.random() + 30 * max * Math.random();
const getTimeout = async (max) => await setTimeout(() => {}, random(max));

const getResults = async (page, company) => {
  const rows = [];
  await page.click("[name=q]");
  await checkForRecpatcha(page);
  await page.evaluate(() => {
    document.querySelector("[name=q]").value = "";
  });
  await checkForRecpatcha(page);
  await page.keyboard.type(`"${company}" ERP`);
  await checkForRecpatcha(page);

  // you forgot this
  await page.keyboard.press("Enter");
  page.waitForNavigation({ waitUntil: "networkidle2", delay: 4000 });

  // wait for search results
  // await page.waitForTimeout(random(400));
  const page1 = await getSearchResults(page);
  await page.waitForTimeout(random(200));
  let page2 = [];

  page.waitForSelector("#xjs");
  await page.waitForTimeout(random(20));

  try {
    await page.click('#xjs [aria-label="Page 2"]');
    page.waitForNavigation({ waitUntil: "networkidle2", delay: 4000 });
    page2 = await getSearchResults(page);
  } catch (e) {}

  [...page1, ...page2].forEach((e) => {
    rows.push(`'${company}';'${e.text.replace(/'|;/g, "")}';'${e.link}'`);
  });
  return rows;
};

const confirmDSGVO = async (page) => {
  try {
    await page.waitForSelector("#L2AGLb");
    await page.evaluate(() => {
      document.querySelector("#L2AGLb").click();
    });
  } catch (e) {
    await page.waitForSelector('[value="Ich stimme zu"]');
    await page.evaluate(() => {
      document.querySelector('[value="Ich stimme zu"]').click();
    });
  }
};

const checkForRecpatcha = async (page) => {
  try {
    const element = await page.evaluate(() =>
      document.querySelector('[title="reCAPTCHA"]')
    );
    if (element != null) {
      console.log("!RECAPTCHA DETECTED!");
      await page.waitForTimeout(2000);
      await checkForRecpatcha(page);
    }
  } catch (e) {}
};

module.exports = {
  random,
  confirmDSGVO,
  getResults,
  getSearchResults,
};
