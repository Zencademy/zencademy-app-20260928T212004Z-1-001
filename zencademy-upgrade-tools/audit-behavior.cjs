// Runs the actual service code against an in-memory fake. No network or real user data.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '../zencademy-app');
const ts = require(path.join(root, 'node_modules/typescript'));
function load(relative, mocks) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const output = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  vm.runInNewContext(output, {exports, require(name) { if (!(name in mocks)) throw Error(name); return mocks[name]; }, console, Date, setTimeout});
  return exports;
}
const levels = load('utils/levels.ts', {});
let row = {id:'test-user',points:100,plan:'premium',username:'Existing',daily_streak_count:10};
let failedReads = 0;
let unsubscribed = 0;
const client = {
  from() {
    let updates;
    const q = {
      select(){return q}, eq(){return q},
      update(v){updates=v;return q},
      async upsert(v){row={...row,...v};return {error:null}},
      async single(){
        if (updates) {row={...row,...updates};return {data:{...row},error:null};}
        if (failedReads > 0) {failedReads--;return {data:null,error:{message:'Temporary network failure'}};}
        return {data:{...row},error:null};
      },
      then(resolve,reject){return q.single().then(resolve,reject)}
    };
    return q;
  },
  channel(){ const channel={on(){return channel},subscribe(){return channel},unsubscribe(){unsubscribed++}};return channel; }
};
const service = load('utils/supabase.ts', {
  '@react-native-async-storage/async-storage':{},
  '@supabase/supabase-js':{createClient(){return client}},
  './levels':levels
}).userDataService;
(async()=>{
  const results={};
  await Promise.all([service.addXP('test-user',10),service.addXP('test-user',20)]);
  results.concurrentXP={start:100,rewards:[10,20],expected:130,actual:row.points};
  row={...row,points:5000,plan:'premium'};
  failedReads=2;
  let data=await service.getUserData('test-user');
  if(!data){data=await service.getUserData('test-user');if(!data)await service.initializeUserData('test-user','test@example.invalid','Existing');}
  results.failedReadThenInitialize={before:{points:5000,plan:'premium'},after:{points:row.points,plan:row.plan}};
  const subscription=service.subscribeToUserData('test-user',()=>{});
  service.unsubscribeFromUserData(subscription);
  results.subscriptionCleanup={isPromise:typeof subscription.then==='function',unsubscribeCalls:unsubscribed};
  await subscription;
  const dateDiff=Math.floor((Date.parse('2026-09-29')-Date.parse('2026-09-28T14:00:00Z'))/86400000);
  results.streakDateDiff={previous:'2026-09-28T14:00:00Z',today:'2026-09-29',expectedCalendarDays:1,actual:dateDiff};
  results.shopXP={totalPoints:1000,...levels.deriveLevelAndLevelXP(1000),price:500};
  console.log(JSON.stringify(results,null,2));
})();
