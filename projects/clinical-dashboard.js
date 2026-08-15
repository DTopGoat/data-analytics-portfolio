const dashboardData = {
  all: {
    subjects: 428, enrollment: 72.6, visits: 94.1, deviations: 11.7, completeness: 97.3,
    scheduledVisits: 1842, deviationSubjects: 50, deviationTotal: 96,
    recruitment: [
      {m:'Jan',s:78,e:52},{m:'Feb',s:84,e:58},{m:'Mar',s:92,e:66},{m:'Apr',s:88,e:64},
      {m:'May',s:101,e:74},{m:'Jun',s:108,e:81},{m:'Jul',s:115,e:88},{m:'Aug',s:119,e:91}
    ],
    deviationMix: [
      ['Out of Window',39],['Procedure / Visit',25],['Dosing / IP',18],['Consent / Other',14]
    ],
    sites: [
      {name:'Aurora',subjects:96,enrollment:81,visits:96.8,deviation:8.3,complete:98.5},
      {name:'Cedar',subjects:82,enrollment:76,visits:95.4,deviation:10.1,complete:97.8},
      {name:'Harbor',subjects:75,enrollment:69,visits:92.7,deviation:13.9,complete:96.4},
      {name:'Mesa',subjects:91,enrollment:73,visits:94.9,deviation:11.0,complete:97.1},
      {name:'Summit',subjects:84,enrollment:64,visits:90.8,deviation:16.7,complete:94.9}
    ],
    exceptions: [['Missing / NOT DONE answers',37],['Visit dates requiring review',14],['Unmapped study/site records',8],['Duplicate business keys',4]],
    insights: ['Summit Research is below the 70% enrollment target and has the highest deviation rate.','Visit completion remains above 94% overall, but Harbor and Summit warrant operational follow-up.','Data completeness is strong overall; missing or NOT DONE answers are the largest open data-quality category.']
  },
  Aurora: {subjects:96,enrollment:81,visits:96.8,deviations:8.3,completeness:98.5,scheduledVisits:410,deviationSubjects:8,deviationTotal:17},
  Cedar: {subjects:82,enrollment:76,visits:95.4,deviations:10.1,completeness:97.8,scheduledVisits:356,deviationSubjects:8,deviationTotal:19},
  Harbor: {subjects:75,enrollment:69,visits:92.7,deviations:13.9,completeness:96.4,scheduledVisits:329,deviationSubjects:10,deviationTotal:21},
  Mesa: {subjects:91,enrollment:73,visits:94.9,deviations:11.0,completeness:97.1,scheduledVisits:398,deviationSubjects:10,deviationTotal:20},
  Summit: {subjects:84,enrollment:64,visits:90.8,deviations:16.7,completeness:94.9,scheduledVisits:349,deviationSubjects:14,deviationTotal:19}
};

const studyMultipliers = {'all':1,'Metabolic-101':0.42,'Cardio-204':0.33,'Liver-315':0.25};
const statusMultipliers = {'all':1,'Screening':0.31,'Enrolled':0.47,'Completed':0.22};

function pct(v){ return `${v.toFixed(1)}%`; }
function clsGood(value, good, warn, inverse=false){
  if(inverse) return value <= good ? 'metric-good' : value <= warn ? 'metric-warn' : 'metric-bad';
  return value >= good ? 'metric-good' : value >= warn ? 'metric-warn' : 'metric-bad';
}

function renderRecruitment(rows, multiplier=1){
  const holder=document.getElementById('recruitmentBars');
  holder.innerHTML='';
  const max=125;
  rows.forEach(r=>{
    const g=document.createElement('div');g.className='bar-group';
    const s=document.createElement('span');s.className='bar screened';s.style.height=`${Math.max(3,(r.s*multiplier/max)*170)}px`;s.title=`${r.m}: ${Math.round(r.s*multiplier)} screened`;
    const e=document.createElement('span');e.className='bar enrolled';e.style.height=`${Math.max(3,(r.e*multiplier/max)*170)}px`;e.title=`${r.m}: ${Math.round(r.e*multiplier)} enrolled`;
    const m=document.createElement('span');m.className='bar-month';m.textContent=r.m;
    g.append(s,e,m);holder.append(g);
  });
}

function renderDeviation(mix,total){
  document.getElementById('deviationTotal').textContent=total;
  const colors=['#2d6cdf','#7e8fa6','#e9a23b','#d15c5c'];
  const sum=mix.reduce((a,b)=>a+b[1],0);
  let cur=0;const stops=[];
  mix.forEach((d,i)=>{const start=(cur/sum)*100;cur+=d[1];const end=(cur/sum)*100;stops.push(`${colors[i]} ${start}% ${end}%`);});
  document.getElementById('deviationDonut').style.background=`conic-gradient(${stops.join(',')})`;
  const legend=document.getElementById('deviationLegend');legend.innerHTML='';
  mix.forEach((d,i)=>{const row=document.createElement('div');row.innerHTML=`<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${colors[i]};margin-right:6px"></i>${d[0]}</span><b>${d[1]}</b>`;legend.append(row);});
}

