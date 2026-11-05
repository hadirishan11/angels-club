const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1000,height:1000}});
 p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('err:',e.message));
 for (const job of JSON.parse(process.argv[2])) {
  await p.goto(''+(process.env.STUDIO_URL||'http://localhost:8766/studio.html')+'?'+job.q); await p.waitForFunction('window.ready',null,{timeout:60000});
  await p.waitForTimeout(500);
  const data=await p.evaluate(()=>{window.inst.renderOnce(); return window.inst.canvas.toDataURL('image/png')});
  require('fs').writeFileSync(job.out, Buffer.from(data.split(',')[1],'base64')); console.log('saved',job.out);
 }
 await b.close();})();
