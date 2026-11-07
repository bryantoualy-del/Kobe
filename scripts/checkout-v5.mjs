// Isolated integration inputs, pinned so a release can be reproduced.
import {mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const commits={
  "Encounter": "f6872982e092875e418e9cb09150ea5ecd0ba1b5",
  "RPG-Connect": "5b13cd5f28e483088550cad3b2b893dde4ae2d3a",
  "Brackmard": "08e4b2b1d2021b565db597a2c8eece713bee520a",
  "Kentaro": "eeb458de76f7e34104dbe7e072a3f18d045b49af",
  "Nans": "d82530dc59a2abd948be0aba06df85a875e2a9a3",
  "Rufus": "a9e4bd8351ccaf6b7f007ddd6c476e666e7eb6d5",
  "Samoth": "b54146a9717d32f55fc7a0ad96cacccd6e69d3de",
  "Zephyr": "f773ff9c814a9470a93efec2eaebbe7fa974189e"
};
for(const [repo,sha] of Object.entries(commits)){
 const cwd='.v5-env/'+repo;await mkdir(cwd,{recursive:true});
 const git=(...args)=>execFileSync('git',args,{cwd,stdio:'inherit'});
 git('init','-q');git('fetch','-q','--depth=1','https://github.com/bryantoualy-del/'+repo+'.git',sha);git('checkout','-q','--detach','FETCH_HEAD');
}
