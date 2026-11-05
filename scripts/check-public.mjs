// Read-only production probe. A successful HTTP response alone is not a playable page.
import {chromium} from 'playwright';
const url=process.argv[2];if(!url)throw Error('URL de production requise');
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1180,height:820}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 const response=await page.goto(url,{timeout:25000});
 if(!response?.ok())throw Error('HTTP '+response?.status());
 await page.getByRole('heading',{name:'Kobe Kozzo',exact:true}).waitFor({timeout:10000});
 await page.getByRole('tab',{name:'Sorts & pouvoirs'}).click();await page.locator('[data-spell-card]').first().waitFor();
 await page.getByRole('tab',{name:'Combat'}).click();await page.locator('[data-combat-view=kharvek]').click();await page.locator('#kharvek').waitFor();
 if(errors.length)throw Error(errors.join('; '));
 console.log('PUBLIC_SMOKE: '+page.url()+' HTTP '+response.status()+' · Combat, grimoire, Khar-Vek chargés · '+await page.locator('footer').innerText());
}finally{await browser.close();}
