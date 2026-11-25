import {test,expect} from '@playwright/test';
const photo=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=','base64');
test('local studio works on mobile with keyboard and reduced motion',async({page})=>{
 const errors=[],models=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().endsWith('.glb'))models.push(r.url())});
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 const create=page.getByRole('button',{name:'Create museum'});await create.focus();await page.keyboard.press('Enter');
 const name=page.getByLabel('Museum name');await name.fill('Our test gallery');
 await page.getByLabel('Upload photos and videos').setInputFiles({name:'Portrait upload.png',mimeType:'image/png',buffer:photo});
 const trigger=page.getByRole('button',{name:'Portrait upload',exact:false}).first();await trigger.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('dialog',{name:'Portrait upload'})).toBeVisible();await expect(page.getByRole('button',{name:'Close',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await page.reload();await page.getByRole('button',{name:'Create museum'}).click();await expect(name).toHaveValue('Our test gallery');
 await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(trigger).toHaveCount(0);
 await page.getByRole('button',{name:'Reset local demo'}).click();await expect(name).toHaveValue('Our Forever');
 await expect(page.locator('body')).toHaveJSProperty('scrollWidth',390);
 expect(models).toEqual([]);expect(errors).toEqual([]);
});
test('same-origin characters, retry, rooms and sample interactions',async({page})=>{
 const errors=[];page.on('console',m=>{if(m.type()==='error')console.log(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/arjun-v4.glb',route=>route.abort());
 await page.goto('/?demo=1');await expect(page.getByRole('button',{name:'Retry'})).toBeVisible({timeout:60000});
 await page.unroute('**/arjun-v4.glb');await page.getByRole('button',{name:'Retry'}).click();
 await expect(page.locator('.avatarLoad')).toHaveCount(0,{timeout:90000});
 for(const name of ['Hug','Wave','♡ Hold'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'⌖ Rooms'}).click();await page.getByRole('button',{name:/03 · Surprise suite/}).click();
 await expect(page.getByRole('button',{name:'Open letter'})).toBeVisible();
 await page.getByRole('button',{name:'Open letter'}).click();await expect(page.getByRole('dialog')).toContainText('Thank you');await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Chat',exact:true}).click();await expect(page.getByText(/Simulated chat/)).toBeVisible();await page.getByLabel('Message').fill('Hello');await page.getByRole('button',{name:'Send',exact:true}).click();await expect(page.getByText(/demo reply/)).toBeVisible();
 expect(errors).toEqual([]);
});
test('keyboard walking, seven room shortcuts, proposal and sample invitation',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/?demo=1&metrics=1');await page.waitForFunction(()=>JSON.parse(document.querySelector('canvas')?.dataset.metrics||'{}').ready===2);
 await page.keyboard.down('w');try{await page.waitForFunction(()=>JSON.parse(document.querySelector('canvas').dataset.metrics).z<4.05)}finally{await page.keyboard.up('w')}
 for(const room of ['Grand entrance','Memory hall','Surprise suite','Photo wing','Cinema','Music lounge','Starlight terrace']){
   await page.getByRole('button',{name:'⌖ Rooms'}).click();
   await page.getByRole('button',{name:new RegExp('· '+room)}).click();
   await expect(page.locator('.zoneLabel strong')).toHaveText(room);
 }
 await page.getByRole('button',{name:'Our Story'}).click();
 await page.getByRole('button',{name:'Copy demo link'}).click();await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toBe('http://127.0.0.1:3145/?demo=1');
 await page.getByRole('button',{name:/Special question/}).click();await page.getByRole('button',{name:/Yes ♡/}).click();await expect(page.getByRole('dialog')).toContainText('Here’s to all the memories');await page.keyboard.press('Escape');
 const response=await page.request.post('/api/speech');expect(response.status()).toBe(503);
});
