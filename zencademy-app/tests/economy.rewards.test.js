require('./register-ts.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { RewardAttempt } = require('../lib/rewardAttempt.ts');
const { createStoredState } = require('../lib/storedState.ts');
const { createBoostPurchases } = require('../lib/boostPurchases.ts');
const { coinsForXp } = require('../lib/progression.ts');
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject};}
function memory(){const data=new Map();return {data,async getItem(k){return data.get(k)||null},async setItem(k,v){data.set(k,v)},async removeItem(k){data.delete(k)}};}
test('production reward coordinator shares start and claim, and caches confirmation',async()=>{
  const starting=deferred(),claiming=deferred();let starts=0,claims=0;
  const attempt=new RewardAttempt('one','focus-easy',{start:()=>{starts++;return starting.promise},claimReward:()=>{claims++;return claiming.promise}});
  const first=attempt.claim(),second=attempt.claim();assert.equal(first,second);assert.equal(starts,1);assert.equal(claims,0);
  starting.resolve();await new Promise(setImmediate);assert.equal(claims,1);
  const result={id:'one',activity_id:'focus-easy',xp:12,coins:5};claiming.resolve(result);
  assert.deepEqual(await first,result);assert.deepEqual(await attempt.claim(),result);assert.equal(claims,1);
});
test('lost response retries same actual attempt id; failed start is retried',async()=>{
  const ids=[];let starts=0,claims=0;
  const attempt=new RewardAttempt('stable','focus-easy',{
    async start(){if(++starts===1)throw Error('offline')},
    async claimReward(id){ids.push(id);if(++claims===1)throw Error('response lost');return {id,activity_id:'focus-easy',xp:12,coins:5}}
  });
  await assert.rejects(attempt.claim(),/offline/);await assert.rejects(attempt.claim(),/lost/);
  assert.equal((await attempt.claim()).id,'stable');assert.deepEqual(ids,['stable','stable']);assert.equal(starts,2);
});
test('production store cannot write before hydration or move old data to another key',async()=>{
  const storage=memory(),aLoad=deferred();storage.data.set('B','["B saved"]');
  const original=storage.getItem;storage.getItem=k=>k==='A'?aLoad.promise:original(k);
  const a=createStoredState(storage,'A',raw=>JSON.parse(raw||'[]'),[]);
  const b=createStoredState(storage,'B',raw=>JSON.parse(raw||'[]'),[]);
  const loading=a.load();a.update(['premature']);assert.equal(storage.data.has('A'),false);
  await b.load();aLoad.resolve('["A saved"]');await loading;
  a.update(['A edited']);await a.flushed();assert.equal(storage.data.get('B'),'["B saved"]');assert.deepEqual(b.getSnapshot().value,['B saved']);
});
test('storage reads/JSON errors preserve original data and updates are ordered',async()=>{
  const storage=memory();storage.data.set('bad','{broken');
  const bad=createStoredState(storage,'bad',raw=>JSON.parse(raw),[]);await bad.load();
  bad.update([]);assert.equal(storage.data.get('bad'),'{broken');assert.equal(bad.getSnapshot().loaded,false);
  const store=createStoredState(storage,'good',raw=>JSON.parse(raw||'[]'),[]);await store.load();
  store.update([1]);store.update(old=>[...old,2]);await store.flushed();assert.equal(storage.data.get('good'),'[1,2]');
});
test('production purchase coordinator retains durable retry id after lost response',async()=>{
  const storage=memory();const ids=[];let attempts=0;
  const transport=async(id)=>{ids.push(id);if(++attempts===1)throw Error('response lost')};
  const first=createBoostPurchases(storage,transport,()=> '11111111-1111-4111-8111-111111111111');
  await assert.rejects(first('user','boost-streak-shield'),/lost/);
  const afterRestart=createBoostPurchases(storage,transport,()=> '22222222-2222-4222-8222-222222222222');
  await afterRestart('user','boost-streak-shield');assert.deepEqual(ids,[
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
  ]);
  await afterRestart('user','boost-streak-shield');assert.equal(ids[2],'22222222-2222-4222-8222-222222222222');
});
test('stale non-uuid purchase keys are replaced before calling the server',async()=>{
  const storage=memory();storage.data.set('@boost_purchase:user:boost-streak-shield','not-a-uuid');
  const ids=[];
  const buy=createBoostPurchases(storage,async(id)=>{ids.push(id)},()=> '33333333-3333-4333-8333-333333333333');
  await buy('user','boost-streak-shield');
  assert.deepEqual(ids,['33333333-3333-4333-8333-333333333333']);
  assert.equal(storage.data.size,0);
});
test('production purchase coordinator merges concurrent taps and isolates account keys',async()=>{
  const storage=memory(),wait=deferred();let count=0;
  const buy=createBoostPurchases(storage,async()=>{count++;await wait.promise},()=> `00000000-0000-4000-8000-00000000000${count}`);
  const a=buy('A','boost-streak-shield'),again=buy('A','boost-streak-shield');assert.equal(a,again);
  const b=buy('B','boost-streak-shield');await new Promise(setImmediate);assert.equal(count,2);
  wait.resolve();await Promise.all([a,b]);assert.equal(storage.data.size,0);
});
test('actual progression coin formula handles capped rewards and zero',()=>{
  assert.equal(coinsForXp(0),0);assert.equal(coinsForXp(1),1);assert.equal(coinsForXp(12),5);assert.equal(coinsForXp(28),11);
});
test('boosted session estimates apply xp then coin multipliers',()=>{
  const { boostedSessionReward } = require('../lib/progression.ts');
  const now=1_000_000;
  const plain=boostedSessionReward('Easy','free',[],now);
  assert.equal(plain.xp,12);assert.equal(plain.coins,5);
  const xpOnly=boostedSessionReward('Easy','free',[{id:'boost-xp-2h',expiresAt:now+1}],now);
  assert.equal(xpOnly.xp,14);assert.equal(xpOnly.coins,6);
  const coinOnly=boostedSessionReward('Easy','free',[{id:'boost-coin-rain',expiresAt:now+1}],now);
  assert.equal(coinOnly.xp,12);assert.equal(coinOnly.coins,6);
  const both=boostedSessionReward('Easy','free',[
    {id:'boost-xp-2h',expiresAt:now+1},
    {id:'boost-coin-rain',expiresAt:now+1},
  ],now);
  assert.equal(both.xp,14);assert.equal(both.coins,7);
});
test('soft plan gating unlocks lite/elite exclusives by plan rank',()=>{
  const { isPlanUnlocked, isExercisePlayable, EXERCISES, exerciseRequiredPlan } = require('../lib/progression.ts');
  assert.equal(isPlanUnlocked('free','lite'), false);
  assert.equal(isPlanUnlocked('lite','lite'), true);
  assert.equal(isPlanUnlocked('elite','lite'), true);
  assert.equal(isPlanUnlocked('lite','elite'), false);
  const lite = EXERCISES.filter(e => exerciseRequiredPlan(e) === 'lite');
  const elite = EXERCISES.filter(e => exerciseRequiredPlan(e) === 'elite');
  assert.equal(lite.length, 4);
  assert.equal(elite.length, 4);
  for (const e of lite) assert.equal(isExercisePlayable(5, 'free', e), false);
  for (const e of lite) assert.equal(isExercisePlayable(5, 'lite', e), true);
  for (const e of elite) assert.equal(isExercisePlayable(5, 'lite', e), false);
  for (const e of elite) assert.equal(isExercisePlayable(5, 'elite', e), true);
});
