import {test} from 'node:test';
import assert from 'node:assert/strict';
import {solve} from '../src/simplex.js';
import {defaults,scenarios,farmModel,compareWeather,expected,examples} from '../src/farm.js';
const near=(a,b,tol=1e-5)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('production optimum, primal feasibility, dual equality and sensitivities',()=>{
 const m=examples.production,r=solve(m);assert.equal(r.status,'optimal');near(r.value,1000);near(r.x[0],10);near(r.x[1],20);
 near(r.dual[0],50/3);near(r.dual[1],20/3);near(r.dual.reduce((s,v,i)=>s+v*m.constraints[i].b,0),r.value);
 near(r.sensitivity[0].low,15);near(r.sensitivity[0].high,60);
 const changed=structuredClone(m);changed.constraints[0].b+=.1;near(solve(changed).value-r.value,r.dual[0]*.1);
});
test('phase I, minimization, equality, negative RHS, and redundant rows',()=>{
 const r=solve(examples.minimum);assert.equal(r.status,'optimal');near(r.value,9);near(r.x[0],1);near(r.x[1],3);
 for(const constraints of [[{a:[-1],op:'<=',b:-2},{a:[1],op:'<=',b:5}],[{a:[1],op:'=',b:3},{a:[2],op:'=',b:6}],[{a:[0],op:'=',b:0},{a:[1],op:'<=',b:3}]]){
  const r=solve({sense:'max',c:[1],constraints});assert.equal(r.status,'optimal');near(r.value,constraints[0].b===-2?5:3);
 }
});
test('infeasible, unbounded, iteration cap, and invalid input are distinct',()=>{
 assert.equal(solve(examples.infeasible).status,'infeasible');assert.equal(solve(examples.unbounded).status,'unbounded');
 assert.equal(solve(examples.production,{limit:0}).status,'iteration_limit');
 assert.throws(()=>solve({sense:'max',c:[NaN],constraints:[{a:[1],op:'<=',b:1}]}));
 assert.throws(()=>solve({sense:'max',c:[1],constraints:[{a:[1,2],op:'<=',b:1}]}));
});
test('Bland rule terminates a classic cycling example',()=>{
 const r=solve({sense:'max',c:[10,-57,-9,-24],constraints:[{a:[.5,-5.5,-2.5,9],op:'<=',b:0},{a:[.5,-1.5,-.5,1],op:'<=',b:0},{a:[1,0,0,0],op:'<=',b:1}]});
 assert.equal(r.status,'optimal');near(r.value,1);assert.ok(r.pivots<30);
});
test('all six historical LINGO optima reproduced, with transparent $4,500 correction',()=>{
 const expectedValues=[99367,67863.8,74055.0666667,88767,66648.8,69859.7666667];
 scenarios.forEach((_,i)=>{
  const settings={...defaults,weather:String(i),cowValue:35000};const r=solve(farmModel(settings));
  assert.equal(r.status,'optimal');near(r.value,expectedValues[i],.001);
  near(solve(farmModel({...settings,cowValue:30000})).value,r.value-4500);
 });
 const r=solve(farmModel({...defaults,cowValue:35000}));near(r.value,80537);[12,0,414,42,100,368.2,680].forEach((v,i)=>near(r.x[i],v));
 near(r.sensitivity[2].low,33.6);near(r.sensitivity[4].high,21.15);near(r.residuals[5].dual,21.3);
});
test('weather expected objective equals probability-weighted evaluation of one fixed plan',()=>{
 const r=solve(farmModel(defaults));const {outcomes}=compareWeather(defaults);
 near(outcomes[0][0],94867);near(outcomes[0][1],52617);
 const expectedC=expected();near(expectedC.soy,34);near(expectedC.corn,27.5);near(expectedC.wheat,20.75);
 const total=scenarios.reduce((s,w,i)=>s+w.p*(farmModel({...defaults,weather:String(i)}).constant+farmModel({...defaults,weather:String(i)}).c.reduce((t,c,j)=>t+c*r.x[j],0)),0);near(total,r.value);
 assert.throws(()=>expected([{...scenarios[0],p:0}]));
 assert.equal(solve(farmModel({...defaults,land:10})).status,'infeasible');
});
test('random bounded 2D LPs match independent vertex enumeration',()=>{
 let seed=731;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
 for(let k=0;k<80;k++){
  const a=[[1,0],[0,1],...[0,1,2].map(()=>[1+rand()*4,1+rand()*4])],b=[2+rand()*10,2+rand()*10,10+rand()*20,10+rand()*20,10+rand()*20],c=[rand()*10-2,rand()*10-2];
  const edges=[...a,[1,0],[0,1]],rhs=[...b,0,0];let best=-Infinity;
  for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
   const [u,v]=edges[i],[w,z]=edges[j],d=u*z-v*w;if(Math.abs(d)<1e-10)continue;
   const x=(rhs[i]*z-v*rhs[j])/d,y=(u*rhs[j]-rhs[i]*w)/d;
   if(x>=-1e-8&&y>=-1e-8&&a.every((r,l)=>r[0]*x+r[1]*y<=b[l]+1e-8))best=Math.max(best,c[0]*x+c[1]*y);
  }
  const result=solve({sense:'max',c,constraints:a.map((r,i)=>({a:r,op:'<=',b:b[i]}))});assert.equal(result.status,'optimal');near(result.value,best);
 }
});
