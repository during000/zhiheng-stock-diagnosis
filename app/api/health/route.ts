import data from '@/data/evidence.json';
import {fuyaoKey} from '@/lib/research-data';
export function GET(){return Response.json({status:'ok',version:data.version,financialPeriod:'2026H1',marketAsOf:data.market.bars.at(-1)?.date,sourceMode:fuyaoKey()?'fuyao-verified-history':'verified-public-snapshot',fuyao:fuyaoKey()?'configured':'not_configured',ifind:'not_connected'});}
