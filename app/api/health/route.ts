import data from '@/data/evidence.json';
export function GET(){return Response.json({status:'ok',version:data.version,financialPeriod:'2026H1',marketAsOf:data.market.bars.at(-1)?.date,sourceMode:'verified-public-snapshot',fuyao:'not_configured',ifind:'not_connected'});}
