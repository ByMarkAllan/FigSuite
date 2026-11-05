import Link from 'next/link';

export const metadata = {
  title: 'FigSuite — Prize program status',
  description: 'Information about the inactive prize planning module and future independent approvals.',
};

const milestones = [
  ['Legal & jurisdiction review', 'Specialist counsel must document event-contract, sweepstakes, gaming, securities and tax classification.'],
  ['Written provider acceptance', 'Both billing and payout providers must authorize the exact proposed prize model.'],
  ['Identity, fairness and safety', 'Official rules, equal free-entry opportunity, age/location verification, abuse controls and funding audit.'],
  ['Independent production release', 'Separately approved code, security tests, reconciliation, operator controls and incident runbooks.'],
];

export default function PrizesPage() {
  return <main style={{minHeight:'100vh',background:'#090f1c',color:'#edf4ff',fontFamily:'system-ui,sans-serif',padding:'40px max(18px,calc((100vw - 950px)/2))'}}>
    <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20}}><strong style={{fontSize:24}}>FigSuite<span style={{color:'#35d2aa'}}>™</span></strong><Link href="/" style={{color:'#b8c8e4'}}>← Back to terminal</Link></nav>
    <section style={{marginTop:110,maxWidth:760}}><p style={{fontSize:12,letterSpacing:2,color:'#45d2ae'}}>PRIZE CONTROL / REVIEW ONLY</p>
      <h1 style={{fontSize:'clamp(34px,5vw,64px)',letterSpacing:'-.05em',lineHeight:1.07,margin:'20px 0'}}>Designed with guardrails.<br/>Disabled until approved.</h1>
      <p style={{fontSize:17,lineHeight:1.7,color:'#aabbd0'}}>FigSuite currently operates as a risk-free forecasting simulation. No prize or payout program is active, and no simulated allocation converts into money or increases prize eligibility.</p>
      <div style={{margin:'28px 0',padding:18,border:'1px solid #3e5c63',borderRadius:12,background:'#10252a',color:'#9cebd7',fontSize:13}}>● NO CASH PRIZES ACTIVE &nbsp;·&nbsp; No recipient enrollment &nbsp;·&nbsp; No provider disbursements</div>
    </section>
    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginTop:70}}>{milestones.map(([title,detail],index)=><article key={title} style={{background:'#111b2b',border:'1px solid #2e3d53',padding:22,borderRadius:12}}><p style={{fontSize:12,color:'#38d2ad'}}>GATE {String(index+1).padStart(2,'0')}</p><h2 style={{fontSize:19,margin:'12px 0'}}>{title}</h2><p style={{color:'#a3b4cd',lineHeight:1.65,fontSize:14}}>{detail}</p></article>)}</section>
    <p style={{color:'#7990a9',fontSize:12,marginTop:60}}>This page is informational and does not constitute an offer, official contest rules, or confirmation that any prize model is lawful.</p>
  </main>;
}
