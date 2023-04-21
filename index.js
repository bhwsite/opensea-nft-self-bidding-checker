const fs = require('fs');
const { chromium } = require('playwright');
const colors = require('colors');
const { newInjectedContext } = require('fingerprint-injector');
const config = require('./config.json');

async function run() {
  // read collections.txt file
  let collections = fs.readFileSync('collections.txt', 'utf8').split('\n');

  // initialize browser and context
  const browser = await chromium.launch({ headless: config.browserHidden });
  // const context = await browser.newContext();
  const context = await newInjectedContext(browser);

  // iterate over the collections
  for (let i = 0; i < collections.length; i++) {
    const contractAddress = collections[i];
    const page = await context.newPage();

    // navigate to the Opensea NFT page for this contract
    await page.goto(`https://opensea.io/assets/ethereum/${contractAddress}`);

    // Wait for the element with the given data-testid to be available
    await page.waitForSelector(
      '[data-testid="collection-description-metadata-items"]'
    );

    // get total number of items value
    const totalItems = await page.$eval(
      '[data-testid="collection-description-metadata-items"] span div',
      (el) => {
        return parseInt(el.innerText) || 0;
      }
    );

    console.log(
      `Total number of items for contract ${contractAddress}: ${totalItems}`
        .yellow
    );

    // iterate through each NFT item (assuming token IDs go from 1 to totalItems)
    for (let tokenId = 1; tokenId <= totalItems; tokenId++) {
      try {
        console.log(` > Checking ${contractAddress}: token: ${tokenId}`.cyan);
        // navigate to individual NFT's page
        await page.goto(
          `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`
        );

        // wait for Offers
        await page.waitForTimeout(2000);
        await page.waitForSelector('.AccountLink--ellipsis-overflow');
        //   await page.waitForSelector('.sc-14fccef8-1.jzkPyk');

        // '.AccountLink--ellipsis-overflow'
        const ownerName = await page.$eval(
          '.AccountLink--ellipsis-overflow',
          (el) => {
            return el.innerText.trim();
          }
        );

        // Evaluate a function in the context of the page to extract the JSON data
        const data = await page.$$eval('.sc-14fccef8-1.jzkPyk', (rows) => {
          return rows.slice(1).map((row) => {
            return row.innerText;
            //   console.log('row: ', row);
            //   const cells = row.querySelectorAll('.sc-14fccef8-2.iweGcL');
            //   const price = cells[0]
            //     .querySelector('.Price--amount')
            //     .textContent.trim();
            //   const usdPrice = cells[1]
            //     .querySelector('.sc-bgqQcB.ebRKPp.jgQAZf')
            //     .textContent.trim();
            //   const quantity = cells[2].textContent.trim();
            //   const floorDifference = cells[3]
            //     .querySelector('.sc-bgqQcB.hudzZk.jgQAZf')
            //     .textContent.trim();
            //   const expiration = cells[4]
            //     .querySelector('.bwyjel.eaYqyk')
            //     .textContent.trim();
            //   const from = cells[5]
            //     .querySelector('.jXfGGU.AccountLink--ellipsis-overflow')
            //     .textContent.trim();

            //   console.log({
            //     price,
            //     usdPrice,
            //     quantity,
            //     floorDifference,
            //     expiration,
            //     from,
            //   });

            //   return {
            //     price,
            //     usdPrice,
            //     quantity,
            //     floorDifference,
            //     expiration,
            //     from,
            //   };
          });
        });

        // Extract header row
        const header = data[1].split('\n');

        // Parse remaining rows
        const parsedData = data.slice(2).map((row) => {
          const values = row.split('\n');
          const obj = {};

          header.forEach((key, index) => {
            obj[key] = values[index];
          });

          return obj;
        });

        //   console.log(parsedData);

        // check if parsed data have offer from owner
        const offersFromOwner = parsedData.filter(
          (offer) => offer.from === ownerName
        );

        if (offersFromOwner.length > 0) {
          fs.appendFileSync('offers.txt', `${contractAddress} ${tokenId}\n`);

          console.log(
            `Found offers from owner ${ownerName} for contract ${contractAddress} and token ${tokenId}`
              .green
          );

          console.log(offersFromOwner);
        }
      } catch (error) {
        console.log('Error: ', error);
      }
    }

    // await page.close();
  }

  await browser.close();
  console.log('Done! Starting from beginning.'.green);
  run();
}

run();
