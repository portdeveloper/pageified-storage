// Solidity compilation utilities
// Loads solc-js compiler from CDN for browser-side compilation

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSolc: any = null;

async function loadSolc() {
  if (cachedSolc) return cachedSolc;

  // Load solc-js via the browser wrapper
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://binaries.soliditylang.org/bin/soljson-v0.8.28+commit.7893614a.js";
    script.onload = () => {
      // solc-js attaches to window.Module
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.Module) {
        // Use the solc wrapper
        const wrapScript = document.createElement("script");
        wrapScript.src =
          "https://cdn.jsdelivr.net/npm/solc@0.8.28/wrapper.js";
        wrapScript.onload = () => {
          if (w.solc && w.solc.cwrap) {
            cachedSolc = w.solc;
            resolve(cachedSolc);
          } else if (w.wrapper) {
            cachedSolc = w.wrapper(w.Module);
            resolve(cachedSolc);
          } else {
            reject(new Error("Failed to load solc wrapper"));
          }
        };
        wrapScript.onerror = () => reject(new Error("Failed to load solc wrapper"));
        document.head.appendChild(wrapScript);
      } else {
        reject(new Error("Failed to load solc binary"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load solc binary"));
    document.head.appendChild(script);
  });
}

export async function compileSolidity(source: string): Promise<CompilationResult> {
  let solc;
  try {
    solc = await loadSolc();
  } catch {
    return {
      success: false,
      errors: ["Failed to load Solidity compiler. Please try again."],
    };
  }

  const input = {
    language: "Solidity",
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

  let output;
  try {
    const result = solc.compile(JSON.stringify(input));
    output = JSON.parse(result);
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

  // No storage layout found
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
