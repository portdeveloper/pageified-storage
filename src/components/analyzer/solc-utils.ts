// Analyzer utilities - calls the Fly.io backend for compilation

const BACKEND_URL = "https://mip-land-analyzer.fly.dev";

export interface StorageVar {
  label: string;
  slot: number;
  offset: number;
  type: string;
  numberOfBytes: number;
  page: number; // slot >> 7
}

export interface AbiFunction {
  type: "function" | "constructor";
  name?: string;
  inputs: Array<{ name: string; type: string }>;
  outputs?: Array<{ name: string; type: string }>;
  stateMutability?: string;
}

export interface ContractResult {
  name: string;
  file: string;
  storageLayout: StorageVar[];
  abi: AbiFunction[];
}

export interface CompilationResult {
  success: boolean;
  contracts?: ContractResult[];
  errors?: string[];
}

export interface TraceSlot {
  slot: number;
  slotHex: string;
}

export interface TraceResult {
  success: boolean;
  trace?: {
    reads: TraceSlot[];
    writes: TraceSlot[];
    uniqueSlots: number[];
    uniquePages: number[];
    gasEstimate: {
      current: number;
      mip8: number;
    };
  };
  errors?: string[];
}

export async function analyzeSource(source: string): Promise<CompilationResult> {
  const res = await fetch(`${BACKEND_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });
  const data = await res.json();
  return addPageInfo(data);
}

export async function analyzeGithub(githubUrl: string): Promise<CompilationResult> {
  const res = await fetch(`${BACKEND_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ githubUrl }),
  });
  const data = await res.json();
  return addPageInfo(data);
}

export async function traceFunction(opts: {
  source?: string;
  githubUrl?: string;
  contractName: string;
  functionSig: string;
  args?: string[];
  constructorArgs?: string[];
}): Promise<TraceResult> {
  const res = await fetch(`${BACKEND_URL}/trace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  return res.json();
}

function addPageInfo(data: CompilationResult): CompilationResult {
  if (data.contracts) {
    for (const contract of data.contracts) {
      contract.storageLayout = contract.storageLayout.map((v) => ({
        ...v,
        page: v.slot >> 7,
      }));
    }
  }
  return data;
}

export function groupByPage(vars: StorageVar[]): Map<number, StorageVar[]> {
  const pages = new Map<number, StorageVar[]>();
  for (const v of vars) {
    if (!pages.has(v.page)) pages.set(v.page, []);
    pages.get(v.page)!.push(v);
  }
  return pages;
}

export function calculateGas(selectedVars: StorageVar[]) {
  const COLD = 8100;
  const WARM = 100;

  if (selectedVars.length === 0) {
    return { currentGas: 0, mip8Gas: 0, savings: 0, ratio: 1 };
  }

  const uniqueSlots = new Set(selectedVars.map((v) => v.slot));
  const uniquePages = new Set(selectedVars.map((v) => v.page));

  const currentGas = uniqueSlots.size * COLD;
  const mip8Gas =
    uniquePages.size * COLD + (uniqueSlots.size - uniquePages.size) * WARM;

  const savings =
    currentGas > 0
      ? Math.round(((currentGas - mip8Gas) / currentGas) * 100)
      : 0;
  const ratio = mip8Gas > 0 ? currentGas / mip8Gas : 1;

  return { currentGas, mip8Gas, savings, ratio };
}