function renderSites(sites){
  const performance=document.getElementById('sitePerformance');performance.innerHTML='';
  const tbody=document.getElementById('siteTable');tbody.innerHTML='';
  sites.forEach(s=>{
    const row=document.createElement('div');row.className='site-row';row.innerHTML=`<strong>${s.name}</strong><div class="progress"><span style="width:${Math.min(100,s.enrollment)}%"></span></div><span>${s.enrollment}%</span>`;performance.append(row);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${s.name} Research</td><td>${s.subjects}</td><td class="${clsGood(s.enrollment,70,65)}">${s.enrollment}%</td><td class="${clsGood(s.visits,94,91)}">${pct(s.visits)}</td><td class="${clsGood(s.deviation,10,14,true)}">${pct(s.deviation)}</td><td class="${clsGood(s.complete,97,95)}">${pct(s.complete)}</td>`;
    tbody.append(tr);
  });
}

function renderExceptions(items){
  const holder=document.getElementById('exceptionList');holder.innerHTML='';
  items.forEach(i=>{const row=document.createElement('div');row.className='exception-item';row.innerHTML=`<div><strong>${i[0]}</strong><span>Open records requiring review</span></div><span class="exception-count">${i[1]}</span>`;holder.append(row);});
}
function renderInsights(items){const holder=document.getElementById('insightList');holder.innerHTML='';items.forEach(i=>{const li=document.createElement('li');li.textContent=i;holder.append(li);});}

function applyFilters(){
  const site=document.getElementById('siteFilter').value;
  const study=document.getElementById('studyFilter').value;
  const status=document.getElementById('statusFilter').value;
  const base=site==='all'?dashboardData.all:dashboardData[site];
  const sm=studyMultipliers[study]; const stm=statusMultipliers[status];
  const countFactor=sm*stm;
  document.getElementById('kpiSubjects').textContent=Math.round(base.subjects*countFactor);
  document.getElementById('kpiEnrollment').textContent=pct(Math.max(48,base.enrollment-(study==='Liver-315'?4:study==='Cardio-204'?1:0)));
  document.getElementById('kpiVisits').textContent=pct(base.visits);
  document.getElementById('kpiDeviation').textContent=pct(base.deviations);
  document.getElementById('kpiCompleteness').textContent=pct(base.completeness);
  document.getElementById('kpiVisitsDelta').textContent=`${Math.round(base.scheduledVisits*sm)} scheduled visits`;
  document.getElementById('kpiDeviationDelta').textContent=`${Math.max(1,Math.round(base.deviationSubjects*countFactor))} subjects require review`;
  document.getElementById('kpiSubjectsDelta').textContent=site==='all'?'+8.4% vs prior period':`${site} Research · synthetic`;
  document.getElementById('kpiEnrollmentDelta').textContent='Target: 70%';
  document.getElementById('kpiCompletenessDelta').textContent='Missing / NOT DONE monitored';
  renderRecruitment(dashboardData.all.recruitment,sm*(site==='all'?1:0.22));
  const mix=dashboardData.all.deviationMix.map(d=>[d[0],Math.max(1,Math.round(d[1]*(site==='all'?sm:base.deviationTotal/dashboardData.all.deviationTotal)))]);
  renderDeviation(mix,site==='all'?Math.round(dashboardData.all.deviationTotal*sm):base.deviationTotal);
  const sites=site==='all'?dashboardData.all.sites:dashboardData.all.sites.filter(s=>s.name===site);
  renderSites(sites);
  renderExceptions(dashboardData.all.exceptions.map(i=>[i[0],Math.max(1,Math.round(i[1]*sm*(site==='all'?1:0.24)))]));
  renderInsights(site==='all'?dashboardData.all.insights:[`${site} Research is shown using synthetic portfolio data only.`,`${pct(base.visits)} visit completion and ${pct(base.completeness)} data completeness provide the main operational context.`,`Deviation rate is ${pct(base.deviations)}; use subject-level drill-downs in a production BI implementation to investigate contributing events.`]);
}

document.addEventListener('DOMContentLoaded',()=>{
  ['siteFilter','studyFilter','statusFilter'].forEach(id=>document.getElementById(id).addEventListener('change',applyFilters));
  document.getElementById('resetFilters').addEventListener('click',()=>{document.getElementById('siteFilter').value='all';document.getElementById('studyFilter').value='all';document.getElementById('statusFilter').value='all';applyFilters();});
  renderRecruitment(dashboardData.all.recruitment);
  renderDeviation(dashboardData.all.deviationMix,dashboardData.all.deviationTotal);
  renderSites(dashboardData.all.sites);
  renderExceptions(dashboardData.all.exceptions);
  renderInsights(dashboardData.all.insights);
});