// Solidity compilation utilities using web-solc (web worker based)

import { fetchAndLoadSolc, type WebSolc } from "web-solc";

export interface StorageVar {
  label: string;
  slot: number;
  offset: number;
  type: string;
  numberOfBytes: number;
  page: number; // slot >> 7
}

export interface CompilationResult {
  success: boolean;
  storageLayout?: StorageVar[];
  contractName?: string;
  errors?: string[];
  contracts?: string[];
}

function parseStorageLayout(layout: {
  storage: Array<{
    label: string;
    slot: string;
    offset: number;
    type: string;
  }>;
  types: Record<string, { label: string; numberOfBytes: string }>;
}): StorageVar[] {
  return layout.storage.map((entry) => {
    const slot = parseInt(entry.slot, 10);
    const typeInfo = layout.types[entry.type];
    return {
      label: entry.label,
      slot,
      offset: entry.offset,
      type: typeInfo?.label || entry.type,
      numberOfBytes: parseInt(typeInfo?.numberOfBytes || "32", 10),
      page: slot >> 7,
    };
  });
}

let cachedCompiler: WebSolc | null = null;
let loadingPromise: Promise<WebSolc> | null = null;

export async function getCompiler(): Promise<WebSolc> {
  if (cachedCompiler) return cachedCompiler;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetchAndLoadSolc("^0.8.25");
  cachedCompiler = await loadingPromise;
  loadingPromise = null;
  return cachedCompiler;
}

export async function compileSolidity(
  source: string
): Promise<CompilationResult> {
  let solc: WebSolc;
  try {
    solc = await getCompiler();
  } catch {
    return {
      success: false,
      errors: ["Failed to load Solidity compiler. Please try again."],
    };
  }

  const input = {
    language: "Solidity" as const,
    sources: {
      "Contract.sol": { content: source },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout", "abi"],
        },
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let output: any;
  try {
    output = await solc.compile(input);
  } catch (e) {
    return {
      success: false,
      errors: [
        `Compilation failed: ${e instanceof Error ? e.message : String(e)}`,
      ],
    };
  }

  // Check for errors
  const errors =
    output.errors
      ?.filter((e: { severity: string }) => e.severity === "error")
      ?.map((e: { formattedMessage: string }) => e.formattedMessage) || [];

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const fileContracts = output.contracts?.["Contract.sol"];
  if (!fileContracts) {
    return { success: false, errors: ["No contracts found in source"] };
  }

  const contractNames = Object.keys(fileContracts);

  // Find the first contract with a non-empty storage layout
  for (const contractName of contractNames) {
    const contract = fileContracts[contractName];
    if (
      contract.storageLayout &&
      contract.storageLayout.storage &&
      contract.storageLayout.storage.length > 0
    ) {
      return {
        success: true,
        contractName,
        storageLayout: parseStorageLayout(contract.storageLayout),
        contracts: contractNames,
      };
    }
  }

  return {
    success: true,
    contractName: contractNames[0],
    storageLayout: [],
    contracts: contractNames,
  };
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
