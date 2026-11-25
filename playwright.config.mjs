import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'tests',testMatch:'**/*.spec.mjs',workers:1,timeout:150000,
 use:{baseURL:'http://127.0.0.1:3145',viewport:{width:900,height:650},
 launchOptions:{executablePath:process.env.MUSEUM_CHROMIUM||undefined,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']}},
 webServer:{command:'npm start -- --hostname 127.0.0.1 --port 3145',url:'http://127.0.0.1:3145',reuseExistingServer:false}
});
